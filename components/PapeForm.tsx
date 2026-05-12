'use client';

import { useForm, Controller, Control, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { papeFormSchema, PapeFormInputs } from '@/lib/schema';
import { useState, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Projeto, Membro, StepDef, FieldDef } from '@/lib/types';
import {
  FieldLabel,
  InputField,
  RadioGroup,
  CheckboxGroup,
  ScaleField,
  StepCard,
} from '@/components/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ── Wrappers tipados por tipo de questão ─────────────────────────────────────

interface BaseProps {
  control: Control<PapeFormInputs>;
  name: Path<PapeFormInputs>;
  label: ReactNode;
  number?: number;
  hint?: string;
}

function FormInput({
  control,
  name,
  label,
  number,
  hint,
  ...inputProps
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel number={number} hint={hint} required>{label}</FieldLabel>
          <InputField
            {...field}
            value={(field.value as string) ?? ''}
            {...inputProps}
            error={fieldState.error?.message}
          />
        </div>
      )}
    />
  );
}

function FormRadio({
  control,
  name,
  label,
  number,
  options,
  columns,
}: BaseProps & { options: { value: string; label: string; description?: string }[]; columns?: number }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel number={number} required>{label}</FieldLabel>
          <RadioGroup
            options={options}
            value={field.value as string}
            onChange={field.onChange}
            columns={columns}
          />
        </div>
      )}
    />
  );
}

function FormCheckbox({
  control,
  name,
  label,
  number,
  options,
}: BaseProps & { options: string[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel number={number} required>{label}</FieldLabel>
          <CheckboxGroup
            options={options}
            value={(field.value as string[]) || []}
            onChange={field.onChange}
          />
        </div>
      )}
    />
  );
}

function FormScale({
  control,
  name,
  label,
  number,
  lowLabel,
  highLabel,
}: BaseProps & { lowLabel?: string; highLabel?: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel number={number} required>{label}</FieldLabel>
          <ScaleField
            value={field.value as number}
            onChange={field.onChange}
            lowLabel={lowLabel}
            highLabel={highLabel}
          />
        </div>
      )}
    />
  );
}

function ProjetosSelect({
  control,
  name,
  label,
  number,
  projetos,
}: BaseProps & { projetos: Projeto[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel number={number} required>{label}</FieldLabel>
          <select
            className="meta-input"
            value={(field.value as number) || ''}
            onChange={(e) => field.onChange(Number(e.target.value))}
          >
            <option value="">Selecione um projeto…</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>
      )}
    />
  );
}

function MembrosSelect({
  control,
  name,
  label,
  number,
  membros,
}: BaseProps & { membros: Membro[] }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <FieldLabel number={number} required>{label}</FieldLabel>
          <select
            className="meta-input"
            value={(field.value as string) || ''}
            onChange={(e) => field.onChange(e.target.value)}
          >
            <option value="">Selecione seu nome…</option>
            {membros.map((m) => (
              <option key={m.id} value={m.nome}>{m.nome}</option>
            ))}
          </select>
        </div>
      )}
    />
  );
}

// ── Renderer genérico por tipo de campo ──────────────────────────────────────

function FieldRenderer({
  field,
  control,
  values,
  projetos,
  membros,
}: {
  field: FieldDef;
  control: Control<PapeFormInputs>;
  values: Partial<PapeFormInputs>;
  projetos: Projeto[];
  membros: Membro[];
}) {
  if ('showWhen' in field && field.showWhen) {
    const watched = values[field.showWhen.field as keyof PapeFormInputs] as string;
    if (watched !== field.showWhen.value) return null;
  }

  const name = field.name as Path<PapeFormInputs>;
  const base = { control, name, label: field.label, number: field.number };

  switch (field.type) {
    case 'input':
      return <FormInput {...base} hint={field.hint} type={field.inputType} placeholder={field.placeholder} />;
    case 'radio':
      return <FormRadio {...base} options={field.options} columns={field.columns} />;
    case 'checkbox':
      return <FormCheckbox {...base} options={field.options} />;
    case 'scale':
      return <FormScale {...base} lowLabel={field.lowLabel} highLabel={field.highLabel} />;
    case 'select-projetos':
      return <ProjetosSelect {...base} projetos={projetos} />;
    case 'select-membros':
      return <MembrosSelect {...base} membros={membros} />;
  }
}

