'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowLeftCircle,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Gauge,
  PieChartIcon,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  CompletionChart,
  MethodologyChart,
  MotivesChart,
  ProgressLineChart,
  ScoreChart,
  StatusChart,
} from './Charts';
import { SectionHeader, StatCard } from './Chrome';
import { COMPLETION_ORDER, STATUS_ORDER } from './config';
import {
  AgileProjectsTable,
  ClientImpactTable,
  DetailHistoryTable,
  DetailProjectsTable,
  MethodAttentionTable,
  ProjectTable,
  RiskMatrixTable,
  RiskProjectsTable,
} from './Tables';
import type { DashboardData, DashboardSlug } from './types';
import {
  entriesToChartData,
  formatNumber,
  getScoreTone,
  getStatusCount,
} from './utils';

export function DashboardSectionContent({
  slug,
  data,
}: {
  slug: DashboardSlug;
  data: DashboardData;
}) {
  if (slug === 'riscos') {
    return <RisksSection data={data} />;
  }
  if (slug === 'metodo-e-escopo') {
    return <MethodScopeSection data={data} />;
  }
  if (slug === 'cliente-e-orientacao') {
    return <ClientOrientationSection data={data} />;
  }
  if (slug === 'agil') {
    return <AgileSection data={data} />;
  }
  if (slug === 'detalhe') {
    return <DetailSection data={data} />;
  }
  return <OverviewSection data={data} />;
}

function OverviewSection({ data }: { data: DashboardData }) {
  const metodologiasData = entriesToChartData(data.metodologias ?? {});
  const cronogramaData = entriesToChartData(data.status_cronograma ?? {}, STATUS_ORDER);
  const conclusaoData = entriesToChartData(data.pct_conclusao ?? {}, COMPLETION_ORDER);
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
    <>
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
          <StatusChart data={cronogramaData} />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Target}
            eyebrow="Metodologia"
            title="Modelos de gerenciamento"
            description="Como a carteira atual está dividida por modelo."
          />
          <MethodologyChart data={metodologiasData} />
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
          <CompletionChart data={conclusaoData} />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={AlertTriangle}
            eyebrow="Atenção"
            title="Motivos de risco/atraso"
            description="Motivos citados nos projetos em risco ou atrasados."
          />
          <MotivesChart data={motivosData} />
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
    </>
  );
}

