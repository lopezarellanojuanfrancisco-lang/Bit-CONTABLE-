
import { IconName } from './components/Icon';

// ENUMS para Regimen y Estados
export enum RegimenFiscal {
  RESICO = 'RESICO',
  PLATAFORMAS = 'Plataformas Tecnológicas',
  RIF = 'RIF',
  PERSONA_MORAL = 'Persona Moral',
  OTRO = 'Otro'
}

export enum EtapaContable {
  PENDIENTE = 'Pendiente',
  INICIAR = 'Iniciar Contabilidad',
  PRECIERRE = 'Precierre',
  AUTORIZAR = 'Autorizar Cierre',
  TERMINADO = 'Terminado',
  DEUDOR = 'Deudor'
}

export enum EtapaEmbudo {
  CONTACTO_INICIAL = 'Contacto Inicial',
  BIENVENIDA = 'Bienvenida Enviada',
  COTIZACION = 'Cotización Enviada',
  POSIBLE_PAGO = 'Posible Pago',
  GANADO = 'Ganado',
  PERDIDO = 'Perdido',
  INACTIVO = 'Inactivo'
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CONTADOR = 'CONTADOR',
  AUXILIAR = 'AUXILIAR',
  CLIENTE = 'CLIENTE'
}

export enum RolAuxiliar {
  BASICO = 'Auxiliar Contable (Básico)',
  AVANZADO = 'Gestor Administrativo (Full)'
}

// LOGICA DE PLANES Y PAGOS (SUPER ADMIN)
export type FrecuenciaPago = 1 | 3 | 6 | 12; // Meses

export interface PlanContadorConfig {
  nombre: string;
  limiteClientes: number;
  costoMensual: number;
  esPrueba: boolean;
  duracionMeses?: number; // Si es prueba, esto pueden ser días
  fechaInicio?: string;
  fechaFin?: string;
}

export interface PagoRegistro {
  id: string;
  fecha: string;
  monto: number;
  metodo: 'Transferencia (Voucher)' | 'Tarjeta (Stripe)' | 'MercadoPago' | 'Efectivo';
  comprobanteUrl?: string; // URL del PDF o Imagen
  estado: 'Pendiente' | 'Pagado' | 'Rechazado';
  referencia?: string;
}

// ADMIN SALES FUNNEL (CRM B2B)
export type AdminFunnelStage = 'LEAD' | 'DEMO' | 'TRIAL' | 'NEGOTIATION' | 'WON';

export interface AdminLead {
  id: string;
  nombre: string; // Nombre del Contador
  despacho?: string;
  telefono: string;
  email: string;
  origen: 'Facebook' | 'Google' | 'Referido' | 'Directo';
  etapa: AdminFunnelStage;
  valorPotencial: number; // Cuánto estimamos que pagará (ej. Plan Premium anual)
  notas: string;
  fechaIngreso: string;
}

// SAT DOWNLOAD MODULE TYPES
export type SatJobStatus = 'IDLE' | 'AUTH' | 'QUERY' | 'DOWNLOADING' | 'COMPLETED' | 'ERROR';

export interface SatLog {
  id: number;
  timestamp: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

export interface SatJob {
  id: string;
  periodoMes: string;
  periodoAnio: string;
  tipo: 'TODOS' | 'INGRESOS' | 'GASTOS' | 'NOMINA' | 'RETENCIONES';
  status: SatJobStatus;
  totalReportados: number;
  totalDescargados: number;
  // BREAKDOWN: Desglose de tipos de facturas
  breakdown: {
    ingresos: number;
    gastos: number;
    retenciones: number;
  };
  paquetesTotal: number;
  paquetesProcesados: number;
  logs: SatLog[];
  fechaInicio: string;
}

export interface SatCertificates {
  hasCer: boolean;
  cerFileName?: string;
  
  hasKey: boolean;
  keyFileName?: string;
  
  hasPass: boolean; // Indicates if Private Key pass exists
  privateKeyPass?: string; // Contraseña de la Llave Privada (Firma)
  
  hasCiec: boolean; // Indicates if CIEC exists
  ciecPass?: string; // Contraseña del SAT (CIEC)
  
