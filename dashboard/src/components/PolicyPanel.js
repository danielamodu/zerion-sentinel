import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export default function PolicyPanel({ policy }) {
    if (!policy) {
        return (_jsxs("section", { style: card, children: [_jsxs("div", { style: sectionTitle, children: [_jsx(PolicyIcon, {}), "Active Policy"] }), _jsxs("div", { style: emptyState, children: ["No policy loaded. Start the agent with", ' ', _jsx("code", { style: code, children: "--policy \"...\"" }), " to activate."] })] }));
    }
    const rules = policy.rules ?? [];
    const settings = policy.settings;
    return (_jsxs("section", { style: card, children: [_jsxs("div", { style: sectionTitle, children: [_jsx(PolicyIcon, {}), "Active Policy"] }), _jsx("p", { style: description, children: String(policy.description ?? '') }), _jsx("div", { style: ruleList, children: rules.map((rule, i) => (_jsxs("div", { style: { ...ruleCard, animationDelay: `${i * 60}ms` }, className: "fade-in", children: [_jsxs("div", { style: ruleHeader, children: [_jsx("span", { style: ruleLabel, children: rule.label }), _jsxs("span", { style: ruleId, children: ["#", rule.id] })] }), _jsxs("div", { style: ruleBody, children: [_jsxs("div", { style: condRow, children: [_jsx("span", { style: condKey, children: "Trigger" }), _jsxs("span", { style: condVal, children: [rule.trigger.type.replace(/_/g, ' '), rule.trigger.token ? ` ${rule.trigger.token}` : '', ' ', _jsxs("strong", { style: { color: 'var(--accent)' }, children: [rule.trigger.value, rule.trigger.unit ? ` ${rule.trigger.unit}` : ''] })] })] }), _jsxs("div", { style: condRow, children: [_jsx("span", { style: condKey, children: "Action" }), _jsx("span", { style: condVal, children: rule.action.type === 'swap' ? (_jsxs(_Fragment, { children: ["Swap", ' ', _jsx("strong", { style: { color: 'var(--text-primary)' }, children: rule.action.amount }), ' ', rule.action.fromToken, " \u2192", ' ', _jsx("strong", { style: { color: 'var(--accent)' }, children: rule.action.toToken })] })) : (rule.action.type.toUpperCase()) })] })] })] }, rule.id))) }), settings && (_jsxs("div", { style: settingsRow, children: [_jsx(Tag, { label: "Interval", value: `${settings.intervalSeconds ?? 60}s` }), Boolean(settings.maxGasGwei) && (_jsx(Tag, { label: "Max Gas", value: `${String(settings.maxGasGwei)} gwei` })), Boolean(settings.dryRun) && _jsx(Tag, { label: "Mode", value: "DRY RUN", highlight: true })] }))] }));
}
function PolicyIcon() {
    return (_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { color: 'var(--accent)' }, children: [_jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }), _jsx("polyline", { points: "14 2 14 8 20 8" }), _jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }), _jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" }), _jsx("polyline", { points: "10 9 9 9 8 9" })] }));
}
function Tag({ label, value, highlight }) {
    return (_jsxs("span", { style: {
            ...tag,
            background: highlight ? 'var(--accent-dim)' : 'var(--bg-elevated)',
            color: highlight ? 'var(--accent)' : 'var(--text-secondary)',
            border: `1px solid ${highlight ? 'var(--border-accent)' : 'var(--border)'}`,
        }, children: [_jsxs("span", { style: { color: 'var(--text-muted)' }, children: [label, ": "] }), value] }));
}
const card = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};
const sectionTitle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
};
const description = {
    fontSize: 14,
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
};
const emptyState = {
    fontSize: 13,
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    padding: '20px 0',
    textAlign: 'center',
};
const code = {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
    borderRadius: 4,
    padding: '1px 5px',
};
const ruleList = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
};
const ruleCard = {
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 14,
    transition: 'border-color var(--transition)',
};
const ruleHeader = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
};
const ruleLabel = {
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--text-primary)',
};
const ruleId = {
    fontSize: 11,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
};
const ruleBody = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
};
const condRow = {
    display: 'flex',
    gap: 10,
    fontSize: 12,
    alignItems: 'flex-start',
};
const condKey = {
    color: 'var(--text-muted)',
    minWidth: 52,
    fontWeight: 500,
};
const condVal = {
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
};
const settingsRow = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
};
const tag = {
    fontSize: 11,
    fontWeight: 500,
    borderRadius: 99,
    padding: '3px 10px',
    fontFamily: 'var(--font-mono)',
};
