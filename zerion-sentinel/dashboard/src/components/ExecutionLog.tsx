import React from 'react';
import type { Execution } from '../types';

interface Props { executions: Execution[] }

const STATUS_DOT: Record<Execution['status'], string> = {
  success: 'var(--success)',
  failed:  'var(--danger)',
  pending: 'var(--warning)',
};

function fmtTime(ts: string) {
  try { return new Date(ts).toLocaleTimeString('en-GB', { hour12: false }); }
  catch { return ts; }
}

function etherscanUrl(hash: string, chain: string): string {
  if (chain === 'base') return `https://basescan.org/tx/${hash}`;
  if (chain === 'optimism') return `https://optimistic.etherscan.io/tx/${hash}`;
  if (chain === 'arbitrum') return `https://arbiscan.io/tx/${hash}`;
  return `https://etherscan.io/tx/${hash}`;
}

export default function ExecutionLog({ executions }: Props) {
  return (
    <div style={s.card}>
      <div style={s.header}>
        <span>Execution Log</span>
        <span style={s.badge}>{executions.length}</span>
      </div>

      <div style={s.tableWrap}>
        {executions.length === 0 ? (
          <div style={s.empty}>No executions yet</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {['Time', 'Size (USD)', 'Reason', 'St.', 'TxHash'].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {executions.map((e, i) => (
                <tr key={i} style={{
                  ...s.tr,
                  background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                }}>
                  <td style={{ ...s.td, ...s.mono, color: '#555', whiteSpace: 'nowrap' }}>
                    {fmtTime(e.timestamp)}
                  </td>
                  <td style={{ ...s.td, ...s.mono }}>
                    {e.tradeSizeUsd != null ? `$${e.tradeSizeUsd.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ ...s.td, color: 'var(--text-secondary)', maxWidth: 160 }}>
                    <span style={s.clamp}>{e.reason}</span>
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span
                      title={e.status}
                      style={{
                        display: 'inline-block',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: STATUS_DOT[e.status] ?? '#555',
                      }}
                    />
                  </td>
                  <td style={{ ...s.td, ...s.mono }}>
                    {e.txHash ? (
                      <a
                        href={etherscanUrl(e.txHash, e.chain)}
                        target="_blank"
                        rel="noreferrer"
                        style={s.txLink}
                        title={e.txHash}
                      >
                        {e.txHash.slice(0, 10)}…
                      </a>
                    ) : (
                      <span style={{ color: '#333' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 280,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border)',
    fontSize: 9,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    fontVariant: 'small-caps',
    flexShrink: 0,
  },
  badge: {
    background: '#1a1a1a',
    color: '#555',
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: 4,
    fontFamily: 'var(--mono)',
  },
  tableWrap: {
    overflow: 'auto',
    flex: 1,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '8px 12px',
    fontSize: 9,
    fontWeight: 600,
    color: '#3a3a3a',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    textAlign: 'left',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
    position: 'sticky' as const,
    top: 0,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: '1px solid #181818',
  },
  td: {
    padding: '8px 12px',
    fontSize: 11,
    color: 'var(--text-primary)',
    verticalAlign: 'middle',
  },
  mono: {
    fontFamily: 'var(--mono)',
  },
  clamp: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    fontSize: 11,
    lineHeight: 1.4,
  },
  txLink: {
    color: 'var(--accent)',
    textDecoration: 'none',
    fontSize: 11,
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    color: '#333',
    fontSize: 12,
  },
};
