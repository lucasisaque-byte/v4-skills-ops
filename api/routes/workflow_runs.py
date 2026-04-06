"""
Workflow Runs Router

Endpoints:
  POST   /workflow-runs                                    — cria run (planejamento assíncrono) + primeiro step quando pronto
  GET    /workflow-runs/{run_id}                           — estado completo do run
  GET    /workflow-runs/{run_id}/steps/{step_id}/stream    — SSE: (re)executa step
  POST   /workflow-runs/{run_id}/steps/{step_id}/approve   — aprova step, avança
  POST   /workflow-runs/{run_id}/steps/{step_id}/reject    — rejeita step
  POST   /workflow-runs/{run_id}/steps/{step_id}/rebrief   — rebrief com feedback
  GET    /clients/{client_id}/workflow-runs                — lista runs por cliente
  GET    /workflow-runs/templates                          — lista templates disponíveis
"""
import json
import logging
import os
import threading
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from api.deps import (
    check_workflow_create_rate_limit,
    check_workflow_stream_rate_limit,
    verify_workflow_token,
)
from api.models.workflow import (
    CreateWorkflowRunRequest,
    ApproveStepRequest,
    RejectStepRequest,
    RebriefRequest,
    UISummary,
)
from api.services.orchestrator import plan_workflow
from api.services.skill_runner import stream_skill
from api.services.client_context import get_client_context
from api.services.output_store import save_output
from api.workflow import engine
from api.workflow.registry import list_templates
from api.routes.config import ALLOWED_MODELS

logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["workflow-runs"],
    dependencies=[Depends(verify_workflow_token)],
)


def _validate_optional_model(m: str | None) -> str | None:
    if m is None:
        return None
    if m not in ALLOWED_MODELS:
        raise HTTPException(status_code=400, detail="Unknown model")
    return m


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

    model = run.llm_model or os.getenv("MODEL", "claude-sonnet-4-6")

    client_ctx: dict | None = None
    try:
        client_ctx = get_client_context(run.client_id)
    except Exception:
        client_ctx = None

    try:
        for chunk in stream_skill(step.primary_skill, briefing, client_ctx, model=model):
            accumulated.append(chunk)
            yield f"data: {json.dumps({'text': chunk})}\n\n"
    except Exception as e:
        try:
            run_reload = _load_run(run_id, client_id)
            engine.fail_step(run_reload, step_id, str(e))
        except Exception:
            logger.exception("fail_step after stream error for run=%s step=%s", run_id, step_id)
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


def _execute_planning_job_sync(run_id: str) -> None:
    """Executa o Account Manager e finaliza ou falha o run (thread worker)."""
    stop_hb = threading.Event()

    def heartbeat_loop() -> None:
        while not stop_hb.wait(45):
            if not engine.touch_planning_heartbeat(run_id):
                return

    acquired = False
    hb_thread: threading.Thread | None = None
    try:
        if not engine.acquire_planning_worker(run_id):
            return
        acquired = True
        hb_thread = threading.Thread(target=heartbeat_loop, daemon=True, name=f"plan-hb-{run_id}")
        hb_thread.start()
        run = engine.begin_planning_attempt(run_id)
        if not run or run.status != "planning":
            return
        run = engine.update_planning_progress(run, "Chamando Account Manager…")
        ctx = get_client_context(run.client_id)
        if not ctx:
            raise RuntimeError(f"Cliente '{run.client_id}' não encontrado")
        task_description = _build_task_description(run.task_type, run.task_input)
        model_for_plan = run.llm_model
        if model_for_plan and model_for_plan not in ALLOWED_MODELS:
            model_for_plan = None
        plan = plan_workflow(task_description, run.task_type, ctx, model=model_for_plan)
        run = engine.load_run(run_id)
        if not run or run.status != "planning":
            return
        engine.finalize_planning(run, plan)
    except Exception as e:
        logger.exception("planning job failed for run_id=%s", run_id)
        run = engine.load_run(run_id)
        if run and run.status == "planning":
            engine.fail_planning(run, str(e))
    finally:
        stop_hb.set()
        if hb_thread is not None:
            hb_thread.join(timeout=2.0)
        if acquired:
            engine.release_planning_worker(run_id)


def dispatch_planning_job(run_id: str) -> None:
    """Agenda o planejamento em thread daemon (persistido + reconciliável após crash)."""
    threading.Thread(
        target=_execute_planning_job_sync,
        args=(run_id,),
        daemon=True,
        name=f"planning-{run_id}",
    ).start()


@router.post("/workflow-runs", dependencies=[Depends(check_workflow_create_rate_limit)])
def create_workflow_run(req: CreateWorkflowRunRequest):
    """
    Cria um WorkflowRun em status `planning` e dispara o planejamento (AM) em background.
    O cliente deve acompanhar GET /workflow-runs/{run_id} até status != planning.
    """
    try:
        ctx = _load_client(req.client_id)

        validated = _validate_optional_model(req.llm_model)
        resolved_model = validated or os.getenv("MODEL", "claude-sonnet-4-6")

        run = engine.create_pending_run(
            client_id=req.client_id,
            client_name=ctx["client_name"],
            task_type=req.task_type,
            task_input=req.input,
            llm_model=resolved_model,
        )

        dispatch_planning_job(run.run_id)

        ui = UISummary(
            primary_skill_for_next_step="account-manager",
            skills_used_to_build_current_material=["account-manager"],
            current_stage_label="Planejando workflow…",
        )

        return {
            "run_id":            run.run_id,
            "status":            run.status,
            "task_summary":      run.task_summary,
            "template_id":       run.template_id,
            "current_step":      None,
            "steps":             [],
            "ui_summary":        ui.model_dump(),
            "observations":      "",
            "stream_url":        None,
            "planning_progress": run.planning_progress,
            "planning_heartbeat_at": run.planning_heartbeat_at,
            "planning_attempt": run.planning_attempt,
            "planning_retry_note": run.planning_retry_note,
        }
    except HTTPException:
        raise
    except Exception:
        logger.exception("create_workflow_run")
        raise HTTPException(
            status_code=502,
            detail="Falha ao iniciar o workflow. Tente novamente em instantes.",
        )


@router.get("/workflow-runs/{run_id}")
def get_workflow_run(run_id: str, client_id: str | None = None):
    """Retorna o estado completo do WorkflowRun."""
    run = _load_run(run_id, client_id)
    if run.status == "planning":
        engine.try_reconcile_planning_run(run_id, dispatch_planning_job)
        run = _load_run(run_id, client_id)
    return run.model_dump()


@router.get(
    "/workflow-runs/{run_id}/steps/{step_id}/stream",
    dependencies=[Depends(check_workflow_stream_rate_limit)],
)
def stream_step(run_id: str, step_id: str):
    """SSE: executa (ou re-executa) a skill do step e faz stream do output."""
    run = _load_run(run_id)
    if run.status == "planning":
        raise HTTPException(
            status_code=409,
            detail="Workflow ainda em planejamento. Aguarde o primeiro step ficar disponível.",
        )
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
