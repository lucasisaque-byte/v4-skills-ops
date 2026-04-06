import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  PROXY_SESSION_COOKIE,
  createProxySessionValue,
  verifyProxySessionValue,
} from '@/lib/proxy-session'

/**
 * Emite cookie de sessão assinado nas rotas da UI para que o browser envie
 * o mesmo cookie nas chamadas same-origin ao proxy `/api/backend`.
 * A validação efetiva ocorre no route handler (defesa + 401).
 * Em produção, `PLATFORM_SESSION_SECRET` é obrigatório na subida (`instrumentation.ts`);
 * se ausente em runtime, responde 503 (alinhado ao proxy em `app/api/backend`).
 */
export async function middleware(request: NextRequest) {
  const secret = process.env.PLATFORM_SESSION_SECRET?.trim()
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse(
        'PLATFORM_SESSION_SECRET não configurado no servidor (proxy exige sessão assinada).',
        { status: 503 },
      )
    }
    return NextResponse.next()
  }

  const raw = request.cookies.get(PROXY_SESSION_COOKIE)?.value
  const valid = raw ? await verifyProxySessionValue(raw, secret) : false
  if (valid) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const token = await createProxySessionValue(secret)
  res.cookies.set(PROXY_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}

export const config = {
  matcher: [
    // Não incluir `/api/*`: o cookie precisa ser emitido antes (rotas da UI) para ir no request ao proxy.
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
