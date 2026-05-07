'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { papeFormSchema, PapeFormInputs } from '@/lib/schema';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Projeto, Coordenacao, Membro } from '@/lib/types';
import {
  FieldLabel,
  InputField,
  RadioGroup,
  CheckboxGroup,
  ScaleField,
  MetaSymbol,
  StepCard,
} from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const SIM_NAO = [
  { value: 'Sim', label: 'Sim' },
  { value: 'Não', label: 'Não' },
] as const;

const PERCENTUAIS = [
  { value: '0-20%', label: '0% – 20%' },
  { value: '21-40%', label: '21% – 40%' },
  { value: '41-60%', label: '41% – 60%' },
  { value: '61-80%', label: '61% – 80%' },
  { value: '81-100%', label: '81% – 100%' },
] as const;

const STATUS_CRONOGRAMA = [
  { value: 'Dentro do prazo', label: 'Dentro do prazo', description: 'Tudo seguindo conforme o planejado' },
  { value: 'Com risco de atraso', label: 'Com risco de atraso', description: 'Pode atrasar se nada mudar' },
  { value: 'Atrasado', label: 'Atrasado', description: 'Marcos já não estão sendo cumpridos' },
  { value: 'Concluido', label: 'Concluído', description: 'Projeto finalizado' },
] as const;

const IMPACTO_CLIENTE = [
  { value: 'Não', label: 'Não houve impacto' },
  { value: 'Leve', label: 'Leve' },
  { value: 'Moderado', label: 'Moderado' },
  { value: 'Grave', label: 'Grave' },
] as const;

const METODOLOGIAS = [
  { value: 'Tradicional', label: 'Tradicional', description: 'Cronograma fechado, marcos e fases definidas' },
  { value: 'Ágil', label: 'Ágil', description: 'Sprints, entregas iterativas, story points' },
  { value: 'Híbrido', label: 'Híbrido', description: 'Combinação das duas abordagens' },
] as const;

const TIPOS_IMPEDIMENTOS = ['Técnico', 'Recurso', 'Orçamento', 'Externo', 'Outro'];
const MOTIVOS_ATRASO = [
  'Escopo mal definido',
  'Falta de recurso',
  'Cliente lento',
  'Mudança de requisitos',
  'Outro',
];
const COORDENACOES = [
  'Gestão de Negócios',
  'Otimização de Processos',
  'Construção e Energia',
  'Desenvolvimento de Máquinas',
  'Tecnologia e Desenvolvimento',
];

const TOTAL_STEPS = 14;

