import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";
import sentimentRouter from "./routes/sentiment.route.js";
import tradeRouter from "./routes/trade.route.js";
import authRouter from "./routes/auth.route.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import { apiRateLimiter } from "./middleware/rate-limit.middleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

// [SECURITY] Add Helmet for basic security headers
app.use(helmet());

// [SECURITY] CORS - allowing all for local development & diagnosis
app.use(cors({ origin: "*" }));
app.use(express.json());

// Request logging for diagnostics
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// [SECURITY] Apply general rate limiting to all requests
app.use(apiRateLimiter);

// Routes
app.use("/api/auth", authRouter);
app.use("/api/sentiment", sentimentRouter);

// Trade route — open for demo (no auth required)
app.use("/api/trade", tradeRouter);

app.get("/api/health", (_req, res) => {
  const rawKey = process.env.GROQ_API_KEY;
  const isGroqConfigured = !!rawKey && !rawKey.startsWith("your_") && !rawKey.includes("YOUR_");
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    groq: isGroqConfigured,
    starknet: {
      network: process.env.STARKNET_NETWORK ?? "sepolia",
      signerConfigured:
        !!process.env.STARKNET_PRIVATE_KEY &&
        process.env.STARKNET_PRIVATE_KEY !== "0xYOUR_PRIVATE_KEY_HERE",
    },
  });
});

app.listen(Number(PORT), "0.0.0.0", () => {
  const rawKey = process.env.GROQ_API_KEY;
  const isGroqConfigured = !!rawKey && !rawKey.startsWith("your_") && !rawKey.includes("YOUR_");

  console.log(`\n🚀 Social Alpha Trader Backend Initialized`);
  console.log(`   Internal URL: http://localhost:${PORT}`);
  console.log(`   Diagnostic:   http://localhost:${PORT}/api/health`);
  console.log(`   Sentiment:    http://localhost:${PORT}/api/sentiment`);
  console.log(`\n   Groq AI:  ${isGroqConfigured ? "ONLINE ✅" : "USING MOCKS ⚠️"}`);
  console.log(`   Network:  ${process.env.STARKNET_NETWORK ?? "sepolia"}\n`);
});

export default app;
