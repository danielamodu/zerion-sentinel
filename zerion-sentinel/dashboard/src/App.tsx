import React, {
  useEffect, useState, useCallback, useRef,
} from 'react';
import './index.css';
import type { AgentState, Execution } from './types';

// ── Constants ──────────────────────────────────────────────────────────────
const POLL_MS = 5_000;
const GREEN   = '#00FF00';
const RED     = '#FF0000';
const GRID    = '#1a1a1a';
const LABEL   = '#333';
const VALUE   = '#fff';
const DIM     = '#444';
const SANS    = "'Space Grotesk', system-ui, sans-serif";

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtPrice(p: number | null): string {
  if (p == null) return '—';
  return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTime(ts: string): string {
  try { return new Date(ts).toLocaleTimeString('en-GB', { hour12: false }); }
  catch { return ts; }
}
function statusTag(e: Execution): { text: string; color: string } {
  if (e.status === 'success') return { text: '[OK]',  color: GREEN };
  if (e.status === 'failed')  return { text: '[ERR]', color: RED };
  return                             { text: '[DRY]', color: VALUE };
}

// ── Flash state type ───────────────────────────────────────────────────────
type FlashState = { priceFlash: boolean; priceUp: boolean | null };

// ── Shared styles ──────────────────────────────────────────────────────────
const SEC_LABEL: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 400,
  letterSpacing: '3px',
  color: LABEL,
  textTransform: 'uppercase' as const,
  marginBottom: 10,
  fontFamily: SANS,
};

const FIELD_LABEL: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 400,
  color: LABEL,
  letterSpacing: '1px',
  fontFamily: SANS,
  minWidth: 90,
  flexShrink: 0,
};

const FIELD_VALUE: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: VALUE,
  fontFamily: SANS,
};

const SEC_WRAP: React.CSSProperties = {
  padding: '12px',
  borderBottom: `1px solid ${GRID}`,
};

// ── Sub-components ─────────────────────────────────────────────────────────

function FieldRow({
  label, children, valueStyle,
}: {
  label: string;
  children: React.ReactNode;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingBottom: 5 }}>
      <span style={FIELD_LABEL}>{label}</span>
      <span style={{ ...FIELD_VALUE, ...valueStyle }}>{children}</span>
    </div>
  );
}

function PolicySection({ state }: { state: AgentState | null }) {
  const g = state?.policy?.goal;
  const c = state?.policy?.constraints;

  return (
    <div style={SEC_WRAP}>
      <div style={SEC_LABEL}>Policy</div>
      {!g || !c ? (
        <div style={{ fontSize: 11, color: DIM }}>No policy loaded</div>
      ) : (
        <>
          <FieldRow label="ASSET">{g.asset}</FieldRow>
          <FieldRow label="AMOUNT">{g.amount}</FieldRow>
          <FieldRow label="DIRECTION" valueStyle={{ color: g.direction === 'sell' ? RED : VALUE }}>
            {g.direction.toUpperCase()}
          </FieldRow>
          <FieldRow label="BUDGET">${c.budget_usd}</FieldRow>
          <FieldRow label="MAX PRICE">{c.max_price_usd != null ? `$${c.max_price_usd}` : '—'}</FieldRow>
          <FieldRow label="GAS LIMIT">{c.max_gas_gwei} gwei</FieldRow>
          <FieldRow label="PER TRADE">${c.max_per_trade_usd}</FieldRow>
          <FieldRow label="EXPIRES">{c.expires_in_hours}h</FieldRow>
          <FieldRow label="CHAIN">{c.chain.toUpperCase()}</FieldRow>
        </>
      )}
    </div>
  );
}

function DecisionSection({ state }: { state: AgentState | null }) {
  const d           = state?.lastDecision;
  const reason      = d?.reason ?? null;
  // Parse "score (N.N)" and "threshold (N)" from the reason string
  // because lastDecision only exposes { execute, reason }
  const scoreMatch  = reason?.match(/score[:\s]+([\d.]+)/i);
  const threshMatch = reason?.match(/threshold[:\s]+([\d.]+)/i);
  const score       = scoreMatch  ? parseFloat(scoreMatch[1])  : null;
  const threshold   = threshMatch ? parseFloat(threshMatch[1]) : null;

  return (
    <div style={SEC_WRAP}>
      <div style={SEC_LABEL}>Decision Engine</div>

      {score != null && threshold != null ? (
        <div style={{ marginBottom: 8 }}>
          {/* "42 / 60" — large bold white numbers, no bar, no ASCII */}
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: VALUE,
            letterSpacing: '-0.5px',
            lineHeight: 1,
            fontFamily: SANS,
          }}>
            {score}
            <span style={{ fontSize: 14, fontWeight: 400, color: DIM, margin: '0 6px' }}>/</span>
            {threshold}
          </div>
          <div style={{ fontSize: 9, color: LABEL, marginTop: 4, letterSpacing: '2px' }}>
            SCORE / THRESHOLD
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 11, color: DIM, marginBottom: 8 }}>No score data</div>
      )}

      {reason && (
        <div style={{ fontSize: 11, color: DIM, lineHeight: 1.5, paddingTop: 8, borderTop: `1px solid ${GRID}` }}>
          {reason}
        </div>
      )}
    </div>
  );
}

