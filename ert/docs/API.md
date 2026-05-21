# Axenta ERP API

All `/api/*` routes require `Authorization: Bearer <Firebase ID Token>` unless stated.

## Employees
- `GET /api/employees` CEO/Admin/Head Manager/HR
- `POST /api/employees` CEO/Admin/Head Manager — creates Firebase Auth user + Firestore profile. Body: `name,email,password,role,department,phone?`
- `PATCH /api/employees/:uid` manager/HR update
- `POST /api/employees/:uid/reset-password` admin reset

## Leads / CRM
- `GET /api/leads` role-scoped list
- `POST /api/leads` create lead
- `PATCH /api/leads/:id` update stage, owner, notes, follow-up
- `DELETE /api/leads/:id` managers only
- `POST /api/leads/import` multipart `file` `.csv/.xlsx`

## Tasks
- `GET /api/tasks` managers see all; employees see assigned
- `POST /api/tasks` assign daily work + notification
- `PATCH /api/tasks/:id/status` status update

## Attendance / HR
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance` manager/HR
- `POST /api/attendance/leave-request`

## Communication
- `POST /api/communication/call-log`
- `POST /api/communication/whatsapp` queues message; connect WhatsApp Business API token for production.

## Reports / Notifications / Maps
- `GET /api/reports/summary`
- `POST /api/reports/generate`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/maps/scrape` compliant Google Places API integration placeholder.
