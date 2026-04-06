# Repository Audit — V4 Skills Ops Platform

> Auditoria estrutural completa executada em 2026-04-01  
> Metodologia: DDD + Modular Monolith + Hexagonal + Lente Operacional

---

## A. Resumo Executivo

### Leitura geral do estado atual

O repositório contém um produto real e funcional — não um protótipo. A plataforma possui um backend FastAPI maduro com workflow engine stateful, approval gates, rebrief, sistema de templates tipado e streaming SSE. O frontend Next.js reflete esses estados com fidelidade. Há 18 skills especializadas, 5 clientes com contexto estruturado e 7 workflow templates.

O problema não está na qualidade do código — está na **coexistência de duas gerações de arquitetura sem separação clara** e em **múltiplos artefatos gerados, documentos de planejamento e protótipos que poluem o fluxo de trabalho principal**.

O repositório foi construído iterativamente e evoluiu rápido. Isso deixou rastros:

- Um módulo `agent/` (protótipo inicial com Anthropic SDK) nunca foi removido, coexistindo com o sistema ativo (`api/`)
- Arquivos gerados para clientes (`index.html`, `export-slides.js`, `assets/`) foram commitados na raiz
- Um vault Obsidian foi criado dentro de `clients/`, misturando ferramenta pessoal com contexto operacional
- Dois sistemas de persistência existem em paralelo (`outputs/` e `data/`) com responsabilidades sobrepostas
- `outputs/via-journey/lp-b2b/` é um repositório git aninhado (`.git` próprio)
- Workflow templates e engine ficam dentro de `api/`, quando deveriam ser packages independentes do módulo de entrega
- `docs/` só tem 2 arquivos `.txt` — toda a documentação real está em `PLATFORM_BRIEFING.md` na raiz

### Principais problemas estruturais

1. **Repositório git aninhado em `outputs/via-journey/lp-b2b/`** — risco alto, pode causar problemas de push/pull
2. **Dois orquestradores** — `agent/orchestrator.py` (Anthropic SDK, abandonado) e `api/services/orchestrator.py` (OpenAI, ativo) coexistem sem distinção clara
3. **`data/` não existe no repo** mas `engine.py` persiste workflows lá — histórico de runs desaparece a cada clone
4. **Artefatos gerados na raiz** — `index.html` (LP Via Journey), `assets/` (imagens do cliente), `export-slides.js` (script utilitário de cliente) não pertencem à raiz
5. **Vault Obsidian em `clients/`** — arquivos `.obsidian/`, `Sem título.base`, `Sem título.canvas` são ferramentas pessoais commitadas
6. **KCE tem DCC duplicado** — `clients/kce/dcc.md` e `clients/kce/copywriting/kce-dcc.md` existem simultaneamente
7. **Workflow definitions dentro de `api/`** — `api/workflow/templates/`, `grammar.json` e `registry.py` são domínio de produto, não infraestrutura de API
8. **`PLATFORM_BRIEFING.md` na raiz** — documento de contexto para sessões de IA, não é um README do produto

### Principais ativos reaproveitáveis

- `api/workflow/engine.py` — workflow engine stateful com approval/rebrief bem implementado
- `api/models/workflow.py` — modelo de dados rico, bem tipado com Pydantic
- `api/workflow/templates/*.json` — 7 templates com gramática validada, altamente reaproveitáveis
- `skills/account-manager/` — skill mais rica do sistema, com 17 arquivos de referência
- `skills/copywriting/` — estrutura madura com checklists, estratégia e templates
- `platform/lib/api.ts` — cliente HTTP/SSE bem encapsulado
- `clients/_template/` — template de estrutura de cliente, base para padronização

### Principais riscos

- O nested git repo em `outputs/via-journey/lp-b2b/` pode corromper o histórico se não tratado antes de qualquer reestruturação
- A ausência de `data/` no `.gitignore` explícito significa que se alguém criar e commitar `data/`, dados de clientes podem vazar
- O módulo `agent/` usa Anthropic SDK mas está completamente desconectado da plataforma ativa — risco de confusão sobre qual sistema usar

---

## B. Mapa da Estrutura Atual

