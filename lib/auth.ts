import { SignJWT, jwtVerify } from 'jose';

/**
 * Núcleo de sessão do login do PAPE.
 *
 * Mantido livre de `node:crypto` de propósito: este módulo é importado pelo
 * `proxy.ts` (o gate de acesso). Assim o grafo do proxy depende apenas de `jose`,
 * que é seguro tanto no runtime Node quanto no Edge.
 */

export const SESSION_COOKIE = 'meta_session';

const DEFAULT_SESSION_HOURS = 12;

/** Deriva a chave de assinatura a partir de AUTH_SECRET. `null` = fail-closed. */
function getSecretKey(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET;
  // Exige um segredo minimamente robusto; abaixo disso tratamos como não configurado.
  if (!secret || secret.length < 16) return null;
  return new TextEncoder().encode(secret);
}

/** Duração da sessão em segundos (AUTH_SESSION_HOURS, padrão 12h). */
export function sessionMaxAgeSeconds(): number {
  const raw = Number(process.env.AUTH_SESSION_HOURS);
  const hours = Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_SESSION_HOURS;
  return Math.floor(hours * 3600);
}

/** Emite um JWT HS256 assinado para a sessão. `null` se AUTH_SECRET ausente. */
export async function createSession(subject: string): Promise<string | null> {
  const key = getSecretKey();
  if (!key) return null;

  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(subject)
    .setIssuedAt(now)
    .setExpirationTime(now + sessionMaxAgeSeconds())
    .sign(key);
}

/** Valida o token da sessão. Retorna `false` em qualquer erro/expiração/segredo ausente. */
export async function verifySession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const key = getSecretKey();
  if (!key) return false;
  try {
    await jwtVerify(token, key, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

/** Opções padrão do cookie de sessão. `secure` só em produção (permite http://localhost). */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Garante que o redirecionamento pós-login é um caminho relativo seguro.
 * Bloqueia URLs absolutas, protocol-relative (`//`) e truques com `\` — anti open-redirect.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || typeof next !== 'string') return '/';
  if (!next.startsWith('/')) return '/';
  if (next.startsWith('//') || next.startsWith('/\\')) return '/';
  return next;
}
