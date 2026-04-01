"""
Workflow Runs Router

Endpoints:
  POST   /workflow-runs                                    — cria run + executa primeiro step
  GET    /workflow-runs/{run_id}                           — estado completo do run
  GET    /workflow-runs/{run_id}/steps/{step_id}/stream    — SSE: (re)executa step
  POST   /workflow-runs/{run_id}/steps/{step_id}/approve   — aprova step, avança
  POST   /workflow-runs/{run_id}/steps/{step_id}/reject    — rejeita step
  POST   /workflow-runs/{run_id}/steps/{step_id}/rebrief   — rebrief com feedback
  GET    /clients/{client_id}/workflow-runs                — lista runs por cliente
  GET    /workflow-runs/templates                          — lista templates disponíveis
"""
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.models.workflow import (
    CreateWorkflowRunRequest,
    ApproveStepRequest,
    RejectStepRequest,
    RebriefRequest,
)
from api.services.orchestrator import plan_workflow
from api.services.skill_runner import stream_skill
from api.services.client_context import get_client_context
from api.services.output_store import save_output
from api.workflow import engine
from api.workflow.registry import list_templates

router = APIRouter(tags=["workflow-runs"])


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _load_client(client_id: str) -> dict:
    ctx = get_client_context(client_id)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Cliente '{client_id}' não encontrado")
    return ctx


def _load_run(run_id: str, client_id: str | None = None):
    run = engine.load_run(run_id, client_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"WorkflowRun '{run_id}' não encontrado")
    return run


def _step_sse_stream(run_id: str, step_id: str, client_id: str):
    """Generator SSE que executa a skill do step e persiste o artefato ao final."""
    run = _load_run(run_id, client_id)
    step = next((s for s in run.steps if s.step_id == step_id), None)
    if not step:
        yield f"data: {json.dumps({'event': f'__ERROR__Step {step_id} não encontrado'})}\n\n"
        return

    briefing = engine.get_step_briefing(run, step_id)
    run = engine.mark_step_running(run, step_id)

    accumulated: list[str] = []

    yield f"data: {json.dumps({'event': '__SKILL_START__', 'step_id': step_id, 'skill': step.primary_skill})}\n\n"

    try:
        for chunk in stream_skill(step.primary_skill, briefing, None):
            accumulated.append(chunk)
            yield f"data: {json.dumps({'text': chunk})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'event': f'__ERROR__{str(e)}'})}\n\n"
        return

    full_content = "".join(accumulated)

    # Persiste artefato no engine
    run = engine.complete_step(run, step_id, full_content)

    # Persiste também no output_store legado para aparecer no histórico
    try:
        save_output(
            client_id=run.client_id,
            client_name=run.client_name,
            feature=run.task_type,
            prompt_summary=run.task_summary,
            content=full_content,
        )
    except Exception:
        pass

    yield f"data: {json.dumps({'event': '__STEP_DONE__', 'step_id': step_id, 'run_status': run.status})}\n\n"
    yield "data: [DONE]\n\n"


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/workflow-runs/templates")
def get_templates():
    """Lista todos os workflow templates disponíveis."""
    return {"templates": list_templates()}


@router.get("/workflow-runs")
def list_all_workflow_runs(limit: int = 100):
    """Lista todos os runs de todos os clientes (para painel de produção)."""
    return {"runs": engine.list_all_runs(limit=limit)}


@router.post("/workflow-runs")
def create_workflow_run(req: CreateWorkflowRunRequest):
    """
    Cria um WorkflowRun completo:
      1. Chama o Account Manager (com SKILL.md) para produzir o RuntimePlan
      2. Cria o WorkflowRun com steps e briefings
      3. Retorna o run + SSE URL para executar o primeiro step
    """
    ctx = _load_client(req.client_id)

    # Monta descrição da tarefa a partir dos inputs
    task_description = _build_task_description(req.task_type, req.input)

    # AM produz RuntimePlan
    plan = plan_workflow(task_description, req.task_type, ctx)

    # Engine cria e persiste o WorkflowRun
    run = engine.create_run(
        client_id=req.client_id,
        client_name=ctx["client_name"],
        plan=plan,
        task_input=req.input,
    )

    first_step = engine.get_current_step(run)

    return {
        "run_id":       run.run_id,
        "status":       run.status,
        "task_summary": run.task_summary,
        "template_id":  run.template_id,
        "current_step": first_step.model_dump() if first_step else None,
        "steps":        [s.model_dump(exclude={"artifacts"}) for s in run.steps],
        "ui_summary":   plan.ui_summary.model_dump(),
        "observations": plan.observations,
        "stream_url":   f"/workflow-runs/{run.run_id}/steps/{first_step.step_id}/stream" if first_step else None,
    }


@router.get("/workflow-runs/{run_id}")
def get_workflow_run(run_id: str, client_id: str | None = None):
    """Retorna o estado completo do WorkflowRun."""
    run = _load_run(run_id, client_id)
    return run.model_dump()


