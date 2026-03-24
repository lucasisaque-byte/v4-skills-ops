# Playbook de Handoffs e Aprovações

## Por que aprovações existem

Aprovações não são burocracia — são o mecanismo que evita retrabalho maior. Um ajuste de copy antes do Designer é 10x mais barato que refazer o design depois. A aprovação é o ponto de alinhamento formal entre o que foi produzido e o que o usuário realmente precisa.

---

## APROVAÇÃO 1 — Após Copywriting ou Social Media

### Como apresentar o output

Estrutura da apresentação:
```
## ✅ [Tipo da peça] pronta para revisão — [Nome do Cliente]

**Skill utilizada:** Copywriting / Social Media
**Framework aplicado:** [ex: PAS + Proof Stacking]
**Persona alvo:** [ex: CFO / Head de Produto]
**Ângulo escolhido:** [1-2 linhas explicando a lógica da peça]
**Objetivo da peça:** [o que ela deve fazer]

---

[Conteúdo produzido completo]

---

**Para aprovar:** responda "Aprovado" e seguimos para o Designer.
**Para ajustar:** descreva o que mudar e eu reencaminho para revisão.
**Para refazer:** me diga a nova direção e reconstruo o briefing do zero.
```

---

### Como interpretar o feedback

**"Aprovado"** ou equivalentes ("ok", "pode seguir", "perfeito")
→ Reformate o output em briefing para o Designer
→ Inclua observações implícitas que o usuário demonstrou valorizar
→ Siga para a próxima etapa do pipeline

**"Ajuste X e Y"** — mudanças pontuais e específicas
Sinais: menciona elementos concretos, escopo limitado, tom construtivo
→ Rebriefing parcial: extraia apenas os pontos de ajuste
→ Mantenha o que não foi mencionado
→ Instrua a skill a revisar apenas as partes indicadas
→ Reapresente para nova aprovação

**"Refazer com Z"** — reconstrução total ou mudança de direção
Sinais: rejeita o ângulo, muda a persona, contradiz premissas base, tom de insatisfação com a peça como um todo
→ Rebriefing completo: volte ao início
→ Incorpore a nova direção e todos os feedbacks recebidos
→ Reconstrua o briefing do zero
→ Reacione a skill

**Casos ambíguos**
Se não ficou claro se é ajuste ou refação:
→ Pergunte: "Esse feedback é um ajuste pontual na peça atual ou você prefere que eu reconstrua com uma nova direção?"

---

## APROVAÇÃO 2 — Após Designer

### Como apresentar o material visual

```
## 🎨 [Tipo da peça] visual pronto — [Nome do Cliente]

**Peça:** [descrição]
**Canal:** [onde vai ser publicado]
**Baseado na copy aprovada em:** [data ou referência]

[Apresentar o material — arquivo, imagem ou descrição detalhada]

---

**Para aprovar:** responda "Aprovado" — output final entregue.
**Para ajuste visual:** descreva o que mudar e reencaminho ao Designer.
**Para refazer a copy:** retornamos à etapa anterior.
```

---

### Interpretação de feedback visual

**"Aprovado"** → Entregue o output final. Salve o material em `clients/{cliente}/` se relevante.

**"Ajuste visual"** (cor, fonte, layout, proporção)
→ Rebriefing para Designer: descreva o ajuste com precisão
→ Inclua o material anterior como referência ("manter X, mudar Y para Z")
→ Reapresente

**"Refazer copy"**
→ Volte para Aprovação 1
→ Reconstrua briefing de Copywriting ou Social Media com o novo contexto
→ Reinicie o pipeline a partir da primeira skill

---

## Regras de reformatação no handoff

Antes de enviar para a próxima skill, o Account Manager deve reformatar o output recebido.

**O que fazer no reformatado:**
- Extrair o conteúdo aprovado (verbatim para o Designer)
- Adicionar especificações de canal e formato
- Incluir observações do usuário coletadas durante a aprovação
- Remover elementos internos da skill anterior (raciocínio, rascunhos, notas)
- Adicionar contexto estratégico relevante para a próxima skill
- Preencher campos obrigatórios do briefing da próxima skill

**O que não fazer:**
- Passar o output bruto de uma skill diretamente para outra
- Resumir ou parafrasear a copy aprovada (passe verbatim)
- Omitir feedback do usuário que impacte a produção
- Inventar informações que não estavam no output ou no contexto

---

## Calendário editorial — aprovação especial

Para calendários com múltiplas peças, a aprovação 1 funciona assim:

1. Social Media entrega documento único com todas as peças
2. Apresente o documento completo ao usuário
3. Peça que revise peça por peça e indique: ✅ aprovada / ✏️ ajuste / ❌ refazer
4. Para peças com ajuste: colete o feedback e reencaminhe para a Social Media revisar apenas aquelas
5. Para peças aprovadas: adicione à fila do Designer
6. Execute Designer uma peça por vez — não envie o lote completo

---

## Template de consolidação de feedback

Após coletar feedback de múltiplas peças:

```
## Consolidação de feedback — [Cliente] — [Data]

### Peças aprovadas (seguem para Designer):
- Peça 1: [título] ✅
- Peça 3: [título] ✅

### Peças em revisão:
- Peça 2: [título] — Feedback: "[feedback verbatim do usuário]"
  → Rebriefing: [o que será ajustado]

### Peças para refação:
- Peça 4: [título] — Nova direção: "[instrução do usuário]"
  → Novo briefing sendo construído
```
