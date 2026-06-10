import { NextRequest } from 'next/server';
import { proxyWrite, validateConfirmationPassword, validateNumericId } from '@/lib/api';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = validateConfirmationPassword(req);
  if (authError) return authError;

  const { id } = await params;
  const idError = validateNumericId(id);
  if (idError) return idError;

  return proxyWrite(`/acompanhamentos/${id}`, 'DELETE');
}
