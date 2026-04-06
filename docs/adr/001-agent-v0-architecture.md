
╔══════════════════════════════════════════════════════════════════════════════════════╗
║         ARQUITETURA DO AGENTE AUTÔNOMO — V4 COMPANY                                 ║
║         Agente de Produção de Marketing com Skills Especializadas                   ║
║         Versão 1.0 — Março 2026                                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VISÃO GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Um agente autônomo que orquestra skills especializadas para automatizar
a produção de materiais de marketing (landing pages, ads, conteúdo social)
com aprovação humana nos pontos críticos do fluxo.

Skills do sistema:
  · Account Manager  →  Orquestrador central (cérebro do agente)
  · Copywriting      →  Copy persuasiva para LP e Ads
  · Social Media     →  Pesquisa + copy + direção visual para conteúdo
  · Designer         →  Produção do material visual final


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 1 — INPUT DO USUÁRIO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O que o usuário fornece:

  · Prompt descrevendo a tarefa
    ex: "Crie uma landing page para o cliente X focada no CFO"

  · Documentos opcionais (qualquer formato de contexto)
    ex: DCC, UCM, briefing de campanha, referências, guia de marca

REGRA — Armazenamento automático:
  Todo documento novo enviado é salvo automaticamente na pasta
  do cliente correspondente e fica disponível para tarefas futuras.

  Estrutura de pastas:
  clients/
  ├── nome-do-cliente-a/
  │   ├── dcc.md
  │   ├── ucm.md
  │   └── outros-documentos/
  └── nome-do-cliente-b/
      └── ...


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 2 — ACCOUNT MANAGER (Orquestrador)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Papel: Cérebro do agente. Não produz conteúdo — decide, formata e conecta.

O que faz na entrada:
  1. Extrai o nome do cliente do prompt
  2. Busca documentos salvos na pasta do cliente (local + Google Drive)
  3. Ingere e salva os documentos novos enviados pelo usuário
  4. Mescla: contexto salvo + docs novos + instrução do prompt
  5. Identifica o tipo de tarefa solicitada
  6. Decide qual pipeline acionar
  7. Constrói o briefing ideal para a primeira skill

O que faz nos hand-offs entre skills:
  · Recebe o output de uma skill
  · Reformata e enriquece para o padrão da próxima skill
  · Adiciona especificações de canal, formato e referências visuais
  · Encaminha para a skill seguinte

Hierarquia de documentos (prioridade em caso de conflito):
  1º  Documento novo anexado no prompt  (mais específico)
  2º  Contexto salvo da pasta do cliente
  3º  Instrução do prompt do usuário


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 3 — MAPA DE DECISÃO DO ACCOUNT MANAGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tipo de tarefa identificada          Pipeline acionado
─────────────────────────────────────────────────────────────────
Landing Page completa           →    Copy  →  [APROVAÇÃO]  →  Designer
Copy de LP apenas               →    Copy  →  [APROVAÇÃO]  →  Output
Anúncio (Ads)                   →    Copy  →  [APROVAÇÃO]  →  Designer
Post avulso de conteúdo         →    Social →  [APROVAÇÃO]  →  Designer
Carrossel de conteúdo           →    Social →  [APROVAÇÃO]  →  Designer
Script de vídeo / Reels         →    Social →  [APROVAÇÃO]  →  Output
Calendário editorial            →    Social →  [APROVAÇÃO]  →  Designer (peça a peça)
Pack completo (LP + social)     →    Copy  →  [APROVAÇÃO]  →  Designer
                                     Social →  [APROVAÇÃO]  →  Designer (paralelo)

REGRA — Contexto incompleto:
  Nenhum documento encontrado   →  Agente pergunta ao usuário antes de prosseguir
  Contexto parcial              →  Executa e sinaliza as lacunas no output


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 4A — PIPELINE A: Landing Pages e Ads
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Acionado quando: usuário solicita LP, criativos de ads ou copy.

  [INPUT] → [ACCOUNT MANAGER] → [COPYWRITING] → [APROVAÇÃO 1] → [ACCOUNT MANAGER] → [DESIGNER] → [APROVAÇÃO 2] → [OUTPUT]