  lastUpdated?: string;
}

// GLOBAL DOWNLOAD MONITORING
export interface GlobalDownloadJob {
  id: string;
  clienteId: string;
  clienteNombre: string;
  clienteRfc: string;
  periodoLabel: string; // "Oct 2025"
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ERROR';
  breakdown: {
    ingresos: number;
    gastos: number;
    retenciones: number;
  };
  fechaInicio: string; // ISO string or formatted time
  fechaFin?: string;
}

// ACCOUNTING MODULE TYPES
export interface AccountingInvoice {
  id: string;
  fecha: string;
  rfc: string;
  nombre: string;
  concepto: string;
  monto: number;
  tipo: 'INGRESO' | 'GASTO' | 'RETENCION';
  esDeducible: boolean;
  categoria?: string; // "Combustible", "Papelería"
  cobrada?: boolean; // Nuevo campo para flujo de efectivo (Conciliación)
}

// NUEVO: ACTIVOS FIJOS (Depreciación)
export type TipoActivo = 'AUTO' | 'COMPUTO' | 'CELULAR' | 'MOBILIARIO' | 'OTRO';

export interface FixedAsset {
  id: string;
  nombre: string; // "Nissan Versa 2023"
  tipo: TipoActivo;
  montoOriginal: number;
  fechaAdquisicion: string;
  tasaAnual: number; // 0.25, 0.30
  depreciacionAcumulada: number; 
  
  // NEW ADMINISTRATIVE FIELDS
  noSerie?: string;
  responsable?: string; // "Juan Pérez"
  proveedor?: string; // "Liverpool"
}

// FUNNEL CONFIGURATION TYPES
export type MediaType = 'NONE' | 'AUDIO' | 'VIDEO' | 'IMAGE' | 'PDF';

// AUTOMATION TYPES
export interface FollowUpAction {
  id: string;
  delayValue: number;
  delayUnit: 'MINUTES' | 'HOURS' | 'DAYS';
  message: string;
  mediaType: MediaType;
  mediaName?: string; // Filename for the attachment
  timeRestriction?: string; // e.g. "08:00-10:00" or null
}

// NEW: SMART PURSUIT CONFIG (For "Posible Pago")
export type PursuitIntensity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SmartPursuitConfig {
  enabled: boolean;
  intensity: PursuitIntensity;
  customExcuses: string[]; // ["No tengo dinero", "Déjame pensarlo"] - AI will use these to counter
}

export interface FunnelStepConfig {
  id: number; // 1 to 5
  mappedEtapa: EtapaEmbudo; // Logic mapping
  title: string; // Editable Title
  
  // Initial Immediate Message
  autoMessage: {
    enabled: boolean;
    initialDelayMinutes: number; // New: First message delay
    text: string;
    mediaType: MediaType;
    mediaName?: string; // "brochure.pdf"
  };

  // AI Configuration (Standard)
  aiConfig: {
    enabled: boolean;
    triggerQuestion: string; // "Are you Uber or Didi?"
    expectedKeywords: string[]; // ["uber", "didi", "plataforma"]
    offTrackReply: string; // "Entendido, pero para ayudarte mejor..."
  };

  // NEW: Smart Pursuit (Closing Strategy)
  smartPursuitConfig?: SmartPursuitConfig;

  // Sequence of follow-ups if no response
  followUpSequence: FollowUpAction[];

  // Final Action: New Flag for "No Response" logic
  moveToInactiveAfterFinish: boolean;

  // NEW: Document Collector Logic
  isDocCollector?: boolean;
  docConfig?: {
     requiredDocs: string[];
     uploadInstruction: string;
     successMessage: string;
  };
}

// NUEVO: PAGO DE PROSPECTO Y CLIENTE
export interface PagoRegistroItem {
  id: string;
  fecha: string;
  concepto: string; // Ej. "Asesoría Inicial", "Anticipo Anualidad", "Honorarios Octubre"
  monto: number;
  comprobanteUrl?: string; // Nombre del archivo simulado
}

// NUEVO: COTIZACIONES
export interface CotizacionItem {
  id: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number; // calculo automatico
}

// Support for Regularization Quote Data
export interface ItemDeclaracionCero {
  id: string;
  texto: string; // "Debes año 2023"
  monto: number; // 950
}

export interface Cotizacion {
  id: string;
  folio: string; // COT-001
  fecha: string;
  
