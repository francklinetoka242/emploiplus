# Admin Control Modules Documentation

This document covers the 3 new super admin control features for comprehensive site supervision:
1. **Content Moderation** - Manage publications and posts
2. **Certification Validation** - Approve/reject user certifications
3. **User Impersonation** - Temporary admin login as other users

---

## 1. Content Moderation Module

### Purpose
Super admin can manage all publications (posts) on the platform with abilities to pin, hide, or delete content.

### Features

#### Publication Management
- **View all publications** with metadata (author, date, likes, comments)
- **Search & filter** publications by content or author name
- **Pin publications** - Featured content stays at the top
- **Hide publications** - Temporarily remove without deleting
- **Delete publications** - Permanently remove posts

#### Tabs
- **All** - All publications on the platform
- **Pinned** - Featured pinned posts only
- **Hidden** - Currently hidden publications
- **Recent** - Publications from last 7 days

#### Statistics Dashboard
- Total publications count
- Pinned publications count
- Hidden publications count
- Recent publications count (7-day window)

### API Endpoints

```
GET /api/admin/publications
- Tab filter: ?tab=all|pinned|hidden|recent
- Search: ?search=keyword
- Returns: List of publications with author info

GET /api/admin/publications/stats
- Returns: Statistics object (counts by category)

DELETE /api/admin/publications/:id
- Permanently delete a publication

PUT /api/admin/publications/:id/pin
- Body: { is_pinned: true/false }
- Toggle pin status

PUT /api/admin/publications/:id/visibility
- Body: { is_visible: true/false }
- Toggle visibility (hidden/visible)
```

### Database Tables

**publications** (existing + new columns)
```sql
- id SERIAL PRIMARY KEY
- author_id INTEGER (user who created)
- content TEXT
- image_url TEXT
- visibility TEXT
- is_pinned BOOLEAN DEFAULT false (NEW)
- is_visible BOOLEAN DEFAULT true (NEW)
- likes_count INTEGER
- comments_count INTEGER
- created_at TIMESTAMP
- updated_at TIMESTAMP
```

### UI Components
- Publication cards showing title, content, author, date
- Statistics cards (KPI)
- Tab navigation (All, Pinned, Hidden, Recent)
- Search/filter bar
- Delete confirmation dialog
- Pin/Hide toggle buttons

---

## 2. Certification Validation Module

### Purpose
Super admin reviews and approves/rejects user certification documents (identity, business registration, degrees, etc.)

### Features

#### Certification Review
- **View pending certifications** with document previews
- **Approve certifications** - Mark user as verified
- **Reject certifications** - Provide rejection reason
- **View certification history** - Approved and rejected requests
- **Document preview** - Modal to view uploaded documents (identity, RCCM, degrees)

#### Tabs
- **Pending** - Awaiting admin review
- **Approved** - Already certified users
- **Rejected** - Rejected certification requests

#### Statistics Dashboard
- Total pending certifications
- Total approved certifications
- Total rejected certifications
- Verified users count
- Unverified users count

### API Endpoints

```
GET /api/admin/certifications
- Tab filter: ?tab=pending|approved|rejected
- Search: ?search=name_or_email
- Returns: Certification requests with documents

GET /api/admin/certifications/stats
- Returns: Statistics object (counts by status)

PUT /api/admin/certifications/:id/approve
- Approve and certify the user
- Creates notification

PUT /api/admin/certifications/:id/reject
- Body: { reason: "rejection reason" }
- Reject with optional reason
- Creates notification
```

### Database Tables

**verification_requests** (existing)
```sql
- id SERIAL PRIMARY KEY
- user_id INTEGER (references users)
- requested_name TEXT
- phone TEXT
- status TEXT (pending, approved, rejected, revoked)
- admin_id INTEGER (admin who reviewed)
- reason TEXT
- created_at TIMESTAMP
- reviewed_at TIMESTAMP
```

**users** (existing column)
```sql
- is_verified BOOLEAN DEFAULT false
```

**user_documents** (existing)
```sql
- id SERIAL PRIMARY KEY
- user_id INTEGER
- doc_type TEXT (identity, rccm, guarantor_identity, cni, degree, certificate)
- storage_url TEXT
- created_at TIMESTAMP
```

