import { NextRequest } from 'next/server';
import { proxyWrite } from '@/lib/api';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyWrite(`/acompanhamentos/${id}`, 'DELETE');
}
