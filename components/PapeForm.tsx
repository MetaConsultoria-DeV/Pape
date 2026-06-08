'use client';

import { useForm, Controller, Control, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { papeFormSchema, PapeFormInputs } from '@/lib/schema';
import { useEffect, useState, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Projeto, Membro, StepDef, FieldDef, ServicosPorCoordenacao, MembrosPorCoordenacao } from '@/lib/types';
import ServiceSelector from '@/components/ServiceSelector';
import MemberSelector from '@/components/MemberSelector';
import {
  FieldLabel,
  InputField,
  RadioGroup,
  CheckboxGroup,
  ScaleField,
  StepCard,
} from '@/components/ui';



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

function FormTextarea({
  control,
  name,
  label,
  number,
  hint,
  maxLength,
  ...textareaProps
}: BaseProps & { maxLength?: number } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div>
          <FieldLabel number={number} hint={hint} required>{label}</FieldLabel>
          <textarea
            {...field}
            value={(field.value as string) ?? ''}
            className="meta-input"
            maxLength={maxLength}
            {...textareaProps}
            style={{
              minHeight: 120,
              resize: 'vertical',
              width: '100%',
              ...(fieldState.error ? { borderColor: 'var(--meta-danger)' } : {}),
              ...textareaProps.style,
            }}
          />
          {maxLength && (
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--meta-navy-50)', marginTop: 4 }}>
              {((field.value as string) ?? '').length} / {maxLength}
            </div>
          )}
          {fieldState.error?.message && (
            <p style={{ color: 'var(--meta-danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
              {fieldState.error.message}
            </p>
          )}
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
  dictionary,
}: BaseProps & { lowLabel?: string; highLabel?: string; dictionary?: string[] }) {
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
            dictionary={dictionary}
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
  hasSelectedManager,
  isLoading,
  error,
}: BaseProps & {
  projetos: Projeto[];
  hasSelectedManager: boolean;
  isLoading: boolean;
  error: string | null;
}) {
  const placeholder = !hasSelectedManager
    ? 'Selecione seu nome primeiro...'
    : isLoading
      ? 'Carregando projetos...'
      : projetos.length === 0
        ? 'Nenhum projeto encontrado para esta gerente'
        : 'Selecione um projeto...';
  const isDisabled = !hasSelectedManager || isLoading || Boolean(error) || projetos.length === 0;

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
            disabled={isDisabled}
            title={placeholder}
          >
            <option value="">Selecione um projeto…</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
          {!hasSelectedManager && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--meta-navy-50)', fontWeight: 600 }}>
              Selecione seu nome na etapa anterior para carregar somente seus projetos.
            </p>
          )}
          {hasSelectedManager && isLoading && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--meta-navy-50)', fontWeight: 600 }}>
              Carregando projetos vinculados a esta gerente...
            </p>
          )}
          {error && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--meta-danger, #D92D20)', fontWeight: 600 }}>
              {error}
            </p>
          )}
          {hasSelectedManager && !isLoading && !error && projetos.length === 0 && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--meta-navy-50)', fontWeight: 600 }}>
              Nenhum projeto vinculado a esta gerente foi encontrado.
            </p>
          )}
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
            <option value="">
              {name === 'respondente_nome' ? 'Selecione seu nome…' : 'Selecione um gerente…'}
            </option>
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

function getVisibleFieldNames(currentStep: StepDef, values: Partial<PapeFormInputs>): string[] {
  return currentStep.fields
    .filter((field) => {
      if (!('showWhen' in field) || !field.showWhen) return true;
      const watched = values[field.showWhen.field as keyof PapeFormInputs] as string;
      return watched === field.showWhen.value;
    })
    .map((field) => field.name);
}

function hasEmptyRequiredField(
  fieldNames: string[],
  values: Partial<PapeFormInputs>,
  selectedProject?: Projeto,
): boolean {
  for (const name of fieldNames) {
    if (name === 'nome_orientador' && selectedProject?.nome_orientador) continue;

    const value = values[name as keyof PapeFormInputs];

    if (value === undefined || value === null) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (typeof value === 'number' && value === 0) return true;
    if (name === 'motivos_atraso' && Array.isArray(value) && value.length === 0) return true;
  }
  return false;
}

