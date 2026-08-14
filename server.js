require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const REGLAMENTO = require('./src/reglamento');
const { generarPdf } = require('./src/pdf');
const store = require('./src/store');
const { ADMIN_PASSWORD, validateAdminPassword } = require('./src/auth');

const PORT = process.env.PORT || 8095;
const ADMIN_DELETE_PASSWORD = process.env.ADMIN_DELETE_PASSWORD || ADMIN_PASSWORD;
const app = express();

function passwordValida(intento) {
  return validateAdminPassword(intento);
}

app.disable('x-powered-by');
app.use(
  helmet({
    // Sin este ajuste, el navegador intenta cargar CSS/JS por HTTPS y falla (el servidor solo usa HTTP en la LAN).
    contentSecurityPolicy: {
      useDefaults: true,
      directives: { upgradeInsecureRequests: null },
    },
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/api/reglamento/:lang', (req, res) => {
  res.json(REGLAMENTO.instalacion);
});

app.get('/api/documento/:tipo', (req, res) => {
  const tipo = req.params.tipo === 'reparacion' ? 'reparacion' : 'instalacion';
  res.json(REGLAMENTO[tipo]);
});

app.post('/api/auth/verify', (req, res) => {
  const { password } = req.body || {};

  if (passwordValida(password)) {
    return res.json({ ok: true });
  }

  return res.status(401).json({ error: 'Contraseña incorrecta.' });
});

const firmarLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/firmar', firmarLimiter, async (req, res) => {
  try {
    const { nombre, direccion, habitacion, problema, cambioRouter, tipo, aceptado, firmaBase64 } = req.body || {};

    const tipoDoc = tipo === 'reparacion' ? 'reparacion' : 'instalacion';

    const nombreLimpio = String(nombre || '').trim().slice(0, 120);
    const direccionLimpia = String(direccion || habitacion || '').trim().slice(0, 180);
    const problemaLimpio = String(problema || '').trim().slice(0, 240);
    const cambioRouterMarcado = cambioRouter === true;

    if (!nombreLimpio || !direccionLimpia) {
      return res.status(400).json({ error: 'Nombre y direccion son obligatorios.' });
    }
    if (tipoDoc === 'reparacion' && !problemaLimpio) {
      return res.status(400).json({ error: 'Debe ingresar el problema reportado para la reparacion.' });
    }
    if (aceptado !== true) {
      return res.status(400).json({ error: 'Debe aceptar el documento antes de firmar.' });
    }
    if (typeof firmaBase64 !== 'string' || !firmaBase64.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'La firma es obligatoria.' });
    }

    const firmaBuffer = Buffer.from(firmaBase64.split(',')[1], 'base64');
    if (firmaBuffer.length < 100 || firmaBuffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Firma inválida.' });
    }

    const id = crypto.randomUUID();
    const fecha = new Date();

    const registro = {
      id,
      tipo: tipoDoc,
      nombre: nombreLimpio,
      direccion: direccionLimpia,
      problema: problemaLimpio,
      cambioRouter: cambioRouterMarcado,
      idioma: 'es',
      fecha: fecha.toISOString(),
    };

    const pdfPath = store.rutaPdf(id);
    await generarPdf({ ...registro, firmaBuffer }, pdfPath);

    store.agregarRegistro(registro);

    res.status(201).json({ id, pdfUrl: `/api/documentos/${id}/pdf` });
  } catch (err) {
    console.error('Error al firmar documento:', err);
    res.status(500).json({ error: 'No se pudo procesar la firma. Intente nuevamente.' });
  }
});

app.get('/api/documentos', (req, res) => {
  res.json(store.listarRegistros());
});

app.get('/api/documentos/:id/pdf', (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).send('Identificador inválido.');
  }
  const pdfPath = store.rutaPdf(id);
  if (!fs.existsSync(pdfPath)) {
    return res.status(404).send('Documento no encontrado.');
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(pdfPath);
});

const eliminarLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.delete('/api/documentos/:id', eliminarLimiter, (req, res) => {
  const { id } = req.params;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Identificador inválido.' });
  }

  const { password } = req.body || {};
  if (!passwordValida(password)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }

  const eliminado = store.eliminarRegistro(id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Documento no encontrado.' });
  }
  res.json({ ok: true });
});

app.post('/api/documentos/eliminar-masivo', eliminarLimiter, (req, res) => {
  const { ids, password } = req.body || {};

  if (!passwordValida(password)) {
    return res.status(401).json({ error: 'Contraseña incorrecta.' });
  }
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Debe indicar al menos un documento a eliminar.' });
  }
  if (ids.length > 200) {
    return res.status(400).json({ error: 'Demasiados documentos seleccionados a la vez.' });
  }

  let eliminados = 0;
  for (const id of ids) {
    if (typeof id === 'string' && UUID_RE.test(id) && store.eliminarRegistro(id)) {
      eliminados += 1;
    }
  }

  res.json({ eliminados });
});

app.listen(PORT, () => {
  console.log(`Acta de instalacion de fibra optica escuchando en el puerto ${PORT}`);
});
