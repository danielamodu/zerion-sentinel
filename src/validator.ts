export interface Policy {
  goal: {
    asset: string;
    amount: number;
    direction: 'buy' | 'sell' | 'accumulate';
  };
  constraints: {
    budget_usd: number;
    max_price_usd: number | null;
    min_price_usd: number | null;
    max_gas_gwei: number;
    max_per_trade_usd: number;
    expires_in_hours: number;
    min_interval_minutes: number;
    chain: string;
  };
}

type ValidationResult =
  | { valid: true; policy: Policy }
  | { valid: false; errors: string[] };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function isPositiveNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v > 0;
}

function isNumberOrNull(v: unknown): v is number | null {
  return v === null || (typeof v === 'number' && isFinite(v));
}

export function validatePolicy(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(raw)) {
    return { valid: false, errors: ['Policy must be a JSON object.'] };
  }

  // ── goal ──────────────────────────────────────────────────────────────────
  if (!isObject(raw.goal)) {
    errors.push('goal must be an object.');
  }

  const goal = isObject(raw.goal) ? raw.goal : {};

  // goal.asset
  if (typeof goal.asset !== 'string' || goal.asset.trim() === '') {
    errors.push('goal.asset must be a non-empty string.');
  }

  // goal.amount
  if (!isPositiveNumber(goal.amount)) {
    errors.push('goal.amount must be a positive number.');
  }

  // goal.direction
  const validDirections = ['buy', 'sell', 'accumulate'] as const;
  if (!validDirections.includes(goal.direction as typeof validDirections[number])) {
    errors.push(`goal.direction must be one of: ${validDirections.join(', ')}.`);
  }

  // ── constraints ───────────────────────────────────────────────────────────
  if (!isObject(raw.constraints)) {
    errors.push('constraints must be an object.');
  }

  const c = isObject(raw.constraints) ? raw.constraints : {};

  // constraints.budget_usd (required, positive)
  if (!isPositiveNumber(c.budget_usd)) {
    errors.push('constraints.budget_usd must be a positive number.');
  }

  // constraints.max_price_usd (optional, number or null)
  const maxPriceRaw = 'max_price_usd' in c ? c.max_price_usd : null;
  if (!isNumberOrNull(maxPriceRaw)) {
    errors.push('constraints.max_price_usd must be a number or null.');
  }

  // constraints.min_price_usd (optional, number or null)
  const minPriceRaw = 'min_price_usd' in c ? c.min_price_usd : null;
  if (!isNumberOrNull(minPriceRaw)) {
    errors.push('constraints.min_price_usd must be a number or null.');
  }

  // Early-exit if there are errors so we don't build a partial policy
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // ── Apply defaults for optional fields ────────────────────────────────────
  const budget_usd = c.budget_usd as number;

  const max_gas_gwei =
    isPositiveNumber(c.max_gas_gwei) ? c.max_gas_gwei : 30;

  const max_per_trade_usd =
    isPositiveNumber(c.max_per_trade_usd) ? c.max_per_trade_usd : budget_usd / 5;

  const expires_in_hours =
    isPositiveNumber(c.expires_in_hours) ? c.expires_in_hours : 24;

  const min_interval_minutes =
    isPositiveNumber(c.min_interval_minutes) ? c.min_interval_minutes : 30;

  const chain =
    typeof c.chain === 'string' && c.chain.trim() !== '' ? c.chain.trim() : 'base';

  // ── Build the validated policy ────────────────────────────────────────────
  const policy: Policy = {
    goal: {
      asset: (goal.asset as string).trim().toUpperCase(),
      amount: goal.amount as number,
      direction: goal.direction as Policy['goal']['direction'],
    },
    constraints: {
      budget_usd,
      max_price_usd: maxPriceRaw as number | null,
      min_price_usd: minPriceRaw as number | null,
      max_gas_gwei,
      max_per_trade_usd,
      expires_in_hours,
      min_interval_minutes,
      chain,
    },
  };

  return { valid: true, policy };
}
