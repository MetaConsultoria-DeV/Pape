'use client';

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Bar,
  BarChart,
  CartesianGrid,
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
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gauge,
  LayoutDashboard,
  PieChartIcon,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface DashboardProject {
  id: number;
  projeto: string;
  gerente: string;
  coordenacao: string;
  status_cronograma: string;
  pct_conclusao: string;
  modelo_gerenciamento: string;
  data_resposta: string;
  satisfacao_cliente?: number | null;
  impacto_cliente?: string | null;
}

interface DashboardData {
  total_projetos: number;
  total_respostas?: number;
  media_satisfacao: number;
  metodologias: Record<string, number>;
  status_cronograma: Record<string, number>;
  pct_conclusao?: Record<string, number>;
  motivos_atraso?: ChartDatum[];
  projetos_atuais?: DashboardProject[];
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
  'var(--meta-navy-50)',
];

const STATUS_ORDER = ['Atrasado', 'Com risco de atraso', 'Dentro do prazo', 'Concluido'];
const COMPLETION_ORDER = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
}

function formatDate(value?: string) {
  if (!value) {
    return 'Sem data';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

function entriesToChartData(entries: Record<string, number>, order?: string[]) {
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

function getTotal(items: ChartDatum[]) {
  return items.reduce((sum, item) => sum + item.value, 0);
}

function getStatusCount(data: DashboardData, status: string) {
  return data.status_cronograma[status] ?? 0;
}

function getStatusVariant(status: string) {
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`dashboard-status-badge dashboard-status-${getStatusVariant(status)}`}>
      {status === 'Concluido' ? 'Concluído' : status}
    </span>
  );
}

function ProjectTable({ projects }: { projects: DashboardProject[] }) {
  if (!projects.length) {
    return <EmptyChart message="Aguardando respostas para montar a lista de projetos." />;
  }

  return (
    <div className="dashboard-table-wrap">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Gerente</th>
            <th>Coordenação</th>
            <th>Status</th>
            <th>Conclusão</th>
            <th>Resposta</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={`${project.id}-${project.data_resposta}`}>
              <td>
                <strong>{project.projeto}</strong>
                <span>{project.modelo_gerenciamento}</span>
              </td>
              <td>{project.gerente}</td>
              <td>{project.coordenacao}</td>
              <td>
                <StatusBadge status={project.status_cronograma} />
              </td>
              <td>{project.pct_conclusao}</td>
              <td>{formatDate(project.data_resposta)}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    () => entriesToChartData(data?.status_cronograma ?? {}, STATUS_ORDER),
    [data?.status_cronograma],
  );

  const conclusaoData = useMemo(
    () => entriesToChartData(data?.pct_conclusao ?? {}, COMPLETION_ORDER),
    [data?.pct_conclusao],
  );

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState />;
  }

  const respostasHistoricas = data.total_respostas ?? data.total_projetos;
  const noPrazo = getStatusCount(data, 'Dentro do prazo');
  const atrasados = getStatusCount(data, 'Atrasado');
  const emRisco = getStatusCount(data, 'Com risco de atraso');
  const emAtencao = atrasados + emRisco;
  const concluidos =
    getStatusCount(data, 'Concluido') +
    getStatusCount(data, 'Concluído');
  const satisfacaoPercent = Math.min(Math.max((data.media_satisfacao / 5) * 100, 0), 100);
  const currentProjects = data.projetos_atuais ?? [];
  const motivosData = data.motivos_atraso ?? [];

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
            <span className="eyebrow">Visão Geral</span>
            <h1 className="h1">Dashboard PAPE</h1>
            <p>
              Status atual da carteira de projetos externos, inspirado na primeira
              página do Power BI e recalculado a partir da resposta mais recente de cada projeto.
            </p>
          </div>
        </div>
      </header>

      <main className="dashboard-shell">
        <nav className="dashboard-tabs" aria-label="Seções do dashboard">
          <button className="dashboard-tab dashboard-tab-active" type="button">
            <LayoutDashboard size={18} aria-hidden />
            Visão Geral
          </button>
          {['Riscos', 'Método e Escopo', 'Cliente e Orientação', 'Ágil', 'Detalhe'].map((label) => (
            <button className="dashboard-tab" type="button" disabled key={label}>
              {label}
            </button>
          ))}
        </nav>

        <section className="dashboard-hero-panel" aria-label="Resumo do dashboard">
          <div>
            <span className="eyebrow text-meta-blue">Status atual</span>
            <h2>Carteira PAPE em acompanhamento</h2>
            <p>
              Esta primeira visão responde: quantos projetos estão ativos no acompanhamento,
              quantos exigem atenção e como a carteira está distribuída por cronograma,
              metodologia e avanço.
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
            <small>{formatNumber(respostasHistoricas)} respostas no histórico</small>
          </div>
        </section>

        <section className="dashboard-stats-grid" aria-label="Indicadores principais">
          <StatCard
            icon={ClipboardList}
            label="Projetos acompanhados"
            value={formatNumber(data.total_projetos)}
            detail="Projetos com pelo menos uma resposta PAPE."
            featured
          />
          <StatCard
            icon={AlertTriangle}
            label="Projetos atrasados"
            value={formatNumber(atrasados)}
            detail="Projetos cujo status atual está atrasado."
            tone="danger"
          />
          <StatCard
            icon={Clock3}
            label="Projetos com risco"
            value={formatNumber(emRisco)}
            detail="Projetos com risco declarado de atraso."
            tone="warning"
          />
          <StatCard
            icon={CheckCircle2}
            label="Dentro do prazo"
            value={formatNumber(noPrazo)}
            detail="Projetos caminhando conforme planejado."
            tone="success"
          />
          <StatCard
            icon={Star}
            label="Satisfação média"
            value={formatNumber(data.media_satisfacao)}
            suffix="/5"
            detail="Média da última resposta por projeto."
          />
        </section>

        <section className="dashboard-overview-grid">
          <div className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={BarChart2}
              eyebrow="Cronograma"
              title="Situação dos projetos"
              description="Distribuição do status atual dos projetos acompanhados."
            />

            {cronogramaData.every((item) => item.value === 0) ? (
              <EmptyChart message="Aguardando dados de cronograma para exibir o comparativo." />
            ) : (
              <div className="dashboard-horizontal-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cronogramaData}
                    layout="vertical"
                    margin={{ top: 8, right: 18, left: 18, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(107, 114, 153, 0.24)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={128}
                      tick={{ fontSize: 12, fill: 'var(--meta-navy)', fontWeight: 700 }}
                      tickFormatter={(value) => (value === 'Concluido' ? 'Concluído' : value)}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={42}>
                      {cronogramaData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={entry.name === 'Atrasado' ? 'var(--meta-danger)' : CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={Target}
              eyebrow="Metodologia"
              title="Modelos de gerenciamento"
              description="Como a carteira atual está dividida por modelo."
            />

            {metodologiasData.length === 0 ? (
              <EmptyChart message="Aguardando novas respostas para montar este gráfico." />
            ) : (
              <div className="dashboard-chart-layout dashboard-chart-layout-compact">
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
                    <span>projetos</span>
                  </div>
                </div>
                <ChartLegend data={metodologiasData} />
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
          <div className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={Gauge}
              eyebrow="Avanço"
              title="Faixa de conclusão"
              description="Quantidade de projetos em cada faixa de conclusão."
            />

            {conclusaoData.every((item) => item.value === 0) ? (
              <EmptyChart message="Aguardando dados de conclusão para exibir este bloco." />
            ) : (
              <div className="dashboard-bar-wrap dashboard-bar-wrap-compact">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={conclusaoData} margin={{ top: 20, right: 8, left: -18, bottom: 16 }}>
                    <CartesianGrid vertical={false} stroke="rgba(107, 114, 153, 0.22)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }} />
                    <Bar dataKey="value" fill="var(--meta-blue)" radius={[8, 8, 0, 0]} maxBarSize={58} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={AlertTriangle}
              eyebrow="Atenção"
              title="Motivos de risco/atraso"
              description="Motivos citados nos projetos em risco ou atrasados."
            />

            {motivosData.length === 0 ? (
              <EmptyChart message="Nenhum motivo de risco/atraso registrado no status atual." />
            ) : (
              <div className="dashboard-horizontal-chart dashboard-horizontal-chart-small">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={motivosData.slice(0, 5)}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 18, bottom: 8 }}
                  >
                    <CartesianGrid horizontal={false} stroke="rgba(107, 114, 153, 0.24)" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={150}
                      tick={{ fontSize: 12, fill: 'var(--meta-navy)', fontWeight: 700 }}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }} />
                    <Bar dataKey="value" fill="var(--meta-warning)" radius={[0, 8, 8, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-card dashboard-project-card">
          <SectionHeader
            icon={TrendingUp}
            eyebrow="Projetos"
            title="Projetos priorizados na visão geral"
            description="Lista ordenada por atraso, risco e data de resposta, usando o status atual de cada projeto."
          />
          <ProjectTable projects={currentProjects} />
        </section>

        <section className="dashboard-insight-band" aria-label="Indicadores de acompanhamento">
          <div>
            <AlertTriangle size={22} aria-hidden="true" />
            <span>Demandam atenção</span>
            <strong>{formatNumber(emAtencao)}</strong>
          </div>
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
        </section>
      </main>
    </div>
  );
}
