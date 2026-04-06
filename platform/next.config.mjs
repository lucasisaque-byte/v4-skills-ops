/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
}

/**
 * API (produção)
 * ─────────────────────────────────────────────────────────────────────────
 * O cliente chama o proxy same-origin `app/api/backend` (veja `platform/lib/api.ts`).
 * O upstream FastAPI e `WORKFLOW_API_TOKEN` ficam só no servidor — veja `platform/README.md`.
 */
export default nextConfig
