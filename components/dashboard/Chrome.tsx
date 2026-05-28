import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Gauge,
  LayoutDashboard,
  Star,
  Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { DASHBOARD_SECTIONS, getDashboardSection } from './config';
import type { DashboardSlug } from './types';
import { formatNumber, getScoreTone, getStatusVariant } from './utils';

function getSectionIcon(slug: DashboardSlug): LucideIcon {
  if (slug === 'riscos') {
    return AlertTriangle;
  }
  if (slug === 'metodo-e-escopo') {
    return Target;
  }
  if (slug === 'cliente-e-orientacao') {
    return Star;
  }
  if (slug === 'agil') {
    return Gauge;
  }
  if (slug === 'detalhe') {
    return ClipboardList;
  }
  return LayoutDashboard;
}

export function LoadingState() {
  return (
    <div className="meta-bg flex min-h-screen items-center justify-center">
      <div className="dashboard-loading" aria-label="Carregando dashboard">
        <Image
          src="/logos/symbol.svg"
          alt="Meta Consultoria"
          width={76}
          height={76}
          className="animate-pulse"
          priority
        />
        <span>Carregando indicadores</span>
      </div>
    </div>
  );
}

export function ErrorState() {
  return (
    <div className="meta-bg flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Image src="/mascots/skull.png" alt="" width={150} height={150} />
      <div>
        <h1 className="h4 text-meta-danger">Erro ao carregar os dados.</h1>
        <p className="mt-3 max-w-md text-sm font-medium leading-6 text-meta-navy-50">
          Não conseguimos conectar com a API configurada. Verifique se o servidor
          está rodando e tente novamente.
        </p>
      </div>
      <Link href="/" className="btn btn-primary">
        <ArrowLeft size={18} aria-hidden="true" />
        Voltar para o formulário
      </Link>
    </div>
  );
}

export function DashboardDataError() {
  return (
    <section className="dashboard-card dashboard-project-card" aria-label="Erro ao carregar dados do dashboard">
      <SectionHeader
        icon={AlertTriangle}
        eyebrow="Conexão"
        title="Não conseguimos carregar os dados."
        description="A navegação do dashboard continua disponível, mas os indicadores dependem da API do PAPE estar respondendo."
      />
      <div className="dashboard-empty">
        <AlertTriangle size={24} aria-hidden="true" />
        <span>Verifique o servidor da API e atualize a página.</span>
      </div>
    </section>
  );
}

export function DashboardShell({
  activeSlug,
  children,
}: {
  activeSlug: DashboardSlug;
  children: ReactNode;
}) {
  const activeSection = getDashboardSection(activeSlug);

  return (
    <div className="meta-bg min-h-screen pb-20">
      <header className="meta-header">
        <div className="meta-header-inner dashboard-header-wide">
          <div className="meta-header-top">
            <Image
              src="/logos/wordmark-dark.png"
              alt="Meta Consultoria"
              width={126}
              height={36}
              priority
              style={{ width: 'auto', height: 36 }}
            />

            <Link href="/" className="meta-header-action">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar ao formulário
            </Link>
          </div>

          <div className="dashboard-hero-copy">
            <span className="eyebrow">{activeSection?.label ?? 'Dashboard'}</span>
            <h1 className="h1">Dashboard PAPE</h1>
            <p>
              Status atual da carteira de projetos externos, inspirado no Power BI
              e recalculado a partir da resposta mais recente de cada projeto.
            </p>
          </div>
        </div>
      </header>

      <main className="dashboard-shell">
        <nav className="dashboard-tabs" aria-label="Seções do dashboard">
          {DASHBOARD_SECTIONS.filter((section) => section.enabled).map((section) => {
            const Icon = getSectionIcon(section.slug);
            const active = section.slug === activeSlug;

            return (
              <Link
                className={`dashboard-tab ${active ? 'dashboard-tab-active' : ''}`}
                href={`/dashboard/${section.slug}`}
                aria-current={active ? 'page' : undefined}
                key={section.slug}
              >
                <Icon size={18} aria-hidden />
                {section.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </main>
    </div>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  detail,
  featured,
  tone = 'default',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  featured?: boolean;
  tone?: 'default' | 'warning' | 'danger' | 'success';
}) {
  return (
    <article className={`dashboard-stat dashboard-stat-${tone} ${featured ? 'dashboard-stat-featured' : ''}`}>
      <div className="dashboard-stat-top">
        <span className="dashboard-icon-badge">
          <Icon size={20} aria-hidden />
        </span>
        <span>{label}</span>
      </div>
      <div className="dashboard-stat-value">
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      <p>{detail}</p>
    </article>
  );
}

export function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="dashboard-section-header">
      <span className="dashboard-icon-badge">
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <span className="eyebrow text-meta-blue">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function EmptyChart({ message }: { message: string }) {
  return (
    <div className="dashboard-empty">
      <Activity size={24} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`dashboard-status-badge dashboard-status-${getStatusVariant(status)}`}>
      {status === 'Concluido' ? 'Concluído' : status}
    </span>
  );
}

export function ScoreBadge({ value }: { value: number }) {
  const tone = getScoreTone(value);

  return (
    <span className={`dashboard-score-badge dashboard-score-badge-${tone}`}>
      {formatNumber(value)}
    </span>
  );
}
