import PapeHeader from '@/components/PapeHeader';
import PapeForm from '@/components/PapeForm';
import { checkbox, input, radio, scale, step } from '@/lib/stepBuilders';
import { StepDef } from '@/lib/types';

const SIM_NAO = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
];

const COORDENACOES = [
  'Gestão de Negócios',
  'Otimização de Processos',
  'Construção e Energia',
  'Desenvolvimento de Máquinas',
  'Tecnologia e Desenvolvimento',
];

const STEPS: StepDef[] = [
  step('Procedimentos Iniciais', 'Dados do projeto', [
    input('nome_projeto', 'Qual o nome do projeto?', {
      number: 1,
      placeholder: 'Exemplo: Projeto Alfa',
    }),
    input('data_inicio', 'Qual a data oficial de início do projeto?', {
      number: 2,
      inputType: 'date',
    }),
    input('numero_contrato', 'Número do contrato', {
      number: 3,
      hint: 'Exemplo: 111.1111',
      placeholder: '111.1111',
    }),
    input('valor_projeto', 'Valor do projeto', {
      number: 4,
      hint: 'Exemplo: 1.000,00 (mil reais)',
      placeholder: '1.000,00',
    }),
    input('servicos_projeto', 'Quais os serviços do projeto?', {
      number: 5,
      placeholder: 'Liste os serviços contratados',
    }),
    checkbox('coordenacoes', 'Coordenações às quais o projeto faz parte', COORDENACOES, {
      number: 6,
    }),
  ], 'Preencha as informações iniciais do contrato.'),

  step('Orientador Técnico', 'Sobre o orientador', [
    radio('possui_orientador', 'O projeto possui orientador técnico?', SIM_NAO, {
      number: 7,
      columns: 2,
    }),
    input('nome_orientador', 'Qual o nome do orientador?', {
      number: 8,
      placeholder: 'Nome completo',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
    scale('efetividade_orientador', 'Qual a efetividade do orientador?', {
      number: 9,
      lowLabel: 'Baixa',
      highLabel: 'Alta',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
    scale('disponibilidade_orientador', 'Qual a disponibilidade do orientador?', {
      number: 10,
      lowLabel: 'Baixa',
      highLabel: 'Alta',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
  ], 'Informe se o projeto terá orientação técnica e complete os detalhes quando houver.'),
];

export default function NovoProjetoPage() {
  return (
    <div className="meta-bg">
      <PapeHeader actionHref="/" actionLabel="Voltar ao PAPE" />
      <PapeForm
        projetos={[]}
        membros={[]}
        steps={STEPS}
        mode="visual-project"
        submitLabel="Criar projeto →"
      />
    </div>
  );
}
