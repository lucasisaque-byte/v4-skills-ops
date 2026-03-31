# V4 Skills Operations Platform — Briefing Técnico Completo

> **Para uso como contexto em sessões de IA.**
> Este documento descreve a arquitetura, regras de negócio, skills, fluxos e estrutura de dados da plataforma.
> Última atualização: 31/03/2026

---

## 1. O QUE É A PLATAFORMA

A **V4 Skills Operations Platform** é uma ferramenta interna de produção de marketing com IA, desenvolvida para times de marketing da V4 Company. Não é um chat — é uma fábrica de entregáveis onde cada feature mapeia diretamente para um pipeline de skills especializadas.

**O time não conversa com a IA. O time solicita entregáveis prontos.**

### Stack

| Camada | Tecnologia |
|--------|------------|
| Backend | FastAPI + Python 3.11 |
| LLM | OpenAI gpt-4o-mini (padrão) |
| Streaming | Server-Sent Events (SSE) |
| Frontend | Next.js 14 + TypeScript + Tailwind |
| Deploy | Railway (backend) + Vercel (frontend) |
| Storage | Sistema de arquivos (JSON local) |

---

## 2. ARQUITETURA GERAL

```
Usuário (browser)
       ↓
  [Next.js Frontend]
  - Seleciona cliente
  - Preenche formulário da feature
  - Exibe streaming em tempo real
       ↓
  [FastAPI Backend /generate/*]
       ↓
  [FASE 1 — Account Manager]
  - Recebe task + contexto completo do cliente
  - Lê: DCC, UCM, brand, design tokens
  - Produz: briefing estruturado JSON
    { skill_alvo, briefing, observacoes }
       ↓
  [FASE 2 — Skill Especializada]
  - System prompt: conteúdo do skills/{nome}/SKILL.md
  - User message: briefing do Account Manager
  - Output: texto streamado chunk por chunk
       ↓
  [Persistência]
  - Conteúdo acumulado salvo em outputs/{client_id}/entries.json
  - Máximo 30 entradas por cliente (rotação automática)
```

### Arquivos críticos do backend

```
api/
├── main.py                      # FastAPI app + registro de routers
├── routes/
│   ├── generate.py              # POST /generate/hooks, /copy, /calendar, /ads, /reel-script
│   ├── clients.py               # GET /clients, /clients/{id}, /clients/{id}/context
│   └── outputs.py               # GET /outputs, /outputs/client/{id}, /outputs/{id}
└── services/
    ├── orchestrator.py          # Account Manager — orquestra e faz briefing
    ├── skill_runner.py          # Carrega SKILL.md e executa com streaming
    ├── client_context.py        # Carrega DCC, UCM, brand do cliente
    └── output_store.py          # Persiste entregáveis em JSON
```

---

## 3. FLUXO TÉCNICO DETALHADO

### 3.1 Quando o usuário clica "Gerar"

```
POST /generate/hooks
{ client_id: "kce", theme: "expansão de franquia", platform: "Instagram" }

1. API carrega contexto: get_client_context("kce")
   → dcc.md, ucm.md, brand/identidade-visual.md, design-tokens.json

2. build_context_block(context) → bloco truncado:
   - DCC:          máx 12.000 chars
   - UCM:          máx  6.000 chars
   - Identidade:   máx  3.000 chars
   - Design System:máx  3.000 chars
   - Tokens:       máx  1.500 chars
   Total:          ~28.500 chars (~7.100 tokens)

3. orchestrate(task, "hook-engineer", context)
   System: ORCHESTRATOR_SYSTEM (hardcoded em orchestrator.py)
   User:   bloco de contexto + task
   → Retorna JSON: { skill_alvo, briefing, observacoes }

4. stream_skill("hook-engineer", briefing, None)
   System: conteúdo de skills/hook-engineer/SKILL.md
   User:   briefing do Account Manager
   → Yield chunks de texto via SSE

5. Ao finalizar: save_output(client_id, ..., full_content)
   → outputs/kce/entries.json (últimos 30)
```

### 3.2 SSE — eventos no frontend

```
data: {"event":"__AM_START__"}           → AM começou
data: {"event":"__AM_DONE__{json}"}      → AM terminou, skill escolhida
data: {"event":"__SKILL_START__"}        → Skill começou
data: {"text":"HOOK 1 — CONTRARIANTE"}   → Chunk de texto
data: {"text":"\n\"Todo mundo...\""}     → Chunk de texto
data: [DONE]                             → Finalizado
```

### 3.3 Problema atual: AM usa prompt hardcoded

O `ORCHESTRATOR_SYSTEM` em `orchestrator.py` é um prompt de 37 linhas genérico.
O arquivo `skills/account-manager/SKILL.md` (195 linhas, muito mais rico) **não é usado** pela API.
Isso é o principal gargalo de qualidade: o AM que roda na API não conhece pipelines, regras de handoff, gestão de aprovação ou os frameworks de briefing documentados.

---

## 4. SKILLS DISPONÍVEIS (18 especialistas IA)

Cada skill é uma pasta em `skills/{nome}/SKILL.md` carregada como system prompt.

### 4.1 Orquestradores

#### Account Manager (`skills/account-manager/SKILL.md`)
Cérebro do sistema. Não produz conteúdo final — decide, organiza, formata, conecta e despacha.

**Responsabilidades:**
- Identificar cliente e recuperar contexto salvo em `clients/{nome}/`
- Classificar a tarefa e decidir o pipeline correto
- Montar briefing de alta qualidade para a skill especializada
- Gerenciar aprovações (APROVAÇÃO 1 pós-criação, APROVAÇÃO 2 pós-design)
- Reformatar handoffs entre skills (nunca passa output bruto)
- Auditar dados de marketing/CRM
- Criar narrativas executivas de reuniões

**Mapa de pipelines:**
| Tarefa | Pipeline |
|--------|----------|
| Landing page completa | Copywriting → [APR 1] → Designer → [APR 2] |
| Copy de LP | Copywriting → [APR 1] → Output |
| Anúncio/Ads | Copywriting → [APR 1] → Designer → [APR 2] |
| Post avulso | Social Media → [APR 1] → Designer → [APR 2] |
| Carrossel | Social Media (hook + carousel) → [APR 1] → Designer → [APR 2] |
| Script/Reels | Social Media (hook + reels) → [APR 1] → Output |
| Calendário editorial | Social Media → [APR peça a peça] → Designer por peça |

**Referências internas (arquivos que o AM lê):**
```
skills/account-manager/
├── references/
│   ├── architecture/pipeline_map.md
│   ├── architecture/context_hierarchy.md
│   ├── architecture/client_memory.md
│   ├── playbooks/handoffs_approvals.md
│   ├── playbooks/audit_playbook.md
│   ├── capabilities/briefing_engineering.md
│   ├── capabilities/marketing_growth.md
│   ├── capabilities/commercial_crm.md
│   ├── capabilities/project_management.md
│   ├── capabilities/storytelling.md
│   ├── templates/briefing_copywriting.md
│   ├── templates/briefing_social_media.md
│   ├── templates/briefing_designer.md
│   ├── templates/approval_request.md
│   ├── templates/rebriefing.md
│   ├── templates/action_plan.md
│   └── templates/audit_crm_funnel.md
└── checklists/
    ├── quality_rubric.md
    └── anti_patterns.md
```

#### Social Media Manager (`skills/social-media-manager/SKILL.md`)
Orquestrador específico de social media. Roteia para 9 micro-skills:

| Demanda | Micro-skill acionada |
|---------|---------------------|
| Onboarding novo cliente | social-media-briefing-diagnostic |
| Definir pilares | editorial-pillar-planner |
| Calendário mensal | editorial-calendar-builder |
| Tendências/newsjacking | newsjacking-opportunity-finder |
| Variações de hook | hook-engineer |
| Roteiro Reel/TikTok | hook-engineer → reels-script-architect |
| Carrossel | hook-engineer → carousel-structure-designer |
| Stories | stories-sequence-builder |
| Brief para designer | creative-brief-for-design |
| Execução visual | social-media-designer |
| Diagnóstico métricas | social-content-performance-analyst |
| Padrões vencedores | winning-pattern-extractor |

---

### 4.2 Skills de Produção Criativa

#### Copywriting (`skills/copywriting/SKILL.md`)
Transforma DCC + UCM em copy persuasiva de LP, ads, e-mails, scripts SDR.

**Processo obrigatório antes de escrever:**
1. Diagnóstico de consciência — onde está o leitor no funil?
2. Identificar alavanca de decisão — medo? ambição? obrigação?
3. Papel no comitê de compra — champion, CFO, usuário técnico, bloqueador?
4. Mecanismo único — como a solução resolve diferente?
5. Framework — AIDA, PAS, BAB, StoryBrand, PPPP, Hook-Body-CTA

