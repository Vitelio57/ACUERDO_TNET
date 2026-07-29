#!/usr/bin/env bash
# Actualiza la aplicacion "Reglamento Hotel Mansion del Viajero" a la ultima version de GitHub.
# Uso (dentro de la carpeta clonada del repo):
#   ./update.sh
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SOURCE_DIR}"

if [[ $EUID -eq 0 ]]; then
  echo "Ejecuta este script como tu usuario normal (sin sudo), no como root." >&2
  exit 1
fi

echo "== Descargando la ultima version desde GitHub =="
git fetch origin
git reset --hard origin/main

echo "== Reinstalando y reiniciando el servicio =="
sudo ./install.sh

echo ""
echo "Actualización completada."
