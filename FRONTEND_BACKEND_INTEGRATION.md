# Frontend-Backend Integration Guide - API Configuration

**Date:** 18 février 2026  
**Status:** Integration in Progress  

---

## ✅ What Has Been Fixed

### 1. **Backend CORS Configuration**
- ✅ Already configured in `backend/src/server.ts` (lines 65-77)
- ✅ Allows requests from `http://localhost:5173` (and 5174, local network)
- ✅ Credentials enabled
- ✅ All HTTP methods supported (GET, POST, PUT, DELETE, PATCH, OPTIONS)

### 2. **API Base URL Configuration**
- ✅ Frontend `.env.local`: `VITE_API_BASE_URL=http://localhost:5000`
- ✅ Function `buildApiUrl()` in `src/lib/headers.ts` converts relative paths to full URLs
- ✅ Example: `/api/publications` → `http://localhost:5000/api/publications`

### 3. **Frontend Components Updated**
The following components have been fixed to use `buildApiUrl()`:
- ✅ `src/pages/MyPublications.tsx` - All `/api/publications` calls now use `buildApiUrl()`
- ✅ `src/pages/UserProfile.tsx` - Fetch calls for user data, publications, candidates
- ✅ `src/pages/CandidateProfile.tsx` - Profile fetch with error handling
- ✅ `src/pages/CompanyDashboard.tsx` - Company stats fetch

### 4. **Authentication Hook (JWT-based)**
- ✅ `src/hooks/useAuth.ts` - Already configured for JWT from localStorage
- ✅ Validates token on mount
- ✅ Provides `getAuthHeaders()` for authenticated requests
- ✅ Fallback behavior: shows guest view if no token

### 5. **Error Handling**
- ✅ Added try/catch blocks with specific error messages
- ✅ Improved error feedback: toast notifications show HTTP status codes
- ✅ Handles both array and wrapped response formats from API

---

## 🔧 Backend API Endpoints Available

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/publications` | GET | Optional | Get all publications (public or filtered) |
| `/api/publications` | POST | Required | Create new publication |
| `/api/publications/:id` | PUT | Required | Update publication |
| `/api/publications/:id` | DELETE | Required | Delete publication |
| `/api/publications/:id/like` | POST | Required | Like/unlike publication |
| `/api/users/:id` | GET | Optional | Get user profile |
| `/api/users/me` | GET | Required | Get current user profile |
| `/api/users/me/password` | PUT | Required | Change password |
| `/api/users/candidates` | GET | Optional | List candidates |
| `/api/company/jobs` | GET | Required | Company's job postings |
| `/api/jobs` | GET | Optional | All job postings |
| `/api/company/applications` | GET | Required | Company's job applications |
| `/api/admin/register` | POST | None | Register new super admin |
| `/api/admin/login` | POST | None | Admin login |
| `/api/admin/verify-email` | GET | None | Verify email token |

---

## 🐛 Remaining Issues to Fix

### Critical Path Issues
Several components still use relative paths without `buildApiUrl()`:

1. **Settings Pages** (`/src/pages/settings/`)
   - `CompanyProfile.tsx` - Multiple `/api/users/me` calls
   - `CandidatePersonalInfo.tsx` - `/api/users/me` calls
   - `CompanyAdministrative.tsx` - `/api/users/me` calls
   - `CompanyPrivacy.tsx` - `/api/users/me` calls
   - `Security.tsx` - `/api/users/me/password` call
   
2. **Job Posting Pages**
   - `Recrutement.tsx` - `/api/company/jobs`, `/api/jobs`, `/api/company/applications` calls
   
3. **Service Pages** (`/src/pages/services/`)
   - `Graphique.tsx`, `Digital.tsx`, `Redaction.tsx`, `Informatique.tsx` - `/api/service-catalogs` calls
   
4. **Other Pages**
   - `PublicationReportPage.tsx` - `/api/publications/:id/report` call
   - `CandidateProfile.tsx` - `/api/favorites/candidates/:id` call
   - `company/validations/page.tsx` - `/api/company/validations` call

### Fix Pattern

Replace all relative `/api/...` paths with `buildApiUrl()`:

**Before:**
```typescript
const res = await fetch('/api/published', { headers: authHeaders() });
```

**After:**
```typescript
const res = await fetch(buildApiUrl('/api/publications'), { headers: authHeaders() });
```

**Import requirement:**
```typescript
import { buildApiUrl, authHeaders } from '@/lib/headers';
```

---

## 🚀 How to Test the Integration

### Prerequisites
1. Backend running: `cd backend && npm run dev` (port 5000)
2. Frontend running: `npm run dev` (port 5173)
3. PostgreSQL connected via SSH tunnel (port 5433)

### Test Scenario 1: Load Publications
1. Navigate to home page or Newsfeed component
2. Should see publications loading without "404" errors
3. Check browser console - no import errors

### Test Scenario 2: Load User Profile
1. Login as user
2. Navigate to `/profile/[userId]`
3. Should see user data and their publications
4. Check Network tab - requests go to `localhost:5000/api/...`

### Test Scenario 3: Admin Registration
1. Navigate to `/admin/register/super-admin`
2. Fill and submit form
3. Should post to `http://localhost:5000/api/admin/register`
4. Should receive verification email

