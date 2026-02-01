# Authentication Configuration Guide - Production Setup

## Overview
Your application uses JWT-based authentication with email/password. The system is deployed across three services:
- **Frontend**: https://emploiplus.vercel.app (Vercel)
- **Backend**: https://your-production-api.example.com (production host) or Supabase for direct DB/auth
- **Database**: Supabase PostgreSQL

## What Was Fixed

### ✅ Frontend Authentication Hook (src/hooks/useAuth.ts)
- Updated to use `VITE_API_BASE_URL` environment variable
- Correctly points to `https://emploiplus-backend.onrender.com` in production
- Implements `signUp`, `signIn`, and `signOut` methods
- Stores JWT token in localStorage

### ✅ Backend Endpoints (backend/src/server.ts)
- `POST /api/register` - User registration with validation
- `POST /api/login` - User login with password verification
- `GET /api/users/me` - Get current user profile (requires token)

### ✅ Pages
- `src/pages/LoginUser.tsx` - Login form
- `src/pages/Register.tsx` - Registration form with candidate/company options

## Required Environment Variables

### 1. Vercel (Frontend)
**Set these in Vercel Project Settings → Environment Variables:**

If using a backend:
```
VITE_API_BASE_URL=https://your-production-api.example.com
```
If using only Supabase for auth/DB: ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set and omit `VITE_API_BASE_URL`.

### 2. Backend (Production host)
**Set these in your production host's environment variables (or CI):**

```
# Database
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>

# Auth
JWT_SECRET=your-very-secure-jwt-secret-key-here

# CORS - Allow Vercel Frontend
CORS_ORIGINS=https://emploiplus.vercel.app,http://localhost:5173,http://localhost:5174

# Environment
NODE_ENV=production
```

### 3. Supabase (Database)
Database connection string should point to Supabase's PostgreSQL in `DATABASE_URL`.

## How Authentication Works

### Registration Flow
1. User fills form at `/inscription`
2. Frontend calls `POST https://your-production-api.example.com/api/register` (if using backend)
3. Backend validates:
   - Email format
   - Password length (>= 8 characters)
   - Email not already used
   - Country is "congo"
4. Backend hashes password with bcrypt
5. Creates user in Supabase PostgreSQL
6. Returns JWT token + user data
7. Frontend stores token in localStorage
8. User redirected to login page

### Login Flow
1. User fills form at `/connexion`
2. Frontend calls `POST https://your-production-api.example.com/api/login` (if using backend)
3. Backend:
   - Queries user by email
   - Verifies password with bcrypt
   - Returns JWT token + user data
4. Frontend stores token in localStorage
5. Token sent in `Authorization: Bearer <token>` header for protected routes

### Protected Requests
```typescript
// All API requests include the token automatically
// via src/lib/headers.ts
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

## Testing the Setup

### 1. Test Backend Directly
```bash
# Register
curl -X POST https://emploiplus-backend.onrender.com/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "user_type": "candidate",
    "country": "congo"
  }'

# Login
curl -X POST https://emploiplus-backend.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Protected endpoint (replace TOKEN)
curl -X GET https://emploiplus-backend.onrender.com/api/users/me \
  -H "Authorization: Bearer TOKEN"
```

### 2. Test Frontend
1. Go to https://emploiplus.vercel.app/inscription
2. Register with:
   - Email: test@example.com
   - Password: password123 (>= 8 chars)
   - Country: Congo
3. Should redirect to login page
4. Go to https://emploiplus.vercel.app/connexion
5. Login with same credentials
6. Should redirect to home page

## Troubleshooting

### CORS Error
**Symptom**: "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution**:
- Check Render `CORS_ORIGINS` includes `https://emploiplus.vercel.app`
- Verify backend is running: https://emploiplus-backend.onrender.com

### 401 Unauthorized
**Symptom**: "Token missing" or "Invalid token"

**Solution**:
- Clear localStorage: `localStorage.clear()`
- Re-login
- Check Render `JWT_SECRET` is set

### Registration Fails
**Symptom**: "Email already used" or validation error

**Solution**:
- Use unique email
- Password must be >= 8 characters
- Country must be "congo"

### Database Connection Error
**Symptom**: 500 Internal Server Error on register/login

**Solution**:
- Check Render `DATABASE_URL` is correct
- Verify Supabase database is accessible
- Check backend logs in Render dashboard

## Files Modified

1. **src/hooks/useAuth.ts** - Updated to use VITE_API_BASE_URL
2. **src/pages/LoginUser.tsx** - Uses updated useAuth
3. **src/pages/Register.tsx** - Uses updated useAuth
4. **.env.production** - Has VITE_API_BASE_URL

## Backend Implementation Details

### Password Security
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Never returned to frontend

### Token Security
- JWT tokens expire in 7 days
- Signed with JWT_SECRET
- Should only work with HTTPS in production

### Database Fields (users table)
```sql
id SERIAL PRIMARY KEY
email VARCHAR UNIQUE NOT NULL
password VARCHAR NOT NULL
full_name VARCHAR
user_type VARCHAR (candidate/company)
company_name VARCHAR
company_address VARCHAR
phone VARCHAR
country VARCHAR
is_verified BOOLEAN
created_at TIMESTAMP
```

## Next Steps (Optional)

1. **Email Verification** - Implement email verification workflow
2. **Password Reset** - Add forgot password functionality
3. **OAuth** - Add Google/Facebook login
4. **2FA** - Add two-factor authentication
5. **Session Management** - Implement refresh tokens

## Support

For issues or questions:
1. Check application logs in Render dashboard
2. Check browser console for frontend errors
3. Review this guide for configuration details
4. Test endpoints with curl to isolate frontend vs backend issues
