
import { Cliente, EtapaContable, EtapaEmbudo, ModuloServicio, Prospecto, RegimenFiscal, UserRole, Auxiliar, RolAuxiliar, AdminLead, GlobalDownloadJob, FunnelStepConfig, Ticket, POSProduct } from './types';

// Mock Data - TICKETS
export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't1',
    clienteId: '1', // Juan Perez
    fechaCarga: '2023-10-27 10:30 AM',
    imageUrl: 'ticket_gasolina.jpg',
    status: 'PENDING',
    categoria: 'GASTO',
    subcategoria: 'Combustible',
    montoTotal: 500.00,
    fechaTicket: '2023-10-26',
    rfcEmisor: 'GAS999999XYZ'
  },
  {
    id: 't2',
    clienteId: '1',
    fechaCarga: '2023-10-27 11:15 AM',
    imageUrl: 'ticket_oxxo.jpg',
    status: 'INVOICED',
    categoria: 'GASTO',
    subcategoria: 'Viáticos',
    montoTotal: 85.50,
    fechaTicket: '2023-10-25',
    rfcEmisor: 'CCO8605231N4'
  },
  {
    id: 't3',
    clienteId: '2', // Maria Airbnb
    fechaCarga: '2023-10-26 09:00 AM',
    imageUrl: 'factura_mueble.jpg',
    status: 'PENDING',
    categoria: 'GASTO',
    subcategoria: 'Mantenimiento',
    montoTotal: 1200.00,
    fechaTicket: '2023-10-24',
    rfcEmisor: 'LIV999999'
  }
];

// Mock Data for MVP - CLIENTES (Del Contador)
export const MOCK_CLIENTES: Cliente[] = [
  {
    id: '1',
    nombre: 'Juan Pérez Chofer',
    rfc: 'PEPJ800101XYZ',
    regimen: RegimenFiscal.PLATAFORMAS,
    email: 'juan.perez@uber.com',
    telefono: '5512345678',
    etapa: EtapaContable.PENDIENTE,
    responsableId: 'aux1',
    tieneMensajesNoLeidos: true,
    ultimaNota: 'Falta enviar XMLs de Uber Eats del mes pasado.',
    modulosActivos: ['mod_control_pagos'],
    satCertificados: {
      hasCer: true, cerFileName: 'juan_perez.cer',
      hasKey: true, keyFileName: 'juan_perez.key',
      hasPass: true, privateKeyPass: 'ClaveFiel123',
      hasCiec: true, ciecPass: 'CiecSat2025',
      lastUpdated: '2023-10-01'
    },
    historialPagos: [
      { id: 'p1', fecha: '01/10/2025', concepto: 'Honorarios Octubre', monto: 500, comprobanteUrl: 'voucher_oct.jpg' }
    ],
    configuracionFiscal: {
      modalidad: 'PAGO_PROVISIONAL',
      saldoAFavorAnterior: 1500
    },
    tickets: MOCK_TICKETS.filter(t => t.clienteId === '1')
  },
  {
    id: '2',
    nombre: 'Maria Lopez Airbnb',
    rfc: 'LOMM900202ABC',
    regimen: RegimenFiscal.PLATAFORMAS,
    email: 'maria.bnb@gmail.com',
    telefono: '5587654321',
    etapa: EtapaContable.INICIAR,
    responsableId: 'aux1',
    tieneMensajesNoLeidos: false,
    ultimaNota: 'Ingresos de Airbnb descargados correctamente.',
    modulosActivos: ['mod_hoteles'],
    satCertificados: {
      hasCer: false,
      hasKey: false,
      hasPass: false,
      hasCiec: false
    },
    historialPagos: [],
    configuracionFiscal: {
      modalidad: 'PAGO_DEFINITIVO',
      saldoAFavorAnterior: 0
    },
    tickets: MOCK_TICKETS.filter(t => t.clienteId === '2')
  },
  {
    id: '3',
    nombre: 'Abarrotes Don Pepe',
    rfc: 'GOME550505R11',
    regimen: RegimenFiscal.RESICO,
    email: 'pepe@tienda.com',
    telefono: '5511223344',
    etapa: EtapaContable.AUTORIZAR,
    responsableId: 'aux2',
    tieneMensajesNoLeidos: false,
    ultimaNota: 'Cálculo de IVA pendiente de revisión.',
    modulosActivos: ['mod_pos', 'mod_inventarios'],
    historialPagos: [],
    configuracionFiscal: {
      modalidad: 'PAGO_PROVISIONAL',
      saldoAFavorAnterior: 0
    },
    tickets: []
  },
  {
    id: '4',
    nombre: 'Roberto Deudor',
    rfc: 'ROBD880808HHO',
    regimen: RegimenFiscal.RESICO,
    email: 'robert@hotmail.com',
    telefono: '5599887766',
    etapa: EtapaContable.DEUDOR,
    responsableId: 'aux1',
    tieneMensajesNoLeidos: true,
    ultimaNota: 'No ha pagado la mensualidad de Marzo.',
    modulosActivos: [],
    historialPagos: [],
    tickets: []
  }
];

