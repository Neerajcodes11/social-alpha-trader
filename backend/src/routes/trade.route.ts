import { Router, Request, Response } from "express";
import { executeStarkZapTrade, TradeRequest } from "../services/starkzap.service.js";

const router = Router();

// POST /api/trade — execute a StarkZap trade
router.post("/", async (req: Request, res: Response) => {
  const { symbol, amountUsd, tradeType, recipientAddress } = req.body as TradeRequest;

  if (!symbol || !amountUsd || !tradeType) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: symbol, amountUsd, tradeType",
    });
  }

  if (!["buy", "sell"].includes(tradeType)) {
    return res.status(400).json({
      success: false,
      error: "tradeType must be 'buy' or 'sell'",
    });
  }

  if (amountUsd < 1 || amountUsd > 10000) {
    return res.status(400).json({
      success: false,
      error: "amountUsd must be between 1 and 10000",
    });
  }

  try {
    const result = await executeStarkZapTrade({
      symbol: symbol.toUpperCase(),
      amountUsd,
      tradeType,
      recipientAddress,
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
