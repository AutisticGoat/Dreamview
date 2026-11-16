#!/usr/bin/env bash
set -uo pipefail

BASE="${1:?Uso: verify.sh <url-base> [intentos] [espera-segundos]}"
BASE="${BASE%/}"
INTENTOS="${2:-10}"
ESPERA="${3:-6}"

for intento in $(seq 1 "$INTENTOS"); do
  codigo=$(curl -s -o /dev/null --max-time 15 -w '%{http_code}' "$BASE/api/health" || true)
  if [ "$codigo" = "200" ]; then
    echo "La app respondió correctamente (intento $intento)"
    exit 0
  fi
  echo "Intento $intento/$INTENTOS: código $codigo, reintentando en ${ESPERA}s"
  sleep "$ESPERA"
done

echo "La app no respondió a tiempo en $BASE"
exit 1
