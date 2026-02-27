# Environment Variables

## Backend (`backend/.env`)

- `APP_NAME` — app name.
- `APP_ENV` — e.g. `local`.
- `APP_KEY` — Laravel key.
- `APP_DEBUG` — `true`/`false`.
- `APP_URL` — backend URL.
- `DB_CONNECTION` — `sqlite` (default) or `pgsql`.
- `DB_DATABASE` — for sqlite: `database/database.sqlite`.
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` — for postgres.
- `QUEUE_CONNECTION` — queue driver (`database` default).
- `QUEUE_CONNECTION` — queue driver (`database` default).
- `MAIL_MAILER` and `MAIL_*` — required for scheduled email delivery.
- `MAIL_*` — mail provider variables.

### External V2 API (bootstrap defaults)

- `EMS_V2_API_BASE_URL=http://185.69.53.225:5001/v2`
- `EMS_V2_API_TOKEN=f9c2f80e1c0e5b6a3f7f40e6f2e9c9d0af7eaabc6b37a4d9728e26452b81fc13`
- `EMS_V2_API_TIMEOUT=20`
- `EMS_V2_API_RETRY_TIMES=2`

## Auth

- Login endpoint returns bearer token (`/api/v1/auth/login`).
- Include header: `Authorization: Bearer <token>` for authenticated APIs.
- Local fallback header `X-User-Id` is still accepted for bootstrap compatibility.

## Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1`
- `NEXT_PUBLIC_API_USER_ID=1`
