"""
Orquestrador com Account Manager.

Fluxo:
  1. Account Manager recebe pedido + contexto do cliente
  2. Retorna briefing estruturado + skill_alvo
  3. Skill especializada recebe o briefing e gera o output final
"""
import json
from api.services.skill_runner import load_skill, build_context_block, stream_skill, _client, MODEL, MAX_TOKENS


ORCHESTRATOR_SYSTEM = """Você é o Account Manager da V4 Company — o orquestrador de produção de marketing.

Sua única função aqui é analisar o pedido do usuário, absorver o contexto do cliente e produzir um **briefing estruturado** para a skill especializada que vai executar a tarefa.

Você deve retornar um JSON com exatamente este formato:
{
  "skill_alvo": "<nome da skill>",
  "briefing": "<briefing completo e detalhado para a skill>",
  "observacoes": "<lacunas identificadas ou hipóteses assumidas>"
}

Skills disponíveis:
- hook-engineer: gerar hooks/ganchos para posts
- copywriting: copy de landing page completa
- editorial-calendar-builder: calendário editorial mensal
- social-media-designer: criativo visual para ads
- reels-script-architect: roteiro de Reels/TikTok
- brand-intel: extração de identidade visual

Regras do briefing:
- Use TUDO do contexto do cliente (DCC, UCM, brand) para enriquecer
- Seja específico: mencione persona, tom de voz, diferencial, objeções do cliente
- Não seja genérico — o briefing deve soar como se um especialista de marketing escreveu
- Máximo 600 palavras no briefing
- Responda APENAS o JSON, sem texto antes ou depois"""


def orchestrate(
    task_description: str,
    skill_hint: str,
    client_context: dict | None = None,
) -> dict:
    """
    Roda o Account Manager para montar o briefing.
    Retorna dict com skill_alvo, briefing e observacoes.
    """
    user_message = f"Tarefa solicitada: {task_description}\nSkill sugerida: {skill_hint}"
    if client_context:
        user_message = f"{build_context_block(client_context)}\n\n---\n\n{user_message}"

    response = _client().chat.completions.create(
        model=MODEL,
        max_tokens=1500,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": ORCHESTRATOR_SYSTEM},
            {"role": "user", "content": user_message},
        ],
    )

    try:
        return json.loads(response.choices[0].message.content)
    except json.JSONDecodeError:
        return {
            "skill_alvo": skill_hint,
            "briefing": task_description,
            "observacoes": "Account Manager não retornou JSON válido — usando prompt original.",
        }


def orchestrate_and_stream(
    task_description: str,
    skill_hint: str,
    client_context: dict | None = None,
):
    """
    Pipeline completo: Account Manager → skill especializada com streaming.
    Yield de eventos SSE com prefixo para diferenciar fase.
    """
    try:
        # Fase 1: Account Manager monta o briefing
        yield "__AM_START__"
        briefing_data = orchestrate(task_description, skill_hint, client_context)
        skill_alvo = briefing_data.get("skill_alvo", skill_hint)
        briefing = briefing_data.get("briefing", task_description)
        observacoes = briefing_data.get("observacoes", "")

        yield f"__AM_DONE__{json.dumps({'skill': skill_alvo, 'observacoes': observacoes}, ensure_ascii=False)}"

        # Fase 2: Skill especializada gera o output com o briefing enriquecido
        yield "__SKILL_START__"
        for chunk in stream_skill(skill_alvo, briefing, client_context):
            yield chunk

    except Exception as e:
        yield f"__ERROR__{str(e)}"
