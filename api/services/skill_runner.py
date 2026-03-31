"""
Executa skills usando OpenAI como LLM principal.
"""
import os
import json
from pathlib import Path
from openai import OpenAI

SKILLS_DIR = Path(__file__).parent.parent.parent / "skills"
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "8096"))


def _client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def load_skill(skill_name: str) -> str:
    """Carrega o SKILL.md como system prompt"""
    skill_path = SKILLS_DIR / skill_name / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill não encontrada: {skill_name}")
    return skill_path.read_text(encoding="utf-8")


def _trunc(text: str | None, max_chars: int) -> str | None:
    """Trunca texto mantendo o início + aviso de corte"""
    if not text or len(text) <= max_chars:
        return text
    return text[:max_chars] + f"\n\n[... documento truncado — {len(text) - max_chars} caracteres omitidos para caber no limite de tokens ...]"


def build_context_block(context: dict) -> str:
    """Constrói bloco de contexto do cliente para injetar no prompt.
    Limites conservadores para ficar bem abaixo do TPM de 30k tokens do gpt-4o tier 1.
    """
    parts = [f"## Contexto do Cliente: {context.get('client_name', '')}"]

    if context.get("dcc"):
        parts.append(f"\n### DCC (Documento de Concepção de Copy)\n{_trunc(context['dcc'], 12000)}")

    if context.get("ucm"):
        parts.append(f"\n### UCM (Use Case Map)\n{_trunc(context['ucm'], 6000)}")

    brand = context.get("brand", {})
    if brand.get("identidade"):
        parts.append(f"\n### Identidade Visual\n{_trunc(brand['identidade'], 3000)}")

    if brand.get("design_system"):
        parts.append(f"\n### Design System Social Media\n{_trunc(brand['design_system'], 3000)}")

    if brand.get("tokens"):
        tokens_str = json.dumps(brand['tokens'], ensure_ascii=False, indent=2)
        parts.append(f"\n### Design Tokens\n```json\n{_trunc(tokens_str, 1500)}\n```")

    return "\n".join(parts)


def run_skill(skill_name: str, prompt: str, client_context: dict | None = None) -> str:
    """Executa uma skill sincronamente e retorna o texto completo"""
    system_prompt = load_skill(skill_name)
    user_message = prompt
    if client_context:
        user_message = f"{build_context_block(client_context)}\n\n---\n\n{prompt}"

    response = _client().chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )
    return response.choices[0].message.content


def stream_skill(skill_name: str, prompt: str, client_context: dict | None = None):
    """Executa uma skill com streaming — yield chunks de texto"""
    system_prompt = load_skill(skill_name)
    user_message = prompt
    if client_context:
        user_message = f"{build_context_block(client_context)}\n\n---\n\n{prompt}"

    stream = _client().chat.completions.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        stream=True,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta
