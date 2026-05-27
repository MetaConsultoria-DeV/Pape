'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  PieChartIcon,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DashboardData {
  total_projetos: number;
  media_satisfacao: number;
  metodologias: Record<string, number>;
  status_cronograma: Record<string, number>;
}

type ChartDatum = {
  name: string;
  value: number;
};

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number;
  payload?: ChartDatum;
};

const CHART_COLORS = [
  'var(--meta-blue-light)',
  'var(--meta-blue)',
  'var(--meta-blue-accent)',
  'var(--meta-warning)',
  'var(--meta-success)',
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function entriesToChartData(entries: Record<string, number>) {
  return Object.entries(entries)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getTotal(items: ChartDatum[]) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0];
  const name = item.payload?.name ?? label ?? item.name;

  return (
    <div className="dashboard-tooltip">
      <span className="dashboard-tooltip-label">{name}</span>
      <strong>{item.value ?? 0}</strong>
    </div>
  );
}

function LoadingState() {
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

function ErrorState() {
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

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  detail,
  featured,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  featured?: boolean;
}) {
  return (
    <article className={`dashboard-stat ${featured ? 'dashboard-stat-featured' : ''}`}>
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

function SectionHeader({
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

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="dashboard-empty">
      <Activity size={24} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

function ChartLegend({ data }: { data: ChartDatum[] }) {
  const total = getTotal(data);

  return (
    <div className="dashboard-legend" aria-label="Legenda do gráfico">
      {data.map((item, index) => {
        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;

        return (
          <div key={item.name} className="dashboard-legend-item">
            <span
              className="dashboard-legend-swatch"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="dashboard-legend-name">{item.name}</span>
            <strong>{percentage}%</strong>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<DashboardData>(`${API_URL}/dashboard/pape`)
      .then((res) => setData(res.data))
      .catch((err) => console.error('Erro ao carregar dados do dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  const metodologiasData = useMemo(
    () => entriesToChartData(data?.metodologias ?? {}),
    [data?.metodologias],
  );

  const cronogramaData = useMemo(
    () => entriesToChartData(data?.status_cronograma ?? {}),
    [data?.status_cronograma],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState />;
  }

  const noPrazo = data.status_cronograma['Dentro do prazo'] ?? 0;
  const emAtencao =
    (data.status_cronograma['Com risco de atraso'] ?? 0) +
    (data.status_cronograma.Atrasado ?? 0);
  const concluidos =
    data.status_cronograma.Concluido ??
    data.status_cronograma['Concluído'] ??
    data.status_cronograma['Concluido'] ??
    0;
  const satisfacaoPercent = Math.min(Math.max((data.media_satisfacao / 5) * 100, 0), 100);

  return (
    <div className="meta-bg min-h-screen pb-20">
      <header className="meta-header">
        <div className="meta-header-inner">
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
            <span className="eyebrow">Inteligência PAPE</span>
            <h1 className="h1">Dashboard PAPE</h1>
            <p>
              Uma leitura executiva dos projetos externos acompanhados, com foco em
              satisfação, metodologia e saúde do cronograma.
            </p>
          </div>
        </div>
      </header>

      <main className="dashboard-shell">
        <section className="dashboard-hero-panel" aria-label="Resumo do dashboard">
          <div>
            <span className="eyebrow text-meta-blue">Resumo geral</span>
            <h2>Visão de carteira em tempo real</h2>
            <p>
              Os indicadores abaixo consolidam as respostas do PAPE para apoiar
              decisões de acompanhamento e priorização.
            </p>
          </div>

          <div className="dashboard-satisfaction" aria-label="Satisfação média">
            <div>
              <span>Satisfação média</span>
              <strong>{formatNumber(data.media_satisfacao)}</strong>
            </div>
            <div className="dashboard-score-track" aria-hidden="true">
              <span style={{ width: `${satisfacaoPercent}%` }} />
            </div>
          </div>
        </section>

        <section className="dashboard-stats-grid" aria-label="Indicadores principais">
          <StatCard
            icon={ClipboardList}
            label="Projetos avaliados"
            value={formatNumber(data.total_projetos)}
            detail="Base consolidada de respostas registradas."
            featured
          />
          <StatCard
            icon={Star}
            label="Satisfação média"
            value={formatNumber(data.media_satisfacao)}
            suffix="/5"
            detail="Percepção geral dos projetos acompanhados."
          />
          <StatCard
            icon={CheckCircle2}
            label="No prazo"
            value={formatNumber(noPrazo)}
            detail="Projetos com cronograma dentro do planejado."
          />
          <StatCard
            icon={Clock3}
            label="Em atenção"
            value={formatNumber(emAtencao)}
            detail="Projetos com risco de atraso ou já atrasados."
          />
        </section>

        <section className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Target}
            eyebrow="Metodologia"
            title="Modelos de gerenciamento"
            description="Distribuição das abordagens usadas nos projetos externos."
          />

          {metodologiasData.length === 0 ? (
            <EmptyChart message="Aguardando novas respostas para montar este gráfico." />
          ) : (
            <div className="dashboard-chart-layout">
              <div className="dashboard-pie">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metodologiasData}
                      cx="50%"
                      cy="50%"
                      innerRadius="62%"
                      outerRadius="84%"
                      paddingAngle={5}
                      dataKey="value"
                      stroke="var(--meta-white)"
                      strokeWidth={4}
                    >
                      {metodologiasData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="dashboard-pie-center" aria-hidden="true">
                  <strong>{getTotal(metodologiasData)}</strong>
                  <span>respostas</span>
                </div>
              </div>
              <ChartLegend data={metodologiasData} />
            </div>
          )}
        </section>

        <section className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={BarChart2}
            eyebrow="Cronograma"
            title="Status dos projetos"
            description="Leitura do andamento por status informado pelos respondentes."
          />

          {cronogramaData.length === 0 ? (
            <EmptyChart message="Aguardando dados de cronograma para exibir o comparativo." />
          ) : (
            <div className="dashboard-bar-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cronogramaData} margin={{ top: 20, right: 8, left: -18, bottom: 56 }}>
                  <defs>
                    <linearGradient id="dashboardBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--meta-blue-light)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--meta-blue)" stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }}
                    interval={0}
                    angle={-22}
                    textAnchor="end"
                    axisLine={false}
                    tickLine={false}
                    dy={16}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }}
                  />
                  <Bar dataKey="value" fill="url(#dashboardBar)" radius={[8, 8, 0, 0]} maxBarSize={54} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="dashboard-insight-band" aria-label="Indicadores de acompanhamento">
          <div>
            <TrendingUp size={22} aria-hidden="true" />
            <span>Projetos concluídos</span>
            <strong>{formatNumber(concluidos)}</strong>
          </div>
          <div>
            <PieChartIcon size={22} aria-hidden="true" />
            <span>Metodologias mapeadas</span>
            <strong>{formatNumber(metodologiasData.length)}</strong>
          </div>
          <div>
            <Activity size={22} aria-hidden="true" />
            <span>Status registrados</span>
            <strong>{formatNumber(cronogramaData.length)}</strong>
          </div>
        </section>
      </main>
    </div>
  );
}