### Certification Workflow
1. User uploads identity document and requests verification
2. Admin views pending request with document preview
3. Admin can:
   - **Approve** → User is marked as verified ✓
   - **Reject** → User informed, can resubmit
4. Approved users get "Verified" badge across platform

### UI Components
- Certification request cards with user info
- Status badges (Pending, Approved, Rejected)
- Document type badges (CNI, RCCM, DEGREE, CERTIFICATE)
- Modal document preview with download
- Rejection reason textarea
- Approve/Reject buttons
- Statistics cards (KPI)
- Tab navigation

---

## 3. User Impersonation Module

### Purpose
Super admin can temporarily login as another user (candidate, company, or admin) for diagnosis, support, or testing purposes.

### Features

#### User Impersonation
- **Browse users** by type (Candidates, Companies, Admins)
- **Search users** by name or email
- **View user stats** (applications count, posts count)
- **Create impersonation session** - Generate temporary login token
- **Token management** - Auto-copy token, toggle visibility
- **Active sessions tracking** - See all current admin impersonations
- **End sessions** - Terminate impersonation early

#### Tabs
- **Candidates** - Browse and impersonate candidate accounts
- **Companies** - Browse and impersonate company accounts
- **Admins** - Browse and impersonate other admin accounts

#### Session Management
- Each session expires in 1 hour
- Session tracks: impersonating admin, impersonated user, start/end times
- Audit trail in notifications
- Admin can end session anytime

### API Endpoints

```
GET /api/admin/users?type=candidate|company|admin&search=keyword
- Browse users by type
- Optional search filter
- Returns: User list with stats

POST /api/admin/impersonate
- Body: { user_id: number, reason: "string" }
- Create impersonation session
- Returns: Session info + JWT token

GET /api/admin/impersonation/sessions
- View all active impersonation sessions
- Returns: List of sessions with user/admin names

DELETE /api/admin/impersonation/sessions/:id
- End an active impersonation session
- Marks session as ended
```

### Database Tables

**impersonation_sessions** (NEW)
```sql
- id SERIAL PRIMARY KEY
- admin_id INTEGER (admin doing impersonation)
- user_id INTEGER (user being impersonated)
- created_at TIMESTAMP
- expires_at TIMESTAMP (1 hour from creation)
- ended_at TIMESTAMP NULL (when session ended)
```

### JWT Token Structure
When admin impersonates a user, they receive a special JWT containing:
```json
{
  "id": user_id,
  "role": "candidate|company|admin",
  "impersonated_by": admin_id,
  "session_id": session_id,
  "exp": expires_at
}
```

The frontend detects this token and:
- Displays "Impersonating User" indicator
- Prevents certain sensitive actions
- Logs all activity back to audit trail

### Use Cases

1. **Customer Support**: Help a user navigate their account
2. **Diagnostics**: Test functionality as a specific user
3. **Testing**: Verify user workflows before updates
4. **Verification**: Check if user account works correctly
5. **Demo**: Show features to specific users

### UI Components
- User browser cards with avatars
- User stats (applications, posts)
- Search/filter bar
- "Create Session" button → Modal for reason input
- Token display with copy button
- Token visibility toggle
- Active sessions table showing:
  - User name & email
  - Admin name
  - Session duration/expiration
  - End session button

---

## Frontend Components

### File Locations
- **Moderation**: `src/components/admin/ModerateContent.tsx` (400+ lines)
- **Certification**: `src/components/admin/CertificationValidation.tsx` (450+ lines)
- **Impersonation**: `src/components/admin/ImpersonateUser.tsx` (350+ lines)

### Integration in Admin.tsx
All 3 components are integrated as tabs in the main Admin panel:
```tsx
<TabsList>
  {/* existing tabs... */}
  <TabsTrigger value="moderation">
    <MessageSquare className="w-4 h-4" />
    Modération
  </TabsTrigger>
  <TabsTrigger value="certifications">
    <FileCheck className="w-4 h-4" />
    Certifications
  </TabsTrigger>
  <TabsTrigger value="impersonate">
    <LogIn className="w-4 h-4" />
    Usurpation
  </TabsTrigger>
</TabsList>

<TabsContent value="moderation">
  <ModerateContent />
</TabsContent>
<TabsContent value="certifications">
  <CertificationValidation />
</TabsContent>
<TabsContent value="impersonate">
  <ImpersonateUser />
</TabsContent>
```

