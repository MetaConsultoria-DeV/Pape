import Link from 'next/link';
import { notFound } from 'next/navigation';
import PapeHeader from '@/components/PapeHeader';
import EditProjectButton from '@/components/EditProjectButton';
import DeleteProjectButton from '@/components/DeleteProjectButton';
import DeleteAcompanhamentoButton from '@/components/DeleteAcompanhamentoButton';
import { SERVER_API_URL } from '@/lib/api';

type Member = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  coordenacao: string | null;
  coordenacao_sigla: string | null;
  coordenacao_id: number | null;
};

type Service = {
  id: number;
  nome: string;
};

type Coordination = {
  id: number;
  nome: string;
};

type FollowUp = {
  id: number;
  data_resposta: string;
  modelo_gerenciamento: string;
  pct_conclusao: string;
  status_cronograma: string;
  motivos_atraso: string[];
  capacitacao_equipe: number;
  eficacia_metodologia: number;
  nivel_retrabalho: number;
  comunicacao_cliente: number;
  suficiencia_orcamento_nota: number | null;
  orcamento_nao_necessario: number;
  cliente_percebeu_valor: number | null;
  pct_marcos_prazo: string | null;
  variacao_escopo: number | null;
  impacto_cliente: string | null;
  abertura_cliente: number | null;
  satisfacao_cliente: number | null;
  nome_orientador: string | null;
  efetividade_orientador: number | null;
  disponibilidade_orientador: number | null;
};

type ProjectDetails = {
  id: number;
  nome: string;
  descricao: string | null;
  descricao_projeto: string | null;
  data_inicio: string | null;
  numero_contrato: string | null;
  valor_total: number | null;
  possui_orientador: number | null;
  nome_orientador: string | null;
  status: 'ativo' | 'finalizado' | 'pausado';
  servicos: Service[];
  coordenacoes: Coordination[];
  membros: Member[];
  acompanhamentos: FollowUp[];
};

type Props = {
  params: Promise<{ slug: string }>;
};

