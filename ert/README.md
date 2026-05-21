# Axenta Business Consulting — ERP + CRM + Employee Management

Premium SaaS-style, role-based ERP/CRM application built with **Next.js 14, React, Tailwind CSS, Firebase Auth/Firestore/Storage, Express.js, React Query, Framer Motion, charts, CSV/Excel import/export-ready architecture**.

## Included

- Responsive dashboard UI with dark mode, sidebar navigation and premium cards
- Secure Firebase Authentication login; no employee self-registration
- Role-based frontend route protection and backend middleware
- CEO/Admin/Head Manager employee creation + password reset API
- CRM lead stages, lead table, filters, pipeline, communication history structure
- Google Maps scraper/import module UI with Excel parsing and backend import endpoint
- Task assignment, notifications, attendance, HR, operations, reports, settings/profile editing
- Firestore schema, security rules, storage rules, indexes and seed script
- One-command local hosting for frontend + backend

## Roles
CEO, Admin, Head Manager, Team Manager, Sales Executive, Calling Executive, Data Scraper, Operations Team, HR.

## Quick Start — one terminal

```bash
npm run install:all
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000/health

The login page includes a **Demo Role Preview** so you can inspect all dashboards before Firebase users are seeded.

## Firebase Setup

1. Open Firebase Console for project `axientaerp`.
2. Enable **Authentication → Email/Password**.
3. Create a service account key: Project Settings → Service Accounts → Generate private key.
4. Add it to `backend/.env` using one of:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
# or base64:
FIREBASE_SERVICE_ACCOUNT_BASE64=...
```

5. Deploy Firestore rules/indexes if using Firebase CLI:

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```

6. Seed demo accounts:

```bash
npm run seed
```

Demo seeded password for all demo accounts: `Axenta@12345`.

## Firestore Collections

- `users` — auth profile, role, employeeId
- `employees` — employee HR profile
- `leads` — CRM records and Google Maps/import data
- `tasks` — assigned daily work
- `attendance` — check-in/check-out records
- `reports` — generated reports metadata
- `notifications` — realtime notifications
- `call_logs` — calling records
- `messages` — WhatsApp/email message logs
- `departments` — departments
- `permissions` — configurable role permissions
- `activity_logs` — audit log events

## Production Notes

- Firebase web API key is safe to expose in browser apps; security depends on Firebase Auth + Firestore rules.
- Never commit Firebase Admin service account credentials.
- Connect WhatsApp Business API, Google Places API, Cloudinary credentials through environment variables.
- Google Maps extraction should use official Google Places APIs; avoid scraping HTML where prohibited by terms.
- Add CI/CD checks: lint, typecheck, tests and dependency scanning.

## Deployment

### Netlify recommended

This repo is now set up so **Netlify only needs the `frontend/` app**. The employee-management and leave-request APIs used by the UI are available through Next.js route handlers under `frontend/app/api`, so you do **not** need to host the Express backend separately for the current frontend features.

1. Connect this repository to Netlify.
2. Keep the root `netlify.toml` file in place.
3. Add these environment variables in Netlify:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
FIREBASE_PROJECT_ID=...
FIREBASE_SERVICE_ACCOUNT_BASE64=...
# or FIREBASE_SERVICE_ACCOUNT_JSON=...
```

4. Do not set `NEXT_PUBLIC_API_URL` unless you intentionally want to use an external backend. If it is unset, the app uses the same-site `/api` routes automatically.

Netlify build settings from `netlify.toml`:

```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = ".next"
```

### Legacy split deployment

If you still want the old two-service setup:

- Deploy `frontend/` to Vercel/Netlify/Firebase Hosting and set `NEXT_PUBLIC_*` vars.
- Deploy `backend/` to Cloud Run/Render/Railway/Fly.io.
- Set `NEXT_PUBLIC_API_URL` in the frontend to your backend `/api` URL.
- Set `CORS_ORIGIN` in the backend to the frontend domain.

### One process/local terminal

The root `npm run dev` and `npm run start` commands still run both the frontend and backend together using `concurrently`, but for the Netlify path the `frontend/` app is the only required deploy target.

## Folder Structure

```text
frontend/   Next.js app router UI, components, contexts, Firebase config
backend/    Express API with Firebase Admin, role middleware, audit logs
firebase/   Firestore and Storage security rules + indexes
seed/       Demo data manifest
docs/       API documentation
```
