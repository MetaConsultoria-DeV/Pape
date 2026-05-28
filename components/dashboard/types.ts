export interface DashboardProject {
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

export interface RiskMatrixRow {
  motivo: string;
  total: number;
  coordenacoes: Record<string, number>;
}

export interface RiskProject {
  projeto: string;
  status: string;
  motivos: string[];
  coordenacao: string;
}

export interface RiskDashboard {
  motivos_por_coordenacao: RiskMatrixRow[];
  projetos_em_risco: RiskProject[];
  suficiencia_orcamento: ChartDatum[];
  comunicacao_cliente: ChartDatum[];
  capacitacao_equipe: ChartDatum[];
}

export interface MethodAttention {
  projeto: string;
  indicador: string;
  nota: number;
  modelo: string;
}

export interface MethodScopeDashboard {
  retrabalho: ChartDatum[];
  variacao_escopo: ChartDatum[];
  capacitacao_equipe: ChartDatum[];
  eficacia_metodologia: ChartDatum[];
  pontos_atencao: MethodAttention[];
  medias: {
    retrabalho: number;
    variacao_escopo: number;
    capacitacao_equipe: number;
    eficacia_metodologia: number;
  };
}

export interface ClientImpact {
  projeto: string;
  impacto_cliente: string;
  cliente_percebeu_valor?: number | null;
  orientador: string;
}

export interface ClientAttention {
  projeto: string;
  indicador: string;
  nota: number;
  orientador: string;
}

export interface ClientOrientationDashboard {
  comunicacao_cliente: ChartDatum[];
  confianca_cliente: ChartDatum[];
  satisfacao_cliente: ChartDatum[];
  valorizacao_cliente: ChartDatum[];
  orientadores: {
    efetividade: ChartDatum[];
    disponibilidade: ChartDatum[];
  };
  impactos: ClientImpact[];
  pontos_atencao: ClientAttention[];
  quantidade_orientadores: number;
  projetos_com_orientacao_pct: number;
  medias: {
    comunicacao_cliente: number;
    confianca_cliente: number;
    satisfacao_cliente: number;
    valorizacao_cliente: number;
    efetividade_orientador: number;
    disponibilidade_orientador: number;
  };
}

export interface AgileProject {
  projeto: string;
  gerente: string;
  data_resposta?: string | null;
  impacto_cliente: string;
  pct_story_points: string;
  impedimentos: string[];
  intervencao_pmo: string;
  one_on_one_pmo: string;
}

export interface AgileDashboard {
  story_points: ChartDatum[];
  impedimentos: ChartDatum[];
  impactos: ChartDatum[];
  projetos: AgileProject[];
  resumo: {
    total_projetos: number;
    media_story_points: number;
    projetos_com_impedimento: number;
    intervencoes_pmo: number;
    solicitacoes_1_1: number;
  };
}

export interface DetailFocusProject {
  projeto_id?: number | null;
  projeto: string;
  gerente: string;
  status_cronograma: string;
  pct_conclusao: string;
  data_resposta?: string | null;
  impacto_cliente: string;
  intervencao_pmo: string;
  one_on_one_pmo: string;
}

export interface DetailHistoryRow {
  data_resposta?: string | null;
  status_cronograma: string;
  pct_conclusao: string;
  impacto_cliente: string;
  intervencao_pmo: string;
  one_on_one_pmo: string;
  confianca_cliente?: number;
  comunicacao_cliente?: number;
  eficacia_metodologia?: number;
  capacitacao_equipe?: number;
  nivel_retrabalho?: number;
  suficiencia_orcamento?: number;
  motivos_atraso?: string[];
}

export interface DetailProjectSummary {
  projeto_id?: number | null;
  projeto: string;
  gerente: string;
  status_cronograma: string;
  pct_conclusao: string;
  data_resposta?: string | null;
}

export interface DetailDashboard {
  projeto_foco: DetailFocusProject | null;
  metricas: {
    confianca_cliente?: number;
    comunicacao_cliente?: number;
    eficacia_metodologia?: number;
    capacitacao_equipe?: number;
    nivel_retrabalho?: number;
    suficiencia_orcamento?: number;
  };
  andamento: ChartDatum[];
  motivos_atraso: ChartDatum[];
  historico: DetailHistoryRow[];
  projetos: DetailProjectSummary[];
}

export interface DashboardData {
  total_projetos: number;
  total_respostas?: number;
  media_satisfacao: number;
  metodologias: Record<string, number>;
  status_cronograma: Record<string, number>;
  pct_conclusao?: Record<string, number>;
  motivos_atraso?: ChartDatum[];
  projetos_atuais?: DashboardProject[];
  riscos?: RiskDashboard;
  metodo_escopo?: MethodScopeDashboard;
  cliente_orientacao?: ClientOrientationDashboard;
  agil?: AgileDashboard;
  detalhe?: DetailDashboard;
}

export type ChartDatum = {
  name: string;
  value: number;
};

export type DashboardSlug =
  | 'visao-geral'
  | 'riscos'
  | 'metodo-e-escopo'
  | 'cliente-e-orientacao'
  | 'agil'
  | 'detalhe';
