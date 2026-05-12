import { fetchFeeds } from './feeds.js';
import { executeSwap } from './executor.js';
import { logDecision, writeState } from './logger.js';

const SCORE_THRESHOLD = 35;
const URGENCY_CRITICAL = 80;
const POLL_INTERVAL_MS = 60_000;

// --- scoring functions (keep these) ---
function scorePrice(currentPrice: number, maxPrice: number): number {
  const headroom = (maxPrice - currentPrice) / maxPrice;
  return Math.min(headroom * 200, 40);
}

function scoreUrgency(hoursElapsed: number, totalHours: number, goalFilled: number, goalTotal: number): number {
  const timePressure = hoursElapsed / totalHours;
  const goalGap = 1 - (goalFilled / goalTotal);
  return Math.min(timePressure * goalGap * 100, 100);
}

function calcTradeSize(budgetRemaining: number, maxPerTrade: number, urgencyScore: number): number {
  const urgencyMultiplier = 0.2 + (urgencyScore / 100) * 0.8;
  return Math.min(maxPerTrade * urgencyMultiplier, budgetRemaining);
}

// --- decision engine ---
interface Decision {
  execute: boolean;
  tradeSizeUsd?: number;
  reason: string;
}

function evaluate(policy: any, market: any, progress: any): Decision {
  if (!market.assetPrice || !market.gasGwei)
    return { execute: false, reason: 'feed data unavailable' };

  if (market.assetPrice > (policy.constraints.max_price_usd ?? Infinity))
    return { execute: false, reason: `price $${market.assetPrice.toFixed(2)} above ceiling $${policy.constraints.max_price_usd}` };

  if (market.gasGwei > policy.constraints.max_gas_gwei)
    return { execute: false, reason: `gas ${market.gasGwei} gwei > ${policy.constraints.max_gas_gwei} limit` };

  if (progress.spentUsd >= policy.constraints.budget_usd)
    return { execute: false, reason: 'budget exhausted' };

  if (progress.minutesSinceLastTrade < policy.constraints.min_interval_minutes)
    return { execute: false, reason: `cooldown: ${policy.constraints.min_interval_minutes - progress.minutesSinceLastTrade}min remaining` };

  if (progress.assetAccumulated >= policy.goal.amount)
    return { execute: false, reason: 'goal complete' };

  const priceScore = scorePrice(market.assetPrice, policy.constraints.max_price_usd ?? market.assetPrice * 1.2);
  const urgencyScore = scoreUrgency(
    progress.hoursElapsed,
    policy.constraints.expires_in_hours,
    progress.assetAccumulated,
    policy.goal.amount
  );
  const totalScore = priceScore + urgencyScore;

  if (urgencyScore >= URGENCY_CRITICAL || totalScore >= SCORE_THRESHOLD) {
    const tradeSize = calcTradeSize(
      policy.constraints.budget_usd - progress.spentUsd,
      policy.constraints.max_per_trade_usd,
      urgencyScore
    );
    return { execute: true, tradeSizeUsd: tradeSize, reason: `score ${totalScore.toFixed(0)} cleared threshold` };
  }

  return { execute: false, reason: `score ${totalScore.toFixed(0)} below threshold ${SCORE_THRESHOLD}` };
}

// --- main loop ---
export async function runAgent(policy: any, dryRun = false) {
  const startTime = Date.now();

  const progress = {
    assetAccumulated: 0,
    spentUsd: 0,
    hoursElapsed: 0,
    minutesSinceLastTrade: policy.constraints.min_interval_minutes, // allow immediate first trade
    tradeCount: 0,
  };

  console.log(`\n🟢 Sentinel started`);
  console.log(`Goal: ${policy.goal.direction} ${policy.goal.amount} ${policy.goal.asset}`);
  console.log(`Budget: $${policy.constraints.budget_usd} | Expires in: ${policy.constraints.expires_in_hours}h`);
  console.log(`Dry run: ${dryRun}\n`);

  while (true) {
    progress.hoursElapsed = (Date.now() - startTime) / 1000 / 3600;
    const hoursRemaining = policy.constraints.expires_in_hours - progress.hoursElapsed;

    // expiry check
    if (hoursRemaining <= 0) {
      console.log('⏰ Policy expired. Shutting down.');
      writeState({ status: 'EXPIRED', progress, policy });
      break;
    }

    // goal complete check
    if (progress.assetAccumulated >= policy.goal.amount) {
      console.log('✅ Goal complete. Shutting down.');
      writeState({ status: 'COMPLETE', progress, policy });
      break;
    }

    // fetch market data
    const market = await fetchFeeds(policy.goal.asset);

    // evaluate decision
    const decision = evaluate(policy, market, progress);

    // update state for dashboard
    writeState({
      status: decision.execute ? 'EXECUTING' : 'MONITORING',
      progress,
      market,
      lastDecision: decision,
      policy,
    });

    if (decision.execute && decision.tradeSizeUsd) {
      const execution = await executeSwap(
        decision.tradeSizeUsd,
        'USDC',
        policy.goal.asset,
        policy.constraints.chain ?? 'base',
        decision.reason,
        dryRun,
      );

      if (execution.status === 'success') {
        progress.spentUsd += decision.tradeSizeUsd;
        progress.assetAccumulated += decision.tradeSizeUsd / market.assetPrice!;
        progress.tradeCount += 1;
        progress.minutesSinceLastTrade = 0;
      }
    } else {
      progress.minutesSinceLastTrade += POLL_INTERVAL_MS / 60_000;
    }

    logDecision({ decision, market, progress, timestamp: new Date().toISOString() });
    console.log(`[${new Date().toISOString()}] ${decision.execute ? '🔄 EXECUTE' : '⏳ SKIP'} — ${decision.reason}`);

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
}