import { NextRequest, NextResponse } from 'next/server';
import { SERVER_API_URL, proxyWrite } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gerenteId = searchParams.get('gerente_id');
  const targetUrl = new URL(`${SERVER_API_URL}/projetos`);
  if (gerenteId) {
    targetUrl.searchParams.set('gerente_id', gerenteId);
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
      },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 0 },
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao buscar projetos do backend:', error);
    return NextResponse.json(
      { detail: 'Backend indisponível. Tente novamente em instantes.' },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  const payload = await req.text();
  return proxyWrite('/projetos', 'POST', payload);
}