**Estrutura de LP entregue:**
```
HERO (promise + mecanismo + CTA)
PROVA SOCIAL (logos, dados, depoimentos)
PROBLEMA (agitação da dor)
SOLUÇÃO (mecanismo explicado)
BENEFÍCIOS (3-5 bullets)
FAQ (3-5 objeções reais)
CTA FINAL (urgência + botão)
```

**Auditoria pré-entrega:** 10 pilares — mínimo 8.5/10
(Clareza, Relevância, Especificidade, Prova, Diferenciação, Fricção zero, Fluxo, CTA, Tom, Objeções)

---

#### Hook Engineer (`skills/hook-engineer/SKILL.md`)
Gera 5 variações de hooks para máxima interrupção de scroll.

**5 tipos obrigatórios:**
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Contrariante | Nega crença aceita | "Todo mundo faz X errado" |
| Erro/Alerta | Aponta risco invisível | "Vai fazer X? Cuidado com Y" |
| Dado Surpreendente | Número contraintuitivo | "X% das pessoas não sabem que Y" |
| Lacuna de Curiosidade | Abre ciclo | "Existe um detalhe que ninguém te conta sobre X" |
| Tempo/Promessa | Resultado em prazo | "Em 3 passos você descobre X" |

**Benchmarks 2026:**
- Hook Rate >30% = saudável | >40% = elite
- Obrigatório: dissonância cognitiva, especificidade, urgência implícita, sem spoiler do conteúdo

**Output:** 5 hooks identificados por tipo + recomendação de qual testar primeiro

---

#### Reels Script Architect (`skills/reels-script-architect/SKILL.md`)
Roteiros de Reels/TikTok prontos para teleprompter (80–120 segundos).

**Estrutura mestre:**
```
HOOK    (0–5s)   → Máx 2 frases. Dissonância cognitiva. Sem revelar o final.
STORY   (5–70s)  → Identificação → Tensão → Revelação
OFFER   (70–90s) → Conexão com solução + CTA simples
```

**Regras de escrita:**
- Frases curtas (máx 15 palavras)
- Verbos no presente, voz ativa
- Uma ideia por frase
- Ritmo fluido para teleprompter

---

#### Carousel Structure Designer (`skills/carousel-structure-designer/SKILL.md`)
Carrosséis de alta performance para Instagram e LinkedIn.

**2 estilos:**
1. **Educacional:** Problema → Agitação → Valor fracionado (slides 3-6) → Síntese → CTA
2. **Storytelling/Newsjacking:** Capa → Fato → Análise (framework nomeado) → Lição → Negócio → CTA

**Regras:**
- Slide 1: capa com promise ou dissonância (lida em 2 segundos)
- Cada slide = uma ideia completa
- Fracionamento com tensão que força swipe
- Framework DEVE ter nome próprio (ex: "Efeito Contracorrente")
- CTA: próximo passo lógico, não virada abrupta para venda

**KPIs alvo:** Saves (referência), Shares (impacto emocional), Dwell Time >8s/slide

---

#### Creative Brief for Design (`skills/creative-brief-for-design/SKILL.md`)
Tradutor entre estratégia e execução visual. Produz brief técnico executável para designers e editores.

**2 tipos:**
- **Tipo A (Carrossel/Post):** Copy exato + instrução visual + referência por slide
- **Tipo B (Vídeo/Reel):** Fala + instrução de edição + legenda + efeitos por bloco

**Especificações técnicas:**
| Formato | Dimensão | Proporção |
|---------|----------|-----------|
| Instagram Feed | 1080×1350px | 4:5 |
| Instagram Reels | 1080×1920px | 9:16 |
| LinkedIn Post | 1200×628px | 1.91:1 |
| Meta Ads Feed | 1080×1350px | 4:5 |
| Meta Ads Stories | 1080×1920px | 9:16 |

---

#### Social Media Designer (`skills/social-media-designer/SKILL.md`)
Executor visual final. Gera HTML/CSS renderizável, exportável como PNG via html2canvas.

**Processo:**
1. Identificar cliente, ler `identidade-visual.md` (paleta hex, Google Fonts, versão logo)
2. Absorver copy + brief
3. Se necessário: gerar imagens via Nano Banana (Google Gemini Imagen) via API
4. Gerar HTML/CSS com design tokens em `:root`
5. Exportar em resolução real com botões por slide

