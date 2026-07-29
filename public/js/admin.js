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

    const btnEliminar = document.createElement('button');
    btnEliminar.type = 'button';
    btnEliminar.className = 'boton-eliminar';
    btnEliminar.textContent = 'Eliminar';
    btnEliminar.addEventListener('click', () => eliminarDocumento(r.id));

    tdAcciones.append(link, btnEliminar);

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

async function eliminarDocumento(id) {
  const password = prompt('Ingrese la contraseña para eliminar este documento:');
  if (password === null) return;

  try {
    const resp = await fetch(`/api/documentos/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      alert(data.error || 'No se pudo eliminar el documento.');
      return;
    }
    cargarDocumentos();
  } catch {
    alert('Error de conexión al intentar eliminar el documento.');
  }
}

cargarDocumentos();
