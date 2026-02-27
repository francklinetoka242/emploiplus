/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * TESTING GUIDE: Complete Job Offers Workflow
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This document describes the complete flow of job offer creation and display
 * from admin panel to public pages.
 *
 * STATUS: ✅ READY FOR TESTING
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 * ARCHITECTURE OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * 1. DATABASE LAYER
 *    └─ Table: jobs (PostgreSQL)
 *       ├─ id (PK, auto-increment)
 *       ├─ title (text, NOT NULL)
 *       ├─ description (text, NOT NULL)
 *       ├─ company (text)
 *       ├─ location (text)
 *       ├─ sector (text)
 *       ├─ type (text) - CDI, CDD, Stage, Freelance
 *       ├─ salary (text)
 *       ├─ salary_min, salary_max (numeric)
 *       ├─ job_type (varchar) - full-time, part-time, contract
 *       ├─ experience_level (varchar)
 *       ├─ requirements (text)
 *       ├─ published (boolean, DEFAULT false)
 *       ├─ is_closed (boolean, DEFAULT false)
 *       ├─ image_url (text)
 *       ├─ application_url (text)
 *       ├─ application_via_emploi (boolean)
 *       ├─ deadline_date (timestamp)
 *       ├─ created_at (timestamp, DEFAULT now())
 *       └─ updated_at (timestamp)
 *
 * 2. BACKEND API LAYER
 *    └─ Routes: /api/admin/jobs (Super Admin required)
 *       ├─ POST /api/admin/jobs
 *       │  └─ Create new job offer
 *       ├─ GET /api/admin/jobs
 *       │  └─ List all jobs (admin panel)
 *       ├─ GET /api/admin/jobs/:id
 *       │  └─ Get single job details
 *       ├─ PATCH /api/admin/jobs/:id
 *       │  └─ Update job or publish/unpublish
 *       └─ DELETE /api/admin/jobs/:id
 *          └─ Delete job
 *
 *    └─ Routes: /api/jobs (Public)
 *       ├─ GET /api/jobs
 *       │  └─ List published jobs with filters
 *       └─ GET /api/jobs/:id
 *          └─ Get published job details
 *
 * 3. FRONTEND COMPONENTS
 *    └─ Admin Panel
 *       ├─ JobForm.tsx
 *       │  ├─ Creates new job offers
 *       │  ├─ Edits existing offers
 *       │  └─ Maps form fields to API schema
 *       └─ JobList.tsx
 *          ├─ Lists all jobs (admin)
 *          ├─ Toggle publish status
 *          └─ Edit / Delete functionality
 *
 *    └─ Public Pages
 *       ├─ Jobs.tsx (/emplois)
 *       │  ├─ Displays published jobs
 *       │  ├─ JobListSkeleton while loading
 *       │  ├─ Infinite scroll pagination
 *       │  └─ Search & Filter
 *       └─ JobListItem.tsx
 *          ├─ Displays job card details
 *          └─ Apply button
 *
 * 4. API CLIENT (Frontend)
 *    └─ lib/api.ts
 *       ├─ getAdminJobs()      → GET /api/admin/jobs
 *       ├─ createAdminJob()    → POST /api/admin/jobs
 *       ├─ updateAdminJob()    → PATCH /api/admin/jobs/:id
 *       ├─ publishJob()        → PATCH /api/admin/jobs/:id (publish)
 *       ├─ deleteAdminJob()    → DELETE /api/admin/jobs/:id
 *       ├─ getJobs()           → GET /api/jobs (public)
 *       └─ deleteJob()         → DELETE /api/jobs/:id
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * FORM FIELD MAPPING
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Frontend Form Field              Backend API Field             Database Column
 * ────────────────────────────────────────────────────────────────────────────────
 * title *                          title                         title
 * company *                        company                       company
 * location *                       location                      location
 * sector                           sector                        sector
 * type (CDI/CDD/Stage/Freelance)  type                          type
 * job_type (full-time, etc.)       job_type                      job_type
 * salary                           salary                        salary
 *                                  salary_min                    salary_min
 *                                  salary_max                    salary_max
 * requirements                     requirements                  requirements
 * experience_level                 experience_level              experience_level
 * description *                    description                   description
 * image_url                        image_url                     image_url
 * application_url                  application_url               application_url
 * application_via_emploi           application_via_emploi        application_via_emploi
 * deadline_date                    deadline_date                 deadline_date
 * (auto)                           published (false by default)  published
 * (auto)                           is_closed (false by default)  is_closed
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TESTING CHECKLIST
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * PHASE 1: Admin Form Submission
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] Open Admin Dashboard
 * [ ] Navigate to Job Management section
 * [ ] Click "Create New Job Offer" button
 * [ ] Fill the form with test data:
 *     ✓ Title: "Senior Developer - Test"
 *     ✓ Company: "Test Company Inc."
 *     ✓ Location: "Paris, France"
 *     ✓ Sector: "Informatique"
 *     ✓ Type: "CDI"
 *     ✓ Experience Level: "Senior"
 *     ✓ Salary: "50000 - 70000"
 *     ✓ Requirements: "JavaScript, React, Node.js"
 *     ✓ Application URL: https://example.com/apply
 *     ✓ Enable "Candidature via EmploiPlus"
 *     ✓ Deadline: 2026-03-31
 *     ✓ Description: (detailed job description)
 *     ✓ Image: (upload company logo)
 * [ ] Click "Create Job" / "Publish" button
 * [ ] Verify success toast: "Offre créée avec succès !"
 * [ ] Job should appear in the admin jobs list
 * [ ] Status should be "Brouillon" (Draft)
 *
 * PHASE 2: Job Publication
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] Return to Job List in admin panel
 * [ ] Find the newly created job
 * [ ] Click the eye icon to publish the job
 * [ ] Verify toggle success: "Offre publiée"
 * [ ] Job status should change to "Publiée" (Published)
 * [ ] Job should now be visible on public pages
 *
 * PHASE 3: Public Page Display
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] Navigate to public /emplois page
 * [ ] Wait for page to load (observe JobListSkeleton while loading)
 * [ ] Verify the job appears in the list
 * [ ] Check job card displays:
 *     ✓ Title correctly
 *     ✓ Company name
 *     ✓ Location
 *     ✓ Sector badge
 *     ✓ Type badge (CDI)
 *     ✓ Salary if provided
 *     ✓ Experience level
 *     ✓ Company image/logo
 *     ✓ Description preview (truncated)
 * [ ] Click "See More" to expand job details
 * [ ] Verify full description displays
 * [ ] All fields should format correctly (dates, salary ranges, etc.)
 *
 * PHASE 4: Administrative Actions
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] In admin panel, edit the job
 * [ ] Change description
 * [ ] Click save
 * [ ] Verify update on public page (may need refresh)
 * [ ] Unpublish the job
 * [ ] Verify job disappears from public /emplois page
 * [ ] Republish the job
 * [ ] Verify job reappears on public page
 * [ ] Delete the job from admin panel
 * [ ] Verify deletion & removal from public pages
 * [ ] Verify job no longer exists in database
 *
 * PHASE 5: UI/UX & Performance
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] Verify loading skeleton appears while fetching
 * [ ] Check no layout shift when skeleton is replaced with actual content
 * [ ] Verify pagination/infinite scroll works correctly
 * [ ] Check responsive design on mobile
 * [ ] Verify filter chips work correctly
 * [ ] Test search functionality
 * [ ] Check that long text truncates properly
 * [ ] Verify dates display in correct format
 * [ ] Check that optional fields don't display if empty
 * [ ] Verify image loads correctly
 * [ ] Test application URL links work
 *
 * PHASE 6: Edge Cases
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * [ ] Create job with minimal fields (only title & description)
 * [ ] Create job with all optional fields filled
 * [ ] Create job with very long description
 * [ ] Create job with special characters in title
 * [ ] Create job with salary range formatting variations
 * [ ] Verify form validation works (required fields)
 * [ ] Test cancel/close form without saving
 * [ ] Test concurrent job creation
 * [ ] Test editing published vs draft jobs
 * [ ] Verify admin auth required for admin endpoints
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * API CONTRACT EXAMPLES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * POST /api/admin/jobs
 * ────────────────────────────────────────────────────────────────────────────
 * 
 * Request:
 * {
 *   "title": "Senior Full Stack Developer",
 *   "description": "We are looking for...",
 *   "company": "TechVision Inc.",
 *   "location": "Paris, France",
 *   "sector": "Informatique",
 *   "type": "CDI",
 *   "experience_level": "Senior",
 *   "salary": "50000 - 70000 EUR",
 *   "salary_min": 50000,
 *   "salary_max": 70000,
 *   "requirements": "JavaScript, React, Node.js, PostgreSQL",
 *   "application_url": "https://example.com/apply",
 *   "application_via_emploi": true,
 *   "deadline_date": "2026-03-31",
 *   "image_url": "https://cdn.example.com/logo.png",
 *   "published": false,
 *   "is_closed": false
 * }
 *
 * Response (201 Created):
 * {
 *   "message": "Offre créée avec succès",
 *   "job": {
 *     "id": 3,
 *     "title": "Senior Full Stack Developer",
 *     "description": "We are looking for...",
 *     "company": "TechVision Inc.",
 *     "location": "Paris, France",
 *     "sector": "Informatique",
 *     "type": "CDI",
 *     "experience_level": "Senior",
 *     "salary": "50000 - 70000 EUR",
 *     "salary_min": 50000,
 *     "salary_max": 70000,
 *     "requirements": "JavaScript, React, Node.js, PostgreSQL",
 *     "application_url": "https://example.com/apply",
 *     "application_via_emploi": true,
 *     "deadline_date": "2026-03-31",
 *     "image_url": "https://cdn.example.com/logo.png",
 *     "published": false,
 *     "is_closed": false,
 *     "created_at": "2026-02-23T20:00:00Z",
 *     "updated_at": "2026-02-23T20:00:00Z"
 *   }
 * }
 *
 * ────────────────────────────────────────────────────────────────────────────
 *
 * PATCH /api/admin/jobs/{id} (Publish)
 * 
 * Request:
 * {
 *   "published": true,
 *   "published_at": "2026-02-23T20:00:00Z"
 * }
 *
 * Response:
 * {
 *   "message": "Offre mise à jour avec succès",
 *   "job": {
 *     // ... job with published: true
 *   }
 * }
 *
 * GET /api/jobs (Public)
 * 
 * Response:
 * [
 *   {
 *     "id": 3,
 *     "title": "Senior Full Stack Developer",
 *     "company": "TechVision Inc.",
 *     "location": "Paris, France",
 *     "published": true,
 *     // ... other fields
 *   }
 * ]
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * TROUBLESHOOTING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Problem: Form submission fails with "Serveur injoignable"
 * Solution:
 *   1. Check adminToken is in localStorage
 *   2. Verify admin is authenticated
 *   3. Check backend API is running
 *   4. Check network tab for actual error
 *
 * Problem: Job doesn't appear on public page after publishing
 * Solution:
 *   1. Refresh the public page
 *   2. Check published flag is true in database
 *   3. Check is_closed is false
 *   4. Verify API getJobs() includes the job
 *
 * Problem: Skeleton doesn't appear on load
 * Solution:
 *   1. Check JobListSkeleton import is correct
 *   2. Verify isLoading state is triggered
 *   3. Check network throttling in DevTools
 *
 * Problem: Image doesn't upload
 * Solution:
 *   1. Check file size (max 5MB)
 *   2. Verify file format (JPG, PNG, WebP)
 *   3. Check upload endpoint /api/upload exists
 *   4. Verify adminToken is sent
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * BROWSER DEVELOPER TOOLS DEBUGGING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * 1. Network Tab
 *    - Watch POST /api/admin/jobs request
 *    - Verify status is 201 or in 2xx range
 *    - Check request body format
 *    - Verify Authorization header is present
 *
 * 2. Application Tab
 *    - Check localStorage.adminToken exists
 *    - Verify token value is not empty
 *
 * 3. Console
 *    - Look for fetch errors
 *    - Check api.ts errors
 *    - Verify React Query state
 *
 * 4. Performance
 *    - Use Chrome DevTools Lighthouse
 *    - Check Core Web Vitals
 *    - Verify no layout shifts (CLS)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * FILES MODIFIED IN THIS PHASE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Backend:
 * - src/controllers/admin-jobs.controller.ts ✓ (corrected schema)
 * - routes match schema ✓
 *
 * Frontend:
 * - frontend/src/lib/api.ts ✓ (added publishJob)
 * - frontend/src/components/admin/jobs/JobForm.tsx ✓ (fixed field mapping)
 * - frontend/src/components/admin/jobs/JobList.tsx ✓ (fixed API calls)
 * - frontend/src/pages/Jobs.tsx ✓ (added JobListSkeleton import)
 * - frontend/src/components/jobs/JobSkeleton.tsx ✓ (new file)
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const testingGuide = {
  title: "Complete Job Offers Workflow Testing",
  status: "READY",
  version: "1.0",
  createdDate: "2026-02-23",
};
