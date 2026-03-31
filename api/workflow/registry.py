"""
Workflow Template Registry

Carrega e valida templates de workflow a partir de JSON em disco.
Templates ficam em api/workflow/templates/{template_id}.json
"""
import json
from pathlib import Path
from functools import lru_cache
from api.models.workflow import WorkflowTemplate

TEMPLATES_DIR = Path(__file__).parent / "templates"

# Mapeamento de task_type → template_id padrão
TASK_TYPE_DEFAULTS: dict[str, str] = {
    "hooks":        "hooks-v1",
    "copy_lp":      "copy-lp-v1",
    "calendar":     "calendar-v1",
    "ads":          "ads-creative-v1",
    "reel_script":  "reel-script-v1",
    "landing_page": "landing-page-v1",
}


@lru_cache(maxsize=32)
def _load_raw(template_id: str) -> dict:
    path = TEMPLATES_DIR / f"{template_id}.json"
    if not path.exists():
        raise ValueError(f"Template não encontrado: {template_id}")
    return json.loads(path.read_text(encoding="utf-8"))


def get_template(template_id: str) -> WorkflowTemplate:
    """Carrega e valida um template pelo ID."""
    return WorkflowTemplate(**_load_raw(template_id))


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
    """Lista todos os templates disponíveis (id, display_name, task_type, version)."""
    result = []
    for path in sorted(TEMPLATES_DIR.glob("*.json")):
        try:
            raw = json.loads(path.read_text(encoding="utf-8"))
            result.append({
                "template_id":  raw["template_id"],
                "display_name": raw.get("display_name", raw["template_id"]),
                "task_type":    raw["task_type"],
                "version":      raw["version"],
                "steps":        [s["id"] for s in raw["steps"]],
            })
        except Exception:
            pass
    return result


def template_summary_for_prompt() -> str:
    """
    Retorna um bloco de texto descrevendo os templates disponíveis.
    Usado para injetar no system prompt do Account Manager.
    """
    lines = ["## Templates de Workflow Disponíveis\n"]
    for t in list_templates():
        lines.append(f"- **{t['template_id']}** ({t['display_name']})")
        lines.append(f"  task_type: `{t['task_type']}`")
        lines.append(f"  steps: {' → '.join(t['steps'])}\n")
    return "\n".join(lines)
