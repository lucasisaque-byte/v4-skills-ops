# Schema: brand-raw.json

Schema completo do arquivo de inteligência visual gerado pela skill `brand-intel`.
Este arquivo é a fonte da verdade visual de um cliente e input para a `brand-system-builder`.

---

## Estrutura completa

```json
{
  "cliente": "string — slug do cliente (ex: via-journey)",
  "nome_exibicao": "string — nome legível (ex: Via Journey Telehealth)",
  "segmento": "string — segmento de mercado (ex: Telehealth B2C)",
  "data_coleta": "string — ISO 8601 (ex: 2026-03-24)",
  "versao": "string — versão do schema (ex: 1.0.0)",

  "fontes": {
    "sites_rastreados": ["array de URLs rastreadas via Apify/WebFetch"],
    "screenshots_capturados": ["array de caminhos locais dos PNGs gerados"],
    "assets_locais_lidos": ["array de caminhos de arquivos lidos"],
    "redes_sociais": ["array de URLs de perfis analisados"],
    "fases_executadas": ["1A", "1B", "1C", "1D"],
    "fases_puladas": ["ex: 1B — Apify indisponível"],
    "notas": "string — qualquer observação relevante sobre limitações da coleta"
  },

  "paleta": {
    "primaria": [
      {
        "hex": "#XXXXXX",
        "rgb": "r, g, b",
        "nome": "string — nome descritivo (ex: Verde Primário)",
        "uso": "string — onde e como é usado (ex: CTAs, símbolo, destaques)",
        "confianca": "alta | media | baixa",
        "origem": "string — de onde foi extraído (ex: CSS var --color-primary, screenshot hero)"
      }
    ],
    "secundaria": [
      {
        "hex": "#XXXXXX",
        "rgb": "r, g, b",
        "nome": "string",
        "uso": "string",
        "confianca": "alta | media | baixa",
        "origem": "string"
      }
    ],
    "neutros": [
      {
        "hex": "#XXXXXX",
        "rgb": "r, g, b",
        "nome": "string — ex: Branco, Cinza Texto, Cinza Claro",
        "uso": "string",
        "confianca": "alta | media | baixa",
        "origem": "string"
      }
    ],
    "suporte": [
      {
        "hex": "#XXXXXX",
        "rgb": "r, g, b",
        "nome": "string — ex: Verde Vibrante, Amarelo Destaque",
        "uso": "string — uso restrito ou contextual",
        "confianca": "alta | media | baixa",
        "origem": "string"
      }
    ]
  },

  "tipografia": {
    "familia_principal": "string — ex: Plus Jakarta Sans",
    "fonte_google_fonts": true,
    "url_import": "string — URL do @import encontrado, se houver",
    "fallbacks": ["array de fontes alternativas identificadas ou inferidas"],
    "pesos_usados": ["array de números — ex: 400, 600, 700, 800"],
    "hierarquia": {
      "h1": {
        "familia": "string",
        "peso": "number",
        "tamanho_referencia": "string — ex: 64-96px (inferido de screenshots)"
      },
      "h2": {
        "familia": "string",
        "peso": "number",
        "tamanho_referencia": "string"
      },
      "body": {
        "familia": "string",
        "peso": "number",
        "tamanho_referencia": "string"
      }
    },
    "proibido": ["array — ex: serifadas, handwriting"],
    "notas": "string — observações sobre consistência ou inconsistências encontradas"
  },

  "logo": {
    "descricao_simbolo": "string — descrição visual detalhada do símbolo/ícone da marca",
    "significado_inferido": "string — o que o símbolo comunica visualmente",
    "composicao": "string — ex: símbolo + logotipo horizontal / apenas logotipo / ícone isolado",
    "variacoes_disponiveis": [
      {
        "arquivo": "string — caminho relativo (ex: PNG/logo-horizontal-01.png)",
        "descricao": "string — ex: horizontal colorido fundo claro",
        "fundo_recomendado": "claro | escuro | colorido | qualquer",
        "uso_recomendado": "string — ex: materiais digitais gerais, header"
      }
    ],
    "arquivos_fonte": ["array — ex: ViaJourney - LogoMarca.ai, .pdf"],
    "notas": "string"
  },

  "personalidade": {
    "arquetipos": ["array — 1 a 2 arquétipos principais da marca"],
    "adjetivos": ["array — 3 a 5 adjetivos que descrevem a marca visualmente"],
    "tom_de_voz": "string — descrição do tom inferido (ex: acolhedor, direto, técnico mas humano)",
    "posicionamento": "string — síntese do posicionamento inferido pelas meta tags e copy visível",
    "nao_e": ["array — o que a marca claramente não é (ex: fria, clínica, genérica)"]
  },

  "padroes_layout": {
    "border_radius": {
      "botoes": "string — ex: 8px",
      "cards": "string — ex: 16px",
      "containers": "string — ex: 24px",
      "descricao": "string — ex: valores altos indicam marca amigável e moderna"
    },
    "espacamento": {
      "base": "string — ex: 8px",
      "secoes": "string — ex: 80-120px padding vertical entre seções",
      "descricao": "string — espaçamento generoso ou comprimido e o que isso comunica"
    },
    "container_max_width": "string — ex: 1200px",
    "estrutura_secoes": "string — padrão de alternância (ex: branco → verde-claro → branco)",
    "estilo_geral": "string — síntese do estilo de layout (ex: clean, modular, editorial)"
  },

  "referencias_visuais": {
    "screenshots": [
      {
        "arquivo": "string — caminho relativo (ex: references/site-hero-desktop.png)",
        "descricao": "string — o que a imagem mostra",
        "observacoes": "string — padrões visuais observados nesta imagem"
      }
    ],
    "referencias_mercado": [
      {
        "arquivo": "string",
        "descricao": "string — contexto e relevância para a marca do cliente"
      }
    ],
    "criativos_existentes": [
      {
        "arquivo": "string",
        "tipo": "string — ex: post Instagram, banner LinkedIn, LP hero",
        "padroes_observados": "string — cores usadas, tipografia, composição"
      }
    ]
  },

  "lacunas": [
    "string — lista de informações que não foram encontradas e que o usuário pode complementar"
  ]
}
```

