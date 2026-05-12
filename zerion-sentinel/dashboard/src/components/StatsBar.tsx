import React from 'react';
import type { AgentState } from '../types';

interface Props {
  state: AgentState | null;
  prevAssetPrice: number | null;
  flashing: boolean;
}

function PriceArrow({ current, prev }: { current: number | null; prev: number | null }) {
  if (current == null || prev == null || prev === 0) return null;
  const diff = current - prev;
  if (Math.abs(diff) < 0.001) return null;

  const up = diff > 0;
  const pct = Math.abs((diff / prev) * 100).toFixed(2);
  const color = up ? 'var(--success)' : 'var(--danger)';
  const arrow = up ? '▲' : '▼';

  return (
    <span style={{ color, fontSize: 10, fontFamily: 'var(--mono)', marginLeft: 6, fontWeight: 600 }}>
      {arrow} {pct}%
    </span>
  );
}

export default function StatsBar({ state, prevAssetPrice, flashing }: Props) {
  const asset        = state?.market?.asset ?? state?.policy?.goal?.asset ?? 'ETH';
  const assetPrice   = state?.market?.assetPrice ?? null;
  const gasGwei      = state?.market?.gasGwei ?? null;
  const accumulated  = state?.progress?.assetAccumulated ?? 0;
  const goalAmount   = state?.policy?.goal?.amount ?? 0;
  const spentUsd     = state?.progress?.spentUsd ?? 0;
  const budget       = state?.policy?.constraints?.budget_usd ?? 0;

  const priceStr = assetPrice != null
    ? `$${assetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

  const gasStr = gasGwei != null ? `${gasGwei.toFixed(1)} gwei` : '—';

  const progressStr = goalAmount > 0
    ? `${accumulated.toFixed(4)} / ${goalAmount} ${asset}`
    : '—';

  const budgetStr = budget > 0
    ? `$${(budget - spentUsd).toFixed(0)} / $${budget.toFixed(0)}`
    : '—';

  return (
    <div style={s.bar}>
      {/* ETH Price */}
      <div style={s.card}>
        <div style={s.label}>{asset} PRICE</div>
        <div style={s.valueRow}>
          <span style={s.value}>{priceStr}</span>
          <PriceArrow current={assetPrice} prev={prevAssetPrice} />
        </div>
      </div>

      {/* Gas */}
      <div style={s.card}>
        <div style={s.label}>GAS</div>
        <div style={s.value}>{gasStr}</div>
      </div>

      {/* Goal Progress */}
      <div style={s.card}>
        <div style={s.label}>GOAL PROGRESS</div>
        <div style={s.value}>{progressStr}</div>
      </div>

      {/* Budget Remaining */}
      <div style={s.card}>
        <div style={s.label}>BUDGET REMAINING</div>
        <div style={s.value}>{budgetStr}</div>
      </div>

      {/* LIVE indicator */}
      <div style={s.liveWrap}>
        <span style={{
          ...s.liveDot,
          animation: flashing ? 'flash 0.6s ease' : 'none',
        }} />
        <span style={s.liveText}>LIVE</span>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  bar: {
    display: 'flex',
    alignItems: 'stretch',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  card: {
    flex: 1,
    padding: '12px 18px',
    borderLeft: '2px solid var(--accent)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.1em',
    fontVariant: 'small-caps',
    textTransform: 'uppercase',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: 'var(--mono)',
    lineHeight: 1,
  },
  liveWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 18px',
    flexShrink: 0,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: 'var(--accent)',
    display: 'inline-block',
    flexShrink: 0,
  },
  liveText: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.12em',
    color: 'var(--accent)',
    fontFamily: 'var(--mono)',
  },
};
