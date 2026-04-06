
╔══════════════════════════════════════════════════════════════════════════════════════╗
║         SKILL: BRAND DESIGN SYSTEM — V4 COMPANY                                    ║
║         Extração Automática de Identidade Visual e Geração de Design System         ║
║         Versão 1.0 — Março 2026                                                     ║
╚══════════════════════════════════════════════════════════════════════════════════════╝


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 VISÃO GERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Problema:
  Construir design systems de marca é um processo lento e manual.
  O designer precisa rastrear sites, redes sociais e criativos do
  cliente para montar um guia coerente de identidade visual antes
  de produzir qualquer peça.

Solução:
  Duas skills em pipeline que automatizam esse processo — da coleta
  de referências visuais na web até a entrega de documentação pronta
  para o frontend designer e o social media designer usarem.

Referência de output esperado:
  O que está em clients/via-journey/brand/ é o padrão de qualidade
  que as skills devem gerar automaticamente para qualquer cliente.
    · identidade-visual.md       (guia oficial da marca)
    · design-system-social-media.md  (sistema para social media)
    · design-tokens.json         (tokens para desenvolvedores)
    · brand-brief.md             (resumo executivo da identidade)
    · outputs visuais (PNG)      (moodboard, mockups aplicados)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILLS A CONSTRUIR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Skill 1 — brand-intel (nova, type: prompt)
    Coleta e consolida inteligência visual de múltiplas fontes.
    Output: brand-raw.json

  Skill 2 — brand-system-builder (nova, type: prompt)
    Consome brand-raw.json e gera a documentação completa do design system.
    Output: conjunto de docs + PNGs visuais


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ARQUITETURA DO PIPELINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [FONTES DE ENTRADA]
       │
       ├── URLs do site/blog/landing pages do cliente
       ├── URLs de concorrentes e referências visuais
       ├── Pasta local de assets (clients/{cliente}/brand/)
       ├── URLs de perfis em redes sociais
       └── Criativos e peças já entregues ao cliente
       │
       ▼
  ┌─────────────────────────────┐
  │       SKILL 1               │
  │       brand-intel           │  ←── usa: apify + image-fetcher
  │  (coleta + consolidação)    │
  └──────────────┬──────────────┘
                 │
                 ▼
         brand-raw.json
         (paleta, tipografia,
          personalidade, padrões)
                 │
                 ▼
  ┌─────────────────────────────┐
  │       SKILL 2               │
  │   brand-system-builder      │  ←── usa: image-creator + image-generator + canva
  │  (gera docs + visuais)      │
  └──────────────┬──────────────┘
                 │
                 ▼
  [OUTPUTS — clients/{cliente}/brand/]
       │
       ├── identidade-visual.md
       ├── design-system-social-media.md
       ├── design-system-frontend.md
       ├── design-tokens.json
       ├── brand-brief.md
       └── outputs/
           ├── moodboard.png
           ├── paleta-de-cores.png
           ├── tipografia.png
           └── mockup-aplicacao.png


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL 1 — BRAND INTEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responsabilidade:
  Raspar e consolidar dados visuais brutos de múltiplas fontes
  e entregar um brand-raw.json estruturado como output.

Arquivo: skills/brand-intel/SKILL.md
Tipo:    prompt
Versão:  1.0.0

Inputs aceitos:
  · URLs do site principal, blog, landing pages do cliente
  · URLs de concorrentes ou referências do mesmo segmento
  · Caminho da pasta de assets locais (clients/{cliente}/brand/)
  · URLs de perfis em redes sociais (Instagram, LinkedIn)
  · Segmento e público-alvo do cliente (contexto narrativo)

──────────────────────────────────────────────────────────────
 FASE 1.A — Extração estruturada via Apify
──────────────────────────────────────────────────────────────

Usa a skill apify (Actor: web-scraper) para extrair do HTML/CSS:

  · Variáveis CSS do :root
    ex: --color-primary, --font-family-base, --spacing-unit

  · Font-family declarations e @import do Google Fonts

  · Valores de border-radius predominantes (botões, cards, containers)

  · Paleta de cores usada nos seletores principais
    (background-color, color, border-color de header, hero, CTAs, footer)

  · Meta tags relevantes
    (og:title, og:image, description — para entender tom e posicionamento)

  · Favicon e logos encontrados no HTML (src de <img> + <link rel="icon">)

  Actor secundário (instagram-scraper):
  · Extrai os últimos 12 posts do perfil do cliente (se URL fornecida)
  · Objetivo: identificar padrões visuais recorrentes nas peças já publicadas