function OrientadorCard({ nome }: { nome: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(0,103,255,0.06) 0%, rgba(42,216,255,0.06) 100%)',
        border: '1.5px solid rgba(0,103,255,0.18)',
        borderRadius: 'var(--radius-md, 12px)',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--meta-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.04em',
          flexShrink: 0,
        }}
      >
        OT
      </div>
      <div>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--meta-navy-50)',
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            marginBottom: 4,
          }}
        >
          Orientador Técnico
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--meta-navy)' }}>
          {nome}
        </div>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  control,
  values,
  projetos,
  membros,
  hasSelectedManager,
  projetosLoading,
  projetosError,
  servicos,
  membrosPorCoordenacao = [],
  selectedProject,
}: {
  field: FieldDef;
  control: Control<PapeFormInputs>;
  values: Partial<PapeFormInputs>;
  projetos: Projeto[];
  membros: Membro[];
  hasSelectedManager: boolean;
  projetosLoading: boolean;
  projetosError: string | null;
  servicos: ServicosPorCoordenacao[];
  membrosPorCoordenacao?: MembrosPorCoordenacao[];
  selectedProject?: Projeto;
}) {
  if ('showWhen' in field && field.showWhen) {
    const watched = values[field.showWhen.field as keyof PapeFormInputs] as string;
    if (watched !== field.showWhen.value) return null;
  }

  // Orientador já cadastrado no banco: exibe card no lugar do input de nome
  if (field.name === 'nome_orientador' && selectedProject?.nome_orientador) {
    return <OrientadorCard nome={selectedProject.nome_orientador} />;
  }

  const name = field.name as Path<PapeFormInputs>;
  const base = { control, name, label: field.label, number: field.number };

  switch (field.type) {
    case 'input':
      return <FormInput {...base} hint={field.hint} type={field.inputType} placeholder={field.placeholder} />;
    case 'textarea':
      return <FormTextarea {...base} hint={field.hint} placeholder={field.placeholder} maxLength={field.maxLength} />;
    case 'radio':
      return <FormRadio {...base} options={field.options} columns={field.columns} />;
    case 'checkbox':
      return <FormCheckbox {...base} options={field.options} />;
    case 'scale':
      return <FormScale {...base} lowLabel={field.lowLabel} highLabel={field.highLabel} dictionary={field.dictionary} />;
    case 'select-projetos':
      return (
        <ProjetosSelect
          {...base}
          projetos={projetos}
          hasSelectedManager={hasSelectedManager}
          isLoading={projetosLoading}
          error={projetosError}
        />
      );
    case 'select-membros':
      return <MembrosSelect {...base} membros={membros} />;
    case 'selectServicos':
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: rField, fieldState }) => (
            <div>
              <FieldLabel number={field.number} required>{field.label}</FieldLabel>
              <ServiceSelector
                servicosPorCoordenacao={servicos}
                selectedIds={(rField.value as number[]) || []}
                onChange={rField.onChange}
                error={fieldState.error?.message}
              />
            </div>
          )}
        />
      );
    case 'selectConsultores':
      return (
        <Controller
          control={control}
          name={name}
          render={({ field: rField, fieldState }) => (
            <div>
              <FieldLabel number={field.number} required>{field.label}</FieldLabel>
              <MemberSelector
                membrosPorCoordenacao={membrosPorCoordenacao}
                selectedKeys={(rField.value as string[]) || []}
                onChange={rField.onChange}
                error={fieldState.error?.message}
              />
            </div>
          )}
        />
      );
  }
}

function isFieldVisible(field: FieldDef, values: Partial<PapeFormInputs>) {
  if ('showWhen' in field && field.showWhen) {
    const watched = values[field.showWhen.field as keyof PapeFormInputs] as string;
    return watched === field.showWhen.value;
  }

  return true;
}

