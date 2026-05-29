import { NextRequest } from 'next/server';
import { proxyWrite } from '@/lib/api';

export async function POST(req: NextRequest) {
  const payload = await req.text();
  return proxyWrite('/projetos', 'POST', payload);
}
