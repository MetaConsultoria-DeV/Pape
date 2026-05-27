import type { DashboardSlug } from './types';

export const DEFAULT_DASHBOARD_SLUG: DashboardSlug = 'visao-geral';

export const DASHBOARD_SECTIONS: Array<{
  slug: DashboardSlug;
  label: string;
  enabled: boolean;
}> = [
  { slug: 'visao-geral', label: 'Visão Geral', enabled: true },
  { slug: 'riscos', label: 'Riscos', enabled: true },
  { slug: 'metodo-e-escopo', label: 'Método e Escopo', enabled: true },
  { slug: 'cliente-e-orientacao', label: 'Cliente e Orientação', enabled: true },
  { slug: 'agil', label: 'Ágil', enabled: false },
  { slug: 'detalhe', label: 'Detalhe', enabled: false },
];

export const ENABLED_DASHBOARD_SLUGS = DASHBOARD_SECTIONS
  .filter((section) => section.enabled)
  .map((section) => section.slug);

export const STATUS_ORDER = ['Atrasado', 'Com risco de atraso', 'Dentro do prazo', 'Concluido'];
export const COMPLETION_ORDER = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];

export const CHART_COLORS = [
  'var(--meta-blue-light)',
  'var(--meta-blue)',
  'var(--meta-blue-accent)',
  'var(--meta-warning)',
  'var(--meta-success)',
  'var(--meta-navy-50)',
];

export function isEnabledDashboardSlug(slug: string): slug is DashboardSlug {
  return ENABLED_DASHBOARD_SLUGS.includes(slug as DashboardSlug);
}

export function getDashboardSection(slug: DashboardSlug) {
  return DASHBOARD_SECTIONS.find((section) => section.slug === slug);
}
