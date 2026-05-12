import axios from 'axios';
import { log } from './logger.js';

// ---------------------------------------------------------------------------
// Pyth Network price feed
// ---------------------------------------------------------------------------

const PYTH_PRICE_FEEDS: Record<string, string> = {
  ETH: 'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BTC: 'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  SOL: 'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  USDC: 'eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
};

const PYTH_API_BASE = 'https://hermes.pyth.network/v2/updates/price/latest';

interface PythPriceItem {
  id: string;
  price: {
    price: string;
    expo: number;
    publish_time: number;
  };
}

export async function fetchTokenPrice(symbol: string): Promise<number> {
  const feedId = PYTH_PRICE_FEEDS[symbol.toUpperCase()];
  if (!feedId) throw new Error(`No Pyth feed ID configured for: ${symbol}`);

  const response = await axios.get<{ parsed: PythPriceItem[] }>(PYTH_API_BASE, {
    params: { ids: [feedId] },
    timeout: 8_000,
  });

  const item = response.data.parsed?.[0];
  if (!item) throw new Error(`No price data returned for ${symbol}`);

  const price = Number(item.price.price) * Math.pow(10, item.price.expo);
  log('INFO', `Pyth price for ${symbol}: $${price.toFixed(4)}`);
  return price;
}

// ---------------------------------------------------------------------------
// Gas feed via mempool.space (no API key, no rate limits)
// ---------------------------------------------------------------------------

const MEMPOOL_GAS_URL = 'https://mempool.space/api/v1/fees/recommended';

interface MempoolFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export async function fetchGasPrice(): Promise<number> {
  const response = await axios.get<MempoolFees>(MEMPOOL_GAS_URL, {
    timeout: 8_000,
  });

  const gwei = response.data.halfHourFee;
  log('INFO', `Gas price: ${gwei} gwei`);
  return gwei;
}

// ---------------------------------------------------------------------------
// Combined feed snapshot
// ---------------------------------------------------------------------------

export interface FeedSnapshot {
  assetPrice: number | null;
  gasGwei: number | null;
  asset: string;
  timestamp: string;
}

export async function fetchFeeds(asset: string = 'ETH'): Promise<FeedSnapshot> {
  const [priceResult, gasResult] = await Promise.allSettled([
    fetchTokenPrice(asset),
    fetchGasPrice(),
  ]);

  if (priceResult.status === 'rejected') {
    log('WARN', `Price feed failed: ${(priceResult.reason as Error).message}`);
  }
  if (gasResult.status === 'rejected') {
    log('WARN', `Gas feed failed: ${(gasResult.reason as Error).message}`);
  }

  return {
    asset,
    assetPrice: priceResult.status === 'fulfilled' ? priceResult.value : null,
    gasGwei: gasResult.status === 'fulfilled' ? gasResult.value : null,
    timestamp: new Date().toISOString(),
  };
}