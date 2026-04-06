"""
Workflow Engine

Responsabilidades:
  - Criar WorkflowRun a partir de um RuntimePlan + WorkflowTemplate
  - Persistir estado em data/clients/{id}/workflows/{task_type}/{run_id}/workflow.json
  - Avançar steps (advance_to_next)
  - Registrar aprovação, rejeição, rebrief
  - Expor helpers para o router (load, save, list)

O engine NÃO executa skills — isso fica no orchestrator.
O engine gerencia estado e decide qual step executar a seguir.
"""
import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from api.models.workflow import (
    WorkflowRun, StepRun, StepArtifact,
    RuntimePlan, WorkflowTemplate,
    WorkflowStatus, StepStatus,
)
from api.workflow.registry import get_template

DATA_DIR = Path(__file__).parent.parent.parent / "data"


# ─── Persistence ──────────────────────────────────────────────────────────────

def _run_path(client_id: str, task_type: str, run_id: str) -> Path:
    p = DATA_DIR / "clients" / client_id / "workflows" / task_type / run_id
    p.mkdir(parents=True, exist_ok=True)
    return p / "workflow.json"


def save_run(run: WorkflowRun) -> None:
    run.updated_at = _now()
    path = _run_path(run.client_id, run.task_type, run.run_id)
    path.write_text(run.model_dump_json(indent=2), encoding="utf-8")


def load_run(run_id: str, client_id: Optional[str] = None) -> Optional[WorkflowRun]:
    """Busca run por ID. Faz glob se client_id não fornecido."""
    if client_id:
        for task_dir in (DATA_DIR / "clients" / client_id / "workflows").glob("*"):
            p = task_dir / run_id / "workflow.json"
            if p.exists():
                return WorkflowRun(**json.loads(p.read_text()))
    else:
        for p in DATA_DIR.glob(f"clients/*/workflows/*/{run_id}/workflow.json"):
            return WorkflowRun(**json.loads(p.read_text()))
    return None


def list_all_runs(limit: int = 100) -> list[dict]:
    """Lista todos os runs de todos os clientes, ordenados por updated_at desc."""
    result = []
    for p in sorted(DATA_DIR.glob("clients/*/workflows/*/*/workflow.json"), reverse=True):
        try:
            raw = json.loads(p.read_text())
            result.append({
                "run_id":       raw["run_id"],
                "client_id":    raw["client_id"],
                "client_name":  raw.get("client_name", raw["client_id"]),
                "task_type":    raw["task_type"],
                "task_summary": raw["task_summary"],
                "status":       raw["status"],
                "template_id":  raw["template_id"],
                "current_step_id": raw.get("current_step_id"),
                "created_at":   raw["created_at"],
                "updated_at":   raw["updated_at"],
            })
        except Exception:
            pass
        if len(result) >= limit:
            break
    return result


def list_runs(client_id: str, task_type: Optional[str] = None) -> list[dict]:
    """Lista runs de um cliente, opcionalmente filtrado por task_type."""
    base = DATA_DIR / "clients" / client_id / "workflows"
    if not base.exists():
        return []
    result = []
    pattern = f"{task_type}/*" if task_type else "*/*"
    for p in sorted(base.glob(f"{pattern}/workflow.json"), reverse=True):
        try:
            raw = json.loads(p.read_text())
            result.append({
                "run_id":       raw["run_id"],
                "task_type":    raw["task_type"],
                "task_summary": raw["task_summary"],
                "status":       raw["status"],
                "template_id":  raw["template_id"],
                "current_step_id": raw.get("current_step_id"),
                "created_at":   raw["created_at"],
                "updated_at":   raw["updated_at"],
            })
        except Exception:
            pass
    return result


# ─── Factory ──────────────────────────────────────────────────────────────────

def create_run(
    client_id: str,
    client_name: str,
    plan: RuntimePlan,
    task_input: dict,
    llm_model: str | None = None,
) -> WorkflowRun:
    """
    Cria um WorkflowRun a partir do RuntimePlan produzido pelo AM.
    Monta os StepRuns usando o template + briefings do plano.
    """
    template = get_template(plan.workflow_template_id)
    briefing_map = {sb.step_id: sb.briefing for sb in plan.step_briefings}

    steps = [
        StepRun(
            step_id=tpl_step.id,
            title=tpl_step.title,
            primary_skill=tpl_step.primary_skill,
            gate_type=(
                tpl_step.approval_gate.type
                if tpl_step.approval_gate and tpl_step.approval_gate.required
                else None
            ),
            briefing=briefing_map.get(tpl_step.id, ""),
            status="ready" if i == 0 else "pending",
        )
        for i, tpl_step in enumerate(template.steps)
        if tpl_step.id in plan.selected_pipeline
    ]

    now = _now()
    run = WorkflowRun(
        run_id=_make_run_id(client_id, plan.task_type),
        client_id=client_id,
        client_name=client_name,
        template_id=plan.workflow_template_id,
        task_type=plan.task_type,
        llm_model=llm_model,
        task_input=task_input,
        task_summary=plan.task_summary,
        status="planned",
        current_step_id=steps[0].step_id if steps else None,
        steps=steps,
        runtime_plan=plan,
        created_at=now,
        updated_at=now,
    )
    save_run(run)
    return run


