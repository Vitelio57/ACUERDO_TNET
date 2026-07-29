const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PDF_DIR = path.join(DATA_DIR, 'pdfs');
const DB_FILE = path.join(DATA_DIR, 'registros.json');

for (const dir of [DATA_DIR, PDF_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf8');

function leerRegistros() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function agregarRegistro(registro) {
  const registros = leerRegistros();
  registros.push(registro);
  fs.writeFileSync(DB_FILE, JSON.stringify(registros, null, 2), 'utf8');
}

function listarRegistros() {
  return leerRegistros().sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function eliminarRegistro(id) {
  const registros = leerRegistros();
  const indice = registros.findIndex((r) => r.id === id);
  if (indice === -1) return false;

  registros.splice(indice, 1);
  fs.writeFileSync(DB_FILE, JSON.stringify(registros, null, 2), 'utf8');

  const pdfPath = rutaPdf(id);
  if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);

  return true;
}

function rutaPdf(id) {
  return path.join(PDF_DIR, `${id}.pdf`);
}

module.exports = { agregarRegistro, listarRegistros, eliminarRegistro, rutaPdf };