```
v4-skills-ops/
│
├── [RAIZ — MISTURA CRÍTICA]
│   ├── index.html              ← LP Via Journey gerada (artefato de cliente!)
│   ├── export-slides.js        ← Script utilitário para Via Journey (cliente-específico!)
│   ├── assets/                 ← Imagens do cliente Via Journey (artefato!)
│   ├── PLATFORM_BRIEFING.md    ← Contexto para sessões de IA (não é README)
│   ├── plano-execucao-v4-skills-ops.docx ← Planejamento estratégico
│   ├── proximos-passos-v4-skills-ops.html ← Roadmap HTML
│   ├── start.sh                ← Script de dev local (útil, mas deve ter instrução clara)
│   ├── Procfile                ← Deploy Railway (core infra)
│   ├── requirements.txt        ← Core infra
│   ├── runtime.txt             ← Core infra
│   ├── package.json            ← Apenas puppeteer (para export-slides.js!)
│   └── package-lock.json       ← (idem)
│
├── api/                        ← Backend FastAPI (CORE — entrega HTTP)
│   ├── main.py                 ← App entry point
│   ├── routes/                 ← Endpoints: generate, clients, outputs, workflow_runs
│   ├── services/               ← Orchestrator, skill_runner, client_context, output_store
│   ├── models/workflow.py      ← Domínio: WorkflowRun, RuntimePlan, StepRun, etc.
│   └── workflow/               ← Engine + Registry + Templates + Grammar
│       └── templates/*.json    ← 7 workflow templates (DOMÍNIO, não infra de API)
│
├── agent/                      ← PROTÓTIPO ABANDONADO (Anthropic SDK)
│   ├── orchestrator.py         ← Pipeline copy→designer→social (hardcoded, não integrado)
│   └── config.py               ← Keys para Anthropic (não usado em produção)
│
├── platform/                   ← Frontend Next.js (CORE — entrega web)
│   ├── app/(app)/              ← Rotas: dashboard, clients, workspace/*, producao, outputs
│   ├── components/             ← ApprovalPanel, RunSidebar, StreamOutput, etc.
│   └── lib/                    ← api.ts, store.ts, useWorkflowRun.ts
│
├── skills/                     ← Skills especializadas (CORE — domain knowledge)
│   ├── account-manager/        ← Orquestrador rico com 17 refs (não totalmente usado na API)
│   ├── copywriting/            ← Skill madura com checklists e templates
│   ├── brand-intel/            ← Extração de identidade visual
│   ├── brand-system-builder/   ← Construtor de design system
│   ├── social-media-manager/   ← Orquestrador de social (não integrado na API)
│   ├── frontend-design/        ← Skill com LICENSE.txt (origem externa?)
│   └── [11 outras skills]      ← hook-engineer, reels, carousel, stories, etc.
│
├── clients/                    ← Contexto de clientes (CORE — dados operacionais)
│   ├── .obsidian/              ← VAULT OBSIDIAN COMMITADO! (não pertence aqui)
│   ├── Sem título.base         ← Arquivo Obsidian (não pertence aqui)
│   ├── Sem título.canvas       ← Arquivo Obsidian (não pertence aqui)
│   ├── _template/              ← Template de estrutura (útil)
│   ├── kce/                    ← Cliente mais completo (DCC duplicado!)
│   │   ├── dcc.md              ← DCC na raiz do cliente
│   │   ├── copywriting/kce-dcc.md ← DCC duplicado em subfolder!
│   │   └── criativos/          ← Artefatos gerados (PNGs de ads, social media)
│   ├── via-journey/            ← Cliente completo com output/ e assets/
│   │   ├── output/             ← Artefatos gerados (HTMLs de carrossel, ads, slides)
│   │   └── Sem título          ← Arquivo Obsidian dentro do cliente!
│   ├── alan/                   ← Parcial (sem DCC)
│   ├── eduzz/                  ← Parcial (sem DCC)
│   └── hs-prevent/             ← Parcial (sem brand)
│
├── outputs/                    ← Output store legado (JSON entries por cliente)
│   └── via-journey/lp-b2b/     ← REPOSITÓRIO GIT ANINHADO! (tem .git próprio)
│       ├── .git                ← NESTED REPO — problema crítico
│       ├── index.html          ← LP Via Journey (duplicata da raiz!)
│       └── assets/             ← Assets duplicados
│
├── docs/                       ← Documentação (INSUFICIENTE — apenas 2 arquivos txt)
│   ├── arquitetura-agente-v4.txt ← Documento de arquitetura v1 (desatualizado)
│   └── skill-brand-design-system.txt ← Referência de skill (mal localizado)
│
└── [DATA/ — NÃO EXISTE NO REPO]
    └── clients/*/workflows/    ← Onde engine.py persiste WorkflowRuns (efêmero!)
```

---

## C. Classificação Detalhada