# ─── State transitions ────────────────────────────────────────────────────────

def mark_step_running(run: WorkflowRun, step_id: str) -> WorkflowRun:
    step = _get_step(run, step_id)
    step.status = "running"
    step.started_at = _now()
    run.status = "in_progress"
    run.current_step_id = step_id
    save_run(run)
    return run


def complete_step(
    run: WorkflowRun,
    step_id: str,
    artifact_content: str,
    artifact_name: Optional[str] = None,
) -> WorkflowRun:
    """
    Marca step como concluído e salva artefato.
    Se o step tem approval_gate, passa para waiting_approval.
    Se não tem, avança automaticamente para o próximo step.
    """
    step = _get_step(run, step_id)
    step.completed_at = _now()

    template = get_template(run.template_id)
    tpl_step = next((s for s in template.steps if s.id == step_id), None)

    # Salva artefato
    name = artifact_name or (tpl_step.output_artifacts[0] if tpl_step and tpl_step.output_artifacts else f"{step_id}-output.md")
    version = len([a for a in step.artifacts if a.name == name]) + 1
    step.artifacts.append(StepArtifact(
        name=name,
        content=artifact_content,
        version=version,
        created_at=_now(),
    ))

    needs_approval = tpl_step and tpl_step.approval_gate and tpl_step.approval_gate.required

    if needs_approval:
        step.status = "waiting_approval"
        run.status = "waiting_approval"
    else:
        step.status = "completed"
        run = _advance_or_complete(run, step_id)

    save_run(run)
    return run


def approve_step(run: WorkflowRun, step_id: str, notes: Optional[str] = None) -> WorkflowRun:
    step = _get_step(run, step_id)
    if step.status != "waiting_approval":
        raise ValueError(f"Step '{step_id}' não está aguardando aprovação (status: {step.status})")
    step.status = "approved"
    if notes:
        step.feedback = notes
    run = _advance_or_complete(run, step_id)
    save_run(run)
    return run


def reject_step(run: WorkflowRun, step_id: str, feedback: str) -> WorkflowRun:
    step = _get_step(run, step_id)
    step.status = "rejected"
    step.feedback = feedback
    run.status = "rejected"
    save_run(run)
    return run


def rebrief_step(
    run: WorkflowRun,
    step_id: str,
    feedback: str,
    mode: str,
    target_step_id: Optional[str] = None,
) -> tuple[WorkflowRun, str]:
    """
    Reinicia step atual ou volta a step anterior com novo feedback.
    Retorna (run atualizado, step_id que deve ser executado a seguir).
    """
    if mode == "restart_entire_workflow":
        for s in run.steps:
            s.status = "pending"
            s.feedback = None
        run.steps[0].status = "ready"
        run.steps[0].feedback = feedback
        run.current_step_id = run.steps[0].step_id
        run.status = "planned"
        save_run(run)
        return run, run.steps[0].step_id

    restart_id = target_step_id if (mode == "restart_from_step" and target_step_id) else step_id
    target = _get_step(run, restart_id)

    # Marca todos os steps a partir do alvo como pending novamente
    reached = False
    for s in run.steps:
        if s.step_id == restart_id:
            reached = True
        if reached:
            s.status = "pending"
            s.feedback = None

    target.status = "ready"
    target.feedback = feedback
    run.current_step_id = restart_id
    run.status = "rebrief_required"
    save_run(run)
    return run, restart_id


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_current_step(run: WorkflowRun) -> Optional[StepRun]:
    if not run.current_step_id:
        return None
    return _get_step(run, run.current_step_id)


def get_step_briefing(run: WorkflowRun, step_id: str) -> str:
    """Retorna o briefing do step — do runtime plan (AM) ou do feedback de rebrief."""
    step = _get_step(run, step_id)
    # Se há feedback de rebrief, usa ele como contexto adicional
    if step.feedback:
        return f"{step.briefing}\n\n## Feedback de revisão\n{step.feedback}"
    return step.briefing


def _advance_or_complete(run: WorkflowRun, completed_step_id: str) -> WorkflowRun:
    """Avança para o próximo step ou marca o workflow como completed."""
    step_ids = [s.step_id for s in run.steps]
    idx = step_ids.index(completed_step_id)
    if idx + 1 < len(run.steps):
        next_step = run.steps[idx + 1]
        next_step.status = "ready"
        run.current_step_id = next_step.step_id
        run.status = "in_progress"
    else:
        run.status = "completed"
        run.current_step_id = None
    return run


def _get_step(run: WorkflowRun, step_id: str) -> StepRun:
    for s in run.steps:
        if s.step_id == step_id:
            return s
    raise ValueError(f"Step '{step_id}' não encontrado no run '{run.run_id}'")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _make_run_id(client_id: str, task_type: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    short = uuid.uuid4().hex[:6]
    return f"{client_id}_{task_type}_{ts}_{short}"
