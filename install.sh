#!/usr/bin/env bash
# Instala la aplicacion "Reglamento Hotel Mansion del Viajero" como servicio systemd en Ubuntu Server.
# Uso:
#   sudo ./install.sh
#   sudo APP_PORT=8095 ./install.sh   (para elegir otro puerto)
set -euo pipefail

APP_NAME="reglamento-hotel"
APP_DIR="/opt/${APP_NAME}"
APP_PORT="${APP_PORT:-8095}"
APP_USER="reglamento"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ $EUID -ne 0 ]]; then
  echo "Este script debe ejecutarse como root (usa: sudo ./install.sh)" >&2
  exit 1
fi

echo "== Instalando dependencias del sistema =="
apt-get update -y
apt-get install -y curl rsync ufw

if ! command -v node >/dev/null 2>&1; then
  echo "== Instalando Node.js 20.x LTS =="
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "== Creando usuario de servicio =="
if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home "${APP_DIR}" --shell /usr/sbin/nologin "${APP_USER}"
fi

echo "== Copiando la aplicación a ${APP_DIR} =="
mkdir -p "${APP_DIR}"
rsync -a --exclude 'node_modules' --exclude 'data' --exclude '.git' "${SOURCE_DIR}/" "${APP_DIR}/"

echo "== Instalando dependencias de Node =="
cd "${APP_DIR}"
npm ci --omit=dev

mkdir -p "${APP_DIR}/data/pdfs"
chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "== Configurando servicio systemd =="
cat > "/etc/systemd/system/${APP_NAME}.service" <<EOF
[Unit]
Description=Reglamento Hotel Mansion del Viajero
After=network.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${APP_DIR}
Environment=PORT=${APP_PORT}
Environment=NODE_ENV=production
ExecStart=$(command -v node) ${APP_DIR}/server.js
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable "${APP_NAME}"
systemctl restart "${APP_NAME}"

echo "== Configurando firewall (puerto ${APP_PORT}) =="
if command -v ufw >/dev/null 2>&1; then
  ufw allow "${APP_PORT}/tcp" || true
fi

IP_LOCAL="$(hostname -I | awk '{print $1}')"
echo ""
echo "======================================================"
echo " Instalación completada."
echo " Abre en el navegador de la tablet de recepción:"
echo "   http://${IP_LOCAL}:${APP_PORT}"
echo " Panel de documentos firmados:"
echo "   http://${IP_LOCAL}:${APP_PORT}/admin.html"
echo ""
echo " Ver estado:   systemctl status ${APP_NAME}"
echo " Ver logs:     journalctl -u ${APP_NAME} -f"
echo " Reiniciar:    systemctl restart ${APP_NAME}"
echo "======================================================"
