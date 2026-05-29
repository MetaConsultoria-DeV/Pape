'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  projetoId: number;
  projetoNome: string;
};

// API_URL e REQUIRED_PASSWORD removidos para rodar via proxy server-side.


export default function DeleteProjectButton({ projetoId, projetoNome }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setSenha('');
    setError(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setSenha('');
    setError(null);
    setIsOpen(false);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== projetoNome) {
      setError('O texto não confere com o nome do projeto.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/projetos/${projetoId}`,
        { method: 'DELETE' },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ocorreu um erro ao excluir o projeto.');
      }

      // Sucesso: redireciona para a lista de projetos
      router.push('/projetos');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro de conexão com o servidor.';
      console.error('Erro ao excluir projeto:', err);
      setError(message);
      setLoading(false);
    }
  };

  const isPasswordCorrect = senha === projetoNome;

  return (
    <>
      {/* Botão de exclusão */}
      <button
        onClick={handleOpen}
        style={{
          padding: '12px 20px',
          fontSize: '14px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(229, 72, 77, 0.08)',
          color: 'var(--meta-danger)',
          border: '2px solid rgba(229, 72, 77, 0.3)',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
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
          width="16"
          height="16"
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
        Excluir
      </button>

      {/* Modal de confirmação */}
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
              maxWidth: '500px',
              padding: '36px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              border: '1px solid rgba(229, 72, 77, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ícone de aviso */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(229, 72, 77, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(229, 72, 77, 0.25)',
                }}
              >
                <svg
                  width="28"
                  height="28"
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
                    fontSize: '20px',
                    fontWeight: '800',
                    color: 'var(--meta-navy)',
                    margin: '0 0 8px',
                  }}
                >
                  Excluir Projeto Permanentemente
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--meta-navy-50)', lineHeight: '1.6', margin: 0 }}>
                  Você está prestes a excluir o projeto{' '}
                  <strong style={{ color: 'var(--meta-navy)' }}>&quot;{projetoNome}&quot;</strong>.
                  Esta ação é <strong style={{ color: 'var(--meta-danger)' }}>irreversível</strong> e
                  removerá todos os dados associados.
                </p>
              </div>
            </div>

            {/* Aviso de ação irreversível */}
            <div
              style={{
                backgroundColor: 'rgba(229, 72, 77, 0.06)',
                border: '1px solid rgba(229, 72, 77, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                fontSize: '13px',
                color: 'var(--meta-danger)',
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
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>
                Serão excluídos: histórico de acompanhamentos, membros da equipe, contrato e
                serviços vinculados. As transações financeiras serão desvinculadas, mas não
                excluídas.
              </span>
            </div>

            {/* Formulário de confirmação */}
            <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="delete-password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: 'var(--meta-navy)',
                    marginBottom: '8px',
                  }}
                >
                  Digite o nome do projeto para confirmar
                </label>
                <input
                  id="delete-password"
                  type="text"
                  className="meta-input"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setError(null);
                  }}
                  placeholder={projetoNome}
                  autoComplete="off"
                  autoFocus
                  disabled={loading}
                  style={{
                    borderColor: error
                      ? 'rgba(229, 72, 77, 0.6)'
                      : isPasswordCorrect && senha.length > 0
                      ? 'rgba(31, 191, 106, 0.6)'
                      : undefined,
                  }}
                />
              </div>

              {/* Mensagem de erro */}
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
                  disabled={loading}
                  onClick={handleClose}
                  style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading || !senha}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: loading || !senha
                      ? 'rgba(229, 72, 77, 0.3)'
                      : 'var(--meta-danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: loading || !senha ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? (
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
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <svg
                        width="16"
                        height="16"
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
                      Confirmar Exclusão
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