### Raiz do projeto

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `api/` | Backend FastAPI — core ativo da plataforma | KEEP_CORE | Manter, reorganizar internamente | Alta |
| `platform/` | Frontend Next.js — core ativo | KEEP_CORE | Manter | Alta |
| `skills/` | Skills especializadas — domínio central | KEEP_CORE | Manter, nenhum skill deve ser removido sem validação | Alta |
| `clients/` | Contexto operacional dos clientes | KEEP_CORE | Limpar arquivos Obsidian, normalizar estrutura | Alta |
| `outputs/` | Persistência legada de entregáveis | REFACTOR | Consolidar com `data/` em solução única | Alta |
| `agent/` | Protótipo inicial com Anthropic SDK, não integrado | ARCHIVE | Mover para `archive/prototypes/agent-v0/` | Alta |
| `docs/` | Documentação — quase vazia | REFACTOR | Expandir, reorganizar os arquivos existentes | Alta |
| `assets/` | Imagens do cliente Via Journey | MOVE | Mover para `clients/via-journey/brand/` | Alta |
| `index.html` | LP Via Journey gerada (artefato de cliente) | MOVE | Mover para `clients/via-journey/output/` | Alta |
| `export-slides.js` | Script utilitário para exportar slides Via Journey | MOVE | Mover para `tooling/scripts/` | Alta |
| `PLATFORM_BRIEFING.md` | Contexto estratégico para sessões de IA | MOVE | Mover para `docs/product/platform-briefing.md` | Alta |
| `start.sh` | Script de inicialização dev local | KEEP_SUPPORT | Manter na raiz (convenção) | Alta |
| `Procfile` | Configuração de deploy Railway | KEEP_SUPPORT | Manter na raiz (obrigatório Railway) | Alta |
| `requirements.txt` | Dependências Python | KEEP_CORE | Manter | Alta |
| `runtime.txt` | Versão Python para Railway | KEEP_SUPPORT | Manter na raiz | Alta |
| `package.json` / `package-lock.json` | Apenas puppeteer para `export-slides.js` | DELETE_CANDIDATE | Após mover export-slides.js, avaliar se puppeteer é necessário | Média |
| `plano-execucao-v4-skills-ops.docx` | Documento de planejamento estratégico | ARCHIVE | Mover para `docs/product/` ou pasta de planejamento | Alta |
| `proximos-passos-v4-skills-ops.html` | Roadmap HTML | ARCHIVE | Mover para `docs/product/` | Alta |
| `.mcp.json` | Configuração MCP (Claude Code) | KEEP_SUPPORT | Manter | Alta |
| `.python-version` | Versão Python para pyenv | KEEP_SUPPORT | Manter | Alta |
| `.vscode/` | Configurações VSCode | KEEP_SUPPORT | Manter | Alta |

### `api/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `api/main.py` | Entry point FastAPI | KEEP_CORE | Manter | Alta |
| `api/routes/generate.py` | Endpoints legados `/generate/*` | KEEP_SUPPORT | Manter para compatibilidade, futuramente deprecar | Alta |
| `api/routes/workflow_runs.py` | Endpoints principais do novo sistema | KEEP_CORE | Manter | Alta |
| `api/routes/clients.py` | CRUD de clientes | KEEP_CORE | Manter | Alta |
| `api/routes/outputs.py` | Histórico de outputs legado | KEEP_SUPPORT | Manter, mas consolidar com workflow runs futuramente | Alta |
| `api/services/orchestrator.py` | Orquestrador principal (usa SKILL.md) | KEEP_CORE | Manter | Alta |
| `api/services/skill_runner.py` | Executor de skills via OpenAI | KEEP_CORE | Manter | Alta |
| `api/services/client_context.py` | Carrega contexto do cliente | KEEP_CORE | Manter | Alta |
| `api/services/output_store.py` | Persistência legada em JSON | REFACTOR | Consolidar com engine de workflow futuramente | Média |
| `api/models/workflow.py` | Modelos Pydantic do domínio | KEEP_CORE | Mover para `packages/workflow-domain/` no futuro | Alta |
| `api/workflow/engine.py` | Workflow state machine | KEEP_CORE | Mover para `packages/workflow-engine/` no futuro | Alta |
| `api/workflow/registry.py` | Registry de templates | KEEP_CORE | Mover junto com engine | Alta |
| `api/workflow/grammar.json` | Gramática universal de templates | KEEP_CORE | Mover junto com templates | Alta |
| `api/workflow/templates/*.json` | 7 workflow templates | KEEP_CORE | Mover para `workflow-templates/` no nível do projeto | Alta |
| `api/__pycache__/` | Cache Python | DELETE_CANDIDATE | Adicionar ao .gitignore se não estiver | Alta |

