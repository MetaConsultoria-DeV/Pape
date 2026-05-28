import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardDataError, DashboardShell } from '@/components/dashboard/Chrome';
import { getDashboardSection, isEnabledDashboardSlug } from '@/components/dashboard/config';
import { getDashboardData } from '@/components/dashboard/data';
import { DashboardSectionContent } from '@/components/dashboard/Sections';

export const dynamic = 'force-dynamic';

type DashboardRouteProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    projeto_id?: string;
    data_inicio?: string;
    data_fim?: string;
  }>;
};

export async function generateMetadata({ params }: DashboardRouteProps): Promise<Metadata> {
  const { slug } = await params;

  if (!isEnabledDashboardSlug(slug)) {
    return {
      title: 'Dashboard PAPE',
    };
  }

  const section = getDashboardSection(slug);

  return {
    title: `${section?.label ?? 'Dashboard'} | PAPE`,
  };
}

export default async function DashboardSlugPage({ params, searchParams }: DashboardRouteProps) {
  const { slug } = await params;
  const { projeto_id, data_inicio, data_fim } = await searchParams;

  if (!isEnabledDashboardSlug(slug)) {
    notFound();
  }

  const data = await getDashboardData(projeto_id, data_inicio, data_fim);

  if (!data) {
    return (
      <DashboardShell activeSlug={slug} datasDisponiveis={[]}>
        <DashboardDataError />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell activeSlug={slug} datasDisponiveis={data.datas_disponiveis}>
      <DashboardSectionContent slug={slug} data={data} />
    </DashboardShell>
  );
}
