import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_PATH = path.resolve(__dirname, 'state.json');
const DIST_PATH = path.resolve(__dirname, 'dashboard/dist');

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------
// GET /api/state — read and return state.json
// ---------------------------------------------------------------------------
app.get('/api/state', (_req, res) => {
  try {
    const raw = fs.readFileSync(STATE_PATH, 'utf-8');
    const state = JSON.parse(raw);
    res.json(state);
  } catch (err) {
    // Return a safe default if state.json doesn't exist yet
    res.json({
      status: 'idle',
      policy: null,
      market: { assetPrice: null, gasGwei: null, asset: 'ETH' },
      progress: { assetAccumulated: 0, spentUsd: 0, hoursElapsed: 0 },
      lastDecision: null,
      executions: [],
      lastUpdated: null,
    });
  }
});

// ---------------------------------------------------------------------------
// Serve dashboard/dist as static files (production)
// ---------------------------------------------------------------------------
if (fs.existsSync(DIST_PATH)) {
  app.use(express.static(DIST_PATH));
  app.get('/{*path}', (_req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => {
    res.send('<pre>Run: cd dashboard && npm run build\nThen restart this server.</pre>');
  });
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
const PORT = Number(process.env.PORT ?? 3000);
app.listen(PORT, () => {
  console.log(`\x1b[36m[dashboard-server]\x1b[0m Listening on http://localhost:${PORT}`);
  console.log(`\x1b[36m[dashboard-server]\x1b[0m State file: ${STATE_PATH}`);
});
