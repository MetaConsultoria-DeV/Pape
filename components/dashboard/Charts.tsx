'use client';

import {
  Activity,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CHART_COLORS } from './config';
import type { ChartDatum } from './types';
import { getTotal } from './utils';

type TooltipPayload = {
  color?: string;
  name?: string;
  value?: number;
  payload?: ChartDatum & { originalLabel?: string };
};

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="dashboard-empty">
      <Activity size={24} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
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
  const displayValue = item.payload?.originalLabel ?? (item.value ?? 0);

  return (
    <div className="dashboard-tooltip">
      <span className="dashboard-tooltip-label">{name}</span>
      <strong>{displayValue}</strong>
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

export function StatusChart({ data }: { data: ChartDatum[] }) {
  if (data.every((item) => item.value === 0)) {
    return <ChartEmpty message="Aguardando dados de cronograma para exibir o comparativo." />;
  }

  return (
    <div className="dashboard-horizontal-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
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
            {data.map((entry, index) => (
              <Cell
                key={entry.name}
                fill={entry.name === 'Atrasado' ? 'var(--meta-danger)' : CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MethodologyChart({ data }: { data: ChartDatum[] }) {
  if (!data.length) {
    return <ChartEmpty message="Aguardando novas respostas para montar este gráfico." />;
  }

  return (
    <div className="dashboard-chart-layout dashboard-chart-layout-compact">
      <div className="dashboard-pie">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="84%"
              paddingAngle={5}
              dataKey="value"
              stroke="var(--meta-white)"
              strokeWidth={4}
            >
              {data.map((entry, index) => (
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
          <strong>{getTotal(data)}</strong>
          <span>projetos</span>
        </div>
      </div>
      <ChartLegend data={data} />
    </div>
  );
}

export function CompletionChart({
  data,
  emptyMessage = 'Aguardando dados de conclusão para exibir este bloco.',
}: {
  data: ChartDatum[];
  emptyMessage?: string;
}) {
  if (data.every((item) => item.value === 0)) {
    return <ChartEmpty message={emptyMessage} />;
  }

  return (
    <div className="dashboard-bar-wrap dashboard-bar-wrap-compact">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: -18, bottom: 16 }}>
          <CartesianGrid vertical={false} stroke="rgba(107, 114, 153, 0.22)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }} />
          <Bar dataKey="value" fill="var(--meta-blue)" radius={[8, 8, 0, 0]} maxBarSize={58} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MotivesChart({
  data,
  emptyMessage = 'Nenhum motivo de risco/atraso registrado no status atual.',
}: {
  data: ChartDatum[];
  emptyMessage?: string;
}) {
  if (!data.length) {
    return <ChartEmpty message={emptyMessage} />;
  }

  return (
    <div className="dashboard-horizontal-chart dashboard-horizontal-chart-small">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data.slice(0, 5)}
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
  );
}

export function ScoreChart({
  data,
  color = 'var(--meta-blue)',
}: {
  data: ChartDatum[];
  color?: string;
}) {
  if (!data.length) {
    return <ChartEmpty message="Ainda não há respostas suficientes para este indicador." />;
  }

  // Calculate dynamic height based on number of items (approx 36px per project bar, min 280px)
  const chartHeight = Math.max(280, data.length * 36);

  return (
    <div className="dashboard-chart-scroll-wrap" style={{ height: '280px', overflowY: 'auto', overflowX: 'hidden' }}>
      <div style={{ height: `${chartHeight}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 18, left: 18, bottom: 8 }}
          >
            <CartesianGrid horizontal={false} stroke="rgba(107, 114, 153, 0.24)" />
            <XAxis
              type="number"
              domain={[0, 5]}
              tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={142}
              tick={{ fontSize: 12, fill: 'var(--meta-navy)', fontWeight: 700 }}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0, 103, 255, 0.06)' }} />
            <Bar dataKey="value" fill={color} radius={[0, 8, 8, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ProgressLineChart({ data }: { data: ChartDatum[] }) {
  if (!data.length) {
    return <ChartEmpty message="Ainda não há histórico suficiente para montar o andamento do projeto." />;
  }

  const rankLabels: Record<number, string> = {
    1: '0-20%',
    2: '21-40%',
    3: '41-60%',
    4: '61-80%',
    5: '81-100%',
  };

  const mappedData = data.map((item) => {
    let rank = 1;
    if (item.value >= 80) rank = 5;
    else if (item.value >= 60) rank = 4;
    else if (item.value >= 40) rank = 3;
    else if (item.value >= 20) rank = 2;
    else rank = 1;

    return {
      ...item,
      value: rank,
      originalLabel: rankLabels[rank] ?? `${item.value}%`,
    };
  });

  return (
    <div className="dashboard-horizontal-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mappedData} margin={{ top: 18, right: 24, left: 10, bottom: 10 }}>
          <CartesianGrid vertical={false} stroke="rgba(107, 114, 153, 0.24)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }}
          />
          <YAxis
            domain={[1, 5]}
            tickCount={5}
            tick={{ fontSize: 12, fill: 'var(--meta-navy-50)', fontWeight: 700 }}
            tickFormatter={(v) => rankLabels[v] || `${v}`}
            label={{
              value: 'Faixa de Conclusão',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { textAnchor: 'middle', fill: 'var(--meta-navy-50)', fontSize: 10, fontWeight: 700 }
            }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(0, 103, 255, 0.18)' }} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--meta-blue)"
            strokeWidth={4}
            dot={{ r: 5, fill: 'var(--meta-blue)', stroke: 'var(--meta-white)', strokeWidth: 3 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
