'use client';

import { ReactNode } from 'react';
import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  children: (props: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
  }) => ReactNode;
  error?: string;
  helper?: string;
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required,
  children,
  error,
  helper,
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error: fieldError } }) => (
        <div>
          {label && (
            <label style={{
              display: 'block',
              fontSize: '15px',
              fontWeight: '600',
              color: '#131936',
              marginBottom: '10px'
            }}>
              {label}
              {required && <span style={{ color: '#E5484D', marginLeft: '4px' }}>*</span>}
            </label>
          )}
          {children({
            value: field.value,
            onChange: field.onChange,
            onBlur: field.onBlur,
          })}
          {fieldError && (
            <p style={{
              color: '#E5484D',
              fontSize: '13px',
              marginTop: '8px',
              fontWeight: '500'
            }}>
              {fieldError.message}
            </p>
          )}
          {helper && !fieldError && (
            <p style={{
              color: '#6B7299',
              fontSize: '13px',
              marginTop: '6px'
            }}>{helper}</p>
          )}
        </div>
      )}
    />
  );
}
