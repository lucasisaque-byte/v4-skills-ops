# Identidade Visual — KCE Logistics

> Documento de marca gerado automaticamente pela V4 Company · 2026-03-24
> Fonte: brand-raw.json v1.0.0 · Segmento: Logística B2B — Freight, Fulfillment & Warehousing

---

## Arquivos de Marca

| Arquivo | Descrição | Fundo recomendado | Quando usar |
|---------|-----------|-------------------|-------------|
| `https://kcelogistics.com/wp-content/uploads/2026/02/logoKCE.png` | Logo horizontal colorida — "KCE" em laranja + "Logistics" em preto | Claro (branco, cinza claro) | Header do site, assinatura em materiais sobre fundo branco |
| Extraída visualmente dos criativos | Logo horizontal branca — "KCE" + "Logistics" em branco total | Escuro ou colorido (navy, laranja) | Footer, posts com fundo navy ou laranja, ads escuros |
| Extraída visualmente dos criativos | Logo compacta "KCE" + subscrito — versão reduzida | Escuro ou colorido | Topo de post social, favicon, espaços pequenos |

> **Ação pendente:** Solicitar ao cliente os arquivos vetoriais (.ai, .svg ou .eps) para que o time tenha acesso às versões de alta qualidade. Atualmente os arquivos estão disponíveis apenas via web ou extraídos dos criativos.

---

## Paleta de Cores

### Cores Primárias

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Laranja Primário** | `#F15A22` | 241, 90, 34 | CTA buttons, banners de destaque, blocos de fundo em anúncios, marcadores de bullet, barras de acento, hover states |

```css
/* Laranja Primário */
background-color: #F15A22;
color: #F15A22;
```

O laranja é a cor de ação e energia da marca. Deve aparecer em todo ponto de decisão do usuário — botões, destaques e chamadas para ação. É a cor mais reconhecível da KCE.

### Cores Secundárias

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Navy Institucional** | `#1C2336` | 28, 35, 54 | Fundos de seção escura, header, overlays sobre foto, texto em alto contraste sobre branco |
| **Preto Base** | `#191C24` | 25, 28, 36 | Background mais escuro (hero escuro, footer, navbar) |

```css
/* Navy Institucional */
background-color: #1C2336;

/* Preto Base */
background-color: #191C24;
```

O navy e o preto base formam a identidade escura da marca — autoridade, profundidade, seriedade corporativa. Usados juntos criam camadas de profundidade sem perder coesão.

### Cores Neutras

| Cor | Hex | RGB | Uso |
|-----|-----|-----|-----|
| **Branco** | `#FFFFFF` | 255, 255, 255 | Background principal, texto sobre fundos escuros e laranja, cards, espaço de respiro |
| **Azul-Cinza Parágrafo** | `#5E6E8D` | 94, 110, 141 | Corpo de texto secundário, subtítulos, descrições de suporte |
| **Cinza Claro** | `#F3F4F6` | 243, 244, 246 | Backgrounds alternativos de seção, cards com fundo claro |
| **Cinza Texto** | `#4B5563` | 75, 85, 99 | Texto de apoio, metadados, labels |

### Cores de Suporte

Usadas com moderação — nunca como cor dominante de uma peça.

| Cor | Hex | Uso |
|-----|-----|-----|
| **Laranja Claro** | `#F69B79` | Hover states, versões atenuadas do laranja primário |
| **Laranja Pastel** | `#FDE2D9` | Backgrounds de highlight suave, tags, badges |
| **Laranja Escuro** | `#99310A` | Hover ativo em botões, estados de pressão |

### Regras de Uso de Cor

**Nunca fazer:**
- Usar `#F15A22` como cor de texto sobre fundo branco em tamanhos pequenos (contraste insuficiente abaixo de ~24px)
- Combinar navy (`#1C2336`) com preto base (`#191C24`) como texto e fundo — diferença imperceptível
- Usar laranja claro (`#F69B79`) ou pastel (`#FDE2D9`) como cor dominante de um layout — são cores de suporte
- Colocar texto laranja sobre fundo laranja em qualquer variação
- Misturar fontes serifadas com qualquer elemento da paleta — a marca é 100% sem serifa

