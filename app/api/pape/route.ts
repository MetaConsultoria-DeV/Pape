import { NextRequest, NextResponse } from 'next/server';
import { SERVER_API_URL } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const res = await fetch(`${SERVER_API_URL}/pape`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: payload,
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { 'content-type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao enviar PAPE para o backend:', error);
    return NextResponse.json(
      { detail: 'Backend indisponível. Tente novamente em instantes.' },
      { status: 502 },
    );
  }
}
