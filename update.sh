#!/usr/bin/env bash
# Actualiza la aplicacion "Reglamento Hotel Mansion del Viajero" a la ultima version de GitHub.
# Uso (dentro de la carpeta clonada del repo):
#   ./update.sh          (como root)
#   sudo ./update.sh     (como usuario normal)
set -euo pipefail

SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SOURCE_DIR}"

echo "== Descargando la ultima version desde GitHub =="
git fetch origin
git reset --hard origin/main

echo "== Reinstalando y reiniciando el servicio =="
if [[ $EUID -eq 0 ]]; then
  ./install.sh
else
  sudo ./install.sh
fi


echo ""
echo "Actualización completada."