### `agent/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `agent/orchestrator.py` | Protótipo v0 com Anthropic SDK (Claude) | ARCHIVE | Mover para `archive/prototypes/agent-v0/` | Alta |
| `agent/config.py` | Configuração Anthropic do protótipo | ARCHIVE | Junto com orchestrator | Alta |
| `agent/__init__.py` | Init do módulo | ARCHIVE | Junto com o módulo | Alta |

**Nota:** Este módulo nunca foi integrado à plataforma ativa. O `api/services/orchestrator.py` é o sistema real. O `agent/` representa a fase 1 pré-plataforma descrita no roadmap de `docs/arquitetura-agente-v4.txt`.

### `clients/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `clients/_template/` | Template de estrutura de cliente | KEEP_SUPPORT | Manter, expandir com brand/ | Alta |
| `clients/.obsidian/` | Configuração do vault Obsidian | DELETE_CANDIDATE | Remover, não pertence ao repositório | Alta |
| `clients/Sem título.base` | Arquivo de banco Obsidian | DELETE_CANDIDATE | Remover | Alta |
| `clients/Sem título.canvas` | Canvas Obsidian | DELETE_CANDIDATE | Remover | Alta |
| `clients/kce/dcc.md` | DCC do KCE (localização correta) | KEEP_CORE | Manter | Alta |
| `clients/kce/copywriting/kce-dcc.md` | DCC duplicado do KCE | MERGE | Verificar se é a mesma versão; remover redundância | Média |
| `clients/kce/copywriting/ucm-kce/` | UCM do KCE em subpasta não-padrão | REFACTOR | Consolidar em `clients/kce/ucm.md` seguindo padrão | Média |
| `clients/kce/criativos/` | Artefatos visuais gerados para KCE | MOVE | Mover para `clients/kce/output/` (padronizar com via-journey) | Alta |
| `clients/via-journey/output/` | Outputs gerados para via-journey | MOVE | Manter na pasta do cliente, mas separar de `outputs/` raiz | Alta |
| `clients/via-journey/Sem título` | Arquivo Obsidian dentro do cliente | DELETE_CANDIDATE | Remover | Alta |
| `clients/via-journey/brand/references/` | Pasta vazia ou com referências visuais | KEEP_SUPPORT | Manter se tiver conteúdo | Baixa |
| `clients/alan/` | Cliente parcial (só UCM + brand parcial) | KEEP_SUPPORT | Manter, sinalizar lacuna de DCC | Alta |
| `clients/eduzz/` | Cliente parcial (só UCM + brand parcial) | KEEP_SUPPORT | Manter | Alta |
| `clients/hs-prevent/posicionamento-estrategico.md` | Documento extra fora do padrão (dcc/ucm/brand) | KEEP_SUPPORT | Manter, mas documentar como extensão do padrão | Média |

### `outputs/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `outputs/.gitkeep` | Marcador para manter pasta no git | KEEP_SUPPORT | Manter ou remover quando `outputs/` for refatorado | Alta |
| `outputs/via-journey/lp-b2b/` | Subrepositório git com LP Via Journey | ARCHIVE | Remover como submodule; conteúdo duplica `index.html` na raiz e `clients/via-journey/output/` | Alta |
| `outputs/via-journey/lp-b2b/.git` | Git repo aninhado | DELETE_CANDIDATE | Tratar antes de qualquer operação de reestruturação | Alta |

### `docs/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `docs/arquitetura-agente-v4.txt` | Documento de arquitetura da v1 do agente | ARCHIVE | Mover para `docs/adr/` como decisão histórica | Alta |
| `docs/skill-brand-design-system.txt` | Referência da skill de brand system | MOVE | Mover para `skills/brand-system-builder/references/` | Alta |

### `skills/`

