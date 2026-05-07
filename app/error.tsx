'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: '0 16px',
        background: 'var(--meta-paper)',
      }}
    >
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h2 className="h2" style={{ color: 'var(--meta-navy)', textAlign: 'center' }}>
        Algo deu errado
      </h2>
      <p style={{ color: 'var(--meta-navy-50)', textAlign: 'center' }}>
        {error.message || 'Ocorreu um erro inesperado.'}
      </p>
      <button onClick={reset} className="btn btn-primary">
        Tentar novamente
      </button>
    </div>
  );
}