function formatReviewValue(
  field: FieldDef,
  values: Partial<PapeFormInputs>,
  servicos: ServicosPorCoordenacao[],
  membrosPorCoordenacao: MembrosPorCoordenacao[] = [],
) {
  const value = values[field.name as keyof PapeFormInputs];

  if (field.type === 'selectServicos' && Array.isArray(value)) {
    const names: string[] = [];
    const selectedIds = value as number[];
    servicos.forEach((grupo) => {
      grupo.servicos.forEach((s) => {
        if (selectedIds.includes(s.id)) {
          names.push(`${s.nome} (${grupo.coordenacao_sigla})`);
        }
      });
    });
    return names.length > 0 ? names.join(' + ') : 'Não informado';
  }

  if (field.type === 'selectConsultores' && Array.isArray(value)) {
    const names: string[] = [];
    const selectedKeys = value as string[];
    
    const memberCoordMap = new Map<string, { nome: string; sigla: string }>();
    membrosPorCoordenacao.forEach((grupo) => {
      grupo.membros.forEach((m) => {
        memberCoordMap.set(`${m.id}-${grupo.coordenacao_id}`, {
          nome: m.nome,
          sigla: grupo.coordenacao_sigla,
        });
      });
    });

    selectedKeys.forEach((key) => {
      const match = memberCoordMap.get(key);
      if (match) {
        names.push(`${match.nome} (${match.sigla})`);
      }
    });

    return names.length > 0 ? names.join(' + ') : 'Não informado';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'Não informado';
  }

  if (value === undefined || value === null || value === '') {
    return 'Não informado';
  }

  if (field.type === 'scale') {
    return `${value} de 5`;
  }

  return String(value);
}

