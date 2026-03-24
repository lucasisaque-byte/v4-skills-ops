# Playbook de Auditoria — Marketing, Vendas e CRM

## Quando usar este playbook

Ative este protocolo quando o usuário trouxer:
- Dados de mídia (relatórios de tráfego pago, orgânico, email)
- Funil de conversão (visitantes → leads → oportunidades → clientes)
- Dados de CRM (pipeline, taxas por etapa, volume de contatos)
- Solicitação de diagnóstico de performance
- Pedido de "onde estamos errando" ou "por que não está convertendo"

---

## Estrutura de output de auditoria

Todo diagnóstico deve seguir esta estrutura:

```
## Auditoria de [tipo] — [Cliente] — [Período]

### 1. Contexto analisado
O que foi fornecido, período, fontes de dados.

### 2. Panorama geral
Números principais. O que está funcionando. O que não está.

### 3. Gargalos identificados
Onde o funil quebra. Qual etapa tem a maior queda proporcional.

### 4. Evidências
Dados que sustentam cada gargalo identificado.

### 5. Hipóteses
Por que esses gargalos existem. Causas prováveis.

### 6. Impacto esperado
O que muda se esses gargalos forem resolvidos.

### 7. Plano de ação
Prioridade 1, 2, 3 — o que fazer, por quê, como medir.

### 8. Recomendação de próxima skill
Se alguma ação exige produção de conteúdo ou copy, qual skill acionar e com qual briefing.
```

---

## Auditoria de Marketing (Mídia e Funil de Aquisição)

### Métricas para analisar

**Topo de funil (aquisição):**
- Impressões, alcance
- CTR (taxa de clique)
- CPC (custo por clique)
- CPM (custo por mil impressões)
- Volume de sessões / visitas

**Meio de funil (conversão):**
- Taxa de conversão da LP (CVR)
- CPL (custo por lead)
- Taxa de preenchimento de formulário
- Tempo na página / taxa de rejeição

**Fundo de funil (qualificação):**
- Taxa de lead qualificado (MQL → SQL)
- Custo por oportunidade
- Taxa de agendamento de reunião

### Diagnóstico por gargalo

| Sintoma | Gargalo provável | Hipótese |
|---------|-----------------|----------|
| Alto CTR, baixa conversão na LP | Problema de LP ou oferta | Promessa do ad não reflete a LP; LP fraca |
| Baixo CTR | Problema de criativo ou targeting | Copy ou visual não interrompem; público errado |
| Muitos leads, baixa qualificação | Problema de mensagem ou segmentação | Promessa ampla demais; público inadequado |
| Custo por lead alto | Eficiência de campanha | Criativo cansado; leilão competitivo; LP fraca |

---

## Auditoria de Vendas / CRM

### Métricas para analisar

**Cadência e contato:**
- Taxa de contato (tentativas vs. contatos efetivos)
- Taxa de resposta (outbound)
- Tempo médio até primeiro contato (lead → SDR)

**Agendamento:**
- Taxa de agendamento (contatos → reuniões marcadas)
- Taxa de comparecimento (reuniões marcadas → realizadas)

**Fechamento:**
- Taxa de fechamento (oportunidades → clientes)
- Ciclo médio de vendas (dias entre primeiro contato e fechamento)
- Ticket médio
- Taxa de churn (se aplicável)

**SLA marketing-vendas:**
- Tempo entre lead gerado e primeiro contato do SDR
- Taxa de aproveitamento de leads (leads recebidos vs. trabalhados)
- Taxa de feedback de qualidade de lead (SQL vs. não qualificado)

### Diagnóstico por gargalo

| Sintoma | Gargalo provável | Hipótese |
|---------|-----------------|----------|
| Taxa de contato baixa | Operação / cadência | Dados de contato ruins; timing inadequado; volume insuficiente de tentativas |
| Taxa de agendamento baixa | Script / abordagem | Pitch fraco; proposta de valor não clara; timing errado da ligação |
| Taxa de comparecimento baixa | Qualificação ou preparo | Lead não qualificado; sem confirmação; sem geração de antecipação |
| Taxa de fechamento baixa | Proposta / objeção | Oferta mal estruturada; objeções não tratadas; decisor errado na mesa |
| Ciclo longo | Processo ou urgência | Falta de urgência; muitos decisores; processo interno do cliente |

---

## Quando despachar para outra skill

Após a auditoria, avalie se algum gargalo exige produção:

| Gargalo encontrado | Skill recomendada | Briefing sugerido |
|--------------------|-------------------|-------------------|
| LP com baixa conversão | Copywriting | Rewrite de LP com foco em objeções identificadas |
| Criativo cansado | Copywriting + Designer | Novo ângulo de ad baseado nos dados de performance |
| Script de SDR fraco | Copywriting | Script de cold call/email com novo hook |
| Conteúdo para nutrir leads | Social Media | Calendário de conteúdo para cada etapa do funil |
| Proposta comercial fraca | Copywriting | Rewrite da proposta com engenharia de oferta |
