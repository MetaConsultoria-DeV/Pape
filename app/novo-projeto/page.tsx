import PapeHeader from '@/components/PapeHeader';
import PapeForm from '@/components/PapeForm';
import { input, radio, scale, selectServicos, selectConsultores, step } from '@/lib/stepBuilders';
import { StepDef } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export const dynamic = 'force-dynamic';

const SIM_NAO = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
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
    selectServicos('servicos_projeto', 'Quais os serviços do projeto?', {
      number: 5,
    }),
    selectConsultores('membros_projeto', 'Quem são os consultores alocados no projeto?', {
      number: 6,
    }),
    selectConsultores('gerentes_projeto', 'Qual o gerente do projeto?', {
      number: 7,
    }),
  ], 'Preencha as informações iniciais do contrato.'),

  step('Orientador Técnico', 'Sobre o orientador', [
    radio('possui_orientador', 'O projeto possui orientador técnico?', SIM_NAO, {
      number: 8,
      columns: 2,
    }),
    input('nome_orientador', 'Qual o nome do orientador?', {
      number: 9,
      placeholder: 'Nome completo',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
    scale('efetividade_orientador', 'Qual a efetividade do orientador?', {
      number: 10,
      lowLabel: 'Baixa',
      highLabel: 'Alta',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
    scale('disponibilidade_orientador', 'Qual a disponibilidade do orientador?', {
      number: 11,
      lowLabel: 'Baixa',
      highLabel: 'Alta',
      showWhen: { field: 'possui_orientador', value: 'Sim' },
    }),
  ], 'Informe se o projeto terá orientação técnica e complete os detalhes quando houver.'),
];

export default async function NovoProjetoPage() {
  let servicos = [];
  let membrosPorCoordenacao = [];
  try {
    const [resServicos, resMembros] = await Promise.all([
      fetch(`${API_URL}/servicos`, { cache: 'no-store' }),
      fetch(`${API_URL}/membros-por-coordenacao`, { cache: 'no-store' }),
    ]);

    if (resServicos.ok) {
      servicos = await resServicos.json();
    }
    if (resMembros.ok) {
      membrosPorCoordenacao = await resMembros.json();
    }
  } catch (error) {
    console.error('Erro ao buscar dados no frontend:', error);
  }

  return (
    <div className="meta-bg">
      <PapeHeader actionHref="/" actionLabel="Voltar ao PAPE" />
      <PapeForm
        projetos={[]}
        membros={[]}
        servicos={servicos}
        membrosPorCoordenacao={membrosPorCoordenacao}
        steps={STEPS}
        mode="visual-project"
        submitLabel="Criar projeto →"
      />
    </div>
  );
}
