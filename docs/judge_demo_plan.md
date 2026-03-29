# Implementation Plan: Judge Demo Mode

To ensure judges have the best experience, we will add a "One-Click Demo" feature. This removes the need for them to register or check their email during the presentation.

## 🚀 Proposed Changes

### [Component] Backend

#### [MODIFY] [users.json](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/backend/data/users.json)
- Pre-seed a verified judge account:
  - **Email**: `judge@starkzap.com`
  - **Password**: `starkzap_demo` (Pre-hashed)
  - **Status**: `isVerified: true`

### [Component] Frontend

#### [MODIFY] [login/page.tsx](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/frontend/src/app/login/page.tsx)
- Add a "Sign in as Guest Judge" button below the login form.
- This button will automatically fill and submit the credentials.

#### [MODIFY] [README.md](file:///c:/Users/Neeraj%20Shinde/OneDrive/Desktop/social-alpha-trader/README.md)
- Provide these demo credentials clearly at the top for anyone who wants to test manually.

## 🧪 Verification Plan
1. Open the `/login` page.
2. Click the "Sign in as Guest Judge" button.
3. Verify it redirects to the Dashboard immediately.
4. Verify the Dashboard shows `judge@starkzap.com` in the Navbar.