**Hierarquia de cor:**
1. **Laranja `#F15A22`** — acento e ação (botões, highlights, marcadores)
2. **Navy `#1C2336` / Preto `#191C24`** — fundos e autoridade
3. **Branco `#FFFFFF`** — respiração e clareza
4. **Azul-cinza `#5E6E8D`** — informação secundária

---

## Tipografia

### Família Principal: Roboto

Fonte geométrica sem serifa do Google Fonts. Escolha que reforça o posicionamento tech-forward da marca — limpa, funcional, legível em qualquer tamanho.

**Importação:**
```css
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap');

body {
  font-family: "Roboto", Arial, Helvetica, sans-serif;
}
```

**Pesos disponíveis e em uso:** 100 (Thin) · 300 (Light) · 400 (Regular) · 500 (Medium) · 600 (SemiBold) · 700 (Bold) · 800 (ExtraBold) · 900 (Black)

### Hierarquia Tipográfica

| Elemento | Família | Peso | Tamanho (desktop) | Line-height | Uso |
|----------|---------|------|-------------------|-------------|-----|
| Display | Roboto | 300 | 4rem (64px) | 120% | Números de impacto, stats, hero especial — UPPERCASE obrigatório |
| H1 | Roboto | 600 | 3rem (48px) | 130% | Título principal de página |
| H2 | Roboto | 600 | 2.5rem (40px) | 130% | Títulos de seção |
| H3 | Roboto | 600 | 1.75rem (28px) | 130% | Subtítulos, títulos de card |
| H4 | Roboto | 600 | 1.5rem (24px) | 130% | Títulos de item, feature name |
| Body Large | Roboto | 400/500 | 1.125rem (18px) | 150% | Parágrafos de destaque, lead text |
| Body | Roboto | 400 | 1rem (16px) | 150% | Corpo de texto padrão |
| Body Small | Roboto | 400/500 | 0.875rem (14px) | 130% | Descrições secundárias, fine print |
| Caption | Roboto | 400 | 0.75rem (12px) | 130% | Legendas, metadados |
| Label | Roboto | 500 | 0.875rem (14px) | — | Labels de UI, badges |

### Padrões Tipográficos da Marca

A KCE usa **contraste de peso dentro da mesma linha** como principal mecanismo de hierarquia. Isso cria ênfase sem precisar mudar de família ou usar itálico.

**Padrão 1 — Mix de peso em headline:**
```
"The logistics partner that guarantees"  → peso 400
"on-time delivery"                        → peso 700, cor #F15A22
"and flawless execution"                  → peso 700, cor preto
```

**Padrão 2 — Highlight inline com bloco laranja:**
- Palavra ou frase-chave recebe fundo laranja sólido (`#F15A22`) com texto branco
- Sempre em ALL CAPS
- Ex: `[REFLECT YOUR BRAND]` sobre bloco laranja

**Padrão 3 — CTA em ALL CAPS:**
- Todo botão de call-to-action usa texto em maiúsculas
- Peso 500-600, espaçamento entre letras levemente ampliado
- Ex: `SCHEDULE A FREE MEETING NOW` · `SPEAK TO A FULFILLMENT EXPERT`

**Padrão 4 — Display class para números/estatísticas:**
- Peso 300 (Light), 4rem+, UPPERCASE, letter-spacing amplo
- Usado para dados de impacto: `QUOTE IN UNDER 60 SECONDS`

### Regras Tipográficas

- **Nunca usar:** fontes serifadas, handwriting, display decorativas
- **Peso mínimo para texto legível:** 400 em qualquer contexto; 500+ em textos pequenos (abaixo de 14px)
- **Itálico:** permitido apenas em citações ou casos excepcionais — não é padrão da marca

---

## Logo

### Composição e Significado

O logo da KCE Logistics é um **wordmark tipográfico puro** — sem símbolo, sem ícone separado. É composto por:

- **"KCE"** em peso Extra-Bold (800-900) — representa força, solidez, capacidade
- **"Logistics"** em peso Light/Regular (300-400) — representa precisão, serviço, execução
- **Elemento subscrito** após "Logistics" — marca de identidade da marca (possivelmente trademark estilizado)

O contraste de pesos não é acidental: é o mesmo princípio tipográfico que a marca usa nos criativos. O logo *é* a marca em sua forma mais concentrada.

### Variações e Uso