**Princípios de design:**
- Tipografia expressiva (NUNCA Inter/Roboto/Arial genérico)
- Background com profundidade (gradient, noise, padrão geométrico — nunca sólido simples)
- Composição: assimetria intencional, overflow, sobreposição
- Dominância de cor: 60-70% cor primária da marca
- Anti-padrões: NÃO gradiente roxo genérico, NÃO layout simétrico sem contexto

---

### 4.3 Skills de Estratégia Editorial

#### Editorial Pillar Planner (`skills/editorial-pillar-planner/SKILL.md`)
Define 3-5 pilares editoriais estratégicos — teses de posicionamento da marca no social.

**5 dimensões de posicionamento:**
1. Quem eu sou (identidade) → Bastidores, cultura, valores
2. O que eu sei (autoridade) → Educação, frameworks, dados
3. O que eu acredito (posicionamento) → Opinião forte, contrastes
4. O que está acontecendo (relevância) → Tendências, notícias
5. O que eu ofereço (conversão) → Prova social, resultados

**Regra de composição:**
- Mín 1 pilar topo de funil (atenção/alcance)
- Mín 1 pilar meio de funil (engajamento/autoridade)
- Máx 1 pilar fundo de funil (conversão direta)

**Output por pilar:**
```
Pilar: [Nome]
Intenção: [o que o público deve sentir/saber/fazer]
Formatos ideais: [Reel / Carrossel / Post estático]
Tom: [tom específico deste pilar]
Ângulos recorrentes: [3-5 sub-temas]
Lógica de funil: [topo / meio / fundo]
Métricas: [views / saves / shares / comentários]
```

---

#### Editorial Calendar Builder (`skills/editorial-calendar-builder/SKILL.md`)
Grade editorial mensal — máquina de atenção programada.

**Premissas antes de construir:**
1. Pilares editoriais (3-5)
2. Frequência de posts/semana
3. Formatos disponíveis
4. Mês de referência
5. Objetivo (crescimento vs conversão)
6. Restrições (datas especiais, campanhas)

**Regra 80/20:**
- 80% topo de funil (atenção, audiência)
- 20% fundo de funil (conversão)

**Grade semanal padrão (3x/semana):**
| Dia | Formato | Pilar | Intenção |
|-----|---------|-------|----------|
| Segunda | Post estático | Inspiracional | Choque de realidade |
| Quarta | Carrossel | Educacional | Valor denso, saves |
| Sexta | Reels | Bastidores/Hot Topics | Alcance, shares |

**Output:**
```
| Data | Dia | Pilar | Formato | Hook Sugerido | Status |
| 01/04 | Seg | Inspiracional | Post | "..." | [ ] Pendente |
```

---

#### Newsjacking Opportunity Finder (`skills/newsjacking-opportunity-finder/SKILL.md`)
Monitora tendências e converte em pautas com ângulo de marca + timing.

**Janelas de timing:**
- Notícias de última hora: 4-6 horas
- Tendências culturais: 24-72 horas
- Movimentos de mercado: 3-7 dias

**Filtros obrigatórios:**
- ICP do cliente se importa?
- Ângulo de marca genuíno (não forçado)?
- Janela ainda aberta?
- Risco reputacional (política, religião)? → Eliminar automaticamente

**Fórmula do ângulo:**
```
[Evento] → [o que revela sobre o problema] → [posicionamento da marca]
```

---

#### Stories Sequence Builder (`skills/stories-sequence-builder/SKILL.md`)
Sequências de 3-5 stories com lógica própria (temporário, íntimo, sequencial, interativo).

**3 tipos:**
1. **Driver de Feed:** Problema → Dado → Solução resumida → "Corre ver no feed"
2. **Driver de Bio:** Problema → Agitação → Benefício → CTA bio/DM
3. **Engajamento:** Pergunta/provocação → Interação → Bastidor → Relacionamento

**Regras:** Máx 3 linhas/story, 1 ideia/story, tensão entre stories, variedade de formato

---

### 4.4 Skills de Análise

#### Social Content Performance Analyst (`skills/social-content-performance-analyst/SKILL.md`)
Interpreta métricas brutas em diagnóstico acionável.

**Hierarquia de métricas:**
1. **Retenção:** Hook Rate >30% (saudável) / >40% (elite), Hold Rate
2. **Valor Percebido:** Saves (referência), Shares (impacto), Comentários qualificados
3. **Negócio:** Leads via DM, cliques bio, conversões rastreadas
4. **Vaidade:** Curtidas, seguidores, impressões (contexto apenas — não são KPIs)

