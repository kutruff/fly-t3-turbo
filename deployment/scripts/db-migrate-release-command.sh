#!/bin/bash
set -e

if [ -n "$RELEASE_COMMAND" ]; then
    cd /db-migrate
    CI=true pnpm exec db-migrate
fi