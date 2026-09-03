import type { ChartDatum, DashboardData } from './types';

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

export function formatDate(value?: string) {
  if (!value) {
    return 'Sem data';
  }

  try {
    const cleanDate = value.includes('T') ? value.split('T')[0] : value.split(' ')[0];
    const dateObj = new Date(`${cleanDate}T00:00:00`);
    if (isNaN(dateObj.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return value;
  }
}

export function entriesToChartData(entries: Record<string, number>, order?: string[]) {
  const mapped = Object.entries(entries).map(([name, value]) => ({ name, value }));

  if (!order) {
    return mapped.sort((a, b) => b.value - a.value);
  }

  const known = order.map((name) => ({
    name,
    value: entries[name] ?? 0,
  }));
  const extras = mapped.filter((item) => !order.includes(item.name));

  return [...known, ...extras];
}

export function getTotal(items: ChartDatum[]) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

export function getStatusCount(data: DashboardData, status: string) {
  return data.status_cronograma[status] ?? 0;
}

export function getStatusVariant(status: string) {
  if (status === 'Atrasado') {
    return 'danger';
  }
  if (status === 'Com risco de atraso') {
    return 'warning';
  }
  if (status === 'Dentro do prazo') {
    return 'success';
  }
  return 'neutral';
}

export function getScoreTone(value: number): 'default' | 'warning' | 'danger' | 'success' {
  if (value === 0) {
    return 'default';
  }
  if (value <= 2) {
    return 'danger';
  }
  if (value <= 3) {
    return 'warning';
  }
  return 'success';
}
