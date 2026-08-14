const POR_PAGINA = 10;
const AUTH_KEY = 'acta-gp-admin-auth';

let todosLosRegistros = [];
let filtrados = [];
let paginaActual = 1;
const seleccionados = new Set();

const pantallaLoginAdmin = document.getElementById('pantalla-login-admin');
const formularioLoginAdmin = document.getElementById('formulario-login-admin');
const inputPasswordAdmin = document.getElementById('input-password-admin');
const mensajeLoginAdmin = document.getElementById('mensaje-login-admin');
const pantallaAdmin = document.getElementById('pantalla-admin');
const inputFiltroNombre = document.getElementById('filtro-nombre');
const inputFiltroDesde = document.getElementById('filtro-desde');
const inputFiltroHasta = document.getElementById('filtro-hasta');
const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
const checkTodos = document.getElementById('check-todos');
const btnEliminarSeleccionados = document.getElementById('btn-eliminar-seleccionados');
const btnPaginaAnterior = document.getElementById('btn-pagina-anterior');
const btnPaginaSiguiente = document.getElementById('btn-pagina-siguiente');
const textoPagina = document.getElementById('texto-pagina');
const tbody = document.getElementById('cuerpo-tabla');

async function cargarDocumentos() {
  const resp = await fetch('/api/documentos');
  todosLosRegistros = await resp.json();
  seleccionados.clear();
  aplicarFiltros();
}

function aplicarFiltros() {
  const nombreBuscado = inputFiltroNombre.value.trim().toLowerCase();
  const desde = inputFiltroDesde.value ? new Date(`${inputFiltroDesde.value}T00:00:00`) : null;
  const hasta = inputFiltroHasta.value ? new Date(`${inputFiltroHasta.value}T23:59:59.999`) : null;

  filtrados = todosLosRegistros.filter((r) => {
    if (nombreBuscado && !r.nombre.toLowerCase().includes(nombreBuscado)) return false;
    const fecha = new Date(r.fecha);
    if (desde && fecha < desde) return false;
    if (hasta && fecha > hasta) return false;
    return true;
  });

  paginaActual = 1;
  renderPagina();
}

function renderPagina() {
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  paginaActual = Math.min(paginaActual, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const registrosPagina = filtrados.slice(inicio, inicio + POR_PAGINA);

  tbody.innerHTML = '';

  registrosPagina.forEach((r) => {
    const tr = document.createElement('tr');

    const tdCheck = document.createElement('td');
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.checked = seleccionados.has(r.id);
    check.addEventListener('change', () => {
      if (check.checked) seleccionados.add(r.id);
      else seleccionados.delete(r.id);
      actualizarBotonEliminarSeleccionados();
      actualizarCheckTodos(registrosPagina);
    });
    tdCheck.appendChild(check);

    const tdFecha = document.createElement('td');
    tdFecha.textContent = new Date(r.fecha).toLocaleString('es-ES');

    const tdTipo = document.createElement('td');
    tdTipo.textContent = r.tipo === 'reparacion' ? 'Reparacion' : 'Instalacion';

    const tdNombre = document.createElement('td');
    tdNombre.textContent = r.nombre;

    const tdDireccion = document.createElement('td');
    tdDireccion.textContent = r.direccion || r.habitacion || 'N/A';

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

    tr.append(tdCheck, tdFecha, tdTipo, tdNombre, tdDireccion, tdAcciones);
    tbody.appendChild(tr);
  });

  if (!registrosPagina.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = todosLosRegistros.length ? 'Ningún documento coincide con los filtros.' : 'Aún no hay documentos firmados.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  textoPagina.textContent = `Página ${paginaActual} de ${totalPaginas} (${filtrados.length} documento${filtrados.length === 1 ? '' : 's'})`;
  btnPaginaAnterior.disabled = paginaActual <= 1;
  btnPaginaSiguiente.disabled = paginaActual >= totalPaginas;

  actualizarBotonEliminarSeleccionados();
  actualizarCheckTodos(registrosPagina);
}

function actualizarBotonEliminarSeleccionados() {
  btnEliminarSeleccionados.textContent = `Eliminar seleccionados (${seleccionados.size})`;
  btnEliminarSeleccionados.disabled = seleccionados.size === 0;
}

function actualizarCheckTodos(registrosPagina) {
  checkTodos.checked = registrosPagina.length > 0 && registrosPagina.every((r) => seleccionados.has(r.id));
}

checkTodos.addEventListener('change', () => {
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const registrosPagina = filtrados.slice(inicio, inicio + POR_PAGINA);
  registrosPagina.forEach((r) => {
    if (checkTodos.checked) seleccionados.add(r.id);
    else seleccionados.delete(r.id);
  });
  renderPagina();
});

btnPaginaAnterior.addEventListener('click', () => {
  paginaActual -= 1;
  renderPagina();
});

btnPaginaSiguiente.addEventListener('click', () => {
  paginaActual += 1;
  renderPagina();
});

inputFiltroNombre.addEventListener('input', aplicarFiltros);
inputFiltroDesde.addEventListener('change', aplicarFiltros);
inputFiltroHasta.addEventListener('change', aplicarFiltros);

btnLimpiarFiltros.addEventListener('click', () => {
  inputFiltroNombre.value = '';
  inputFiltroDesde.value = '';
  inputFiltroHasta.value = '';
  aplicarFiltros();
});

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
    seleccionados.delete(id);
    cargarDocumentos();
  } catch {
    alert('Error de conexión al intentar eliminar el documento.');
  }
}

btnEliminarSeleccionados.addEventListener('click', async () => {
  if (!seleccionados.size) return;
  const password = prompt(`Ingrese la contraseña para eliminar ${seleccionados.size} documento(s):`);
  if (password === null) return;

  try {
    const resp = await fetch('/api/documentos/eliminar-masivo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(seleccionados), password }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      alert(data.error || 'No se pudieron eliminar los documentos.');
      return;
    }
    alert(`Se eliminaron ${data.eliminados} documento(s).`);
    cargarDocumentos();
  } catch {
    alert('Error de conexión al intentar eliminar los documentos.');
  }
});

async function verificarLoginAdmin(password) {
  try {
    const resp = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!resp.ok) {
      throw new Error('Contraseña incorrecta.');
    }

    localStorage.setItem(AUTH_KEY, 'true');
    pantallaLoginAdmin.hidden = true;
    pantallaAdmin.hidden = false;
    mensajeLoginAdmin.hidden = true;
    mensajeLoginAdmin.textContent = '';
    inputPasswordAdmin.value = '';
    await cargarDocumentos();
    return true;
  } catch (err) {
    mensajeLoginAdmin.textContent = err.message || 'Contraseña incorrecta.';
    mensajeLoginAdmin.hidden = false;
    return false;
  }
}

formularioLoginAdmin.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = inputPasswordAdmin.value.trim();
  if (!password) {
    mensajeLoginAdmin.textContent = 'Ingrese la contraseña.';
    mensajeLoginAdmin.hidden = false;
    return;
  }

  await verificarLoginAdmin(password);
});

if (localStorage.getItem(AUTH_KEY) === 'true') {
  pantallaLoginAdmin.hidden = true;
  pantallaAdmin.hidden = false;
  cargarDocumentos();
} else {
  pantallaLoginAdmin.hidden = false;
  pantallaAdmin.hidden = true;
}

