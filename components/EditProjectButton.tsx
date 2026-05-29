'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

type Member = {
  id: number;
  nome: string;
  email: string;
  cargo: string;
  coordenacao: string | null;
  coordenacao_sigla: string | null;
};

type Service = {
  id: number;
  nome: string;
};

type Coordination = {
  id: number;
  nome: string;
};

type FollowUp = {
  id: number;
  data_resposta: string;
};

type ProjectDetails = {
  id: number;
  nome: string;
  descricao: string | null;
  descricao_projeto: string | null;
  data_inicio: string | null;
  numero_contrato: string | null;
  valor_total: number | null;
  possui_orientador: number | null;
  nome_orientador: string | null;
  servicos: Service[];
  coordenacoes: Coordination[];
  membros: Member[];
  acompanhamentos: FollowUp[];
};

type Props = {
  projeto: ProjectDetails;
};

// API_URL e REQUIRED_PASSWORD removidos para rodar via proxy server-side.


export default function EditProjectButton({ projeto }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Form states
  const [nome, setNome] = useState(projeto.nome);
  const [descricaoProjeto, setDescricaoProjeto] = useState(projeto.descricao_projeto ?? projeto.descricao ?? '');
  const [dataInicio, setDataInicio] = useState(projeto.data_inicio ? projeto.data_inicio.split('T')[0] : '');
  const [numeroContrato, setNumeroContrato] = useState(projeto.numero_contrato ?? '');
  const [valorTotal, setValorTotal] = useState(projeto.valor_total !== null ? String(projeto.valor_total) : '');
  const [possuiOrientador, setPossuiOrientador] = useState(projeto.possui_orientador === 1 ? 'Sim' : 'Não');
  const [nomeOrientador, setNomeOrientador] = useState(projeto.nome_orientador ?? '');

  const router = useRouter();

  const handleOpen = () => {
    setNome(projeto.nome);
    setDescricaoProjeto(projeto.descricao_projeto ?? projeto.descricao ?? '');
    setDataInicio(projeto.data_inicio ? projeto.data_inicio.split('T')[0] : '');
    setNumeroContrato(projeto.numero_contrato ?? '');
    setValorTotal(projeto.valor_total !== null ? String(projeto.valor_total) : '');
    setPossuiOrientador(projeto.possui_orientador === 1 ? 'Sim' : 'Não');
    setNomeOrientador(projeto.nome_orientador ?? '');
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setError('O nome do projeto é obrigatório.');
      return;
    }
    setError(null);
    setSenha('');
    setPasswordError(null);
    setIsPasswordOpen(true);
  };

  const handleConfirmSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== projeto.nome) {
      setPasswordError('O texto não confere com o nome do projeto.');
      return;
    }

    setLoading(true);
    setPasswordError(null);

    const payload = {
      nome: nome.trim(),
      descricao_projeto: descricaoProjeto.trim() || null,
      data_inicio: dataInicio || null,
      numero_contrato: numeroContrato.trim() || null,
      valor_total: valorTotal ? parseFloat(valorTotal) : null,
      possui_orientador: possuiOrientador === 'Sim' ? 1 : 0,
      nome_orientador: possuiOrientador === 'Sim' && nomeOrientador.trim() ? nomeOrientador.trim() : null,
    };

    try {
      const res = await fetch(`/api/projetos/${projeto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Ocorreu um erro ao salvar as alterações.');
      }

      setIsPasswordOpen(false);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error('Erro ao editar projeto:', err);
      setPasswordError(err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="btn btn-primary"
        style={{
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Editar Projeto
      </button>

      {isOpen && (
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
            zIndex: 9999,
            padding: '20px',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="meta-card"
            style={{
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 className="h3" style={{ color: 'var(--meta-navy)', fontWeight: '800', margin: 0 }}>
                  Editar Detalhes do Projeto
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--meta-navy-50)', marginTop: '4px', lineHeight: '1.4' }}>
                  Altere as informações cadastrais e de contrato deste projeto.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--meta-navy-50)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--meta-navy-10)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: 'rgba(229, 72, 77, 0.1)',
                  color: 'var(--meta-danger)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  border: '1px solid rgba(229, 72, 77, 0.2)',
                }}
              >
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                  Nome do Projeto <span style={{ color: 'var(--meta-danger)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="meta-input"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Projeto Alfa"
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)' }}>
                    Descrição do Projeto
                  </label>
                  <span style={{ fontSize: '12px', color: descricaoProjeto.length > 500 ? 'var(--meta-danger)' : 'var(--meta-navy-50)', fontWeight: '600' }}>
                    {descricaoProjeto.length} / 500
                  </span>
                </div>
                <textarea
                  className="meta-input"
                  value={descricaoProjeto}
                  onChange={(e) => setDescricaoProjeto(e.target.value)}
                  placeholder="Descrição resumida do escopo e objetivo (máximo de 500 caracteres)..."
                  maxLength={500}
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              {/* Grid 2 colunas: Data de Início e Número do Contrato */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                    Data de Início
                  </label>
                  <input
                    type="date"
                    className="meta-input"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                    Número do Contrato
                  </label>
                  <input
                    type="text"
                    className="meta-input"
                    value={numeroContrato}
                    onChange={(e) => setNumeroContrato(e.target.value)}
                    placeholder="Ex: 111.1111"
                  />
                </div>
              </div>

              {/* Valor do Projeto */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                  Valor do Projeto (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="meta-input"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(e.target.value)}
                  placeholder="Ex: 15000.00"
                />
              </div>

              {/* Orientador Técnico */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                  O projeto possui orientador técnico?
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {['Sim', 'Não'].map((opt) => (
                    <label
                      key={opt}
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid',
                        borderColor: possuiOrientador === opt ? 'var(--meta-blue)' : 'var(--meta-navy-10)',
                        backgroundColor: possuiOrientador === opt ? 'rgba(0, 103, 255, 0.02)' : '#FAFBFC',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        color: 'var(--meta-navy)',
                        transition: 'all 0.2s',
                      }}
                    >
                      <input
                        type="radio"
                        name="possuiOrientador"
                        value={opt}
                        checked={possuiOrientador === opt}
                        onChange={() => setPossuiOrientador(opt)}
                        style={{ marginRight: '10px', accentColor: 'var(--meta-blue)' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              {/* Nome do Orientador (Condicional) */}
              {possuiOrientador === 'Sim' && (
                <div className="meta-fade-in">
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--meta-navy)', marginBottom: '8px' }}>
                    Nome do Orientador
                  </label>
                  <input
                    type="text"
                    className="meta-input"
                    value={nomeOrientador}
                    onChange={(e) => setNomeOrientador(e.target.value)}
                    placeholder="Nome completo do orientador"
                  />
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--meta-navy-10)', paddingTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={loading}
                  onClick={() => setIsOpen(false)}
                  style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {loading && (
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginRight: '4px' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25"></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

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
            if (!loading) setIsPasswordOpen(false);
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
                  Confirmar Alterações
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--meta-navy-50)', lineHeight: '1.6', margin: 0 }}>
                  Você está prestes a alterar os dados do projeto{' '}
                  <strong style={{ color: 'var(--meta-navy)' }}>&quot;{projeto.nome}&quot;</strong>.
                  Para confirmar, digite o nome do projeto.
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
                Esta ação atualizará as informações do contrato, orientador e identificação do projeto no banco de dados.
              </span>
            </div>

            {/* Formulário de confirmação */}
            <form onSubmit={handleConfirmSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label
                  htmlFor="edit-password"
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
                  id="edit-password"
                  type="text"
                  className="meta-input"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder={projeto.nome}
                  autoComplete="off"
                  autoFocus
                  disabled={loading}
                  style={{
                    borderColor: passwordError
                      ? 'rgba(229, 72, 77, 0.6)'
                      : senha === projeto.nome && senha.length > 0
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
                  disabled={loading}
                  onClick={() => setIsPasswordOpen(false)}
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
                      ? 'rgba(0, 103, 255, 0.3)'
                      : 'var(--meta-blue)',
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
                      Salvando...
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
