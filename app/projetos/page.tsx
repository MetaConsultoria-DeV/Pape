import PapeHeader from '@/components/PapeHeader';
import ProjetosList from '@/components/ProjetosList';
import { SERVER_API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';

async function getProjetos() {
  try {
    const res = await fetch(`${SERVER_API_URL}/projetos/all`, { cache: 'no-store' });
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
        backHref="/"
        backLabel="Voltar ao PAPE"
        actionHref="/novo-projeto" 
        actionLabel="Criar novo projeto" 
        dashboardHref="/dashboard"
        dashboardLabel="Ver Dashboard"
      />
      <ProjetosList initialProjects={projetos} />
    </div>
  );
}
