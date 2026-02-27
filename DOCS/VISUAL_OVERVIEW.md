# Admin Control Modules - Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD                           │
│                     (src/pages/Admin.tsx)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Tabs Navigation
                              ▼
        ┌─────────────────────┬─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
    ┌─────────┐         ┌────────────┐       ┌─────────────┐
    │MODERATION│        │CERTIFICATIONS│      │IMPERSONATION│
    └────┬────┘         └─────┬──────┘       └──────┬──────┘
         │                    │                      │
         │                    │                      │
    ModerateContent.tsx   CertificationValidation    ImpersonateUser.tsx
         │                    │                      │
         ▼                    ▼                      ▼
    ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
    │ Publications │      │Verification  │     │Impersonation │
    │ Management   │      │ Requests     │     │  Sessions    │
    │              │      │              │     │              │
    │ - Pin/Hide   │      │ - Approve    │     │ - Create JWT │
    │ - Delete     │      │ - Reject     │     │ - Track      │
    │ - Search     │      │ - Preview    │     │ - End        │
    │ - Stats      │      │ - Stats      │     │ - Stats      │
    └──────┬───────┘      └──────┬───────┘     └──────┬───────┘
           │                     │                    │
           └─────────────────────┼────────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │ Backend API (Node.js) │
                     └───────────┬───────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
            ▼                    ▼                    ▼
      ┌──────────────┐    ┌──────────────┐   ┌──────────────┐
      │Moderation    │    │Certification │   │Impersonation │
      │Endpoints (5) │    │Endpoints (4) │   │Endpoints (4) │
      │              │    │              │   │              │
      │GET /pub      │    │GET /certs    │   │GET /users    │
      │GET /stats    │    │GET /stats    │   │POST /session │
      │DELETE /pub   │    │PUT /approve  │   │GET /sessions │
      │PUT /pin      │    │PUT /reject   │   │DELETE /end   │
      │PUT /hide     │    │              │   │              │
      └──────┬───────┘    └──────┬───────┘   └──────┬───────┘
             │                   │                  │
             └───────────────────┼──────────────────┘
                                 │
                     ┌───────────┴───────────┐
                     │   PostgreSQL Database │
                     └───────────┬───────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
        ▼                        ▼                        ▼
   ┌─────────────┐          ┌──────────────┐      ┌───────────────┐
   │publications │          │verification_ │      │impersonation_ │
   │(new columns)│          │requests      │      │sessions       │
   │             │          │              │      │               │
   │is_pinned    │          │id            │      │id             │
   │is_visible   │          │user_id       │      │admin_id       │
   │creator_id   │          │status        │      │user_id        │
   └─────────────┘          │approved_by   │      │created_at     │
                            │reason        │      │expires_at     │
                            └──────────────┘      │ended_at       │
                                                  └───────────────┘
```

---

## User Flow Diagrams

### 1. Content Moderation Flow

```
Admin User
    │
    ├─ Logs in to Admin Dashboard
    │
    ├─ Clicks "Modération" Tab
    │
    ├─ API Call: GET /api/admin/publications
    │   └─ Returns: List of all publications
    │
    ├─ Searches/Filters publications
    │
    ├─ Views Publication Details
    │   ├─ Author: John Doe
    │   ├─ Content: "Spam post about..."
    │   ├─ Likes: 5
    │   ├─ Comments: 2
    │   └─ Actions: [Pin] [Hide] [Delete]
    │
    ├─ Action 1: Click "Pin"
    │   └─ API Call: PUT /api/admin/publications/123/pin
    │       └─ Updates: is_pinned = true
    │
    ├─ Action 2: Click "Hide" (on another post)
    │   └─ API Call: PUT /api/admin/publications/456/visibility
    │       └─ Updates: is_visible = false
    │       └─ Post hides from public view
    │
    ├─ Action 3: Click "Delete"
    │   └─ API Call: DELETE /api/admin/publications/789
    │       └─ Permanently removes post
    │
    ├─ Views Updated Stats
    │   ├─ Total Publications: 542
    │   ├─ Pinned: 8
    │   ├─ Hidden: 23
    │   └─ Recent (7 days): 145
    │
    └─ Task Complete ✓
