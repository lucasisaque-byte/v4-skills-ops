# ADR 0001 — Repository Structure: Modular Monolith + Bounded Contexts

**Status:** Accepted  
**Date:** 2026-04-01  
**Supersedes:** docs/adr/001-agent-v0-architecture.md

---

## Contexto

O projeto V4 Skills Ops evoluiu rapidamente de um script inicial (protótipo com Anthropic SDK em `agent/`) para uma plataforma completa com backend FastAPI, workflow engine stateful, 18 skills especializadas e frontend Next.js.

Essa evolução rápida gerou:
- Coexistência de duas gerações de arquitetura sem separação clara
- Artefatos de cliente misturados com código de produto
- Workspace pessoal (Obsidian) commitado em `clients/`
- Um nested git repo não declarado em `outputs/`
- Scripts utilitários de cliente na raiz do projeto
- Documentação estratégica na raiz como arquivo solto
- Duplicidades de dados sem controle de versão

---

## Problema

O repositório não refletia os bounded contexts naturais do sistema, dificultando:
1. Compreensão de responsabilidades por pasta
2. Evolução do código sem medo de corromper contexto de cliente
3. Onboarding de novos colaboradores
4. Governança de skills e templates
5. Evolução segura em direção a separação de módulos

---

## Decisão

### Estrutura adotada

```
v4-skills-ops/
├── api/          ← Delivery Layer (BC4: Platform Delivery)
├── platform/     ← Delivery Layer — Web (BC4)
├── skills/       ← Knowledge Base (BC3: Skill Knowledge Base)
├── clients/      ← Client Context (BC5)
├── docs/         ← Knowledge & Documentation (BC7)
├── archive/      ← Histórico, protótipos, workspace pessoal
├── tooling/      ← Scripts e automações de suporte
├── outputs/      ← Output store legado (BC6 transitório)
└── data/         ← Runtime data de workflows (BC6 permanente — não commitado)
```

### Bounded contexts identificados e mapeados

| BC | Responsabilidade | Localização atual |
|----|-----------------|------------------|
| BC1 — Workflow Orchestration | WorkflowRun, engine, templates, gramática | `api/workflow/`, `api/models/` |
| BC2 — Skill Runtime | Execução e streaming de skills | `api/services/skill_runner.py` |
| BC3 — Skill Knowledge Base | SKILL.md e referências | `skills/` |
| BC4 — Platform Delivery | HTTP endpoints e UI web | `api/routes/`, `platform/` |
| BC5 — Client Context | DCC, UCM, brand por cliente | `clients/` |
| BC6 — Artifact Store | Persistência de outputs e workflow runs | `outputs/`, `data/` |
| BC7 — Knowledge & Documentation | Docs arquiteturais e de produto | `docs/` |

---

## Consequências

### Positivas
- Raiz do projeto limpa (13 entradas, todas com propósito claro)
- `clients/` sem contaminação de workspace pessoal ou código de produto
- Protótipo abandonado isolado em `archive/` com traçabilidade
- Nested git repo resolvido antes de causar problema em CI/CD
- Duplicidade de DCC do KCE eliminada (risco de uso da versão errada removido)
- LP Via Journey consolidada em `clients/via-journey/output/lp-b2b/` (única localização)
- `.gitignore` cobre `data/` (runtime), `__pycache__/`, arquivos Obsidian

### Trade-offs
- BC1 (Workflow Orchestration) ainda está dentro de `api/` — não foi extraído para `packages/` nesta fase para evitar risco de quebra de imports e deploy
- `outputs/` (BC6 legado) coexiste com `data/` (BC6 runtime) — consolidação depende de migração para Supabase
- `api/services/orchestrator.py` é lógica de domínio dentro da camada de entrega — correto refatorar para `packages/workflow-engine/` em fase futura

### Dívidas técnicas registradas
- **ST-001:** Migração de `data/` + `outputs/` para Supabase (WorkflowRuns efêmeros no Railway)
- **ST-002:** Extração de `api/workflow/` e `api/models/workflow.py` para `packages/workflow-engine/`
- **ST-003:** `skills/social-media-manager/` não integrado como workflow template — documentado em PLATFORM_BRIEFING.md como gap

---

## Alternativas consideradas

### Monorepo com `apps/` e `packages/`
Mover `api/` → `apps/api/` e `platform/` → `apps/web/` com `packages/` separados para domínio.

**Rejeitado para esta fase:** Alto risco de quebrar Procfile (Railway) e configuração do Vercel sem benefício funcional imediato. Marcado como Fase 4 opcional no restructure-plan.md.

### Manter estrutura atual com apenas limpeza cosmética
**Rejeitado:** Não resolve os problemas estruturais de coexistência de responsabilidades diferentes.

---

## Referências

- `docs/product/repository-audit.md`
- `docs/product/repository-classification.json`
- `docs/product/restructure-plan.md`
- `docs/product/restructure-preflight.md`
- `docs/product/migration-log.md`
