# RUNBOOK

## Local startup (Windows)

1. Run `./start.ps1` in repository root.
2. Backend runs on `http://127.0.0.1:8000`.
3. Frontend runs on `http://127.0.0.1:3000`.

## Manual startup

### Backend

- `cd backend`
- `php artisan serve --host=127.0.0.1 --port=8000`

### Queue worker

- `cd backend`
- `php artisan queue:work`

### Scheduler

- `cd backend`
- `php artisan schedule:work`

Scheduled jobs configured:

- `ProcessEmailJobsJob` every 15 minutes
- `QueueWatchdogJob` every 5 minutes
- `RunBackupJob` daily at 02:00

Manual queue/scheduler controls (admin API):

- `POST /api/v1/admin/queue/restart`
- `POST /api/v1/admin/queue/retry-failed`
- `POST /api/v1/admin/scheduler/run-now`

Manual backup lifecycle (admin API):

- `GET /api/v1/backups`
- `POST /api/v1/backups/create`
- `GET /api/v1/backups/download/{filename}`
- `DELETE /api/v1/backups/{filename}`
- `POST /api/v1/backups/restore/{filename}`

### Frontend

- `cd frontend`
- `npm run dev`

## Docker (optional)

- `docker compose up --build`
- Services: backend, frontend, postgres.

## Database

- Initial runtime DB is SQLite (`backend/database/database.sqlite`) copied from `DEV_ASSETS/database` backup.
- Postgres migration path is prepared in compose; schema/data migration is a follow-up step.