```

### 2. Certification Validation Flow

```
Candidate User (Initial Step)
    │
    ├─ Uploads identity document
    │   └─ File: CNI.pdf → Storage → Document record created
    │
    ├─ Requests verification
    │   └─ API Call: POST /api/verify-request
    │       └─ Creates: verification_requests record
    │
    └─ Request Status: PENDING ⏳

Admin User (Approval Step)
    │
    ├─ Logs in to Admin Dashboard
    │
    ├─ Clicks "Certifications" Tab
    │
    ├─ Sees "Pending" requests (1)
    │
    ├─ API Call: GET /api/admin/certifications?tab=pending
    │   └─ Returns: List of pending requests
    │
    ├─ Views Request Details
    │   ├─ User: Jane Doe
    │   ├─ Email: jane@example.com
    │   ├─ Type: Candidate
    │   ├─ Document: CNI (Identity Card)
    │   ├─ Requested Name: Jane Doe
    │   └─ Actions: [Preview Doc] [Approve] [Reject]
    │
    ├─ Action 1: Click "Preview Doc"
    │   └─ Modal Opens: Shows document image
    │       └─ Can review authenticity
    │
    ├─ Action 2: Click "Approve"
    │   └─ API Call: PUT /api/admin/certifications/5/approve
    │       └─ Updates: verification_requests.status = 'approved'
    │       └─ Updates: users.is_verified = true
    │       └─ Notification Sent: "Certification approved ✓"
    │
    ├─ Views Updated Stats
    │   ├─ Pending: 0
    │   ├─ Approved: 12
    │   ├─ Rejected: 2
    │   ├─ Verified Users: 214
    │   └─ Unverified Users: 156
    │
    └─ Task Complete ✓

Candidate User (Receives Notification)
    │
    ├─ Notification: "Your certification was approved ✓"
    │
    ├─ Profile Updated: Shows "Verified" badge ✓
    │
    └─ Can now use full platform features
```

### 3. User Impersonation Flow

```
Admin User
    │
    ├─ Logs in to Admin Dashboard
    │
    ├─ Clicks "Usurpation" Tab
    │
    ├─ Sees User Browser (Candidates/Companies/Admins)
    │
    ├─ Searches for "John Smith"
    │   └─ API Call: GET /api/admin/users?type=candidate&search=john
    │       └─ Returns: Matching user profiles
    │
    ├─ Selects User: John Smith (ID: 42)
    │   ├─ Profile Image
    │   ├─ Applications: 5
    │   ├─ Posts: 3
    │   └─ Email: john@example.com
    │
    ├─ Clicks "Create Session"
    │   └─ Modal Opens: Enter reason (optional)
    │   └─ Reason: "Testing job application flow for issue #1234"
    │
    ├─ Clicks "Create Session" Button
    │   └─ API Call: POST /api/admin/impersonate
    │       ├─ Creates: impersonation_sessions record
    │       ├─ Generates: JWT token with impersonation flag
    │       ├─ Expires: 1 hour from now
    │       └─ Logs: Admin action in notifications
    │
    ├─ System Displays
    │   ├─ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    │   ├─ Copy Button: [Copy to Clipboard]
    │   ├─ Show/Hide Toggle: 👁️ 🔐
    │   └─ Expiration: 2024-01-15 11:30:00 (60 minutes)
    │
    ├─ Admin Copies Token & Opens New Window
    │   └─ Uses token to login as John Smith
    │
    ├─ Frontend Detects Impersonation
    │   ├─ Shows Banner: "Impersonating John Smith"
    │   ├─ Locks Sensitive Actions
    │   └─ Logs All Activity
    │
    ├─ Admin Tests As John
    │   ├─ Browses job offers
    │   ├─ Reviews applications
    │   ├─ Checks messages
    │   └─ Identifies issue with UI
    │
    ├─ Admin Returns to Admin Panel
    │   └─ Views "Active Sessions"
    │   ├─ Session ID: 99
    │   ├─ User: John Smith
    │   ├─ Started: 2 minutes ago
    │   ├─ Expires: 58 minutes remaining
    │   ├─ Admin: Me
    │   └─ Action: [End Session Now]
    │
    ├─ Admin Clicks "End Session"
    │   └─ API Call: DELETE /api/admin/impersonation/sessions/99
    │       └─ Updates: ended_at = NOW()
    │       └─ Token becomes invalid
    │
    ├─ John's Session (If Active) Gets Logged Out
    │   └─ Receives notification: "Session ended by admin"
    │
    ├─ Admin Views Final Stats
    │   ├─ Active Sessions: 0
    │   └─ Sessions Today: 2
    │
    └─ Task Complete ✓