export default function PapePage() {
  const [step, setStep] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([0]);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PapeFormInputs>({
    resolver: zodResolver(papeFormSchema),
    defaultValues: {
      respondente_nome: '',
      primeira_resposta: 'Sim',
      possui_orientador: 'Não',
      modelo_gerenciamento: 'Tradicional',
      houve_impedimentos: 'Não',
      status_cronograma: 'Dentro do prazo',
      impacto_cliente: 'Não',
      pct_conclusao: '0-20%',
      capacitacao_equipe: 3,
      eficacia_metodologia: 3,
      nivel_retrabalho: 3,
      comunicacao_cliente: 3,
      abertura_cliente: 3,
      satisfacao_cliente: 3,
    },
  });

  const primeira_resposta = watch('primeira_resposta');
  const possui_orientador = watch('possui_orientador');
  const modelo_gerenciamento = watch('modelo_gerenciamento');
  const houve_impedimentos = watch('houve_impedimentos');
  const status_cronograma = watch('status_cronograma');

  useEffect(() => {
    async function loadData() {
      try {
        const projRes = await axios.get(`${API_URL}/projetos`);
        setProjetos(projRes.data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ==========================================================
  // Navegação com branching (lógicapape)
  // ==========================================================
  const getNextStep = () => {
    if (step === 0) return 1;
    if (step === 1) return 2;
    if (step === 2) return primeira_resposta === 'Não' ? 4 : 3;
    if (step === 3) return 4;
    if (step === 4) return possui_orientador === 'Não' ? 6 : 5;
    if (step === 5) return 6;
    if (step === 6) return modelo_gerenciamento === 'Ágil' ? 7 : 8;
    if (step === 7) return 9;
    if (step === 8) return 9;
    if (step === 9) {
      if (status_cronograma === 'Com risco de atraso' || status_cronograma === 'Atrasado') {
        return 10;
      }
      return 11;
    }
    if (step === 10) return 11;
    if (step === 11) return 12;
    if (step === 12) return 13;
    return step;
  };

  const goToNextStep = () => {
    const next = getNextStep();
    setStep(next);
    setStepHistory([...stepHistory, next]);
  };

  const goToPreviousStep = () => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1);
      setStep(newHistory[newHistory.length - 1]);
      setStepHistory(newHistory);
    }
  };

  const onSubmit = async (data: PapeFormInputs) => {
    setSubmitting(true);
    try {
      console.log('📤 Enviando:', data);
      await axios.post(`${API_URL}/pape`, data);
      setStep(14);
      setStepHistory([...stepHistory, 14]);
    } catch (error: any) {
      console.error('❌ Erro:', error);
      alert(`Erro ao enviar: ${error.response?.data?.detail || error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const restartForm = () => {
    reset();
    setStep(0);
    setStepHistory([0]);
  };

  // ==========================================================
  // Loading
  // ==========================================================
  if (loading) {
    return (
      <div
        className="meta-bg"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        <div
          className="meta-spin"
          style={{
            width: 48,
            height: 48,
            border: '4px solid var(--meta-navy-10)',
            borderTopColor: 'var(--meta-blue)',
            borderRadius: '50%',
          }}
        />
        <p style={{ color: 'var(--meta-navy-50)', fontWeight: 500 }}>Carregando formulário...</p>
      </div>
    );
  }

  const progress = step === 14 ? 100 : Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="meta-bg">
      {/* Header */}
      <header className="meta-header">
        <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <MetaSymbol size={48} />
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Meta Consultoria
            </div>
          </div>
          <h1
            className="h1"
            style={{
              color: 'white',
              fontSize: 56,
              marginBottom: 12,
              letterSpacing: '-0.03em',
            }}
          >
            PAPE
          </h1>
          <p
            style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.92)',
              maxWidth: 560,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Plano de Acompanhamento de Projetos Externos
          </p>
        </div>
      </header>

      {/* Progress */}
      {step < 14 && (
        <div className="meta-progress">
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <div className="eyebrow" style={{ color: 'var(--meta-navy-50)' }}>
                Etapa {step + 1} de {TOTAL_STEPS}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--meta-blue)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {progress}%
              </div>
            </div>
            <div className="meta-progress-track">
              <div className="meta-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <main
        style={{
          flex: 1,
          padding: '48px 16px 80px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="meta-card" style={{ padding: '56px 48px' }}>
            {/* ==========================================
                STEP 0 — Identificação
                ========================================== */}
            {step === 0 && (
              <StepCard
                eyebrow="Identificação"
                title="Vamos começar?"
                description="Para começar, precisamos saber quem está respondendo este formulário."
              >
                <Controller
                  control={control}
                  name="respondente_nome"
                  render={({ field }) => (
                    <div>
                      <FieldLabel required>Qual é o seu nome?</FieldLabel>
                      <InputField
                        {...field}
                        placeholder="Digite seu nome completo"
                        error={errors.respondente_nome?.message}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 1 — Projeto
                ========================================== */}
            {step === 1 && (
              <StepCard
                eyebrow="Iniciação"
                title="Sobre qual projeto?"
                description="Selecione o projeto externo que você está acompanhando."
              >
                <Controller
                  control={control}
                  name="projeto_externo_id"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={1} required>
                        Sobre qual projeto você está respondendo?
                      </FieldLabel>
                      <select
                        className="meta-input"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value="">Selecione um projeto…</option>
                        {projetos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 2 — Primeira resposta
                ========================================== */}
            {step === 2 && (
              <StepCard eyebrow="Iniciação" title="Primeira resposta?">
                <Controller
                  control={control}
                  name="primeira_resposta"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={2} required>
                        É a primeira vez respondendo este formulário para o projeto?
                      </FieldLabel>
                      <RadioGroup
                        options={[...SIM_NAO]}
                        value={field.value}
                        onChange={field.onChange}
                        columns={2}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 3 — Procedimentos Iniciais
                ========================================== */}
            {step === 3 && (
              <StepCard
                eyebrow="Procedimentos Iniciais"
                title="Dados do projeto"
                description="Confirme as informações iniciais do contrato."
              >
                <Controller
                  control={control}
                  name="data_inicio"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={3} required>
                        Qual a data oficial de início do projeto?
                      </FieldLabel>
                      <InputField type="date" {...field} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="numero_contrato"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={4} required hint="Exemplo: 111.1111">
                        Número do contrato
                      </FieldLabel>
                      <InputField placeholder="111.1111" {...field} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="valor_projeto"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={5} required hint="Exemplo: 1.000,00 (mil reais)">
                        Valor do projeto
                      </FieldLabel>
                      <InputField placeholder="1.000,00" {...field} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="servicos_projeto"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={6} required>
                        Quais os serviços do projeto?
                      </FieldLabel>
                      <InputField placeholder="Liste os serviços contratados" {...field} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="coordenacoes"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={7} required>
                        Coordenações às quais o projeto faz parte
                      </FieldLabel>
                      <CheckboxGroup
                        options={COORDENACOES}
                        value={(field.value as any) || []}
                        onChange={(v) => field.onChange(v)}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 4 — Orientador (Sim/Não)
                ========================================== */}
            {step === 4 && (
              <StepCard eyebrow="Orientador Técnico" title="Sobre o orientador">
                <Controller
                  control={control}
                  name="possui_orientador"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={8} required>
                        O projeto possui orientador técnico?
                      </FieldLabel>
                      <RadioGroup
                        options={[...SIM_NAO]}
                        value={field.value}
                        onChange={field.onChange}
                        columns={2}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 5 — Detalhes do Orientador
                ========================================== */}
            {step === 5 && (
              <StepCard
                eyebrow="Orientador Técnico"
                title="Detalhes do orientador"
                description="Algumas informações adicionais sobre o orientador do projeto."
              >
                <Controller
                  control={control}
                  name="nome_orientador"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={9} required>
                        Qual o nome do orientador?
                      </FieldLabel>
                      <InputField placeholder="Nome completo" {...field} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="efetividade_orientador"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={10} required>
                        Qual a efetividade do orientador?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Baixa"
                        highLabel="Alta"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="disponibilidade_orientador"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={11} required>
                        Qual a disponibilidade do orientador?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Baixa"
                        highLabel="Alta"
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 6 — Metodologia
                ========================================== */}
            {step === 6 && (
              <StepCard
                eyebrow="Metodologia"
                title="Modelo de gerenciamento"
                description="Selecione qual abordagem o projeto está utilizando."
              >
                <Controller
                  control={control}
                  name="modelo_gerenciamento"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={12} required>
                        Qual modelo o projeto está seguindo?
                      </FieldLabel>
                      <RadioGroup
                        options={[...METODOLOGIAS]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 7 — Seção Ágil
                ========================================== */}
            {step === 7 && modelo_gerenciamento === 'Ágil' && (
              <StepCard
                eyebrow="Gerenciamento Ágil"
                title="Sprints e impedimentos"
                description="Avalie o progresso da entrega e os bloqueios encontrados."
              >
                <Controller
                  control={control}
                  name="pct_story_points"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={13} required>
                        Percentual de story points concluídos?
                      </FieldLabel>
                      <RadioGroup
                        options={[...PERCENTUAIS]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="houve_impedimentos"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={14} required>
                        Houve impedimentos durante a execução?
                      </FieldLabel>
                      <RadioGroup
                        options={[...SIM_NAO]}
                        value={field.value}
                        onChange={field.onChange}
                        columns={2}
                      />
                    </div>
                  )}
                />
                {houve_impedimentos === 'Sim' && (
                  <Controller
                    control={control}
                    name="tipos_impedimentos"
                    render={({ field }) => (
                      <div>
                        <FieldLabel number={15} required>
                          Tipos de impedimentos (selecione um ou mais)
                        </FieldLabel>
                        <CheckboxGroup
                          options={TIPOS_IMPEDIMENTOS}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                )}
              </StepCard>
            )}

            {/* ==========================================
                STEP 8 — Seção Tradicional/Híbrido
                ========================================== */}
            {step === 8 &&
              (modelo_gerenciamento === 'Tradicional' || modelo_gerenciamento === 'Híbrido') && (
                <StepCard
                  eyebrow={
                    modelo_gerenciamento === 'Híbrido'
                      ? 'Gerenciamento Híbrido'
                      : 'Gerenciamento Tradicional'
                  }
                  title="Marcos e entrega de valor"
                  description="Avalie a percepção de valor e o cumprimento de marcos."
                >
                  <Controller
                    control={control}
                    name="cliente_percebeu_valor"
                    render={({ field }) => (
                      <div>
                        <FieldLabel number={16} required>
                          O cliente percebeu valor sendo entregue?
                        </FieldLabel>
                        <ScaleField
                          value={field.value as number}
                          onChange={field.onChange}
                          lowLabel="Não percebeu"
                          highLabel="Percebeu muito"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="pct_marcos_prazo"
                    render={({ field }) => (
                      <div>
                        <FieldLabel number={17} required>
                          Percentual de marcos cumpridos no prazo?
                        </FieldLabel>
                        <RadioGroup
                          options={[...PERCENTUAIS]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="variacao_escopo"
                    render={({ field }) => (
                      <div>
                        <FieldLabel number={18} required>
                          Qual foi a variação de escopo?
                        </FieldLabel>
                        <ScaleField
                          value={field.value as number}
                          onChange={field.onChange}
                          lowLabel="Pequena"
                          highLabel="Grande"
                        />
                      </div>
                    )}
                  />
                </StepCard>
              )}

            {/* ==========================================
                STEP 9 — Execução e Cronograma
                ========================================== */}
            {step === 9 && (
              <StepCard
                eyebrow="Execução"
                title="Cronograma e impacto"
                description="Como o projeto está se comportando em termos de prazos?"
              >
                <Controller
                  control={control}
                  name="pct_conclusao"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={19} required>
                        Qual o percentual de conclusão do projeto?
                      </FieldLabel>
                      <RadioGroup
                        options={[...PERCENTUAIS]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="status_cronograma"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={20} required>
                        Como está o cronograma?
                      </FieldLabel>
                      <RadioGroup
                        options={[...STATUS_CRONOGRAMA]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="impacto_cliente"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={22} required>
                        Qual o impacto percebido pelo cliente?
                      </FieldLabel>
                      <RadioGroup
                        options={[...IMPACTO_CLIENTE]}
                        value={field.value}
                        onChange={field.onChange}
                        columns={2}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 10 — Motivos de Atraso (condicional)
                ========================================== */}
            {step === 10 &&
              (status_cronograma === 'Com risco de atraso' ||
                status_cronograma === 'Atrasado') && (
                <StepCard
                  eyebrow="Execução"
                  title="Motivos do atraso"
                  description="Selecione todos os motivos que se aplicam."
                >
                  <Controller
                    control={control}
                    name="motivos_atraso"
                    render={({ field }) => (
                      <div>
                        <FieldLabel number={21} required>
                          Quais são os motivos do atraso?
                        </FieldLabel>
                        <CheckboxGroup
                          options={MOTIVOS_ATRASO}
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </div>
                    )}
                  />
                </StepCard>
              )}

            {/* ==========================================
                STEP 11 — Capacidade
                ========================================== */}
            {step === 11 && (
              <StepCard
                eyebrow="Capacidade de Execução"
                title="Equipe e metodologia"
                description="Avalie a equipe, a metodologia adotada e o nível de retrabalho."
              >
                <Controller
                  control={control}
                  name="capacitacao_equipe"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={23} required>
                        Como avalia a capacitação da equipe?
                      </FieldLabel>
                      <ScaleField value={field.value as number} onChange={field.onChange} />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="eficacia_metodologia"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={24} required>
                        Qual a eficácia da metodologia adotada?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Pouco eficaz"
                        highLabel="Muito eficaz"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="nivel_retrabalho"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={25} required>
                        Qual o nível de retrabalho?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Pouco"
                        highLabel="Muito"
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 12 — Comunicação
                ========================================== */}
            {step === 12 && (
              <StepCard
                eyebrow="Comunicação"
                title="Relação com o cliente"
                description="Avalie como anda a comunicação e a satisfação geral do cliente."
              >
                <Controller
                  control={control}
                  name="comunicacao_cliente"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={26} required>
                        Como foi a comunicação com o cliente?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Ruim"
                        highLabel="Excelente"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="abertura_cliente"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={27} required>
                        Qual a abertura do cliente para mudanças?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Pouca"
                        highLabel="Muita"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="satisfacao_cliente"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={28} required>
                        Qual sua satisfação geral com o projeto?
                      </FieldLabel>
                      <ScaleField
                        value={field.value as number}
                        onChange={field.onChange}
                        lowLabel="Insatisfeito"
                        highLabel="Muito satisfeito"
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 13 — Orçamento
                ========================================== */}
            {step === 13 && (
              <StepCard
                eyebrow="Orçamento"
                title="Suficiência do orçamento"
                description="Última pergunta: o orçamento foi adequado para o projeto?"
              >
                <Controller
                  control={control}
                  name="suficiencia_orcamento"
                  render={({ field }) => (
                    <div>
                      <FieldLabel number={29} required>
                        O orçamento foi suficiente?
                      </FieldLabel>
                      <RadioGroup
                        options={[
                          { value: '1', label: '1 — Muito insuficiente' },
                          { value: '2', label: '2 — Insuficiente' },
                          { value: '3', label: '3 — Adequado' },
                          { value: '4', label: '4 — Bem adequado' },
                          { value: '5', label: '5 — Muito adequado' },
                          { value: 'Não necessitou', label: 'Não necessitou de orçamento' },
                        ]}
                        value={field.value as string}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </StepCard>
            )}

            {/* ==========================================
                STEP 14 — Conclusão
                ========================================== */}
            {step === 14 && (
              <div className="meta-fade-in" style={{ textAlign: 'center', padding: '24px 0' }}>
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    background: 'var(--meta-gradient)',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 48,
                    margin: '0 auto 28px',
                    boxShadow: '0 12px 32px rgba(0, 103, 255, 0.35)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                >
                  ✓
                </div>
                <div className="eyebrow" style={{ color: 'var(--meta-success)', marginBottom: 12 }}>
                  Recebido com sucesso
                </div>
                <h2 className="h2" style={{ marginBottom: 12 }}>
                  Obrigado por <span className="text-gradient">responder!</span>
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    color: 'var(--meta-navy-50)',
                    lineHeight: 1.6,
                    maxWidth: 480,
                    margin: '0 auto 36px',
                  }}
                >
                  Suas respostas foram salvas e serão processadas pela equipe Meta. Seu acompanhamento é
                  fundamental para o sucesso do projeto.
                </p>

                <div
                  style={{
                    padding: 24,
                    background: 'linear-gradient(135deg, rgba(42, 216, 255, 0.08) 0%, rgba(0, 103, 255, 0.08) 100%)',
                    border: '1px solid var(--meta-navy-10)',
                    borderRadius: 16,
                    marginBottom: 36,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textAlign: 'left',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: 'var(--meta-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 20,
                    }}
                  >
                    📋
                  </div>
                  <div>
                    <div className="eyebrow" style={{ color: 'var(--meta-navy-50)', marginBottom: 4 }}>
                      Protocolo
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      PAPE-{new Date().getTime().toString().slice(-8)}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 14, color: 'var(--meta-navy-50)', marginBottom: 20, fontWeight: 500 }}>
                  Deseja responder novamente para outro projeto?
                </p>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <button onClick={restartForm} className="btn btn-primary">
                    ↻ Responder novamente
                  </button>
                  <button
                    onClick={() => (window.location.href = '/')}
                    className="btn btn-secondary"
                  >
                    Voltar ao início
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
                Botões de navegação
                ========================================== */}
            {step < 14 && (
              <>
                <div className="meta-divider" />
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={goToPreviousStep}
                    disabled={stepHistory.length <= 1}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => {
                      if (step === 13) {
                        handleSubmit(onSubmit)();
                      } else {
                        goToNextStep();
                      }
                    }}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    {step === 13
                      ? submitting
                        ? 'Enviando…'
                        : 'Enviar respostas →'
                      : 'Próximo →'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: 32,
              fontSize: 12,
              color: 'var(--meta-navy-50)',
              fontWeight: 500,
            }}
          >
            © {new Date().getFullYear()} Meta Consultoria · Todos os direitos reservados
          </div>
        </div>
      </main>
    </div>
  );
}
