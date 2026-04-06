/**
 * Cookie de sessão assinado (HMAC-SHA256) para o proxy `/api/backend`.
 * Usa Web Crypto para funcionar no middleware (Edge) e no route handler (Node).
 */
export const PROXY_SESSION_COOKIE = 'workflow_platform_session'

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(base64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function createProxySessionValue(secret: string): Promise<string> {
  const payload = {
    v: 1 as const,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
    n: crypto.randomUUID(),
  }
  const payloadBytes = new TextEncoder().encode(JSON.stringify(payload))
  const key = await importHmacKey(secret)
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, payloadBytes))
  return `${bytesToBase64Url(payloadBytes)}.${bytesToBase64Url(sig)}`
}

export async function verifyProxySessionValue(value: string, secret: string): Promise<boolean> {
  const parts = value.split('.')
  if (parts.length !== 2) return false
  let payloadBytes: Uint8Array
  let sigBytes: Uint8Array
  try {
    payloadBytes = base64UrlToBytes(parts[0]!)
    sigBytes = base64UrlToBytes(parts[1]!)
  } catch {
    return false
  }
  const key = await importHmacKey(secret)
  const ok = await crypto.subtle.verify(
    'HMAC',
    key,
    sigBytes as unknown as BufferSource,
    payloadBytes as unknown as BufferSource,
  )
  if (!ok) return false
  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number }
    if (typeof payload.exp !== 'number' || payload.exp <= Date.now()) return false
    return true
  } catch {
    return false
  }
}
