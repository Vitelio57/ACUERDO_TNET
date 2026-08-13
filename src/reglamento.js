// Contenido legal y textos de interfaz del acta de instalacion, solo en espanol.
// {{nombre}}, {{documento}} y {{direccion}} son reemplazados al firmar y al generar el PDF.

const REGLAMENTO = {
  es: {
    idioma: 'es',
    hotel: 'INSTALACION DE FIBRA OPTICA E INTERNET',
    empresa: 'Corporación H&D S.A.',
    tituloDocumento: 'Acta de Entrega, Instalacion y Responsabilidad de Equipos',
    secciones: [
      {
        titulo: '1. Objeto del documento',
        texto:
          'El presente documento deja constancia de la instalacion del servicio de internet por fibra optica en el domicilio del cliente y de la entrega de los equipos necesarios para su funcionamiento.',
      },
      {
        titulo: '2. Equipos entregados',
        texto:
          'El cliente reconoce recibir, segun corresponda a su instalacion, equipos y materiales tales como caja digital, router, ONT, cableado de fibra optica, fuentes de energia, controles, conectores y cualquier otro accesorio necesario para la prestacion del servicio.',
      },
      {
        titulo: '3. Propiedad de los equipos',
        texto:
          'Todos los equipos y materiales entregados o instalados continúan siendo propiedad exclusiva de la empresa, aun cuando permanezcan en el domicilio del cliente mientras el servicio se encuentre activo.',
      },
      {
        titulo: '4. Uso y resguardo',
        texto:
          'El cliente se compromete a cuidar los equipos, no manipularlos indebidamente, no cederlos a terceros y permitir el acceso tecnico razonable para mantenimiento, revision, retiro o sustitucion cuando sea necesario.',
      },
      {
        titulo: '5. Terminacion del servicio',
        texto:
          'Al momento de cancelar, suspender o terminar el servicio por cualquier causa, el cliente queda obligado a devolver a la empresa todos los equipos entregados en buen estado, salvo el desgaste normal por uso adecuado.',
      },
      {
        titulo: '6. Cargo por no devolucion',
        texto:
          'Si el cliente no devuelve uno o mas equipos, o los entrega con danos atribuibles a mal uso, acepta que la empresa registre el saldo correspondiente como deuda pendiente en el sistema y realice el cobro respectivo por reposicion, reparacion o recuperacion.',
      },
      {
        titulo: '7. Aceptacion del cliente',
        texto:
          'Con su firma, el cliente declara haber recibido la informacion sobre la instalacion, comprender que los equipos no pasan a ser de su propiedad y aceptar las obligaciones de cuidado, devolucion y pago en caso de incumplimiento.',
      },
    ],
    declaracionTitulo: 'Declaracion de Aceptacion',
    declaracion:
      'Yo, {{nombre}}, identificado(a) con documento de identidad N.° {{documento}}, titular de la instalacion realizada en la direccion {{direccion}}, declaro que he leido y comprendido en su totalidad el presente documento de entrega e instalacion de equipos de internet por fibra optica de Corporación H&D S.A. Asimismo, acepto que la caja digital, la fibra optica, el router y cualquier otro equipo o accesorio entregado o instalado son propiedad de la empresa y me obligo a devolverlos cuando el servicio sea cancelado o finalizado. En caso de no hacerlo, acepto que se me registre la deuda correspondiente en el sistema para su cobro.',
    campos: {
      nombre: 'Nombre completo',
      documento: 'N.° de identificacion',
      direccion: 'Direccion de instalacion',
      fecha: 'Fecha',
      firma: 'Firma',
    },
    ui: {
      pantallaInicialTitulo: 'Documento de instalacion y resguardo de equipos',
      pantallaInicialTexto: 'Revise el documento antes de firmar la entrega e instalacion del servicio.',
      botonContinuar: 'Continuar',
      aceptacion: 'He leido y acepto las condiciones de instalacion, uso y devolucion de los equipos.',
      botonLimpiarFirma: 'Limpiar firma',
      botonFirmar: 'Firmar y guardar',
      firmeAqui: 'Firme dentro del recuadro con el dedo',
      exitoTitulo: 'Documento firmado correctamente',
      exitoTexto: 'La constancia de instalacion y entrega de equipos fue guardada correctamente.',
      botonDescargarPdf: 'Descargar PDF',
      botonNuevoDocumento: 'Firmar otro documento',
      errorGenerico: 'Ocurrió un error. Intente nuevamente.',
      errorAceptacion: 'Debe marcar la casilla de aceptacion antes de continuar.',
      errorFirma: 'Debe firmar en el recuadro antes de continuar.',
      errorCampos: 'Complete el nombre, el numero de documento y la direccion de instalacion.',
      verDocumentos: 'Ver documentos firmados',
    },
  },
};

module.exports = REGLAMENTO;
