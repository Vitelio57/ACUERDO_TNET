const state = {
  idioma: null,
  contenido: null,
};

const pantallaIdioma = document.getElementById('pantalla-idioma');
const pantallaReglamento = document.getElementById('pantalla-reglamento');
const pantallaExito = document.getElementById('pantalla-exito');

const btnEs = document.getElementById('btn-idioma-es');
const textoSeleccionIdioma = document.getElementById('texto-seleccion-idioma');
const textoIntro = document.getElementById('texto-intro');

const tituloHotel = document.getElementById('titulo-hotel');
const subtituloEmpresa = document.getElementById('subtitulo-empresa');
const tituloDocumento = document.getElementById('titulo-documento');
const contenedorSecciones = document.getElementById('secciones-reglamento');
const tituloDeclaracion = document.getElementById('titulo-declaracion');
const textoDeclaracion = document.getElementById('texto-declaracion');

const inputNombre = document.getElementById('input-nombre');
const inputDocumento = document.getElementById('input-documento');
const inputDireccion = document.getElementById('input-direccion');
const labelNombre = document.getElementById('label-nombre');
const labelDocumento = document.getElementById('label-documento');
const labelDireccion = document.getElementById('label-direccion');
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

async function cargarIdioma(lang) {
  const resp = await fetch(`/api/reglamento/${lang}`);
  const contenido = await resp.json();
  state.idioma = 'es';
  state.contenido = contenido;
  renderReglamento();
  pantallaIdioma.hidden = true;
  pantallaReglamento.hidden = false;
  if (!signaturePad) initSignaturePad();
}

function renderReglamento() {
  const c = state.contenido;
  textoSeleccionIdioma.textContent = c.ui.pantallaInicialTitulo;
  textoIntro.textContent = c.ui.pantallaInicialTexto;
  btnEs.textContent = c.ui.botonContinuar;
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
  labelDocumento.textContent = c.campos.documento;
  labelDireccion.textContent = c.campos.direccion;
  labelFirma.textContent = c.ui.firmeAqui;
  labelAceptacion.textContent = c.ui.aceptacion;
  btnLimpiarFirma.textContent = c.ui.botonLimpiarFirma;
  btnFirmar.textContent = c.ui.botonFirmar;

  actualizarDeclaracion();
}

function actualizarDeclaracion() {
  const c = state.contenido;
  const nombre = inputNombre.value.trim() || '_____________';
  const documento = inputDocumento.value.trim() || '_____________';
  const direccion = inputDireccion.value.trim() || '_____________';
  textoDeclaracion.textContent = c.declaracion
    .replace(/{{nombre}}/g, nombre)
    .replace(/{{documento}}/g, documento)
    .replace(/{{direccion}}/g, direccion);
}

// Documento y habitación son numéricos: se filtra cualquier caracter que no sea dígito
// antes de refrescar la declaración, para que el texto nunca muestre letras coladas.
function soloDigitos(e) {
  const limpio = e.target.value.replace(/\D/g, '');
  if (limpio !== e.target.value) e.target.value = limpio;
  actualizarDeclaracion();
}

inputNombre.addEventListener('input', actualizarDeclaracion);
inputDocumento.addEventListener('input', soloDigitos);
inputDireccion.addEventListener('input', actualizarDeclaracion);

btnEs.addEventListener('click', () => cargarIdioma('es'));

btnLimpiarFirma.addEventListener('click', () => signaturePad.clear());

function mostrarError(msg) {
  mensajeError.textContent = msg;
  mensajeError.hidden = !msg;
}

btnFirmar.addEventListener('click', async () => {
  const c = state.contenido;
  mostrarError('');

  const nombre = inputNombre.value.trim();
  const documento = inputDocumento.value.trim();
  const direccion = inputDireccion.value.trim();

  if (!nombre || !documento || !direccion) {
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
        documento,
        direccion,
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
  inputDocumento.value = '';
  inputDireccion.value = '';
  checkAceptacion.checked = false;
  if (signaturePad) signaturePad.clear();
  mensajeError.hidden = true;
  pantallaExito.hidden = true;
  pantallaIdioma.hidden = false;
});
