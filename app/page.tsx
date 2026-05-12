import { Projeto, Membro, StepDef } from '@/lib/types';
import { input, radio, checkbox, scale, selectProjetos, selectMembros, step } from '@/lib/stepBuilders';
import PapeHeader from '@/components/PapeHeader';
import PapeForm from '@/components/PapeForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

// =============================================================================
// OPÇÕES DE RESPOSTA
// Cada constante alimenta um ou mais campos radio/checkbox abaixo.
// Agrupadas por seção para facilitar manutenção.
// =============================================================================

// Usadas em múltiplas seções
const SIM_NAO = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
];

const PERCENTUAIS = [
  { value: '0-20%',   label: '0% – 20%'   },
  { value: '21-40%',  label: '21% – 40%'  },
  { value: '41-60%',  label: '41% – 60%'  },
  { value: '61-80%',  label: '61% – 80%'  },
  { value: '81-100%', label: '81% – 100%' },
];

// Seção: Procedimentos Iniciais
const COORDENACOES = [
  'Gestão de Negócios',
  'Otimização de Processos',
  'Construção e Energia',
  'Desenvolvimento de Máquinas',
  'Tecnologia e Desenvolvimento',
];

// Seção: Metodologia
const METODOLOGIAS = [
  { value: 'Tradicional', label: 'Tradicional', description: 'Cronograma fechado, marcos e fases definidas' },
  { value: 'Ágil',        label: 'Ágil',        description: 'Sprints, entregas iterativas, story points' },
  { value: 'Híbrido',     label: 'Híbrido',     description: 'Combinação das duas abordagens' },
];

// Seção: Gerenciamento Ágil
const TIPOS_IMPEDIMENTOS = ['Técnico', 'Recurso', 'Orçamento', 'Externo', 'Outro'];

// Seção: Execução
const STATUS_CRONOGRAMA = [
  { value: 'Dentro do prazo',     label: 'Dentro do prazo',     description: 'Tudo seguindo conforme o planejado'  },
  { value: 'Com risco de atraso', label: 'Com risco de atraso', description: 'Pode atrasar se nada mudar'          },
  { value: 'Atrasado',            label: 'Atrasado',            description: 'Marcos já não estão sendo cumpridos' },
  { value: 'Concluido',           label: 'Concluído',           description: 'Projeto finalizado'                  },
];

const MOTIVOS_ATRASO = [
  'Escopo mal definido',
  'Falta de recurso',
  'Cliente lento',
  'Mudança de requisitos',
  'Outro',
];

const IMPACTO_CLIENTE = [
  { value: 'Não',      label: 'Não houve impacto' },
  { value: 'Leve',     label: 'Leve'              },
  { value: 'Moderado', label: 'Moderado'          },
  { value: 'Grave',    label: 'Grave'             },
];

// Seção: Orçamento
const SUFICIENCIA_ORCAMENTO = [
  { value: '1',            label: '1 — Muito insuficiente'       },
  { value: '2',            label: '2 — Insuficiente'             },
  { value: '3',            label: '3 — Adequado'                 },
  { value: '4',            label: '4 — Bem adequado'             },
  { value: '5',            label: '5 — Muito adequado'           },
  { value: 'Não necessitou', label: 'Não necessitou de orçamento' },
];

// =============================================================================
// STEPS DO FORMULÁRIO
//
// A ordem do array é a ordem base de exibição.
// A navegação condicional (pular steps) é controlada em PapeForm.tsx → getNextStep().
// O número ao lado de cada campo (ex: { number: 3 }) é o índice visível no formulário.
// =============================================================================

