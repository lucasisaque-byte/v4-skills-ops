# Capacidade: Comercial, Revenue e CRM

## Para que serve esta capacidade

O Account Manager não é só um produtor de briefings de marketing. Ele também audita a operação comercial — lê CRM, analisa pipeline, identifica gargalos entre marketing e vendas, e gera diagnósticos com plano de ação.

Essa capacidade é acionada quando o usuário traz dados de CRM, pipeline, taxas de conversão por etapa, relatórios comerciais ou pede diagnóstico da operação de vendas.

---

## Vocabulário essencial do funil comercial

### Etapas do funil (do marketing ao fechamento)

```
[Lead gerado] → [Contato realizado] → [Qualificado] → [Reunião marcada]
→ [Reunião realizada] → [Proposta enviada] → [Negociação] → [Fechamento]
```

### Métricas por etapa

| Etapa | Métrica | O que mede |
|-------|---------|------------|
| Lead gerado → Contato | Taxa de contato | Eficiência operacional do SDR |
| Contato → Qualificado | Taxa de qualificação | Qualidade do lead / script de qualificação |
| Qualificado → Reunião marcada | Taxa de agendamento | Força do pitch / proposta de valor do SDR |
| Reunião marcada → Realizada | Taxa de comparecimento | Qualidade da qualificação / geração de antecipação |
| Reunião → Proposta | Taxa de avanço | Condução da reunião / fit real do produto |
| Proposta → Fechamento | Taxa de fechamento | Engenharia de oferta / tratamento de objeções |
| Lead gerado → Cliente | Taxa de conversão geral | Saúde do funil completo |

---

## SLA Marketing → Vendas

O SLA (Service Level Agreement) entre marketing e vendas define:

- **Tempo máximo do primeiro contato:** entre o lead ser gerado e o SDR entrar em contato
- **Taxa de aproveitamento de leads:** % dos leads recebidos que foram efetivamente trabalhados
- **Feedback de qualidade:** % dos leads classificados como SQL (qualificados) vs. não qualificados
- **Volume mínimo por período:** quantos leads marketing precisa entregar para vendas bater a meta

Quando o SLA está quebrado, os sintomas são:
- Leads "esfriando" antes do primeiro contato
- Vendas reclamando que os leads são ruins (sem dados de qualidade para embasar)
- Marketing sem feedback para melhorar o targeting

---

## Como ler um CRM

Ao receber dados de CRM, extraia:

1. **Volume total por etapa** — quantos negócios estão em cada fase
2. **Tempo médio por etapa** — onde os negócios ficam parados
3. **Taxa de conversão entre etapas** — onde há queda proporcional maior
4. **Distribuição de responsáveis** — há concentração em um SDR ou closer?
5. **Origem dos leads que mais convertem** — qual canal gera melhor qualidade
6. **Motivos de perda** — por que negócios caem em cada etapa

---

## Diagnóstico de gargalos comerciais

### Gargalo 1 — Baixa taxa de contato
**Sintoma:** Muitos leads gerados, poucos contatos realizados
**Causas prováveis:**
- Tempo do primeiro contato muito longo (lead esfriou)
- Volume acima da capacidade da equipe
- Dados de contato com baixa qualidade (telefone errado, empresa errada)
- Falta de cadência estruturada

**Ação:** Revisão de SLA de primeiro contato + estrutura de cadência (quantas tentativas, em qual canal, em qual intervalo)

---

### Gargalo 2 — Baixa taxa de agendamento
**Sintoma:** Muitos contatos, poucas reuniões marcadas
**Causas prováveis:**
- Pitch inicial fraco — proposta de valor não é clara
- Abordagem errada para o perfil do lead
- Timing inadequado da ligação
- Persona errada sendo abordada (não é o decisor)

**Ação:** Revisão de script de abertura + qualificação da persona + possível rebriefing de Copywriting para material de SDR

---

### Gargalo 3 — Baixa taxa de comparecimento
**Sintoma:** Reuniões marcadas mas não realizadas
**Causas prováveis:**
- Lead não qualificado (não tinha interesse real, disse sim para encerrar a ligação)
- Sem confirmação ou geração de antecipação antes da reunião
- Reunião marcada muito longe da data do contato inicial

**Ação:** Revisão do processo de qualificação + sequência de confirmação (e-mail/WhatsApp 48h, 24h e 2h antes)

---

### Gargalo 4 — Baixa taxa de fechamento
**Sintoma:** Muitas reuniões, poucos fechamentos
**Causas prováveis:**
- Proposta comercial mal estruturada
- Objeções não tratadas (preço, prazo, confiança)
- Decisor errado na reunião (sem poder de compra)
- Ciclo de vendas longo por falta de urgência criada

**Ação:** Revisão de proposta + mapeamento de objeções + possível rebriefing de Copywriting para proposta comercial

---

### Gargalo 5 — Ciclo de vendas muito longo
**Sintoma:** Negócios ficam presos no pipeline por semanas sem avançar
**Causas prováveis:**
- Muitos decisores no comitê de compra (processo B2B complexo)
- Falta de follow-up estruturado
- Proposta sem urgência real
- Concorrência ativa disputando a mesma oportunidade

**Ação:** Mapa de decisores + cadência de follow-up + engenharia de urgência na proposta

---

## Quando despachar para outra skill após auditoria comercial

| Diagnóstico encontrado | Skill recomendada | O que briefar |
|------------------------|-------------------|---------------|
| Script de SDR fraco | Copywriting | Script de cold call / e-mail de prospecção com novo hook |
| Proposta comercial fraca | Copywriting | Rewrite da proposta com engenharia de oferta |
| Sequência de nurturing ausente | Social Media + Copywriting | Conteúdo para aquecer leads entre etapas do funil |
| Página de objeções / FAQ fraca | Copywriting | Seção de objeções da LP ou material de vendas |
| Material de apresentação fraco | Designer | Deck de proposta ou apresentação comercial |

---

## Output padrão de auditoria comercial

```
## Diagnóstico Comercial — [Cliente] — [Período]

### Contexto analisado
[Dados fornecidos, período, fontes]

### Funil atual
| Etapa | Volume | Taxa de conversão | Benchmark esperado |
|-------|--------|-------------------|--------------------|
| Lead → Contato | X | X% | X% |
| Contato → Reunião | X | X% | X% |
| Reunião → Proposta | X | X% | X% |
| Proposta → Fechamento | X | X% | X% |

### Gargalos identificados
[Lista priorizada por impacto]

### Evidências
[Dados que sustentam cada gargalo]

### Hipóteses
[Por que esses gargalos existem]

### Impacto esperado se corrigidos
[Estimativa de melhoria — conservadora]

### Plano de ação
| Ação | Responsável | Prazo | KPI de sucesso |
|------|-------------|-------|----------------|

### Skills recomendadas
[Quais skills acionar e com qual briefing]
```
