import { NextRequest, NextResponse } from 'next/server';

// Base usada no NAVEGADOR (client components / formulários públicos).
export const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// Base usada em fetches no SERVIDOR (Server Components / Route Handlers).
// Cai para a pública se BACKEND_API_URL não estiver definida.
export const SERVER_API_URL = process.env.BACKEND_API_URL ?? PUBLIC_API_URL;

const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? '';

/** Valida se a senha de confirmação enviada pelo cliente é correta. */
export function validateConfirmationPassword(req: NextRequest): NextResponse | null {
  const confirmationPassword = req.headers.get('x-confirmation-password');
  const serverPassword = process.env.CONFIRMATION_PASSWORD || 'meta';

  if (confirmationPassword !== serverPassword) {
    return NextResponse.json(
      { detail: 'Senha de confirmação incorreta.' },
      { status: 401 },
    );
  }
  return null;
}

/** Encaminha uma requisição de escrita ao backend FastAPI injetando o token de admin. */
export async function proxyWrite(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: string,
): Promise<NextResponse> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body,
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'Backend indisponível. Tente novamente em instantes.' },
      { status: 502 },
    );
  }
}
