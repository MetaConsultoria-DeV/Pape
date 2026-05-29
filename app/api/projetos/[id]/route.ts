import { NextRequest } from 'next/server';
import { proxyWrite } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = await req.text();
  return proxyWrite(`/projetos/${id}`, 'PUT', payload);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyWrite(`/projetos/${id}`, 'DELETE');
}
