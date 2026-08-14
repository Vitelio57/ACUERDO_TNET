const AUTH_KEY = 'acta-gp-admin-auth';
const ADMIN_PASSWORD = 'Admin#GPON7';

const state = {
  idioma: null,
  tipo: null,
  contenido: null,
};

const pantallaLogin = document.getElementById('pantalla-login');
const formularioLogin = document.getElementById('formulario-login');
const inputPassword = document.getElementById('input-password');
const mensajeLogin = document.getElementById('mensaje-login');
const pantallaIdioma = document.getElementById('pantalla-idioma');
const pantallaReglamento = document.getElementById('pantalla-reglamento');
const pantallaExito = document.getElementById('pantalla-exito');

const btnInstalacion = document.getElementById('btn-tipo-instalacion');
const btnReparacion = document.getElementById('btn-tipo-reparacion');
const textoSeleccionIdioma = document.getElementById('texto-seleccion-idioma');
const textoIntro = document.getElementById('texto-intro');

const tituloHotel = document.getElementById('titulo-hotel');
const subtituloEmpresa = document.getElementById('subtitulo-empresa');
const tituloDocumento = document.getElementById('titulo-documento');
const contenedorSecciones = document.getElementById('secciones-reglamento');
const tituloDeclaracion = document.getElementById('titulo-declaracion');
const textoDeclaracion = document.getElementById('texto-declaracion');

const inputNombre = document.getElementById('input-nombre');
const inputDireccion = document.getElementById('input-direccion');
const inputProblema = document.getElementById('input-problema');
const labelNombre = document.getElementById('label-nombre');
const labelDireccion = document.getElementById('label-direccion');
const labelProblema = document.getElementById('label-problema');
const campoProblema = document.getElementById('campo-problema');
const campoCambioRouter = document.getElementById('campo-cambio-router');
const checkCambioRouter = document.getElementById('check-cambio-router');
const labelCambioRouter = document.getElementById('label-cambio-router');
const checkAceptacion = document.getElementById('check-aceptacion');
const labelAceptacion = document.getElementById('label-aceptacion');
const labelFirma = document.getElementById('label-firma');
const btnLimpiarFirma = document.getElementById('btn-limpiar-firma');
const btnFirmar = document.getElementById('btn-firmar');
const mensajeError = document.getElementById('mensaje-error');

const exitoTitulo = document.getElementById('exito-titulo');
const exitoTexto = document.getElementById('exito-texto');
const btnDescargarPdf = document.getElementById('btn-descargar-pdf');
const btnNuevoDocumento = document.getElementById('btn-nuevo-documento');

const canvas = document.getElementById('canvas-firma');
let signaturePad = null;

function initSignaturePad() {
  signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255,255,255)' });
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const data = signaturePad ? signaturePad.toData() : null;
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext('2d').scale(ratio, ratio);
  if (signaturePad) {
    signaturePad.clear();
    if (data && data.length) signaturePad.fromData(data);
  }
}

async function cargarDocumento(tipo) {
  const resp = await fetch(`/api/documento/${tipo}`);
  const contenido = await resp.json();
  state.idioma = 'es';
  state.tipo = tipo;
  state.contenido = contenido;
  renderReglamento();
  pantallaIdioma.hidden = true;
  pantallaReglamento.hidden = false;
  if (!signaturePad) initSignaturePad();
}

function renderReglamento() {
  const c = state.contenido;
  const esReparacion = state.tipo === 'reparacion';
  textoSeleccionIdioma.textContent = c.ui.pantallaInicialTitulo;
  textoIntro.textContent = c.ui.pantallaInicialTexto;
  btnInstalacion.textContent = c.ui.botonInstalacion;
  btnReparacion.textContent = c.ui.botonReparacion;
  tituloHotel.textContent = c.hotel;
  subtituloEmpresa.textContent = c.empresa;
  tituloDocumento.textContent = c.tituloDocumento;
  tituloDeclaracion.textContent = c.declaracionTitulo;

  contenedorSecciones.innerHTML = '';
  c.secciones.forEach((s) => {
    const art = document.createElement('article');
    art.className = 'seccion';
    const h3 = document.createElement('h3');
    h3.textContent = s.titulo;
    const p = document.createElement('p');
    p.textContent = s.texto;
    art.append(h3, p);
    contenedorSecciones.appendChild(art);
  });

  labelNombre.textContent = c.campos.nombre;
  labelDireccion.textContent = c.campos.direccion;
  labelProblema.textContent = esReparacion ? (c.campos.problema || 'Problema reportado') : '';
  labelCambioRouter.textContent = c.campos.cambioRouter || '';
  labelFirma.textContent = c.ui.firmeAqui;
  labelAceptacion.textContent = c.ui.aceptacion;
  btnLimpiarFirma.textContent = c.ui.botonLimpiarFirma;
  btnFirmar.textContent = c.ui.botonFirmar;

  campoProblema.hidden = !esReparacion;
  campoProblema.style.display = esReparacion ? '' : 'none';
  campoCambioRouter.hidden = !esReparacion;
  campoCambioRouter.style.display = esReparacion ? '' : 'none';

  if (!esReparacion) {
    inputProblema.value = '';
    inputProblema.disabled = true;
  } else {
    inputProblema.disabled = false;
  }

  actualizarDeclaracion();
}

