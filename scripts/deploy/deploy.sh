#!/usr/bin/env bash
set -euo pipefail

ENTORNO="${1:?Uso: deploy.sh <staging|production>}"
: "${VERCEL_TOKEN:?Falta VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?Falta VERCEL_ORG_ID}"
: "${VERCEL_PROJECT_ID:?Falta VERCEL_PROJECT_ID}"

echo "Desplegando a $ENTORNO"
npm install --global vercel@latest

vercel pull --yes --environment=production --token="$VERCEL_TOKEN"
vercel build --prod --token="$VERCEL_TOKEN"
URL=$(vercel deploy --prebuilt --prod --token="$VERCEL_TOKEN")
echo "Despliegue creado: $URL"

vercel promote "$URL" --token="$VERCEL_TOKEN" || echo "promote omitido (el despliegue ya es el activo)"

echo "url=$URL" >> "${GITHUB_OUTPUT:-/dev/null}"
