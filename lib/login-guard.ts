import { timingSafeEqual } from 'node:crypto';

/**
 * Verificação de credenciais + rate limit do login.
 *
 * Usa `node:crypto`, por isso fica separado de `lib/auth.ts` (que é importado
 * pelo proxy). Só o Route Handler de login (`/api/auth/login`, runtime Node)
 * importa este módulo.
 */

/** Comparação em tempo constante que não vaza o comprimento da string. */
function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Compara contra si mesmo para manter o tempo aproximadamente constante.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Valida usuário/senha contra AUTH_USERNAME/AUTH_PASSWORD. `false` se env ausente. */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;
  if (!expectedUser || !expectedPass) return false;

  // Avalia ambos sempre (sem short-circuit) para não vazar qual campo falhou.
  const okUser = constantTimeEqual(username, expectedUser);
  const okPass = constantTimeEqual(password, expectedPass);
  return okUser && okPass;
}

// ---------------------------------------------------------------------------
// Rate limit (em memória, por instância — best-effort; adequado a VPS single-instance).
// ---------------------------------------------------------------------------

type Attempt = { fails: number; firstAt: number; lockedUntil: number };

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000; // janela de contagem das falhas
const LOCK_MS = 15 * 60 * 1000; // bloqueio após estourar MAX_FAILS

const attempts = new Map<string, Attempt>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil > now) {
    return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) };
  }
  // Janela expirou → zera o histórico.
  if (now - entry.firstAt > WINDOW_MS) {
    attempts.delete(ip);
  }
  return { allowed: true };
}

export function registerFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { fails: 1, firstAt: now, lockedUntil: 0 });
    return;
  }
  entry.fails += 1;
  if (entry.fails >= MAX_FAILS) {
    entry.lockedUntil = now + LOCK_MS;
  }
}

export function resetRateLimit(ip: string): void {
  attempts.delete(ip);
}

/** Extrai o IP do cliente respeitando proxies reversos (X-Forwarded-For / X-Real-IP). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