const STEPS: StepDef[] = [

  // ── 1. Identificação ────────────────────────────────────────────────────────
  step('Identificação', 'Vamos começar?', [
    selectMembros('respondente_nome', 'Quem está respondendo?'),
  ], 'Para começar, selecione seu nome na lista de membros da equipe.'),

  // ── 2. Iniciação — Seleção do projeto ───────────────────────────────────────
  step('Iniciação', 'Sobre qual projeto?', [
    selectProjetos('projeto_externo_id', 'Sobre qual projeto você está respondendo?', { number: 1 }),
  ], 'Selecione o projeto externo que você está acompanhando.'),

  // ── 3. Iniciação — Frequência de resposta ───────────────────────────────────
  // Se "Não" → pula os Procedimentos Iniciais (step seguinte) e vai para Orientador
  step('Iniciação', 'Primeira resposta?', [
    radio('primeira_resposta', 'É a primeira vez respondendo este formulário para o projeto?', SIM_NAO, { number: 2, columns: 2 }),
  ]),

  // ── 4. Procedimentos Iniciais ── aparece apenas se: primeira_resposta = "Sim"
  step('Procedimentos Iniciais', 'Dados do projeto', [
    input('data_inicio',      'Qual a data oficial de início do projeto?', { number: 3, inputType: 'date' }),
    input('numero_contrato',  'Número do contrato',                         { number: 4, hint: 'Exemplo: 111.1111',            placeholder: '111.1111'                   }),
    input('valor_projeto',    'Valor do projeto',                           { number: 5, hint: 'Exemplo: 1.000,00 (mil reais)', placeholder: '1.000,00'                   }),
    input('servicos_projeto', 'Quais os serviços do projeto?',              { number: 6, placeholder: 'Liste os serviços contratados' }),
    checkbox('coordenacoes',  'Coordenações às quais o projeto faz parte',  COORDENACOES, { number: 7 }),
  ], 'Confirme as informações iniciais do contrato.'),

  // ── 5. Orientador Técnico — Presença ────────────────────────────────────────
  // Se "Não" → pula os Detalhes do orientador (step seguinte) e vai para Metodologia
  step('Orientador Técnico', 'Sobre o orientador', [
    radio('possui_orientador', 'O projeto possui orientador técnico?', SIM_NAO, { number: 8, columns: 2 }),
  ]),

  // ── 6. Orientador Técnico — Detalhes ── aparece apenas se: possui_orientador = "Sim"
  step('Orientador Técnico', 'Detalhes do orientador', [
    input('nome_orientador',            'Qual o nome do orientador?',            { number: 9,  placeholder: 'Nome completo' }),
    scale('efetividade_orientador',     'Qual a efetividade do orientador?',     { number: 10, lowLabel: 'Baixa', highLabel: 'Alta' }),
    scale('disponibilidade_orientador', 'Qual a disponibilidade do orientador?', { number: 11, lowLabel: 'Baixa', highLabel: 'Alta' }),
  ], 'Algumas informações adicionais sobre o orientador do projeto.'),

  // ── 7. Metodologia ──────────────────────────────────────────────────────────
  // Se "Ágil"             → step 8 (Sprints)
  // Se "Tradicional/Híbrido" → step 9 (Marcos)
  step('Metodologia', 'Modelo de gerenciamento', [
    radio('modelo_gerenciamento', 'Qual modelo o projeto está seguindo?', METODOLOGIAS, { number: 12 }),
  ], 'Selecione qual abordagem o projeto está utilizando.'),

  // ── 8. Gerenciamento Ágil ── aparece apenas se: modelo_gerenciamento = "Ágil"
  step('Gerenciamento Ágil', 'Sprints e impedimentos', [
    radio(   'pct_story_points',   'Percentual de story points concluídos?',       PERCENTUAIS,        { number: 13 }),
    radio(   'houve_impedimentos', 'Houve impedimentos durante a execução?',        SIM_NAO,            { number: 14, columns: 2 }),
    // Campo condicional: exibido dentro deste step apenas se houve_impedimentos = "Sim"
    checkbox('tipos_impedimentos', 'Tipos de impedimentos (selecione um ou mais)',  TIPOS_IMPEDIMENTOS, { number: 15, showWhen: { field: 'houve_impedimentos', value: 'Sim' } }),
  ], 'Avalie o progresso da entrega e os bloqueios encontrados.'),

  // ── 9. Gerenciamento Tradicional / Híbrido ── aparece apenas se: modelo ≠ "Ágil"
  // O eyebrow muda dinamicamente conforme o modelo selecionado
  step(
    { watchField: 'modelo_gerenciamento', map: { Tradicional: 'Gerenciamento Tradicional', Híbrido: 'Gerenciamento Híbrido' } },
    'Marcos e entrega de valor',
    [
      scale('cliente_percebeu_valor', 'O cliente percebeu valor sendo entregue?', { number: 16, lowLabel: 'Não percebeu', highLabel: 'Percebeu muito' }),
      radio('pct_marcos_prazo',       'Percentual de marcos cumpridos no prazo?', PERCENTUAIS, { number: 17 }),
      scale('variacao_escopo',        'Qual foi a variação de escopo?',           { number: 18, lowLabel: 'Pequena',      highLabel: 'Grande'         }),
    ],
    'Avalie a percepção de valor e o cumprimento de marcos.',
  ),

  // ── 10. Execução — Cronograma e impacto ─────────────────────────────────────
  // Pergunta 21 (motivos do atraso) fica no step seguinte por ser condicional;
  // por isso o número aqui vai de 19→20→22 (22 vem depois do step condicional)
  step('Execução', 'Cronograma e impacto', [
    radio('pct_conclusao',    'Qual o percentual de conclusão do projeto?', PERCENTUAIS,       { number: 19 }),
    radio('status_cronograma','Como está o cronograma?',                    STATUS_CRONOGRAMA, { number: 20 }),
    radio('impacto_cliente',  'Qual o impacto percebido pelo cliente?',     IMPACTO_CLIENTE,   { number: 22, columns: 2 }),
  ], 'Como o projeto está se comportando em termos de prazos?'),

  // ── 11. Execução — Motivos do atraso ── aparece apenas se: status = "Com risco" ou "Atrasado"
  step('Execução', 'Motivos do atraso', [
    checkbox('motivos_atraso', 'Quais são os motivos do atraso?', MOTIVOS_ATRASO, { number: 21 }),
  ], 'Selecione todos os motivos que se aplicam.'),

  // ── 12. Capacidade de Execução ──────────────────────────────────────────────
  step('Capacidade de Execução', 'Equipe e metodologia', [
    scale('capacitacao_equipe',   'Como avalia a capacitação da equipe?',    { number: 23 }),
    scale('eficacia_metodologia', 'Qual a eficácia da metodologia adotada?', { number: 24, lowLabel: 'Pouco eficaz', highLabel: 'Muito eficaz' }),
    scale('nivel_retrabalho',     'Qual o nível de retrabalho?',              { number: 25, lowLabel: 'Pouco',        highLabel: 'Muito'        }),
  ], 'Avalie a equipe, a metodologia adotada e o nível de retrabalho.'),

  // ── 13. Comunicação ─────────────────────────────────────────────────────────
  step('Comunicação', 'Relação com o cliente', [
    scale('comunicacao_cliente', 'Como foi a comunicação com o cliente?',     { number: 26, lowLabel: 'Ruim',         highLabel: 'Excelente'       }),
    scale('abertura_cliente',    'Qual a abertura do cliente para mudanças?', { number: 27, lowLabel: 'Pouca',        highLabel: 'Muita'           }),
    scale('satisfacao_cliente',  'Qual sua satisfação geral com o projeto?',  { number: 28, lowLabel: 'Insatisfeito', highLabel: 'Muito satisfeito' }),
  ], 'Avalie como anda a comunicação e a satisfação geral do cliente.'),

  // ── 14. Orçamento ───────────────────────────────────────────────────────────
  step('Orçamento', 'Suficiência do orçamento', [
    radio('suficiencia_orcamento', 'O orçamento foi suficiente?', SUFICIENCIA_ORCAMENTO, { number: 29 }),
  ], 'Última pergunta: o orçamento foi adequado para o projeto?'),

];

// =============================================================================
// DATA FETCHING
// =============================================================================

async function getProjetos(): Promise<Projeto[]> {
  try {
    const res = await fetch(`${API_URL}/projetos`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getMembros(): Promise<Membro[]> {
  try {
    const res = await fetch(`${API_URL}/membros`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// =============================================================================
// PAGE
// =============================================================================

export default async function Page() {
  const [projetos, membros] = await Promise.all([getProjetos(), getMembros()]);

  return (
    <div className="meta-bg">
      <PapeHeader />
      <PapeForm projetos={projetos} membros={membros} steps={STEPS} />
    </div>
  );
}
