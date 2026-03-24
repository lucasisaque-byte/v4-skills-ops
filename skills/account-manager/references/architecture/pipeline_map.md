# Mapa de Pipelines — Account Manager

## Como usar este arquivo
Após classificar a tarefa do usuário, localize o tipo abaixo e siga o pipeline correspondente.

---

## Pipelines de produção criativa

### Landing Page Completa
```
Input → Account Manager → [Briefing] → Copywriting
→ [APROVAÇÃO 1] → Account Manager → [Reformata] → Designer
→ [APROVAÇÃO 2] → Output Final
```
Contexto necessário: DCC, UCM ou equivalente, objetivo de campanha, persona, oferta, CTA

---

### Copy de LP Apenas
```
Input → Account Manager → [Briefing] → Copywriting
→ [APROVAÇÃO 1] → Output Final
```
Contexto necessário: mesmo da LP completa, sem necessidade de direção visual

---

### Anúncio / Ads (Meta, Google, LinkedIn)
```
Input → Account Manager → [Briefing] → Copywriting
→ [APROVAÇÃO 1] → Account Manager → [Reformata com specs do canal] → Designer
→ [APROVAÇÃO 2] → Output Final
```
Contexto necessário: canal, formato, persona, oferta, restrições de caracteres

---

### Post Avulso (Social Media)
```
Input → Account Manager → [Briefing] → Social Media
→ [APROVAÇÃO 1] → Account Manager → [Reformata] → Designer
→ [APROVAÇÃO 2] → Output Final
```
Contexto necessário: tema, rede social, persona, ângulo desejado, CTA

---

### Carrossel (LinkedIn, Instagram)
```
Input → Account Manager → [Briefing] → Social Media
→ [APROVAÇÃO 1] → Account Manager → [Reformata com estrutura slide a slide] → Designer
→ [APROVAÇÃO 2] → Output Final
```
Contexto necessário: tema, número de slides, tese central, CTA final

---

### Script de Vídeo / Reels
```
Input → Account Manager → [Briefing] → Social Media
→ [APROVAÇÃO 1] → Output Final
```
Nota: Designer não é acionado para scripts — apenas quando há necessidade de thumbnail ou arte de apoio.

---

### Calendário Editorial
```
Input → Account Manager → [Briefing] → Social Media
→ [Entrega documento com TODAS as peças]
→ [APROVAÇÃO 1 — peça por peça]
→ Peças aprovadas entram em fila
→ Account Manager → [Reformata peça 1] → Designer → [APROVAÇÃO 2] → Output peça 1
→ Account Manager → [Reformata peça 2] → Designer → [APROVAÇÃO 2] → Output peça 2
→ (repete para cada peça aprovada)
```
Contexto necessário: período do calendário, formatos solicitados, temas ou eixos temáticos, cliente

---

### Pack Completo (LP + Social + Ads)
```
Pipeline A (LP/Ads): Copywriting → [APROVAÇÃO 1] → Designer → [APROVAÇÃO 2]
Pipeline B (Social): Social Media → [APROVAÇÃO 1] → Designer → [APROVAÇÃO 2]
Execução: paralela ou sequencial conforme prioridade definida pelo usuário
```

---

## Pipelines analíticos e narrativos

### Auditoria de Marketing
```
Input (dados de mídia, relatórios, funil) → Account Manager
→ Diagnóstico + Hipóteses + Plano de Ação
→ [Opcional: despacho para Copywriting ou Social Media com recomendações]
```
Consulte: `references/capabilities/commercial_crm.md` + `references/playbooks/audit_playbook.md`

---

### Auditoria de Vendas / CRM
```
Input (pipeline, CRM, taxas de conversão) → Account Manager
→ Diagnóstico comercial + Gargalos + Plano de Ação
→ [Opcional: despacho para outra skill com briefing de correção]
```

---

### Storytelling de Reunião / Check-in
```
Input (transcrição, ata, anotações) → Account Manager
→ Narrativa executiva + Framing + Próximos Passos
→ Output Final (não requer aprovação formal — entregue diretamente)
```
Consulte: `references/capabilities/storytelling.md`

---

## Regras de roteamento

1. Classifique a tarefa ANTES de qualquer execução
2. Valide disponibilidade de contexto suficiente
3. Monte o briefing completo antes de acionar a skill
4. Identifique pontos de aprovação obrigatórios no pipeline escolhido
5. Nunca pule a aprovação para "ganhar tempo" — ela existe para evitar retrabalho maior
