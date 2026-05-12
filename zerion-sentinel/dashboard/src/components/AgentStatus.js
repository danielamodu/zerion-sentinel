import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function statusConfig(s) {
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
const isActive = (s) => s === 'monitoring' || s === 'running' || s === 'executing';
export default function AgentStatus({ state }) {
    const status = state?.status ?? 'idle';
    const cfg = statusConfig(status);
    const reason = state?.lastDecision?.reason ?? null;
    const score = state?.lastDecision?.score ?? null;
    const threshold = state?.lastDecision?.threshold ?? null;
    const ts = state?.lastUpdated ?? null;
    const active = isActive(status);
    const scorePct = score != null && threshold != null && threshold > 0
        ? Math.min(100, (score / threshold) * 100)
        : null;
    return (_jsxs("div", { style: s.card, children: [_jsx("div", { style: s.cardHeader, children: "Agent Status" }), _jsxs("div", { style: s.indicatorWrap, children: [_jsx("div", { style: {
                            ...s.circle,
                            background: cfg.color,
                            // CSS custom props for glow-pulse keyframe
                            ['--glow-color']: cfg.glowColor,
                            animation: active ? 'glow-pulse 2s ease-in-out infinite' : 'none',
                            boxShadow: active
                                ? `0 0 0 0 ${cfg.glowColor}, 0 0 14px 4px ${cfg.glowColor}`
                                : `0 0 8px 2px ${cfg.glowColor}`,
                        } }), _jsx("div", { style: { ...s.statusLabel, color: cfg.color }, children: cfg.label })] }), scorePct !== null && (_jsxs("div", { style: s.scoreSection, children: [_jsxs("div", { style: s.scoreHeader, children: [_jsx("span", { style: s.scoreLabel, children: "DECISION SCORE" }), _jsxs("span", { style: s.scoreValue, children: [score, " / ", threshold] })] }), _jsx("div", { style: s.barTrack, children: _jsx("div", { style: {
                                ...s.barFill,
                                width: `${scorePct}%`,
                                background: scorePct >= 100 ? 'var(--accent)' : scorePct > 60 ? 'var(--warning)' : '#555',
                            } }) })] })), reason && (_jsxs("div", { style: s.reasonBlock, children: [_jsx("div", { style: s.reasonLabel, children: "LAST DECISION" }), _jsx("div", { style: s.reasonText, children: reason })] })), ts && (_jsx("div", { style: s.ts, children: new Date(ts).toLocaleString('en-GB', { hour12: false }) })), !state && _jsx("div", { style: s.empty, children: "Waiting for data\u2026" })] }));
}
const s = {
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