SKILL: COPYWRITING
  Recebe de:   Account Manager (briefing com contexto do cliente)
  O que faz:
    · Ingere DCC + UCM ou qualquer documento de contexto
    · Aplica frameworks: PAS, AIDA, BAB, PPPP, StoryBrand
    · Mapeia persona, awareness level e comitê de decisão
    · Produz copy completa da LP ou anúncio
    · Realiza auditoria interna (nota mínima 8.5/10)
  Entrega para: Account Manager (para aprovação do usuário)

  Output entregue ao usuário:
    · Hero Section (headline + subheadline + CTA)
    · Seção Problema (agitação da dor)
    · Seção Solução (mecanismo único)
    · Benefícios (bullets benefit-first)
    · Prova Social (framework de depoimentos e dados)
    · FAQ (objeções respondidas)
    · CTA Final (urgência + resumo de valor)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 4B — PIPELINE B: Conteúdo Social Media
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Acionado quando: usuário solicita post, carrossel, calendário editorial,
script de vídeo ou qualquer conteúdo para redes sociais.

  [INPUT] → [ACCOUNT MANAGER] → [SOCIAL MEDIA] → [APROVAÇÃO 1] → [ACCOUNT MANAGER] → [DESIGNER] → [APROVAÇÃO 2] → [OUTPUT]


SKILL: SOCIAL MEDIA
  Recebe de:   Account Manager (briefing com contexto do cliente e tarefa)
  O que faz:
    · Deep research online sobre o tema solicitado
    · Busca notícias relevantes em portais, blogs e publicações do setor
    · Escolhe metodologia e framework ideal para o formato
      (carrossel, reels, estático, vídeo — cada um tem estrutura própria)
    · Desenvolve a copy completa do conteúdo
    · Sugere estrutura visual (layout, hierarquia, elementos)
    · Indica elementos visuais e referências para o Designer
    · Para calendários: produz TODAS as peças em um único documento
  Entrega para: Account Manager (para aprovação do usuário)


  Para post avulso — Output entregue ao usuário:
    · Pesquisa e contexto do tema
    · Notícias e referências selecionadas
    · Framework escolhido e justificativa
    · Copy completa do conteúdo
    · Estrutura visual sugerida
    · Indicação de elementos para o Designer

  Para calendário editorial — Output entregue ao usuário:
    · Documento único com todas as peças
    · Cada peça com: tema, framework, copy, estrutura visual
    · Aprovação feita peça a peça dentro do documento


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 5 — GUARDRAILS DE APROVAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

O fluxo pausa em dois momentos obrigatórios para validação humana.
Nenhuma skill avança sem aprovação explícita do usuário.


──────────────────────────────────────────────────────────────
 APROVAÇÃO 1 — Após Copywriting ou Social Media
──────────────────────────────────────────────────────────────

O Account Manager entrega:
  · Documento formatado com todo o conteúdo produzido
  · Resumo do ângulo escolhido, framework usado e persona alvo

Usuário pode responder:
  ✅  "Aprovado"           →  fluxo segue para o Designer
  ✏️   "Ajuste X e Y"     →  skill revisa e reapresenta para nova aprovação
  ❌  "Refazer com Z"     →  Account Manager reconstrói o briefing
                              e reaciona a skill do zero


──────────────────────────────────────────────────────────────
 APROVAÇÃO 2 — Após Designer
──────────────────────────────────────────────────────────────

O Designer entrega o material visual finalizado.