// Mock Data - PROSPECTOS (Del Contador)
export const MOCK_PROSPECTOS: Prospecto[] = [
  {
    id: 'p1',
    nombre: 'Carlos Prospecto',
    telefono: '5544332211',
    etapa: EtapaEmbudo.CONTACTO_INICIAL,
    tieneMensajesNoLeidos: true,
    aiAgentEnabled: true,
    fechaUltimoContacto: '2023-10-25',
    notas: [{ id: 'n1', autor: 'Contador', fecha: '2023-10-25', texto: 'Preguntó por paquete básico.' }],
    esPosiblePago: false,
    tienePendiente: true,
    satCertificados: { hasCer: false, hasKey: false, hasPass: false, hasCiec: false },
    historialPagos: [],
    cotizaciones: []
  },
  {
    id: 'p2',
    nombre: 'Ana Interesada',
    telefono: '5566778899',
    etapa: EtapaEmbudo.POSIBLE_PAGO, // Changed to POSIBLE PAGO to test new feature
    tieneMensajesNoLeidos: false,
    aiAgentEnabled: true, 
    fechaUltimoContacto: '2023-10-24',
    notas: [{ id: 'n2', autor: 'Auxiliar', fecha: '2023-10-24', texto: 'Se le envió cotización de RESICO.' }],
    esPosiblePago: true,
    tienePendiente: false,
    satCertificados: { hasCer: false, hasKey: false, hasPass: false, hasCiec: false },
    historialPagos: [
      { id: 'pay1', fecha: '2023-10-24', concepto: 'Asesoría Inicial', monto: 500, comprobanteUrl: 'voucher_ana.jpg' }
    ],
    cotizaciones: [
      { 
        id: 'cot_1', 
        folio: 'COT-001', 
        fecha: '24/10/2023', 
        subtotal: 600, 
        iva: 96, 
        total: 696, 
        estado: 'ENVIADA',
        tipo: 'ESTANDAR',
        items: [
          { id: '1', descripcion: 'Mensualidad RESICO', cantidad: 1, precioUnitario: 600, total: 600 }
        ]
      }
    ]
  },
  {
    id: 'p3',
    nombre: 'Jorge Didi',
    telefono: '5511002233',
    etapa: EtapaEmbudo.BIENVENIDA,
    tieneMensajesNoLeidos: false,
    aiAgentEnabled: true,
    fechaUltimoContacto: '2023-10-26',
    notas: [],
    esPosiblePago: false,
    tienePendiente: false,
    satCertificados: { hasCer: false, hasKey: false, hasPass: false, hasCiec: false },
    historialPagos: [],
    cotizaciones: []
  },
  {
    id: 'p4',
    nombre: 'Pedro Fantasma',
    telefono: '5500009999',
    etapa: EtapaEmbudo.INACTIVO, 
    tieneMensajesNoLeidos: false,
    aiAgentEnabled: true,
    fechaUltimoContacto: '2023-10-01',
    notas: [{ id: 'n3', autor: 'Sistema', fecha: '2023-10-10', texto: 'Movido automáticamente a Sin Respuesta por falta de interacción.' }],
    esPosiblePago: false,
    tienePendiente: false,
    satCertificados: { hasCer: false, hasKey: false, hasPass: false, hasCiec: false },
    historialPagos: [],
    cotizaciones: []
  }
];

// Mock Data - EQUIPO DE AUXILIARES
export const MOCK_EQUIPO: Auxiliar[] = [
  { 
    id: 'aux1', 
    nombre: 'Laura Auxiliar', 
    usuario: 'laura123', 
    rol: RolAuxiliar.BASICO, 
    fechaRegistro: '2023-01-15' 
  },
  { 
    id: 'aux2', 
    nombre: 'Pedro Gerente', 
    usuario: 'pedro_admin', 
    rol: RolAuxiliar.AVANZADO, 
    fechaRegistro: '2023-05-20' 
  }
];

