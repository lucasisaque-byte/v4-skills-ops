# Identidade Visual — Via Journey Telehealth
## Salvo em: 2026-03-21

---

## ARQUIVOS FONTE

### Vetores (edição / impressão)
- `ViaJourney - LogoMarca.pdf` — logomarca vetorial (todas as variações)
- `ViaJourney - LogoMarca.ai` — arquivo editável Adobe Illustrator
- `ViaJourney - Marca.pdf` — manual de identidade visual completo
- `ViaJourney - Marca.ai` — arquivo editável do manual

### PNGs prontos para uso digital (`PNG/`)
| Arquivo | Formato | Uso recomendado |
|---------|---------|----------------|
| `logo-horizontal-01.png` | 8000×4500 | Logo horizontal — full color |
| `logo-horizontal-02.png` | 8000×4500 | Logo horizontal — variação 2 |
| `logo-horizontal-03.png` | 8000×4500 | Logo horizontal — variação 3 |
| `logo-horizontal-04.png` | 8000×4500 | Logo horizontal — variação 4 |
| `logo-horizontal-05.png` | 8000×4500 | Logo horizontal — variação 5 |
| `logo-horizontal-06.png` | 8000×4500 | Logo horizontal — variação 6 |
| `logo-horizontal-07.png` | 8000×4500 | Logo horizontal — variação 7 |
| `logo-horizontal-08.png` | 8000×4500 | Logo horizontal — variação 8 |
| `logo-vertical-01.png` | 4500×4500 | Logo vertical — variação 1 |
| `logo-vertical-02.png` | 4500×4500 | Logo vertical — variação 2 |
| `logo-vertical-03.png` | 4500×4500 | Logo vertical — variação 3 |
| `logo-vertical-04.png` | 4500×4500 | Logo vertical — variação 4 |
| `logo-vertical-05.png` | 4500×4500 | Logo vertical — variação 5 |
| `simbolo-01.png` | 4500×4500 | Símbolo isolado — bicolor (verde escuro + verde claro) |
| `simbolo-02.png` | 4500×4500 | Símbolo isolado — variação 2 |
| `simbolo-03.png` | 4500×4500 | Símbolo isolado — outline stroke verde |
| `simbolo-04.png` | 4500×4500 | Símbolo isolado — variação 4 |
| `simbolo-05.png` | 4500×4500 | Símbolo isolado — mono preto |
| `simbolo-06.png` | 4500×4500 | Símbolo isolado — outline branco (fundo escuro) |
| `simbolo-07.png` | 4500×4500 | Símbolo isolado — variação 7 |

### Background
- `BG via journey.png` — plano de fundo institucional da marca

> **Nota para skills:** Para uso em landing pages e anúncios, sempre preferir os arquivos PNG da pasta `PNG/`. Os vetores (.ai/.pdf) são para impressão e edição no Illustrator.

---

## LOGOMARCA

### Composição
A marca é composta por dois elementos:
1. **Símbolo (ícone):** pássaro estilizado formado por folhas sobrepostas — evoca leveza, movimento, natureza e saúde. As folhas criam a silhueta de um pássaro em voo, com detalhe de linha branca que separa as camadas
2. **Logotipo:** "Via**Journey**" — "Via" em peso regular, "Journey" em negrito, com "TELEHEALTH" em versalete espaçado abaixo

### Variações disponíveis (todas presentes no PDF)
| Variação | Descrição | Uso recomendado |
|----------|-----------|----------------|
| **Full color horizontal** | Símbolo verde + texto escuro verde | Principal — fundos brancos/claros |
| **Full color vertical** | Símbolo acima, texto abaixo centralizado | Formatos quadrados, posts sociais |
| **Monocromático preto** | Símbolo + texto em preto total | Impressos, documentos, contextos sem cor |
| **Monocromático escuro (verde)** | Verde escuro #1A5C3A | Fundo branco, uso formal |
| **Símbolo isolado** | Apenas o pássaro/folha em verde #6DB350 | Favicon, ícones, marca d'água |
| **Fundo verde institucional** | Logo branco sobre fundo verde musgo | Banners, apresentações, crachás |

---

## PALETA DE CORES

