'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  acompanhamentoId: number;
  dataRespostaFormatada: string;
};

export default function DeleteAcompanhamentoButton({ acompanhamentoId, dataRespostaFormatada }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setError(null);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/acompanhamentos/${acompanhamentoId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ocorreu um erro ao excluir o acompanhamento.');
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão com o servidor.';
      console.error('Erro ao excluir acompanhamento:', err);
      setError(message);
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        title="Excluir acompanhamento"
        aria-label="Excluir acompanhamento"
        style={{
          padding: '6px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(229, 72, 77, 0.08)',
          color: 'var(--meta-danger)',
          border: '1px solid rgba(229, 72, 77, 0.3)',
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginLeft: '4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(229, 72, 77, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(229, 72, 77, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(229, 72, 77, 0.08)';
          e.currentTarget.style.borderColor = 'rgba(229, 72, 77, 0.3)';
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
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
          <path d="M10 11v6"></path>
          <path d="M14 11v6"></path>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(19, 25, 54, 0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={handleClose}
        >
          <div
            className="meta-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              border: '1px solid rgba(229, 72, 77, 0.25)',
              backgroundColor: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(229, 72, 77, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(229, 72, 77, 0.25)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--meta-danger)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: 'var(--meta-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Excluir Acompanhamento
                </h3>
                <p style={{ fontSize: '14.5px', color: 'var(--meta-navy-70)', lineHeight: '1.5', margin: 0 }}>
                  Tem certeza de que deseja excluir o acompanhamento de{' '}
                  <strong style={{ color: 'var(--meta-navy)' }}>{dataRespostaFormatada}</strong>?
                </p>
                <p style={{ fontSize: '13px', color: 'var(--meta-danger)', marginTop: '8px', fontWeight: '600', margin: '8px 0 0' }}>
                  Esta ação é irreversível e removerá permanentemente todas as respostas associadas.
                </p>
              </div>
            </div>

            {error && (
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
                {error}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid var(--meta-navy-10)',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                disabled={loading}
                onClick={handleClose}
                style={{ padding: '10px 20px', fontSize: '13.5px', fontWeight: '700' }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: loading ? 'rgba(229, 72, 77, 0.4)' : 'var(--meta-danger)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      style={{
                        animation: 'spin 1s linear infinite',
                      }}
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"></circle>
                      <path
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Excluindo...
                  </>
                ) : (
                  <>
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
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                    </svg>
                    Confirmar Exclusão
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
