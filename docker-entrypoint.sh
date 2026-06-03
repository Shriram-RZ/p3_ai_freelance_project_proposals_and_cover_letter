#!/bin/sh
set -e

# Apply any pending migrations (no-op if none) before starting the server.
if [ -d ./prisma/migrations ]; then
  echo "Running prisma migrate deploy..."
  ./node_modules/.bin/prisma migrate deploy
else
  echo "No migrations directory found; syncing schema with prisma db push..."
  ./node_modules/.bin/prisma db push --skip-generate
fi

exec "$@"
