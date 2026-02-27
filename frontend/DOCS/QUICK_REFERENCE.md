# Admin Control Modules - Quick Reference & Testing Guide

## Quick Links

### Frontend Components Location
```
src/components/admin/
├── ModerateContent.tsx (400 lines)
├── CertificationValidation.tsx (450 lines)
└── ImpersonateUser.tsx (350 lines)
```

### Backend Endpoints
```
backend/src/server.ts
Lines 3926-4185 (Sections 8, 9, 10)
```

### Documentation
```
DOCS/
├── ADMIN_CONTROL_MODULES.md (Full documentation)
└── ADMIN_CONTROL_IMPLEMENTATION.md (Implementation summary)
```

---

## 1️⃣ Content Moderation - Quick Start

### Access Point
Admin Panel → "Modération" tab

### What You Can Do
- **View**: All publications on the site
- **Search**: Find posts by content or author name
- **Pin**: Move important posts to top
- **Hide**: Temporarily remove without deleting
- **Delete**: Permanently remove posts
- **Stats**: See moderation metrics

### Try This
1. Open Admin panel
2. Click "Modération" tab
3. Browse publications
4. Click pin icon on a post
5. See "Pinned" count increase in stats
6. Click hide icon 
7. Switch to "Hidden" tab to see it

### API Endpoints
| Action | Method | Endpoint |
|--------|--------|----------|
| List | GET | `/api/admin/publications?tab=all&search=keyword` |
| Stats | GET | `/api/admin/publications/stats` |
| Delete | DELETE | `/api/admin/publications/:id` |
| Pin | PUT | `/api/admin/publications/:id/pin` |
| Hide | PUT | `/api/admin/publications/:id/visibility` |

