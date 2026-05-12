import { exec } from 'child_process';
import { promisify } from 'util';
import { log, logExecution, type Execution } from './logger.js';

const execAsync = promisify(exec);

const DEFAULT_CHAIN = process.env.ZERION_DEFAULT_CHAIN ?? 'base';

export async function executeSwap(
  tradeSizeUsd: number,
  fromToken: string,
  toToken: string,
  chain: string = DEFAULT_CHAIN,
  reason: string,
  dryRun = false,
): Promise<Execution> {
  const from = fromToken.toUpperCase();
  const to = toToken.toUpperCase();
  const cmd = `zerion swap ${chain} ${tradeSizeUsd} ${from} ${to} --json`;

  const execution: Execution = {
    timestamp: new Date().toISOString(),
    action: 'swap',
    fromToken: from,
    toToken: to,
    tradeSizeUsd,
    chain,
    reason,
    status: 'pending',
  };

  if (dryRun) {
    log('WARN', `[DRY RUN] Would execute: ${cmd}`);
    execution.status = 'success';
    execution.txHash = 'dry-run-no-tx';
    logExecution(execution);
    return execution;
  }

  log('INFO', `Executing: ${cmd}`);

  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: 60_000 });

    if (stderr) log('WARN', `Zerion stderr: ${stderr}`);

    const result = JSON.parse(stdout);
    const txHash = result?.txHash ?? result?.hash ?? result?.transactionHash;

    execution.txHash = txHash;
    execution.status = 'success';
    execution.raw = result;

    log('INFO', `Swap success. tx: ${txHash}`);
  } catch (err) {
    const errMsg = (err as Error).message;
    log('ERROR', `Swap failed: ${errMsg}`);
    execution.status = 'failed';
    execution.error = errMsg;
  }

  logExecution(execution);
  return execution;
}