```

---

## Component Hierarchy

```
Admin.tsx
  │
  ├─ TabsList
  │   ├─ TabsTrigger (Dashboard)
  │   ├─ TabsTrigger (Users)
  │   ├─ TabsTrigger (Offers)
  │   ├─ TabsTrigger (Formations)
  │   ├─ TabsTrigger (Notifications)
  │   ├─ TabsTrigger (Applications)
  │   ├─ TabsTrigger (Analytics)
  │   ├─ TabsTrigger (Finance)
  │   ├─ TabsTrigger (Modération) ✨
  │   ├─ TabsTrigger (Certifications) ✨
  │   └─ TabsTrigger (Usurpation) ✨
  │
  └─ TabsContent
      ├─ TabsContent (value="moderation")
      │   └─ ModerateContent ✨
      │       ├─ SearchBar
      │       ├─ TabsList
      │       │   ├─ TabsTrigger (All)
      │       │   ├─ TabsTrigger (Pinned)
      │       │   ├─ TabsTrigger (Hidden)
      │       │   └─ TabsTrigger (Recent)
      │       ├─ StatCard (4x)
      │       │   ├─ Total Publications
      │       │   ├─ Pinned Count
      │       │   ├─ Hidden Count
      │       │   └─ Recent Count
      │       └─ PublicationCard (repeating)
      │           ├─ Author Info
      │           ├─ Content Preview
      │           ├─ Engagement Metrics
      │           ├─ Pin Button
      │           ├─ Hide Button
      │           └─ Delete Button
      │
      ├─ TabsContent (value="certifications")
      │   └─ CertificationValidation ✨
      │       ├─ SearchBar
      │       ├─ TabsList
      │       │   ├─ TabsTrigger (Pending)
      │       │   ├─ TabsTrigger (Approved)
      │       │   └─ TabsTrigger (Rejected)
      │       ├─ StatCard (5x)
      │       │   ├─ Pending Count
      │       │   ├─ Approved Count
      │       │   ├─ Rejected Count
      │       │   ├─ Verified Users
      │       │   └─ Unverified Users
      │       └─ CertificationCard (repeating)
      │           ├─ User Info
      │           ├─ Status Badge
      │           ├─ Document Types
      │           ├─ Preview Button
      │           ├─ Approve Button
      │           ├─ Reject Button
      │           └─ DocumentPreviewModal
      │               ├─ Document Image
      │               ├─ Download Link
      │               └─ Close Button
      │
      └─ TabsContent (value="impersonate")
          └─ ImpersonateUser ✨
              ├─ SearchBar
              ├─ TabsList
              │   ├─ TabsTrigger (Candidates)
              │   ├─ TabsTrigger (Companies)
              │   └─ TabsTrigger (Admins)
              ├─ UserCard (repeating)
              │   ├─ Avatar
              │   ├─ Name
              │   ├─ Email
              │   ├─ Stats
              │   └─ Create Session Button
              │       └─ SessionCreationModal
              │           ├─ Reason Input
              │           ├─ Create Button
              │           └─ Token Display
              │               ├─ Copy Button
              │               ├─ Show/Hide Toggle
              │               └─ Expiration Timer
              │
              └─ ActiveSessionsTable
                  ├─ User Name Column
                  ├─ Admin Name Column
                  ├─ Duration Column
                  ├─ Expiration Column
                  └─ End Session Button

