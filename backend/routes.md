# API Routes

This document lists the API routes exposed by the backend (mounted under `/api` in `backend/server.js`) with HTTP methods, purpose, and authentication requirements. Use the VPS base URL when testing (e.g. `https://emploiplus-group.com` or your VPS IP).

Base prefix: `/api`

## Authentication
- `POST /api/auth/register` — Create a new admin (used for creating the first Super Admin). Public endpoint. Body: `{ first_name, last_name, email, password }`.
- `POST /api/auth/login` — Authenticate admin/user. Public endpoint. Body: `{ email, password }`. Returns JWT token on success.

## Jobs
- `GET /api/jobs` — List jobs. Query: `?limit=&offset=`. Public.
- `GET /api/jobs/:id` — Get job by id. Public.
- `POST /api/jobs` — Create job. Protected (requires JWT). Body: `{ title, description, location, salary, jobType, companyId }`.
- `PUT /api/jobs/:id` — Update job. Protected.
- `DELETE /api/jobs/:id` — Delete job. Protected.

## Formations
- `GET /api/formations` — List formations. Query: `?limit=&offset=&published=true|false`. Public; returns only published items if `published` not specified.
- `GET /api/formations/:id` — Get formation by id. Public (unpublished items will still be returned if queried directly).
- `POST /api/formations/:id/enroll` — Enroll current user in formation. Protected (JWT).

### Admin operations (available under both `/api/formations` with proper role or via `/api/admin/formations`)
- `POST /api/formations` — Create a new formation. Protected (requires admin token, super_admin role).
  Body: `{ title, description, duration, level, price, category?, provider?, published?, image_url?, ... }`.
- `PUT /api/formations/:id` — Update existing formation. Protected (super_admin).
- `PATCH /api/formations/:id/publish` — Set publication status. Body `{ published: boolean }`. Protected.
- `DELETE /api/formations/:id` — Delete formation. Protected.

## Publications
- `GET /api/publications` — List publications. Query: `?limit=&offset=`. Public.
- `GET /api/publications/:id` — Get publication by id. Public.
- `POST /api/publications` — Create publication. Protected (JWT). Body examples: `{ content, image_url?, visibility?, category? }`.
- `DELETE /api/publications/:id` — Delete publication. Protected.

## FAQ
- `GET /api/faq` — List FAQ entries. Public.

## Notifications
- `GET /api/notifications` — List notifications for current user. Protected (JWT). Query: `?limit=&offset=`.
- `POST /api/notifications/:id/read` — Mark notification as read. Protected.

## Dashboard
- `GET /api/dashboard/stats` — Retrieve dashboard stats (admin-protected). Protected (JWT).

## Services
- `GET /api/services` — List available services. Public.

## Companies
- `GET /api/companies` — List companies. Query: `?limit=&offset=`. Public.
- `GET /api/companies/:id` — Get company by id. Public.

## Users
- `GET /api/users` — List users. Query: `?limit=&offset=`. Public.
- `GET /api/users/:id` — Get user by id. Public.

## Uploads
- `POST /api/uploads/candidate` — Upload candidate document. Protected (JWT). Form field: `file` (single file). Uses multipart form-data.

---

Testing examples (use your VPS base URL):

1) Create Super Admin (register):

```bash
curl -X POST https://emploiplus-group.com/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Admin","last_name":"User","email":"admin@example.com","password":"strongpass"}'
```

2) Login to obtain JWT:

```bash
curl -X POST https://emploiplus-group.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"strongpass"}'
```

3) Create a job (example, requires Authorization header):

```bash
curl -X POST https://emploiplus-group.com/api/jobs \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <JWT_TOKEN>' \
  -d '{"title":"Dev","description":"Job desc","location":"Remote","salary":"neg","jobType":"full-time","companyId":1}'
```

Notes:
- The backend mounts authentication routes at `/api/auth` (see `backend/server.js`). The frontend previously used `/api/auth/admin/register` which caused 404; calls should target `/api/auth/register`.
- If you prefer to keep the old frontend path (e.g. because your production frontend still calls `/api/auth/admin/register` on the VPS), consider adding a compatibility route on the backend that proxies `/admin/register` → `/register`.
- When testing from your VPS, use the VPS base URL (domain or IP) and ensure environment variables like `JWT_SECRET` and database connection are correctly set on the VPS.

If you want, I can also add a compatibility alias route on the backend to accept `/api/auth/admin/register` and forward it to the same controller.
