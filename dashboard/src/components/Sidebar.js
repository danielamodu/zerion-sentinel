import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'policy', label: 'Policy' },
    { id: 'log', label: 'Log' },
];
const isLiveStatus = (s) => s === 'running' || s === 'monitoring' || s === 'executing';
export default function Sidebar({ page, onNav, status }) {
    const live = isLiveStatus(status);
    return (_jsxs("aside", { style: s.sidebar, children: [_jsxs("div", { style: s.brand, children: [_jsx("div", { style: s.brandTitle, children: "SENTINEL" }), _jsx("div", { style: s.brandTitleUnderline }), _jsx("div", { style: s.brandSub, children: "by 0xkenpacchi" })] }), _jsx("nav", { style: s.nav, children: navItems.map(({ id, label }) => {
                    const active = page === id;
                    return (_jsxs("button", { onClick: () => onNav(id), style: {
                            ...s.navItem,
                            ...(active ? s.navItemActive : {}),
                        }, children: [_jsx("span", { style: {
                                    ...s.indicator,
                                    background: active ? 'var(--accent)' : 'transparent',
                                } }), _jsx("span", { style: { color: active ? 'var(--accent)' : 'var(--text-secondary)' }, children: label })] }, id));
                }) }), _jsx("div", { style: s.footer, children: _jsxs("div", { style: s.liveRow, children: [_jsx("span", { style: {
                                ...s.dot,
                                background: live ? 'var(--accent)' : '#2a2a2a',
                                animation: live ? 'pulse 1.8s ease-in-out infinite' : 'none',
                                boxShadow: live ? '0 0 6px rgba(0,200,150,0.6)' : 'none',
                            } }), _jsx("span", { style: {
                                ...s.liveLabel,
                                color: live ? 'var(--accent)' : '#2a2a2a',
                            }, children: live ? 'LIVE' : 'IDLE' })] }) })] }));
}
const s = {
    sidebar: {
        width: 220,
        minWidth: 220,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'hidden',
    },
    brand: {
        padding: '20px 18px 16px',
        borderBottom: '1px solid var(--border)',
    },
    brandTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--accent)',
        letterSpacing: '0.18em',
        fontFamily: 'var(--mono)',
        marginBottom: 6,
    },
    brandTitleUnderline: {
        height: 1,
        background: 'var(--accent)',
        opacity: 0.4,
        marginBottom: 8,
    },
    brandSub: {
        fontSize: 10,
        color: '#3a3a3a',
        fontFamily: 'var(--mono)',
    },
    nav: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 0',
        gap: 1,
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'var(--font)',
        padding: '9px 16px',
        textAlign: 'left',
        width: '100%',
        transition: 'background var(--transition)',
        borderRadius: 0,
    },
    navItemActive: {
        background: 'rgba(0,200,150,0.06)',
    },
    indicator: {
        width: 2,
        height: 14,
        borderRadius: 1,
        flexShrink: 0,
        transition: 'background var(--transition)',
    },
    footer: {
        padding: '14px 18px',
        borderTop: '1px solid var(--border)',
    },
    liveRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        flexShrink: 0,
        transition: 'background 0.3s ease, box-shadow 0.3s ease',
    },
    liveLabel: {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.12em',
        fontFamily: 'var(--mono)',
        transition: 'color 0.3s ease',
    },
};
