import React from 'react';
import type { AgentState } from '../types';

interface Props { state: AgentState | null }

type Status = string;

function statusConfig(s: Status): { color: string; glowColor: string; label: string } {
  switch (s) {
    case 'monitoring':
    case 'running':
      return { color: '#00C896', glowColor: 'rgba(0,200,150,0.5)', label: 'MONITORING' };
    case 'executing':
      return { color: '#f5a623', glowColor: 'rgba(245,166,35,0.5)', label: 'EXECUTING' };
    case 'complete':
      return { color: '#00C896', glowColor: 'rgba(0,200,150,0.5)', label: 'COMPLETE' };
    case 'expired':
      return { color: '#555', glowColor: 'rgba(80,80,80,0.3)', label: 'EXPIRED' };
    case 'error':
      return { color: '#ff4d4d', glowColor: 'rgba(255,77,77,0.5)', label: 'ERROR' };
    default:
      return { color: '#555', glowColor: 'rgba(80,80,80,0.3)', label: s.toUpperCase() };
  }
}

const isActive = (s: Status) =>
  s === 'monitoring' || s === 'running' || s === 'executing';

export default function AgentStatus({ state }: Props) {
  const status    = state?.status ?? 'idle';
  const cfg       = statusConfig(status);
  const reason    = state?.lastDecision?.reason ?? null;
  const score     = state?.lastDecision?.score ?? null;
  const threshold = state?.lastDecision?.threshold ?? null;
  const ts        = state?.lastUpdated ?? null;
  const active    = isActive(status);

  const scorePct = score != null && threshold != null && threshold > 0
    ? Math.min(100, (score / threshold) * 100)
    : null;

  return (
    <div style={s.card}>
      <div style={s.cardHeader}>Agent Status</div>

      {/* Glowing circle indicator */}
      <div style={s.indicatorWrap}>
        <div
          style={{
            ...s.circle,
            background: cfg.color,
            // CSS custom props for glow-pulse keyframe
            ['--glow-color' as any]: cfg.glowColor,
            animation: active ? 'glow-pulse 2s ease-in-out infinite' : 'none',
            boxShadow: active
              ? `0 0 0 0 ${cfg.glowColor}, 0 0 14px 4px ${cfg.glowColor}`
              : `0 0 8px 2px ${cfg.glowColor}`,
          }}
        />
        <div style={{ ...s.statusLabel, color: cfg.color }}>
          {cfg.label}
        </div>
      </div>

      {/* Decision score bar */}
      {scorePct !== null && (
        <div style={s.scoreSection}>
          <div style={s.scoreHeader}>
            <span style={s.scoreLabel}>DECISION SCORE</span>
            <span style={s.scoreValue}>{score} / {threshold}</span>
          </div>
          <div style={s.barTrack}>
            <div
              style={{
                ...s.barFill,
                width: `${scorePct}%`,
                background: scorePct >= 100 ? 'var(--accent)' : scorePct > 60 ? 'var(--warning)' : '#555',
              }}
            />
          </div>
        </div>
      )}

      {/* Last decision reason */}
      {reason && (
        <div style={s.reasonBlock}>
          <div style={s.reasonLabel}>LAST DECISION</div>
          <div style={s.reasonText}>{reason}</div>
        </div>
      )}

      {/* Timestamp */}
      {ts && (
        <div style={s.ts}>
          {new Date(ts).toLocaleString('en-GB', { hour12: false })}
        </div>
      )}

      {!state && <div style={s.empty}>Waiting for data…</div>}
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
  cardHeader: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 18,
    fontVariant: 'small-caps',
  },
  indicatorWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'var(--mono)',
    letterSpacing: '0.1em',
  },
  scoreSection: {
    marginBottom: 14,
    padding: '12px 0',
    borderTop: '1px solid var(--border)',
  },
  scoreHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 11,
    fontFamily: 'var(--mono)',
    color: 'var(--text-secondary)',
  },
  barTrack: {
    height: 4,
    background: '#1f1f1f',
    borderRadius: 99,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 99,
    transition: 'width 0.4s ease',
  },
  reasonBlock: {
    padding: '10px 0',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  reasonLabel: {
    fontSize: 9,
    fontWeight: 600,
    color: '#444',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 11,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
  ts: {
    marginTop: 10,
    fontSize: 10,
    color: '#333',
    fontFamily: 'var(--mono)',
  },
  empty: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    padding: '12px 0',
  },
};