  // Generic Items (Standard Quote)
  items: CotizacionItem[];
  
  // Regularization Specific Data
  tipo: 'ESTANDAR' | 'REGULARIZACION';
  datosRegularizacion?: {
    mesesAdeudo: number;
    ingresosPromedio: number;
    costoHonorariosMensual: number;
    // Removed fixed costoDeclaracionCeros, replaced by dynamic list
    itemsCeros: ItemDeclaracionCero[];
  };

  subtotal: number;
  iva: number;
  total: number;
  estado: 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA';
  pdfUrl?: string; // Simulado
}

// NUEVO: TICKETS (Gestión de Gastos)
export type TicketStatus = 'PENDING' | 'INVOICED' | 'REJECTED';

export interface Ticket {
  id: string;
  clienteId: string;
  fechaCarga: string;
  imageUrl: string;
  status: TicketStatus;
  
  // AI Extracted Data (Simulated)
  categoria: 'GASTO' | 'VENTA';
  subcategoria?: string; // Gasolina, Mantenimiento, Papelería
  montoTotal?: number;
  fechaTicket?: string;
  rfcEmisor?: string;
  
  // Accountant feedback
  notasContador?: string;
}

// Alias for backward compatibility if needed, but using shared interface is cleaner
export type PagoProspecto = PagoRegistroItem;
export type PagoCliente = PagoRegistroItem;

// MODELO DE BASE DE DATOS (Representación en TypeScript)

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  activo: boolean;
}

export interface Auxiliar {
  id: string;
  nombre: string;
  usuario: string; // Login handle
  contrasena?: string; // Only for creating, usually hashed
  rol: RolAuxiliar;
  fechaRegistro: string;
}

export interface Nota {
  id: string;
  autor: string;
  fecha: string;
  texto: string;
}

export interface ConfiguracionFiscal {
  modalidad: 'PAGO_PROVISIONAL' | 'PAGO_DEFINITIVO';
  saldoAFavorAnterior: number;
}

export interface AcumuladoAnual {
  ingresosAcumulados: number;
  gastosAcumulados: number;
  isrPagado: number;
}

export interface Cliente {
  id: string;
  nombre: string;
  rfc: string;
  regimen: RegimenFiscal;
  email: string;
  telefono: string;
  etapa: EtapaContable;
  responsableId: string; // ID del auxiliar
  tieneMensajesNoLeidos: boolean; // Para el filtro de MENSAJES
  ultimaNota?: string;
  contrasenaSat?: string; // Dato sensible
  claveCiec?: string; // Dato sensible
  
  // SAT Certificate Status (Simulation)
  satCertificados?: SatCertificates;

  modulosActivos: string[]; // IDs de módulos

  // NUEVO: Historial de Pagos (Honorarios)
  historialPagos: PagoCliente[];

  // NUEVO: Config Fiscal
  configuracionFiscal?: ConfiguracionFiscal;
  acumuladoAnual?: AcumuladoAnual;

  // NUEVO: Tickets
  tickets?: Ticket[];
  
  // NUEVO: Activos Fijos
  activosFijos?: FixedAsset[];
}

export interface Prospecto {
  id: string;
  nombre: string;
  telefono: string;
  rfc?: string;
  etapa: EtapaEmbudo;
  tieneMensajesNoLeidos: boolean;
  notas: Nota[];
  fechaUltimoContacto: string;
  
  // New Status Flags (Orthogonal to Funnel Stage)
  esPosiblePago?: boolean;
  tienePendiente?: boolean;

  // AI Agent Status (Per Prospect)
  aiAgentEnabled: boolean;

  // New: Ability to store Certs before becoming a client
  satCertificados?: SatCertificates;

  // NUEVO: Historial de Pagos (Anticipos)
  historialPagos: PagoProspecto[];

  // NUEVO: Historial de Cotizaciones
  cotizaciones: Cotizacion[];
}

export interface ModuloServicio {
  id: string;
  nombre: string;
  descripcion: string;
  costoBase: number;
}

// NUEVO: POS
export interface POSProduct {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  color?: string;
  icono?: IconName;
}

export interface POSSaleItem {
  product: POSProduct;
  quantity: number;
}
