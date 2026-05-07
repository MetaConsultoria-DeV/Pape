export default function Loading() {
  return (
    <div
      className="meta-bg"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <div
        className="meta-spin"
        style={{
          width: 48,
          height: 48,
          border: '4px solid var(--meta-navy-10)',
          borderTopColor: 'var(--meta-blue)',
          borderRadius: '50%',
        }}
      />
      <p style={{ color: 'var(--meta-navy-50)', fontWeight: 500 }}>Carregando formulário...</p>
    </div>
  );
}
