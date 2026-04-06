import { NextRequest, NextResponse } from 'next/server'
import {
  PROXY_SESSION_COOKIE,
  verifyProxySessionValue,
} from '@/lib/proxy-session'

/** Vercel Pro: aumentar limite para POST /workflow-runs (planejamento pode levar minutos). */
export const maxDuration = 300
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function upstreamBase(): string {
  const raw =
    process.env.WORKFLOW_API_UPSTREAM_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    'http://localhost:8000'
  return raw.replace(/\/$/, '')
}

function serverToken(): string | undefined {
  return process.env.WORKFLOW_API_TOKEN?.trim() || undefined
}

/** Apenas rotas usadas por `platform/lib/api.ts` (UI). Tudo o resto → 403. */
const ALLOWED: ReadonlyArray<{ pattern: RegExp; methods: ReadonlySet<string> }> = [
  { pattern: /^\/config$/, methods: new Set(['GET', 'HEAD', 'POST']) },
  { pattern: /^\/clients$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/clients\/[^/]+$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/clients\/[^/]+\/context$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/outputs$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/outputs\/client\/[^/]+$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/outputs\/[^/]+$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/workflow-runs$/, methods: new Set(['GET', 'HEAD', 'POST']) },
  { pattern: /^\/workflow-runs\/templates$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/workflow-runs\/[^/]+$/, methods: new Set(['GET', 'HEAD']) },
  {
    pattern: /^\/workflow-runs\/[^/]+\/steps\/[^/]+\/stream$/,
    methods: new Set(['GET', 'HEAD']),
  },
  {
    pattern: /^\/workflow-runs\/[^/]+\/steps\/[^/]+\/approve$/,
    methods: new Set(['POST']),
  },
  {
    pattern: /^\/workflow-runs\/[^/]+\/steps\/[^/]+\/reject$/,
    methods: new Set(['POST']),
  },
  {
    pattern: /^\/workflow-runs\/[^/]+\/steps\/[^/]+\/rebrief$/,
    methods: new Set(['POST']),
  },
  { pattern: /^\/clients\/[^/]+\/workflow-runs$/, methods: new Set(['GET', 'HEAD']) },
  { pattern: /^\/generate\/hooks$/, methods: new Set(['POST']) },
  { pattern: /^\/generate\/copy$/, methods: new Set(['POST']) },
  { pattern: /^\/generate\/calendar$/, methods: new Set(['POST']) },
  { pattern: /^\/generate\/ads$/, methods: new Set(['POST']) },
  { pattern: /^\/generate\/reel-script$/, methods: new Set(['POST']) },
]

function normalizeBackendPath(segments: string[]): string | null {
  if (segments.some((s) => s === '..' || s === '.')) return null
  return '/' + segments.join('/')
}

function isAllowlisted(path: string, method: string): boolean {
  const m = method.toUpperCase()
  return ALLOWED.some((rule) => rule.methods.has(m) && rule.pattern.test(path))
}

/**
 * Limite de chamador: cookie assinado (middleware emite nas rotas da UI).
 * Em produção exige `WORKFLOW_API_TOKEN` e `PLATFORM_SESSION_SECRET` na subida (`instrumentation.ts`);
 * em runtime, cookie válido com o mesmo segredo. Em `NODE_ENV=development` não exige sessão.
 */
async function assertProxyCaller(
  request: NextRequest,
): Promise<NextResponse | null> {
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  const secret = process.env.PLATFORM_SESSION_SECRET?.trim()
  if (!secret) {
    return NextResponse.json(
      {
        detail:
          'PLATFORM_SESSION_SECRET não configurado no servidor (proxy exige sessão assinada).',
      },
      { status: 503 },
    )
  }

  const cookie = request.cookies.get(PROXY_SESSION_COOKIE)?.value
  if (!cookie || !(await verifyProxySessionValue(cookie, secret))) {
    return NextResponse.json(
      { detail: 'Sessão inválida ou ausente. Abra a aplicação no browser e tente novamente.' },
      { status: 401 },
    )
  }
  return null
}

async function proxy(request: NextRequest, pathSegments: string[]) {
  const path = normalizeBackendPath(pathSegments)
  if (!path) {
    return NextResponse.json({ detail: 'Caminho inválido.' }, { status: 400 })
  }

  const authErr = await assertProxyCaller(request)
  if (authErr) return authErr

  if (!isAllowlisted(path, request.method)) {
    return NextResponse.json(
      { detail: 'Rota não permitida pelo proxy.' },
      { status: 403 },
    )
  }

  const token = serverToken()

  if (process.env.NODE_ENV === 'production' && !token) {
    return NextResponse.json(
      { detail: 'WORKFLOW_API_TOKEN não configurado no servidor (proxy app/api/backend).' },
      { status: 503 },
    )
  }

  const url = `${upstreamBase()}${path}${request.nextUrl.search}`

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (
      k === 'host' ||
      k === 'connection' ||
      k === 'content-length' ||
      k === 'cookie' ||
      k === 'authorization'
    ) {
      return
    }
    headers.set(key, value)
  })
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const init: RequestInit & { duplex?: string } = {
    method: request.method,
    headers,
    redirect: 'manual',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = request.body
    init.duplex = 'half'
  }

  const res = await fetch(url, init)

  const out = new Headers()
  res.headers.forEach((value, key) => {
    const k = key.toLowerCase()
    if (k === 'transfer-encoding') return
    out.set(key, value)
  })

  return new NextResponse(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: out,
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return proxy(request, params.path)
}