| Item | Interpretação | Classificação | Ação | Confiança |
|------|---------------|---------------|------|-----------|
| `skills/account-manager/` | Orquestrador rico com 17 arquivos de referência | KEEP_CORE | Manter, já usado como system prompt na API | Alta |
| `skills/copywriting/` | Skill com checklists, estratégia e templates | KEEP_CORE | Manter | Alta |
| `skills/social-media-manager/` | Orquestrador de social (documentado mas não integrado na API) | KEEP_CORE | Manter, integrar como workflow template | Alta |
| `skills/brand-intel/` | Extração de identidade visual | KEEP_CORE | Manter | Alta |
| `skills/brand-system-builder/` | Construtor de design system | KEEP_CORE | Manter | Alta |
| `skills/frontend-design/` | Skill com LICENSE.txt (origem possivelmente externa) | KEEP_SUPPORT | Verificar origem; manter se em uso | Baixa |
| `skills/hook-engineer/` | Hook engineer integrado na API | KEEP_CORE | Manter | Alta |
| `skills/reels-script-architect/` | Roteirista de Reels, integrado na API | KEEP_CORE | Manter | Alta |
| `skills/social-media-designer/` | Designer visual, integrado na API | KEEP_CORE | Manter | Alta |
| `skills/editorial-calendar-builder/` | Calendário editorial, integrado | KEEP_CORE | Manter | Alta |
| `skills/carousel-structure-designer/` | Carrossel, não integrado diretamente na API | KEEP_CORE | Manter, integrar em workflow de social | Alta |
| `skills/editorial-pillar-planner/` | Planejamento de pilares | KEEP_CORE | Manter | Alta |
| `skills/newsjacking-opportunity-finder/` | Newsjacking | KEEP_CORE | Manter | Alta |
| `skills/stories-sequence-builder/` | Stories | KEEP_CORE | Manter | Alta |
| `skills/creative-brief-for-design/` | Brief para designer | KEEP_CORE | Manter | Alta |
| `skills/social-content-performance-analyst/` | Análise de métricas | KEEP_CORE | Manter | Alta |
| `skills/winning-pattern-extractor/` | Extração de padrões | KEEP_CORE | Manter | Alta |
| `skills/social-media-briefing-diagnostic/` | Diagnóstico de onboarding | KEEP_CORE | Manter | Alta |

---

## D. Problemas Identificados

### D1. Repositório git aninhado (CRÍTICO)

`outputs/via-journey/lp-b2b/` possui um `.git/` próprio. Isso cria um submodule implícito sem declaração em `.gitmodules`. Consequências:
- Git pode tratar o diretório de forma inconsistente
- `git add .` pode não incluir o conteúdo interno
- Deploy no Railway pode falhar ou ignorar o conteúdo
- Clone do repo pode não incluir `outputs/via-journey/lp-b2b/`

**Ação necessária ANTES de qualquer reestruturação:** Remover o `.git` interno ou formalizar como submodule.

### D2. Dois orquestradores coexistindo

| Módulo | Stack | Status | Onde é usado |
|--------|-------|--------|--------------|
| `agent/orchestrator.py` | Anthropic Claude | Protótipo abandonado | Não integrado |
| `api/services/orchestrator.py` | OpenAI GPT-4o-mini | Sistema ativo | Todos os endpoints |

A classe `Orchestrator` em `agent/` tem pipeline Copywriting→Designer→Social com hardcoded `clients/social-media/SKILL.md` — que não existe (a skill é `social-media-manager`). Confirma abandono.

### D3. Dois sistemas de persistência paralelos

| Sistema | Onde escreve | Commitado? | Efêmero? |
|---------|-------------|-----------|---------|
| `output_store.py` | `outputs/{client_id}/entries.json` | Sim (arquivos gerados são commitados) | Não |
| `engine.py` (WorkflowRun) | `data/clients/{id}/workflows/.../workflow.json` | Não (`data/` não existe no repo) | Sim (some a cada clone) |

Os dois sistemas coexistem e o `workflow_runs.py` chama ambos (persiste no engine + chama `save_output` como fallback legado).

### D4. Artefatos gerados commitados na raiz

`index.html` é a Landing Page da Via Journey renderizada. `assets/` contém as imagens usadas por ela. `export-slides.js` é o script que exportou os slides do carrossel do cliente. Esses três itens não têm nada a ver com a infraestrutura do produto — são outputs de trabalho de um cliente.

O `package.json` raiz só existe por causa do `puppeteer` usado em `export-slides.js`. Isso cria confusão: o projeto parece ter duas stacks JS quando na verdade o `package.json` raiz é para um script utilitário de cliente.

### D5. Vault Obsidian commitado em `clients/`

Arquivos `.obsidian/`, `Sem título.base`, `Sem título.canvas` são de uma sessão de trabalho com Obsidian dentro da pasta `clients/`. Não têm valor para o produto. O mesmo vale para `clients/via-journey/Sem título`.

### D6. DCC duplicado para KCE

`clients/kce/dcc.md` e `clients/kce/copywriting/kce-dcc.md` — a API usa `_find_file()` com `rglob` e vai encontrar o primeiro match. Se as versões estiverem dessincronizadas, o sistema pode usar a versão errada silenciosamente.

### D7. Estrutura inconsistente entre clientes

