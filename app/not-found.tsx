import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: 64, fontWeight: 900, color: 'var(--meta-navy-10)' }}>404</div>
      <h2 className="h2" style={{ color: 'var(--meta-navy)', textAlign: 'center' }}>
        Página não encontrada
      </h2>
      <p style={{ color: 'var(--meta-navy-50)', textAlign: 'center' }}>
        A página que você está procurando não existe.
      </p>
      <Link href="/" className="btn btn-primary">
        Voltar ao início
      </Link>
    </div>
  );
}
