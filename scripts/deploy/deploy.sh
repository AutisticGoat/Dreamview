#!/usr/bin/env bash
set -euo pipefail

ENTORNO="${1:?Uso: deploy.sh <staging|production>}"
: "${VERCEL_TOKEN:?Falta VERCEL_TOKEN}"
: "${VERCEL_ORG_ID:?Falta VERCEL_ORG_ID}"
: "${VERCEL_PROJECT_ID:?Falta VERCEL_PROJECT_ID}"

echo "Desplegando a $ENTORNO"
npm install --global vercel@latest

# El build se hace en Vercel: ahi estan las variables marcadas como Sensitive,
# que no se pueden descargar con "vercel pull".
URL=$(vercel deploy --prod --yes --token="$VERCEL_TOKEN")
echo "Despliegue creado: $URL"

vercel promote "$URL" --yes --token="$VERCEL_TOKEN" || echo "promote omitido (el despliegue ya es el activo)"

echo "url=$URL" >> "${GITHUB_OUTPUT:-/dev/null}"
