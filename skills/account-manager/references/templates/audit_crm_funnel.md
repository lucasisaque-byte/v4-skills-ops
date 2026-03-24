# Template — Auditoria de CRM e Funil

Use este template para estruturar o briefing de entrada quando o usuário solicitar uma auditoria, e também como estrutura do output do diagnóstico.

---

## Template de briefing de auditoria (entrada)

```
## BRIEFING DE AUDITORIA — [CLIENTE] — [DATA]

**Tipo de auditoria:** [marketing / vendas / CRM / funil completo]
**Período analisado:** [data início] a [data fim]

---

### Dados fornecidos
- [ ] Relatório de mídia (tráfego pago / orgânico)
- [ ] Dados de funil de conversão
- [ ] Pipeline de CRM
- [ ] Taxas por etapa comercial
- [ ] Relatório de leads (volume, origem, qualidade)
- [ ] Outros: [especificar]

---

### Objetivo da análise
[O que o usuário quer descobrir, resolver ou decidir com base nessa auditoria]

---

### KPIs prioritários
[Quais métricas são mais importantes para este cliente / momento]

---

### Contexto de negócio
[Situação atual do cliente — o que está acontecendo, qual a pressão ou oportunidade]

---

### Hipóteses do usuário
[O que o usuário já suspeita que está errado ou pode melhorar]

---

### Output esperado
[ ] Diagnóstico com gargalos identificados
[ ] Plano de ação priorizado
[ ] Recomendação de skill para ação
[ ] Comparativo com benchmarks de mercado
[ ] Outro: [especificar]
```

---

## Template de output de auditoria de marketing

```
## AUDITORIA DE MARKETING — [CLIENTE] — [Período]

### 1. Contexto
[Dados analisados, período, canais cobertos]

### 2. Panorama geral
[Números principais. O que está funcionando. O que não está.]

### 3. Funil de aquisição

| Etapa | Resultado | Benchmark | Status |
|-------|-----------|-----------|--------|
| Impressões | X | — | — |
| Cliques | X | — | 🟢/🟡/🔴 |
| CTR | X% | 1-3% (LinkedIn) | 🟢/🟡/🔴 |
| Visitas à LP | X | — | — |
| CVR (LP) | X% | 2-5% | 🟢/🟡/🔴 |
| Leads gerados | X | — | — |
| CPL | R$ X | meta: R$ X | 🟢/🟡/🔴 |

### 4. Gargalos identificados
[Lista priorizada por impacto no resultado]

- 🔴 **[Gargalo 1]:** [descrição + evidência]
- 🟡 **[Gargalo 2]:** [descrição + evidência]
- 🟡 **[Gargalo 3]:** [descrição + evidência]

### 5. Hipóteses
[Por que esses gargalos existem — causas prováveis]

### 6. Impacto estimado se corrigidos
[O que muda nos números — estimativa conservadora]

### 7. Plano de ação
→ Ver template em `references/templates/action_plan.md`

### 8. Skills recomendadas
[Quais skills acionar e com qual briefing específico]
```

---

## Template de output de auditoria comercial / CRM

```
## AUDITORIA COMERCIAL — [CLIENTE] — [Período]

### 1. Contexto
[Dados fornecidos, período, responsáveis cobertos]

### 2. Funil comercial atual

| Etapa | Volume | Taxa | Benchmark | Status |
|-------|--------|------|-----------|--------|
| Leads recebidos | X | — | — | — |
| Contatos realizados | X | X% | >80% | 🟢/🟡/🔴 |
| Qualificados | X | X% | >40% | 🟢/🟡/🔴 |
| Reuniões marcadas | X | X% | >30% | 🟢/🟡/🔴 |
| Reuniões realizadas | X | X% | >70% | 🟢/🟡/🔴 |
| Propostas enviadas | X | X% | >60% | 🟢/🟡/🔴 |
| Fechamentos | X | X% | >20% | 🟢/🟡/🔴 |

### 3. SLA Marketing → Vendas
- Tempo médio do primeiro contato: [X horas]
- Taxa de aproveitamento dos leads: [X%]
- Feedback de qualidade de lead: [X% qualificados / X% rejeitados]

### 4. Gargalos identificados
[Lista priorizada por impacto]

### 5. Hipóteses
[Causas prováveis de cada gargalo]

### 6. Impacto estimado
[O que muda com as correções]

### 7. Plano de ação
→ Ver template em `references/templates/action_plan.md`

### 8. Skills recomendadas
[Quais skills acionar — ex: Copywriting para novo script de SDR]
```
