import { MetaSymbol } from '@/components/ui';

export default function PapeHeader() {
  return (
    <header className="meta-header">
      <div style={{ maxWidth: 880, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <MetaSymbol size={48} />
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
            Meta Consultoria
          </div>
        </div>
        <h1
          className="h1"
          style={{
            color: 'white',
            fontSize: 56,
            marginBottom: 12,
            letterSpacing: '-0.03em',
          }}
        >
          PAPE
        </h1>
        <p
          style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.92)',
            maxWidth: 560,
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          Plano de Acompanhamento de Projetos Externos
        </p>
      </div>
    </header>
  );
}
