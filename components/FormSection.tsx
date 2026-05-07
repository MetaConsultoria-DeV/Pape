'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  visible?: boolean;
}

export function FormSection({
  title,
  description,
  children,
  visible = true,
}: FormSectionProps) {
  if (!visible) return null;

  return (
    <section style={{
      marginBottom: '40px',
      paddingBottom: '32px',
      borderBottom: '1px solid #E5E8F2'
    }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 className="h3" style={{
          color: '#131936',
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '700'
        }}>{title}</h2>
        {description && (
          <p style={{
            fontSize: '14px',
            color: '#6B7299',
            fontWeight: '400'
          }}>{description}</p>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>{children}</div>
    </section>
  );
}
