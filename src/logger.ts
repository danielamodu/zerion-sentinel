import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.resolve(__dirname, '../state.json');

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
  raw?: unknown;
}

export interface AgentState {
  status: string;
  policy: Record<string, unknown> | null;
  lastUpdated: string | null;
  feeds: {
    assetPrice: number | null;
    gasGwei: number | null;
  };
  executions: Execution[];
  decisions?: unknown[];
}

/**
 * Read the current state from disk.
 */
export function readState(): AgentState {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    return JSON.parse(raw) as AgentState;
  } catch {
    return {
      status: 'idle',
      policy: null,
      lastUpdated: null,
      feeds: { assetPrice: null, gasGwei: null },
      executions: [],
    };
  }
}

/**
 * Merge a partial update into the current state and flush to disk.
 */
export function writeState(patch: Partial<AgentState>): AgentState {
  const current = readState();
  const next: AgentState = {
    ...current,
    ...patch,
    feeds: { ...current.feeds, ...(patch.feeds ?? {}) },
    executions: patch.executions ?? current.executions,
    lastUpdated: new Date().toISOString(),
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

/**
 * Append a single execution record to state.
 */
export function logExecution(exec: Execution): void {
  const state = readState();
  const executions = [exec, ...state.executions].slice(0, 100); // keep last 100
  writeState({ executions });
}

/**
 * Pretty-print a timestamped log line to stdout.
 */
export function log(level: 'INFO' | 'WARN' | 'ERROR', message: string): void {
  const ts = new Date().toISOString();
  const prefix =
    level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${prefix}[${ts}] [${level}]\x1b[0m ${message}`);
}

/**
 * Prepend a decision log entry to state (capped at 200).
 */
export function logDecision(entry: {
  decision: { execute: boolean; reason: string; tradeSizeUsd?: number };
  market: { assetPrice: number | null; gasGwei: number | null; asset: string };
  progress: { assetAccumulated: number; spentUsd: number; hoursElapsed: number };
  timestamp: string;
}): void {
  const state = readState();
  const decisions = (state as any).decisions ?? [];
  decisions.unshift(entry);
  writeState({ ...state, decisions: decisions.slice(0, 200) } as any);
}