function actualizarDeclaracion() {
  const c = state.contenido;
  const nombre = inputNombre.value.trim() || '_____________';
  const direccion = inputDireccion.value.trim() || '_____________';
  const esReparacion = state.tipo === 'reparacion';
  const problema = esReparacion ? (inputProblema.value.trim() || '_____________') : '';
  const cambioRouterEstado = checkCambioRouter.checked ? 'SI' : 'NO';
  textoDeclaracion.textContent = c.declaracion
    .replace(/{{nombre}}/g, nombre)
    .replace(/{{direccion}}/g, direccion)
    .replace(/{{problema}}/g, problema)
    .replace(/{{cambioRouterEstado}}/g, cambioRouterEstado);
}

inputNombre.addEventListener('input', actualizarDeclaracion);
inputDireccion.addEventListener('input', actualizarDeclaracion);
inputProblema.addEventListener('input', actualizarDeclaracion);
checkCambioRouter.addEventListener('change', actualizarDeclaracion);

async function manejarLogin(password) {
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
    pantallaLogin.hidden = true;
    pantallaIdioma.hidden = false;
    mensajeLogin.textContent = '';
    mensajeLogin.hidden = true;
    inputPassword.value = '';
    return true;
  } catch (err) {
    mensajeLogin.textContent = err.message || 'Contraseña incorrecta.';
    mensajeLogin.hidden = false;
    return false;
  }
}

formularioLogin.addEventListener('submit', async (event) => {
  event.preventDefault();
  const password = inputPassword.value.trim();
  if (!password) {
    mensajeLogin.textContent = 'Ingrese la contraseña.';
    mensajeLogin.hidden = false;
    return;
  }

  await manejarLogin(password);
});

if (localStorage.getItem(AUTH_KEY) === 'true') {
  pantallaLogin.hidden = true;
  pantallaIdioma.hidden = false;
} else {
  pantallaLogin.hidden = false;
  pantallaIdioma.hidden = true;
  pantallaReglamento.hidden = true;
  pantallaExito.hidden = true;
}

btnInstalacion.addEventListener('click', () => cargarDocumento('instalacion'));
btnReparacion.addEventListener('click', () => cargarDocumento('reparacion'));

btnLimpiarFirma.addEventListener('click', () => signaturePad.clear());

function mostrarError(msg) {
  mensajeError.textContent = msg;
  mensajeError.hidden = !msg;
}

btnFirmar.addEventListener('click', async () => {
  const c = state.contenido;
  mostrarError('');

  const nombre = inputNombre.value.trim();
  const direccion = inputDireccion.value.trim();
  const problema = inputProblema.value.trim();
  const esReparacion = state.tipo === 'reparacion';

  if (!nombre || !direccion || (esReparacion && !problema)) {
    mostrarError(c.ui.errorCampos);
    return;
  }
  if (!checkAceptacion.checked) {
    mostrarError(c.ui.errorAceptacion);
    return;
  }
  if (signaturePad.isEmpty()) {
    mostrarError(c.ui.errorFirma);
    return;
  }

  btnFirmar.disabled = true;
  try {
    const firmaBase64 = signaturePad.toDataURL('image/png');
    const resp = await fetch('/api/firmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        direccion,
        problema,
        cambioRouter: checkCambioRouter.checked,
        tipo: state.tipo,
        idioma: state.idioma,
        aceptado: true,
        firmaBase64,
      }),
    });
    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data.error || c.ui.errorGenerico);
    }
    const data = await resp.json();
    mostrarExito(data.pdfUrl);
  } catch (err) {
    mostrarError(err.message || c.ui.errorGenerico);
  } finally {
    btnFirmar.disabled = false;
  }
});

function mostrarExito(pdfUrl) {
  const c = state.contenido;
  exitoTitulo.textContent = c.ui.exitoTitulo;
  exitoTexto.textContent = c.ui.exitoTexto;
  btnDescargarPdf.textContent = c.ui.botonDescargarPdf;
  btnDescargarPdf.href = pdfUrl;
  btnNuevoDocumento.textContent = c.ui.botonNuevoDocumento;
  pantallaReglamento.hidden = true;
  pantallaExito.hidden = false;
}

btnNuevoDocumento.addEventListener('click', () => {
  inputNombre.value = '';
  inputDireccion.value = '';
  inputProblema.value = '';
  checkCambioRouter.checked = false;
  checkAceptacion.checked = false;
  if (signaturePad) signaturePad.clear();
  mensajeError.hidden = true;
  pantallaExito.hidden = true;
  pantallaIdioma.hidden = false;
});
