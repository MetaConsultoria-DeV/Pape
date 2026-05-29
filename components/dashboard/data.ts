import type { DashboardData } from './types';
import { SERVER_API_URL } from '@/lib/api';

export async function getDashboardData(
  projetoId?: string,
  dataInicio?: string,
  dataFim?: string
): Promise<DashboardData | null> {
  try {
    let url = `${SERVER_API_URL}/dashboard/pape`;
    const params = new URLSearchParams();
    if (projetoId) {
      params.append('projeto_id', projetoId);
    }
    if (dataInicio) {
      params.append('data_inicio', dataInicio);
    }
    if (dataFim) {
      params.append('data_fim', dataFim);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    const response = await fetch(url, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Erro ao carregar dados do dashboard:', response.status, response.statusText);
      return null;
    }

    return await response.json() as DashboardData;
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    return null;
  }
}
