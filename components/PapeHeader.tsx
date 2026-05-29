import Link from 'next/link';
import Image from 'next/image';
import { MetaSymbol } from '@/components/ui';

type PapeHeaderProps = {
  actionHref?: string;
  actionLabel?: string;
  dashboardHref?: string;
  dashboardLabel?: string;
  backHref?: string;
  backLabel?: string;
};

export default function PapeHeader({ actionHref, actionLabel, dashboardHref, dashboardLabel, backHref, backLabel }: PapeHeaderProps) {
  return (
    <header className="meta-header">
      <div className="meta-header-inner">
        <div className="meta-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Image
              src="/logos/wordmark-dark.png"
              alt="Meta Consultoria"
              width={109}
              height={36}
              priority
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {backHref && backLabel && (
              <Link
                href={backHref}
                className="meta-header-action"
                style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                {backLabel}
              </Link>
            )}
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
