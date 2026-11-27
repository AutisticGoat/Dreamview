#!/usr/bin/env bash
set -uo pipefail

BASE="${1:?Uso: smoke.sh <url-base>}"
BASE="${BASE%/}"
fallos=0

ok()   { echo "  OK     $1"; }
fail() { echo "  FALLO  $1"; fallos=$((fallos + 1)); }

estado() {
  local nombre="$1" ruta="$2" esperado="$3" codigo
  codigo=$(curl -s -o /dev/null --max-time 20 -w '%{http_code}' "$BASE$ruta" || true)
  if [[ "$codigo" =~ ^($esperado)$ ]]; then
    ok "$nombre ($codigo)"
  else
    fail "$nombre: se esperaba $esperado y llegó $codigo"
  fi
}

contiene() {
  local nombre="$1" ruta="$2" patron="$3" cuerpo
  cuerpo=$(curl -s --max-time 20 "$BASE$ruta" || true)
  if grep -q "$patron" <<< "$cuerpo"; then
    ok "$nombre"
  else
    fail "$nombre: la respuesta no contiene $patron"
  fi
}

redirige() {
  local nombre="$1" ruta="$2" destino="$3" salida
  salida=$(curl -s -o /dev/null --max-time 20 -w '%{http_code} %{redirect_url}' "$BASE$ruta" || true)
  if [[ "$salida" =~ ^30[0-9]\ .*$destino ]]; then
    ok "$nombre ($salida)"
  else
    fail "$nombre: se esperaba redirección a $destino y llegó '$salida'"
  fi
}

echo "Pruebas de humo en $BASE"
estado   "Página de inicio"                       "/"                    "200"
estado   "Página de login"                        "/auth/login"          "200"
contiene "Health check"                           "/api/health"          '"status":"ok"'
contiene "Proveedores de autenticación"           "/api/auth/providers"  "credentials"
estado   "API protegida sin sesión (CP-08)"       "/api/dreams"          "401"
redirige "Ruta protegida redirige al login"       "/dashboard"           "/auth/login"

if [ "$fallos" -gt 0 ]; then
  echo "$fallos prueba(s) fallaron"
  exit 1
fi
echo "Todas las pruebas de humo pasaron"