### Cores primárias
| Nome | Hex | RGB | Uso |
|------|-----|-----|-----|
| **Verde Primário** (símbolo) | `#6DB350` | rgb(109, 179, 80) | Símbolo/ícone, CTAs, destaques |
| **Verde Escuro** (logotipo) | `#1A5C3A` | rgb(26, 92, 58) | Texto da marca, headers, fundos institucionais |
| **Verde Institucional** (fundo) | `#3D7A5C` | rgb(61, 122, 92) | Backgrounds, banners, seções de destaque |

### Cores secundárias
| Nome | Hex | Uso |
|------|-----|-----|
| **Branco** | `#FFFFFF` | Fundo principal, texto sobre verde |
| **Preto** | `#000000` | Variação monocromática |
| **Cinza claro** | `#F5F5F5` | Fundos de seção, cards |
| **Cinza texto** | `#4A4A4A` | Corpo de texto longo |

### CSS Variables (para uso direto em código)
```css
:root {
  --vj-green-primary: #6DB350;
  --vj-green-dark: #1A5C3A;
  --vj-green-mid: #3D7A5C;
  --vj-white: #FFFFFF;
  --vj-black: #000000;
  --vj-gray-light: #F5F5F5;
  --vj-gray-text: #4A4A4A;
}
```

---

## TIPOGRAFIA

### Logotipo
- **"Via":** Peso regular (400), sem serifa arredondada
- **"Journey":** Peso bold (700–800), mesma família
- **"TELEHEALTH":** Versalete espaçado (letter-spacing amplo), peso light/regular

### Fonte identificada (referência)
A tipografia do logotipo tem características de família **sans-serif geométrica arredondada**. Combinação recomendada para uso em peças digitais:

```css
/* Display / Headlines */
font-family: 'Plus Jakarta Sans', 'Nunito', sans-serif;
font-weight: 700;

/* Corpo de texto */
font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
font-weight: 400;

/* Labels e tags */
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 300;
letter-spacing: 0.15em;
text-transform: uppercase;
```

---

## DIRETRIZES DE USO

### O que FAZER
- Usar o logo sobre fundos brancos ou verde institucional (`#3D7A5C`)
- Manter proporção original — nunca distorcer
- Garantir área de proteção de no mínimo 1x a altura do símbolo em todos os lados
- Usar símbolo isolado apenas quando a marca já for reconhecida no contexto

### O que NÃO FAZER
- Não usar o logo sobre fotos sem sobreposição de cor
- Não alterar as cores individualmente (símbolo e texto sempre na combinação correta)
- Não usar verde claro (`#6DB350`) como fundo de texto escuro (contraste insuficiente)
- Não colocar logo sobre fundos com padrão que comprometa legibilidade
- Não usar tipografias com serifa em peças da marca

---

## PERSONALIDADE E TOM VISUAL

**Arquétipo de marca:** Cuidador + Explorador
- Transmite acolhimento, confiança e segurança (saúde)
- Mas também leveza, movimento e liberdade (o pássaro em voo, a jornada)
- Não é clínico nem frio — é caloroso e próximo da comunidade brasileira

**Direção estética para peças:**
- Clean e respirado — não sobrecarregar
- Verde como cor dominante em pontos de atenção, não como fundo de texto
- Imagens humanas e emocionais (mãe, família, trabalhador)
- Evitar estética de hospital — preferir pessoas reais em contextos do dia a dia

---

## APLICAÇÕES DIGITAIS

### Landing Page
- **Hero background:** Verde escuro (`#1A5C3A`) com logo branco, ou branco com logo colorido
- **CTA buttons:** Verde primário (`#6DB350`) com texto branco
- **Headlines:** Verde escuro (`#1A5C3A`) ou preto sobre fundo branco
- **Sections alternadas:** Branco → Verde claro acinzentado (`#F0F7ED`) → Branco

### Favicon / App Icon
- Usar símbolo isolado (pássaro/folha) em `#6DB350` sobre fundo branco ou verde escuro

### Anúncios (Meta / Google / LinkedIn)
- Sempre com logo visível no canto superior ou inferior
- Paleta restrita: verde + branco + texto escuro
- Evitar elementos que remetem a "hospital" — preferir contextos de uso real (celular, trabalho, família)