Usuário pode responder:
  ✅  "Aprovado"           →  output final entregue
  ✏️   "Ajuste visual"    →  Designer revisa a peça e reapresenta
  ❌  "Refazer copy"      →  volta para Aprovação 1


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 6 — REGRA ESPECIAL: Calendário Editorial
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quando a tarefa é um calendário com múltiplas peças:

  ETAPA 1 — Social Media produz TODAS as peças de uma vez
    └── Entrega: 1 documento com todas as peças

  ETAPA 2 — Aprovação 1 acontece peça por peça dentro do doc
    Peça 1: ✅  →  entra na fila do Designer
    Peça 2: ✏️  →  Social Media ajusta e reapresenta
    Peça 3: ✅  →  entra na fila do Designer
    Peça N: ...

  ETAPA 3 — Designer recebe uma peça por vez
    → garante consistência visual entre todos os materiais
    → evita desalinhamento de estilo

  ETAPA 4 — Aprovação 2 acontece peça por peça
    → usuário valida cada material antes do próximo ser produzido


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 7 — PAPEL DE CADA SKILL (RESUMO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ACCOUNT MANAGER
  Papel:        Orquestrador central — não produz conteúdo
  Recebe de:    Usuário e qualquer skill
  Entrega para: Qualquer skill
  Aparece:      No início, entre todas as skills e nos hand-offs

COPYWRITING
  Papel:        Produz copy persuasiva para LP e Ads
  Recebe de:    Account Manager
  Entrega para: Account Manager (que leva para aprovação e depois para Designer)
  Usa:          DCC, UCM, qualquer documento de contexto do cliente

SOCIAL MEDIA
  Papel:        Pesquisa + frameworks + copy + direção visual para conteúdo
  Recebe de:    Account Manager
  Entrega para: Account Manager (que leva para aprovação e depois para Designer)
  Diferencial:  Faz deep research online — não depende só dos documentos do cliente

DESIGNER
  Papel:        Produz o material visual final
  Recebe de:    Account Manager (briefing reformatado após aprovação da copy)
  Entrega para: Usuário (output final, após Aprovação 2)
  Regra:        Recebe sempre uma peça por vez para manter consistência visual


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 8 — EXEMPLOS DE FLUXO COMPLETO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXEMPLO 01 — Carrossel de conteúdo avulso
─────────────────────────────────────────

Input do usuário:
  "Quero um carrossel para o LinkedIn explicando GTM Engineer para o
   cliente Y. CTA no final. Docs em anexo."

  Account Manager
  └── Lê docs anexados + pasta do cliente
  └── Identifica: conteúdo social (carrossel LinkedIn)
  └── Constrói briefing para Social Media

  Social Media
  └── Deep research sobre GTM Engineer
  └── Busca notícias e referências relevantes
  └── Escolhe framework ideal para carrossel no LinkedIn
  └── Desenvolve copy do carrossel (slide a slide)
  └── Sugere estrutura visual e elementos para o Designer

  ⏸ APROVAÇÃO 1
  └── Usuário revisa copy e estrutura
  └── Aprova ou solicita ajustes

  Account Manager
  └── Reformata output aprovado em briefing para o Designer
  └── Adiciona especificações visuais, formato e referências

  Designer
  └── Produz o carrossel visual

  ⏸ APROVAÇÃO 2
  └── Usuário valida o material
  └── Output final entregue


EXEMPLO 02 — Calendário Editorial completo
──────────────────────────────────────────

Input do usuário:
  "Quero um calendário editorial para LinkedIn do cliente X.
   3 posts estáticos, 1 copy de vídeo e 2 carrosseis.
   Contexto: (...). Doc em anexo."

  Account Manager
  └── Lê docs anexados + pasta do cliente
  └── Identifica: calendário editorial (6 peças)
  └── Constrói briefing para Social Media

  Social Media
  └── Deep research sobre os temas
  └── Escolhe framework por formato (estático, vídeo, carrossel)
  └── Desenvolve copy de todas as 6 peças
  └── Sugere estrutura visual para cada uma
  └── Entrega: 1 documento com as 6 peças completas

  ⏸ APROVAÇÃO 1 — peça a peça
  └── Peça 1: ✅ aprovada → entra na fila
  └── Peça 2: ✏️ ajuste → Social revisa → reapresenta
  └── Peça 3: ✅ aprovada → entra na fila
  └── (e assim por diante...)

  Account Manager
  └── Pega as peças aprovadas em fila
  └── Reformata uma a uma para o Designer

  Designer
  └── Produz peça 1 → Aprovação 2 → Output
  └── Produz peça 2 → Aprovação 2 → Output
  └── (e assim por diante, mantendo consistência visual)


EXEMPLO 03 — Landing Page completa
────────────────────────────────────

Input do usuário:
  "Cria uma LP para o cliente HS Prevent focada no CFO.
   Usa os documentos salvos + doc em anexo com briefing da campanha."

  Account Manager
  └── Lê pasta hs-prevent/ + doc novo anexado
  └── Identifica: Landing Page (Pipeline A)
  └── Constrói briefing para Copywriting

  Copywriting
  └── Ingere contexto do cliente
  └── Mapeia persona: CFO
  └── Seleciona framework: PAS + Proof Stacking
  └── Produz copy completa da LP (todas as seções)
  └── Auditoria interna (nota mínima 8.5)

  ⏸ APROVAÇÃO 1
  └── Usuário revisa copy da LP completa
  └── Aprova ou solicita ajustes

  Account Manager
  └── Reformata copy aprovada em briefing para o Designer
  └── Adiciona diretrizes visuais, paleta, hierarquia

  Designer
  └── Produz a Landing Page visual

  ⏸ APROVAÇÃO 2
  └── Usuário valida o design
  └── Output final entregue


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BLOCO 9 — ROADMAP DE CONSTRUÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fase 1 — Skills de execução
  ✅  Copywriting     (concluída)
  ⏳  Designer        (próxima a construir)
  ⏳  Social Media    (após Designer)

Fase 2 — Orquestração
  ⏳  Account Manager  (skill que orquestra todas as outras)
  ⏳  Memória de clientes (estrutura de pastas clients/)
  ⏳  Integração Google Drive (busca automática de documentos)

Fase 3 — Testes e refinamento
  ⏳  Teste end-to-end com cliente real
  ⏳  Medir tempo de produção vs. processo manual
  ⏳  Ajustes e melhorias por ciclo de PDCA


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FIM DO DOCUMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
V4 Company — Agente de Produção de Marketing
Versão 1.0 — Março 2026
