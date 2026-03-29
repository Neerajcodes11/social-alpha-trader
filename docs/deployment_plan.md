# Deployment Strategy: Social Alpha Trader

To avoid the "Access Denied", "CORS", or "Connection Failed" issues during your presentation, we will use a **Stable Pair** deployment strategy.

## 🚀 Recommended Approach
We will deploy the **Backend** to Railway (better for Express state) and the **Frontend** to Vercel.

### 1. Backend Deployment (Railway)
**Why?** Railway handles long-running Express processes better than Vercel's serverless functions for Hackathons.

**Steps:**
1. Connect your GitHub and select the `backend` folder.
2. Add these **Environment Variables** in Railway:
   - `PORT=3001`
   - `GROQ_API_KEY` (Your key or dummy)
   - `STARKNET_NETWORK=sepolia`
   - `JWT_SECRET` (Any long string)

### 2. Frontend Deployment (Vercel)
**Steps:**
1. Connect the root folder to Vercel.
2. Set the **Root Directory** to `frontend`.
3. **CRITICAL:** Add this Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend-railway-url.railway.app`

## ⚠️ Pre-Deployment Checklist (To avoid issues)

### [MODIFY] [backend/src/index.ts](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/backend/src/index.ts)
We need to ensure CORS allows the Vercel domain.
```typescript
// Current code (Safe for development)
app.use(cors({ origin: "*" })); 
```
> [!NOTE]
> Keeping `origin: "*"` is the easiest way to avoid demo failures, though not recommended for real production. For your hackathon, keep it as `*`.

### [CHECK] [frontend/src/lib/api.ts](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/frontend/src/lib/api.ts)
Ensure the frontend uses the environment variable correctly.
```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
```

## 🛠️ Verification Plan
1. **Health Check:** Visit `https://your-backend.railway.app/api/health` after deployment.
2. **CORS Test:** Open the browser console on the Vercel site and check for any red "CORS" errors when the dashboard loads.
