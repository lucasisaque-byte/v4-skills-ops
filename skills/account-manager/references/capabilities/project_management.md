# Capacidade: Gestão de Projetos e Operação

## Para que serve esta capacidade

O Account Manager gerencia o fluxo de produção entre skills — e isso é gestão de projetos. Ele organiza backlog, prioriza demandas concorrentes, transforma reuniões em tarefas, coordena dependências e garante que nada caia entre as rachaduras do pipeline.

Esta capacidade é especialmente importante quando:
- O usuário tem múltiplas demandas simultâneas para o mesmo cliente
- Um entregável depende de outro (ex: Designer só pode iniciar após aprovação do Copy)
- Uma reunião gerou tarefas para mais de uma skill
- O usuário precisa saber o que está em andamento, o que está travado e o que é próximo passo

---

## Como organizar o backlog de produção de um cliente

Quando há múltiplas demandas ativas, organize em 3 colunas:

```
A FAZER                 EM ANDAMENTO           CONCLUÍDO
──────────────────      ──────────────────      ──────────────────
[ ] LP para campanha    [→] Copy da LP          [✅] Calendário abril
[ ] 3 ads de topo       [⏸] Aguard. aprovação   [✅] Post semana 1
[ ] Calendário maio     [→] Briefing Designer
```

Sinalize o status de cada item:
- `→` Em execução
- `⏸` Aguardando aprovação do usuário
- `🔴` Bloqueado (dependência não resolvida)
- `✅` Concluído

---

## Como transformar uma reunião em tarefas

Ao receber transcrição, ata ou anotações de uma reunião, extraia:

**1. Decisões tomadas** → Não geram tarefas, mas atualizam contexto
**2. Próximos passos mencionados** → Cada um vira uma tarefa
**3. Dúvidas em aberto** → Cada uma vira uma tarefa de esclarecimento
**4. Aprovações obtidas** → Desbloqueia tarefas que estavam aguardando

Para cada tarefa identificada, defina:
- O que fazer (ação específica)
- Quem faz (Account Manager, skill especializada, usuário, cliente)
- Quando (prazo ou dependência que precisa ser cumprida antes)
- Como medir (como saber que está concluído)

---

## Como coordenar dependências entre skills

O pipeline de produção tem dependências sequenciais que precisam ser gerenciadas:

```
Copywriting → [APROVAÇÃO 1] → Designer → [APROVAÇÃO 2] → Output
     |                             ↑
     └── output alimenta ──────────┘
         o briefing do Designer
```

Regras de dependência:
- Designer **nunca inicia** antes de Aprovação 1 ser concluída
- Social Media pode rodar **em paralelo** com Copywriting quando o escopo for diferente
- Para calendário editorial: Designer executa **uma peça por vez**, respeitando a fila de aprovação

---

## Como priorizar demandas concorrentes

Quando o usuário tem múltiplas solicitações ao mesmo tempo, use esta matriz:

| Critério | Peso | Como avaliar |
|----------|------|-------------|
| **Prazo externo** | Alto | Tem data de veiculação? Campanha começa quando? |
| **Dependência** | Alto | Outra coisa depende disso para começar? |
| **Impacto em resultado** | Alto | Afeta diretamente conversão ou receita? |
| **Esforço de produção** | Médio | Quanto tempo exige das skills? |
| **Urgência percebida** | Médio | O usuário indicou prioridade? |

Apresente a priorização sugerida ao usuário antes de executar, quando houver 3 ou mais demandas simultâneas.

---

## Comunicação de status ao usuário

Quando o usuário pedir um update sobre o que está em andamento:

```
## Status de produção — [Cliente] — [Data]

### Em andamento agora
- [Tarefa] → [Skill executando] → Previsão: [quando entrega]

### Aguardando sua aprovação
- [Tarefa] → [O que está esperando sua resposta]

### Fila — próximos na sequência
- [Tarefa] → [Bloqueado por: aprovação acima]
- [Tarefa] → [Ainda não iniciado — programado para depois]

### Concluído recentemente
- [Tarefa] ✅ [Data de conclusão]
```

---

## Sinais de que o fluxo está travado

Fique atento a estes padrões — eles indicam que algo precisa ser desbloqueado:

| Sinal | Causa provável | Ação |
|-------|---------------|------|
| Aprovação pendente há mais de 48h | Usuário não viu ou não priorizou | Reenviar com resumo mais curto |
| Designer esperando copy que não foi aprovada | Fluxo de aprovação não respeitado | Não acionar Designer até aprovação |
| Usuário pediu ajuste mas não especificou o que | Feedback ambíguo | Perguntar antes de rebriefar |
| Múltiplas demandas chegando sem prioridade | Backlog desorganizado | Apresentar lista e pedir priorização |
| Output de uma skill não usou output da anterior | Handoff foi feito sem reformatação | Corrigir o briefing e ressubmeter |

---

## Template de kickoff de projeto / campanha

Use no início de qualquer projeto novo para alinhar escopo e expectativas:

```
## KICKOFF — [CLIENTE] — [CAMPANHA / PROJETO] — [DATA]

### Escopo confirmado
[O que vai ser produzido — lista de entregáveis]

### O que não está no escopo
[O que foi explicitamente excluído para evitar scope creep]

### Dependências
[O que precisa existir antes de começar — aprovações, materiais, decisões]

### Sequência de execução
[Ordem das etapas e skills envolvidas]

### Datas-chave
| Marco | Data |
|-------|------|
| Briefing pronto | |
| Copy para aprovação | |
| Design para aprovação | |
| Entrega final | |
| Veiculação / publicação | |

### Critério de sucesso
[Como vamos saber que o projeto foi bem-sucedido]
```
