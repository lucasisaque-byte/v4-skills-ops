This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Contrato de ambiente (deploy)

O browser **não** envia segredos para a API. As chamadas HTTP usam o proxy same-origin `app/api/backend/[...path]`, que adiciona `Authorization: Bearer …` no servidor com `WORKFLOW_API_TOKEN`. Não use `NEXT_PUBLIC_*` para tokens.

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `WORKFLOW_API_TOKEN` | **Sim (produção)** | Mesmo valor que `WORKFLOW_API_TOKEN` na API FastAPI. Apenas no ambiente do servidor Next (Vercel/Railway/local), **nunca** exposto ao cliente. |
| `PLATFORM_SESSION_SECRET` | **Sim (produção)** | Segredo do servidor para assinar o cookie de sessão usado pelo proxy `app/api/backend/[...path]` (limite de chamador). Em dev pode ficar ausente; em produção o Next **não inicia** sem este valor (`instrumentation.ts`). |
| `WORKFLOW_API_UPSTREAM_URL` | Recomendado | URL **absoluta** do backend FastAPI (`https://…`), sem barra final. Preferível a `NEXT_PUBLIC_API_URL` para não depender de variável pública. Se omitido, usa `NEXT_PUBLIC_API_URL` e, em último caso, `http://localhost:8000` no proxy. |
| `NEXT_PUBLIC_WORKFLOW_PROXY_BASE` | Opcional | Caminho do proxy no Next (padrão `/api/backend`). |
| `NEXT_PUBLIC_API_URL` | Opcional | Fallback para o upstream do proxy se `WORKFLOW_API_UPSTREAM_URL` não estiver definido. |

**Validação na subida:** em produção (`NODE_ENV=production`), `instrumentation.ts` impede o servidor Next de iniciar sem `WORKFLOW_API_TOKEN` **e** sem `PLATFORM_SESSION_SECRET`. O build (`next build`) não exige esses valores (fase `NEXT_PHASE=phase-production-build`).

### API FastAPI (Railway ou outro)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `WORKFLOW_API_TOKEN` | **Sim em produção** | Token compartilhado **somente** com o proxy Next (servidor). A API não inicia em produção sem este valor (`ENVIRONMENT=production` ou `RAILWAY_ENVIRONMENT=production`). |
| `WORKFLOW_AUTH_ALLOW_MISSING` | Apenas dev | Defina `1`/`true`/`yes` para permitir desenvolvimento local **sem** token (endpoints de workflow ficam abertos). A API **recusa subir** se esta variável estiver definida em produção. |
| `CORS_ALLOWED_ORIGINS` (API) | Sim (produção) | Origens permitidas. O browser fala só com o Next; o proxy chama a API server-to-server (sem CORS no browser para o FastAPI). Ajuste se ainda houver clientes diretos ao backend. |

Em desenvolvimento local sem token: defina `WORKFLOW_AUTH_ALLOW_MISSING=1` na API **e** deixe o Next sem `WORKFLOW_API_TOKEN` no proxy (só em dev); em produção, ambos os lados exigem o token.

Mantenha **uma única URL de upstream** coerente com o deploy do FastAPI (`WORKFLOW_API_UPSTREAM_URL` ou fallback documentado).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