function RisksSection({ data }: { data: DashboardData }) {
  const riscos = data.riscos ?? {
    motivos_por_coordenacao: [],
    projetos_em_risco: [],
    suficiencia_orcamento: [],
    comunicacao_cliente: [],
    capacitacao_equipe: [],
  };

  const projetosAtrasados = getStatusCount(data, 'Atrasado');
  const projetosComRisco = getStatusCount(data, 'Com risco de atraso');
  const motivosCriticos = riscos.motivos_por_coordenacao.reduce(
    (sum, row) => sum + row.total,
    0,
  );
  const orcamentoCritico = riscos.suficiencia_orcamento.filter((item) => item.value <= 2).length;
  const comunicacaoCritica = riscos.comunicacao_cliente.filter((item) => item.value <= 2).length;

  return (
    <>
      <section className="dashboard-hero-panel dashboard-risk-hero" aria-label="Resumo de riscos">
        <div>
          <span className="eyebrow text-meta-blue">Riscos</span>
          <h2>Onde a carteira precisa de atenção</h2>
          <p>
            Esta visão reaproveita a lógica do Power BI para entender atrasos, riscos
            declarados, gargalos por coordenação e sinais baixos de orçamento,
            comunicação e capacidade técnica.
          </p>
        </div>

        <div className="dashboard-satisfaction dashboard-risk-summary" aria-label="Projetos em atenção">
          <div>
            <span>Projetos em atenção</span>
            <strong>{formatNumber(projetosAtrasados + projetosComRisco)}</strong>
          </div>
          <small>
            {formatNumber(projetosAtrasados)} atrasados · {formatNumber(projetosComRisco)} com risco
          </small>
        </div>
      </section>

      <section className="dashboard-stats-grid" aria-label="Indicadores de risco">
        <StatCard
          icon={AlertTriangle}
          label="Projetos atrasados"
          value={formatNumber(projetosAtrasados)}
          detail="Status atual marcado como atrasado."
          tone="danger"
          featured
        />
        <StatCard
          icon={Clock3}
          label="Projetos com risco"
          value={formatNumber(projetosComRisco)}
          detail="Status atual com risco de atraso."
          tone="warning"
        />
        <StatCard
          icon={BarChart2}
          label="Motivos críticos"
          value={formatNumber(motivosCriticos)}
          detail="Ocorrências de motivos em projetos em atenção."
        />
        <StatCard
          icon={Gauge}
          label="Orçamento baixo"
          value={formatNumber(orcamentoCritico)}
          detail="Projetos com suficiência de orçamento até 2."
          tone="warning"
        />
        <StatCard
          icon={Activity}
          label="Comunicação baixa"
          value={formatNumber(comunicacaoCritica)}
          detail="Projetos com comunicação efetiva até 2."
          tone="danger"
        />
      </section>

      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={AlertTriangle}
          eyebrow="Matriz"
          title="Motivos dos riscos por coordenação"
          description="Leitura cruzada dos motivos selecionados com as coordenações envolvidas."
        />
        <RiskMatrixTable rows={riscos.motivos_por_coordenacao} />
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Gauge}
            eyebrow="Orçamento"
            title="Suficiência do orçamento"
            description="Projetos com menor avaliação aparecem primeiro."
          />
          <ScoreChart data={riscos.suficiencia_orcamento} color="var(--meta-warning)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Activity}
            eyebrow="Comunicação"
            title="Comunicação efetiva por projeto"
            description="Projetos com menor nota de comunicação aparecem primeiro."
          />
          <ScoreChart data={riscos.comunicacao_cliente} />
        </div>
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={CheckCircle2}
            eyebrow="Capacidade"
            title="Capacitação da equipe"
            description="Indica possíveis riscos técnicos de execução."
          />
          <ScoreChart data={riscos.capacitacao_equipe} color="var(--meta-success)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={ClipboardList}
            eyebrow="Projetos"
            title="Projetos em risco ou atraso"
            description="Lista operacional para priorizar conversas de acompanhamento."
          />
          <RiskProjectsTable projects={riscos.projetos_em_risco} />
        </div>
      </section>
    </>
  );
}

