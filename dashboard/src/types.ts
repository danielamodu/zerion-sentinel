export interface Execution {
  timestamp: string;
  action: string;
  fromToken: string;
  toToken: string;
  tradeSizeUsd: number;
  chain: string;
  reason: string;
  status: 'pending' | 'success' | 'failed';
  txHash?: string;
  error?: string;
}

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

export interface AgentState {
  status: string;
  policy: Policy | null;
  market?: {
    assetPrice: number | null;
    gasGwei: number | null;
    asset: string;
  };
  progress?: {
    assetAccumulated: number;
    spentUsd: number;
    hoursElapsed: number;
  };
  lastDecision?: {
    execute: boolean;
    reason: string;
    tradeSizeUsd?: number;
    score?: number;
    threshold?: number;
  };
  executions: Execution[];
  lastUpdated: string | null;
}