// Mock Data - CONTADORES (Para el Super Admin)
export const MOCK_CONTADORES = [
  { id: 'c1', nombre: 'Despacho López y Asoc.', plan: 'Intermedio', clientes: 28, estado: 'Al corriente', ultimoPago: '2023-10-01' },
  { id: 'c2', nombre: 'Contadora Silvia', plan: 'Básico', clientes: 8, estado: 'Al corriente', ultimoPago: '2023-10-05' },
  { id: 'c3', nombre: 'Fiscalistas Express', plan: 'Premium', clientes: 150, estado: 'Moroso', ultimoPago: '2023-08-01' },
];

// Mock Data - LEADS DE CONTADORES (Para el Funnel del Super Admin)
// VALORES ACTUALIZADOS: Básico $1,888 | Intermedio $6,888 | Premium $9,888
export const MOCK_ADMIN_LEADS: AdminLead[] = [
  {
    id: 'l1',
    nombre: 'Lic. Fernando Torres',
    despacho: 'Torres Contadores',
    telefono: '5599887766',
    email: 'fer@torres.com',
    origen: 'Facebook',
    etapa: 'LEAD',
    valorPotencial: 22656, // Plan Básico Anual ($1888 * 12)
    notas: 'Interesado en la función de WhatsApp.',
    fechaIngreso: '2023-10-26'
  },
  {
    id: 'l2',
    nombre: 'Despacho Global S.C.',
    despacho: 'Global S.C.',
    telefono: '5511223344',
    email: 'contacto@globalsc.mx',
    origen: 'Google',
    etapa: 'DEMO',
    valorPotencial: 82656, // Plan Intermedio Anual ($6888 * 12)
    notas: 'Demo agendada para el lunes. Quieren ver módulo de nómina.',
    fechaIngreso: '2023-10-25'
  },
  {
    id: 'l3',
    nombre: 'Contadora Patricia',
    despacho: 'Independiente',
    telefono: '5544668800',
    email: 'paty@gmail.com',
    origen: 'Referido',
    etapa: 'TRIAL',
    valorPotencial: 22656, // Básico
    notas: 'Está usando la prueba de 15 días. Preguntó cómo cargar XML masivos.',
    fechaIngreso: '2023-10-20'
  },
  {
    id: 'l4',
    nombre: 'Consultores Fiscales MX',
    despacho: 'Consultores MX',
    telefono: '3312345678',
    email: 'ventas@consultores.mx',
    origen: 'Directo',
    etapa: 'NEGOTIATION',
    valorPotencial: 118656, // Premium Anual ($9888 * 12)
    notas: 'Piden descuento si pagan 2 años por adelantado.',
    fechaIngreso: '2023-10-15'
  }
];

// DATA FOR CURRENT LOGGED IN ACCOUNTANT (PROFILE PAGE)
// REFLEJA PLAN INTERMEDIO $6,888
export const CURRENT_CONTADOR_PROFILE = {
  nombre: 'Miguel Ángel López',
  despacho: 'Despacho Contable López y Asoc.',
  email: 'miguel@despacholopez.com',
  telefono: '5512345678',
  plan: {
    nombre: 'Paquete Intermedio',
    precio: '$6,888 MXN', 
    limiteClientes: 50,
    clientesUsados: 28,
    proximoPago: '15 de Noviembre, 2024',
    estado: 'Activo',
    metodoPago: 'Visa terminada en 4242'
  },
  historialPagos: [
    { id: 1, fecha: '15 Oct 2024', monto: '$6,888.00', estado: 'Pagado', folio: 'F-10230' },
    { id: 2, fecha: '15 Sep 2024', monto: '$6,888.00', estado: 'Pagado', folio: 'F-09112' },
    { id: 3, fecha: '15 Ago 2024', monto: '$6,888.00', estado: 'Pagado', folio: 'F-08005' },
  ]
};

// MOCK GLOBAL DOWNLOADS (For Downloads Center)
export const MOCK_GLOBAL_DOWNLOADS: GlobalDownloadJob[] = [
  {
    id: 'd1',
    clienteId: '3',
    clienteNombre: 'Abarrotes Don Pepe',
    clienteRfc: 'GOME550505R11',
    periodoLabel: 'Octubre 2025',
    status: 'COMPLETED',
    breakdown: { ingresos: 145, gastos: 82, retenciones: 0 },
    fechaInicio: '10:05 AM',
    fechaFin: '10:12 AM'
  },
  {
    id: 'd2',
    clienteId: '1',
    clienteNombre: 'Juan Pérez Chofer',
    clienteRfc: 'PEPJ800101XYZ',
    periodoLabel: 'Octubre 2025',
    status: 'IN_PROGRESS',
    breakdown: { ingresos: 12, gastos: 5, retenciones: 0 },
    fechaInicio: '10:25 AM'
  },
  {
    id: 'd3',
    clienteId: '2',
    clienteNombre: 'Maria Lopez Airbnb',
    clienteRfc: 'LOMM900202ABC',
    periodoLabel: 'Septiembre 2025',
    status: 'COMPLETED',
    breakdown: { ingresos: 45, gastos: 12, retenciones: 2 },
    fechaInicio: '09:00 AM',
    fechaFin: '09:05 AM'
  },
  {
    id: 'd4',
    clienteId: '4',
    clienteNombre: 'Roberto Deudor',
    clienteRfc: 'ROBD880808HHO',
    periodoLabel: 'Agosto 2025',
    status: 'ERROR',
    breakdown: { ingresos: 0, gastos: 0, retenciones: 0 },
    fechaInicio: 'Yesterday'
  }
];

export const MODULOS_DISPONIBLES: ModuloServicio[] = [
  { 
    id: 'serv_facturacion', 
    nombre: 'Facturación Ilimitada', 
    descripcion: 'Servicio de timbrado ilimitado para que tu cliente emita todas sus facturas.', 
    costoBase: 150 
  },
  { id: 'mod_pos', nombre: 'Punto de Venta (POS)', descripcion: 'Caja registradora simple para ventas mostrador.', costoBase: 200 },
  { id: 'mod_pagos', nombre: 'Control de Pagos', descripcion: 'Gestión de cobranza y recordatorios automáticos.', costoBase: 100 },
  { id: 'mod_inventarios', nombre: 'Inventarios', descripcion: 'Control de existencias, entradas y salidas.', costoBase: 300 },
  { id: 'mod_nomina', nombre: 'Nómina', descripcion: 'Cálculo y timbrado de nómina para empleados.', costoBase: 400 },
  { id: 'mod_choferes', nombre: 'Control de Choferes', descripcion: 'Gestión de flotillas, gastos y mantenimientos.', costoBase: 250 },
  { id: 'mod_hoteles', nombre: 'Admin Hoteles', descripcion: 'Reservas, limpieza y recepción.', costoBase: 500 },
];

export const MOCK_CHAT_HISTORY: Record<string, {id: number, sender: string, text: string, time: string}[]> = {
  // Chat: Super Admin <-> Contador
  'c1': [
    { id: 1, sender: 'contador', text: 'Hola, tengo una duda con mi facturación.', time: '10:00 AM' },
    { id: 2, sender: 'admin', text: 'Hola, claro. ¿En qué te puedo ayudar?', time: '10:05 AM' },
    { id: 3, sender: 'contador', text: 'Quiero subir al plan Premium, ¿cómo lo hago?', time: '10:10 AM' },
  ],
  'c3': [
    { id: 1, sender: 'admin', text: 'Estimado usuario, su pago está vencido.', time: 'Yesterday' },
  ],
  '1': [
    { id: 1, sender: 'cliente', text: 'Hola Contador, ya subí los tickets de gasolina.', time: '09:30 AM' },
    { id: 2, sender: 'contador', text: 'Perfecto Juan, los reviso y genero la factura hoy.', time: '09:45 AM' },
    { id: 3, sender: 'cliente', text: 'Gracias, me avisas.', time: '09:46 AM' },
  ],
  '2': [
    { id: 1, sender: 'contador', text: 'Hola Maria, recuerda enviarme la FIEL actualizada.', time: 'Yesterday' },
  ],
  '4': [
    { id: 1, sender: 'contador', text: 'Roberto, tenemos pendiente la mensualidad.', time: 'Last Week' },
    { id: 2, sender: 'cliente', text: 'Sí contador, paso mañana a pagarle.', time: 'Last Week' },
  ],
  'p1': [
    { id: 1, sender: 'prospecto', text: 'Buenas tardes, vi su anuncio en Facebook.', time: '11:00 AM' },
    { id: 2, sender: 'contador', text: 'Hola Carlos, bienvenido. ¿Buscas contabilidad para Uber o RESICO?', time: '11:05 AM' },
    { id: 3, sender: 'prospecto', text: 'Para Uber, apenas voy a empezar.', time: '11:06 AM' },
  ],
  'p2': [
    { id: 1, sender: 'contador', text: 'Hola Ana, te envié la cotización por correo.', time: 'Yesterday' },
    { id: 2, sender: 'prospecto', text: 'Si gracias, lo checo y te aviso.', time: 'Yesterday' },
  ]
};

