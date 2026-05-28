import { z } from 'zod';

export const papeFormSchema = z.object({
  nome_projeto: z.string().optional(),
  respondente_nome: z.string().min(1, 'Nome é obrigatório'),

  // Iniciação
  projeto_externo_id: z.number().min(1, 'Selecione um projeto'),
  primeira_resposta: z.enum(['Sim', 'Não']),

  // Procedimentos Iniciais (condicional)
  data_inicio: z.string().optional(),
  numero_contrato: z.string().optional(),
  valor_projeto: z.string().optional(),
  servicos_projeto: z.array(z.number()).optional(),
  coordenacoes: z.array(z.number()).optional(),
  membros_projeto: z.array(z.string()).optional(),
  gerente_projeto: z.string().optional(),

  // Orientador
  possui_orientador: z.enum(['Sim', 'Não']),
  nome_orientador: z.string().optional(),
  efetividade_orientador: z.number().min(1).max(5).optional(),
  disponibilidade_orientador: z.number().min(1).max(5).optional(),

  // Metodologia
  modelo_gerenciamento: z.enum(['Tradicional', 'Ágil', 'Híbrido']),

  // Ágil (condicional)
  pct_story_points: z
    .enum(['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'])
    .optional(),
  houve_impedimentos: z.enum(['Sim', 'Não']).optional(),
  tipos_impedimentos: z.array(z.string()).optional(),

  // Tradicional/Híbrido (condicional)
  cliente_percebeu_valor: z.number().min(1).max(5).optional(),
  pct_marcos_prazo: z
    .enum(['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'])
    .optional(),
  variacao_escopo: z.number().min(1).max(5).optional(),

  // Execução
  pct_conclusao: z.enum(['0-20%', '21-40%', '41-60%', '61-80%', '81-100%']),
  status_cronograma: z.enum([
    'Dentro do prazo',
    'Com risco de atraso',
    'Atrasado',
    'Concluido',
  ]),
  motivos_atraso: z.array(z.string()).optional(),
  impacto_cliente: z
    .enum(['Não', 'Leve', 'Moderado', 'Grave'])
    .optional(),

  // Capacidade
  capacitacao_equipe: z.number().min(1).max(5),
  eficacia_metodologia: z.number().min(1).max(5),
  nivel_retrabalho: z.number().min(1).max(5),

  // Comunicação
  comunicacao_cliente: z.number().min(1).max(5),
  abertura_cliente: z.number().min(1).max(5),
  satisfacao_cliente: z.number().min(1).max(5),

  // Orçamento
  suficiencia_orcamento: z
    .union([z.enum(['1', '2', '3', '4', '5']), z.literal('Não necessitou')])
    .optional(),
});

export type PapeFormInputs = z.infer<typeof papeFormSchema>;