function MethodScopeSection({ data }: { data: DashboardData }) {
  const metodo = data.metodo_escopo ?? {
    retrabalho: [],
    variacao_escopo: [],
    capacitacao_equipe: [],
    eficacia_metodologia: [],
    pontos_atencao: [],
    medias: {
      retrabalho: 0,
      variacao_escopo: 0,
      capacitacao_equipe: 0,
      eficacia_metodologia: 0,
    },
  };

  const mediaValues = Object.values(metodo.medias).filter((value) => value > 0);
  const saudeMetodo = mediaValues.length
    ? mediaValues.reduce((sum, value) => sum + value, 0) / mediaValues.length
    : 0;
  const retrabalhoCritico = metodo.retrabalho.filter((item) => item.value <= 2).length;
  const escopoCritico = metodo.variacao_escopo.filter((item) => item.value <= 2).length;

  return (
    <>
      <section className="dashboard-hero-panel dashboard-method-hero" aria-label="Resumo de método e escopo">
        <div>
          <span className="eyebrow text-meta-blue">Método e Escopo</span>
          <h2>Execução, clareza e aderência metodológica</h2>
          <p>
            Esta visão recupera os painéis de retrabalho, variação de escopo,
            capacitação da equipe e eficácia da metodologia para apontar onde o
            projeto precisa de alinhamento antes de virar atraso.
          </p>
        </div>

        <div className="dashboard-satisfaction dashboard-method-summary" aria-label="Saúde média de método e escopo">
          <div>
            <span>Saúde média</span>
            <strong>{formatNumber(saudeMetodo)}</strong>
          </div>
          <div className="dashboard-score-track" aria-hidden="true">
            <span style={{ width: `${Math.min(Math.max((saudeMetodo / 5) * 100, 0), 100)}%` }} />
          </div>
          <small>{formatNumber(metodo.pontos_atencao.length)} pontos críticos no radar</small>
        </div>
      </section>

      <section className="dashboard-stats-grid" aria-label="Indicadores de método e escopo">
        <StatCard
          icon={TrendingUp}
          label="Retrabalho médio"
          value={formatNumber(metodo.medias.retrabalho)}
          suffix="/5"
          detail="Quanto menor a nota, maior a atenção ao retrabalho."
          tone={getScoreTone(metodo.medias.retrabalho)}
          featured
        />
        <StatCard
          icon={Target}
          label="Escopo médio"
          value={formatNumber(metodo.medias.variacao_escopo)}
          suffix="/5"
          detail="Mede a eficácia do escopo definido e sua variação."
          tone={getScoreTone(metodo.medias.variacao_escopo)}
        />
        <StatCard
          icon={Gauge}
          label="Metodologia média"
          value={formatNumber(metodo.medias.eficacia_metodologia)}
          suffix="/5"
          detail="Aderência percebida da metodologia usada no projeto."
          tone={getScoreTone(metodo.medias.eficacia_metodologia)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Capacitação média"
          value={formatNumber(metodo.medias.capacitacao_equipe)}
          suffix="/5"
          detail="Preparo da equipe para sustentar a execução."
          tone={getScoreTone(metodo.medias.capacitacao_equipe)}
        />
        <StatCard
          icon={AlertTriangle}
          label="Alertas críticos"
          value={formatNumber(metodo.pontos_atencao.length)}
          detail={`${formatNumber(retrabalhoCritico)} em retrabalho · ${formatNumber(escopoCritico)} em escopo.`}
          tone={metodo.pontos_atencao.length ? 'warning' : 'success'}
        />
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={TrendingUp}
            eyebrow="Retrabalho"
            title="Retrabalho por projeto"
            description="Quanto menor a nota, pior: os menores valores aparecem primeiro."
          />
          <ScoreChart data={metodo.retrabalho} color="var(--meta-danger)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Target}
            eyebrow="Escopo"
            title="Eficácia do escopo definido"
            description="Leitura da variação de escopo nos projetos tradicional e híbrido."
          />
          <ScoreChart data={metodo.variacao_escopo} color="var(--meta-warning)" />
        </div>
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={CheckCircle2}
            eyebrow="Equipe"
            title="Capacitação da equipe por projeto"
            description="Mostra onde a execução pode precisar de apoio técnico."
          />
          <ScoreChart data={metodo.capacitacao_equipe} color="var(--meta-success)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Gauge}
            eyebrow="Metodologia"
            title="Eficácia da metodologia por projeto"
            description="Ajuda a decidir onde ajustar ritos, cadência ou abordagem."
          />
          <ScoreChart data={metodo.eficacia_metodologia} />
        </div>
      </section>

      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={ClipboardList}
          eyebrow="Atenção"
          title="Pontos críticos de método e escopo"
          description="Indicadores com nota 1 ou 2, priorizados para conversa de acompanhamento."
        />
        <MethodAttentionTable items={metodo.pontos_atencao} />
      </section>
    </>
  );
}

function ClientOrientationSection({ data }: { data: DashboardData }) {
  const cliente = data.cliente_orientacao ?? {
    comunicacao_cliente: [],
    confianca_cliente: [],
    satisfacao_cliente: [],
    valorizacao_cliente: [],
    orientadores: {
      efetividade: [],
      disponibilidade: [],
    },
    impactos: [],
    pontos_atencao: [],
    quantidade_orientadores: 0,
    projetos_com_orientacao_pct: 0,
    medias: {
      comunicacao_cliente: 0,
      confianca_cliente: 0,
      satisfacao_cliente: 0,
      valorizacao_cliente: 0,
      efetividade_orientador: 0,
      disponibilidade_orientador: 0,
    },
  };

  const mediaClienteValues = [
    cliente.medias.comunicacao_cliente,
    cliente.medias.confianca_cliente,
    cliente.medias.satisfacao_cliente,
  ].filter((value) => value > 0);
  const saudeCliente = mediaClienteValues.length
    ? mediaClienteValues.reduce((sum, value) => sum + value, 0) / mediaClienteValues.length
    : 0;

  return (
    <>
      <section className="dashboard-hero-panel dashboard-client-hero" aria-label="Resumo de cliente e orientação">
        <div>
          <span className="eyebrow text-meta-blue">Cliente e Orientação</span>
          <h2>Relação com o cliente e apoio técnico no radar</h2>
          <p>
            Esta visão reúne comunicação, confiança, satisfação, valor percebido
            e atuação dos orientadores para mostrar onde a experiência do cliente
            precisa de cuidado mais próximo.
          </p>
        </div>

        <div className="dashboard-satisfaction dashboard-client-summary" aria-label="Saúde média do cliente">
          <div>
            <span>Saúde do cliente</span>
            <strong>{formatNumber(saudeCliente)}</strong>
          </div>
          <div className="dashboard-score-track" aria-hidden="true">
            <span style={{ width: `${Math.min(Math.max((saudeCliente / 5) * 100, 0), 100)}%` }} />
          </div>
          <small>{formatNumber(cliente.pontos_atencao.length)} pontos críticos de cliente</small>
        </div>
      </section>

      <section className="dashboard-stats-grid" aria-label="Indicadores de cliente e orientação">
        <StatCard
          icon={Activity}
          label="Média ICE"
          value={formatNumber(cliente.medias.comunicacao_cliente)}
          suffix="/5"
          detail="Índice de comunicação efetiva com o cliente."
          tone={getScoreTone(cliente.medias.comunicacao_cliente)}
          featured
        />
        <StatCard
          icon={Star}
          label="Média ICC"
          value={formatNumber(cliente.medias.confianca_cliente)}
          suffix="/5"
          detail="Confiança e abertura do cliente no acompanhamento."
          tone={getScoreTone(cliente.medias.confianca_cliente)}
        />
        <StatCard
          icon={CheckCircle2}
          label="Média ISC"
          value={formatNumber(cliente.medias.satisfacao_cliente)}
          suffix="/5"
          detail="Satisfação média declarada nas respostas atuais."
          tone={getScoreTone(cliente.medias.satisfacao_cliente)}
        />
        <StatCard
          icon={ClipboardList}
          label="Orientadores"
          value={formatNumber(cliente.quantidade_orientadores)}
          detail="Orientadores técnicos distintos mapeados."
          tone="default"
        />
        <StatCard
          icon={Target}
          label="Projetos orientados"
          value={formatNumber(cliente.projetos_com_orientacao_pct)}
          suffix="%"
          detail="Percentual da carteira atual com orientação técnica."
          tone={cliente.projetos_com_orientacao_pct >= 50 ? 'success' : 'warning'}
        />
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Activity}
            eyebrow="ICE"
            title="Comunicação efetiva por projeto"
            description="Projetos com menor comunicação aparecem primeiro para priorizar contato."
          />
          <ScoreChart data={cliente.comunicacao_cliente} />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Star}
            eyebrow="ICC"
            title="Confiança do cliente por projeto"
            description="Leitura de abertura e confiança do cliente no acompanhamento."
          />
          <ScoreChart data={cliente.confianca_cliente} color="var(--meta-warning)" />
        </div>
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={CheckCircle2}
            eyebrow="ISC"
            title="Satisfação do cliente por projeto"
            description="Ajuda a enxergar onde a percepção do cliente precisa ser recuperada."
          />
          <ScoreChart data={cliente.satisfacao_cliente} color="var(--meta-success)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Target}
            eyebrow="Valor"
            title="Valorização do projeto pelo cliente"
            description="Mostra se o cliente percebe valor nas entregas e no acompanhamento."
          />
          <ScoreChart data={cliente.valorizacao_cliente} color="var(--meta-blue-accent)" />
        </div>
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Gauge}
            eyebrow="Orientação"
            title="Efetividade do orientador"
            description="Média de efetividade por orientador técnico."
          />
          <ScoreChart data={cliente.orientadores.efetividade} color="var(--meta-blue)" />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Clock3}
            eyebrow="Orientação"
            title="Disponibilidade do orientador"
            description="Média de disponibilidade por orientador técnico."
          />
          <ScoreChart data={cliente.orientadores.disponibilidade} color="var(--meta-navy-70)" />
        </div>
      </section>

      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={ClipboardList}
          eyebrow="Cliente"
          title="Impacto e valor percebido"
          description="Resumo dos sinais qualitativos por projeto, mantendo a leitura tabular do Power BI."
        />
        <ClientImpactTable items={cliente.impactos} />
      </section>
    </>
  );
}