// INITIAL FUNNEL CONFIGURATION WITH AUTOMATION
export const DEFAULT_FUNNEL_CONFIG: FunnelStepConfig[] = [
  { 
    id: 1, 
    mappedEtapa: EtapaEmbudo.CONTACTO_INICIAL, 
    title: 'Paso 1: Contacto y Bienvenida', 
    autoMessage: { 
      enabled: true, 
      initialDelayMinutes: 5, // 5 min delay
      text: '¡Hola! Gracias por tu interés. Soy el Contador Miguel. ¿Qué tipo de negocio tienes?', 
      mediaType: 'NONE' 
    },
    aiConfig: {
      enabled: true,
      triggerQuestion: "Saber si es Plataforma (Uber/Didi) o Negocio Físico.",
      expectedKeywords: ["uber", "didi", "plataforma", "chofer", "repartidor", "airbnb"],
      offTrackReply: "Entendido. Para darte la mejor asesoría, necesito confirmar: ¿Tu actividad es en Apps (Uber/Didi) o negocio local?"
    },
    moveToInactiveAfterFinish: true, // Enabled for Step 1
    followUpSequence: [
      { id: 'seq_1', delayValue: 10, delayUnit: 'MINUTES', message: '¿Sigues ahí? Solo quiero saber si eres Uber, Didi o negocio físico para enviarte la info correcta.', mediaType: 'NONE' },
      { id: 'seq_2', delayValue: 1, delayUnit: 'HOURS', message: 'Hola, veo que estás ocupado. Te dejo aquí un video de presentación.', mediaType: 'VIDEO' },
      { id: 'seq_3', delayValue: 1, delayUnit: 'DAYS', message: 'Buenos días. ¿Pudiste ver la información?', mediaType: 'NONE', timeRestriction: '08:00-10:00' },
      { id: 'seq_4', delayValue: 1, delayUnit: 'DAYS', message: 'Sigo pendiente. Recuerda que la primera asesoría es gratis.', mediaType: 'NONE' },
      { id: 'seq_5', delayValue: 3, delayUnit: 'DAYS', message: 'Hola. ¿Aún te interesa llevar tu contabilidad en orden?', mediaType: 'NONE' },
      { id: 'seq_6', delayValue: 7, delayUnit: 'DAYS', message: 'Hola. Voy a cerrar tu expediente por falta de respuesta, pero si necesitas algo, aquí estoy.', mediaType: 'NONE' }
    ]
  },
  { 
    id: 2, 
    mappedEtapa: EtapaEmbudo.BIENVENIDA, 
    title: 'Paso 2: Videos de Presentación', 
    autoMessage: { enabled: true, initialDelayMinutes: 0, text: 'Bienvenido. Aquí tienes un video sobre cómo trabajamos.', mediaType: 'VIDEO', mediaName: 'presentacion_despacho.mp4' },
    aiConfig: { enabled: false, triggerQuestion: "", expectedKeywords: [], offTrackReply: "" },
    moveToInactiveAfterFinish: false,
    followUpSequence: []
  },
  { 
    id: 3, 
    mappedEtapa: EtapaEmbudo.COTIZACION, 
    title: 'Paso 3: Recolección de Firmas', 
    isDocCollector: true, 
    docConfig: {
       requiredDocs: ['.cer', '.key', 'contraseña'],
       uploadInstruction: 'Para poder darte de alta y facturar, necesito tus archivos del SAT (e.Firma). Súbelos en el siguiente enlace seguro.',
       successMessage: '¡Archivos recibidos y validados! Continuamos con el proceso.'
    },
    autoMessage: { enabled: true, initialDelayMinutes: 0, text: 'Para avanzar, necesito que subas tus archivos del SAT en este enlace seguro:', mediaType: 'NONE' },
    aiConfig: { enabled: false, triggerQuestion: "", expectedKeywords: [], offTrackReply: "" },
    moveToInactiveAfterFinish: false,
    followUpSequence: [
       { id: 'seq_c1', delayValue: 1, delayUnit: 'DAYS', message: 'Hola, veo que aún no subes tus sellos. ¿Tienes problemas con el archivo?', mediaType: 'NONE' },
       { id: 'seq_c2', delayValue: 3, delayUnit: 'DAYS', message: 'Sigo esperando tus archivos .CER y .KEY para poder facturar.', mediaType: 'NONE' }
    ]
  },
  { 
    id: 4, 
    mappedEtapa: EtapaEmbudo.POSIBLE_PAGO, 
    title: 'Paso 4: Posible Pago', 
    autoMessage: { enabled: false, initialDelayMinutes: 0, text: '', mediaType: 'NONE' },
    aiConfig: { enabled: false, triggerQuestion: "", expectedKeywords: [], offTrackReply: "" },
    // NEW SMART PURSUIT DEFAULT CONFIG
    smartPursuitConfig: {
       enabled: true,
       intensity: 'MEDIUM',
       customExcuses: ["No tengo dinero", "Está caro", "Déjame pensarlo"]
    },
    moveToInactiveAfterFinish: false,
    followUpSequence: []
  },
  { 
    id: 5, 
    mappedEtapa: EtapaEmbudo.GANADO, 
    title: 'Paso 5: Cierre Exitoso', 
    autoMessage: { enabled: true, initialDelayMinutes: 0, text: '¡Gracias por tu confianza! Comencemos.', mediaType: 'AUDIO', mediaName: 'bienvenida_audio.mp3' },
    aiConfig: { enabled: false, triggerQuestion: "", expectedKeywords: [], offTrackReply: "" },
    moveToInactiveAfterFinish: false,
    followUpSequence: []
  }
];

