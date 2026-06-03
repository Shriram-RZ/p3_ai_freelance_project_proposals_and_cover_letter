#!/bin/sh
set -e

# Apply any pending migrations (no-op if none) before starting the server.
if [ -d ./prisma/migrations ]; then
  echo "Running prisma migrate deploy..."
  node ./node_modules/prisma/build/index.js migrate deploy
else
  echo "No migrations directory found; syncing schema with prisma db push..."
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

exec "$@"
