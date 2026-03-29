# Authentication Security Hardening Plan

This plan outlines the steps as a Senior Security Engineer to transform the current authentication system into a production-ready, secure implementation.

## ✨ Security Objectives
1.  **Brute-Force Protection**: Implement account lockout after 5 failed login attempts.
2.  **Secret Integrity**: Remove fallback JWT secrets and mandate environment variable configuration.
3.  **Session Security**: Ensure tokens are transferred and stored securely.
4.  **Verification Fidelity**: Improve email verification state management.
5.  **Frontend Integration**: Build secure authentication UI and state management.

## 🛠️ Proposed Changes

### [Component] Backend (Security Layer)

#### [MODIFY] [auth.service.ts](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/backend/src/services/auth.service.ts)
- Add `failedAttempts` and `lockoutUntil` to the `User` interface.
- Implement logic in `login()` to track failures and enforce a 15-minute lockout after 5 attempts.
- Throw a specific "Account locked" error when applicable.
- Ensure `JWT_SECRET` throws an error if missing from `.env`.

#### [MODIFY] [index.ts](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/backend/src/index.ts)
- Restore `authenticateToken` middleware for the `/api/trade` route.
- Add additional `helmet` configurations for stricter Content Security Policy (CSP).

### [Component] Frontend (User Experience & Security)

#### [NEW] [login/page.tsx](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/frontend/src/app/login/page.tsx)
- Implementation of a secure login form with CSRF-ready API calls.

#### [NEW] [register/page.tsx](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/frontend/src/app/register/page.tsx)
- Implementation of account registration with password strength indicators.

#### [MODIFY] [api.ts](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/frontend/src/lib/api.ts)
- Update `executeTrade` to pull the token from secure storage.
- Add an `auth` helper for login/register/logout.

## 🧪 Verification Plan

### Automated Tests
- Scripted brute-force attempt to verify account lockout.
- Verification of JWT expiration by setting a short TTL.
- Verification that requests to `/api/trade` fail without a valid `Bearer` token.

### Manual Verification
1.  Register a new account.
2.  Attempt 5 wrong passwords to trigger lockout.
3.  Verify the "Account locked" message.
4.  Try to trade without being logged in (should redirect or show error).
