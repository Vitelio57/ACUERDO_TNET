const fs = require('fs');
const PDFDocument = require('pdfkit');
const REGLAMENTO = require('./reglamento');

function generarPdf(registro, destino) {
  return new Promise((resolve, reject) => {
    const contenido = REGLAMENTO[registro.idioma] || REGLAMENTO.es;
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const stream = fs.createWriteStream(destino);
    doc.pipe(stream);

    doc.fontSize(18).font('Helvetica-Bold').text(contenido.hotel, { align: 'center' });
    doc.fontSize(11).font('Helvetica').text(contenido.empresa, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).font('Helvetica-Bold').text(contenido.tituloDocumento, { align: 'center' });
    doc.moveDown();

    contenido.secciones.forEach((s) => {
      doc.fontSize(11).font('Helvetica-Bold').text(s.titulo);
      doc.fontSize(10).font('Helvetica').text(s.texto, { align: 'justify' });
      doc.moveDown(0.6);
    });

    doc.moveDown(0.3);
    doc.fontSize(11).font('Helvetica-Bold').text(contenido.declaracionTitulo);
    const declaracion = contenido.declaracion
      .replace(/{{nombre}}/g, registro.nombre)
      .replace(/{{documento}}/g, registro.documento)
      .replace(/{{direccion}}/g, registro.direccion || registro.habitacion || 'N/A');
    doc.fontSize(10).font('Helvetica').text(declaracion, { align: 'justify' });
    doc.moveDown();

    const fechaTexto = new Date(registro.fecha).toLocaleString('es-ES');
    doc.fontSize(10).font('Helvetica-Bold').text(`${contenido.campos.nombre}: `, { continued: true }).font('Helvetica').text(registro.nombre);
    doc.font('Helvetica-Bold').text(`${contenido.campos.documento}: `, { continued: true }).font('Helvetica').text(registro.documento);
    doc.font('Helvetica-Bold').text(`${contenido.campos.direccion}: `, { continued: true }).font('Helvetica').text(registro.direccion || registro.habitacion || 'N/A');
    doc.font('Helvetica-Bold').text(`${contenido.campos.fecha}: `, { continued: true }).font('Helvetica').text(fechaTexto);
    doc.moveDown();

    doc.font('Helvetica-Bold').text(`${contenido.campos.firma}:`);
    doc.moveDown(0.3);
    try {
      doc.image(registro.firmaBuffer, { fit: [220, 90] });
    } catch {
      doc.font('Helvetica').text('(firma no disponible)');
    }
    doc.moveDown();

    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666').text(`ID del documento: ${registro.id}`);

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

module.exports = { generarPdf };
