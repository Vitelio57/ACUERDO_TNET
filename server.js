require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { randomUUID } = require('crypto');

const REGLAMENTO = require('./src/reglamento');
const { generarPdf } = require('./src/pdf');
const store = require('./src/store');

const PORT = process.env.PORT || 8095;
const app = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

app.get('/api/reglamento/:lang', (req, res) => {
  const lang = req.params.lang === 'en' ? 'en' : 'es';
  res.json(REGLAMENTO[lang]);
});

const firmarLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/firmar', firmarLimiter, async (req, res) => {
  try {
    const { nombre, documento, habitacion, idioma, aceptado, firmaBase64 } = req.body || {};

    const lang = idioma === 'en' ? 'en' : 'es';
    const nombreLimpio = String(nombre || '').trim().slice(0, 120);
    const documentoLimpio = String(documento || '').trim().slice(0, 60);
    const habitacionLimpia = String(habitacion || '').trim().slice(0, 20);

    if (!nombreLimpio || !documentoLimpio) {
      return res.status(400).json({ error: 'Nombre y documento de identidad son obligatorios.' });
    }
    if (aceptado !== true) {
      return res.status(400).json({ error: 'Debe aceptar el reglamento antes de firmar.' });
    }
    if (typeof firmaBase64 !== 'string' || !firmaBase64.startsWith('data:image/png;base64,')) {
      return res.status(400).json({ error: 'La firma es obligatoria.' });
    }

    const firmaBuffer = Buffer.from(firmaBase64.split(',')[1], 'base64');
    if (firmaBuffer.length < 100 || firmaBuffer.length > 2 * 1024 * 1024) {
      return res.status(400).json({ error: 'Firma inválida.' });
    }

    const id = randomUUID();
    const fecha = new Date();

    const registro = {
      id,
      nombre: nombreLimpio,
      documento: documentoLimpio,
      habitacion: habitacionLimpia,
      idioma: lang,
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

app.listen(PORT, () => {
  console.log(`Reglamento Hotel Mansión del Viajero escuchando en el puerto ${PORT}`);
});
