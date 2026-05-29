import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_API_URL ?? 'http://localhost:8000/api';
const TOKEN = process.env.ADMIN_API_TOKEN ?? '';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await req.text();
  const res = await fetch(`${BACKEND}/projetos/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${TOKEN}`, 'content-type': 'application/json' },
    body: payload,
  });
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'content-type': 'application/json' } });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/projetos/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'content-type': 'application/json' } });
}