**Matriz de diagnóstico:**
| Hook Rate | Hold Rate | Saves/Shares | Diagnóstico |
|-----------|-----------|--------------|-------------|
| Alto | Alto | Alto | ✅ Vencedor — replicar |
| Alto | Baixo | Baixo | ⚠️ Hook bom, story fraca |
| Baixo | Alto | Alto | ⚠️ Audiência qualificada, otimizar distribuição |
| Baixo | Baixo | Baixo | ❌ Falhou em todas as etapas |

---

#### Winning Pattern Extractor (`skills/winning-pattern-extractor/SKILL.md`)
Extrai regras implícitas dos posts vencedores — destila em playbook reutilizável.

**6 dimensões analisadas:** Hook, Estrutura Narrativa, Formato, Pilar/Tema, CTA, Contexto/Timing

**Output:**
```
# Playbook de Padrões Vencedores — [Cliente]
Período: [datas] | Posts analisados: N | Vencedores: N

## Padrões Identificados (por dimensão)
## Regras Consolidadas (máx 10 regras operacionais)
## O Que NÃO Funcionou (anti-padrões)
## Hipóteses para Teste
## Próximos Passos
```

---

### 4.5 Skills de Marca

#### Brand Intel (`skills/brand-intel/SKILL.md`)
Extrai inteligência visual de sites, redes sociais e assets locais.

**4 fases:**
1. Extração CSS/tipografia/paleta via scraping
2. Screenshots de hero, footer, CTAs
3. Inventário de assets locais (logos, criativos)
4. Consolidação e inferência de personalidade/arquétipos

**Output:** `clients/{cliente}/brand/brand-raw.json` estruturado

---

#### Brand System Builder (`skills/brand-system-builder/SKILL.md`)
Transforma `brand-raw.json` em 3 documentos de design system.

**3 arquivos gerados:**
1. `identidade-visual.md` — Guia de marca completo
2. `design-system-social-media.md` — Sistema para conteúdo social
3. `design-tokens.json` — Variáveis CSS prontas

---

#### Social Media Briefing Diagnostic (`skills/social-media-briefing-diagnostic/SKILL.md`)
Onboarding de novo cliente — estrutura as 7 dimensões essenciais.

**7 dimensões:** Negócio e Oferta, ICP, Tom de Voz, Canais/Formatos, KPIs/Objetivo, Restrições, Histórico

**Output:** `briefing-estrategico-{cliente}.md` com as 7 dimensões preenchidas

---

## 5. ESTRUTURA DE DADOS DOS CLIENTES

### 5.1 Clientes em produção

| Cliente | ID | DCC | UCM | Brand | Status |
|---------|-----|-----|-----|-------|--------|
| KCE Logística | `kce` | ✅ 82KB | ✅ 114KB | ✅ completo | Completo |
| Via Journey | `via-journey` | ✅ | ✅ | ✅ completo | Completo |
| Alan | `alan` | ❌ | ✅ | ✅ parcial | Parcial |
| Eduzz | `eduzz` | ❌ | ✅ | ✅ parcial | Parcial |
| HS Prevent | `hs-prevent` | ✅ | ✅ | ❌ | Parcial |

### 5.2 Estrutura de pasta de cliente

```
clients/{client_id}/
├── dcc.md                           # Documento de Concepção de Copy
│                                    # Contém: modelo de negócio, personas detalhadas,
│                                    # dores, medos, desejos, nível de consciência,
│                                    # tom de voz, diferenciais, provas, objeções, oferta
│
├── ucm.md                           # Use Case Map
│                                    # Contém: Jobs-to-be-Done (funcionais, emocionais, sociais),
│                                    # forças de mudança (Push/Pull), ansiedades, inércias,
│                                    # alternativas de mercado, critérios de sucesso, jornada
│
└── brand/
    ├── brand-raw.json               # Extração de inteligência visual (Brand Intel)
    ├── identidade-visual.md         # Guia de marca (paleta hex, tipografia, logo, tom)
    ├── design-system-social-media.md # Sistema design para social media
    └── design-tokens.json           # CSS variables prontas (colors, fonts, spacing)
```

### 5.3 O que o DCC precisa conter (para contexto rico)