### Expected Response
```json
{
  "success": true,
  "publication": {
    "id": 1,
    "author_id": 123,
    "content": "Post content...",
    "is_pinned": true,
    "is_visible": true,
    "likes_count": 45,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## 2️⃣ Certification Validation - Quick Start

### Access Point
Admin Panel → "Certifications" tab

### What You Can Do
- **Review**: Pending user certifications
- **Approve**: Mark users as verified ✓
- **Reject**: Decline with reason
- **Preview**: View uploaded documents
- **Track**: See approval/rejection history
- **Stats**: Certification metrics

### Try This
1. As a candidate user:
   - Upload identity document (upload/documents/)
   - Request verification
2. As admin:
   - Open "Certifications" tab
   - See request in "Pending" tab
   - Click document preview button
   - Review document in modal
   - Click Approve → User is certified!

### API Endpoints
| Action | Method | Endpoint |
|--------|--------|----------|
| List | GET | `/api/admin/certifications?tab=pending` |
| Stats | GET | `/api/admin/certifications/stats` |
| Approve | PUT | `/api/admin/certifications/:id/approve` |
| Reject | PUT | `/api/admin/certifications/:id/reject` |

### Request Examples
**Approve**:
```bash
PUT /api/admin/certifications/5/approve
Authorization: Bearer <admin_token>
```

**Reject**:
```bash
PUT /api/admin/certifications/5/reject
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "reason": "Document quality too low, please resubmit clearer photo"
}
```

### Expected Response
```json
{
  "success": true
}
```

User receives notification:
- ✅ Approved: "Your certification was approved"
- ❌ Rejected: "Reason for rejection shown here"

---

## 3️⃣ User Impersonation - Quick Start

### Access Point
Admin Panel → "Usurpation" tab

### What You Can Do
- **Browse**: View candidates, companies, admins
- **Search**: Find specific users
- **Create Session**: Start impersonation
- **Get Token**: JWT for that user
- **Manage**: View and end active sessions

### Try This
1. Click "Candidates" tab
2. Search for a user name
3. Click "Create Session" button
4. Enter reason (e.g., "Testing email flow")
5. Click "Copy Token"
6. Open new incognito window
7. Navigate to login
8. Use token to authenticate as that user
9. You should see "Impersonating [User]" indicator
10. Return to admin → end session when done

### API Endpoints
| Action | Method | Endpoint |
|--------|--------|----------|
| List Users | GET | `/api/admin/users?type=candidate&search=john` |
| Create | POST | `/api/admin/impersonate` |
| Sessions | GET | `/api/admin/impersonation/sessions` |
| End | DELETE | `/api/admin/impersonation/sessions/:id` |

### Request Examples
**Create Session**:
```bash
POST /api/admin/impersonate
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 42,
  "reason": "Customer support - testing job application flow"
}
```

**Response**:
```json
{
  "success": true,
  "session": {
    "id": 99,
    "user_id": 42,
    "user_name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z",
    "expires_at": "2024-01-15T11:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Using the Token
```bash
# Use token as Bearer token in headers
Authorization: Bearer <impersonation_token>

# Frontend will detect impersonation and show indicator
# Session expires in 1 hour automatically
# You can manually end it from active sessions table
```

---

## Testing Workflow

### Scenario 1: Content Moderation
```
1. Create a publication (as regular user)
2. Go to Admin → Modération
3. Find the post you just created
4. Pin it
5. Verify stats show 1 pinned post
6. Hide it
7. Verify it disappears from "All" tab
8. Switch to "Hidden" tab
9. See it there
10. Delete it
11. Verify it's gone completely
```

### Scenario 2: Certification Flow
```
1. As Candidate: Upload identity document
2. As Candidate: Request verification
3. As Admin: View certification request
4. As Admin: Click document preview
5. As Admin: Click Approve
6. As Candidate: Check notifications
7. As Candidate: Verify profile shows ✓
8. As Admin: View in "Approved" tab
```

### Scenario 3: Impersonation & Support
```
1. As Admin: Search for candidate "Jane"
2. As Admin: Create impersonation session
3. As Admin: Copy token
4. In new window: Login with token
5. As Jane: Browse job offers
6. As Jane: Apply to a job
7. As Admin: End session
8. Token becomes invalid
9. As Jane: Can't use that token anymore
```

---

## Common Issues & Solutions

### Issue: "Endpoint not found" (404)
**Cause**: Backend server not running or not compiled
**Solution**: 
1. Check backend server is running on port 5000
2. Run `npm run build` in backend folder
3. Restart server

### Issue: "Unauthorized" (401)
**Cause**: Not logged in as admin
**Solution**: 
1. Logout from current account
2. Login with admin account (email: admin@test.com)
3. Verify JWT token is stored

### Issue: "Forbidden" (403)
**Cause**: Logged in but not as admin
**Solution**: 
1. Verify user role is 'admin' or 'super_admin'
2. Check user account in database
3. Login with proper admin credentials

### Issue: Publication not showing in list
**Cause**: Publication might be soft-deleted or filtered
**Solution**:
1. Check if filter is active (tab selection)
2. Try different tab (All, Pinned, Hidden, Recent)
3. Clear search filter
4. Refresh page

### Issue: Document won't preview in modal
**Cause**: Storage URL is broken or file doesn't exist
**Solution**:
1. Verify file was uploaded to storage
2. Check URL is correct in database
3. Check file permissions
4. Re-upload document

### Issue: Impersonation token not working
**Cause**: Token expired (1 hour limit) or invalid
**Solution**:
1. Create new impersonation session
2. Copy new token
3. Verify it's used in Authorization header
4. Check token hasn't expired

---

## Debug Checklist

- [ ] Backend server running? `npm run dev` in backend folder
- [ ] Database connected? Check console logs
- [ ] Tables created? Server auto-creates on startup
- [ ] Admin logged in? Check localStorage has token
- [ ] No 404 errors? Check network tab in DevTools
- [ ] No TypeScript errors? `npx tsc --noEmit`
- [ ] Components rendering? Check React DevTools
- [ ] API calls succeeding? Check Network tab
- [ ] Permissions correct? Verify admin role

---

## Performance Tips

### For Large Datasets
- **Moderation**: Limit to 200 publications per query
- **Certifications**: Show 100 requests per page
- **Impersonation**: Load users on demand (search)

### Query Optimization
- Use database indexes on is_pinned, is_visible
- Cache statistics (5-min TTL)
- Lazy-load document previews

### Frontend Optimization
- React Query handles caching automatically
- Mutation invalidation refreshes only affected queries
- Components lazy-loaded in Admin tabs

---

## API Response Times

Expected response times:
- **List endpoints**: < 200ms (with filters)
- **Stats endpoints**: < 100ms (cached)
- **Mutation endpoints**: < 150ms
- **Document preview**: Depends on file size

---

## Database Impact

### Storage Used
```
publications table: Small (text + metadata)
verification_requests table: Small
impersonation_sessions table: Minimal (auto-cleanup in 1 hour)
```

### Index Created
```sql
CREATE INDEX idx_publications_pinned 
ON publications(is_pinned) WHERE is_pinned = true;
```

### No Breaking Changes
- All new columns have defaults
- All new tables are separate
- Existing functionality unchanged

---

## Monitoring

### What to Monitor
1. **Error rate** on admin endpoints
2. **Response time** for list operations
3. **Active sessions** count (impersonation)
4. **Moderation activity** (deletions)

### Logs to Check
- Browser console for React errors
- Server logs for API errors
- Database logs for queries

### Metrics to Track
- Daily moderation actions
- Certification approvals/rejections
- Active impersonation sessions
- Peak usage times

---

## Rollback Plan

If issues occur:

1. **Remove features from UI**:
   - Comment out 3 tabs in Admin.tsx
   - Frontend still functional

2. **Keep endpoints disabled**:
   - Endpoints remain in code
   - Don't accidentally call them

3. **Database is safe**:
   - New columns have defaults
   - New table is independent
   - Can drop without affecting data

4. **Restore previous version**:
   - Use git to revert changes
   - Database migrations can undo changes

---

## Version Info

- **Frontend**: React 18+, TypeScript strict
- **Backend**: Node.js, Express, PostgreSQL
- **Components**: 3 new (1200+ lines total)
- **Endpoints**: 13 new endpoints
- **Documentation**: 2 comprehensive guides

---

## Support & Questions

See full documentation:
- **API Reference**: `DOCS/ADMIN_CONTROL_MODULES.md`
- **Implementation Details**: `DOCS/ADMIN_CONTROL_IMPLEMENTATION.md`
- **Code**: Check components in `src/components/admin/`

