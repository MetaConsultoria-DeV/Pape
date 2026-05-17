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
  {
    value: 'Não',
    label: 'Não houve impacto',
    description: 'Não houve qualquer percepção negativa pelo cliente. A qualidade dos entregáveis e do relacionamento seguiram conforme o esperado.',
  },
  {
    value: 'Leve',
    label: 'Leve',
    description: 'Pequenos desvios foram percebidos, porém sem afetar a confiança ou satisfação geral do cliente.',
  },
  {
    value: 'Moderado',
    label: 'Moderado',
    description: 'O cliente percebeu claramente o impacto e exigiu explicações ou alterações, sem comprometer totalmente a satisfação.',
  },
  {
    value: 'Grave',
    label: 'Grave',
    description: 'Impacto significativo na confiança, com insatisfação explícita, risco de cancelamento ou reclamações formais.',
  },
];

// Seção: Orçamento
const SUFICIENCIA_ORCAMENTO = [
  {
    value: '1',
    label: '1',
    description: 'O orçamento é claramente incompatível com a realidade do projeto. Já impede execução adequada ou gera riscos críticos.',
  },
  {
    value: '2',
    label: '2',
    description: 'O orçamento cobre apenas parte das necessidades, exigindo adaptações frequentes, cortes de escopo ou improvisações.',
  },
  {
    value: '3',
    label: '3',
    description: 'O orçamento atende ao básico, mas sem margem. Qualquer imprevisto pode impactar prazo, qualidade ou organização.',
  },
  {
    value: '4',
    label: '4',
    description: 'O orçamento é adequado às necessidades do projeto e permite execução planejada, com pequenas margens para ajustes.',
  },
  {
    value: '5',
    label: '5',
    description: 'O orçamento cobre plenamente as necessidades e oferece margem confortável para imprevistos, otimizações ou melhoria de qualidade.',
  },
  { value: 'Não necessitou', label: 'Não necessitou de orçamento' },
];

const DIC_EFETIVIDADE_ORIENTADOR = [
  'As contribuições são pouco relevantes ou desconectadas do projeto.',
  'As contribuições ajudam de maneira pontual, mas com baixo impacto real na qualidade final.',
  'As contribuições são úteis, mas apenas para aspectos básicos e com limitações para atividades mais complexas.',
  'As contribuições técnicas são claras e aplicáveis, melhorando a qualidade final das entregas.',
  'As contribuições, além de claras e aplicáveis, são estratégicas, elevando significativamente a qualidade do projeto.',
];

const DIC_DISPONIBILIDADE_ORIENTADOR = [
  'O orientador é ausente ou apresenta dificuldade recorrente para marcar reuniões e fornecer respostas.',
  'O orientador tem uma disponibilidade irregular, causando atrasos ou bloqueios.',
  'O orientador é disponível dentro do esperado, com algumas limitações.',
  'O orientador é disponível com frequência e responde em tempo razoável.',
  'O orientador apresenta disponibilidade e respostas rápidas, facilitando o andamento do projeto.',
];

const DIC_VALOR_CLIENTE = [
  'Entregas não atendem às expectativas nem geram utilidade clara.',
  'Valor limitado, com necessidade de muitos ajustes.',
  'Entregas úteis, mas sem destaque ou impacto claro.',
  'Entregas relevantes e bem recebidas pelo cliente.',
  'Entregas claramente valiosas, gerando entusiasmo e confiança.',
];

const DIC_VARIACAO_ESCOPO = [
  'Houveram muitas mudanças frequentes e não controladas de escopo, afetando gravemente o projeto.',
  'Houveram várias mudanças relevantes durante algumas etapas do projeto.',
  'Houveram algumas mudanças pontuais, que foram controladas.',
  'Houveram poucas alterações, sem impacto significativo na qualidade e andamento final.',
  'O escopo manteve-se totalmente conforme planejado.',
];

const DIC_CAPACITACAO_EQUIPE = [
  'A equipe não possui conhecimento básico para executar o serviço, sendo totalmente dependente do coordenador/orientador e gerando retrabalho frequente.',
  'A equipe possui noções básicas, mas apresenta dificuldades técnicas recorrentes que atrasam o projeto ou afetam a qualidade.',
  'A equipe possui conhecimento básico e executa o necessário com suporte moderado.',
  'A equipe demonstra domínio técnico consistente, executa com autonomia na maior parte do tempo e entrega com boa qualidade.',
  'A equipe demonstra alto domínio técnico, resolvendo problemas complexos com autonomia e elevando a qualidade do projeto.',
];

