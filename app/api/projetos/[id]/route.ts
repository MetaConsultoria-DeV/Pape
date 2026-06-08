import { NextRequest } from 'next/server';
import { proxyWrite, validateConfirmationPassword } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateConfirmationPassword(req);
  if (authError) return authError;

  const { id } = await params;
  const payload = await req.text();
  return proxyWrite(`/projetos/${id}`, 'PUT', payload);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateConfirmationPassword(req);
  if (authError) return authError;

  const { id } = await params;
  return proxyWrite(`/projetos/${id}`, 'DELETE');
}
