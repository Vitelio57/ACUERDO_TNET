// Contenido legal y textos de interfaz del Reglamento de Hospedaje, en español e ingles.
// {{nombre}}, {{documento}} y {{habitacion}} son reemplazados al firmar y al generar el PDF.

const REGLAMENTO = {
  es: {
    idioma: 'es',
    hotel: 'HOTEL MANSIÓN DEL VIAJERO',
    empresa: 'Corporación H&D S.A.',
    tituloDocumento: 'Reglamento de Hospedaje',
    secciones: [
      {
        titulo: '1. Entrega de Llaves y Controles',
        texto:
          'Las llaves y controles remotos deberán ser devueltos en recepción al momento de realizar el check-out, en las mismas condiciones en que fueron entregados. En caso de daño, pérdida o extravío, se aplicará un cargo adicional por reposición.',
      },
      {
        titulo: '2. Horarios',
        texto: 'Check-in: A partir de las 3:00 p.m.\nCheck-out: Hasta las 12:00 p.m.',
      },
      {
        titulo: '3. Prohibición de Fumar',
        texto: 'Se prohíbe fumar dentro de las habitaciones.',
      },
      {
        titulo: '4. Respeto y Convivencia',
        texto:
          'Mantenga un volumen moderado en televisores, dispositivos de audio y conversaciones para garantizar el descanso de los demás huéspedes.',
      },
      {
        titulo: '5. Registro de Visitas',
        texto:
          'Toda visita deberá registrarse previamente en recepción. El hotel se reserva el derecho de admisión.',
      },
      {
        titulo: '6. Capacidad de la Habitación',
        texto: 'No está permitido exceder el número de personas registradas para la habitación.',
      },
      {
        titulo: '7. Cuidado de las Instalaciones y Habitación en General',
        texto:
          'El huésped es responsable del buen uso y conservación del mobiliario, equipos, decoración, e instalaciones del hotel. Las toallas proporcionadas por el hotel son de uso exclusivo para la higiene personal y secado del cuerpo. No deben utilizarse para limpiar maquillaje, calzado, tintes, sustancias químicas ni cualquier elemento que pueda ocasionar daños o manchas. Asimismo, las sábanas, fundas, toallas y demás ropa de habitación deberán mantenerse en condiciones adecuadas. En caso de presentar manchas permanentes, daños, roturas o deterioro ocasionado por un uso inadecuado, se aplicará un cargo adicional por limpieza especializada, reparación o reposición.',
      },
      {
        titulo: '8. Conducta Adecuada',
        texto:
          'Por favor mantener una conducta respetuosa hacia otros huéspedes, colaboradores y las instalaciones del hotel. Agradecemos su colaboración y comprensión. Su cumplimiento nos permite brindarle un servicio de calidad y una experiencia agradable durante su estancia.',
      },
    ],
    declaracionTitulo: 'Declaración de Aceptación',
    declaracion:
      'Yo, {{nombre}}, identificado(a) con documento de identidad N.° {{documento}}, alojado(a) en la habitación {{habitacion}}, declaro que he leído y comprendido en su totalidad el Reglamento de Hospedaje del HOTEL MANSIÓN DEL VIAJERO, operado por Corporación H&D S.A., y me comprometo a cumplir con todas sus disposiciones. Asimismo, acepto quedar sujeto(a) al cobro de cualquier cargo, multa o cobro por concepto de reparación, reposición o limpieza especializada derivado de daños, pérdidas o deterioro ocasionados a las instalaciones, mobiliario, equipos, ropa de habitación o enseres del hotel durante mi estadía, conforme a lo establecido en el presente reglamento.',
    campos: {
      nombre: 'Nombre completo',
      documento: 'N.° de identificación / pasaporte',
      habitacion: 'N.° de habitación',
      fecha: 'Fecha',
      firma: 'Firma',
    },
    ui: {
      seleccionIdioma: 'Selecciona el idioma en el que deseas leer el reglamento',
      botonEspanol: 'Español',
      botonIngles: 'English',
      aceptacion: 'He leído y acepto el Reglamento de Hospedaje del hotel.',
      botonLimpiarFirma: 'Limpiar firma',
      botonFirmar: 'Firmar y guardar',
      botonCambiarIdioma: 'Cambiar idioma',
      firmeAqui: 'Firme dentro del recuadro con el dedo',
      exitoTitulo: '¡Documento firmado correctamente!',
      exitoTexto: 'Gracias por aceptar el Reglamento de Hospedaje del hotel.',
      botonDescargarPdf: 'Descargar PDF',
      botonNuevoDocumento: 'Firmar otro documento',
      errorGenerico: 'Ocurrió un error. Intente nuevamente.',
      errorAceptacion: 'Debe marcar la casilla de aceptación del reglamento.',
      errorFirma: 'Debe firmar en el recuadro antes de continuar.',
      errorCampos: 'Complete el nombre, el número de documento y el número de habitación.',
      verDocumentos: 'Ver documentos firmados',
    },
  },

  en: {
    idioma: 'en',
    hotel: 'HOTEL MANSIÓN DEL VIAJERO',
    empresa: 'Corporación H&D S.A.',
    tituloDocumento: 'Accommodation Rules',
    secciones: [
      {
        titulo: '1. Key and Remote Control Return',
        texto:
          'Keys and remote controls must be returned to reception upon check-out, in the same condition in which they were received. In case of damage, loss, or misplacement, an additional replacement charge will apply.',
      },
      {
        titulo: '2. Check-in Hours',
        texto: 'Check-in: From 3:00 p.m.\nCheck-out: Until 12:00 p.m.',
      },
      {
        titulo: '3. No Smoking',
        texto: 'Smoking is prohibited inside the rooms.',
      },
      {
        titulo: '4. Respect and Convenience',
        texto:
          'Please keep the volume of televisions, audio devices, and conversations at a moderate level to ensure the rest of other guests.',
      },
      {
        titulo: '5. Visitors Registered',
        texto: 'All visitors must register in advance at reception. The hotel reserves the right of admission.',
      },
      {
        titulo: '6. Room Occupancy',
        texto: 'The number of people registered for the room may not be exceeded.',
      },
      {
        titulo: '7. Care of the Facilities and Room in General',
        texto:
          "Guests are responsible for the proper use and maintenance of the hotel's furniture, equipment, decor, and facilities. The towels provided by the hotel are for personal hygiene and drying only. They should not be used to clean makeup, shoes, dyes, chemicals, or anything that may cause damage or stains. Likewise, sheets, pillowcases, towels, and other linens in the room must be kept in good condition. In case of permanent stains, damage, tears, or deterioration caused by improper use, an additional charge will be applied for specialized cleaning, repair, or replacement.",
      },
      {
        titulo: '8. Appropriate Conduct',
        texto:
          'Please maintain respectful behavior toward other guests, staff, and the hotel facilities. We appreciate your cooperation and understanding. Your compliance allows us to provide you with quality service and a pleasant experience during your stay.',
      },
    ],
    declaracionTitulo: 'Acceptance Statement',
    declaracion:
      "I, {{nombre}}, identified with ID/passport N.° {{documento}}, staying in room {{habitacion}}, declare that I have read and fully understood the Accommodation Rules of HOTEL MANSIÓN DEL VIAJERO, operated by Corporación H&D S.A., and I agree to comply with all its provisions. I also accept being subject to any charge, fine, or fee for repair, replacement, or specialized cleaning resulting from damage, loss, or deterioration caused to the hotel's facilities, furniture, equipment, room linens, or belongings during my stay, in accordance with this regulation.",
    campos: {
      nombre: 'Full name',
      documento: 'ID / Passport number',
      habitacion: 'Room number',
      fecha: 'Date',
      firma: 'Signature',
    },
    ui: {
      seleccionIdioma: 'Select the language you want to read the rules in',
      botonEspanol: 'Español',
      botonIngles: 'English',
      aceptacion: 'I have read and accept the hotel Accommodation Rules.',
      botonLimpiarFirma: 'Clear signature',
      botonFirmar: 'Sign and save',
      botonCambiarIdioma: 'Change language',
      firmeAqui: 'Sign inside the box with your finger',
      exitoTitulo: 'Document signed successfully!',
      exitoTexto: 'Thank you for accepting the hotel Accommodation Rules.',
      botonDescargarPdf: 'Download PDF',
      botonNuevoDocumento: 'Sign another document',
      errorGenerico: 'An error occurred. Please try again.',
      errorAceptacion: 'You must check the box accepting the rules.',
      errorFirma: 'You must sign inside the box before continuing.',
      errorCampos: 'Fill in the name, ID number and room number.',
      verDocumentos: 'View signed documents',
    },
  },
};

module.exports = REGLAMENTO;
