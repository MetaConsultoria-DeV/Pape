/* Tipos do formulário PAPE */

// ── Configuração de steps/fields (serializável, para passar de server → client) ──

export type RadioOption = { value: string; label: string; description?: string };

export type FieldDef =
  | { type: 'input'; name: string; label: string; number?: number; hint?: string; inputType?: string; placeholder?: string; showWhen?: { field: string; value: string } }
  | { type: 'textarea'; name: string; label: string; number?: number; hint?: string; placeholder?: string; maxLength?: number; showWhen?: { field: string; value: string } }
  | { type: 'radio'; name: string; label: string; number?: number; options: RadioOption[]; columns?: number; showWhen?: { field: string; value: string } }
  | { type: 'checkbox'; name: string; label: string; number?: number; options: string[]; showWhen?: { field: string; value: string } }
  | { type: 'scale'; name: string; label: string; number?: number; lowLabel?: string; highLabel?: string; dictionary?: string[]; showWhen?: { field: string; value: string } }
  | { type: 'select-projetos'; name: string; label: string; number?: number }
  | { type: 'select-membros';  name: string; label: string; number?: number }
  | { type: 'selectServicos';  name: string; label: string; number?: number }
  | { type: 'selectConsultores'; name: string; label: string; number?: number };

export type StepDef = {
  eyebrow?: string | { watchField: string; map: Record<string, string> };
  title: string;
  description?: string;
  fields: FieldDef[];
};



export interface Projeto {
  id: number;
  nome: string;
  numero_contrato?: string | null;
  valor_total?: number | null;
  possui_orientador?: boolean | null;
  nome_orientador?: string | null;
}

export interface ProjetoDetalhes extends Projeto {
  data_inicio: string;
  servicos: string[];
  coordenacoes: number[];
}

export interface Coordenacao {
  id: number;
  nome: string;
}

export interface Servico {
  id: number;
  nome: string;
  sigla: string;
}

export interface ServicosPorCoordenacao {
  coordenacao_id: number;
  coordenacao_nome: string;
  coordenacao_sigla: string;
  servicos: Servico[];
}

export interface MembrosPorCoordenacao {
  coordenacao_id: number;
  coordenacao_nome: string;
  coordenacao_sigla: string;
  membros: Membro[];
}

export interface Membro {
  id: number;
  nome: string;
  email: string;
}

/* Estrutura do formulário PAPE */
export interface PapeFormData {
  // Identificação
  respondente_nome: string;

  // Iniciação
  projeto_externo_id: number;
  primeira_resposta: 'Sim' | 'Não';

  // Procedimentos Iniciais (condicional: se primeira_resposta = Sim)
  descricao_projeto?: string;
  data_inicio?: string;
  numero_contrato?: string;
  valor_projeto?: string;
  servicos_projeto?: number[];
  coordenacoes?: number[];
  membros_projeto?: string[];
  gerente_projeto?: string;

  // Orientador Técnico
  possui_orientador: 'Sim' | 'Não';
  nome_orientador?: string;
  efetividade_orientador?: 1 | 2 | 3 | 4 | 5;
  disponibilidade_orientador?: 1 | 2 | 3 | 4 | 5;

  // Metodologia
  modelo_gerenciamento: 'Tradicional' | 'Ágil' | 'Híbrido';

  // Seção Ágil (condicional: se modelo = Ágil)
  pct_story_points?: '0-20%' | '21-40%' | '41-60%' | '61-80%' | '81-100%';
  houve_impedimentos?: 'Sim' | 'Não';
  tipos_impedimentos?: string[];

  // Seção Tradicional/Híbrido (condicional: se modelo = Tradicional ou Híbrido)
  cliente_percebeu_valor?: 1 | 2 | 3 | 4 | 5;
  pct_marcos_prazo?: '0-20%' | '21-40%' | '41-60%' | '61-80%' | '81-100%';
  variacao_escopo?: 1 | 2 | 3 | 4 | 5;

  // Execução e Cronograma
  pct_conclusao: '0-20%' | '21-40%' | '41-60%' | '61-80%' | '81-100%';
  status_cronograma: 'Dentro do prazo' | 'Com risco de atraso' | 'Atrasado' | 'Concluido';
  motivos_atraso?: string[];
  impacto_cliente?: 'Não' | 'Leve' | 'Moderado' | 'Grave';

  // Capacidade e Planejamento
  capacitacao_equipe: 1 | 2 | 3 | 4 | 5;
  eficacia_metodologia: 1 | 2 | 3 | 4 | 5;
  nivel_retrabalho: 1 | 2 | 3 | 4 | 5;

  // Comunicação e Cliente
  comunicacao_cliente: 1 | 2 | 3 | 4 | 5;
  abertura_cliente: 1 | 2 | 3 | 4 | 5;
  satisfacao_cliente: 1 | 2 | 3 | 4 | 5;

  // Orçamento e Recursos
  suficiencia_orcamento?: 1 | 2 | 3 | 4 | 5 | 'Não necessitou';
}
