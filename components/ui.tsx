'use client';

import React from 'react';

/* ============================================================
   FieldLabel — label padronizado com numeração opcional
   ============================================================ */
interface FieldLabelProps {
  number?: number | string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}

export function FieldLabel({ number, children, hint, required }: FieldLabelProps) {
  return (
    <label className="block mb-3">
      <span className="flex items-baseline gap-3 mb-1">
        {number && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 28,
              height: 28,
              padding: '0 8px',
              borderRadius: 8,
              background: 'var(--meta-gradient)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              lineHeight: 1,
            }}
          >
            {number}
          </span>
        )}
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--meta-navy)' }}>
          {children}
          {required && <span style={{ color: 'var(--meta-danger)', marginLeft: 4 }}>*</span>}
        </span>
      </span>
      {hint && (
        <span style={{ fontSize: 13, color: 'var(--meta-navy-50)', display: 'block', marginLeft: 36 }}>
          {hint}
        </span>
      )}
    </label>
  );
}

/* ============================================================
   InputField — input padronizado
   ============================================================ */
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ error, ...props }, ref) => (
    <>
      <input
        ref={ref}
        className="meta-input"
        {...props}
        style={{
          ...(error ? { borderColor: 'var(--meta-danger)' } : {}),
          ...props.style,
        }}
      />
      {error && (
        <p style={{ color: 'var(--meta-danger)', fontSize: 13, marginTop: 8, fontWeight: 500 }}>
          {error}
        </p>
      )}
    </>
  )
);
InputField.displayName = 'InputField';

/* ============================================================
   RadioGroup — grupo de opções como cards
   ============================================================ */
interface RadioGroupProps<T extends string | number> {
  options: { value: T; label: string; description?: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
  columns?: number;
}

export function RadioGroup<T extends string | number>({
  options,
  value,
  onChange,
  columns = 1,
}: RadioGroupProps<T>) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 12,
      }}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={String(opt.value)}
            className={`meta-option ${selected ? 'meta-option--selected' : ''}`}
          >
            <input
              type="radio"
              checked={selected}
              onChange={() => onChange(opt.value)}
              style={{ marginRight: 14 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--meta-navy)' }}>
                {opt.label}
              </div>
              {opt.description && (
                <div style={{ fontSize: 13, color: 'var(--meta-navy-50)', marginTop: 2 }}>
                  {opt.description}
                </div>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}

/* ============================================================
   CheckboxGroup — grupo de checkboxes para múltipla seleção
   ============================================================ */
interface CheckboxGroupProps {
  options: string[];
  value: string[] | undefined;
  onChange: (v: string[]) => void;
}

export function CheckboxGroup({ options, value = [], onChange }: CheckboxGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((opt) => {
        const checked = value.includes(opt);
        return (
          <label
            key={opt}
            className={`meta-option ${checked ? 'meta-option--selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => {
                onChange(
                  e.target.checked ? [...value, opt] : value.filter((v) => v !== opt)
                );
              }}
              style={{ marginRight: 14 }}
            />
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--meta-navy)' }}>
              {opt}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/* ============================================================
   ScaleField — escala de 1 a 5 horizontal com labels
   ============================================================ */
interface ScaleFieldProps {
  value: number | undefined;
  onChange: (v: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

export function ScaleField({
  value,
  onChange,
  lowLabel = 'Muito baixo',
  highLabel = 'Muito alto',
}: ScaleFieldProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const selected = value === n;
          return (
            <button
              type="button"
              key={n}
              onClick={() => onChange(n)}
              style={{
                flex: 1,
                aspectRatio: '1',
                maxHeight: 64,
                borderRadius: 12,
                border: '2px solid',
                borderColor: selected ? 'var(--meta-blue)' : 'var(--meta-navy-10)',
                background: selected ? 'var(--meta-gradient)' : 'var(--meta-white)',
                color: selected ? 'white' : 'var(--meta-navy)',
                fontSize: 22,
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                fontFamily: 'var(--font-montserrat)',
                boxShadow: selected ? 'var(--shadow-blue)' : 'none',
                transform: selected ? 'translateY(-2px)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--meta-blue-accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.borderColor = 'var(--meta-navy-10)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 10,
          fontSize: 12,
          fontWeight: 600,
          color: 'var(--meta-navy-50)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        <span>← {lowLabel}</span>
        <span>{highLabel} →</span>
      </div>
    </div>
  );
}

/* ============================================================
   MetaSymbol — logo SVG
   ============================================================ */
export function MetaSymbol({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 100 90" fill="none">
      <defs>
        <linearGradient id="metaGradLight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="metaGradLightBack" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <path
        d="M 14 8 L 92 8 L 53 80 Z M 30 18 L 76 18 L 53 60 Z"
        fill="url(#metaGradLightBack)"
        fillRule="evenodd"
      />
      <path
        d="M 8 4 L 86 4 L 47 76 Z M 24 14 L 70 14 L 47 56 Z"
        fill="url(#metaGradLight)"
        fillRule="evenodd"
      />
    </svg>
  );
}

/* ============================================================
   StepCard — wrapper do conteúdo de cada etapa com animação
   ============================================================ */
interface StepCardProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StepCard({ eyebrow, title, description, children }: StepCardProps) {
  return (
    <div className="meta-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <header>
        {eyebrow && (
          <div
            className="eyebrow"
            style={{ color: 'var(--meta-blue)', marginBottom: 10 }}
          >
            {eyebrow}
          </div>
        )}
        <h2 className="h2" style={{ color: 'var(--meta-navy)', marginBottom: description ? 8 : 0 }}>
          {title}
        </h2>
        {description && (
          <p style={{ fontSize: 16, color: 'var(--meta-navy-50)', lineHeight: 1.6 }}>
            {description}
          </p>
        )}
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>{children}</div>
    </div>
  );
}
