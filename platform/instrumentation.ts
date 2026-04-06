/**
 * Validação na subida do servidor Next.js: em produção o proxy exige
 * `WORKFLOW_API_TOKEN` (nunca NEXT_PUBLIC_*) e `PLATFORM_SESSION_SECRET`
 * (cookie assinado para `/api/backend`), alinhado à API FastAPI e ao middleware.
 */
export async function register() {
  if (process.env.NODE_ENV !== 'production') return
  if (process.env.NEXT_PHASE === 'phase-production-build') return
  if (!process.env.WORKFLOW_API_TOKEN?.trim()) {
    throw new Error(
      'WORKFLOW_API_TOKEN é obrigatório no Next.js em produção. Configure o segredo no servidor para o proxy em app/api/backend.',
    )
  }
  if (!process.env.PLATFORM_SESSION_SECRET?.trim()) {
    throw new Error(
      'PLATFORM_SESSION_SECRET é obrigatório no Next.js em produção (cookie assinado para o proxy /api/backend).',
    )
  }
}