| Cliente | dcc.md | ucm.md | brand/ | Padrão? |
|---------|--------|--------|--------|---------|
| kce | raiz + copywriting/ | raiz + ucm-kce/ | sim | Não |
| via-journey | raiz | raiz | sim | Sim |
| alan | ausente | raiz | parcial | Não |
| eduzz | ausente | raiz | parcial | Não |
| hs-prevent | raiz | raiz | ausente | Parcial |

### D8. `api/workflow/` é domínio, não infra de entrega

O workflow engine, os templates e a gramática são conceitos de domínio que não pertencem dentro do módulo de entrega `api/`. Hoje, qualquer outra entrega (ex: CLI, worker, agent autônomo) precisaria importar de dentro de `api/` para usar o engine — criando acoplamento indevido.

### D9. `docs/` quase vazio

O documento mais importante de todo o repositório (`PLATFORM_BRIEFING.md`, 710 linhas) fica na raiz. `docs/` tem apenas dois arquivos `.txt`. Toda a documentação de skills fica dentro das skills (o que é correto para referência operacional), mas não existe documentação arquitetural, ADRs, ou runbooks.

### D10. `skills/frontend-design/LICENSE.txt`

A presença de um arquivo de licença sugere que essa skill pode ter sido copiada de um repositório externo. Vale verificar a origem para garantir conformidade de uso.

---

## E. Bounded Contexts Propostos

Com base na análise do código e das responsabilidades reais do sistema:

### BC1 — Workflow Orchestration Domain
**O quê:** Tudo que define e gerencia o ciclo de vida de um workflow.  
**Inclui:** `WorkflowRun`, `StepRun`, `RuntimePlan`, engine de estado, approval/rebrief, `WorkflowTemplate`, gramática, registry, templates JSON.  
**Não inclui:** Execução de skills (BC2), entrega HTTP (BC4), contexto de cliente (BC5).  
**Hoje em:** `api/models/workflow.py`, `api/workflow/`

### BC2 — Skill Runtime
**O quê:** Carregamento, execução e streaming de skills especializadas.  
**Inclui:** `skill_runner.py`, `load_skill()`, `stream_skill()`, `build_context_block()`.  
**Não inclui:** Qual skill chamar (decisão do BC1), conteúdo das skills (BC3).  
**Hoje em:** `api/services/skill_runner.py`

### BC3 — Skill Knowledge Base
**O quê:** O conteúdo das skills — os SKILL.md e suas referências.  
**Inclui:** Todo o diretório `skills/`.  
**Não inclui:** Como as skills são executadas (BC2).  
**Hoje em:** `skills/`

### BC4 — Platform Delivery (API + Web)
**O quê:** Camada de entrega — HTTP endpoints, SSE, frontend Next.js.  
**Inclui:** `api/main.py`, `api/routes/`, `platform/`.  
**Não inclui:** Lógica de domínio (deve apenas delegar para BC1/BC2).  
**Hoje em:** `api/` (parcial), `platform/`

### BC5 — Client Context
**O quê:** Dados contextuais por cliente — DCC, UCM, brand, artefatos gerados.  
**Inclui:** `clients/`, `api/services/client_context.py`.  
**Não inclui:** Como esses dados são usados (BC1/BC2 decidem).  
**Hoje em:** `clients/`, `api/services/client_context.py`

### BC6 — Artifact Store
**O quê:** Persistência de artefatos gerados (outputs de workflows e steps).  
**Inclui:** `api/services/output_store.py`, `outputs/`, `data/` (quando criado).  
**Problema atual:** Dois sistemas de persistência sem separação clara.  
**Hoje em:** `api/services/output_store.py` (legado) + `api/workflow/engine.py` (embutido)

### BC7 — Knowledge & Documentation
**O quê:** Documentação arquitetural, runbooks, planejamento estratégico, briefings de produto.  
**Inclui:** `docs/`, `PLATFORM_BRIEFING.md`, `docs/arquitetura-agente-v4.txt`.  
**Hoje em:** Espalhado — raiz + `docs/`

---

## F. Estrutura-Alvo Proposta