function AgileSection({ data }: { data: DashboardData }) {
  const agil = data.agil ?? {
    story_points: [],
    impedimentos: [],
    impactos: [],
    projetos: [],
    resumo: {
      total_projetos: 0,
      media_story_points: 0,
      projetos_com_impedimento: 0,
      intervencoes_pmo: 0,
      solicitacoes_1_1: 0,
    },
  };

  const impedimentoPct = agil.resumo.total_projetos
    ? (agil.resumo.projetos_com_impedimento / agil.resumo.total_projetos) * 100
    : 0;

  return (
    <>
      <section className="dashboard-hero-panel dashboard-agile-hero" aria-label="Resumo ágil">
        <div>
          <span className="eyebrow text-meta-blue">Ágil</span>
          <h2>Sprints, impedimentos e entrega planejada</h2>
          <p>
            Esta visão recupera a página ágil do Power BI com foco em story
            points entregues, impedimentos da última sprint, impacto percebido
            pelo cliente e pedidos de apoio da PMO.
          </p>
        </div>

        <div className="dashboard-satisfaction dashboard-agile-summary" aria-label="Entrega média de story points">
          <div>
            <span>Story points médios</span>
            <strong>{formatNumber(agil.resumo.media_story_points)}</strong>
          </div>
          <div className="dashboard-score-track" aria-hidden="true">
            <span style={{ width: `${Math.min(Math.max(agil.resumo.media_story_points, 0), 100)}%` }} />
          </div>
          <small>{formatNumber(agil.resumo.total_projetos)} projetos com leitura ágil</small>
        </div>
      </section>

      <section className="dashboard-stats-grid" aria-label="Indicadores ágeis">
        <StatCard
          icon={Gauge}
          label="Projetos ágeis"
          value={formatNumber(agil.resumo.total_projetos)}
          detail="Projetos com dados de sprint na última resposta."
          featured
        />
        <StatCard
          icon={TrendingUp}
          label="Story points médios"
          value={formatNumber(agil.resumo.media_story_points)}
          suffix="%"
          detail="Ponto médio da faixa declarada de story points entregues."
          tone={agil.resumo.media_story_points >= 70 ? 'success' : 'warning'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Com impedimento"
          value={formatNumber(agil.resumo.projetos_com_impedimento)}
          detail={`${formatNumber(impedimentoPct)}% dos projetos ágeis têm impedimento.`}
          tone={agil.resumo.projetos_com_impedimento ? 'warning' : 'success'}
        />
        <StatCard
          icon={ClipboardList}
          label="Intervenções PMO"
          value={formatNumber(agil.resumo.intervencoes_pmo)}
          detail="Projetos que registraram intervenção da PMO."
          tone={agil.resumo.intervencoes_pmo ? 'warning' : 'default'}
        />
        <StatCard
          icon={Clock3}
          label="Solicitações 1:1"
          value={formatNumber(agil.resumo.solicitacoes_1_1)}
          detail="Pedidos de conversa 1:1 com PMO."
          tone={agil.resumo.solicitacoes_1_1 ? 'warning' : 'success'}
        />
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={TrendingUp}
            eyebrow="Sprint"
            title="Story points planejados entregues"
            description="Distribuição por faixa de entrega declarada na última sprint."
          />
          <CompletionChart
            data={agil.story_points}
            emptyMessage="Aguardando dados de story points para exibir a distribuição."
          />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={AlertTriangle}
            eyebrow="Impedimentos"
            title="Impedimentos da última sprint"
            description="Tipos de impedimento mais recorrentes nos projetos ágeis."
          />
          <MotivesChart
            data={agil.impedimentos}
            emptyMessage="Nenhum impedimento registrado na última sprint."
          />
        </div>
      </section>

      <section className="dashboard-overview-grid dashboard-overview-grid-secondary">
        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Star}
            eyebrow="Cliente"
            title="Impacto percebido pelo cliente"
            description="Leitura qualitativa do impacto da sprint no relacionamento com o cliente."
          />
          <MotivesChart
            data={agil.impactos}
            emptyMessage="Ainda não há impacto percebido registrado para projetos ágeis."
          />
        </div>

        <div className="dashboard-card dashboard-chart-card">
          <SectionHeader
            icon={Gauge}
            eyebrow="Operação"
            title="Leitura rápida da cadência ágil"
            description="Use os indicadores acima para priorizar impedimentos, conversas 1:1 e apoio PMO."
          />
          <div className="dashboard-agile-rhythm">
            <div>
              <span>Entrega média</span>
              <strong>{formatNumber(agil.resumo.media_story_points)}%</strong>
            </div>
            <div>
              <span>Impedimentos</span>
              <strong>{formatNumber(agil.resumo.projetos_com_impedimento)}</strong>
            </div>
            <div>
              <span>Apoios PMO</span>
              <strong>{formatNumber(agil.resumo.intervencoes_pmo + agil.resumo.solicitacoes_1_1)}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={ClipboardList}
          eyebrow="Projetos"
          title="Projetos ágeis em acompanhamento"
          description="Tabela operacional inspirada no Power BI para acompanhar sprint, impacto, impedimentos e PMO."
        />
        <AgileProjectsTable projects={agil.projetos} />
      </section>
    </>
  );
}

