import React from 'react';
import type { Policy } from '../types';

interface Props { policy: Policy | null }

function AssetChip({ asset }: { asset: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: 'rgba(0,200,150,0.1)',
      color: 'var(--accent)',
      border: '1px solid rgba(0,200,150,0.25)',
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'var(--mono)',
      letterSpacing: '0.06em',
      padding: '2px 7px',
      borderRadius: 4,
      marginLeft: 8,
      verticalAlign: 'middle',
    }}>
      {asset}
    </span>
  );
}

function DirectionBadge({ dir }: { dir: string }) {
  const up = dir === 'accumulate' || dir === 'buy';
  return (
    <span style={{
      display: 'inline-block',
      background: up ? 'rgba(0,200,150,0.1)' : 'rgba(255,77,77,0.1)',
      color: up ? 'var(--accent)' : 'var(--danger)',
      border: `1px solid ${up ? 'rgba(0,200,150,0.25)' : 'rgba(255,77,77,0.25)'}`,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: 'var(--mono)',
      letterSpacing: '0.06em',
      padding: '2px 8px',
      borderRadius: 4,
    }}>
      {dir.toUpperCase()}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontWeight: 500 }}>
        {children}
      </span>
    </div>
  );
}

function fmt(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'number') return v.toLocaleString('en-US');
  return String(v);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9,
      fontWeight: 600,
      color: '#3a3a3a',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      marginBottom: 4,
      marginTop: 2,
      fontVariant: 'small-caps',
    }}>
      {children}
    </div>
  );
}

export default function ActivePolicy({ policy }: Props) {
  if (!policy) {
    return (
      <div style={s.card}>
        <div style={s.header}>Active Policy</div>
        <div style={s.empty}>No policy loaded</div>
      </div>
    );
  }

  const { goal, constraints: c } = policy;

  return (
    <div style={s.card}>
      <div style={s.header}>Active Policy</div>

      {/* ── Goal ── */}
      <SectionLabel>Goal</SectionLabel>

      <Row label="Asset">
        {goal.amount} <AssetChip asset={goal.asset} />
      </Row>
      <Row label="Direction">
        <DirectionBadge dir={goal.direction} />
      </Row>

      {/* ── Divider ── */}
      <div style={s.divider} />

      {/* ── Constraints ── */}
      <SectionLabel>Constraints</SectionLabel>

      <Row label="Budget">${fmt(c.budget_usd)}</Row>
      <Row label="Max price">{c.max_price_usd != null ? `$${fmt(c.max_price_usd)}` : '—'}</Row>
      <Row label="Min price">{c.min_price_usd != null ? `$${fmt(c.min_price_usd)}` : '—'}</Row>
      <Row label="Max gas">{fmt(c.max_gas_gwei)} gwei</Row>
      <Row label="Max per trade">${fmt(c.max_per_trade_usd)}</Row>
      <Row label="Expires in">{fmt(c.expires_in_hours)} hrs</Row>
      <Row label="Min interval">{fmt(c.min_interval_minutes)} min</Row>
      <Row label="Chain">{c.chain}</Row>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
  },
  header: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 12,
    fontVariant: 'small-caps',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '12px 0',
  },
  empty: {
    color: '#444',
    fontSize: 12,
    padding: '10px 0',
    textAlign: 'center',
  },
};