──────────────────────────────────────────────────────────────
 FASE 1.B — Captura visual via image-fetcher
──────────────────────────────────────────────────────────────

Usa a skill image-fetcher (Playwright) para capturar:

  · Screenshot da hero section (viewport 1440x900)
  · Screenshot do footer (selector: footer)
  · Screenshot de um CTA principal (selector: .cta, button[class*="primary"])
  · Screenshot full-page do site em mobile (viewport 390x844)
  · Imagens da web por keywords do segmento
    ex: "telehealth brand identity", "health tech visual design"

  Todos os assets são salvos em:
  clients/{cliente}/brand/references/

──────────────────────────────────────────────────────────────
 FASE 1.C — Leitura de assets locais existentes
──────────────────────────────────────────────────────────────

Se a pasta clients/{cliente}/brand/ já existir:

  · Inventaria todos os arquivos (Glob)
  · Lê documentos de texto já existentes (identidade-visual.md, briefs)
  · Lista logos disponíveis e suas variações (PNG/)
  · Descreve visualmente logos e símbolos usando visão do modelo

──────────────────────────────────────────────────────────────
 FASE 1.D — Consolidação no brand-raw.json
──────────────────────────────────────────────────────────────

Interpreta tudo coletado nas fases anteriores e gera brand-raw.json:

  {
    "cliente": "nome-do-cliente",
    "data_coleta": "2026-03-24",
    "fontes": [...],

    "paleta": {
      "primaria": [
        { "hex": "#6DB350", "uso": "CTA, símbolo, destaques" },
        { "hex": "#1A5C3A", "uso": "logotipo, headers, fundos institucionais" }
      ],
      "secundaria": [...],
      "neutros": [...]
    },

    "tipografia": {
      "familia_principal": "Plus Jakarta Sans",
      "fallbacks": ["Nunito", "Poppins"],
      "pesos_usados": [400, 600, 700, 800],
      "proibido": ["serifadas"]
    },

    "logo": {
      "variacoes_disponiveis": [...],
      "descricao_simbolo": "...",
      "arquivos_locais": [...]
    },

    "personalidade": {
      "arquetipos": ["Cuidador", "Explorador"],
      "adjetivos": ["acolhedor", "humano", "dinâmico", "confiável"],
      "tom_de_voz": "..."
    },

    "padroes_layout": {
      "border_radius_predominante": "16-24px",
      "espacamento_base": "8px",
      "estrutura_secoes": "branco → verde-claro → branco"
    },

    "referencias_visuais": {
      "screenshots": [...],
      "criativos_existentes": [...]
    }
  }


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILL 2 — BRAND SYSTEM BUILDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Responsabilidade:
  Consumir brand-raw.json e gerar a documentação completa do
  design system, incluindo outputs visuais em PNG.

Arquivo: skills/brand-system-builder/SKILL.md
Tipo:    prompt
Versão:  1.0.0

Input:   brand-raw.json (gerado pela brand-intel)
         ou inputs manuais fornecidos pelo usuário

──────────────────────────────────────────────────────────────
 DOCUMENTO 1 — identidade-visual.md
──────────────────────────────────────────────────────────────

Para quem: todos — fonte da verdade da marca