---

## Implementation Details

### Authentication & Authorization
All endpoints use `adminAuth` middleware:
- Validates JWT token
- Checks admin role
- Logs admin actions

### Error Handling
- 401: Not authenticated
- 403: Not authorized (insufficient role)
- 404: Resource not found
- 500: Server error

### Real-time Updates
- React Query manages data fetching
- Mutations auto-refresh lists after changes
- Toast notifications for user feedback

### Data Validation
- Required fields validated before submission
- Document types validated
- User IDs verified before operations
- Session expiration enforced server-side

---

## Security Considerations

1. **Impersonation Audit Trail**
   - All impersonations logged with admin ID
   - Notifications sent to tracked admins
   - Can be reviewed in audit logs

2. **Time-limited Sessions**
   - Impersonation tokens expire in 1 hour
   - Auto-expiring sessions prevent unauthorized access
   - Admin can manually end sessions

3. **Role-based Access**
   - Only super_admin or admin_content can access
   - Cannot impersonate yourself
   - Cannot impersonate higher-role users

4. **Content Moderation**
   - Soft deletes possible via is_visible flag
   - Hard deletes logged
   - Cannot be undone (consider backup)

5. **Certification Approval**
   - Document verification required
   - Admin identity recorded
   - Approval reasons tracked
   - Notifications inform users

---

## Testing Guide

### Test Content Moderation
1. Navigate to Admin → Modération tab
2. View all publications (should load list)
3. Pin a publication → Verify is_pinned=true
4. Hide a publication → Verify is_visible=false
5. Delete a publication → Verify it's gone
6. Search for publication → Filter works
7. Click stats cards → Counts match

### Test Certification Validation
1. Navigate to Admin → Certifications tab
2. Create a verification request as candidate
3. View in "Pending" tab as admin
4. Download document from modal
5. Approve → User gets notification, marked verified
6. Reject → User gets notification with reason
7. Check counts in stats

### Test User Impersonation
1. Navigate to Admin → Usurpation tab
2. Search for a candidate
3. Click "Create Session" → Enter reason
4. Copy token
5. Open new tab, login with token
6. Verify you're logged in as that user
7. Check "Impersonating" indicator
8. End session → Token expires

---

## Future Enhancements

1. **Moderation Rules Engine**
   - Auto-flag content with keywords
   - Automated hiding of rule violations
   - Appeal workflow for users

2. **Certification Levels**
   - Basic verification (identity only)
   - Business verification (business docs)
   - Premium verification (comprehensive)

3. **Impersonation Sandbox**
   - Read-only mode for pure diagnostics
   - Simulate user experience without changes
   - Time-limited recording of sessions

4. **Audit Dashboard**
   - View all admin actions on timeline
   - Export audit logs
   - Alert on suspicious patterns

---

## Support & Troubleshooting

### Common Issues

**Problem**: "Endpoint not found" error
- Solution: Ensure backend server is running on correct port

**Problem**: "Unauthorized" when trying to moderate
- Solution: Verify you're logged in as super_admin

**Problem**: Documents not loading in modal
- Solution: Check storage_url is correct, file exists

**Problem**: Impersonation token not working
- Solution: Session may have expired (1 hour limit), create new session

---

## API Summary Table

| Feature | Method | Endpoint | Auth |
|---------|--------|----------|------|
| List Publications | GET | `/api/admin/publications` | Admin |
| Pub Stats | GET | `/api/admin/publications/stats` | Admin |
| Delete Pub | DELETE | `/api/admin/publications/:id` | Admin |
| Pin Pub | PUT | `/api/admin/publications/:id/pin` | Admin |
| Hide Pub | PUT | `/api/admin/publications/:id/visibility` | Admin |
| List Certs | GET | `/api/admin/certifications` | Admin |
| Cert Stats | GET | `/api/admin/certifications/stats` | Admin |
| Approve Cert | PUT | `/api/admin/certifications/:id/approve` | Admin |
| Reject Cert | PUT | `/api/admin/certifications/:id/reject` | Admin |
| List Users | GET | `/api/admin/users` | Admin |
| Create Session | POST | `/api/admin/impersonate` | Admin |
| List Sessions | GET | `/api/admin/impersonation/sessions` | Admin |
| End Session | DELETE | `/api/admin/impersonation/sessions/:id` | Admin |

