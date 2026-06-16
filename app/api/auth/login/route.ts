import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  createSession,
  cookieOptions,
  sessionMaxAgeSeconds,
  safeNextPath,
} from '@/lib/auth';
import {
  verifyCredentials,
  checkRateLimit,
  registerFailure,
  resetRateLimit,
  clientIp,
} from '@/lib/login-guard';

/** Login está configurado apenas se as três variáveis essenciais existem. */
function authConfigured(): boolean {
  return Boolean(
    process.env.AUTH_USERNAME && process.env.AUTH_PASSWORD && process.env.AUTH_SECRET,
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: NextRequest) {
  // Fail-closed: sem credenciais/segredo no servidor, ninguém entra.
  if (!authConfigured()) {
    return NextResponse.json(
      { detail: 'Login não configurado no servidor. Defina AUTH_USERNAME, AUTH_PASSWORD e AUTH_SECRET.' },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { detail: 'Muitas tentativas. Tente novamente mais tarde.', retryAfter: rate.retryAfter },
      { status: 429 },
    );
  }

  let body: { username?: unknown; password?: unknown; next?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const next = typeof body.next === 'string' ? body.next : '/';

  if (!verifyCredentials(username, password)) {
    registerFailure(ip);
    await sleep(400); // atraso fixo mitiga brute-force e reduz sinal de timing
    return NextResponse.json({ detail: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  resetRateLimit(ip);

  const token = await createSession(username);
  if (!token) {
    return NextResponse.json({ detail: 'Falha ao criar a sessão.' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, redirect: safeNextPath(next) });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions(sessionMaxAgeSeconds()));
  return res;
}