function resolveEyebrow(
  eyebrow: StepDef['eyebrow'],
  values: Partial<PapeFormInputs>,
): string | undefined {
  if (!eyebrow) return undefined;
  if (typeof eyebrow === 'string') return eyebrow;
  return eyebrow.map[values[eyebrow.watchField as keyof PapeFormInputs] as string];
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function PapeForm({
  projetos,
  membros,
  steps,
}: {
  projetos: Projeto[];
  membros: Membro[];
  steps: StepDef[];
}) {
  const router = useRouter();
  const TOTAL_STEPS = steps.length;
  const [step, setStep] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([0]);
  const [submitting, setSubmitting] = useState(false);

  const { control, watch, handleSubmit, reset } = useForm<PapeFormInputs>({
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

  const values = watch();

  const getNextStep = () => {
    if (step === 0) return 1;
    if (step === 1) return 2;
    if (step === 2) return values.primeira_resposta === 'Não' ? 4 : 3;
    if (step === 3) return 4;
    if (step === 4) return values.possui_orientador === 'Não' ? 6 : 5;
    if (step === 5) return 6;
    if (step === 6) return values.modelo_gerenciamento === 'Ágil' ? 7 : 8;
    if (step === 7) return 9;
    if (step === 8) return 9;
    if (step === 9) {
      if (values.status_cronograma === 'Com risco de atraso' || values.status_cronograma === 'Atrasado') return 10;
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
      await axios.post(`${API_URL}/pape`, data);
      setStep(TOTAL_STEPS);
      setStepHistory([...stepHistory, TOTAL_STEPS]);
    } catch (error) {
      const detail = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : 'Erro inesperado';
      alert(`Erro ao enviar: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const restartForm = () => {
    reset();
    setStep(0);
    setStepHistory([0]);
  };

  const progress = step === TOTAL_STEPS ? 100 : Math.round(((step + 1) / TOTAL_STEPS) * 100);
  const currentStep = steps[step];
  const isLastStep = step === TOTAL_STEPS - 1;

  return (
    <>
      {step < TOTAL_STEPS && (
        <div className="meta-progress">
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="eyebrow" style={{ color: 'var(--meta-navy-50)' }}>
                Etapa {step + 1} de {TOTAL_STEPS}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--meta-blue)', fontVariantNumeric: 'tabular-nums' }}>
                {progress}%
              </div>
            </div>
            <div className="meta-progress-track">
              <div className="meta-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: '48px 16px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="meta-card" style={{ padding: '56px 48px' }}>

            {currentStep && (
              <StepCard
                eyebrow={resolveEyebrow(currentStep.eyebrow, values)}
                title={currentStep.title}
                description={currentStep.description}
              >
                {currentStep.fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    control={control}
                    values={values}
                    projetos={projetos}
                    membros={membros}
                  />
                ))}
              </StepCard>
            )}

            {step === TOTAL_STEPS && (
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
                <p style={{ fontSize: 16, color: 'var(--meta-navy-50)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 36px' }}>
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
                    <div className="eyebrow" style={{ color: 'var(--meta-navy-50)', marginBottom: 4 }}>Protocolo</div>
                    <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      PAPE-{new Date().getTime().toString().slice(-8)}
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--meta-navy-50)', marginBottom: 20, fontWeight: 500 }}>
                  Deseja responder novamente para outro projeto?
                </p>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <button onClick={restartForm} className="btn btn-primary">↻ Responder novamente</button>
                  <button onClick={() => router.push('/')} className="btn btn-secondary">Voltar ao início</button>
                </div>
              </div>
            )}

            {step < TOTAL_STEPS && (
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
                    onClick={() => isLastStep ? handleSubmit(onSubmit)() : goToNextStep()}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    {isLastStep ? (submitting ? 'Enviando…' : 'Enviar respostas →') : 'Próximo →'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--meta-navy-50)', fontWeight: 500 }}>
            © {new Date().getFullYear()} Meta Consultoria · Todos os direitos reservados
          </div>
        </div>
      </main>
    </>
  );
}