```
v4-skills-ops/
│
├── apps/
│   ├── api/                           ← FastAPI — entrega HTTP pura
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── clients.py
│   │   │   ├── generate.py            ← legado /generate/* (compatibilidade)
│   │   │   ├── outputs.py             ← legado (a deprecar)
│   │   │   └── workflow_runs.py
│   │   └── services/
│   │       ├── client_context.py
│   │       ├── output_store.py        ← a consolidar com artifact-store
│   │       └── skill_runner.py
│   │
│   └── web/                           ← Next.js frontend
│       ├── app/
│       ├── components/
│       └── lib/
│
├── packages/
│   ├── workflow-engine/               ← BC1: state machine + approval + rebrief
│   │   ├── __init__.py
│   │   ├── engine.py
│   │   ├── models.py                  ← WorkflowRun, StepRun, RuntimePlan, etc.
│   │   └── orchestrator.py           ← plan_workflow(), _build_am_system_prompt()
│   │
│   ├── workflow-templates/            ← BC1: definições estáticas
│   │   ├── grammar.json
│   │   ├── registry.py
│   │   └── templates/
│   │       ├── landing-page-v1.json
│   │       ├── hooks-v1.json
│   │       ├── copy-lp-v1.json
│   │       ├── ads-creative-v1.json
│   │       ├── calendar-v1.json
│   │       ├── reel-script-v1.json
│   │       └── brand-system-v1.json
│   │
│   └── shared-kernel/                 ← Tipos e utilitários compartilhados
│       └── types.py
│
├── skills/                            ← BC3: knowledge base (sem alteração estrutural)
│   ├── account-manager/
│   ├── copywriting/
│   ├── brand-intel/
│   ├── brand-system-builder/
│   ├── social-media-manager/
│   ├── frontend-design/
│   ├── hook-engineer/
│   ├── reels-script-architect/
│   ├── social-media-designer/
│   ├── editorial-calendar-builder/
│   ├── editorial-pillar-planner/
│   ├── carousel-structure-designer/
│   ├── newsjacking-opportunity-finder/
│   ├── stories-sequence-builder/
│   ├── creative-brief-for-design/
│   ├── social-content-performance-analyst/
│   ├── winning-pattern-extractor/
│   └── social-media-briefing-diagnostic/
│
├── clients/                           ← BC5: contexto por cliente (estrutura normalizada)
│   ├── _template/
│   │   ├── dcc.md
│   │   ├── ucm.md
│   │   └── brand/
│   │       ├── identidade-visual.md
│   │       ├── design-system-social-media.md
│   │       └── design-tokens.json
│   ├── kce/
│   │   ├── dcc.md                     ← único DCC (remover duplicata)
│   │   ├── ucm.md                     ← único UCM (normalizar)
│   │   └── brand/
│   ├── via-journey/
│   │   ├── dcc.md
│   │   ├── ucm.md
│   │   └── brand/
│   ├── alan/
│   ├── eduzz/
│   └── hs-prevent/
│
├── generated/                         ← BC6: artefatos gerados (NÃO commitar conteúdo dinâmico)
│   ├── .gitignore                     ← ignorar tudo exceto .gitkeep
│   └── .gitkeep
│
├── data/                              ← WorkflowRuns em runtime (NÃO commitar)
│   └── .gitignore                     ← ignorar tudo
│
├── docs/                              ← BC7: documentação arquitetural
│   ├── product/
│   │   ├── platform-briefing.md       ← ← PLATFORM_BRIEFING.md movido
│   │   ├── repository-audit.md        ← este arquivo
│   │   ├── repository-classification.json
│   │   └── restructure-plan.md
│   ├── adr/
│   │   └── 001-agent-v0-to-api.md    ← docs/arquitetura-agente-v4.txt arquivado
│   └── runbooks/
│       └── deploy.md
│
├── tooling/
│   └── scripts/
│       └── export-slides.js           ← script utilitário movido da raiz
│
├── archive/                           ← histórico, não deve ser evoluído
│   └── prototypes/
│       └── agent-v0/                  ← agent/ atual movido
│           ├── orchestrator.py
│           └── config.py
│
├── Procfile                           ← obrigatório na raiz (Railway)
├── requirements.txt
├── runtime.txt
├── start.sh
├── .env.example
├── .gitignore
└── .mcp.json
```

**Nota sobre `apps/`:** A migração de `api/` → `apps/api/` e `platform/` → `apps/web/` quebra imports e a configuração do Vercel/Railway. Essa mudança de nível 1 é a de maior risco e deve ser a última. O `Procfile` e a config do Vercel precisam ser atualizados. Considere manter `api/` e `platform/` no nível raiz como opção conservadora se o risco for alto.

---

## G. Estratégia de Migração

### Fase 0 — Pré-requisitos (antes de qualquer mudança)

1. Resolver o nested git repo:
   ```bash
   # Opção A: desfazer o nested repo e manter apenas o conteúdo
   rm -rf outputs/via-journey/lp-b2b/.git
   git add outputs/via-journey/lp-b2b/
   
   # Opção B: remover completamente (conteúdo duplica clients/via-journey/output/)
   git rm -r --cached outputs/via-journey/lp-b2b/
   rm -rf outputs/via-journey/lp-b2b/
   ```
