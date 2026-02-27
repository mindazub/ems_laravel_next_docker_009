# REBUILD_PROGRESS

## Phase 1 — Discovery & Gap Matrix

- Parsed `DEV_ASSETS/master_prompt.txt`.
- Extracted SQLite backup and generated schema/migration inventories.
- Recovered source module hints from `code_items` table file path index.
- Created initial parity matrix.

## Phase 2 — Foundation Setup

- Scaffolded Laravel backend in `backend/`.
- Scaffolded Next.js + TypeScript frontend in `frontend/`.
- Wired API routing and middleware aliases in Laravel bootstrap.
- Added EMS V2 config mapping via `config/plants.php` + env values.
- Copied bootstrap SQLite database to `backend/database/database.sqlite`.

## Phase 3 — Domain & API Layer

Implemented initial parity endpoints and modules:

- auth login/register
- plants list/show/view/events/reaggregated-data
- scada/json diagrams
- customers CRUD
- report email jobs + templates read
- translations endpoint
- backups settings read/update
- admin activity/queue/analytics summary

## Phase 4 — Frontend Layer

Implemented app shell and key modules:

- role-grouped sidebar
- dark mode toggle
- brand font toggle (Arial Nova vs default)
- plants page + charts (Chart.js + Recharts)
- plant detail page
- reports page
- admin activity/users pages
- settings scaffold page

## Phase 5 — Background Processing & Ops

- Implemented queue/scheduler jobs:
  - `ProcessEmailJobsJob`
  - `RunBackupJob`
  - `QueueWatchdogJob`
- Added admin queue operations endpoints (restart/retry/scheduler run-now).
- Added backup lifecycle APIs (create/list/download/delete/restore).

## Hardening Increment (current)

- Added token-based API auth with `api_tokens` table and bearer token issuance/revocation.
- Kept local `X-User-Id` fallback for immediate bootstrap compatibility.
- Implemented end-to-end 2FA flow:
  - login challenge token issuance
  - TOTP challenge verify
  - recovery code challenge verify
  - setup/confirm/regenerate/disable endpoints
  - frontend login and challenge screens
  - frontend settings 2FA management
- Expanded CRUD APIs for:
  - auth support flows (forgot/reset password, email verification token, profile update, password update)
  - documentations
  - report templates/wysiwyg templates + assignments
  - email job update/delete/send-now
  - translations create/update/delete
  - customer-to-plant assignments
  - customer Rekvizitai enrichment scraping endpoint
  - user-to-plant approval/rejection workflow
- Added report export endpoint and wired frontend export actions.
- Added admin API surface/UI for:
  - queue view and controls
  - analytics page
  - users listing and role/status/suspension update management
  - translations admin page
  - docs admin page
  - user-plant approvals page
  - API docs page
- Added frontend pages for:
  - SCADA/JSON diagrams
  - documentation viewer
  - staff customer assignment management

## Phase 6 — Verification & Documentation

- Delivery docs created: parity matrix, env vars, runbook, known differences.
- Validation commands and outputs tracked in this workspace session.
- Current validation snapshot:
  - backend tests pass (`php artisan test`)
  - frontend lint passes (`npm run lint`)
  - frontend production build passes (`npm run build`)
  - Recharts prerender container-size warning removed by client-only chart rendering
