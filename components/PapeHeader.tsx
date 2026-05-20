import Link from 'next/link';
import { MetaSymbol } from '@/components/ui';

type PapeHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
  dashboardHref?: string;
  dashboardLabel?: string;
};

export default function PapeHeader({ actionHref, actionLabel, dashboardHref, dashboardLabel }: PapeHeaderProps) {
  return (
    <header className="meta-header">
      <div className="meta-header-inner">
        <div className="meta-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <MetaSymbol size={48} />
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.85)' }}>
              Meta Consultoria
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {dashboardHref && dashboardLabel && (
              <Link 
                href={dashboardHref} 
                className="meta-header-action" 
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}
              >
                {dashboardLabel}
              </Link>
            )}
            {actionHref && actionLabel && (
              <Link href={actionHref} className="meta-header-action">
                {actionLabel}
              </Link>
            )}
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
