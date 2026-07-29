async function cargarDocumentos() {
  const resp = await fetch('/api/documentos');
  const registros = await resp.json();
  const tbody = document.getElementById('cuerpo-tabla');
  tbody.innerHTML = '';

  registros.forEach((r) => {
    const tr = document.createElement('tr');

    const tdFecha = document.createElement('td');
    tdFecha.textContent = new Date(r.fecha).toLocaleString('es-ES');

    const tdNombre = document.createElement('td');
    tdNombre.textContent = r.nombre;

    const tdDocumento = document.createElement('td');
    tdDocumento.textContent = r.documento;

    const tdHabitacion = document.createElement('td');
    tdHabitacion.textContent = r.habitacion || 'N/A';

    const tdIdioma = document.createElement('td');
    tdIdioma.textContent = r.idioma === 'en' ? 'Inglés' : 'Español';

    const tdAcciones = document.createElement('td');
    const link = document.createElement('a');
    link.href = `/api/documentos/${r.id}/pdf`;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Ver / Descargar PDF';
    link.className = 'enlace-pdf';
    tdAcciones.appendChild(link);

    tr.append(tdFecha, tdNombre, tdDocumento, tdHabitacion, tdIdioma, tdAcciones);
    tbody.appendChild(tr);
  });

  if (!registros.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'Aún no hay documentos firmados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

cargarDocumentos();