function MarketSection({
  state, prevPrice, flash,
}: {
  state: AgentState | null;
  prevPrice: number | null;
  flash: FlashState;
}) {
  const price   = state?.market?.assetPrice ?? null;
  const gas     = state?.market?.gasGwei    ?? null;
  const asset   = state?.market?.asset ?? state?.policy?.goal?.asset ?? 'ETH';

  let arrow = '';
  let pctStr = '';
  let changeColor = DIM;
  if (price != null && prevPrice != null && prevPrice !== 0) {
    const diff = price - prevPrice;
    if (Math.abs(diff) > 0.001) {
      arrow = diff > 0 ? '↑' : '↓';
      pctStr = `${diff > 0 ? '+' : ''}${((diff / prevPrice) * 100).toFixed(2)}%`;
      changeColor = diff > 0 ? GREEN : RED;
    }
  }

  return (
    <div style={{ ...SEC_WRAP, borderBottom: 'none' }}>
      <div style={SEC_LABEL}>Market</div>

      <div style={{ marginBottom: 8 }}>
        {/* Big number: 20px 700 white */}
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          color: flash.priceFlash ? DIM : VALUE,
          transition: 'color 0.2s',
          fontFamily: SANS,
        }}>
          {fmtPrice(price)}
        </div>
        <div style={{ fontSize: 10, color: changeColor, marginTop: 3, fontFamily: SANS }}>
          {arrow} {pctStr || asset}
        </div>
      </div>

      <FieldRow label="GAS">
        {gas != null ? `${gas.toFixed(1)} gwei` : '—'}
      </FieldRow>
    </div>
  );
}

function StatusBar({ state }: { state: AgentState | null }) {
  const raw         = state?.status ?? 'idle';
  const status      = raw.toUpperCase();
  const accumulated = state?.progress?.assetAccumulated ?? 0;
  const goalAmt     = state?.policy?.goal?.amount       ?? 0;
  const asset       = state?.policy?.goal?.asset        ?? 'ETH';
  const spent       = state?.progress?.spentUsd         ?? 0;
  const budget      = state?.policy?.constraints?.budget_usd ?? 0;

  const pct = goalAmt > 0 ? ((accumulated / goalAmt) * 100).toFixed(1) : '0.0';
  const isActive = raw === 'monitoring' || raw === 'running' || raw === 'executing';

  return (
    <div style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 12px',
      borderBottom: `1px solid ${GRID}`,
      flexShrink: 0,
    }}>
      {/* Status: blinking dot + word, 24px 800 weight, no badge/box */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isActive && (
          <span
            className="blink"
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: VALUE,
              flexShrink: 0,
            }}
          />
        )}
        <span style={{
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: '4px',
          color: VALUE,
          fontFamily: SANS,
        }}>
          {status}
        </span>
      </div>

      {/* Goal progress: "0.0000 / 0.1000 ETH" bold white, pct in small gray below */}
      {goalAmt > 0 && (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: VALUE, fontFamily: SANS }}>
            {accumulated.toFixed(4)} / {goalAmt.toFixed(4)} {asset}
          </div>
          <div style={{ fontSize: 9, color: LABEL, marginTop: 2, letterSpacing: '1px', fontFamily: SANS }}>
            {pct}% COMPLETE · ${spent.toFixed(2)} / ${budget} SPENT
          </div>
        </div>
      )}
    </div>
  );
}

function LogRow({ exec, isNew, isEven }: { exec: Execution; isNew: boolean; isEven: boolean }) {
  const tag   = statusTag(exec);
  const pair  = `${exec.fromToken}/${exec.toToken}`;
  const size  = exec.tradeSizeUsd != null ? `$${exec.tradeSizeUsd.toFixed(2)}` : '—';
  const chain = exec.chain ?? 'base';
  const url   = chain === 'base'     ? `https://basescan.org/tx/${exec.txHash}`
              : chain === 'optimism' ? `https://optimistic.etherscan.io/tx/${exec.txHash}`
              : chain === 'arbitrum' ? `https://arbiscan.io/tx/${exec.txHash}`
              : `https://etherscan.io/tx/${exec.txHash}`;

  const cell: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 500,
    color: VALUE,
    fontFamily: SANS,
    padding: '5px 10px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  return (
    <div
      className={isNew ? 'new-row' : ''}
      style={{
        display: 'grid',
        gridTemplateColumns: '72px 120px 72px 44px 60px 1fr',
        // Alternating row bg: #000 and #0a0a0a
        background: isEven ? '#000' : '#0a0a0a',
        borderBottom: `1px solid #0d0d0d`,
      }}
    >
      <div style={{ ...cell, color: DIM }}>{fmtTime(exec.timestamp)}</div>
      <div style={cell}>{pair}</div>
      <div style={cell}>{size}</div>
      {/* [OK] green, [ERR] red, [DRY] white */}
      <div style={{ ...cell, color: tag.color, fontWeight: 700 }}>{tag.text}</div>
      <div style={{ ...cell, color: DIM }}>—</div>
      {exec.txHash ? (
        <a
          href={url} target="_blank" rel="noreferrer"
          style={{ ...cell, color: VALUE, textDecoration: 'underline', textDecorationColor: GRID, cursor: 'pointer' }}
          title={exec.txHash}
        >
          {exec.txHash.slice(0, 10)}…
        </a>
      ) : (
        <div style={{ ...cell, color: DIM }}>—</div>
      )}
    </div>
  );
}

