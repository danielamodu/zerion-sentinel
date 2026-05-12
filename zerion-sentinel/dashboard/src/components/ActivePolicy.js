import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function AssetChip({ asset }) {
    return (_jsx("span", { style: {
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
        }, children: asset }));
}
function DirectionBadge({ dir }) {
    const up = dir === 'accumulate' || dir === 'buy';
    return (_jsx("span", { style: {
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
        }, children: dir.toUpperCase() }));
}
function Row({ label, children }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '7px 0',
            borderBottom: '1px solid var(--border)',
        }, children: [_jsx("span", { style: { fontSize: 11, color: 'var(--text-secondary)' }, children: label }), _jsx("span", { style: { fontSize: 11, color: 'var(--text-primary)', fontFamily: 'var(--mono)', fontWeight: 500 }, children: children })] }));
}
function fmt(v) {
    if (v === null || v === undefined)
        return '—';
    if (typeof v === 'number')
        return v.toLocaleString('en-US');
    return String(v);
}
function SectionLabel({ children }) {
    return (_jsx("div", { style: {
            fontSize: 9,
            fontWeight: 600,
            color: '#3a3a3a',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 4,
            marginTop: 2,
            fontVariant: 'small-caps',
        }, children: children }));
}
export default function ActivePolicy({ policy }) {
    if (!policy) {
        return (_jsxs("div", { style: s.card, children: [_jsx("div", { style: s.header, children: "Active Policy" }), _jsx("div", { style: s.empty, children: "No policy loaded" })] }));
    }
    const { goal, constraints: c } = policy;
    return (_jsxs("div", { style: s.card, children: [_jsx("div", { style: s.header, children: "Active Policy" }), _jsx(SectionLabel, { children: "Goal" }), _jsxs(Row, { label: "Asset", children: [goal.amount, " ", _jsx(AssetChip, { asset: goal.asset })] }), _jsx(Row, { label: "Direction", children: _jsx(DirectionBadge, { dir: goal.direction }) }), _jsx("div", { style: s.divider }), _jsx(SectionLabel, { children: "Constraints" }), _jsxs(Row, { label: "Budget", children: ["$", fmt(c.budget_usd)] }), _jsx(Row, { label: "Max price", children: c.max_price_usd != null ? `$${fmt(c.max_price_usd)}` : '—' }), _jsx(Row, { label: "Min price", children: c.min_price_usd != null ? `$${fmt(c.min_price_usd)}` : '—' }), _jsxs(Row, { label: "Max gas", children: [fmt(c.max_gas_gwei), " gwei"] }), _jsxs(Row, { label: "Max per trade", children: ["$", fmt(c.max_per_trade_usd)] }), _jsxs(Row, { label: "Expires in", children: [fmt(c.expires_in_hours), " hrs"] }), _jsxs(Row, { label: "Min interval", children: [fmt(c.min_interval_minutes), " min"] }), _jsx(Row, { label: "Chain", children: c.chain })] }));
}
const s = {
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
