import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth';

/**
 * Gate de acesso do site (no Next 16 o antigo `middleware` chama-se `proxy`).
 * Toda rota não pública exige uma sessão válida; caso contrário:
 *  - rotas `/api/*` → 401 JSON;
 *  - páginas → redirect para `/login?next=<rota>`.
 */

// Caminhos acessíveis sem sessão (a própria tela de login e suas APIs).
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.next();
  }

  // Não autenticado.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ detail: 'Não autenticado.' }, { status: 401 });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.search = '';
  url.searchParams.set('next', `${pathname}${search}`);
  return NextResponse.redirect(url);
}

export const config = {
  // Roda em tudo, menos estáticos e as pastas de imagem públicas (para a tela
  // de login conseguir carregar o logo). A allowlist acima trata /login e /api/auth.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos|mascots|meta|patterns).*)'],
};
