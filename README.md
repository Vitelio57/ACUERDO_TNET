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
  git pull
  sudo ./install.sh
  ```
  El instalador vuelve a copiar los archivos a `/opt/reglamento-hotel` y reinicia el servicio,
  sin borrar la carpeta `data/` existente (documentos y PDFs firmados se conservan).
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
