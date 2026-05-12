#!/usr/bin/env tsx
import 'dotenv/config';
import { Command } from 'commander';
import { parsePolicy } from './parser.js';
import { validatePolicy } from './validator.js';
import { runAgent } from './agent.js';
import { log, writeState } from './logger.js';

const program = new Command();

program
  .name('zerion-sentinel')
  .description('Autonomous DeFi portfolio sentinel — watches price/gas feeds and executes Zerion swaps based on natural language policies.')
  .version('1.0.0');

// ---------------------------------------------------------------------------
// zerion-sentinel run --policy "..."
// ---------------------------------------------------------------------------
program
  .command('run')
  .description('Parse a natural language policy and start the agent loop')
  .option('-p, --policy <text>', 'Natural language policy string (wrap in quotes)')
  .option('--dry-run', 'Simulate actions without executing real swaps', false)
  .option('--json <raw>', 'Skip NL parsing, use raw JSON policy string directly')
  .action(async (opts: { policy?: string; dryRun: boolean; json?: string }) => {
    log('INFO', '═══════════════════════════════════════════');
    log('INFO', '  Zerion Sentinel starting…');
    log('INFO', '═══════════════════════════════════════════');

    if (!process.env.GEMINI_API_KEY) {
      log('ERROR', 'GEMINI_API_KEY environment variable is not set.');
      process.exit(1);
    }

    if (!process.env.ZERION_API_KEY) {
      log('ERROR', 'ZERION_API_KEY environment variable is not set.');
      process.exit(1);
    }

    // 0. Raw JSON shortcut — skip parsing and validation entirely
    if (opts.json) {
      try {
        const policy = JSON.parse(opts.json);
        await runAgent(policy, opts.dryRun);
      } catch (err) {
        log('ERROR', `Invalid JSON policy: ${(err as Error).message}`);
        process.exit(1);
      }
      return;
    }

    if (!opts.policy) {
      log('ERROR', 'Either --policy or --json must be provided.');
      process.exit(1);
    }

    // 1. Parse NL policy → JSON
    let rawPolicy: Record<string, unknown>;
    try {
      rawPolicy = await parsePolicy(opts.policy);
    } catch (err) {
      log('ERROR', `Policy parsing failed: ${(err as Error).message}`);
      writeState({ status: 'error' });
      process.exit(1);
    }

    // 2. Validate
    const result = validatePolicy(rawPolicy);
    if (!result.valid) {
      log('ERROR', `Invalid policy:\n  ${result.errors.join('\n  ')}`);
      writeState({ status: 'error' });
      process.exit(1);
    }

    const policy = result.policy;

    log('INFO', 'Policy parsed OK');

    // 3. Run
    await runAgent(policy, opts.dryRun);
  });

// ---------------------------------------------------------------------------
// zerion-sentinel status
// ---------------------------------------------------------------------------
program
  .command('status')
  .description('Print the current agent state from state.json')
  .action(async () => {
    const { readState } = await import('./logger.js');
    const state = readState();
    console.log(JSON.stringify(state, null, 2));
  });

// ---------------------------------------------------------------------------
// zerion-sentinel reset
// ---------------------------------------------------------------------------
program
  .command('reset')
  .description('Reset state.json to idle')
  .action(() => {
    writeState({
      status: 'idle',
      policy: null,
      feeds: { assetPrice: null, gasGwei: null },
      executions: [],
    });
    log('INFO', 'State reset to idle.');
  });

program.parse(process.argv);
