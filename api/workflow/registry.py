"""
Workflow Template Registry

Carrega e valida templates de workflow a partir de JSON em disco.
Templates ficam em api/workflow/templates/{template_id}.json
Todos os templates são validados contra a gramática universal (grammar.json).
"""
import json
from pathlib import Path
from functools import lru_cache
from api.models.workflow import WorkflowTemplate

TEMPLATES_DIR = Path(__file__).parent / "templates"
GRAMMAR_PATH = Path(__file__).parent / "grammar.json"

# Mapeamento de task_type → template_id padrão
TASK_TYPE_DEFAULTS: dict[str, str] = {
    "hooks":        "hooks-v1",
    "copy_lp":      "copy-lp-v1",
    "calendar":     "calendar-v1",
    "ads":          "ads-creative-v1",
    "reel_script":  "reel-script-v1",
    "landing_page": "landing-page-v1",
    "brand_system": "brand-system-v1",
}


@lru_cache(maxsize=1)
def _load_grammar() -> dict:
    """Carrega a gramática universal. Cached — imutável em runtime."""
    return json.loads(GRAMMAR_PATH.read_text(encoding="utf-8"))


@lru_cache(maxsize=32)
def _load_raw(template_id: str) -> dict:
    path = TEMPLATES_DIR / f"{template_id}.json"
    if not path.exists():
        raise ValueError(f"Template não encontrado: {template_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def _validate_template(raw: dict) -> list[str]:
    """
    Valida um template bruto contra a gramática universal.
    Retorna lista de erros (vazia = válido).
    Validação estrutural leve — sem dependência de jsonschema.
    """
    errors: list[str] = []
    grammar = _load_grammar()
    required_root = grammar.get("required", [])

    for field in required_root:
        if field not in raw:
            errors.append(f"Campo obrigatório ausente na raiz: '{field}'")

    # Valida metadata
    if "metadata" in raw:
        for field in ["deliverable_type", "category", "description", "owner"]:
            if field not in raw["metadata"]:
                errors.append(f"metadata.{field} ausente")
        if raw["metadata"].get("owner") != "account-manager":
            errors.append("metadata.owner deve ser 'account-manager'")

    # Valida entry_requirements
    if "entry_requirements" in raw:
        for field in ["user_inputs", "required_client_context", "optional_client_context", "fallbacks"]:
            if field not in raw["entry_requirements"]:
                errors.append(f"entry_requirements.{field} ausente")

    # Valida steps
    step_required = ["id", "title", "goal", "phase", "primary_skill", "support_skills",
                     "input_artifacts", "output_artifacts", "approval_gate",
                     "rebrief_policy", "quality_checks"]
    gate_required = ["required", "type", "approve_action", "reject_action", "rebrief_action"]
    phase_list = raw.get("phases", [])

    for i, step in enumerate(raw.get("steps", [])):
        for field in step_required:
            if field not in step:
                errors.append(f"steps[{i}].{field} ausente (step_id={step.get('id', '?')})")
        if step.get("phase") and step["phase"] not in phase_list:
            errors.append(f"steps[{i}].phase '{step['phase']}' não está declarada em phases")
        gate = step.get("approval_gate", {})
        for field in gate_required:
            if field not in gate:
                errors.append(f"steps[{i}].approval_gate.{field} ausente")

    # Valida completion_rules
    if "completion_rules" in raw:
        for field in ["final_step_id", "final_artifact", "requires_all_gates"]:
            if field not in raw["completion_rules"]:
                errors.append(f"completion_rules.{field} ausente")

    return errors


def get_template(template_id: str) -> WorkflowTemplate:
    """Carrega, valida e retorna um template pelo ID."""
    raw = _load_raw(template_id)
    errors = _validate_template(raw)
    if errors:
        raise ValueError(
            f"Template '{template_id}' não passa na gramática universal:\n" +
            "\n".join(f"  - {e}" for e in errors)
        )
    return WorkflowTemplate(**raw)


def get_template_for_task(task_type: str) -> WorkflowTemplate:
    """Retorna o template padrão para um tipo de tarefa."""
    tid = TASK_TYPE_DEFAULTS.get(task_type)
    if not tid:
        raise ValueError(
            f"task_type '{task_type}' não reconhecido. "
            f"Válidos: {list(TASK_TYPE_DEFAULTS)}"
        )
    return get_template(tid)


def list_templates() -> list[dict]:
    """Lista todos os templates disponíveis com metadados completos."""
    result = []
    for path in sorted(TEMPLATES_DIR.glob("*.json")):
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            steps_summary = [
                {
                    "id": s["id"],
                    "title": s.get("title", s["id"]),
                    "primary_skill": s.get("primary_skill", ""),
                    "has_gate": s.get("approval_gate", {}).get("required", False),
                }
                for s in raw.get("steps", [])
            ]
            result.append({
                "template_id":   raw["template_id"],
                "display_name":  raw.get("display_name", raw["template_id"]),
                "task_type":     raw["task_type"],
                "version":       raw["version"],
                "category":      raw.get("metadata", {}).get("category", ""),
                "deliverable_type": raw.get("metadata", {}).get("deliverable_type", ""),
                "phases":        raw.get("phases", []),
                "steps":         steps_summary,
                "step_ids":      [s["id"] for s in raw.get("steps", [])],
            })
        except Exception:
            pass
    return result


def template_summary_for_prompt() -> str:
    """
    Bloco de texto descrevendo os templates disponíveis.
    Injetado no system prompt do Account Manager.
    """
    lines = ["## Templates de Workflow Disponíveis\n"]
    for t in list_templates():
        lines.append(f"### {t['template_id']} — {t['display_name']}")
        lines.append(f"- **task_type:** `{t['task_type']}`")
        lines.append(f"- **categoria:** {t['category']}")
        lines.append(f"- **fases:** {' → '.join(t['phases'])}")
        pipeline = []
        for s in t["steps"]:
            gate_marker = " [GATE]" if s["has_gate"] else ""
            pipeline.append(f"{s['id']} ({s['primary_skill']}){gate_marker}")
        lines.append(f"- **pipeline:** {' → '.join(pipeline)}\n")
    return "\n".join(lines)
