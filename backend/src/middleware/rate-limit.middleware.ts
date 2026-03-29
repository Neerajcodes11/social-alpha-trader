import rateLimit from "express-rate-limit";

// Strict rate limiting for authentication endpoints to prevent brute-force attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for demo to prevent lockout
  message: {
    error: "Too many authentication attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General rate limiting for other API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    error: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