const DIC_EFICACIA_METODOLOGIA = [
  'A metodologia não se adequa ao projeto, gerando clara confusão, retrabalho ou atrasos frequentes durante a execução.',
  'A metodologia funciona parcialmente, mas exige muitos ajustes durante a execução devido à falta de tempo ou profundidade técnica.',
  'A metodologia atende ao projeto e não requer grandes replanejamentos, mas apresenta limitações que podem impactar a eficiência.',
  'A metodologia está bem alinhada ao serviço, orienta a execução e o cumprimento de prazos conforme o planejado.',
  'A metodologia potencializa a execução, reduz riscos, melhora produtividade e contribui para entregas de alto valor.',
];

const DIC_RETRABALHO = [
  'Há retrabalho constante em todas as etapas, impactando fortemente prazo e qualidade final do projeto.',
  'Há retrabalho recorrente na maioria das etapas, com impacto relevante no prazo e/ou qualidade final do projeto.',
  'Há retrabalho pontual, porém pode ser controlado e sem grandes chances de impactar negativamente o projeto.',
  'Poucos casos de retrabalho, sem impacto relevante no projeto.',
  'O retrabalho é inexistente ou insignificante.',
];

const DIC_COMUNICACAO_CLIENTE = [
  'A comunicação é inexistente ou com muitas falhas, com atrasos longos, ruídos frequentes ou falta de alinhamento básico.',
  'A comunicação ocorre, mas com lacunas, informações incompletas ou dificuldade de alinhamento.',
  'A comunicação é funcional, porém reativa.',
  'A comunicação é clara, regular e organizada. Os alinhamentos ocorrem com boa fluidez.',
  'A comunicação, além de organizada e regular, é rápida, transparente e estratégica.',
];

const DIC_ABERTURA_CLIENTE = [
  'Cliente demonstra desconfiança, resistência ao diálogo ou evita compartilhar informações necessárias.',
  'Cliente responde apenas se necessário, com pouca abertura para discussões mais profundas.',
  'Cliente se comunica de forma funcional, mas com reservas ou cautela dependendo do assunto abordado.',
  'Cliente demonstra confiança, abertura ao diálogo e disposição para colaborar.',
  'Cliente é transparente, colaborativo e trata a Meta como uma parceira estratégica.',
];

