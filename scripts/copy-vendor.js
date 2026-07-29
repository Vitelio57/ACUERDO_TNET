// Copia el bundle de signature_pad desde node_modules a public/vendor tras `npm install`.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'node_modules', 'signature_pad', 'dist', 'signature_pad.umd.min.js');
const destDir = path.join(__dirname, '..', 'public', 'vendor');
const dest = path.join(destDir, 'signature_pad.min.js');

if (!fs.existsSync(src)) {
  console.warn('No se encontró signature_pad en node_modules; omitiendo copia.');
  process.exit(0);
}
fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('signature_pad copiado a public/vendor/');
