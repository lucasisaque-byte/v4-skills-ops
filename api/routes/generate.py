import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from api.services.skill_runner import run_skill, stream_skill
from api.services.client_context import get_client_context

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
    output_format: str = "structured"  # "structured" | "html"


class CalendarRequest(BaseModel):
    client_id: str
    month: str  # "Abril 2026"
    frequency: str = "3x/semana"
    platforms: list[str] = ["Instagram"]
    monthly_objective: str = ""
    pillar_mode: str = "auto"  # "auto" | "saved" | "manual"
    custom_pillars: Optional[str] = None


class AdsRequest(BaseModel):
    client_id: str
    campaign_objective: str  # "leads" | "awareness" | "conversion"
    platform: str  # "meta-feed" | "meta-stories" | "google" | "linkedin"
    offer_description: str
    tone: str = "urgencia"  # "urgencia" | "educacional" | "emocional" | "prova"
    audience_override: Optional[str] = None


class ScriptRequest(BaseModel):
    client_id: str
    hook: str
    theme: str
    platform: str = "Instagram Reels"


# ─── Helpers ───────────────────────────────────────────────────────

def _sse_stream(generator):
    """Wraps a text generator into SSE format"""
    def event_stream():
        for chunk in generator:
            yield f"data: {json.dumps({'text': chunk})}\n\n"
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
    prompt = f"""Gere 5 variações de hook para o seguinte tema:

**Tema:** {req.theme}
**Plataforma:** {req.platform}
"""
    if req.icp_override:
        prompt += f"\n**ICP customizado:** {req.icp_override}"

    return _sse_stream(stream_skill("hook-engineer", prompt, ctx))


@router.post("/copy")
def generate_copy(req: CopyRequest):
    ctx = _load_context(req.client_id)
    prompt = "Gere a copy completa de landing page seguindo a estrutura: Hero, Problema, Solução, Benefícios, Prova Social, FAQ, CTA final."
    if req.campaign_description:
        prompt += f"\n\n**Campanha específica:** {req.campaign_description}"
    if req.persona_focus and req.persona_focus != "Todas":
        prompt += f"\n**Persona foco:** {req.persona_focus}"
    if req.output_format == "html":
        prompt += "\n\nGere também o wireframe em HTML/CSS para a landing page."

    return _sse_stream(stream_skill("copywriting", prompt, ctx))


@router.post("/calendar")
def generate_calendar(req: CalendarRequest):
    ctx = _load_context(req.client_id)
    prompt = f"""Crie o calendário editorial completo para o mês de {req.month}.

**Frequência:** {req.frequency}
**Plataformas:** {', '.join(req.platforms)}
**Objetivo do mês:** {req.monthly_objective or 'Crescimento orgânico e engajamento'}
"""
    if req.pillar_mode == "manual" and req.custom_pillars:
        prompt += f"\n**Pilares definidos manualmente:**\n{req.custom_pillars}"
    else:
        prompt += "\n\nPrimeiro defina os pilares editoriais do cliente, depois monte o calendário completo em formato de tabela."

    return _sse_stream(stream_skill("editorial-calendar-builder", prompt, ctx))


@router.post("/ads")
def generate_ads(req: AdsRequest):
    ctx = _load_context(req.client_id)

    platform_map = {
        "meta-feed": "Meta Ads Feed (4:5, 800x1000px)",
        "meta-stories": "Meta Ads Stories (9:16, 1080x1920px)",
        "google": "Google Display (1.91:1, 1200x628px)",
        "linkedin": "LinkedIn Sponsored (1.91:1, 1200x628px)",
    }
    platform_label = platform_map.get(req.platform, req.platform)

    prompt = f"""Crie um criativo de ads completo.

**Objetivo:** {req.campaign_objective}
**Plataforma e formato:** {platform_label}
**Oferta/produto:** {req.offer_description}
**Tom:** {req.tone}
"""
    if req.audience_override:
        prompt += f"\n**Público customizado:** {req.audience_override}"

    prompt += "\n\nEntregue: 1) Copy (Hook + Headline + Subheadline + CTA), 2) Brief técnico para o designer, 3) HTML/CSS auto-contido do criativo pronto para renderizar."

    return _sse_stream(stream_skill("social-media-designer", prompt, ctx))


@router.post("/reel-script")
def generate_reel_script(req: ScriptRequest):
    ctx = _load_context(req.client_id)
    prompt = f"""Crie o roteiro completo de Reel/TikTok.

**Hook aprovado:** {req.hook}
**Tema:** {req.theme}
**Plataforma:** {req.platform}

Entregue: Hook (0-3s), Desenvolvimento (3-90s com marcações de cena), CTA (últimos 5s), Legenda completa com hashtags."""

    return _sse_stream(stream_skill("reels-script-architect", prompt, ctx))
