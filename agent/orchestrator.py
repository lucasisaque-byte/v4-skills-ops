import anthropic
from typing import Optional
from agent.config import ANTHROPIC_API_KEY, COPYWRITING_MODEL, MAX_TOKENS


class Orchestrator:
    """
    Orquestra as 3 skills do time de marketing em pipeline:
    1. Copywriting  → gera copy estratégica baseada em DCC + UCM
    2. Designer     → gera wireframe e diretrizes visuais a partir do copy
    3. Social Media → gera calendário e posts que alimentam a landing page
    """

    def __init__(self):
        self.client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    async def run(
        self,
        client_name: str,
        dcc_content: str,
        ucm_content: str,
        target_audience: Optional[str] = None,
        campaign_objective: Optional[str] = None,
    ) -> dict:
        copy_result = await self.run_copywriting(client_name, dcc_content, ucm_content)
        designer_result = await self.run_designer(client_name, copy_result["copy"])
        social_result = await self.run_social_media(
            client_name,
            copy_result["copy"],
            campaign_objective or "conversão",
        )

        return {
            "client": client_name,
            "copywriting": copy_result,
            "designer": designer_result,
            "social_media": social_result,
        }

    async def run_copywriting(
        self,
        client_name: str,
        dcc_content: str,
        ucm_content: str,
    ) -> dict:
        system_prompt = self._load_skill_prompt("copywriting")

        user_message = f"""
## Cliente: {client_name}

## DCC (Documento de Concepção de Copy):
{dcc_content}

## UCM (Use Case Map):
{ucm_content}

## Tarefa:
Gere a copy completa para a landing page seguindo a estrutura:
Hero → Problema → Solução → Benefícios → Prova Social → FAQ → CTA Final.
"""

        response = self.client.messages.create(
            model=COPYWRITING_MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        return {
            "skill": "copywriting",
            "client": client_name,
            "copy": response.content[0].text,
        }

    async def run_designer(self, client_name: str, copy_content: str) -> dict:
        system_prompt = self._load_skill_prompt("designer")

        user_message = f"""
## Cliente: {client_name}

## Copy da Landing Page:
{copy_content}

## Tarefa:
Com base no copy acima, gere o wireframe detalhado e as diretrizes visuais da landing page.
Inclua: hierarquia visual, paleta sugerida, posicionamento de CTA, tipografia e orientações de responsividade.
"""

        response = self.client.messages.create(
            model=COPYWRITING_MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        return {
            "skill": "designer",
            "client": client_name,
            "wireframe": response.content[0].text,
        }

    async def run_social_media(
        self,
        client_name: str,
        copy_content: str,
        campaign_objective: str,
    ) -> dict:
        system_prompt = self._load_skill_prompt("social-media")

        user_message = f"""
## Cliente: {client_name}
## Objetivo da campanha: {campaign_objective}

## Copy da Landing Page (contexto):
{copy_content}

## Tarefa:
Crie um calendário de 30 dias de conteúdo para Instagram/LinkedIn que alimente o tráfego para a landing page.
Inclua posts em formato: reels (hook + roteiro), carrossel (slides) e estático (copy + orientação visual).
"""

        response = self.client.messages.create(
            model=COPYWRITING_MODEL,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=[{"role": "user", "content": user_message}],
        )

        return {
            "skill": "social_media",
            "client": client_name,
            "calendar": response.content[0].text,
        }

    def _load_skill_prompt(self, skill_name: str) -> str:
        """Carrega o SKILL.md da skill correspondente como system prompt."""
        skill_path = f"skills/{skill_name}/SKILL.md"
        try:
            with open(skill_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return f"Você é um especialista de {skill_name} em uma agência de marketing de performance."
