"""
Orchestrator — Account Manager como fonte de verdade

Mudanças vs versão anterior:
  - Remove ORCHESTRATOR_SYSTEM hardcoded
  - Carrega skills/account-manager/SKILL.md como system prompt base
  - Injeta schema do RuntimePlan + templates disponíveis no final do system prompt
  - Retorna RuntimePlan tipado (Pydantic) em vez de dict genérico
  - Mantém orchestrate_and_stream() para compatibilidade com /generate/* existentes
  - Expõe plan_workflow() para o novo sistema de workflow-runs
"""
import json
import logging

from api.models.workflow import RuntimePlan, UISummary, RequiredContextItem, RuntimeStepBriefing
from api.services.skill_runner import (
    load_skill, build_context_block, stream_skill, _client, _resolve_model,
)
from api.workflow.registry import template_summary_for_prompt, get_template_for_task

logger = logging.getLogger(__name__)

# ─── System prompt builder ────────────────────────────────────────────────────

_RUNTIME_PLAN_SCHEMA = """
---

## MODO DE OPERAÇÃO: API — OUTPUT OBRIGATÓRIO EM JSON

Você está operando via API. Sua resposta deve ser EXCLUSIVAMENTE um JSON válido — sem texto antes ou depois.

Siga este schema exato:

```json
{
  "workflow_template_id": "<id do template — veja lista abaixo>",
  "workflow_version": "1.0.0",
  "task_type": "<task_type do template selecionado>",
  "task_summary": "<resumo da tarefa em 1 frase objetiva>",
  "selected_pipeline": ["<step_id_1>", "<step_id_2>"],
  "required_context": [
    { "source": "dcc", "required": true, "reason": "<motivo específico>" },
    { "source": "ucm", "required": true, "reason": "<motivo específico>" }
  ],
  "step_briefings": [
    {
      "step_id": "<id do step>",
      "briefing": "<briefing completo e detalhado para a skill deste step — mínimo 150 palavras, máximo 400>"
    }
  ],
  "fallbacks": [],
  "ui_summary": {
    "primary_skill_for_next_step": "<skill do primeiro step executável>",
    "skills_used_to_build_current_material": ["account-manager"],
    "current_stage_label": "<label de status para o frontend>"
  },
  "observations": "<lacunas encontradas, hipóteses assumidas, riscos identificados>"
}
```

### Regras para o briefing de cada step

- Use TUDO do contexto do cliente (DCC, UCM, brand) para enriquecer
- Seja específico: mencione persona, tom de voz, diferencial, objeções, mecanismo único
- Nunca seja genérico — o briefing deve soar como um especialista de marketing escreveu
- O briefing é a instrução direta para a skill especializada: seja preciso e acionável
- Para steps com `primary_skill: account-manager`, o briefing deve ser o plano estratégico completo

Responda APENAS com o JSON, sem markdown, sem blocos de código, sem texto adicional.

"""


def _build_am_system_prompt() -> str:
    """
    Monta o system prompt completo do AM:
      1. Conteúdo do SKILL.md (instruções ricas do AM)
      2. Resumo dos templates disponíveis
      3. Schema do RuntimePlan + regras de output
    """
    try:
        skill_content = load_skill("account-manager")
    except FileNotFoundError:
        # Fallback se SKILL.md não existir (não deve acontecer em produção)
        skill_content = "Você é o Account Manager da V4 Company — orquestrador de produção de marketing."
        logger.warning("skills/account-manager/SKILL.md não encontrado — usando fallback")

    templates_block = template_summary_for_prompt()
    return skill_content + "\n\n" + templates_block + _RUNTIME_PLAN_SCHEMA


# ─── RuntimePlan builder ──────────────────────────────────────────────────────

def plan_workflow(
    task_description: str,
    task_type: str,
    client_context: dict | None = None,
    *,
    model: str | None = None,
) -> RuntimePlan:
    """
    Chama o Account Manager para produzir um RuntimePlan completo.
    Usa o SKILL.md do AM como system prompt.

    Args:
        task_description: Descrição livre da tarefa
        task_type: task_type do template (ex: "hooks", "landing_page")
        client_context: Contexto do cliente (DCC, UCM, brand)

    Returns:
        RuntimePlan validado pelo Pydantic
    """
    system_prompt = _build_am_system_prompt()

    user_parts = []
    if client_context:
        user_parts.append(build_context_block(client_context))
        user_parts.append("---")
    user_parts.append(f"Tarefa solicitada: {task_description}")
    user_parts.append(f"Task type sugerido: {task_type}")

    # Fornece a estrutura do template para o AM usar como guia
    try:
        template = get_template_for_task(task_type)
        steps_hint = "\n".join(
            f"  - step_id: {s.id}, primary_skill: {s.primary_skill}, title: {s.title}"
            for s in template.steps
        )
        user_parts.append(
            f"\nTemplate sugerido: {template.template_id}\n"
            f"Steps disponíveis neste template:\n{steps_hint}"
        )
    except ValueError:
        pass

    user_message = "\n\n".join(user_parts)

    resolved_model = _resolve_model(model)

    response = _client().messages.create(
        model=resolved_model,
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )

    raw = response.content[0].text
    return _parse_runtime_plan(raw, task_type)