function ExecutionLog({ executions }: { executions: Execution[] }) {
  const prevLen = useRef(0);
  const newCount = executions.length - prevLen.current;
  useEffect(() => { prevLen.current = executions.length; });

  // Column headers: #222, 9px, letter-spacing 2px
  const hdr: React.CSSProperties = {
    fontSize: 9,
    fontWeight: 400,
    letterSpacing: '2px',
    color: '#222',
    textTransform: 'uppercase' as const,
    fontFamily: SANS,
    padding: '5px 10px',
    whiteSpace: 'nowrap' as const,
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Column headers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '72px 120px 72px 44px 60px 1fr',
        borderBottom: `1px solid ${GRID}`,
        background: '#000',
        flexShrink: 0,
      }}>
        <div style={hdr}>TIME</div>
        <div style={hdr}>PAIR</div>
        <div style={hdr}>SIZE</div>
        <div style={hdr}>ST</div>
        <div style={hdr}>SCORE</div>
        <div style={hdr}>TXHASH</div>
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {executions.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: DIM,
            fontSize: 11,
            fontFamily: SANS,
            gap: 3,
          }}>
            AWAITING FIRST EXECUTION
            <span className="blink">_</span>
          </div>
        ) : (
          executions.map((e, i) => (
            <LogRow key={i} exec={e} isNew={i < newCount} isEven={i % 2 === 0} />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState]         = useState<AgentState | null>(null);
  const [prevPrice, setPrevPrice] = useState<number | null>(null);
  const [clock, setClock]         = useState(() => new Date().toLocaleTimeString('en-GB', { hour12: false }));
  const [flash, setFlash]         = useState<FlashState>({ priceFlash: false, priceUp: null });
  const [liveOn, setLiveOn]       = useState(true);
  const [connErr, setConnErr]     = useState<string | null>(null);
  const flashTimer                 = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString('en-GB', { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  // LIVE blink
  useEffect(() => {
    const id = setInterval(() => setLiveOn(v => !v), 1000);
    return () => clearInterval(id);
  }, []);

  // Poll /api/state
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/state?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AgentState = await res.json();

      setState(prev => {
        const oldPrice = prev?.market?.assetPrice ?? null;
        const newPrice = data.market?.assetPrice  ?? null;
        setPrevPrice(oldPrice);
        if (newPrice != null && oldPrice != null && oldPrice !== newPrice) {
          setFlash({ priceFlash: true, priceUp: newPrice > oldPrice });
          if (flashTimer.current) clearTimeout(flashTimer.current);
          flashTimer.current = setTimeout(() => setFlash({ priceFlash: false, priceUp: null }), 300);
        }
        return data;
      });
      setConnErr(null);
    } catch (err) {
      setConnErr((err as Error).message);
    }
  }, []);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, POLL_MS);
    return () => { clearInterval(id); if (flashTimer.current) clearTimeout(flashTimer.current); };
  }, [fetchState]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#000',
      fontFamily: SANS,
    }}>
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: `1px solid ${GRID}`,
        flexShrink: 0,
      }}>
        {/* Title: 13px, 700, letter-spacing 3px */}
        <span style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: '3px',
          color: VALUE,
          fontFamily: SANS,
        }}>
          SENTINEL // AUTONOMOUS TRADING AGENT
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {connErr && (
            <span style={{ fontSize: 10, color: RED, fontFamily: SANS }}>ERR: {connErr}</span>
          )}
          <span style={{ fontSize: 10, fontWeight: 500, color: DIM, fontFamily: SANS }}>
            {clock}
          </span>
          {/* LIVE blink — white only */}
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '2px',
            color: liveOn ? VALUE : 'transparent',
            fontFamily: SANS,
          }}>
            LIVE ●
          </span>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* LEFT COLUMN — 280px, border-right 1px #1a1a1a */}
        <div style={{
          width: 280,
          flexShrink: 0,
          borderRight: `1px solid ${GRID}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <PolicySection   state={state} />
            <DecisionSection state={state} />
            <MarketSection   state={state} prevPrice={prevPrice} flash={flash} />
          </div>
        </div>

        {/* RIGHT COLUMN — status bar 48px + execution log below */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <StatusBar   state={state} />
          <ExecutionLog executions={state?.executions ?? []} />
        </div>
      </div>
    </div>
  );
}