- Descrição do negócio e modelo de receita
- Personas detalhadas: cargo, empresa, dor primária, medo oculto, desejo de status, nível de consciência, papel no comitê de compra
- Tom de voz com exemplos (faz / não faz)
- Diferenciais reais vs concorrentes
- Provas e evidências (números, cases, depoimentos)
- Objeções mais comuns do ICP
- Estrutura de oferta (o que inclui, o que não inclui, garantias)

### 5.4 O que o UCM precisa conter (para contexto rico)

- Jobs-to-be-Done funcionais: o que o cliente tenta fazer
- Jobs emocionais: como quer se sentir
- Jobs sociais: como quer ser percebido
- Forças Push: o que tira da situação atual (dor, insatisfação, evento gatilho)
- Forças Pull: o que atrai para a solução (promessa, identidade, resultado esperado)
- Ansiedades: medos específicos sobre a solução
- Inércias: por que não muda agora
- Jornada: estágios do cliente de 0 ao sucesso

---

## 6. FEATURES DA PLATAFORMA WEB

Cada feature da plataforma mapeia para um endpoint de geração:

### 6.1 Hook Engineer (`/workspace/hooks`)
**Endpoint:** `POST /generate/hooks`
**Inputs:** cliente, tema do post, plataforma (Instagram/LinkedIn/TikTok)
**Output:** 5 variações de hook identificadas por tipo
**Skill:** `hook-engineer`

### 6.2 Copy de Landing Page (`/workspace/copy`)
**Endpoint:** `POST /generate/copy`
**Inputs:** cliente, campanha (opcional), persona foco, formato (structured/html)
**Output:** Copy estruturada com todas as seções de LP
**Skill:** `copywriting`

### 6.3 Calendário Editorial (`/workspace/social`)
**Endpoint:** `POST /generate/calendar`
**Inputs:** cliente, mês, frequência, plataformas, objetivo, pilares (auto/manual)
**Output:** Tabela de calendário mensal com datas, pilares, formatos e hooks
**Skill:** `editorial-calendar-builder`

### 6.4 Criativo de Ads (`/workspace/ads`)
**Endpoint:** `POST /generate/ads`
**Inputs:** cliente, objetivo (leads/awareness/conversão), plataforma, oferta, tom
**Output:** Copy (Hook + Headline + CTA) + brief técnico + HTML/CSS do criativo
**Skill:** `social-media-designer`

### 6.5 Script de Reels (`/workspace/scripts`)
**Endpoint:** `POST /generate/reel-script`
**Inputs:** cliente, hook aprovado, tema, plataforma
**Output:** Roteiro completo (HOOK + STORY + OFFER) com marcações de cena + legenda + hashtags
**Skill:** `reels-script-architect`

### 6.6 Brand System (`/workspace/brand`)
**Endpoint:** `POST /generate/hooks` (reutilizado com prompt customizado)
**Inputs:** URL do site, Instagram, LinkedIn, contexto adicional
**Output:** brand-raw.json + identidade-visual.md + design-system-social-media.md + design-tokens.json
**Skill:** `hook-engineer` (workaround — idealmente `brand-intel` + `brand-system-builder`)

---

## 7. REGRAS DE NEGÓCIO ATUAIS

### 7.1 Orquestração (Account Manager na API)

O AM na API usa um prompt simplificado hardcoded com estas regras:
- Analisar pedido + absorver contexto do cliente
- Produzir JSON: `{ skill_alvo, briefing, observacoes }`
- Máximo 600 palavras no briefing
- Ser específico: mencionar persona, tom de voz, diferencial, objeções
- Nunca genérico — o briefing deve soar como um especialista de marketing escreveu

**Skills disponíveis para o AM na API:**
- `hook-engineer` — hooks/ganchos
- `copywriting` — copy de LP
- `editorial-calendar-builder` — calendário editorial
- `social-media-designer` — criativo visual para ads
- `reels-script-architect` — roteiro de Reels/TikTok
- `brand-intel` — extração de identidade visual

### 7.2 Limite de tokens por chamada

| Chamada | Modelo | Max tokens |
|---------|--------|------------|
| Account Manager (briefing) | gpt-4o-mini | 1.500 output |
| Skill especializada (output) | gpt-4o-mini | 8.096 output |
| Contexto injetado | — | ~7.100 tokens input |

**Por que gpt-4o-mini:** Limite de 200k TPM (vs 30k do gpt-4o) no Tier 1 da OpenAI. Variável `OPENAI_MODEL` sobrescreve se necessário.

