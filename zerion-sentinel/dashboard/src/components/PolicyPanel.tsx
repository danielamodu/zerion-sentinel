import React from 'react';

interface PolicyRule {
  id: string;
  label: string;
  trigger: {
    type: string;
    token?: string;
    value: number;
    unit?: string;
  };
  action: {
    type: string;
    fromToken?: string;
    toToken?: string;
    amount?: string;
    slippage?: number;
  };
}

interface Props {
  policy: Record<string, unknown> | null;
}

export default function PolicyPanel({ policy }: Props) {
  if (!policy) {
    return (
      <section style={card}>
        <div style={sectionTitle}>
          <PolicyIcon />
          Active Policy
        </div>
        <div style={emptyState}>
          No policy loaded. Start the agent with{' '}
          <code style={code}>--policy "..."</code> to activate.
        </div>
      </section>
    );
  }

  const rules = (policy.rules as PolicyRule[]) ?? [];
  const settings = policy.settings as Record<string, unknown> | undefined;

  return (
    <section style={card}>
      <div style={sectionTitle}>
        <PolicyIcon />
        Active Policy
      </div>

      {/* Description */}
      <p style={description}>{String(policy.description ?? '')}</p>

      {/* Rules */}
      <div style={ruleList}>
        {rules.map((rule, i) => (
          <div key={rule.id} style={{ ...ruleCard, animationDelay: `${i * 60}ms` }} className="fade-in">
            <div style={ruleHeader}>
              <span style={ruleLabel}>{rule.label}</span>
              <span style={ruleId}>#{rule.id}</span>
            </div>

            <div style={ruleBody}>
              {/* Trigger */}
              <div style={condRow}>
                <span style={condKey}>Trigger</span>
                <span style={condVal}>
                  {rule.trigger.type.replace(/_/g, ' ')}
                  {rule.trigger.token ? ` ${rule.trigger.token}` : ''}{' '}
                  <strong style={{ color: 'var(--accent)' }}>
                    {rule.trigger.value}
                    {rule.trigger.unit ? ` ${rule.trigger.unit}` : ''}
                  </strong>
                </span>
              </div>

              {/* Action */}
              <div style={condRow}>
                <span style={condKey}>Action</span>
                <span style={condVal}>
                  {rule.action.type === 'swap' ? (
                    <>
                      Swap{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>
                        {rule.action.amount}
                      </strong>{' '}
                      {rule.action.fromToken} →{' '}
                      <strong style={{ color: 'var(--accent)' }}>
                        {rule.action.toToken}
                      </strong>
                    </>
                  ) : (
                    rule.action.type.toUpperCase()
                  )}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      {settings && (
        <div style={settingsRow}>
          <Tag label="Interval" value={`${settings.intervalSeconds ?? 60}s`} />
          {Boolean(settings.maxGasGwei) && (
            <Tag label="Max Gas" value={`${String(settings.maxGasGwei)} gwei`} />
          )}
          {Boolean(settings.dryRun) && <Tag label="Mode" value="DRY RUN" highlight />}
        </div>
      )}
    </section>
  );
}

function PolicyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function Tag({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span style={{
      ...tag,
      background: highlight ? 'var(--accent-dim)' : 'var(--bg-elevated)',
      color: highlight ? 'var(--accent)' : 'var(--text-secondary)',
      border: `1px solid ${highlight ? 'var(--border-accent)' : 'var(--border)'}`,
    }}>
      <span style={{ color: 'var(--text-muted)' }}>{label}: </span>
      {value}
    </span>
  );
}

const card: React.CSSProperties = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};
const sectionTitle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
};
const description: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};
const emptyState: React.CSSProperties = {
  fontSize: 13,
  color: 'var(--text-muted)',
  lineHeight: 1.6,
  padding: '20px 0',
  textAlign: 'center',
};
const code: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--accent)',
  background: 'var(--accent-dim)',
  borderRadius: 4,
  padding: '1px 5px',
};
const ruleList: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};
const ruleCard: React.CSSProperties = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 14,
  transition: 'border-color var(--transition)',
};
const ruleHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 10,
};
const ruleLabel: React.CSSProperties = {
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--text-primary)',
};
const ruleId: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-mono)',
};
const ruleBody: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};
const condRow: React.CSSProperties = {
  display: 'flex',
  gap: 10,
  fontSize: 12,
  alignItems: 'flex-start',
};
const condKey: React.CSSProperties = {
  color: 'var(--text-muted)',
  minWidth: 52,
  fontWeight: 500,
};
const condVal: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
};
const settingsRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
};
const tag: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  borderRadius: 99,
  padding: '3px 10px',
  fontFamily: 'var(--font-mono)',
};
