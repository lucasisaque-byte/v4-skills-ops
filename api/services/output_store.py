"""
Persiste entregáveis gerados em outputs/{client_id}/entries.json
Mantém no máximo MAX_ENTRIES por cliente, rotacionando os mais antigos.
"""
import json
from pathlib import Path
from datetime import datetime

OUTPUTS_DIR = Path(__file__).parent.parent.parent / "outputs"
MAX_ENTRIES = 30

FEATURE_LABELS = {
    "hooks": "Hook Engineer",
    "copy": "Copy de LP",
    "calendar": "Calendário Editorial",
    "ads": "Criativo de Ads",
    "reel-script": "Script de Reels",
    "brand": "Brand System",
}


def _client_dir(client_id: str) -> Path:
    d = OUTPUTS_DIR / client_id
    d.mkdir(parents=True, exist_ok=True)
    return d


def _entries_path(client_id: str) -> Path:
    return _client_dir(client_id) / "entries.json"


def _load_entries(client_id: str) -> list[dict]:
    path = _entries_path(client_id)
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return []


def save_output(client_id: str, client_name: str, feature: str, prompt_summary: str, content: str) -> dict:
    """Salva um entregável e retorna o entry criado"""
    entries = _load_entries(client_id)

    entry = {
        "id": f"{client_id}-{feature}-{int(datetime.now().timestamp())}",
        "client_id": client_id,
        "client_name": client_name,
        "feature": feature,
        "feature_label": FEATURE_LABELS.get(feature, feature),
        "prompt_summary": prompt_summary[:120],
        "content": content,
        "created_at": datetime.now().isoformat(),
    }

    entries.insert(0, entry)

    # Rotaciona: mantém apenas os MAX_ENTRIES mais recentes
    if len(entries) > MAX_ENTRIES:
        entries = entries[:MAX_ENTRIES]

    _entries_path(client_id).write_text(
        json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return entry


def list_outputs(client_id: str | None = None, limit: int = 20) -> list[dict]:
    """Lista entregáveis. Se client_id=None, retorna de todos os clientes."""
    if client_id:
        entries = _load_entries(client_id)
        return [_strip_content(e) for e in entries[:limit]]

    all_entries = []
    if OUTPUTS_DIR.exists():
        for client_dir in OUTPUTS_DIR.iterdir():
            if client_dir.is_dir():
                all_entries.extend(_load_entries(client_dir.name))

    all_entries.sort(key=lambda e: e.get("created_at", ""), reverse=True)
    return [_strip_content(e) for e in all_entries[:limit]]


def get_output(entry_id: str) -> dict | None:
    """Retorna um entregável completo pelo id"""
    if OUTPUTS_DIR.exists():
        for client_dir in OUTPUTS_DIR.iterdir():
            if client_dir.is_dir():
                for entry in _load_entries(client_dir.name):
                    if entry["id"] == entry_id:
                        return entry
    return None


def _strip_content(entry: dict) -> dict:
    """Remove o conteúdo completo para listagens (evita payload gigante)"""
    return {k: v for k, v in entry.items() if k != "content"}
