# Zerion Sentinel

> **Autonomous DeFi portfolio sentinel** — parses natural language policies, monitors Pyth price feeds + EVM gas, and executes Zerion CLI swaps automatically.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  CLI (src/index.ts)                                 │
│    └─ parser.ts   ← NL policy → JSON (Anthropic)   │
│    └─ validator.ts ← validates parsed policy JSON   │
│    └─ agent.ts    ← main decision loop              │
│         ├─ feeds.ts  ← Pyth price + Etherscan gas  │
│         └─ executor.ts ← zerion swap wrapper        │
│    └─ logger.ts   ← writes state.json each loop    │
└─────────────────────────────────────────────────────┘
         │ writes
         ▼
      state.json
         │ reads (polling)
         ▼
┌─────────────────────────────────────────────────────┐
│  Dashboard (dashboard/)  React + Vite               │
│    ├─ AgentStatus.tsx  ← status + feed values       │
│    ├─ PolicyPanel.tsx  ← active rules               │
│    └─ ExecutionLog.tsx ← swap history               │
└─────────────────────────────────────────────────────┘
```

---

## Quick Start

### 1. Install dependencies

```bash
# CLI
npm install

# Dashboard
cd dashboard && npm install && cd ..
```

### 2. Set environment variables

```bash
# Required
export ANTHROPIC_API_KEY="sk-ant-..."

# Optional — increases Etherscan rate limit
export ETHERSCAN_API_KEY="your-key"
```

### 3. Run the sentinel

```bash
# Basic usage
npm start -- run --policy "If ETH drops below 3000, swap 100% of my ETH to USDC. Stop if gas exceeds 50 gwei."

# Dry-run mode (no real swaps)
npm start -- run --policy "..." --dry-run

# Single evaluation tick
npm start -- run --policy "..." --once

# Verbose feed logging
npm start -- run --policy "..." --verbose
```

### 4. Launch the dashboard

```bash
cd dashboard && npm run dev
# → http://localhost:3001
```

---

## Policy Language Examples

```
"If ETH price drops below $2,800, swap 50% ETH → USDC. Max gas 40 gwei."
"When ETH is above $4,000, swap 100 USDC back to ETH with 1% slippage."
"If gas is below 15 gwei, swap 200 USDC to ETH."
"Alert me whenever ETH drops below 3500."
```

The Anthropic Claude API parses these into structured JSON automatically.

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `run --policy "..."` | Start the agent with a natural language policy |
| `status` | Print current `state.json` to stdout |
| `reset` | Reset `state.json` to idle state |

### `run` options

| Flag | Default | Description |
|------|---------|-------------|
| `--policy <text>` | **required** | Natural language policy string |
| `--dry-run` | `false` | Simulate swaps without executing |
| `--once` | `false` | Run a single tick and exit |
| `--verbose` | `false` | Log feed values on every tick |

---

## State Schema (`state.json`)

```jsonc
{
  "status": "idle | running | paused | error",
  "policy": { /* parsed policy object */ },
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "feeds": {
    "ethPrice": 3241.50,
    "gasGwei": 22
  },
  "executions": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "action": "swap",
      "fromToken": "eth",
      "toToken": "usdc",
      "amount": "100%",
      "reason": "Rule triggered: ETH price drop",
      "status": "success",
      "txHash": "0xabc..."
    }
  ]
}
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API key for NL policy parsing |
| `ETHERSCAN_API_KEY` | Optional | Increases gas oracle rate limit |

---

## Project Structure

```
zerion-sentinel/
├── src/
│   ├── parser.ts        # NL policy → JSON via Anthropic API
│   ├── validator.ts     # validates parsed policy JSON
│   ├── feeds.ts         # Pyth price feed + EVM gas feed
│   ├── agent.ts         # main decision loop
│   ├── executor.ts      # Zerion CLI swap wrapper
│   ├── logger.ts        # writes state.json each loop
│   └── index.ts         # CLI entry: zerion-sentinel run --policy "..."
├── dashboard/
│   ├── src/
│   │   ├── App.tsx
│   │   └── components/
│   │       ├── PolicyPanel.tsx
│   │       ├── AgentStatus.tsx
│   │       └── ExecutionLog.tsx
│   └── package.json
├── state.json           # agent writes here, dashboard reads
├── package.json
└── README.md
```

---

## Zerion CLI

The executor wraps the `zerion` CLI binary. Install it via:

```bash
npm i -g zerion-cli
```

Swap command format:
```bash
zerion swap --from eth --to usdc --amount "100%" --slippage 0.50
```

---

## License

MIT