### Test Scenario 4: Error Handling
1. Stop backend server
2. Attempt to load any page
3. Should show toast error message (not crash)
4. Should have console error logs with details

---

## 📋 Checklist for Full Integration

- [ ] **Backend CORS:** Verify running with correct origins (DONE ✅)
- [ ] **Environment Variables:** Check `.env.local` has `VITE_API_BASE_URL` (DONE ✅)
- [ ] **Auth Hook:** `useAuth.ts` properly configured (DONE ✅)
- [ ] **buildApiUrl:** Used in all main data-fetching components
  - [ ] Publications pages (DONE ✅)
  - [ ] User profile pages (DONE ✅)
  - [ ] Company dashboard (DONE ✅)
  - [ ] Settings pages (PENDING)
  - [ ] Job pages (PENDING)
  - [ ] Service pages (PENDING)
- [ ] **Error Handling:** Try/catch blocks with proper error messages
  - [ ] Main pages (DONE ✅)
  - [ ] Settings pages (PENDING)
  - [ ] Service pages (PENDING)
- [ ] **Network Testing:** Verify API calls in browser DevTools
  - [ ] All requests go to `localhost:5000`
  - [ ] CORS headers present
  - [ ] Auth headers sent for protected routes
- [ ] **Database Connection:** PostgreSQL tunnel active
- [ ] **Email Service:** SMTP configured for verification emails

---

## 🔍 Debugging Tips

### Check CORS Issues
Open browser DevTools → Network tab:
- Look for failed requests to `/api/...`
- Check "Response" tab for CORS error message
- Verify `Access-Control-Allow-Origin` header in response

### Verify API Base URL
In browser console:
```javascript
import.meta.env.VITE_API_BASE_URL
// Should print: "http://localhost:5000"

// Test buildApiUrl
import { buildApiUrl } from '@/lib/headers'
buildApiUrl('/api/publications')
// Should print: "http://localhost:5000/api/publications"
```

### Check Auth Headers
In browser console on authenticated page:
```javascript
localStorage.getItem('token')
// Should print JWT token, not null

localStorage.getItem('user')
// Should print user object
```

### Monitor Backend Server
Backend console should show:
```
userAuth token present: true, masked: eyJhbGc...
userAuth decoded id: 123, role: candidate
GET /api/publications?limit=10&offset=0 200
```

---

## 📞 Quick Reference: Complete Integration Example

### Registration + Login + Publications Flow

```typescript
// 1. Register (no auth needed)
const registerRes = await fetch(buildApiUrl('/api/admin/register'), {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123',
    nom: 'Dupont',
  }),
});
const { token, admin } = await registerRes.json();
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(admin));

// 2. Load publications (with auth)
const pubRes = await fetch(buildApiUrl('/api/publications'), {
  headers: authHeaders(),
});
const pubData = await pubRes.json();
console.log(pubData.publications);

// 3. Create publication (with auth)
const createRes = await fetch(buildApiUrl('/api/publications'), {
  method: 'POST',
  headers: authHeaders('application/json'),
  body: JSON.stringify({ content: 'Hello World' }),
});
const newPub = await createRes.json();
```

---

## 🎯 Next Steps

1. **Batch Fix Settings Pages** - Apply buildApiUrl to all `/api/users/me` calls
2. **Batch Fix Service Pages** - Apply buildApiUrl to `/api/service-catalogs` calls
3. **Batch Fix Job Pages** - Apply buildApiUrl to all job-related calls
4. **Comprehensive Testing** - Test all flows end-to-end
5. **Production Deployment** - Update `CORS_ORIGINS` env for production

---

**Created:** 18 février 2026  
**Last Updated:** 18 février 2026