Conteúdo gerado:
  · Arquivos fonte (vetores .ai, .pdf, PNGs disponíveis)
  · Variações de logo (listagem com uso recomendado por contexto)
  · Paleta de cores primária e secundária (hex + RGB + uso)
  · Tipografia (famílias, pesos, hierarquia)
  · Composição do logo (descrição do símbolo e seu significado)
  · Personalidade e arquétipos da marca
  · Regras de uso (DOs e DON'Ts)
  · Aplicações digitais (LP, ads, email)

──────────────────────────────────────────────────────────────
 DOCUMENTO 2 — design-system-social-media.md
──────────────────────────────────────────────────────────────

Para quem: social media designer

Conteúdo gerado:
  · Paleta adaptada para redes sociais (com variações de suporte)
  · Hierarquia tipográfica com tamanhos px por nível (H1, H2, H3, micro)
  · Canvas e margens seguras por formato (4:5, stories, carrossel)
  · 5 padrões de layout (A: hero com foto, B: tipográfico, C: cards
    educacionais, D: checklist comparativo, E: CTA institucional)
  · Técnica de destaque de palavras (tape/highlight)
  · Estruturas de fundo (foto tonalizada, sólido, gradiente, off-white)
  · Regras de posicionamento do logo
  · Ícones e elementos gráficos recomendados
  · Continuidade de carrossel (ritmo visual entre slides)
  · Matriz de decisão de layout
  · 4 arquétipos de peças (estático emocional, estático institucional,
    carrossel risco→solução, carrossel comparativo)

──────────────────────────────────────────────────────────────
 DOCUMENTO 3 — design-system-frontend.md
──────────────────────────────────────────────────────────────

Para quem: frontend designer / desenvolvedor

Conteúdo gerado:
  · Variáveis CSS prontas para uso
  · Sistema de grid e breakpoints
  · Componentes base (botões, cards, inputs, badges)
  · Padrões de seção (hero, features, depoimentos, CTA, rodapé)
  · Regras de espaçamento e ritmo vertical
  · Estados interativos (hover, focus, active)
  · Acessibilidade (contraste mínimo, tamanho de fonte)

──────────────────────────────────────────────────────────────
 DOCUMENTO 4 — design-tokens.json
──────────────────────────────────────────────────────────────

Para quem: desenvolvedor frontend

Formato: JSON pronto para importar em projetos (Tailwind, CSS-in-JS)

  {
    "colors": {
      "primary": "#6DB350",
      "primary-dark": "#1A5C3A",
      ...
    },
    "typography": {
      "font-family-base": "Plus Jakarta Sans, sans-serif",
      "font-size-h1": "88px",
      ...
    },
    "spacing": { ... },
    "border-radius": { ... },
    "shadows": { ... }
  }

──────────────────────────────────────────────────────────────
 DOCUMENTO 5 — brand-brief.md
──────────────────────────────────────────────────────────────

Para quem: orquestrador, account manager, cliente

Conteúdo: resumo executivo de 1 página
  · Quem é a marca (arquétipo, personalidade, tom)
  · Paleta resumida (3-5 cores com hex)
  · Tipografia resumida (família + pesos)
  · 3 regras de ouro para qualquer peça
  · Logo recomendado por contexto (claro / escuro / símbolo)

──────────────────────────────────────────────────────────────
 OUTPUTS VISUAIS — gerados com image-creator + image-generator
──────────────────────────────────────────────────────────────

Usa image-creator (HTML/CSS → PNG via Playwright) para gerar:

  paleta-de-cores.png
    · HTML renderizado com swatches das cores, hex e nome
    · Viewport: 1200x600px

  tipografia.png
    · HTML com hierarquia tipográfica aplicada (H1 a micro)
    · Inclui font-weight e tamanho em px
    · Viewport: 1200x800px

  logo-sheet.png
    · HTML com grid das variações de logo disponíveis
    · Cada logo em fundo correspondente (claro/escuro/colorido)
    · Viewport: 1200x900px

Usa image-generator (generate.py) com --reference logo do cliente:

  moodboard.png  (modo: production)
    · Prompt: imagens lifestyle que representam a personalidade da marca
    · Exemplo: "Warm, human, telehealth brand lifestyle imagery,
      green palette, Brazilian patients, professional warmth"
    · --reference: logo-horizontal-01.png do cliente

  mockup-aplicacao.png  (modo: production)
    · Prompt: mockup de aplicação da marca em contexto real
    · Exemplo: "Brand identity applied to smartphone screen,
      business card, social media post, clean mockup"
    · --reference: logo do cliente

Usa canva (opcional, se o cliente tiver Canva Business):
  · Cria templates pré-configurados com as cores e fontes do cliente
  · Exporta como PNG/PDF para o designer usar diretamente


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SKILLS EXISTENTES UTILIZADAS (SEM MODIFICAÇÃO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Skill             Onde é usada              Para quê
  ─────────────────────────────────────────────────────────────
  apify             brand-intel               Extrai CSS, cores, fontes do HTML
  image-fetcher     brand-intel               Screenshots de sites e elementos
  image-creator     brand-system-builder      Renderiza paleta/tipografia como PNG
  image-generator   brand-system-builder      Moodboard e mockups com logo de ref.
  canva             brand-system-builder      Templates prontos para o designer

  Script reutilizado diretamente:
  skills/image-generator/scripts/generate.py
    · Chamado via CLI com --prompt, --output, --reference, --mode
    · Não requer modificação — parametrização suficiente para o uso


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ESTRUTURA DE PASTAS GERADA POR CLIENTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  clients/{cliente}/
  └── brand/
      ├── brand-raw.json                ← output da brand-intel
      ├── brand-brief.md                ← resumo executivo
      ├── identidade-visual.md          ← guia oficial (fonte da verdade)
      ├── design-system-social-media.md ← sistema para social media
      ├── design-system-frontend.md     ← sistema para frontend
      ├── design-tokens.json            ← tokens para desenvolvedor
      ├── PNG/                          ← logos originais do cliente
      │   ├── logo-horizontal-01.png
      │   └── ...
      ├── references/                   ← screenshots e refs coletadas
      │   ├── site-hero.png
      │   ├── site-footer.png
      │   └── site-mobile.png
      └── outputs/                      ← materiais gerados pelas skills
          ├── paleta-de-cores.png
          ├── tipografia.png
          ├── logo-sheet.png
          ├── moodboard.png
          └── mockup-aplicacao.png


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 LIMITAÇÕES E ESTRATÉGIAS DE CONTORNO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Limitação                              Contorno
  ──────────────────────────────────────────────────────────────
  Sites SPA (JS dinâmico) — CSS          Buscar arquivos .css linkados +
  pode não estar no HTML inicial         inspecionar via Playwright após load

  Instagram bloqueia scraping            Usuário fornece screenshots ou
  automatizado                           pasta de criativos local

  Fontes proprietárias não aparecem      Heurística: inferir família pela
  no CSS                                 aparência via descrição visual

  Logo em formato .ai (Illustrator)      Usar variações PNG disponíveis;
  não pode ser lido pelo modelo          descrever via imagem renderizada

  Sites sem variáveis CSS                Extrair cores diretamente dos
  (CSS hardcoded)                        seletores principais (header, CTA)

  image-generator gera imagem            Usar apenas para moodboard/mockup —
  mas não logos precisos                 nunca substituir os assets reais


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ROADMAP DE CONSTRUÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Fase 1 — Construção das skills
  ─────────────────────────────────────────────────────────────
  ⏳  brand-intel              (Skill 1 — extração e consolidação)
  ⏳  brand-system-builder     (Skill 2 — geração de docs e visuais)

  Fase 2 — Validação com cliente real
  ─────────────────────────────────────────────────────────────
  ⏳  Testar com Via Journey
      · Rodar brand-intel no site viajourney.com.br
      · Comparar brand-raw.json gerado com identidade-visual.md existente
      · Validar se output da brand-system-builder equivale ao que foi
        feito manualmente em clients/via-journey/brand/

  Fase 3 — Integração no pipeline principal
  ─────────────────────────────────────────────────────────────
  ⏳  brand-intel vira etapa zero do onboarding de novos clientes
  ⏳  brand-system-builder alimenta diretamente o social media designer
      e o frontend designer no pipeline do Account Manager
  ⏳  brand-brief.md passa a ser input padrão para todas as skills
      (copywriting, social media, designer)


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CRITÉRIO DE SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A skill foi bem construída quando:

  · O brand-raw.json gerado automaticamente para a Via Journey
    contém as mesmas cores, fontes e personalidade documentadas
    manualmente em clients/via-journey/brand/identidade-visual.md

  · O designer consegue produzir uma peça de social media para
    um cliente novo usando apenas os docs gerados, sem precisar
    pesquisar nada adicionalmente

  · O desenvolvedor consegue implementar uma LP usando apenas o
    design-tokens.json gerado, sem precisar extrair valores
    manualmente do Figma ou do site


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 FIM DO DOCUMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
V4 Company — Brand Design System Skill
Versão 1.0 — Março 2026
