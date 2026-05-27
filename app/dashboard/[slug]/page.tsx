import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DashboardShell, ErrorState } from '@/components/dashboard/Chrome';
import { getDashboardSection, isEnabledDashboardSlug } from '@/components/dashboard/config';
import { getDashboardData } from '@/components/dashboard/data';
import { DashboardSectionContent } from '@/components/dashboard/Sections';

export const dynamic = 'force-dynamic';

type DashboardRouteProps = {
  params: Promise<{
    slug: string;
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

export default async function DashboardSlugPage({ params }: DashboardRouteProps) {
  const { slug } = await params;

  if (!isEnabledDashboardSlug(slug)) {
    notFound();
  }

  const data = await getDashboardData();

  if (!data) {
    return <ErrorState />;
  }

  return (
    <DashboardShell activeSlug={slug}>
      <DashboardSectionContent slug={slug} data={data} />
    </DashboardShell>
  );
}
