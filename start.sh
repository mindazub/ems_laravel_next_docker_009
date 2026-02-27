#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Starting backend API server..."
(cd "$ROOT_DIR/backend" && php artisan serve --host=0.0.0.0 --port=8000) &

echo "Starting frontend dev server..."
(cd "$ROOT_DIR/frontend" && npm run dev) &

echo "Starting queue worker..."
(cd "$ROOT_DIR/backend" && php artisan queue:work) &

echo "Starting scheduler worker..."
(cd "$ROOT_DIR/backend" && php artisan schedule:work) &

echo "All services started. Press Ctrl+C to stop this launcher (background processes may continue)."

wait