async function getProjetoDetalhes(id: string): Promise<ProjectDetails | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}/projetos/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch project details: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes do projeto:', error);
    return null;
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'Não informada';
  try {
    // Adiciona o horário local para evitar desvios de fuso horário na conversão
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatShortDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: number | null) => {
  if (val === null || val === undefined) return 'Não informado';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

// Helper for status badge styling and labels
const getStatusBadge = (status: 'ativo' | 'finalizado' | 'pausado') => {
  switch (status) {
    case 'ativo':
      return {
        label: 'Ativo',
        bg: 'rgba(31, 191, 106, 0.1)',
        color: 'var(--meta-success)',
        dot: 'var(--meta-success)',
      };
    case 'finalizado':
      return {
        label: 'Finalizado',
        bg: 'rgba(0, 103, 255, 0.1)',
        color: 'var(--meta-blue)',
        dot: 'var(--meta-blue)',
      };
    case 'pausado':
      return {
        label: 'Pausado',
        bg: 'rgba(245, 166, 35, 0.15)',
        color: 'var(--meta-warning)',
        dot: 'var(--meta-warning)',
      };
  }
};

// Helper for cronograma status styling
const getCronogramaBadge = (status: string) => {
  const norm = status ? status.toLowerCase() : '';
  if (norm.includes('dentro') || norm.includes('prazo')) {
    return { bg: 'rgba(31, 191, 106, 0.1)', color: 'var(--meta-success)' };
  } else if (norm.includes('risco')) {
    return { bg: 'rgba(245, 166, 35, 0.15)', color: 'var(--meta-warning)' };
  } else if (norm.includes('atrasado') || norm.includes('atraso')) {
    return { bg: 'rgba(229, 72, 77, 0.1)', color: 'var(--meta-danger)' };
  } else if (norm.includes('concluido') || norm.includes('concluído')) {
    return { bg: 'rgba(0, 103, 255, 0.1)', color: 'var(--meta-blue)' };
  }
  return { bg: 'rgba(115, 115, 115, 0.1)', color: 'var(--meta-navy-50)' };
};

export default async function ProjetoDetalhesPage({ params }: Props) {
  const { slug } = await params;
  const projeto = await getProjetoDetalhes(slug);

  if (!projeto) {
    notFound();
  }

  let servicos = [];
  try {
    const resServicos = await fetch(`${SERVER_API_URL}/servicos`, { cache: 'no-store' });
    if (resServicos.ok) {
      servicos = await resServicos.json();
    }
  } catch (error) {
    console.error('Erro ao buscar serviços no detalhe do projeto:', error);
  }

  let membrosPorCoordenacao = [];
  try {
    const resMembros = await fetch(`${SERVER_API_URL}/membros-por-coordenacao`, { cache: 'no-store' });
    if (resMembros.ok) {
      membrosPorCoordenacao = await resMembros.json();
    }
  } catch (error) {
    console.error('Erro ao buscar membros por coordenação no detalhe do projeto:', error);
  }

  const latestAcomp = projeto.acompanhamentos[0] || null;
  const statusConfig = getStatusBadge(projeto.status);

  // Dividir membros entre gerente e consultores
  const gerentes = projeto.membros.filter((m) => 
    m.cargo.toLowerCase().includes('gerente') && m.cargo.toLowerCase().includes('projeto')
  );
  const consultores = projeto.membros.filter((m) => 
    !(m.cargo.toLowerCase().includes('gerente') && m.cargo.toLowerCase().includes('projeto'))
  );

  return (
    <div className="meta-bg">
      <PapeHeader 
        actionHref="/projetos" 
        actionLabel="Voltar para Projetos" 
        dashboardHref="/dashboard"
        dashboardLabel="Ver Dashboard"
      />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 80px', position: 'relative', zIndex: 1 }}>
        {/* Header de Ações / Título */}
        <div 
          className="meta-card meta-fade-in"
          style={{
            padding: '32px',
            marginBottom: '32px',
            marginTop: '-32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {/* Badge do Status Principal */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  fontSize: '12px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: statusConfig.dot,
                    display: 'inline-block',
                  }}
                />
                {statusConfig.label}
              </div>

              {latestAcomp && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--meta-navy-10)',
                    color: 'var(--meta-navy-70)',
                    fontSize: '12px',
                    fontWeight: '700',
                  }}
                >
                  Progresso: {latestAcomp.pct_conclusao}
                </div>
              )}
            </div>

            <h2 className="h2" style={{ color: 'var(--meta-navy)', fontWeight: '800', margin: 0 }}>
              {projeto.nome}
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <EditProjectButton projeto={projeto} servicos={servicos} membrosPorCoordenacao={membrosPorCoordenacao} />
            <DeleteProjectButton projetoId={projeto.id} projetoNome={projeto.nome} />
            <Link 
              href="/projetos"
              className="btn btn-secondary"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Lista de Projetos
            </Link>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          
          {/* Ficha Técnica Card */}
          <div className="meta-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ color: 'var(--meta-blue)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 className="h4" style={{ margin: 0, fontWeight: '700', color: 'var(--meta-navy)' }}>
                Ficha Técnica
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
                  Descrição
                </strong>
                <p style={{ fontSize: '15px', color: 'var(--meta-navy-70)', lineHeight: '1.6', margin: 0 }}>
                  {projeto.descricao_projeto || projeto.descricao || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
                    Data Oficial de Início
                  </strong>
                  <span style={{ fontSize: '15px', color: 'var(--meta-navy)', fontWeight: '600' }}>
                    {formatDate(projeto.data_inicio)}
                  </span>
                </div>
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
                    Contrato
                  </strong>
                  <span style={{ fontSize: '15px', color: 'var(--meta-navy)', fontWeight: '600' }}>
                    {projeto.numero_contrato || 'Sem contrato registrado'}
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Coordenações Envolvidas
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {projeto.coordenacoes.length > 0 ? (
                    projeto.coordenacoes.map((coord) => (
                      <span
                        key={coord.id}
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(0, 103, 255, 0.08)',
                          color: 'var(--meta-blue)',
                        }}
                      >
                        {coord.nome}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontStyle: 'italic' }}>Nenhuma coordenação associada.</span>
                  )}
                </div>
              </div>

              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Serviços
                </strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {projeto.servicos.length > 0 ? (
                    projeto.servicos.map((serv) => (
                      <span
                        key={serv.id}
                        style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--meta-navy-10)',
                          color: 'var(--meta-navy-70)',
                        }}
                      >
                        {serv.nome}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontStyle: 'italic' }}>Nenhum serviço mapeado.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financeiro & Orientador Card */}
          <div className="meta-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ color: 'var(--meta-blue)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <h3 className="h4" style={{ margin: 0, fontWeight: '700', color: 'var(--meta-navy)' }}>
                  Financeiro & Orientação
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div 
                  style={{
                    background: 'var(--meta-gradient-h)',
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    color: 'white',
                    boxShadow: 'var(--shadow-blue)',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700, letterSpacing: '0.05em' }}>
                    Valor Total do Contrato
                  </strong>
                  <span style={{ fontSize: '28px', fontWeight: '800', display: 'block', marginTop: '4px' }}>
                    {formatCurrency(projeto.valor_total)}
                  </span>
                </div>

                <div 
                  style={{
                    border: '2px solid var(--meta-navy-10)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#FAFBFC',
                  }}
                >
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
                    Orientador Técnico
                  </strong>
                  {projeto.possui_orientador === 1 || projeto.nome_orientador ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--meta-success)', fontSize: '20px' }}>✓</span>
                      <div>
                        <span style={{ fontSize: '15px', color: 'var(--meta-navy)', fontWeight: '700', display: 'block' }}>
                          {projeto.nome_orientador || 'Orientador não nomeado'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--meta-navy-50)' }}>
                          Possui acompanhamento docente
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--meta-navy-30)', fontSize: '20px' }}>✗</span>
                      <div>
                        <span style={{ fontSize: '15px', color: 'var(--meta-navy-50)', fontWeight: '600', display: 'block' }}>
                          Não possui orientador
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--meta-navy-30)' }}>
                          Acompanhamento direto pela coordenação
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {latestAcomp && (
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--meta-navy-10)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--meta-navy-70)' }}>
                  <span>Última resposta:</span>
                  <strong style={{ color: 'var(--meta-navy)' }}>{formatShortDate(latestAcomp.data_resposta)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Equipe Alocada Card */}
          <div className="meta-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ color: 'var(--meta-blue)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="h4" style={{ margin: 0, fontWeight: '700', color: 'var(--meta-navy)' }}>
                Equipe Alocada
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Seção Gerentes */}
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Gerente do Projeto
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {gerentes.length > 0 ? (
                    gerentes.map((g) => (
                      <div 
                        key={g.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid rgba(0, 103, 255, 0.2)',
                          backgroundColor: 'rgba(0, 103, 255, 0.02)',
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--meta-blue)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '14px',
                        }}>
                          {g.nome.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '14px', color: 'var(--meta-navy)', display: 'block' }}>{g.nome}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontStyle: 'italic', padding: '8px 0' }}>
                      Nenhum gerente vinculado a este projeto.
                    </div>
                  )}
                </div>
              </div>

              {/* Seção Consultores */}
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>
                  Consultores e Membros da Equipe
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                  {consultores.length > 0 ? (
                    consultores.map((c) => (
                      <div 
                        key={c.id} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--meta-navy-10)',
                          backgroundColor: '#FAFBFC',
                        }}
                      >
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--meta-navy-30)',
                          color: 'var(--meta-navy-90)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '12px',
                        }}>
                          {c.nome.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13.5px', color: 'var(--meta-navy)', display: 'block' }}>{c.nome}</strong>
                          <span style={{ fontSize: '11px', color: 'var(--meta-navy-50)' }}>
                            {c.cargo} {c.coordenacao_sigla ? `— ${c.coordenacao_sigla}` : ''}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--meta-navy-50)', fontStyle: 'italic', padding: '8px 0' }}>
                      Nenhum consultor alocado ativamente.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Indicadores de Saúde / Métricas do Último Acompanhamento */}
        {latestAcomp && (
          <div className="meta-card" style={{ padding: '28px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ color: 'var(--meta-blue)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
              </div>
              <h3 className="h4" style={{ margin: 0, fontWeight: '700', color: 'var(--meta-navy)' }}>
                Indicadores de Saúde (Último Acompanhamento)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {/* Indicador 1: Comunicação com o Cliente */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Comunicação com o Cliente</span>
                  <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.comunicacao_cliente} / 5</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(latestAcomp.comunicacao_cliente / 5) * 100}%`, backgroundColor: 'var(--meta-blue)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Indicador 2: Confiança do Cliente */}
              {latestAcomp.abertura_cliente !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Confiança/Abertura do Cliente</span>
                    <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.abertura_cliente} / 5</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(latestAcomp.abertura_cliente / 5) * 100}%`, backgroundColor: 'var(--meta-blue)', borderRadius: '4px' }} />
                  </div>
                </div>
              )}

              {/* Indicador 3: Eficácia da Metodologia */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Eficácia da Metodologia</span>
                  <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.eficacia_metodologia} / 5</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(latestAcomp.eficacia_metodologia / 5) * 100}%`, backgroundColor: 'var(--meta-blue)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Indicador 4: Capacitação da Equipe */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Capacitação da Equipe</span>
                  <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.capacitacao_equipe} / 5</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(latestAcomp.capacitacao_equipe / 5) * 100}%`, backgroundColor: 'var(--meta-blue)', borderRadius: '4px' }} />
                </div>
              </div>

              {/* Indicador 5: Nível de Retrabalho */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Nível de Retrabalho (Menor é melhor)</span>
                  <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.nivel_retrabalho} / 5</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${(latestAcomp.nivel_retrabalho / 5) * 100}%`, 
                      backgroundColor: latestAcomp.nivel_retrabalho >= 4 ? 'var(--meta-danger)' : latestAcomp.nivel_retrabalho >= 3 ? 'var(--meta-warning)' : 'var(--meta-success)', 
                      borderRadius: '4px' 
                    }} 
                  />
                </div>
              </div>

              {/* Indicador 6: Suficiência de Orçamento */}
              {latestAcomp.suficiencia_orcamento_nota !== null && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13.5px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--meta-navy-70)' }}>Suficiência do Orçamento</span>
                    <strong style={{ color: 'var(--meta-navy)' }}>{latestAcomp.suficiencia_orcamento_nota} / 5</strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--meta-navy-10)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(latestAcomp.suficiencia_orcamento_nota / 5) * 100}%`, backgroundColor: 'var(--meta-blue)', borderRadius: '4px' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Outros Detalhes Qualitativos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '28px', borderTop: '1px solid var(--meta-navy-10)', paddingTop: '24px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
                  Modelo de Gerenciamento
                </strong>
                <span style={{ fontSize: '15px', color: 'var(--meta-navy)', fontWeight: '600' }}>
                  {latestAcomp.modelo_gerenciamento}
                </span>
              </div>

              {latestAcomp.impacto_cliente && (
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 700 }}>
                    Impacto no Cliente
                  </strong>
                  <span style={{ fontSize: '15px', color: 'var(--meta-navy)', fontWeight: '600' }}>
                    {latestAcomp.impacto_cliente}
                  </span>
                </div>
              )}

              {latestAcomp.motivos_atraso && latestAcomp.motivos_atraso.length > 0 && (
                <div>
                  <strong style={{ display: 'block', fontSize: '12px', color: 'var(--meta-navy-50)', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>
                    Motivos de Atraso Relatados
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {latestAcomp.motivos_atraso.map((motivo, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(229, 72, 77, 0.1)',
                          color: 'var(--meta-danger)',
                        }}
                      >
                        {motivo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Histórico Completo de Acompanhamentos (Linha do Tempo) */}
        <div className="meta-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <div style={{ color: 'var(--meta-blue)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="h4" style={{ margin: 0, fontWeight: '700', color: 'var(--meta-navy)' }}>
              Histórico de Acompanhamentos ({projeto.acompanhamentos.length})
            </h3>
          </div>

          {projeto.acompanhamentos.length > 0 ? (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative',
                paddingLeft: '20px',
                borderLeft: '2px solid var(--meta-navy-10)',
                marginLeft: '10px',
              }}
            >
              {projeto.acompanhamentos.map((acomp, idx) => {
                const cronBadge = getCronogramaBadge(acomp.status_cronograma);
                return (
                  <div 
                    key={acomp.id} 
                    style={{
                      position: 'relative',
                      backgroundColor: '#FAFBFC',
                      padding: '20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--meta-navy-10)',
                    }}
                  >
                    {/* Marcador na linha do tempo */}
                    <div 
                      style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '24px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? 'var(--meta-blue)' : 'var(--meta-navy-30)',
                        border: '4px solid var(--meta-white)',
                        boxShadow: idx === 0 ? '0 0 0 4px rgba(0, 103, 255, 0.15)' : 'none',
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--meta-navy)' }}>
                        {formatDate(acomp.data_resposta)}
                      </span>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: cronBadge.bg,
                            color: cronBadge.color,
                            textTransform: 'uppercase',
                          }}
                        >
                          {acomp.status_cronograma}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--meta-navy-10)',
                            color: 'var(--meta-navy-70)',
                          }}
                        >
                          Conclusão: {acomp.pct_conclusao}
                        </span>

                        <DeleteAcompanhamentoButton
                          acompanhamentoId={acomp.id}
                          dataRespostaFormatada={formatDate(acomp.data_resposta)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13.5px' }}>
                      <div>
                        <span style={{ color: 'var(--meta-navy-50)', display: 'block', marginBottom: '2px' }}>Modelo de Gerenciamento:</span>
                        <strong style={{ color: 'var(--meta-navy)' }}>{acomp.modelo_gerenciamento}</strong>
                      </div>

                      {acomp.satisfacao_cliente !== null && (
                        <div>
                          <span style={{ color: 'var(--meta-navy-50)', display: 'block', marginBottom: '2px' }}>Satisfação do Cliente:</span>
                          <strong style={{ color: 'var(--meta-navy)' }}>{acomp.satisfacao_cliente} / 5</strong>
                        </div>
                      )}

                      {acomp.impacto_cliente && (
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--meta-navy-50)', display: 'block', marginBottom: '2px' }}>Impacto no Cliente:</span>
                          <span style={{ color: 'var(--meta-navy-70)' }}>{acomp.impacto_cliente}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--meta-navy-50)' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>📭</div>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>Nenhum acompanhamento enviado para este projeto ainda.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
