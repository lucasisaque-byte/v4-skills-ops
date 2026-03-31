import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from api.services.orchestrator import orchestrate_and_stream
from api.services.client_context import get_client_context
from api.services.output_store import save_output

router = APIRouter(prefix="/generate", tags=["generate"])


# ─── Request Models ────────────────────────────────────────────────

class HooksRequest(BaseModel):
    client_id: str
    theme: str
    platform: str = "Instagram"
    icp_override: Optional[str] = None


class CopyRequest(BaseModel):
    client_id: str
    campaign_description: Optional[str] = None
    persona_focus: Optional[str] = None
    output_format: str = "structured"


class CalendarRequest(BaseModel):
    client_id: str
    month: str
    frequency: str = "3x/semana"
    platforms: list[str] = ["Instagram"]
    monthly_objective: str = ""
    pillar_mode: str = "auto"
    custom_pillars: Optional[str] = None


class AdsRequest(BaseModel):
    client_id: str
    campaign_objective: str
    platform: str
    offer_description: str
    tone: str = "urgencia"
    audience_override: Optional[str] = None


class ScriptRequest(BaseModel):
    client_id: str
    hook: str
    theme: str
    platform: str = "Instagram Reels"


# ─── Helpers ───────────────────────────────────────────────────────

def _sse_stream_and_save(generator, client_id: str, client_name: str, feature: str, prompt_summary: str):
    """Wraps generator into SSE, acumula conteúdo e salva no final"""
    def event_stream():
        accumulated = []
        for chunk in generator:
            if chunk.startswith("__"):
                yield f"data: {json.dumps({'event': chunk})}\n\n"
            else:
                accumulated.append(chunk)
                yield f"data: {json.dumps({'text': chunk})}\n\n"

        # Salva o output completo ao terminar
        full_content = "".join(accumulated)
        if full_content.strip():
            try:
                save_output(client_id, client_name, feature, prompt_summary, full_content)
            except Exception:
                pass  # Não bloqueia o streaming por erro de persistência

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


def _load_context(client_id: str) -> dict:
    ctx = get_client_context(client_id)
    if not ctx:
        raise HTTPException(status_code=404, detail=f"Cliente '{client_id}' não encontrado")
    return ctx


# ─── Endpoints ─────────────────────────────────────────────────────

@router.post("/hooks")
def generate_hooks(req: HooksRequest):
    ctx = _load_context(req.client_id)
    task = f"Gerar 5 variações de hook para o tema: {req.theme}. Plataforma: {req.platform}."
    if req.icp_override:
        task += f" ICP customizado: {req.icp_override}."
    return _sse_stream_and_save(
        orchestrate_and_stream(task, "hook-engineer", ctx),
        req.client_id, ctx["client_name"], "hooks", req.theme
    )


@router.post("/copy")
def generate_copy(req: CopyRequest):
    ctx = _load_context(req.client_id)
    task = "Gerar copy completa de landing page com seções: Hero, Problema, Solução, Benefícios, Prova Social, FAQ, CTA final."
    if req.campaign_description:
        task += f" Campanha específica: {req.campaign_description}."
    if req.persona_focus and req.persona_focus != "Todas":
        task += f" Focar na persona: {req.persona_focus}."
    if req.output_format == "html":
        task += " Incluir também wireframe em HTML/CSS."
    summary = req.campaign_description or "Copy de landing page"
    return _sse_stream_and_save(
        orchestrate_and_stream(task, "copywriting", ctx),
        req.client_id, ctx["client_name"], "copy", summary
    )


@router.post("/calendar")
def generate_calendar(req: CalendarRequest):
    ctx = _load_context(req.client_id)
    task = (
        f"Criar calendário editorial para {req.month}. "
        f"Frequência: {req.frequency}. "
        f"Plataformas: {', '.join(req.platforms)}. "
        f"Objetivo do mês: {req.monthly_objective or 'crescimento orgânico e engajamento'}."
    )
    if req.pillar_mode == "manual" and req.custom_pillars:
        task += f" Pilares definidos: {req.custom_pillars}."
    return _sse_stream_and_save(
        orchestrate_and_stream(task, "editorial-calendar-builder", ctx),
        req.client_id, ctx["client_name"], "calendar", req.month
    )


@router.post("/ads")
def generate_ads(req: AdsRequest):
    ctx = _load_context(req.client_id)
    platform_map = {
        "meta-feed": "Meta Ads Feed (4:5, 800x1000px)",
        "meta-stories": "Meta Ads Stories (9:16, 1080x1920px)",
        "google": "Google Display (1.91:1, 1200x628px)",
        "linkedin": "LinkedIn Sponsored (1.91:1, 1200x628px)",
    }
    task = (
        f"Criar criativo de ads. "
        f"Objetivo: {req.campaign_objective}. "
        f"Plataforma: {platform_map.get(req.platform, req.platform)}. "
        f"Oferta: {req.offer_description}. "
        f"Tom: {req.tone}. "
        "Entregar: copy (Hook + Headline + CTA) + brief técnico + HTML/CSS auto-contido do criativo."
    )
    if req.audience_override:
        task += f" Público customizado: {req.audience_override}."
    return _sse_stream_and_save(
        orchestrate_and_stream(task, "social-media-designer", ctx),
        req.client_id, ctx["client_name"], "ads", req.offer_description
    )


@router.post("/reel-script")
def generate_reel_script(req: ScriptRequest):
    ctx = _load_context(req.client_id)
    task = (
        f"Criar roteiro completo de Reel/TikTok. "
        f"Hook aprovado: {req.hook}. "
        f"Tema: {req.theme}. "
        f"Plataforma: {req.platform}. "
        "Entregar: Hook (0-3s), Desenvolvimento (3-90s com marcações de cena), CTA (últimos 5s), Legenda com hashtags."
    )
    return _sse_stream_and_save(
        orchestrate_and_stream(task, "reels-script-architect", ctx),
        req.client_id, ctx["client_name"], "reel-script", req.hook
    )