| Variação | Fundo recomendado | Quando usar |
|----------|-------------------|-------------|
| Logo colorida ("KCE" laranja + "Logistics" preto) | Branco, cinza claro | Header, materiais institucionais, apresentações |
| Logo branca total | Navy `#1C2336`, laranja `#F15A22`, qualquer fundo escuro | Anúncios escuros, posts com fundo colorido, footer |
| Logo compacta "KCE" + subscrito | Escuro ou colorido | Canto de post social, favicon, espaços pequenos |

### Posicionamento nos Materiais

- **Key Visuals horizontais:** canto inferior direito, ou topo direito como elemento de marca
- **Posts verticais (feed):** canto inferior esquerdo ou inferior centralizado
- **Ads:** sempre visível, nunca competindo com o headline principal

### Área de Respiro

Manter espaçamento mínimo ao redor do logo equivalente à altura da letra "K" em todas as direções. Nunca aproximar outros elementos do logo sem essa margem.

### O que Nunca Fazer com o Logo

- Alterar as cores do logo fora das variações documentadas
- Usar fundo que comprometa o contraste (ex: logo colorida sobre fundo laranja)
- Distorcer proporções — sempre escalar proporcionalmente
- Recriar o logo com outra fonte — é um arquivo gráfico, não reconstruível
- Colocar sombra, brilho ou efeito sobre o logo
- Usar a versão colorida sobre fundos escuros ou coloridos

---

## Personalidade e Tom

### Arquétipos

**Governante + Herói**

| Arquétipo | Como se manifesta visualmente |
|-----------|-------------------------------|
| **Governante** | Composição controlada, espaço amplo, paleta sóbria e autoritária (navy + branco), tipografia precisa sem excesso decorativo |
| **Herói** | Laranja como cor de ação e energia, headlines de promessa direta ("zero erros", "on-time"), fotografias de operação com profissionais em ação |

### Adjetivos da Marca

| Adjetivo | O que significa na prática |
|----------|---------------------------|
| **Direto** | Headline vai ao ponto em uma frase. Nenhum texto de aquecimento. |
| **Confiante** | Faz promessas específicas e mensuráveis, não genéricas |
| **Profissional** | Layout limpo, espaçamento generoso, sem excesso de elementos |
| **Ágil** | Laranja como acento de velocidade; setas → como elementos de dinamismo |
| **Orientado a resultado** | Copy sempre conectada a output: velocidade, precisão, ROI |

### Tom de Voz

Assertivo e focado em performance. Fala a linguagem do decisor B2B — COO, Supply Chain Manager, CEO de e-commerce. Cada frase é uma promessa operacional.

**Frases que SÃO da KCE:**
- "Close deals faster with agile freight quotes"
- "Your partner for reliable on-time delivery & high-accuracy execution"
- "Get your air freight quote in under 60 seconds"
- "We turn disorganized storage into your competitive advantage"

**Frases que NÃO são da KCE:**
- "Juntos, crescemos" — vago e emocional
- "Soluções logísticas para o seu negócio" — genérico demais
- "Cuide do seu estoque com carinho" — tom errado, não é B2B de performance
- Qualquer copy com metáforas de natureza, família ou comunidade

---

## Aplicações Digitais

### Landing Pages

**Estrutura de seções:**
```
Hero escuro (navy/foto com overlay)
  → headline branca bold + subheadline azul-cinza + CTA laranja sólido

Seção de serviços (branco)
  → H2 preto bold + cards brancos com border-radius 8-12px
  → ícones ou foto operacional por serviço

Seção de dados/prova social (cinza claro #F3F4F6)
  → números em Display (peso 300, laranja) + labels em Body

Seção CTA final (navy #1C2336)
  → headline branca + CTA laranja sólido ALL CAPS
```

**Regras de CTA em LP:**
- Botão primário: `background: #F15A22; color: #FFFFFF; border-radius: 4px; text-transform: uppercase;`
- Botão secundário: `border: 2px solid #F15A22; color: #F15A22; background: transparent;`
- Nunca usar botão laranja sobre fundo laranja

### Anúncios (Meta / Google / LinkedIn)

- Logo sempre visível — nunca ocultado por elementos do layout
- Usar versão branca do logo quando o fundo for navy ou laranja
- Paleta restrita por peça: não usar mais de 3 cores por anúncio
- Headline no máximo 2 linhas — foco imediato, sem enrolação
- CTA em ALL CAPS obrigatório
- Foto operacional real quando possível — evitar ilustrações ou mockups genéricos