def _parse_runtime_plan(raw: str, task_type_fallback: str) -> RuntimePlan:
    """Parse + validação do JSON do AM. Fallback robusto se inválido."""
    try:
        data = json.loads(raw)
        return RuntimePlan(**data)
    except Exception as e:
        logger.warning(f"AM retornou RuntimePlan inválido: {e}. Aplicando fallback.")
        return _fallback_plan(task_type_fallback, raw)


def _fallback_plan(task_type: str, raw_briefing: str) -> RuntimePlan:
    """
    Cria um RuntimePlan mínimo quando o AM falha em retornar JSON válido.
    Usa o conteúdo bruto como briefing do primeiro step.
    """
    skill_map = {
        "hooks":       ("hook-engineer",              "hooks-v1",       "hook_generation"),
        "copy_lp":     ("copywriting",                "copy-lp-v1",     "copy_lp"),
        "calendar":    ("editorial-calendar-builder", "calendar-v1",    "calendar_generation"),
        "ads":         ("social-media-designer",      "ads-creative-v1","ads_generation"),
        "reel_script": ("reels-script-architect",     "reel-script-v1", "reel_script_generation"),
        "landing_page":("copywriting",                "landing-page-v1","copy_lp"),
    }
    skill, template_id, step_id = skill_map.get(
        task_type, ("copywriting", "copy-lp-v1", "copy_lp")
    )
    return RuntimePlan(
        workflow_template_id=template_id,
        workflow_version="1.0.0",
        task_type=task_type,
        task_summary="Tarefa solicitada via plataforma V4",
        selected_pipeline=[step_id],
        required_context=[
            RequiredContextItem(source="dcc", required=True, reason="contexto estratégico"),
            RequiredContextItem(source="ucm", required=True, reason="persona e jornada"),
        ],
        step_briefings=[RuntimeStepBriefing(step_id=step_id, briefing=raw_briefing[:2000])],
        fallbacks=[],
        ui_summary=UISummary(
            primary_skill_for_next_step=skill,
            skills_used_to_build_current_material=["account-manager"],
            current_stage_label="Executando skill",
        ),
        observations="Account Manager retornou JSON inválido — briefing simplificado aplicado.",
    )


# ─── Backward compat: orchestrate_and_stream ─────────────────────────────────

def orchestrate_and_stream(
    task_description: str,
    skill_hint: str,
    client_context: dict | None = None,
    *,
    model: str | None = None,
):
    """
    Compatibilidade com /generate/* existentes.

    Usa o novo plan_workflow() internamente mas mantém o mesmo
    protocolo de yield (__AM_START__, __AM_DONE__, __SKILL_START__, chunks).

    task_type é inferido do skill_hint.
    """
    # Mapeamento skill_hint → task_type
    _hint_to_task = {
        "hook-engineer":              "hooks",
        "copywriting":                "copy_lp",
        "editorial-calendar-builder": "calendar",
        "social-media-designer":      "ads",
        "reels-script-architect":     "reel_script",
        "brand-intel":                "hooks",  # brand usa hooks endpoint como workaround
    }
    task_type = _hint_to_task.get(skill_hint, "copy_lp")

    try:
        yield "__AM_START__"

        plan = plan_workflow(task_description, task_type, client_context, model=model)

        # Extrai skill e briefing do primeiro step executável
        skill_alvo = skill_hint  # default
        briefing = task_description  # default

        if plan.step_briefings:
            first = plan.step_briefings[0]
            briefing = first.briefing
            # Descobrir skill do primeiro step no template
            try:
                template = get_template_for_task(task_type)
                for ts in template.steps:
                    if ts.id == first.step_id:
                        skill_alvo = ts.primary_skill
                        break
            except ValueError:
                pass

        yield f"__AM_DONE__{json.dumps({'skill': skill_alvo, 'observacoes': plan.observations}, ensure_ascii=False)}"

        yield "__SKILL_START__"
        for chunk in stream_skill(skill_alvo, briefing, None, model=model):
            yield chunk

    except Exception as e:
        yield f"__ERROR__{str(e)}"
