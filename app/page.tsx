import { Projeto } from '@/lib/types';
import PapeHeader from '@/components/PapeHeader';
import PapeForm from '@/components/PapeForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

async function getProjetos(): Promise<Projeto[]> {
  try {
    const res = await fetch(`${API_URL}/projetos`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Page() {
  const projetos = await getProjetos();

  return (
    <div className="meta-bg">
      <PapeHeader />
      <PapeForm projetos={projetos} />
    </div>
  );
}
