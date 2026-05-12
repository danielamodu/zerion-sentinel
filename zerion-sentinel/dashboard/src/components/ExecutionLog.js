import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const STATUS_DOT = {
    success: 'var(--success)',
    failed: 'var(--danger)',
    pending: 'var(--warning)',
};
function fmtTime(ts) {
    try {
        return new Date(ts).toLocaleTimeString('en-GB', { hour12: false });
    }
    catch {
        return ts;
    }
}
function etherscanUrl(hash, chain) {
    if (chain === 'base')
        return `https://basescan.org/tx/${hash}`;
    if (chain === 'optimism')
        return `https://optimistic.etherscan.io/tx/${hash}`;
    if (chain === 'arbitrum')
        return `https://arbiscan.io/tx/${hash}`;
    return `https://etherscan.io/tx/${hash}`;
}
export default function ExecutionLog({ executions }) {
    return (_jsxs("div", { style: s.card, children: [_jsxs("div", { style: s.header, children: [_jsx("span", { children: "Execution Log" }), _jsx("span", { style: s.badge, children: executions.length })] }), _jsx("div", { style: s.tableWrap, children: executions.length === 0 ? (_jsx("div", { style: s.empty, children: "No executions yet" })) : (_jsxs("table", { style: s.table, children: [_jsx("thead", { children: _jsx("tr", { children: ['Time', 'Size (USD)', 'Reason', 'St.', 'TxHash'].map((h) => (_jsx("th", { style: s.th, children: h }, h))) }) }), _jsx("tbody", { children: executions.map((e, i) => (_jsxs("tr", { style: {
                                    ...s.tr,
                                    background: i % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                                }, children: [_jsx("td", { style: { ...s.td, ...s.mono, color: '#555', whiteSpace: 'nowrap' }, children: fmtTime(e.timestamp) }), _jsx("td", { style: { ...s.td, ...s.mono }, children: e.tradeSizeUsd != null ? `$${e.tradeSizeUsd.toFixed(2)}` : '—' }), _jsx("td", { style: { ...s.td, color: 'var(--text-secondary)', maxWidth: 160 }, children: _jsx("span", { style: s.clamp, children: e.reason }) }), _jsx("td", { style: { ...s.td, textAlign: 'center' }, children: _jsx("span", { title: e.status, style: {
                                                display: 'inline-block',
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                background: STATUS_DOT[e.status] ?? '#555',
                                            } }) }), _jsx("td", { style: { ...s.td, ...s.mono }, children: e.txHash ? (_jsxs("a", { href: etherscanUrl(e.txHash, e.chain), target: "_blank", rel: "noreferrer", style: s.txLink, title: e.txHash, children: [e.txHash.slice(0, 10), "\u2026"] })) : (_jsx("span", { style: { color: '#333' }, children: "\u2014" })) })] }, i))) })] })) })] }));
}
const s = {
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
        position: 'sticky',
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
        WebkitBoxOrient: 'vertical',
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