2. Confirmar que `data/` está no `.gitignore`
3. Confirmar que `__pycache__/` está no `.gitignore` (está, mas verificar cobertura)

### Fase 1 — Limpeza sem risco de quebra

Nada que altere imports ou configs de deploy.

- Remover `.obsidian/`, `Sem título.base`, `Sem título.canvas` de `clients/`
- Remover `clients/via-journey/Sem título`
- Mover `assets/` → `clients/via-journey/brand/assets/` (duplicata com `outputs/via-journey/lp-b2b/assets/`)
- Mover `index.html` → `clients/via-journey/output/lp-b2b.html`
- Mover `export-slides.js` → `tooling/scripts/`
- Criar `archive/prototypes/agent-v0/` e mover `agent/`
- Mover `PLATFORM_BRIEFING.md` → `docs/product/platform-briefing.md`
- Mover `docs/skill-brand-design-system.txt` → `skills/brand-system-builder/references/`
- Mover `docs/arquitetura-agente-v4.txt` → `docs/adr/001-agent-v0-architecture.md`
- Criar `docs/product/` (este audit, classification e plan)
- Mover `plano-execucao-v4-skills-ops.docx` e `proximos-passos-v4-skills-ops.html` → `docs/product/`

### Fase 2 — Normalização de `clients/`

- Consolidar DCC do KCE: verificar se `kce/dcc.md` e `kce/copywriting/kce-dcc.md` são iguais, manter apenas `kce/dcc.md`
- Normalizar UCM do KCE: mover `kce/copywriting/ucm-kce/` → `kce/ucm.md`
- Mover `kce/criativos/` → `kce/output/` (padronizar nomenclatura)
- Avaliar remoção de `package.json` raiz (após confirmar que `export-slides.js` é apenas utilitário off-platform)

### Fase 3 — Separação de workflow domain (opcional, mas recomendada)

- Criar `packages/workflow-engine/` e mover `api/workflow/engine.py`, `api/models/workflow.py`
- Criar `packages/workflow-templates/` e mover `api/workflow/templates/`, `grammar.json`, `registry.py`
- Mover `api/services/orchestrator.py` para `packages/workflow-engine/`
- Atualizar imports em `api/routes/workflow_runs.py` e `api/routes/generate.py`
- **RISCO:** quebra de imports em múltiplos arquivos — fazer com testes manuais de smoke test

### Fase 4 — Migração `api/` e `platform/` para `apps/` (opcional, maior risco)

- Requer atualização de: `Procfile`, variáveis do Vercel, `next.config.mjs`, tsconfig paths
- **Só fazer se os bounded contexts estiverem estáveis e os testes cobrirem os endpoints principais**
- Considerar manter `api/` e `platform/` no nível raiz como compromisso aceitável

---

## H. Decisões que Exigem Validação Humana

1. **O nested repo `outputs/via-journey/lp-b2b/`** — como tratar? Opção A (manter conteúdo sem .git) ou Opção B (remover, já que duplica `clients/via-journey/output/`)?

2. **`index.html` na raiz** — é a LP de produção que está sendo servida no Vercel? Se sim, mover quebra a URL. Verificar se o Vercel serve `index.html` da raiz ou se o frontend Next.js é o ponto de entrada.

3. **`assets/` na raiz** — idem acima. Se o `index.html` da raiz referenciar `./assets/`, mover juntos é seguro. Se estiver sendo referenciado por URL absoluta em algum lugar, mover pode quebrar.

4. **`package.json` raiz** — remover implica que `export-slides.js` não rodará mais com `npm install` simples. Alguém usa esse script regularmente? Se for processo ativo, manter com README explicativo.

5. **`agent/` — arquivar ou deletar?** O código é um protótipo abandonado, mas contém a lógica do pipeline v1 (Copy→Designer→Social em sequência com Anthropic). Tem valor histórico/referencial? Ou é seguro deletar?

6. **KCE DCC duplicado** — os arquivos `kce/dcc.md` e `kce/copywriting/kce-dcc.md` são a mesma versão? Qual é o mais atualizado? Sem ler o conteúdo de ambos, não é possível afirmar com certeza qual descartar.

7. **`skills/frontend-design/LICENSE.txt`** — qual é a licença? Há restrições de uso comercial?

8. **Migrar `api/` → `apps/api/`** — vale o risco de quebra de deploy? Ou manter na raiz é aceitável?

9. **Persistência de WorkflowRuns** — `data/` não existe no repo. Está sendo criado em runtime no Railway e some a cada redeploy? Se sim, o histórico de workflow runs já está sendo perdido em produção. Confirmar urgência de migração para Supabase.
