import React from 'react';

type Page = 'dashboard' | 'policy' | 'log';

interface Props {
  page: Page;
  onNav: (p: Page) => void;
  status: string;
}

const navItems: { id: Page; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'policy',    label: 'Policy' },
  { id: 'log',       label: 'Log' },
];

const isLiveStatus = (s: string) =>
  s === 'running' || s === 'monitoring' || s === 'executing';

export default function Sidebar({ page, onNav, status }: Props) {
  const live = isLiveStatus(status);

  return (
    <aside style={s.sidebar}>
      {/* Brand */}
      <div style={s.brand}>
        <div style={s.brandTitle}>SENTINEL</div>
        <div style={s.brandTitleUnderline} />
        <div style={s.brandSub}>by 0xkenpacchi</div>
      </div>

      {/* Nav */}
      <nav style={s.nav}>
        {navItems.map(({ id, label }) => {
          const active = page === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              style={{
                ...s.navItem,
                ...(active ? s.navItemActive : {}),
              }}
            >
              <span style={{
                ...s.indicator,
                background: active ? 'var(--accent)' : 'transparent',
              }} />
              <span style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* LIVE indicator */}
      <div style={s.footer}>
        <div style={s.liveRow}>
          <span style={{
            ...s.dot,
            background: live ? 'var(--accent)' : '#2a2a2a',
            animation: live ? 'pulse 1.8s ease-in-out infinite' : 'none',
            boxShadow: live ? '0 0 6px rgba(0,200,150,0.6)' : 'none',
          }} />
          <span style={{
            ...s.liveLabel,
            color: live ? 'var(--accent)' : '#2a2a2a',
          }}>
            {live ? 'LIVE' : 'IDLE'}
          </span>
        </div>
      </div>
    </aside>
  );
}

const s: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 220,
    minWidth: 220,
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: 'var(--surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    overflow: 'hidden',
  },
  brand: {
    padding: '20px 18px 16px',
    borderBottom: '1px solid var(--border)',
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--accent)',
    letterSpacing: '0.18em',
    fontFamily: 'var(--mono)',
    marginBottom: 6,
  },
  brandTitleUnderline: {
    height: 1,
    background: 'var(--accent)',
    opacity: 0.4,
    marginBottom: 8,
  },
  brandSub: {
    fontSize: 10,
    color: '#3a3a3a',
    fontFamily: 'var(--mono)',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 0',
    gap: 1,
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'var(--font)',
    padding: '9px 16px',
    textAlign: 'left',
    width: '100%',
    transition: 'background var(--transition)',
    borderRadius: 0,
  },
  navItemActive: {
    background: 'rgba(0,200,150,0.06)',
  },
  indicator: {
    width: 2,
    height: 14,
    borderRadius: 1,
    flexShrink: 0,
    transition: 'background var(--transition)',
  },
  footer: {
    padding: '14px 18px',
    borderTop: '1px solid var(--border)',
  },
  liveRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    fontFamily: 'var(--mono)',
    transition: 'color 0.3s ease',
  },
};
