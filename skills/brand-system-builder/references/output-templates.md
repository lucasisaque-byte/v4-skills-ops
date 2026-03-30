# Templates de Output — brand-system-builder

Referência rápida de estrutura para os três documentos gerados.
Use este arquivo quando precisar verificar se alguma seção está faltando.

---

## Checklist: identidade-visual.md

- [ ] Cabeçalho com data e versão do brand-raw.json
- [ ] Seção de arquivos de marca (todos os logos listados com caminho e uso)
- [ ] Paleta completa: primária, secundária, suporte, neutros
- [ ] Regras de uso de cor (proibições explícitas)
- [ ] Tipografia: família, importação, hierarquia em tabela
- [ ] Padrões tipográficos observados nos criativos
- [ ] Logo: composição, significado, variações, área de respiro, proibições
- [ ] Personalidade: arquétipos, adjetivos, tom de voz com exemplos
- [ ] Aplicações digitais: LP, Ads

Mínimo: 150 linhas.

---

## Checklist: design-system-social-media.md

- [ ] Cabeçalho com data e referência à identidade-visual.md
- [ ] Paleta aprovada para social (cores com hex e uso específico)
- [ ] Regra de contraste explícita (tabela fundo × texto)
- [ ] Tipografia: tamanhos mínimos por formato (tabela)
- [ ] Canvas e margens de segurança (tabela por formato)
- [ ] Padrões de layout reais (baseados nos criativos do brand-raw.json)
- [ ] Arquétipos de peça (ao menos 3)
- [ ] Fotografia: estilo, paleta, o que mostrar e evitar
- [ ] Elementos gráficos recorrentes (lista detalhada)
- [ ] Posicionamento de logo por formato
- [ ] Anti-padrões: nunca fazer / sempre fazer

Mínimo: 200 linhas.

---

## Checklist: design-tokens.json

- [ ] meta: cliente, versão, data, fonte
- [ ] color.primary: DEFAULT, light, dark
- [ ] color.secondary: DEFAULT
- [ ] color.neutral: white, black, escala de cinzas usada
- [ ] color.text: primary, secondary, inverse, accent
- [ ] color.background: default, dark, accent, subtle
- [ ] typography.fontFamily: primary
- [ ] typography.fontWeight: todos os pesos usados
- [ ] typography.fontSize: display, h1, h2, h3, body-lg, body, body-sm, caption
- [ ] spacing: base, section-y, container-max
- [ ] borderRadius: button, card, container
- [ ] cssVariables: bloco CSS completo e funcional

---

## Referências de escala tipográfica para social media

Use estes valores como piso (nunca ir abaixo):

| Função | Feed 4:5 | Stories 9:16 | LinkedIn |
|--------|----------|--------------|----------|
| Hero / Display | 58px | 56px | 40px |
| Heading | 43px | 42px | 32px |
| Body / Bullets | 34px | 32px | 24px |
| Caption / Footer | 24px | 20px | 20px |

---

## Regra de hierarquia de documentos

Quando os três documentos coexistem para um cliente:

1. `identidade-visual.md` — fonte da verdade de marca (máxima prioridade)
2. `design-system-social-media.md` — complementar, subordinado ao anterior
3. `design-tokens.json` — implementação técnica dos dois anteriores

Em caso de conflito entre valores, sempre prevalece a `identidade-visual.md`.