const DIC_SATISFACAO_CLIENTE = [
  'Cliente demonstrou insatisfação explícita, com críticas diretas e/ou questionamento do valor do projeto.',
  'Cliente demonstra frustração com entregas, prazos ou comunicação, mas não expressou vontade de cancelar o projeto.',
  'Cliente não demonstra insatisfação, mas também não expressa entusiasmo.',
  'Cliente demonstra satisfação clara com as entregas e andamento do projeto.',
  'Cliente elogia o trabalho constantemente e demonstra entusiasmo, com grandes chances de colaborar conosco futuramente.',
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
  ], 'Para começar, selecione seu nome na lista de gerentes de projetos.'),

  // ── 2. Iniciação — Seleção do projeto ───────────────────────────────────────
  step('Iniciação', 'Sobre qual projeto?', [
    selectProjetos('projeto_externo_id', 'Sobre qual projeto você está respondendo?', { number: 1 }),
  ], 'Selecione o projeto externo que você está acompanhando.'),

  // ── 5. Orientador Técnico — Presença ────────────────────────────────────────
  // Se "Não" → pula os Detalhes do orientador (step seguinte) e vai para Metodologia
  step('Orientador Técnico', 'Sobre o orientador', [
    radio('possui_orientador', 'O projeto possui orientador técnico?', SIM_NAO, { number: 8, columns: 2 }),
  ]),

  // ── 6. Orientador Técnico — Detalhes ── aparece apenas se: possui_orientador = "Sim"
  step('Orientador Técnico', 'Detalhes do orientador', [
    input('nome_orientador',            'Qual o nome do orientador?',            { number: 9,  placeholder: 'Nome completo' }),
    scale('efetividade_orientador',     'Qual a efetividade do orientador?',     { number: 10, lowLabel: 'Baixa', highLabel: 'Alta', dictionary: DIC_EFETIVIDADE_ORIENTADOR }),
    scale('disponibilidade_orientador', 'Qual a disponibilidade do orientador?', { number: 11, lowLabel: 'Baixa', highLabel: 'Alta', dictionary: DIC_DISPONIBILIDADE_ORIENTADOR }),
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
      scale('cliente_percebeu_valor', 'O cliente percebeu valor sendo entregue?', { number: 16, lowLabel: 'Não percebeu', highLabel: 'Percebeu muito', dictionary: DIC_VALOR_CLIENTE }),
      radio('pct_marcos_prazo',       'Percentual de marcos cumpridos no prazo?', PERCENTUAIS, { number: 17 }),
      scale('variacao_escopo',        'Qual foi a variação de escopo?',           { number: 18, lowLabel: 'Pequena',      highLabel: 'Grande', dictionary: DIC_VARIACAO_ESCOPO }),
    ],
    'Avalie a percepção de valor e o cumprimento de marcos.',
  ),

  // ── 10. Execução — Cronograma e impacto ─────────────────────────────────────
  // Pergunta 21 (motivos do atraso) fica no step seguinte por ser condicional;
  // por isso o número aqui vai de 19→20→22 (22 vem depois do step condicional)
  step('Execução', 'Cronograma e impacto', [
    radio('pct_conclusao',    'Qual o percentual de conclusão do projeto?', PERCENTUAIS,       { number: 19 }),
    radio('status_cronograma','Como está o cronograma?',                    STATUS_CRONOGRAMA, { number: 20 }),
    radio('impacto_cliente',  'Qual o impacto percebido pelo cliente?',     IMPACTO_CLIENTE,   { number: 22 }),
  ], 'Como o projeto está se comportando em termos de prazos?'),

  // ── 11. Execução — Motivos do atraso ── aparece apenas se: status = "Com risco" ou "Atrasado"
  step('Execução', 'Motivos do atraso', [
    checkbox('motivos_atraso', 'Quais são os motivos do atraso?', MOTIVOS_ATRASO, { number: 21 }),
  ], 'Selecione todos os motivos que se aplicam.'),

  // ── 12. Capacidade de Execução ──────────────────────────────────────────────
  step('Capacidade de Execução', 'Equipe e metodologia', [
    scale('capacitacao_equipe',   'Como avalia a capacitação da equipe?',    { number: 23, dictionary: DIC_CAPACITACAO_EQUIPE }),
    scale('eficacia_metodologia', 'Qual a eficácia da metodologia adotada?', { number: 24, lowLabel: 'Pouco eficaz', highLabel: 'Muito eficaz', dictionary: DIC_EFICACIA_METODOLOGIA }),
    scale('nivel_retrabalho',     'Qual o nível de retrabalho?',             { number: 25, lowLabel: 'Pouco',        highLabel: 'Muito', dictionary: DIC_RETRABALHO }),
  ], 'Avalie a equipe, a metodologia adotada e o nível de retrabalho.'),

  // ── 13. Comunicação ─────────────────────────────────────────────────────────
  step('Comunicação', 'Relação com o cliente', [
    scale('comunicacao_cliente', 'Como foi a comunicação com o cliente?',     { number: 26, lowLabel: 'Ruim',         highLabel: 'Excelente', dictionary: DIC_COMUNICACAO_CLIENTE }),
    scale('abertura_cliente',    'Qual a abertura do cliente para mudanças?', { number: 27, lowLabel: 'Pouca',        highLabel: 'Muita', dictionary: DIC_ABERTURA_CLIENTE }),
    scale('satisfacao_cliente',  'Qual sua satisfação geral com o projeto?',  { number: 28, lowLabel: 'Insatisfeito', highLabel: 'Muito satisfeito', dictionary: DIC_SATISFACAO_CLIENTE }),
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
      <PapeHeader actionHref="/novo-projeto" actionLabel="Criar novo projeto" />
      <PapeForm projetos={projetos} membros={membros} steps={STEPS} />
    </div>
  );
}