---

## Níveis de confiança

| Nível | Quando usar |
|-------|-------------|
| `alta` | Encontrado em CSS var, documento de marca ou logo oficial |
| `media` | Encontrado em múltiplos seletores CSS mas sem confirmação em doc de marca |
| `baixa` | Inferido a partir de screenshots ou um único seletor isolado |

---

## Exemplo real (Via Journey Telehealth)

```json
{
  "cliente": "via-journey",
  "nome_exibicao": "Via Journey Telehealth",
  "segmento": "Telehealth B2C — comunidade brasileira nos EUA",
  "data_coleta": "2026-03-24",
  "versao": "1.0.0",

  "fontes": {
    "sites_rastreados": ["https://viajourney.com.br"],
    "screenshots_capturados": [
      "clients/via-journey/brand/references/site-hero-desktop.png"
    ],
    "assets_locais_lidos": [
      "clients/via-journey/brand/identidade-visual.md",
      "clients/via-journey/brand/design-system-social-media.md"
    ],
    "redes_sociais": [],
    "fases_executadas": ["1A", "1B", "1C", "1D"],
    "fases_puladas": [],
    "notas": "Documentos de marca locais foram priorizados sobre extração CSS"
  },

  "paleta": {
    "primaria": [
      {
        "hex": "#6DB350",
        "rgb": "109, 179, 80",
        "nome": "Verde Primário",
        "uso": "Símbolo do logo, CTAs, highlights, destaques",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      },
      {
        "hex": "#1A5C3A",
        "rgb": "26, 92, 58",
        "nome": "Verde Escuro",
        "uso": "Logotipo, headers, fundos institucionais",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      },
      {
        "hex": "#3D7A5C",
        "rgb": "61, 122, 92",
        "nome": "Verde Institucional",
        "uso": "Fundos de seção, banners, backgrounds alternativos",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      }
    ],
    "neutros": [
      {
        "hex": "#FFFFFF",
        "rgb": "255, 255, 255",
        "nome": "Branco",
        "uso": "Background principal, texto sobre fundos escuros",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      },
      {
        "hex": "#4A4A4A",
        "rgb": "74, 74, 74",
        "nome": "Cinza Texto",
        "uso": "Corpo de texto",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      },
      {
        "hex": "#F5F5F5",
        "rgb": "245, 245, 245",
        "nome": "Cinza Claro",
        "uso": "Backgrounds secundários, seções alternadas",
        "confianca": "alta",
        "origem": "identidade-visual.md"
      }
    ]
  },

  "tipografia": {
    "familia_principal": "Plus Jakarta Sans",
    "fonte_google_fonts": true,
    "fallbacks": ["Nunito", "Montserrat", "Satoshi", "Poppins"],
    "pesos_usados": [300, 400, 600, 700, 800],
    "proibido": ["serifadas"],
    "notas": "Família geométrica com terminações arredondadas. Nunca usar serifas."
  },

  "personalidade": {
    "arquetipos": ["Cuidador", "Explorador"],
    "adjetivos": ["acolhedor", "humano", "dinâmico", "confiável", "leve"],
    "tom_de_voz": "Caloroso e próximo, não clínico nem frio. Fala como amigo de confiança.",
    "posicionamento": "Telehealth para a comunidade brasileira nos EUA — une cuidado com saúde e senso de pertencimento",
    "nao_e": ["frio", "clínico", "genérico", "corporativo excessivo"]
  },

  "padroes_layout": {
    "border_radius": {
      "botoes": "8px",
      "cards": "16-24px",
      "containers": "24px",
      "descricao": "Valores altos indicam marca amigável, moderna e acessível"
    },
    "estrutura_secoes": "Branco → Verde claro (#F0F7ED) → Branco",
    "estilo_geral": "Clean, modular, respira bem, hierarquia visual clara"
  }
}
```
