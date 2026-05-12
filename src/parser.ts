import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genai.getGenerativeModel({ model: 'gemini-2.0-flash' });

const SYSTEM_PROMPT = `
You are a trading policy parser. Convert natural language trading goals into structured JSON.

Return ONLY valid JSON. No explanation. No markdown. No preamble.

Schema:
{
  "goal": {
    "asset": string,
    "amount": number,
    "direction": "buy" | "sell" | "accumulate"
  },
  "constraints": {
    "budget_usd": number,
    "max_price_usd": number | null,
    "min_price_usd": number | null,
    "max_gas_gwei": number,
    "max_per_trade_usd": number,
    "expires_in_hours": number,
    "min_interval_minutes": number
  }
}

If input is ambiguous or missing critical fields (asset, amount, budget),
return: { "error": "missing: [field names]" }

Examples:
Input: "accumulate 0.5 ETH, max $1800, never above $3400, done in 5 days"
Output: {"goal":{"asset":"ETH","amount":0.5,"direction":"accumulate"},"constraints":{"budget_usd":1800,"max_price_usd":3400,"min_price_usd":null,"max_gas_gwei":30,"max_per_trade_usd":360,"expires_in_hours":120,"min_interval_minutes":30}}
`;

export async function parsePolicy(input: string) {
  const prompt = SYSTEM_PROMPT + "\n\nInput: " + input;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

  try {
    const parsed = JSON.parse(clean);
    if (parsed.error) throw new Error(parsed.error);
    return parsed;
  } catch {
    throw new Error(`Parser failed: ${clean}`);
  }
}