```

---

## Data Flow Diagram

```
Frontend Components
        │
        ├─ React Query (useQuery/useMutation)
        │   │
        │   ├─ Cache Layer
        │   │   └─ Stores: API responses
        │   │
        │   └─ Invalidation Triggers
        │       └─ Refreshes: On mutation success
        │
        ├─ Local State (useState)
        │   │
        │   └─ Stores: UI state, filters, modals
        │
        └─ Event Handlers
            │
            └─ Calls API mutations (POST/PUT/DELETE)
                │
                ├─ onSuccess
                │   ├─ Invalidate queries
                │   ├─ Show success toast
                │   └─ Refresh UI
                │
                └─ onError
                    ├─ Show error toast
                    └─ Log error

                        │
                        ▼
                    
                Backend API (Express)
                        │
                        ├─ Route Matching
                        │   └─ /api/admin/...
                        │
                        ├─ Authentication Middleware
                        │   └─ Verify JWT token
                        │
                        ├─ Authorization Middleware
                        │   └─ Check admin role
                        │
                        ├─ Validation
                        │   └─ Input validation
                        │
                        └─ Business Logic
                            │
                            ├─ Database Query
                            │   └─ PostgreSQL
                            │
                            ├─ Data Processing
                            │   └─ Format response
                            │
                            └─ Notifications
                                └─ User alerts

                                    │
                                    ▼

                                Database
                                    │
                                    ├─ Tables
                                    │   ├─ publications
                                    │   ├─ verification_requests
                                    │   ├─ impersonation_sessions
                                    │   ├─ users
                                    │   └─ user_documents
                                    │
                                    ├─ Queries
                                    │   ├─ SELECT
                                    │   ├─ INSERT
                                    │   ├─ UPDATE
                                    │   └─ DELETE
                                    │
                                    └─ Indexes
                                        └─ is_pinned
```

---

## Security Model

```
Unauthenticated User
    │
    ├─ Request to /api/admin/*
    │   └─ Error 401: Unauthorized
    │
    └─ Access Denied ❌

Authenticated User (No Admin Role)
    │
    ├─ Request to /api/admin/*
    │   └─ Error 403: Forbidden
    │
    └─ Access Denied ❌

Authenticated Admin User
    │
    ├─ JWT Token Valid?
    │   └─ YES: Continue
    │
    ├─ Role = 'admin' or 'super_admin'?
    │   └─ YES: Continue
    │
    ├─ Input Validation
    │   └─ All parameters valid?
    │   └─ YES: Continue
    │
    ├─ Business Logic
    │   └─ Permission check
    │   └─ YES: Execute
    │
    ├─ Database Operation
    │   └─ Parameterized query (prevent SQL injection)
    │   └─ Audit log (optional)
    │
    ├─ Response Sent
    │   └─ Safe error messages (no internals)
    │
    └─ Access Granted ✓
```

---

## Timeline View

```
Admin Impersonation Session

11:00 AM - Admin creates session
          │
          ├─ Creates: impersonation_sessions record
          ├─ Generates: JWT token
          ├─ Sets: expires_at = 12:00 PM (1 hour)
          │
          ▼
11:05 AM - Session active
          │
          ├─ Admin logged in as user
          ├─ Testing features
          ├─ Time remaining: 55 minutes
          │
          ▼
11:20 AM - Issue found!
          │
          ├─ Admin identifies problem
          ├─ Documents findings
          └─ Time remaining: 40 minutes
          │
          ▼
11:25 AM - Admin ends session manually
          │
          ├─ Clicks: "End Session Now"
          ├─ Updates: ended_at = NOW()
          ├─ Token: INVALID ❌
          ├─ Impersonated user: Logged out
          │
          ▼
11:26 AM - Session history
          │
          ├─ Duration: 26 minutes
          ├─ Reason: Testing issue #1234
          ├─ Status: Ended by admin
          │
          └─ Audit trail complete ✓
```

---

## Status Indicators

### Moderation
```
✓ Published    - Active on platform
☑ Pinned       - Featured at top
☐ Hidden       - Not visible to users
✕ Deleted      - Permanently removed
```

### Certification
```
⏳ Pending     - Awaiting review
✓ Approved    - User is certified
✗ Rejected    - Needs resubmission
🔄 Revoked    - Previously certified, now revoked
```

### Impersonation
```
🟢 Active      - Session in progress
🔴 Expired     - Time limit exceeded
⚫ Ended       - Manually terminated
```

---

## Summary

This visual overview shows how all three modules work together to provide comprehensive admin supervision of your platform. For detailed API documentation, see the DOCS folder.

