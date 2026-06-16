import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE, verifySession, safeNextPath } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Entrar — PAPE',
  description: 'Acesso restrito ao Plano de Acompanhamento de Projetos Externos.',
};

// A sessão depende de cookies → renderização dinâmica.
export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = safeNextPath(next);

  // Já autenticado? Não faz sentido mostrar o login.
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) {
    redirect(target);
  }

  return (
    <div className="meta-bg login-shell">
      <LoginForm next={target} />
    </div>
  );
}
