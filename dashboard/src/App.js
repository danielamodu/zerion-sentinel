import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useCallback, useRef, } from 'react';
import './index.css';
// ── Constants ──────────────────────────────────────────────────────────────
const POLL_MS = 5_000;
const AMBER = '#F5A623';
const TEAL = '#00C896';
const RED = '#FF3B3B';
const GRID = '#1a1a1a';
const LABEL = '#333333';
const VALUE = '#cccccc';
const DIM = '#555555';
const MONO = "'JetBrains Mono', 'Fira Code', monospace";
// ── Helpers ────────────────────────────────────────────────────────────────
function asciiBar(val, max, w = 20) {
    const pct = max > 0 ? Math.min(1, val / max) : 0;
    const filled = Math.round(pct * w);
    const bar = '█'.repeat(filled) + '░'.repeat(w - filled);
    return `[${bar}] ${(pct * 100).toFixed(1)}%`;
}
function fmtPrice(p) {
    if (p == null)
        return '—';
    return '$' + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtTime(ts) {
    try {
        return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
    }
    catch {
        return ts;
    }
}
function pad(s, n) {
    return String(s).padEnd(n, ' ');
}
function statusTag(e) {
    if (e.status === 'success')
        return { text: '[OK] ', color: TEAL };
    if (e.status === 'failed')
        return { text: '[ERR]', color: RED };
    return { text: '[DRY]', color: AMBER };
}
// ── Sections (sub-components defined inline) ───────────────────────────────
function PolicySection({ state }) {
    const g = state?.policy?.goal;
    const c = state?.policy?.constraints;
    const rows = g && c ? [
        ['ASSET', g.asset],
        ['AMOUNT', String(g.amount)],
        ['DIRECTION', g.direction.toUpperCase()],
        ['BUDGET', `$${c.budget_usd}`],
        ['MAX_PRICE', c.max_price_usd != null ? `$${c.max_price_usd}` : 'NONE'],
        ['GAS_LIMIT', `${c.max_gas_gwei} GWEI`],
        ['PER_TRADE', `$${c.max_per_trade_usd}`],
        ['EXPIRES', `${c.expires_in_hours}H`],
        ['CHAIN', c.chain.toUpperCase()],
    ] : [];
    return (_jsxs("div", { style: sec.wrap, children: [_jsx("div", { style: sec.label, children: "POLICY" }), rows.length === 0 ? (_jsx("div", { style: { color: DIM, fontSize: 10 }, children: "NO POLICY LOADED" })) : rows.map(([k, v]) => (_jsxs("div", { style: sec.row, children: [_jsx("span", { style: sec.key, children: pad(k, 10) }), _jsx("span", { style: {
                            ...sec.val,
                            color: k === 'DIRECTION'
                                ? (v === 'SELL' ? RED : TEAL)
                                : VALUE,
                        }, children: v })] }, k)))] }));
}
function DecisionSection({ state }) {
    const d = state?.lastDecision;
    const score = d?.score ?? null;
    const threshold = d?.threshold ?? null;
    const reason = d?.reason ?? null;
    const hasScore = score != null && threshold != null;
    return (_jsxs("div", { style: sec.wrap, children: [_jsx("div", { style: sec.label, children: "DECISION ENGINE" }), hasScore ? (_jsxs(_Fragment, { children: [_jsxs("div", { style: sec.row, children: [_jsx("span", { style: sec.key, children: 'SCORE'.padEnd(10) }), _jsxs("span", { style: { color: '#fff', fontWeight: 700 }, children: [String(score).padStart(3, '0'), " / ", String(threshold).padStart(3, '0')] })] }), _jsx("div", { style: { ...sec.row, marginTop: 4 }, children: _jsx("span", { style: { color: AMBER, fontSize: 11, letterSpacing: '0.02em', fontFamily: MONO }, children: asciiBar(score, threshold) }) }), _jsxs("div", { style: { ...sec.row, marginTop: 2 }, children: [_jsx("span", { style: { color: LABEL, fontSize: 10 }, children: 'THRESHOLD'.padEnd(10) }), _jsx("span", { style: { color: DIM }, children: threshold })] })] })) : (_jsx("div", { style: { color: DIM, fontSize: 10 }, children: "NO SCORE DATA" })), reason && (_jsx("div", { style: { marginTop: 6, color: DIM, fontSize: 10, lineHeight: 1.5, wordBreak: 'break-word' }, children: reason }))] }));
}
function MarketSection({ state, prevPrice, flash, }) {
    const price = state?.market?.assetPrice ?? null;
    const gas = state?.market?.gasGwei ?? null;
    const asset = state?.market?.asset ?? state?.policy?.goal?.asset ?? 'ETH';
    let arrow = '';
    let pctStr = '';
    let changeColor = VALUE;
    if (price != null && prevPrice != null && prevPrice !== 0) {
        const diff = price - prevPrice;
        if (Math.abs(diff) > 0.001) {
            arrow = diff > 0 ? '↑' : '↓';
            pctStr = ` ${diff > 0 ? '+' : ''}${((diff / prevPrice) * 100).toFixed(2)}%`;
            changeColor = diff > 0 ? TEAL : RED;
        }
    }
    return (_jsxs("div", { style: { ...sec.wrap, borderBottom: 'none' }, children: [_jsx("div", { style: sec.label, children: "MARKET" }), _jsxs("div", { style: sec.row, children: [_jsx("span", { style: sec.key, children: pad(asset, 7) }), _jsx("span", { style: {
                            color: flash.priceFlash ? AMBER : '#fff',
                            fontSize: 14,
                            fontWeight: 700,
                            transition: 'color 0.2s ease',
                        }, children: fmtPrice(price) }), arrow && (_jsxs("span", { style: { color: changeColor, fontSize: 10, marginLeft: 6 }, children: [arrow, pctStr] }))] }), _jsxs("div", { style: sec.row, children: [_jsx("span", { style: sec.key, children: 'GAS'.padEnd(7) }), _jsx("span", { style: { color: VALUE }, children: gas != null ? `${gas.toFixed(1)} GWEI` : '—' })] })] }));
}
function StatusBar({ state }) {
    const status = (state?.status ?? 'IDLE').toUpperCase();
    const accumulated = state?.progress?.assetAccumulated ?? 0;
    const goalAmt = state?.policy?.goal?.amount ?? 0;
    const asset = state?.policy?.goal?.asset ?? 'ETH';
    const bar = asciiBar(accumulated, goalAmt);
    const progStr = goalAmt > 0
        ? `${accumulated.toFixed(4)} / ${goalAmt.toFixed(4)} ${asset}  ${bar}`
        : '—';
    const isActive = status === 'MONITORING' || status === 'RUNNING' || status === 'EXECUTING';
    return (_jsxs("div", { style: {
            height: 48,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${GRID}`,
            padding: '0 12px',
            flexShrink: 0,
        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }, children: [isActive && (_jsx("span", { className: "blink", style: { color: AMBER, fontSize: 12 }, children: "\u2588" })), _jsx("span", { style: {
                            color: isActive ? AMBER : DIM,
                            fontSize: 13,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                        }, children: status })] }), _jsx("div", { style: { flex: 1 } }), _jsx("div", { style: { color: TEAL, fontSize: 10, fontFamily: MONO, letterSpacing: '0.02em' }, children: progStr })] }));
}
const LOG_COLS = {
    time: 10,
    pair: 14,
    size: 10,
    score: 7,
    status: 7,
};
function LogRow({ exec, isNew }) {
    const tag = statusTag(exec);
    const pair = `${exec.fromToken}/${exec.toToken}`.slice(0, LOG_COLS.pair - 1);
    const size = exec.tradeSizeUsd != null ? `$${exec.tradeSizeUsd.toFixed(2)}` : '—';
    const hash = exec.txHash ? exec.txHash.slice(0, 10) + '…' : '—';
    const chain = exec.chain ?? 'base';
    const url = chain === 'base' ? `https://basescan.org/tx/${exec.txHash}`
        : chain === 'optimism' ? `https://optimistic.etherscan.io/tx/${exec.txHash}`
            : chain === 'arbitrum' ? `https://arbiscan.io/tx/${exec.txHash}`
                : `https://etherscan.io/tx/${exec.txHash}`;
    return (_jsxs("div", { className: isNew ? 'new-row' : '', style: {
            display: 'flex',
            alignItems: 'center',
            padding: '4px 12px',
            fontSize: 11,
            fontFamily: MONO,
            borderBottom: `1px solid #0d0d0d`,
            gap: 0,
            whiteSpace: 'nowrap',
        }, children: [_jsx("span", { style: { color: LABEL, width: 76, flexShrink: 0 }, children: fmtTime(exec.timestamp) }), _jsx("span", { style: { color: GRID, flexShrink: 0 }, children: "\u2502 " }), _jsx("span", { style: { color: VALUE, width: 112, flexShrink: 0 }, children: pad(pair, LOG_COLS.pair) }), _jsx("span", { style: { color: GRID, flexShrink: 0 }, children: "\u2502 " }), _jsx("span", { style: { color: VALUE, width: 80, flexShrink: 0 }, children: pad(size, LOG_COLS.size) }), _jsx("span", { style: { color: GRID, flexShrink: 0 }, children: "\u2502 " }), _jsx("span", { style: { color: DIM, width: 56, flexShrink: 0 }, children: '—'.padEnd(LOG_COLS.score) }), _jsx("span", { style: { color: GRID, flexShrink: 0 }, children: "\u2502 " }), _jsx("span", { style: { color: tag.color, width: 56, flexShrink: 0 }, children: tag.text }), _jsx("span", { style: { color: GRID, flexShrink: 0 }, children: "\u2502 " }), exec.txHash ? (_jsx("a", { href: url, target: "_blank", rel: "noreferrer", style: {
                    color: AMBER,
                    textDecoration: 'none',
                    fontSize: 11,
                    fontFamily: MONO,
                    cursor: 'pointer',
                }, children: hash })) : (_jsx("span", { style: { color: LABEL }, children: "\u2014" }))] }));
}
function ExecutionLog({ executions }) {
    const prevLen = useRef(0);
    const newCount = executions.length - prevLen.current;
    useEffect(() => { prevLen.current = executions.length; });
    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        padding: '5px 12px',
        fontSize: 10,
        color: LABEL,
        borderBottom: `1px solid ${GRID}`,
        whiteSpace: 'nowrap',
        flexShrink: 0,
        background: '#020202',
    };
    return (_jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [_jsxs("div", { style: headerStyle, children: [_jsx("span", { style: { width: 76 }, children: 'TIME'.padEnd(10) }), _jsx("span", { style: { color: GRID }, children: "\u2502 " }), _jsx("span", { style: { width: 112 }, children: 'PAIR'.padEnd(14) }), _jsx("span", { style: { color: GRID }, children: "\u2502 " }), _jsx("span", { style: { width: 80 }, children: 'SIZE'.padEnd(10) }), _jsx("span", { style: { color: GRID }, children: "\u2502 " }), _jsx("span", { style: { width: 56 }, children: 'SCORE'.padEnd(7) }), _jsx("span", { style: { color: GRID }, children: "\u2502 " }), _jsx("span", { style: { width: 56 }, children: 'STATUS'.padEnd(7) }), _jsx("span", { style: { color: GRID }, children: "\u2502 " }), _jsx("span", { children: "TXHASH" })] }), _jsx("div", { style: { flex: 1, overflowY: 'auto' }, children: executions.length === 0 ? (_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: LABEL,
                        fontSize: 12,
                        fontFamily: MONO,
                    }, children: ["AWAITING FIRST EXECUTION", _jsx("span", { className: "blink", style: { marginLeft: 2 }, children: "_" })] })) : (executions.map((e, i) => (_jsx("div", { style: { background: i % 2 === 0 ? '#000' : '#040404' }, children: _jsx(LogRow, { exec: e, isNew: i < newCount }) }, i)))) })] }));
}
// ── Shared section styles ──────────────────────────────────────────────────
const sec = {
    wrap: {
        padding: '10px 12px',
        borderBottom: `1px solid ${GRID}`,
        flexShrink: 0,
    },
    label: {
        fontSize: 9,
        color: LABEL,
        letterSpacing: '0.12em',
        marginBottom: 8,
        fontWeight: 700,
    },
    row: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        lineHeight: 1.8,
    },
    key: {
        fontSize: 10,
        color: LABEL,
        flexShrink: 0,
        fontFamily: MONO,
    },
    val: {
        fontSize: 12,
        color: VALUE,
        fontFamily: MONO,
    },
};
// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
    const [state, setState] = useState(null);
    const [prevPrice, setPrevPrice] = useState(null);
    const [clock, setClock] = useState(() => new Date().toLocaleTimeString('en-GB', { hour12: false }));
    const [flash, setFlash] = useState({ priceFlash: false, priceUp: null });
    const [liveOn, setLiveOn] = useState(true);
    const [connErr, setConnErr] = useState(null);
    const flashTimer = useRef(null);
    // Clock
    useEffect(() => {
        const id = setInterval(() => {
            setClock(new Date().toLocaleTimeString('en-GB', { hour12: false }));
        }, 1000);
        return () => clearInterval(id);
    }, []);
    // LIVE blink
    useEffect(() => {
        const id = setInterval(() => setLiveOn(v => !v), 1000);
        return () => clearInterval(id);
    }, []);
    // Polling
    const fetchState = useCallback(async () => {
        try {
            const res = await fetch(`/api/state?t=${Date.now()}`);
            if (!res.ok)
                throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setState(prev => {
                const oldPrice = prev?.market?.assetPrice ?? null;
                const newPrice = data.market?.assetPrice ?? null;
                setPrevPrice(oldPrice);
                if (newPrice != null && oldPrice != null && oldPrice !== newPrice) {
                    setFlash({ priceFlash: true, priceUp: newPrice > oldPrice });
                    if (flashTimer.current)
                        clearTimeout(flashTimer.current);
                    flashTimer.current = setTimeout(() => setFlash({ priceFlash: false, priceUp: null }), 300);
                }
                return data;
            });
            setConnErr(null);
        }
        catch (err) {
            setConnErr(err.message);
        }
    }, []);
    useEffect(() => {
        fetchState();
        const id = setInterval(fetchState, POLL_MS);
        return () => { clearInterval(id); if (flashTimer.current)
            clearTimeout(flashTimer.current); };
    }, [fetchState]);
    const executions = state?.executions ?? [];
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
            background: '#000',
            fontFamily: MONO,
            color: VALUE,
        }, children: [_jsxs("div", { style: {
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    borderBottom: `1px solid ${GRID}`,
                    flexShrink: 0,
                    background: '#000',
                }, children: [_jsx("span", { style: { color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em' }, children: "SENTINEL // AUTONOMOUS TRADING AGENT" }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 16 }, children: [connErr && (_jsxs("span", { style: { color: RED, fontSize: 10 }, children: ["ERR: ", connErr] })), _jsx("span", { style: { color: LABEL, fontSize: 10 }, children: clock }), _jsx("span", { style: {
                                    color: liveOn ? AMBER : 'transparent',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: '0.06em',
                                }, children: "LIVE \u25CF" })] })] }), _jsxs("div", { style: { flex: 1, display: 'flex', overflow: 'hidden' }, children: [_jsx("div", { style: {
                            width: 320,
                            flexShrink: 0,
                            borderRight: `1px solid ${GRID}`,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }, children: _jsxs("div", { style: { overflowY: 'auto', flex: 1 }, children: [_jsx(PolicySection, { state: state }), _jsx(DecisionSection, { state: state }), _jsx(MarketSection, { state: state, prevPrice: prevPrice, flash: flash })] }) }), _jsxs("div", { style: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }, children: [_jsx(StatusBar, { state: state }), _jsx(ExecutionLog, { executions: executions })] })] })] }));
}
