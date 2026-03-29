import { Router, Request, Response } from "express";
import { analyzeSentiment } from "../services/sentiment.service.js";

const router = Router();

const SUPPORTED_TOKENS = ["ETH", "BTC", "SOL"];

// GET /api/sentiment — analyze all tokens
router.get("/", async (_req: Request, res: Response) => {
  console.log("[Backend] Analyzing sentiment for all tokens...");
  try {
    const results = await Promise.all(
      SUPPORTED_TOKENS.map((sym) => analyzeSentiment(sym).catch(e => {
        console.error(`Error analyzing ${sym}:`, e);
        throw e;
      }))
    );
    res.json({ success: true, data: results });
  } catch (err: any) {
    console.error("[Backend] Sentiment Analysis Global Error:", err);
    res.status(500).json({ success: false, error: err.message || "Unknown Error" });
  }
});

// GET /api/sentiment/:symbol — analyze one token
router.get("/:symbol", async (req: Request, res: Response) => {
  const symbol = req.params.symbol.toUpperCase();
  if (!SUPPORTED_TOKENS.includes(symbol)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported token. Supported: ${SUPPORTED_TOKENS.join(", ")}`,
    });
  }
  try {
    const result = await analyzeSentiment(symbol);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
