#!/usr/bin/env bash
set -euo pipefail

: "${VERCEL_TOKEN:?Falta VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?Falta VERCEL_ORG_ID}"
: "${VERCEL_PROJECT_ID:?Falta VERCEL_PROJECT_ID}"

command -v vercel >/dev/null 2>&1 || npm install --global vercel@latest

echo "Restaurando el despliegue de producción anterior"
vercel rollback --token="$VERCEL_TOKEN" --timeout 60s
echo "Rollback solicitado"