export const NAV_LINKS_CONTADOR = [
  { path: '/contador', label: 'Tablero Clientes', icon: 'users' },
  { path: '/contador/descargas', label: 'Centro Descargas', icon: 'activity' },
  { path: '/contador/embudo', label: 'Embudo (Prospectos)', icon: 'filter' },
  { path: '/contador/tienda', label: 'Tienda de Servicios', icon: 'shopping-bag' },
  { path: '/contador/equipo', label: 'Mi Equipo', icon: 'users' }, 
  { path: '/contador/perfil', label: 'Mi Suscripción', icon: 'briefcase' }, 
  { path: '/contador/mi-web', label: 'Mi Página Web', icon: 'globe' },
  { path: '/contador/configuracion', label: 'Configuración', icon: 'settings' },
];

export const NAV_LINKS_ADMIN = [
  { path: '/admin', label: 'Directorio (Clientes)', icon: 'briefcase' }, 
  { path: '/admin/embudo', label: 'Embudo de Ventas', icon: 'filter' },
  { path: '/admin/config', label: 'Configuración', icon: 'settings' },
];

export const NAV_LINKS_CLIENTE = [
  { path: '/portal', label: 'Mi Resumen', icon: 'file' },
  { path: '/portal/facturas', label: 'Mis Facturas', icon: 'download' },
  { path: '/portal/tickets', label: 'Subir Tickets', icon: 'check' },
  { path: '/portal/perfil', label: 'Mi Perfil', icon: 'users' },
];

export const MOCK_POS_PRODUCTS: POSProduct[] = [
  { id: 'pos1', nombre: 'Asesoría 1h', precio: 500, categoria: 'Servicios', color: 'bg-blue-500', icono: 'message' },
  { id: 'pos2', nombre: 'Declaración Mensual', precio: 800, categoria: 'Fiscal', color: 'bg-indigo-500', icono: 'file' },
  { id: 'pos3', nombre: 'Alta RFC', precio: 1200, categoria: 'Trámites', color: 'bg-emerald-500', icono: 'add-user' },
  { id: 'pos4', nombre: 'Facturas (50)', precio: 300, categoria: 'Paquetes', color: 'bg-amber-500', icono: 'shopping-bag' },
  { id: 'pos5', nombre: 'Regularización', precio: 2500, categoria: 'Fiscal', color: 'bg-rose-500', icono: 'alert' },
  { id: 'pos6', nombre: 'Curso Básico', precio: 1500, categoria: 'Cursos', color: 'bg-purple-500', icono: 'brain' },
];