### 7.3 Persistência

- Máximo 30 outputs por cliente
- Rotação automática (mais antigos removidos)
- Armazenamento em `outputs/{client_id}/entries.json`
- **Problema:** filesystem do Railway é efêmero — histórico some a cada novo deploy
- **Solução planejada:** migrar para Supabase (PostgreSQL)

---

## 8. GAPS E OPORTUNIDADES DE MELHORIA

### 8.1 Críticos (impacto direto na qualidade dos outputs)

1. **AM usa prompt genérico hardcoded**
   O `skills/account-manager/SKILL.md` rico não é usado pela API. Conectar esse arquivo ao orquestrador melhoraria drasticamente a qualidade dos briefings.

2. **Skill especializada não recebe contexto do cliente**
   Após a correção de tokens, a skill recebe apenas o briefing do AM. Se o AM fez um briefing fraco, a skill não consegue compensar. Uma solução seria passar um contexto resumido diretamente para a skill também.

3. **Brand feature usa skill errada**
   O workspace de Brand usa o endpoint `/generate/hooks` com prompt customizado. Deveria usar `brand-intel` + `brand-system-builder` em pipeline dedicado.

4. **Clientes parciais (Alan, Eduzz, HS Prevent)**
   Sem DCC completo, o AM não tem insumo estratégico suficiente para montar um briefing de qualidade.

### 8.2 Estruturais

5. **Persistência efêmera no Railway**
   Histórico some a cada deploy. Migrar para Supabase resolve definitivamente.

6. **Sem feedback loop**
   Não há como o usuário aprovar/rejeitar/refinar um output e esse feedback voltar para o pipeline. O AM no SKILL.md tem protocolo de aprovação, mas a API não implementa.

7. **Pipeline de um passo só**
   A plataforma web executa cada feature em um único pass. O SKILL.md do AM descreve pipelines multi-step (Copywriting → aprovação → Designer), mas a API não suporta ainda.

### 8.3 Menores

8. Sem rate limiting ou circuit breaker
9. `_display_name()` usa mapping hardcoded — novos clientes não aparecem com nome bonito automaticamente
10. Truncagem de contexto é fixa — poderia ser dinâmica baseada no tamanho real dos docs

---

## 9. VARIÁVEIS DE AMBIENTE (Railway)

```
OPENAI_API_KEY=sk-proj-...      # Obrigatório
ANTHROPIC_API_KEY=sk-ant-...    # Instalado, não ativo
NANO_BANANA_API_KEY=...         # Google Gemini Imagen (geração de imagens)
NANO_BANANA_API_URL=...         # Endpoint da API de imagem
# OPENAI_MODEL não deve existir como variável — default é gpt-4o-mini no código
```

---

## 10. DEPLOY E INFRAESTRUTURA

```
GitHub (main branch)
    ↓ push automático
Railway (backend)
    - Detecta Python 3.11 via runtime.txt
    - Instala requirements.txt
    - Executa: python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000
    - URL: v4-skills-ops-production.up.railway.app

Vercel (frontend)
    - Detecta Next.js em platform/
    - Build: next build
    - Variável: NEXT_PUBLIC_API_URL=https://v4-skills-ops-production.up.railway.app
    - URL: v4-skills-ops.vercel.app (ou customizada)
```

---

## 11. CONTEXTO ESTRATÉGICO DO PRODUTO

**Quem usa:** Times de marketing de clientes da V4 Company

**Objetivo:** Produzir entregáveis de marketing de alta performance (hooks, copy, criativos, calendários, scripts) com velocidade e consistência de especialista, mantendo o contexto e identidade de cada cliente

**Diferencial:** Não é um chat genérico. Cada geração carrega automaticamente o DCC, UCM e brand system do cliente selecionado — os outputs são específicos para aquele cliente, não genéricos

**Fluxo de trabalho esperado:**
1. Profissional de marketing seleciona o cliente
2. Escolhe a feature (Hook, Copy, Calendário, etc.)
3. Preenche inputs mínimos (tema, plataforma, objetivo)
4. Recebe o entregável em tempo real
5. Copia, baixa ou refina

**O que a plataforma NÃO faz (ainda):**
- Publicar diretamente nas redes sociais
- Ciclo de aprovação multi-step dentro da interface
- Análise de performance com dados reais
- Geração de imagens visuais renderizadas como arquivo final