function DetailSection({ data }: { data: DashboardData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const detalhe = data.detalhe ?? {
    projeto_foco: null,
    metricas: {},
    andamento: [],
    motivos_atraso: [],
    historico: [],
    projetos: [],
  };

  const allDates = useMemo(() => {
    if (!detalhe.historico) return [];
    return detalhe.historico
      .map((h) => h.data_resposta)
      .filter((d): d is string => !!d)
      .sort();
  }, [detalhe.historico]);

  const defaultMinDate = allDates.length ? allDates[0] : '';
  const defaultMaxDate = allDates.length ? allDates[allDates.length - 1] : '';

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const activeStartDate = startDate || defaultMinDate;
  const activeEndDate = endDate || defaultMaxDate;

  const handleProjectChange = (projectId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('projeto_id', projectId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const filteredHistorico = useMemo(() => {
    if (!detalhe.historico) return [];
    return detalhe.historico.filter((row) => {
      if (!row.data_resposta) return true;
      const d = row.data_resposta;
      const startSatisfied = !activeStartDate || d >= activeStartDate;
      const endSatisfied = !activeEndDate || d <= activeEndDate;
      return startSatisfied && endSatisfied;
    });
  }, [detalhe.historico, activeStartDate, activeEndDate]);

  const filteredAndamento = useMemo(() => {
    if (!detalhe.andamento) return [];
    return detalhe.andamento.filter((point) => {
      const parts = point.name.split('/');
      if (parts.length === 3) {
        const yyyymmdd = `${parts[2]}-${parts[1]}-${parts[0]}`;
        const startSatisfied = !activeStartDate || yyyymmdd >= activeStartDate;
        const endSatisfied = !activeEndDate || yyyymmdd <= activeEndDate;
        return startSatisfied && endSatisfied;
      }
      return true;
    });
  }, [detalhe.andamento, activeStartDate, activeEndDate]);

  const recalculatedMetricas = useMemo(() => {
    const sum = {
      confianca_cliente: 0,
      comunicacao_cliente: 0,
      eficacia_metodologia: 0,
      capacitacao_equipe: 0,
      nivel_retrabalho: 0,
      suficiencia_orcamento: 0,
    };
    const count = {
      confianca_cliente: 0,
      comunicacao_cliente: 0,
      eficacia_metodologia: 0,
      capacitacao_equipe: 0,
      nivel_retrabalho: 0,
      suficiencia_orcamento: 0,
    };

    filteredHistorico.forEach((row) => {
      if (row.confianca_cliente !== undefined && row.confianca_cliente > 0) {
        sum.confianca_cliente += row.confianca_cliente;
        count.confianca_cliente++;
      }
      if (row.comunicacao_cliente !== undefined && row.comunicacao_cliente > 0) {
        sum.comunicacao_cliente += row.comunicacao_cliente;
        count.comunicacao_cliente++;
      }
      if (row.eficacia_metodologia !== undefined && row.eficacia_metodologia > 0) {
        sum.eficacia_metodologia += row.eficacia_metodologia;
        count.eficacia_metodologia++;
      }
      if (row.capacitacao_equipe !== undefined && row.capacitacao_equipe > 0) {
        sum.capacitacao_equipe += row.capacitacao_equipe;
        count.capacitacao_equipe++;
      }
      if (row.nivel_retrabalho !== undefined && row.nivel_retrabalho > 0) {
        sum.nivel_retrabalho += row.nivel_retrabalho;
        count.nivel_retrabalho++;
      }
      if (row.suficiencia_orcamento !== undefined && row.suficiencia_orcamento > 0) {
        sum.suficiencia_orcamento += row.suficiencia_orcamento;
        count.suficiencia_orcamento++;
      }
    });

    return {
      confianca_cliente: count.confianca_cliente ? sum.confianca_cliente / count.confianca_cliente : 0,
      comunicacao_cliente: count.comunicacao_cliente ? sum.comunicacao_cliente / count.comunicacao_cliente : 0,
      eficacia_metodologia: count.eficacia_metodologia ? sum.eficacia_metodologia / count.eficacia_metodologia : 0,
      capacitacao_equipe: count.capacitacao_equipe ? sum.capacitacao_equipe / count.capacitacao_equipe : 0,
      nivel_retrabalho: count.nivel_retrabalho ? sum.nivel_retrabalho / count.nivel_retrabalho : 0,
      suficiencia_orcamento: count.suficiencia_orcamento ? sum.suficiencia_orcamento / count.suficiencia_orcamento : 0,
    };
  }, [filteredHistorico]);

  const recalculatedMotivos = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredHistorico.forEach((row) => {
      if (row.motivos_atraso) {
        row.motivos_atraso.forEach((motivo) => {
          counts[motivo] = (counts[motivo] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredHistorico]);

  if (!detalhe.projeto_foco) {
    return (
      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={ClipboardList}
          eyebrow="Detalhe"
          title="Nenhum projeto com histórico disponível"
          description="Assim que houver respostas PAPE, esta visão mostrará o projeto em foco e sua evolução."
        />
      </section>
    );
  }

  return (
    <>
      <header className="dashboard-detail-header-row">
        <div className="project-select-card">
          <span className="project-select-label">Selecione o Projeto</span>
          <select
            value={detalhe.projeto_foco.projeto_id || ''}
            onChange={(e) => handleProjectChange(e.target.value)}
            className="project-select-dropdown"
          >
            {detalhe.projetos.map((proj) => (
              <option key={proj.projeto_id ?? proj.projeto} value={proj.projeto_id ?? ''}>
                {proj.projeto}
              </option>
            ))}
          </select>
        </div>

        <div className="date-filter-card">
          <span>Data de Resposta</span>
          <div className="date-inputs-row">
            <input
              type="date"
              value={activeStartDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input-field"
              min={defaultMinDate}
              max={defaultMaxDate}
            />
            <input
              type="date"
              value={activeEndDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input-field"
              min={defaultMinDate}
              max={defaultMaxDate}
            />
          </div>
        </div>

        <Link href="/dashboard/visao-geral" className="back-circle-button" title="Voltar para Visão Geral">
          <ArrowLeft size={24} />
        </Link>
      </header>

      <div className="dashboard-overview-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <section className="dashboard-card dashboard-project-card" style={{ marginTop: 0 }}>
            <SectionHeader
              icon={ClipboardList}
              eyebrow="Histórico"
              title="Respostas do projeto em foco"
              description="Leitura operacional das respostas PAPE no período selecionado."
            />
            <DetailHistoryTable rows={filteredHistorico} />
          </section>

          <section className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={TrendingUp}
              eyebrow="Andamento"
              title="Andamento do Projeto"
              description="Histórico da faixa de conclusão ao longo das respostas PAPE."
            />
            <ProgressLineChart data={filteredAndamento} />
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <StatCard
              icon={Star}
              label="Confiança do Cliente"
              value={formatNumber(recalculatedMetricas.confianca_cliente)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.confianca_cliente)}
            />
            <StatCard
              icon={Activity}
              label="Eficiência da Comunicação Cliente"
              value={formatNumber(recalculatedMetricas.comunicacao_cliente)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.comunicacao_cliente)}
            />
            <StatCard
              icon={Gauge}
              label="Eficiência da Metodologia"
              value={formatNumber(recalculatedMetricas.eficacia_metodologia)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.eficacia_metodologia)}
            />
            <StatCard
              icon={CheckCircle2}
              label="Capacitação da Equipe"
              value={formatNumber(recalculatedMetricas.capacitacao_equipe)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.capacitacao_equipe)}
            />
            <StatCard
              icon={AlertTriangle}
              label="Problema por Retrabalho"
              value={formatNumber(recalculatedMetricas.nivel_retrabalho)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.nivel_retrabalho)}
            />
            <StatCard
              icon={Star}
              label="Suficiência do Orçamento"
              value={formatNumber(recalculatedMetricas.suficiencia_orcamento)}
              detail="Média do período"
              tone={getScoreTone(recalculatedMetricas.suficiencia_orcamento)}
            />
          </div>

          <section className="dashboard-card dashboard-chart-card">
            <SectionHeader
              icon={AlertTriangle}
              eyebrow="Risco"
              title="Motivos dos Riscos/Atraso"
              description="Tipos de risco recorrentes citados no período selecionado."
            />
            <MotivesChart
              data={recalculatedMotivos}
              emptyMessage="Nenhum motivo de risco/atraso registrado para o período selecionado."
            />
          </section>
        </div>
      </div>

      <section className="dashboard-card dashboard-project-card">
        <SectionHeader
          icon={Target}
          eyebrow="Carteira"
          title="Projetos disponíveis para detalhe"
          description="Projetos ordenados por prioridade de atenção, usando a última resposta de cada um."
        />
        <DetailProjectsTable projects={detalhe.projetos} />
      </section>
    </>
  );
}
