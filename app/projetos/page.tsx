import PapeHeader from '@/components/PapeHeader';
import ProjetosList from '@/components/ProjetosList';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const dynamic = 'force-dynamic';

async function getProjetos() {
  try {
    const res = await fetch(`${API_URL}/projetos/all`, { cache: 'no-store' });
    if (!res.ok) {
      console.error('HTTP error fetching projects:', res.status);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return [];
  }
}

export default async function ProjetosPage() {
  const projetos = await getProjetos();

  return (
    <div className="meta-bg">
      <PapeHeader 
        actionHref="/novo-projeto" 
        actionLabel="Criar novo projeto" 
        dashboardHref="/dashboard"
        dashboardLabel="Ver Dashboard"
      />
      <ProjetosList initialProjects={projetos} />
    </div>
  );
}
