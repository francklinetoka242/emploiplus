# CRITICAL: Authentication Layer - Full Name to First/Last Name Refactoring

## Executive Summary
**BLOCKER ISSUE:** Backend code references non-existent `full_name` column in PostgreSQL queries, causing runtime PostgreSQL errors.

**DATABASE RULE:** 
- ✅ ONLY `first_name` and `last_name` columns exist
- ❌ NEVER use `full_name` in SELECT, INSERT, or UPDATE queries
- ✅ Concatenate at APPLICATION LEVEL only (for display/response)

**Impact:** Authentication system (admin/user login, registration) fails due to SQL errors.

---

## FILES WITH ISSUES

### 🔴 CRITICAL (DB Query Issues)

#### 1. `backend/src/services/followService.ts` (Lines 372, 386)
**Problem:** Selects non-existent `u.full_name` column

```typescript
// ❌ WRONG - Line 372
SELECT u.id, u.full_name, u.profile_image_url, u.bio, u.profession, ...

// ❌ WRONG - Line 386
SELECT u.id, u.full_name, u.profile_image_url, u.bio, u.profession, ...
```

**Fix:** Replace with `first_name, last_name` and concatenate in application:

```typescript
// ✅ CORRECT
SELECT u.id, u.first_name, u.last_name, u.profile_image_url, u.bio, u.profession, ...
// Then map: { ...r, full_name: `${r.first_name} ${r.last_name}` }
```

---

#### 2. `backend/src/services/searchService.ts`
**Problem:** No DB full_name query (already fixed in code!)

Lines 145-146 and 168 are SAFE - they CONCATENATE in application:
```typescript
// ✅ CORRECT - Concatenates at app level, not DB
return result.rows.map((r: any) => ({ 
  ...r, 
  full_name: `${(r.first_name||'').trim()} ${(r.last_name||'').trim()}`.trim() 
}));
```

---

### 🟡 SAFE (Correct Usage - Concatenate in App)

#### 3. `backend/src/controllers/auth.controller.ts` (Lines 29, 63)
**Status:** ✅ SAFE - Concatenates in application response

```typescript
// ✅ CORRECT - Returns concatenated value in response
full_name: `${(safeAdmin.first_name || "").trim()} ${(safeAdmin.last_name || "").trim()}`.trim(),
```

#### 4. `backend/src/services/followService.ts` (Lines 220, 293)
**Status:** ✅ SAFE - Concatenates in application

```typescript
// ✅ CORRECT - Application-level concatenation
full_name: `${(candidate.first_name||'').trim()} ${(candidate.last_name||'').trim()}`.trim(),
```

#### 5. `backend/src/services/messagingService.ts` (Lines 120, 128, 172)
**Status:** ✅ SAFE - Concatenates in application

```typescript
// ✅ CORRECT - All concatenate at app level
full_name: `${(row.p1_first||'').trim()} ${(row.p1_last||'').trim()}`.trim(),
full_name: `${(row.p2_first||'').trim()} ${(row.p2_last||'').trim()}`.trim(),
full_name: `${(row.first_name||'').trim()} ${(row.last_name||'').trim()}`.trim(),
```

#### 6. `backend/src/services/newsfeedService.ts` (Line 217)
**Status:** ✅ SAFE - Direct assignment

```typescript
// ✅ CORRECT - Direct assignment to app object
pub.full_name = 'Utilisateur anonyme';
```

#### 7. `backend/src/types/index.d.ts` (Line 4)
**Status:** ✅ SAFE - TypeScript interface property (optional, for responses)

```typescript
// ✅ CORRECT - Used in TypeScript responses, not DB queries
full_name?: string;
```

#### 8. `backend/src/types/extended.ts` (Line 89)
**Status:** ✅ SAFE - TypeScript interface property

```typescript
// ✅ CORRECT - Used in responses
full_name: string;
```

#### 9. `backend/src/services/followService.ts` (Line 29)
**Status:** ✅ SAFE - TypeScript interface property

```typescript
// ✅ CORRECT - Interface definition
full_name?: string;
```

---

### 🟢 VERIFIED CORRECT

#### 10. `backend/src/routes/auth.ts`
**Status:** ✅ ALL CORRECT

