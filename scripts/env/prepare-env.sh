#!/usr/bin/env bash
set -euo pipefail

ENTORNO="${1:?Uso: prepare-env.sh <staging|production>}"

requeridas=(DATABASE_URL VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID APP_URL)
faltan=()
for variable in "${requeridas[@]}"; do
  if [ -z "${!variable:-}" ]; then
    faltan+=("$variable")
  fi
done

if [ "${#faltan[@]}" -gt 0 ]; then
  echo "Faltan variables para $ENTORNO: ${faltan[*]}"
  exit 1
fi

echo "Aplicando migraciones en $ENTORNO"
npx prisma migrate deploy

echo "Sembrando datos iniciales (emociones)"
npx prisma db seed

echo "Entorno $ENTORNO listo"
