# Reglamento de Hospedaje — Hotel Mansión del Viajero

Aplicación web (sin inicio de sesión) para que los huéspedes lean el reglamento interno
del hotel en **español o inglés**, lo acepten y lo **firmen con el dedo** en una tablet de
recepción. El documento firmado se guarda en el servidor y se puede **ver/descargar en PDF**
en cualquier momento desde el panel de documentos.

- Empresa: **Corporación H&D S.A.**
- Hotel: **Hotel Mansión del Viajero**

## Estructura del proyecto

```
server.js               Servidor Express (API + estáticos)
src/reglamento.js        Contenido legal y textos ES/EN
src/pdf.js                Generación del PDF firmado (pdfkit)
src/store.js               Guardado de registros (data/registros.json) y PDFs (data/pdfs/)
public/                    Frontend (index.html = firma, admin.html = documentos firmados)
scripts/copy-vendor.js     Copia signature_pad al frontend tras npm install
install.sh                 Instalador para Ubuntu Server (systemd)
```

Los documentos firmados (JSON + PDF) se guardan en la carpeta `data/`, que **no** se borra
al actualizar la aplicación.

## Puerto usado

Por defecto la app corre en el puerto **8095** (variable `PORT`), evitando los puertos ya
usados en el servidor (8006 Proxmox, 3500 y 3001 de otras VMs) y los puertos "clásicos"
como 8080/443. Para usar otro puerto:

```bash
sudo APP_PORT=8110 ./install.sh
```

## Instalación en Ubuntu Server (Proxmox → VM Ubuntu Server)

El repositorio está en GitHub: https://github.com/Vitelio57/Reglamento (privado).

1. Conéctate por SSH a la VM Ubuntu Server y clona el repositorio directamente:
   ```bash
   ssh usuario@IP_DEL_SERVIDOR
   sudo apt-get update -y && sudo apt-get install -y git
   git clone https://github.com/Vitelio57/Reglamento.git reglamento-hotel
   cd reglamento-hotel
   ```
   Como el repositorio es privado, Git pedirá autenticación: usa tu usuario de GitHub y un
   [token de acceso personal](https://github.com/settings/tokens) (no la contraseña de la cuenta).
2. Da permisos de ejecución al instalador y ejecútalo como root:
   ```bash
   chmod +x install.sh
   sudo ./install.sh
   ```
4. El instalador se encarga de todo automáticamente:
   - Instala Node.js 20 LTS si no está presente.
   - Crea un usuario de sistema sin privilegios (`reglamento`) para ejecutar la app.
   - Copia la aplicación a `/opt/reglamento-hotel`.
   - Instala las dependencias de Node (`npm ci`).
   - Crea y habilita un **servicio systemd** (`reglamento-hotel`) que arranca solo al reiniciar el servidor.
   - Abre el puerto elegido en `ufw` (firewall).
   - Al final imprime la URL exacta a la que debes entrar desde el navegador de la tablet.

5. En la tablet de recepción, abre el navegador (Chrome/Firefox) en modo pantalla completa y
   entra a la dirección que mostró el instalador, por ejemplo:
   ```
   http://192.168.1.50:8095
   ```
   Puedes guardarla como marcador o "Añadir a pantalla de inicio" para que quede como un acceso directo.

## Administración

- **Ver documentos firmados**: enlace "Ver documentos firmados" al pie de la página principal,
  o directamente `http://IP:8095/admin.html`. Desde ahí se puede abrir/descargar el PDF de cada firma,
  o **eliminarlo** con el botón "Eliminar" (pide la contraseña de administración).
- **Filtros y paginación**: se puede buscar por nombre y por rango de fechas (Desde/Hasta);
  los resultados se muestran de 10 en 10 con botones "Anterior/Siguiente".
- **Borrado masivo**: se pueden marcar varios documentos con las casillas de la izquierda
  (o la casilla del encabezado para marcar todos los de la página) y eliminarlos juntos con
  "Eliminar seleccionados", pidiendo la contraseña una sola vez.
- **Contraseña para eliminar documentos**: por defecto `Guatemala123456`. Se puede cambiar
  definiendo `ADMIN_DELETE_PASSWORD` en `/etc/systemd/system/reglamento-hotel.service`
  (o en un archivo `.env` junto a `server.js` para pruebas locales) y reiniciando el servicio.
- **Backup**: respalda periódicamente la carpeta `/opt/reglamento-hotel/data` (contiene
  `registros.json` y los PDFs firmados).
- **Logs del servicio**:
  ```bash
  journalctl -u reglamento-hotel -f
  ```
- **Reiniciar el servicio**:
  ```bash
  sudo systemctl restart reglamento-hotel
  ```
- **Actualizar la app**: en la carpeta clonada (`~/reglamento-hotel`) ejecuta:
  ```bash
  ./update.sh
  ```
  Este script hace `git pull` de la última versión y vuelve a ejecutar el instalador
  automáticamente, reiniciando el servicio sin borrar la carpeta `data/` (documentos y
  PDFs firmados se conservan). No necesita ningún dato adicional: usa las mismas
  credenciales de Git que ya quedaron guardadas al clonar el repositorio la primera vez.
  Si prefieres actualizar en dos pasos manuales, sigue funcionando:
  ```bash
  git pull
  sudo ./install.sh
  ```
- **Automatizar la actualización (opcional)**: para que el servidor revise cambios solo,
  agrega una tarea programada con `crontab -e` (como el usuario que clonó el repo, sin sudo),
  por ejemplo para revisar todos los días a las 4 a.m.:
  ```
  0 4 * * * cd /home/usuario/reglamento-hotel && ./update.sh >> /home/usuario/update.log 2>&1
  ```
  Nota: `update.sh` llama a `sudo ./install.sh`, y cron no puede escribir la contraseña de
  sudo por ti. Para que la tarea programada funcione sin intervención, autoriza ese comando
  puntual sin contraseña con `sudo visudo` agregando (cambia `usuario` por el usuario real):
  ```
  usuario ALL=(root) NOPASSWD: /home/usuario/reglamento-hotel/install.sh
  ```
- **Cambiar el puerto ya instalado**: edita `/etc/systemd/system/reglamento-hotel.service`,
  cambia `Environment=PORT=...`, luego:
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl restart reglamento-hotel
  sudo ufw allow NUEVO_PUERTO/tcp
  ```

## Desarrollo / prueba local (Windows)

```powershell
npm install
npm start
```

Luego abre `http://localhost:8095` en el navegador.

## Notas de seguridad

- La aplicación no requiere inicio de sesión (uso pensado para una tablet física en recepción).
- El panel `/admin.html` es de solo lectura y no expone edición ni borrado de documentos.
- Si el servidor se expondrá fuera de la red local del hotel, se recomienda colocar un proxy
  inverso con HTTPS (por ejemplo Nginx + Let's Encrypt) delante de la aplicación.