function ReviewStep({
  steps,
  values,
  servicos,
  membrosPorCoordenacao = [],
}: {
  steps: StepDef[];
  values: Partial<PapeFormInputs>;
  servicos: ServicosPorCoordenacao[];
  membrosPorCoordenacao?: MembrosPorCoordenacao[];
}) {
  return (
    <StepCard
      eyebrow="Validação"
      title="Revise os dados do projeto"
      description="Confira as informações antes de confirmar o cadastro."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {steps.map((reviewStep) => {
          const visibleFields = reviewStep.fields.filter((field) => isFieldVisible(field, values));
          if (visibleFields.length === 0) return null;

          return (
            <section key={reviewStep.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="eyebrow" style={{ color: 'var(--meta-blue)' }}>
                {resolveEyebrow(reviewStep.eyebrow, values) ?? reviewStep.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {visibleFields.map((field) => (
                  <div
                    key={field.name}
                    style={{
                      padding: '14px 16px',
                      border: '1px solid var(--meta-navy-10)',
                      borderRadius: 'var(--radius-md)',
                      background: '#FAFBFC',
                    }}
                  >
                    <div style={{ fontSize: 13, color: 'var(--meta-navy-50)', fontWeight: 700, marginBottom: 4 }}>
                      {field.number ? `${field.number}. ` : ''}{field.label}
                    </div>
                    <div style={{ fontSize: 15, color: 'var(--meta-navy)', fontWeight: 700, lineHeight: 1.5 }}>
                      {formatReviewValue(field, values, servicos, membrosPorCoordenacao)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </StepCard>
  );
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

// REQUIRED_PASSWORD removido para rodar via proxy server-side.


export default function PapeForm({
  projetos,
  membros,
  servicos = [],
  membrosPorCoordenacao = [],
  steps,
  mode = 'pape',
  submitLabel,
  defaultValues,
}: {
  projetos: Projeto[];
  membros: Membro[];
  servicos?: ServicosPorCoordenacao[];
  membrosPorCoordenacao?: MembrosPorCoordenacao[];
  steps: StepDef[];
  mode?: 'pape' | 'visual-project';
  submitLabel?: string;
  defaultValues?: Partial<PapeFormInputs>;
}) {
  const router = useRouter();
  const TOTAL_STEPS = steps.length;
  const [step, setStep] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([0]);
  const [submitting, setSubmitting] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [pendingData, setPendingData] = useState<PapeFormInputs | null>(null);
  const [gerenteProjetos, setGerenteProjetos] = useState<Projeto[]>(mode === 'pape' ? [] : projetos);
  const [projetosLoading, setProjetosLoading] = useState(false);
  const [projetosError, setProjetosError] = useState<string | null>(null);
  const [stepError, setStepError] = useState<string | null>(null);

  const showSuccessStep = mode === 'visual-project' ? step === TOTAL_STEPS + 1 : step === TOTAL_STEPS;
  const storageKey = mode === 'visual-project' ? 'visual-project-draft' : 'pape-draft';
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  const { control, watch, handleSubmit, reset, setValue, trigger } = useForm<PapeFormInputs>({
    resolver: mode === 'pape' ? zodResolver(papeFormSchema) : undefined,
    defaultValues: {
      nome_projeto: '',
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
      ...defaultValues,
    },
  });

  const values = watch();

  // Load draft from LocalStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          reset(parsed);
        } catch (e) {
          console.error('Erro ao ler rascunho:', e);
        }
      }
      setIsDraftLoaded(true);
    }
  }, [reset, storageKey]);

  // Save draft to LocalStorage whenever values change
  useEffect(() => {
    if (!isDraftLoaded || showSuccessStep) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, JSON.stringify(values));
    }
  }, [values, isDraftLoaded, storageKey, showSuccessStep]);

  const selectedManager = membros.find((membro) => membro.nome === values.respondente_nome);
  const hasSelectedManager = mode !== 'pape' || Boolean(selectedManager);
  const selectedProject = gerenteProjetos.find((projeto) => projeto.id === Number(values.projeto_externo_id));
  const selectedProjectHasOrientadorInfo =
    selectedProject?.possui_orientador !== null && selectedProject?.possui_orientador !== undefined;

  useEffect(() => {
    if (mode !== 'pape') {
      setGerenteProjetos(projetos);
      return;
    }

    setValue('projeto_externo_id', 0, { shouldValidate: false });
    setValue('possui_orientador', 'Não', { shouldValidate: false });
    setValue('nome_orientador', '', { shouldValidate: false });

    if (!selectedManager) {
      setGerenteProjetos([]);
      setProjetosError(null);
      setProjetosLoading(false);
      return;
    }

    const controller = new AbortController();
    setProjetosLoading(true);
    setProjetosError(null);

    axios
      .get<Projeto[]>('/api/projetos', {
        params: { gerente_id: selectedManager.id },
        signal: controller.signal,
      })
      .then((response) => {
        setGerenteProjetos(response.data);
      })
      .catch((error) => {
        if (axios.isCancel(error) || controller.signal.aborted) return;
        setGerenteProjetos([]);
        setProjetosError('Não foi possível carregar os projetos desta gerente.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setProjetosLoading(false);
      });

    return () => controller.abort();
  }, [mode, projetos, selectedManager, setValue]);

  useEffect(() => {
    if (mode !== 'pape' || !selectedProject) return;

    if (!selectedProjectHasOrientadorInfo) {
      setValue('possui_orientador', 'Não', { shouldValidate: false });
      setValue('nome_orientador', '', { shouldValidate: false });
      return;
    }

    setValue('possui_orientador', selectedProject.possui_orientador ? 'Sim' : 'Não', { shouldValidate: false });
    setValue('nome_orientador', selectedProject.nome_orientador ?? '', { shouldValidate: false });
  }, [mode, selectedProject, selectedProjectHasOrientadorInfo, setValue]);

  useEffect(() => {
    setStepError(null);
  }, [step]);

  const getStepIndexByField = (fieldName: string) =>
    steps.findIndex((candidate) => candidate.fields.some((field) => field.name === fieldName));

  const getFallbackNextStep = () => Math.min(step + 1, TOTAL_STEPS - 1);

  const getNextStep = () => {
    const currentFieldNames = new Set(currentStep?.fields.map((field) => field.name) ?? []);
    const nextSequentialStep = getFallbackNextStep();

    if (currentFieldNames.has('projeto_externo_id') && selectedProjectHasOrientadorInfo) {
      const orientadorDetalhesStep = getStepIndexByField('nome_orientador');
      const metodologiaStep = getStepIndexByField('modelo_gerenciamento');

      if (selectedProject?.possui_orientador) {
        return orientadorDetalhesStep >= 0 ? orientadorDetalhesStep : nextSequentialStep;
      }

      return metodologiaStep >= 0 ? metodologiaStep : nextSequentialStep;
    }

    if (currentFieldNames.has('primeira_resposta')) {
      const orientadorStep = getStepIndexByField('possui_orientador');
      return values.primeira_resposta === 'Não' && orientadorStep >= 0 ? orientadorStep : nextSequentialStep;
    }

    if (currentFieldNames.has('possui_orientador')) {
      const metodologiaStep = getStepIndexByField('modelo_gerenciamento');
      return values.possui_orientador === 'Não' && metodologiaStep >= 0 ? metodologiaStep : nextSequentialStep;
    }

    if (currentFieldNames.has('modelo_gerenciamento')) {
      const agileStep = getStepIndexByField('pct_story_points');
      const traditionalStep = getStepIndexByField('cliente_percebeu_valor');
      return values.modelo_gerenciamento === 'Ágil'
        ? (agileStep >= 0 ? agileStep : nextSequentialStep)
        : (traditionalStep >= 0 ? traditionalStep : nextSequentialStep);
    }

    if (currentFieldNames.has('pct_story_points') || currentFieldNames.has('cliente_percebeu_valor')) {
      const cronogramaStep = getStepIndexByField('pct_conclusao');
      return cronogramaStep >= 0 ? cronogramaStep : nextSequentialStep;
    }

    if (currentFieldNames.has('status_cronograma')) {
      const motivosAtrasoStep = getStepIndexByField('motivos_atraso');
      const capacidadeStep = getStepIndexByField('capacitacao_equipe');
      const precisaMotivos = values.status_cronograma === 'Com risco de atraso' || values.status_cronograma === 'Atrasado';

      if (precisaMotivos && motivosAtrasoStep >= 0) return motivosAtrasoStep;
      return capacidadeStep >= 0 ? capacidadeStep : nextSequentialStep;
    }

    if (currentFieldNames.has('motivos_atraso')) {
      const capacidadeStep = getStepIndexByField('capacitacao_equipe');
      return capacidadeStep >= 0 ? capacidadeStep : nextSequentialStep;
    }

    return nextSequentialStep;
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

  const handleConfirmCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingData) return;

    setSubmitting(true);
    setPasswordError(null);
    try {
      await axios.post('/api/projetos', {
        nome_projeto: pendingData.nome_projeto,
        descricao_projeto: pendingData.descricao_projeto,
        data_inicio: pendingData.data_inicio,
        numero_contrato: pendingData.numero_contrato,
        valor_projeto: pendingData.valor_projeto,
        servicos_projeto: pendingData.servicos_projeto,
        membros_projeto: pendingData.membros_projeto,
        gerente_projeto: pendingData.gerente_projeto,
        possui_orientador: pendingData.possui_orientador,
        nome_orientador: pendingData.nome_orientador,
      }, {
        headers: {
          'x-confirmation-password': senha,
        }
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }
      setIsPasswordOpen(false);
      setStep(TOTAL_STEPS + 1);
      setStepHistory([...stepHistory, TOTAL_STEPS + 1]);
    } catch (error) {
      const detail = axios.isAxiosError(error)
        ? error.response?.data?.detail || error.message
        : 'Erro inesperado';
      setPasswordError(`Erro ao criar projeto: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async (data: PapeFormInputs) => {
    if (mode === 'visual-project') {
      setPendingData(data);
      setSenha('');
      setPasswordError(null);
      setIsPasswordOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { servicos_projeto, membros_projeto, gerente_projeto, nome_projeto, ...restData } = data;
      const papePayload = {
        ...restData,
        suficiencia_orcamento: restData.suficiencia_orcamento === 'Não necessitou'
          ? 'Não necessitou'
          : restData.suficiencia_orcamento
            ? Number(restData.suficiencia_orcamento)
            : undefined,
      };
      await axios.post('/api/pape', papePayload);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(storageKey);
      }
      setStep(TOTAL_STEPS);
      setStepHistory([...stepHistory, TOTAL_STEPS]);
    } catch (error) {
      let detail = 'Erro inesperado';
      if (axios.isAxiosError(error)) {
        const raw = error.response?.data?.detail;
        if (typeof raw === 'string') {
          detail = raw;
        } else if (Array.isArray(raw)) {
          detail = raw.map((e: { loc?: string[]; msg: string }) =>
            e.loc ? `${e.loc.slice(1).join('.')}: ${e.msg}` : e.msg
          ).join('\n');
        } else {
          detail = error.message;
        }
      }
      alert(`Erro ao enviar: ${detail}`);
    } finally {
      setSubmitting(false);
    }
  };

  const restartForm = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }
    reset({
      nome_projeto: '',
      descricao_projeto: '',
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
      servicos_projeto: [],
      membros_projeto: [],
      gerente_projeto: '',
    });
    setStep(0);
    setStepHistory([0]);
  };

  const handleNextClick = async () => {
    if (showReviewStep) {
      handleSubmit(onSubmit)();
      return;
    }
    if (isLastStep) {
      mode === 'visual-project' ? goToReviewStep() : handleSubmit(onSubmit)();
      return;
    }
    if (currentStep) {
      const visibleNames = getVisibleFieldNames(currentStep, values) as Path<PapeFormInputs>[];
      const schemaOk = await trigger(visibleNames);
      const allFilled = !hasEmptyRequiredField(visibleNames, values, selectedProject);
      if (!schemaOk || !allFilled) {
        setStepError('Preencha todos os campos obrigatórios antes de continuar.');
        return;
      }
    }
    setStepError(null);
    goToNextStep();
  };

  const showReviewStep = mode === 'visual-project' && step === TOTAL_STEPS;
  const totalVisibleSteps = mode === 'visual-project' ? TOTAL_STEPS + 1 : TOTAL_STEPS;
  const currentVisibleStep = showSuccessStep ? totalVisibleSteps : Math.min(step + 1, totalVisibleSteps);
  const progress = showSuccessStep ? 100 : Math.round((currentVisibleStep / totalVisibleSteps) * 100);
  const currentStep = steps[step];
  const isLastStep = step === TOTAL_STEPS - 1;
  const finalSubmitLabel = submitLabel ?? 'Enviar respostas →';

  const goToReviewStep = () => {
    setStep(TOTAL_STEPS);
    setStepHistory([...stepHistory, TOTAL_STEPS]);
  };

  return (
    <>
      {!showSuccessStep && (
        <div className="meta-progress">
          <div style={{ maxWidth: 880, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div className="eyebrow" style={{ color: 'var(--meta-navy-50)' }}>
                Etapa {currentVisibleStep} de {totalVisibleSteps}
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
          <div className="meta-card" style={{ padding: '56px 48px', overflow: 'visible' }}>

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
                    projetos={gerenteProjetos}
                    membros={membros}
                    hasSelectedManager={hasSelectedManager}
                    projetosLoading={projetosLoading}
                    projetosError={projetosError}
                    servicos={servicos}
                    membrosPorCoordenacao={membrosPorCoordenacao}
                    selectedProject={selectedProject}
                  />
                ))}
              </StepCard>
            )}

            {showReviewStep && (
              <ReviewStep steps={steps} values={values} servicos={servicos} membrosPorCoordenacao={membrosPorCoordenacao} />
            )}

            {showSuccessStep && (
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
                  {mode === 'visual-project' ? 'Projeto preparado' : 'Recebido com sucesso'}
                </div>
                <h2 className="h2" style={{ marginBottom: 12 }}>
                  {mode === 'visual-project' ? 'Cadastro visual concluído' : <>Obrigado por <span className="text-gradient">responder!</span></>}
                </h2>
                <p style={{ fontSize: 16, color: 'var(--meta-navy-50)', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 36px' }}>
                  {mode === 'visual-project'
                    ? 'O projeto foi criado com sucesso e já está disponível no sistema.'
                    : 'Suas respostas foram salvas e serão processadas pela equipe Meta. Seu acompanhamento é fundamental para o sucesso do projeto.'}
                </p>
                {mode === 'pape' && (
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
                )}
                <p style={{ fontSize: 14, color: 'var(--meta-navy-50)', marginBottom: 20, fontWeight: 500 }}>
                  {mode === 'visual-project' ? 'Deseja cadastrar outro projeto?' : 'Deseja responder novamente para outro projeto?'}
                </p>
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                  <button onClick={restartForm} className="btn btn-primary">
                    {mode === 'visual-project' ? '↻ Criar outro projeto' : '↻ Responder novamente'}
                  </button>
                  <button onClick={restartForm} className="btn btn-secondary">Voltar ao início</button>
                </div>
              </div>
            )}

            {!showSuccessStep && (
              <>
                <div className="meta-divider" />
                {stepError && (
                  <div
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'rgba(217, 45, 32, 0.06)',
                      border: '1px solid rgba(217, 45, 32, 0.25)',
                      color: 'var(--meta-danger, #D92D20)',
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 12,
                    }}
                  >
                    Preencha todos os campos obrigatórios antes de continuar.
                  </div>
                )}
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
                    onClick={handleNextClick}
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                  >
                    {showReviewStep
                      ? (submitting ? 'Enviando…' : 'Confirmar envio →')
                      : isLastStep
                        ? (submitting ? 'Enviando…' : finalSubmitLabel)
                        : 'Próximo →'}
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
      {isPasswordOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(19, 25, 54, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => {
            if (!submitting) setIsPasswordOpen(false);
          }}
        >
          <div
            className="meta-card"
            style={{
              width: '100%',
              maxWidth: '500px',
              padding: '36px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              border: '1px solid rgba(0, 103, 255, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone de alerta (Azul) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0, 103, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(0, 103, 255, 0.25)',
                }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--meta-blue)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'var(--meta-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Confirmar Cadastro de Projeto
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--meta-navy-50)', lineHeight: '1.6', margin: 0 }}>
                  Você está prestes a cadastrar um novo projeto{' '}
                  <strong style={{ color: 'var(--meta-navy)' }}>&quot;{pendingData?.nome_projeto}&quot;</strong>.
                  Para confirmar, digite a senha de confirmação.
                </p>
              </div>
            </div>

            {/* Aviso informativo (Azul) */}
            <div
              style={{
                backgroundColor: 'rgba(0, 103, 255, 0.06)',
                border: '1px solid rgba(0, 103, 255, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                fontSize: '13px',
                color: 'var(--meta-blue)',
                fontWeight: '600',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: '1px' }}
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <span>
                Esta ação criará o registro oficial do projeto, incluindo contrato, serviços e membros no banco de dados.
              </span>
            </div>

            {/* Formulário de confirmação */}
            <form onSubmit={handleConfirmCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="create-password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--meta-navy)',
                    marginBottom: '8px',
                  }}
                >
                  Digite a senha de confirmação para confirmar
                </label>
                <input
                  id="create-password"
                  type="password"
                  className="meta-input"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Senha"
                  autoComplete="off"
                  autoFocus
                  disabled={submitting}
                  style={{
                    borderColor: passwordError
                      ? 'rgba(229, 72, 77, 0.6)'
                      : senha.length > 0
                      ? 'rgba(31, 191, 106, 0.6)'
                      : undefined,
                  }}
                />
              </div>

              {/* Mensagem de erro */}
              {passwordError && (
                <div
                  style={{
                    backgroundColor: 'rgba(229, 72, 77, 0.08)',
                    color: 'var(--meta-danger)',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    border: '1px solid rgba(229, 72, 77, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  {passwordError}
                </div>
              )}

              {/* Botões */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--meta-navy-10)',
                  marginTop: '4px',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={submitting}
                  onClick={() => setIsPasswordOpen(false)}
                  style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={submitting || !senha}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: submitting || !senha
                      ? 'rgba(0, 103, 255, 0.3)'
                      : 'var(--meta-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: submitting || !senha ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                      >
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"></circle>
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Criando...
                    </>
                  ) : (
                    <>
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
