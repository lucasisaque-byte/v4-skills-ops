"""
Abstração genérica para rodar qualquer skill como uma chamada ao Claude.
"""
import os
from pathlib import Path
import anthropic

SKILLS_DIR = Path(__file__).parent.parent.parent / "skills"
MODEL = os.getenv("MODEL", "claude-sonnet-4-6")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "8096"))


def load_skill(skill_name: str) -> str:
    """Carrega o SKILL.md como system prompt"""
    skill_path = SKILLS_DIR / skill_name / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill não encontrada: {skill_name}")
    return skill_path.read_text(encoding="utf-8")


def build_context_block(context: dict) -> str:
    """Constrói um bloco de contexto do cliente para injetar no user message"""
    parts = [f"## Contexto do Cliente: {context.get('client_name', '')}"]

    if context.get("dcc"):
        parts.append(f"\n### DCC (Documento de Concepção de Copy)\n{context['dcc']}")

    if context.get("ucm"):
        parts.append(f"\n### UCM (Use Case Map)\n{context['ucm']}")

    brand = context.get("brand", {})
    if brand.get("identidade"):
        parts.append(f"\n### Identidade Visual\n{brand['identidade']}")

    if brand.get("design_system"):
        parts.append(f"\n### Design System Social Media\n{brand['design_system']}")

    if brand.get("tokens"):
        import json
        parts.append(f"\n### Design Tokens\n```json\n{json.dumps(brand['tokens'], ensure_ascii=False, indent=2)}\n```")

    return "\n".join(parts)


def run_skill(skill_name: str, prompt: str, client_context: dict | None = None) -> str:
    """Executa uma skill sincronamente e retorna o texto completo"""
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    system_prompt = load_skill(skill_name)

    user_message = prompt
    if client_context:
        context_block = build_context_block(client_context)
        user_message = f"{context_block}\n\n---\n\n{prompt}"

    message = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    )
    return message.content[0].text


def stream_skill(skill_name: str, prompt: str, client_context: dict | None = None):
    """Executa uma skill com streaming — yield chunks de texto"""
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    system_prompt = load_skill(skill_name)

    user_message = prompt
    if client_context:
        context_block = build_context_block(client_context)
        user_message = f"{context_block}\n\n---\n\n{prompt}"

    with client.messages.stream(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": user_message}],
    ) as stream:
        for text in stream.text_stream:
            yield text
