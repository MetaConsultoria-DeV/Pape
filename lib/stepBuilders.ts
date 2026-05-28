import type { FieldDef, RadioOption, StepDef } from './types';

type InputOpts = { number?: number; hint?: string; inputType?: string; placeholder?: string; showWhen?: { field: string; value: string } };
type RadioOpts = { number?: number; columns?: number; showWhen?: { field: string; value: string } };
type CheckboxOpts = { number?: number; showWhen?: { field: string; value: string } };
type ScaleOpts = { number?: number; lowLabel?: string; highLabel?: string; dictionary?: string[]; showWhen?: { field: string; value: string } };
type SelectOpts = { number?: number };
type TextareaOpts = { number?: number; hint?: string; placeholder?: string; maxLength?: number; showWhen?: { field: string; value: string } };

export const input = (name: string, label: string, opts: InputOpts = {}): FieldDef =>
  ({ type: 'input' as const, name, label, ...opts });

export const textarea = (name: string, label: string, opts: TextareaOpts = {}): FieldDef =>
  ({ type: 'textarea' as const, name, label, ...opts });

export const radio = (name: string, label: string, options: RadioOption[], opts: RadioOpts = {}): FieldDef =>
  ({ type: 'radio' as const, name, label, options, ...opts });

export const checkbox = (name: string, label: string, options: string[], opts: CheckboxOpts = {}): FieldDef =>
  ({ type: 'checkbox' as const, name, label, options, ...opts });

export const scale = (name: string, label: string, opts: ScaleOpts = {}): FieldDef =>
  ({ type: 'scale' as const, name, label, ...opts });

export const selectProjetos = (name: string, label: string, opts: SelectOpts = {}): FieldDef =>
  ({ type: 'select-projetos' as const, name, label, ...opts });

export const selectMembros = (name: string, label: string, opts: SelectOpts = {}): FieldDef =>
  ({ type: 'select-membros' as const, name, label, ...opts });

export const selectServicos = (name: string, label: string, opts: SelectOpts = {}): FieldDef =>
  ({ type: 'selectServicos' as const, name, label, ...opts });

export const selectConsultores = (name: string, label: string, opts: SelectOpts = {}): FieldDef =>
  ({ type: 'selectConsultores' as const, name, label, ...opts });

export const step = (
  eyebrow: StepDef['eyebrow'],
  title: string,
  fields: FieldDef[],
  description?: string,
): StepDef => ({ eyebrow, title, fields, description });