- User registration (Line 107): Uses `first_name, last_name` ✅
- User login (Line 130): Generic query `SELECT *` ✅
- Admin registration (Line 67): Calls `registerAdmin()` with `prenom`, `nom` ✅
- Admin login (Line 81): Generic query `SELECT * FROM admins` ✅
- Auth status (Lines 41-47): `SELECT id, email, first_name, last_name` ✅

#### 11. `backend/src/services/adminAuthService.ts`
**Status:** ✅ ALL CORRECT

- registerAdmin (Lines 31-37): Inserts `first_name, last_name` ✅
- loginAdmin (Line 46): Selects with `first_name, last_name` ✅
- verifyEmailToken (Line 60): No name fields involved ✅
- createAdminBySuperAdmin (Line 70): Delegates to registerAdmin ✅

---

## REQUIRED FIXES SUMMARY

| File | Issue | Type | Fix |
|------|-------|------|-----|
| followService.ts | Lines 372, 386: SELECT u.full_name | 🔴 CRITICAL | Replace with first_name, last_name; concatenate at app level |
| auth.ts | None | ✅ CORRECT | No action needed |
| adminAuthService.ts | None | ✅ CORRECT | No action needed |
| auth.controller.ts | None | ✅ CORRECT | No action needed |

---

## IMPLEMENTATION STEPS

### Step 1: Fix followService.ts (2 Queries)

**File:** `backend/src/services/followService.ts`

**Line 372 (getFollowingUsers):**
```typescript
// FROM:
`SELECT u.id, u.full_name, u.profile_image_url, u.bio, u.profession, u.user_type, u.company_name, u.skills, u.experience_years
 FROM users u
 INNER JOIN follows f ON u.id = f.following_id
 WHERE f.follower_id = $1 AND u.is_deleted = false
 ORDER BY f.created_at DESC`

// TO:
`SELECT u.id, u.first_name, u.last_name, u.profile_image_url, u.bio, u.profession, u.user_type, u.company_name, u.skills, u.experience_years
 FROM users u
 INNER JOIN follows f ON u.id = f.following_id
 WHERE f.follower_id = $1 AND u.is_deleted = false
 ORDER BY f.created_at DESC`

// Then map results:
return result.rows.map((r: any) => ({ 
  ...r, 
  full_name: `${(r.first_name || '').trim()} ${(r.last_name || '').trim()}`.trim() 
}));
```

**Line 386 (getFollowerUsers):**
```typescript
// Same change - replace u.full_name with u.first_name, u.last_name
// Add concatenation mapping
```

---

## VERIFICATION CHECKLIST

- [ ] followService.ts: Lines 372 and 386 fixed (no SELECT u.full_name)
- [ ] No other files have `SELECT ... full_name ...` queries left
- [ ] Auth routes work: POST /admin/register, POST /admin/login
- [ ] Auth routes work: POST /user/register, POST /user/login
- [ ] GET /auth/status returns user with first_name/last_name
- [ ] Responses include concatenated full_name for display
- [ ] Database queries never attempt to read/write full_name column

---

## DEPLOYMENT SAFETY

✅ **These changes are SAFE:**
- No schema changes needed
- No existing data affected
- Only application-level query/response changes
- Backward compatible with existing responses

⚠️ **Test these endpoints after fix:**
- POST /api/auth/admin/register
- POST /api/auth/admin/login
- POST /api/auth/user/register
- POST /api/auth/user/login
- GET /api/auth/status

---

## APPENDIX: Why This Happened

The migration from the old schema (which had `full_name` column) to Option C (which uses `first_name`/`last_name` only) was completed in the DATABASE but not fully propagated through all code paths.

**Root Cause Analysis:**
1. Old schema: `CREATE TABLE users (full_name TEXT)`
2. Migration: `ALTER TABLE users ADD COLUMN first_name, last_name; DROP COLUMN full_name;`
3. Code: Some files updated to use first_name/last_name, some files use concatenation, but followService.ts still directly selects non-existent full_name column
4. Result: PostgreSQL error "column full_name does not exist"

**Solution:** Ensure ALL database queries use only existing columns and do name concatenation at the application layer.