@router.get("/workflow-runs/{run_id}/steps/{step_id}/stream")
def stream_step(run_id: str, step_id: str):
    """SSE: executa (ou re-executa) a skill do step e faz stream do output."""
    run = _load_run(run_id)
    return StreamingResponse(
        _step_sse_stream(run_id, step_id, run.client_id),
        media_type="text/event-stream",
    )


@router.post("/workflow-runs/{run_id}/steps/{step_id}/approve")
def approve_step(run_id: str, step_id: str, req: ApproveStepRequest):
    """Aprova o step atual e avança o workflow para o próximo step."""
    run = _load_run(run_id)
    try:
        run = engine.approve_step(run, step_id, req.notes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    next_step = engine.get_current_step(run)
    return {
        "run_id":       run.run_id,
        "status":       run.status,
        "approved_step": step_id,
        "next_step":    next_step.model_dump(exclude={"artifacts"}) if next_step else None,
        "stream_url":   f"/workflow-runs/{run_id}/steps/{next_step.step_id}/stream" if next_step else None,
    }


@router.post("/workflow-runs/{run_id}/steps/{step_id}/reject")
def reject_step(run_id: str, step_id: str, req: RejectStepRequest):
    """Rejeita o step. Workflow fica em status 'rejected' até rebrief."""
    run = _load_run(run_id)
    run = engine.reject_step(run, step_id, req.feedback)
    return {
        "run_id":  run.run_id,
        "status":  run.status,
        "message": "Step rejeitado. Use /rebrief para reiniciar com feedback.",
    }


@router.post("/workflow-runs/{run_id}/steps/{step_id}/rebrief")
def rebrief_step(run_id: str, step_id: str, req: RebriefRequest):
    """
    Reinicia o step (ou um step anterior) com feedback.
    Retorna stream_url para re-executar.
    """
    run = _load_run(run_id)
    run, restart_step_id = engine.rebrief_step(
        run, step_id, req.feedback, req.mode, req.target_step_id
    )
    return {
        "run_id":        run.run_id,
        "status":        run.status,
        "restarting_at": restart_step_id,
        "stream_url":    f"/workflow-runs/{run_id}/steps/{restart_step_id}/stream",
    }


@router.get("/clients/{client_id}/workflow-runs")
def list_client_runs(client_id: str, task_type: str | None = None):
    """Lista os WorkflowRuns de um cliente, opcionalmente filtrado por task_type."""
    runs = engine.list_runs(client_id, task_type)
    return {"runs": runs, "total": len(runs)}


# ─── Task description builder ─────────────────────────────────────────────────

def _build_task_description(task_type: str, inp: dict) -> str:
    """Constrói a descrição textual da tarefa a partir dos inputs do request."""
    builders = {
        "hooks": lambda i: (
            f"Gerar 5 variações de hook para o tema: {i.get('theme', '')}. "
            f"Plataforma: {i.get('platform', 'Instagram')}."
            + (f" ICP customizado: {i['icp_override']}." if i.get('icp_override') else "")
        ),
        "copy_lp": lambda i: (
            "Gerar copy completa de landing page com seções: Hero, Problema, Solução, Benefícios, Prova Social, FAQ, CTA."
            + (f" Campanha: {i['campaign_description']}." if i.get('campaign_description') else "")
            + (f" Persona foco: {i['persona_focus']}." if i.get('persona_focus') else "")
            + (" Incluir wireframe HTML/CSS." if i.get('output_format') == 'html' else "")
        ),
        "calendar": lambda i: (
            f"Criar calendário editorial para {i.get('month', 'próximo mês')}. "
            f"Frequência: {i.get('frequency', '3x/semana')}. "
            f"Plataformas: {', '.join(i.get('platforms', ['Instagram']))}. "
            f"Objetivo: {i.get('monthly_objective', 'crescimento orgânico')}."
            + (f" Pilares definidos: {i['custom_pillars']}." if i.get('custom_pillars') else "")
        ),
        "ads": lambda i: (
            f"Criar criativo de ads. Objetivo: {i.get('campaign_objective', 'leads')}. "
            f"Oferta: {i.get('offer_description', '')}. Tom: {i.get('tone', 'urgencia')}."
        ),
        "reel_script": lambda i: (
            f"Criar roteiro de Reel/TikTok. Hook: {i.get('hook', '')}. "
            f"Tema: {i.get('theme', '')}. Plataforma: {i.get('platform', 'Instagram Reels')}."
        ),
        "landing_page": lambda i: (
            f"Criar landing page completa (copy + design). "
            + (f"Campanha: {i['campaign']}. " if i.get('campaign') else "")
            + (f"Persona foco: {i['persona_focus']}." if i.get('persona_focus') else "")
        ),
        "brand_system": lambda i: (
            f"Construir brand system completo. Site: {i.get('site_url', '')}."
            + (f" Instagram: @{i['instagram']}." if i.get('instagram') else "")
            + (f" LinkedIn: {i['linkedin']}." if i.get('linkedin') else "")
            + (f" Contexto: {i['additional_context']}." if i.get('additional_context') else "")
        ),
    }
    builder = builders.get(task_type)
    if builder:
        try:
            return builder(inp)
        except Exception:
            pass
    return f"Tarefa do tipo '{task_type}' com inputs: {json.dumps(inp, ensure_ascii=False)}"
