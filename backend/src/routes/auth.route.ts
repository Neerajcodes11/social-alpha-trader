import { Router } from "express";
import { authService } from "../services/auth.service.js";
import { authRateLimiter } from "../middleware/rate-limit.middleware.js";
import { z } from "zod";

const router = Router();

// Validation Schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// [SECURITY] Apply rate limiting to all auth endpoints
router.use(authRateLimiter);

router.post("/register", async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await authService.register(email, password);
    res.status(201).json({
      message: "Registration successful. Please check your email for verification.",
      user,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    res.status(400).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const data = await authService.login(email, password);
    res.json(data);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues[0].message });
    }
    res.status(401).json({ error: err.message });
  }
});

router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Verification token is required" });
    }
    await authService.verifyEmail(token);
    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    await authService.requestPasswordReset(email);
    // [SECURITY] Always return same message even if email doesn't exist
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err: any) {
    res.status(400).json({ error: "Invalid email address" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = z
      .object({
        token: z.string(),
        newPassword: z.string().min(8),
      })
      .parse(req.body);
    await authService.resetPassword(token, newPassword);
    res.json({ message: "Password updated successfully." });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
