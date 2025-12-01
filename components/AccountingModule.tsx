
import React, { useState, useEffect } from 'react';
import { Icon, IconName } from './Icon';
import { AccountingInvoice, RegimenFiscal, FixedAsset, TipoActivo } from '../types';
import { TaxReportTemplate } from './TaxReportTemplate'; 
import { AnnualProjectionTemplate } from './AnnualProjectionTemplate';

// VERSION_6_ADVANCED_ASSETS - FORCED UPDATE

// --- UTILIDADES FISCALES ---
const getTasaResico = (ingreso: number): number => {
  if (ingreso <= 25000) return 0.01;
  if (ingreso <= 50000) return 0.011;
  if (ingreso <= 83333.33) return 0.015;
  if (ingreso <= 208333.33) return 0.02;
  return 0.025; 
};

const TARIFA_ANUAL_2024 = [
   { limInf: 0.01,       cuota: 0.00,       porc: 0.0192 },
   { limInf: 8952.50,    cuota: 171.88,     porc: 0.0640 },
   { limInf: 75984.56,   cuota: 4461.94,    porc: 0.1088 },
   { limInf: 133536.08,  cuota: 10723.55,   porc: 0.1600 },
   { limInf: 155229.81,  cuota: 14194.54,   porc: 0.1792 },
   { limInf: 185852.58,  cuota: 19682.13,   porc: 0.2136 },
   { limInf: 374837.89,  cuota: 60049.40,   porc: 0.2352 },
   { limInf: 590796.00,  cuota: 110842.74,  porc: 0.3000 },
   { limInf: 1127926.85, cuota: 271981.99,  porc: 0.3200 },
   { limInf: 3502345.55, cuota: 1031795.97, porc: 0.3400 },
   { limInf: 10507036.68, cuota: 3413390.95, porc: 0.3500 },
];

const calcularIsrAnual = (base: number) => {
   if (base <= 0) return { isr: 0, row: null, excedente: 0 };
   let row = TARIFA_ANUAL_2024[0];
   for (let i = 0; i < TARIFA_ANUAL_2024.length; i++) {
      if (base >= TARIFA_ANUAL_2024[i].limInf) { row = TARIFA_ANUAL_2024[i]; } else { break; }
   }
   const excedente = base - row.limInf;
   const impuestoMarginal = excedente * row.porc;
   const isr = impuestoMarginal + row.cuota;
   return { isr, row, excedente };
};

// --- COMPONENTS ---
const SummaryCard = ({ title, amount, color, icon, onClick, isActive }: any) => (
    <button 
      onClick={onClick}
      disabled={!onClick}
      className={`
        w-full p-6 rounded-3xl text-left transition-all active:scale-95 shadow-md border-2 relative overflow-hidden
        ${isActive ? 'ring-4 ring-offset-2 ring-indigo-500' : ''}
        ${color === 'green' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
        ${color === 'red' ? 'bg-rose-50 border-rose-200 text-rose-800' : ''}
        ${color === 'purple' ? 'bg-purple-50 border-purple-200 text-purple-800' : ''}
        ${color === 'gray' ? 'bg-slate-50 border-slate-200 text-slate-800' : ''}
        ${color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
        ${color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2 relative z-10">
        <span className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-80">{title}</span>
        <Icon name={icon} size={28} />
      </div>
      <div className="text-2xl md:text-3xl font-black tracking-tight relative z-10">
        ${amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-10 transform rotate-12 scale-150">
         <Icon name={icon} size={100} />
      </div>
    </button>
);

const InvoiceRow = ({ invoice, onToggleDeducible }: any) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl ${invoice.tipo === 'INGRESO' ? 'bg-emerald-100 text-emerald-600' : invoice.tipo === 'GASTO' ? 'bg-rose-100 text-rose-600' : 'bg-purple-100 text-purple-600'}`}>
          <Icon name={invoice.tipo === 'INGRESO' ? 'dollar' : invoice.tipo === 'GASTO' ? 'shopping-bag' : 'shield'} size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white text-lg">{invoice.nombre}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{invoice.concepto}</p>
          <p className="text-xs text-slate-400 mt-1 uppercase font-bold">{invoice.fecha} • {invoice.rfc}</p>
        </div>
      </div>
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
        <span className="text-2xl font-black text-slate-800 dark:text-white">${invoice.monto.toLocaleString('es-MX')}</span>
        {invoice.tipo === 'GASTO' && (
          <button onClick={() => onToggleDeducible(invoice.id)} className={`mt-1 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${invoice.esDeducible ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
            {invoice.esDeducible ? '✅ SÍ Deducible' : '🚫 NO Deducible'}
          </button>
        )}
      </div>
    </div>
);

interface AccountingModuleProps {
  onSendReport?: (fileUrl: string, message: string) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ onSendReport }) => {
  // CONFIG
  const [selectedRegimen, setSelectedRegimen] = useState<RegimenFiscal | 'UNSET'>('UNSET');
  const [selectedModalidad, setSelectedModalidad] = useState<'DEFINITIVO' | 'PROVISIONAL' | null>(null);
  const [selectedMes, setSelectedMes] = useState<string>('10');
  const [selectedAnio, setSelectedAnio] = useState<string>('2025');
  
  // VIEW
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'INGRESOS' | 'GASTOS' | 'RETENCIONES' | 'IMPUESTOS' | 'ANUAL' | 'ACTIVOS' | 'CONCILIACION'>('DASHBOARD');
  const [gastosTab, setGastosTab] = useState<'DEDUCIBLE' | 'NO_DEDUCIBLE'>('DEDUCIBLE');

  // MODALS
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false); 
  const [isAnnualReportOpen, setIsAnnualReportOpen] = useState(false);

  // ASSET FORM STATE - UPDATED WITH ADVANCED FIELDS
  const [assetForm, setAssetForm] = useState({
     tipo: 'OTRO' as TipoActivo,
     nombre: '',
     monto: '',
     fecha: new Date().toISOString().split('T')[0],
     tasa: '10',
     noSerie: '', // NEW
     responsable: '', // NEW
     proveedor: '' // NEW
  });

  // DATA
  const [saldoAFavorAnterior, setSaldoAFavorAnterior] = useState<number>(1500);
  const [saldoAplicado, setSaldoAplicado] = useState<number>(0);
  const [deduccionesPersonales, setDeduccionesPersonales] = useState<number>(5000);
  
  const [activos, setActivos] = useState<FixedAsset[]>([
     { id: 'a1', nombre: 'Nissan Versa 2023', tipo: 'AUTO', montoOriginal: 280000, fechaAdquisicion: '2023-05-15', tasaAnual: 0.25, depreciacionAcumulada: 35000, responsable: 'Juan Pérez', proveedor: 'Nissan Geisha' },
     { id: 'a2', nombre: 'MacBook Pro', tipo: 'COMPUTO', montoOriginal: 45000, fechaAdquisicion: '2023-08-10', tasaAnual: 0.30, depreciacionAcumulada: 3375, noSerie: 'C02D...', proveedor: 'iShop' }
  ]);

  const [invoices, setInvoices] = useState<AccountingInvoice[]>([
    { id: '1', fecha: '01/10/2025', rfc: 'UBER123456', nombre: 'UBER BV', concepto: 'Ingresos por servicios de transporte', monto: 15000.00, tipo: 'INGRESO', esDeducible: true, cobrada: true },
    { id: '2', fecha: '02/10/2025', rfc: 'GAS999999', nombre: 'GASOLINERA PEMEX', concepto: 'Combustible Magna', monto: 3500.00, tipo: 'GASTO', esDeducible: true, categoria: 'Combustible' },
    { id: '3', fecha: '03/10/2025', rfc: 'OXXO888888', nombre: 'CADENA COMERCIAL OXXO', concepto: 'Refresco y Papas', monto: 450.00, tipo: 'GASTO', esDeducible: false, categoria: 'Otros' },
    { id: '4', fecha: '05/10/2025', rfc: 'UBER123456', nombre: 'UBER BV', concepto: 'Retención ISR', monto: 315.00, tipo: 'RETENCION', esDeducible: true },
    { id: '5', fecha: '06/10/2025', rfc: 'UBER123456', nombre: 'UBER BV', concepto: 'Retención IVA', monto: 1200.00, tipo: 'RETENCION', esDeducible: true },
    { id: '6', fecha: '10/10/2025', rfc: 'REFACC999', nombre: 'REFACCIONARIA', concepto: 'Aceite Motor', monto: 800.00, tipo: 'GASTO', esDeducible: true, categoria: 'Mantenimiento' },
    { id: '7', fecha: '15/10/2025', rfc: 'CLIENTE_CREDITO', nombre: 'Cliente Crédito SA', concepto: 'Servicio Especial', monto: 5000.00, tipo: 'INGRESO', esDeducible: true, cobrada: false },
  ]);

  // --- ACTIONS ---
  const toggleDeducible = (id: string) => setInvoices(invoices.map(inv => inv.id === id ? { ...inv, esDeducible: !inv.esDeducible } : inv));
  const toggleCobrada = (id: string) => setInvoices(invoices.map(inv => inv.id === id ? { ...inv, cobrada: !inv.cobrada } : inv));
  
  const resetConfig = () => {
    setSelectedRegimen('UNSET');
    setSelectedModalidad(null);
    setViewMode('DASHBOARD');
  };

  const handleOpenAssetModal = () => {
      setAssetForm({ tipo: 'OTRO', nombre: '', monto: '', fecha: new Date().toISOString().split('T')[0], tasa: '10', noSerie: '', responsable: '', proveedor: '' });
      setIsAssetModalOpen(true);
  };

  const handlePresetSelect = (type: TipoActivo) => {
     let defaults = { nombre: '', tasa: '10' };
     if (type === 'AUTO') defaults = { nombre: 'Automóvil Utilitario', tasa: '25' };
     if (type === 'COMPUTO') defaults = { nombre: 'Equipo de Cómputo', tasa: '30' };
     if (type === 'CELULAR') defaults = { nombre: 'Celular Gama Media', tasa: '30' };
     if (type === 'MOBILIARIO') defaults = { nombre: 'Mobiliario de Oficina', tasa: '10' };

     setAssetForm({ ...assetForm, tipo: type, nombre: defaults.nombre, tasa: defaults.tasa });
  };

  const handleSaveAsset = () => {
     if (!assetForm.nombre || !assetForm.monto) return;
     
     const newAsset: FixedAsset = {
        id: Date.now().toString(),
        nombre: assetForm.nombre,
        tipo: assetForm.tipo,
        montoOriginal: parseFloat(assetForm.monto),
        fechaAdquisicion: assetForm.fecha,
        tasaAnual: parseFloat(assetForm.tasa) / 100,
        depreciacionAcumulada: 0,
        noSerie: assetForm.noSerie,
        responsable: assetForm.responsable,
        proveedor: assetForm.proveedor
     };
     setActivos([...activos, newAsset]);
     setIsAssetModalOpen(false);
  };

  // --- CALCULATIONS ---
  const totalIngresos = invoices.filter(i => i.tipo === 'INGRESO').reduce((acc, curr) => acc + curr.monto, 0);
  const totalIngresosCobrados = invoices.filter(i => i.tipo === 'INGRESO' && i.cobrada !== false).reduce((acc, curr) => acc + curr.monto, 0);
  const totalGastosDeducibles = invoices.filter(i => i.tipo === 'GASTO' && i.esDeducible).reduce((acc, curr) => acc + curr.monto, 0);
  const totalGastosNoDeducibles = invoices.filter(i => i.tipo === 'GASTO' && !i.esDeducible).reduce((acc, curr) => acc + curr.monto, 0);
  const totalRetenciones = invoices.filter(i => i.tipo === 'RETENCION').reduce((acc, curr) => acc + curr.monto, 0);

  const depreciacionMensualTotal = activos.reduce((acc, asset) => acc + (asset.montoOriginal * asset.tasaAnual) / 12, 0);

  // ANUAL
  const baseIngresosAnual = 250000 + totalIngresosCobrados; 
  const gastosAcumulados = 120000 + totalGastosDeducibles + (depreciacionMensualTotal * 10);
  const isrPagadoProvisional = 3500;
  const retencionesAcumuladas = 4500 + totalRetenciones;

  let calculoAnual: any = {};
  // Always calc annual for demo visualization
  const baseAnual = Math.max(0, baseIngresosAnual - gastosAcumulados - deduccionesPersonales);
  const { isr, row, excedente } = calcularIsrAnual(baseAnual);
  const totalPagosAnticipados = isrPagadoProvisional + retencionesAcumuladas;
  const saldoAnualEstimado = isr - totalPagosAnticipados;
  calculoAnual = { ingresosAcumulados: baseIngresosAnual, gastosAcumulados, deduccionesPersonales, baseAnual, impuestoAnualCausado: isr, totalPagosAnticipados, saldoAnualEstimado, detalleTabla: { row, excedente } };


  // MENSUAL
  let calculoDetalle: any = {};
  let impuestoCargoPreliminar = 0;

  if (selectedRegimen === RegimenFiscal.RESICO) {
    const tasaIsr = getTasaResico(totalIngresosCobrados);
    const isrCausado = totalIngresosCobrados * tasaIsr;
    const retencionesIsrResico = totalRetenciones * 0.5; 
    const isrPagar = Math.max(0, isrCausado - retencionesIsrResico);
    const ivaTrasladado = totalIngresosCobrados * 0.16;
    const ivaAcreditable = totalGastosDeducibles * 0.16; 
    const retencionesIvaResico = totalRetenciones * 0.5;
    const ivaCargo = Math.max(0, ivaTrasladado - ivaAcreditable - retencionesIvaResico);
    impuestoCargoPreliminar = isrPagar + ivaCargo;
    calculoDetalle = { baseIsr: totalIngresosCobrados, tasaIsr, isrCausado, retencionIsr: retencionesIsrResico, isrPagar, ivaTrasladado, ivaAcreditable, retencionIva: retencionesIvaResico, ivaCargo, totalPrevio: impuestoCargoPreliminar, esResico: true };
  } else if (selectedRegimen === RegimenFiscal.PLATAFORMAS) {
    const baseCalculo = totalIngresosCobrados;
    const tasaIsrPlat = 0.021; 
    let isrCausado = 0;
    let baseGravable = 0;
    if (selectedModalidad === 'PROVISIONAL') {
       baseGravable = Math.max(0, baseCalculo - totalGastosDeducibles - depreciacionMensualTotal);
       const tasaProvisional = 0.10; 
       isrCausado = baseGravable * tasaProvisional;
    } else {
       isrCausado = baseCalculo * tasaIsrPlat;
    }
    const retencionIsrEstimada = baseCalculo * 0.021; 
    const isrPagar = Math.max(0, isrCausado - retencionIsrEstimada);
    const ivaTotalTeorico = baseCalculo * 0.16;
    const retencionIvaEstimada = baseCalculo * 0.08;
    const ivaAcreditable = totalGastosDeducibles * 0.16; 
    const ivaPagar = Math.max(0, ivaTotalTeorico - retencionIvaEstimada - ivaAcreditable);
    impuestoCargoPreliminar = isrPagar + ivaPagar;
    calculoDetalle = { baseIsr: selectedModalidad === 'PROVISIONAL' ? baseGravable : baseCalculo, isrCausado, retencionIsr: retencionIsrEstimada, isrPagar, ivaTotalTeorico, retencionIva: retencionIvaEstimada, ivaAcreditable, ivaPagar, totalPrevio: impuestoCargoPreliminar, esPlataforma: true, depreciacionMensual: selectedModalidad === 'PROVISIONAL' ? depreciacionMensualTotal : 0 };
  }

  const totalPagarFinal = Math.max(0, impuestoCargoPreliminar - saldoAplicado);
  const saldoRemanente = Math.max(0, saldoAFavorAnterior - saldoAplicado);

  useEffect(() => {
    if (impuestoCargoPreliminar > 0 && saldoAFavorAnterior > 0 && saldoAplicado === 0) {
       setSaldoAplicado(Math.min(impuestoCargoPreliminar, saldoAFavorAnterior));
    }
  }, [impuestoCargoPreliminar]);

  const handleSaldoChange = (val: number) => { if (val <= saldoAFavorAnterior) setSaldoAplicado(val); };
  
  const handleSendReport = () => {
     if (onSendReport) {
        alert(`✅ REPORTE GENERADO\n\nSaldos Actualizados:\nSaldo Anterior: $${saldoAFavorAnterior.toLocaleString()}\n(-) Aplicado: $${saldoAplicado.toLocaleString()}\n(=) NUEVO SALDO DISPONIBLE: $${saldoRemanente.toLocaleString()}\n\nEste nuevo saldo se guardará en el expediente.`);
        onSendReport('Reporte_Fiscal_Octubre.pdf', `Hola, te comparto el desglose de tus impuestos de este mes. Revísalo y avísame cualquier duda.`);
        setIsReportPreviewOpen(false);
     }
  };

  const handleSendAnnualReport = () => {
     if (onSendReport) {
        onSendReport('Proyeccion_Anual_2025.pdf', `Hola, te envío tu proyección para la declaración anual. Vamos por buen camino.`);
        setIsAnnualReportOpen(false);
     }
  };

  // --- RENDER WIZARD ---
  if (selectedRegimen === 'UNSET') {
     return (
        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white">Configuración Fiscal</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <button onClick={() => setSelectedRegimen(RegimenFiscal.PLATAFORMAS)} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-indigo-500">
                 <Icon name="briefcase" size={40} className="mx-auto mb-4 text-indigo-500"/>
                 <h3 className="text-2xl font-bold dark:text-white">Plataformas Tecnológicas</h3>
              </button>
              <button onClick={() => setSelectedRegimen(RegimenFiscal.RESICO)} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl hover:scale-105 transition-all text-center border-2 border-transparent hover:border-emerald-500">
                 <Icon name="chart" size={40} className="mx-auto mb-4 text-emerald-500"/>
                 <h3 className="text-2xl font-bold dark:text-white">RESICO</h3>
              </button>
           </div>
        </div>
     );
  }

  if (selectedRegimen === RegimenFiscal.PLATAFORMAS && !selectedModalidad) {
     return (
        <div className="flex flex-col items-center justify-center py-10 space-y-8 animate-in fade-in">
           <h2 className="text-3xl font-black text-slate-800 dark:text-white">Modalidad de Pago</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
              <button onClick={() => setSelectedModalidad('DEFINITIVO')} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center border-2 border-transparent hover:border-blue-500">
                 <h3 className="text-2xl font-bold dark:text-white">Pago Definitivo</h3>
                 <p className="text-sm text-slate-500">Tasa fija, sin deducciones ISR.</p>
              </button>
              <button onClick={() => setSelectedModalidad('PROVISIONAL')} className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl text-center border-2 border-transparent hover:border-indigo-500">
                 <h3 className="text-2xl font-bold dark:text-white">Pago Provisional</h3>
                 <p className="text-sm text-slate-500">Con deducciones mensuales.</p>
              </button>
           </div>
        </div>
     );
  }

  // --- RENDER MAIN ---
  return (
    <div className="space-y-8 animate-in fade-in">
      {/* HEADER */}
      <div className="bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-2 px-2">
            <button onClick={resetConfig} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:scale-105"><Icon name="edit" size={16}/></button>
            <div className="flex flex-col"><span className="text-[10px] font-bold uppercase text-slate-400">Régimen</span><span className="font-bold text-sm dark:text-white">{selectedRegimen}</span></div>
         </div>
         <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm overflow-x-auto">
             <button onClick={() => setViewMode('DASHBOARD')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${viewMode === 'DASHBOARD' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'}`}>Mensual</button>
             {selectedRegimen === RegimenFiscal.RESICO && <button onClick={() => setViewMode('CONCILIACION')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${viewMode === 'CONCILIACION' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}>Conciliación</button>}
             <button onClick={() => setViewMode('ACTIVOS')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${viewMode === 'ACTIVOS' ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>Inversiones</button>
             <button onClick={() => setViewMode('ANUAL')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${viewMode === 'ANUAL' ? 'bg-amber-100 text-amber-700' : 'text-slate-500'}`}>Anual</button>
         </div>
      </div>

      {viewMode === 'DASHBOARD' && (
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryCard title="Ingresos" amount={selectedRegimen === RegimenFiscal.RESICO ? totalIngresosCobrados : totalIngresos} color="green" icon="dollar" onClick={() => setViewMode('INGRESOS')} />
            <SummaryCard title="Gastos" amount={totalGastosDeducibles} color="red" icon="shopping-bag" onClick={() => setViewMode('GASTOS')} />
            <SummaryCard title="Retenciones" amount={totalRetenciones} color="purple" icon="shield" onClick={() => setViewMode('RETENCIONES')} />
            <div className="sm:col-span-2 lg:col-span-2 bg-slate-900 dark:bg-black text-white rounded-[2rem] p-6 shadow-xl flex flex-col justify-between">
               <div className="flex justify-between items-start">
                  <div><p className="text-slate-400 font-bold text-xs uppercase">Total a Pagar</p><h3 className="text-4xl font-black">${totalPagarFinal.toLocaleString('es-MX')}</h3></div>
                  <button onClick={() => setViewMode('IMPUESTOS')} className="bg-white/20 p-3 rounded-xl"><Icon name="chevron-right" size={24}/></button>
               </div>
               <button onClick={() => setIsReportPreviewOpen(true)} className="mt-6 bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 w-fit"><Icon name="check" size={18}/> TERMINAR</button>
            </div>
         </div>
      )}

      {/* VISTA ACTIVOS (INVERSIONES) - NUEVA VERSION AMIGABLE */}
      {viewMode === 'ACTIVOS' && (
         <div className="animate-in slide-in-from-right space-y-6">
            <div className="bg-blue-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-1">Tus Inversiones</h3>
                  <p className="text-blue-100 text-sm font-medium mb-6">Registra tus compras grandes (Coche, Compu) para deducirlas mes a mes.</p>
                  <div className="flex gap-4">
                     <div className="bg-white/20 p-4 rounded-2xl flex-1"><p className="text-xs uppercase font-bold text-blue-200">Deducción Mensual</p><p className="text-3xl font-black">${depreciacionMensualTotal.toLocaleString()}</p></div>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center">
               <h3 className="font-bold text-slate-800 dark:text-white text-lg">Activos Registrados</h3>
               <button onClick={handleOpenAssetModal} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all transform hover:scale-105">
                  <Icon name="add-user" size={20}/> AGREGAR NUEVA INVERSIÓN
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {activos.map(asset => (
                  <div key={asset.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><Icon name={asset.tipo === 'AUTO' ? 'car' : asset.tipo === 'COMPUTO' ? 'laptop' : 'smartphone'} size={24} /></div>
                           <div><h4 className="font-bold text-slate-800 dark:text-white">{asset.nombre}</h4><p className="text-xs text-slate-500">{asset.fechaAdquisicion}</p></div>
                        </div>
                        <p className="font-black text-slate-800 dark:text-white">${asset.montoOriginal.toLocaleString()}</p>
                     </div>
                     <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: '20%' }}></div></div>
                     <p className="text-xs text-slate-400 mt-2 text-right">Deduciendo ${(asset.montoOriginal * asset.tasaAnual / 12).toLocaleString('es-MX')}/mes</p>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* MODAL AGREGAR ACTIVO (FORMULARIO EDITABLE AVANZADO) */}
      {isAssetModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAssetModalOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registrar Inversión</h3>
                  <button onClick={() => setIsAssetModalOpen(false)}><Icon name="close" size={24} className="text-slate-400 hover:text-slate-600"/></button>
               </div>
               
               <label className="block text-xs font-bold text-slate-400 uppercase mb-3 text-center">1. Selecciona Tipo (Plantilla)</label>
               <div className="grid grid-cols-4 gap-2 mb-6">
                   <button onClick={() => handlePresetSelect('AUTO')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${assetForm.tipo === 'AUTO' ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      <Icon name="car" size={24}/> <span className="text-[10px] font-bold">Auto</span>
                   </button>
                   <button onClick={() => handlePresetSelect('COMPUTO')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${assetForm.tipo === 'COMPUTO' ? 'border-purple-500 bg-purple-50 text-purple-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      <Icon name="laptop" size={24}/> <span className="text-[10px] font-bold">PC</span>
                   </button>
                   <button onClick={() => handlePresetSelect('CELULAR')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${assetForm.tipo === 'CELULAR' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      <Icon name="smartphone" size={24}/> <span className="text-[10px] font-bold">Celular</span>
                   </button>
                   <button onClick={() => handlePresetSelect('MOBILIARIO')} className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 ${assetForm.tipo === 'MOBILIARIO' ? 'border-amber-500 bg-amber-50 text-amber-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                      <Icon name="briefcase" size={24}/> <span className="text-[10px] font-bold">Mueble</span>
                   </button>
               </div>

               <div className="space-y-6">
                  {/* Fiscal Data */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                     <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Datos Fiscales</h5>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre del Activo</label>
                        <input type="text" value={assetForm.nombre} onChange={e => setAssetForm({...assetForm, nombre: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none font-bold text-sm dark:text-white" placeholder="Ej. Nissan Versa" />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monto Original</label>
                           <input type="number" value={assetForm.monto} onChange={e => setAssetForm({...assetForm, monto: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none font-bold text-sm dark:text-white" placeholder="0.00" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tasa Anual %</label>
                           <input type="number" value={assetForm.tasa} onChange={e => setAssetForm({...assetForm, tasa: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none font-bold text-sm dark:text-white" placeholder="%" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha de Compra</label>
                        <input type="date" value={assetForm.fecha} onChange={e => setAssetForm({...assetForm, fecha: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none font-bold text-sm dark:text-white" />
                     </div>
                  </div>

                  {/* Administrative Data */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                     <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Control Administrativo (Opcional)</h5>
                     <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">No. Serie / ID</label>
                        <input type="text" value={assetForm.noSerie} onChange={e => setAssetForm({...assetForm, noSerie: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none text-sm dark:text-white" placeholder="S/N 12345..." />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Asignado A</label>
                           <input type="text" value={assetForm.responsable} onChange={e => setAssetForm({...assetForm, responsable: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none text-sm dark:text-white" placeholder="Nombre Empleado" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Proveedor</label>
                           <input type="text" value={assetForm.proveedor} onChange={e => setAssetForm({...assetForm, proveedor: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg outline-none text-sm dark:text-white" placeholder="Tienda" />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button onClick={handleSaveAsset} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                     <Icon name="check" size={20}/> GUARDAR INVERSIÓN
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* ... (Otras Vistas: CONCILIACION se mantienen igual) ... */}
      
      {/* VISTA DETALLADA DE IMPUESTOS (DESGLOSE TIPO RECIBO) */}
      {viewMode === 'IMPUESTOS' && (
         <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right">
            <button onClick={() => setViewMode('DASHBOARD')} className="mb-6 flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800"><Icon name="chevron-right" className="rotate-180" size={20}/> Volver</button>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Desglose Fiscal Detallado</h2>
            
            <div className="space-y-8">
               {/* BLOQUE ISR */}
               <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-sm">
                  <h4 className="font-bold text-blue-600 uppercase mb-4 border-b border-blue-200 pb-2">ISR (Impuesto Sobre la Renta)</h4>
                  
                  {calculoDetalle.esResico ? (
                     // RESICO LOGIC
                     <>
                        <div className="flex justify-between mb-1"><span>(+) Ingresos Cobrados</span> <span className="font-bold">${calculoDetalle.baseIsr?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-slate-500 mb-2"><span>(x) Tasa Resico</span> <span className="font-bold">{(calculoDetalle.tasaIsr * 100).toFixed(2)}%</span></div>
                        <div className="flex justify-between bg-white dark:bg-slate-800 p-2 rounded mb-2"><span>(=) ISR Causado</span> <span className="font-bold">${calculoDetalle.isrCausado?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-rose-500 mb-2"><span>(-) Retención ISR</span> <span>-${calculoDetalle.retencionIsr?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-lg font-black text-blue-700 border-t border-slate-300 pt-2"><span>(=) ISR A Cargo</span> <span>${calculoDetalle.isrPagar?.toLocaleString()}</span></div>
                     </>
                  ) : (
                     // PLATAFORMAS LOGIC
                     <>
                        <div className="flex justify-between mb-1"><span>(+) Ingresos Totales</span> <span className="font-bold">${totalIngresos.toLocaleString()}</span></div>
                        {selectedModalidad === 'PROVISIONAL' && (
                           <>
                              <div className="flex justify-between text-emerald-600 mb-1"><span>(-) Gastos Deducibles</span> <span>-${totalGastosDeducibles.toLocaleString()}</span></div>
                              {calculoDetalle.depreciacionMensual > 0 && (
                                 <div className="flex justify-between text-blue-500 mb-1"><span>(-) Deducción Inversiones</span> <span>-${calculoDetalle.depreciacionMensual.toLocaleString()}</span></div>
                              )}
                              <div className="flex justify-between font-bold border-t border-dashed border-slate-300 pt-1 mb-1"><span>(=) Base Gravable (Utilidad)</span> <span>${calculoDetalle.baseIsr?.toLocaleString()}</span></div>
                              <div className="flex justify-between text-slate-500 mb-1"><span>(x) Tasa Provisional (Est. 10%)</span> <span></span></div>
                           </>
                        )}
                        {selectedModalidad === 'DEFINITIVO' && (
                           <div className="flex justify-between text-slate-500 mb-1"><span>(x) Tasa Fija (2.1%)</span> <span></span></div>
                        )}
                        
                        <div className="flex justify-between bg-white dark:bg-slate-800 p-2 rounded mb-2"><span>(=) ISR Causado</span> <span className="font-bold">${calculoDetalle.isrCausado?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-rose-500 mb-2"><span>(-) Retenciones App</span> <span>-${calculoDetalle.retencionIsr?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-lg font-black text-blue-700 border-t border-slate-300 pt-2"><span>(=) ISR A Cargo</span> <span>${calculoDetalle.isrPagar?.toLocaleString()}</span></div>
                     </>
                  )}
               </div>

               {/* BLOQUE IVA */}
               <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-sm">
                  <h4 className="font-bold text-indigo-600 uppercase mb-4 border-b border-indigo-200 pb-2">IVA (Valor Agregado)</h4>
                  <div className="flex justify-between mb-1"><span>(+) IVA Cobrado (16%)</span> <span className="font-bold">${calculoDetalle.ivaTotalTeorico?.toLocaleString() || calculoDetalle.ivaTrasladado?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-emerald-600 mb-1"><span>(-) IVA Gastos (Acreditable)</span> <span>-${calculoDetalle.ivaAcreditable?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-rose-500 mb-2"><span>(-) Retención IVA</span> <span>-${calculoDetalle.retencionIva?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-lg font-black text-indigo-700 border-t border-slate-300 pt-2"><span>(=) IVA A Cargo</span> <span>${calculoDetalle.ivaPagar?.toLocaleString() || calculoDetalle.ivaCargo?.toLocaleString()}</span></div>
               </div>
            </div>
            
            {/* SALDOS */}
            <div className="mt-8 bg-amber-50 p-6 rounded-2xl border border-amber-200">
               <h4 className="font-bold text-amber-900 mb-4">Compensación de Saldos</h4>
               <div className="flex items-center gap-4">
                  <input type="range" min="0" max={Math.min(saldoAFavorAnterior, impuestoCargoPreliminar)} value={saldoAplicado} onChange={(e) => handleSaldoChange(Number(e.target.value))} className="flex-1 accent-amber-500"/>
                  <span className="font-bold text-amber-800">${saldoAplicado}</span>
               </div>
               {/* Persistence feedback */}
               <div className="flex justify-between mt-2 text-xs font-bold text-amber-700">
                   <span>Anterior: ${saldoAFavorAnterior.toLocaleString()}</span>
                   <span>Nuevo Remanente: ${saldoRemanente.toLocaleString()}</span>
               </div>
            </div>

            <div className="mt-8 text-right">
               <p className="text-sm font-bold text-slate-400 uppercase">Neto a Pagar</p>
               <p className="text-4xl font-black text-slate-900 dark:text-white">${totalPagarFinal.toLocaleString()}</p>
               <button onClick={() => setIsReportPreviewOpen(true)} className="mt-4 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg">GENERAR REPORTE</button>
            </div>
         </div>
      )}

      {/* --- VISTA ANUAL (MEJORADA) --- */}
      {viewMode === 'ANUAL' && (
         <div className="animate-in slide-in-from-right space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">Proyección Anual 2025</h3>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 uppercase">Estimación</span>
            </div>
            
            {/* STORYTELLING - GRÁFICO DE TERMÓMETRO */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 mb-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/20 rounded-full blur-3xl -mr-8 -mt-8"></div>
               <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-2">Tu Situación Actual</h4>
               <p className="text-sm text-slate-500 mb-6 max-w-2xl">
                  Hasta hoy, has acumulado <strong>${calculoAnual.ingresosAcumulados?.toLocaleString()}</strong> en ingresos. 
                  Gracias a tus deducciones personales (${deduccionesPersonales.toLocaleString()}), tu base gravable es menor.
               </p>
               
               {/* Thermometer Bar */}
               <div className="relative h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                  <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-500 w-full opacity-30"></div>
                  {/* Indicator */}
                  <div 
                     className="absolute top-0 bottom-0 w-1 bg-black dark:bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10 transition-all duration-1000"
                     style={{ left: `${Math.min(100, (calculoAnual.baseAnual / 1000000) * 100)}%` }} // Mock scale
                  ></div>
               </div>
               <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Nivel Bajo</span>
                  <span>Nivel Medio</span>
                  <span>Nivel Alto</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Base */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4"><div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg font-bold">1</div><h4 className="font-bold text-sm uppercase">Tu Utilidad Real</h4></div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Ingresos</span><span className="font-bold">${calculoAnual.ingresosAcumulados?.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Gastos</span><span className="font-bold text-emerald-600">-${calculoAnual.gastosAcumulados?.toLocaleString()}</span></div>
                        <div className="pt-2 border-t font-black flex justify-between"><span>Base</span><span>${calculoAnual.baseAnual?.toLocaleString()}</span></div>
                    </div>
                </div>
                {/* 2. Cálculo */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4"><div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg font-bold">2</div><h4 className="font-bold text-sm uppercase">Cálculo SAT</h4></div>
                    {calculoAnual.detalleTabla && (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-xs text-slate-500"><span>Límite Inf</span><span>${calculoAnual.detalleTabla.row.limInf.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-indigo-600"><span>Tasa</span><span>{(calculoAnual.detalleTabla.row.porc * 100).toFixed(2)}%</span></div>
                            <div className="pt-2 border-t font-black flex justify-between"><span>ISR Anual</span><span>${calculoAnual.impuestoAnualCausado.toLocaleString()}</span></div>
                        </div>
                    )}
                </div>
                {/* 3. Liquidación */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4"><div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg font-bold">3</div><h4 className="font-bold text-sm uppercase">Liquidación</h4></div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>ISR Causado</span><span className="font-bold">${calculoAnual.impuestoAnualCausado?.toLocaleString()}</span></div>
                        <div className="flex justify-between text-emerald-600"><span>(-) Pagado</span><span className="font-bold">-${calculoAnual.totalPagosAnticipados?.toLocaleString()}</span></div>
                        <div className="pt-2 border-t font-black text-xl text-right">
                            {calculoAnual.saldoAnualEstimado > 0 ? <span className="text-slate-900 dark:text-white">A Pagar: ${calculoAnual.saldoAnualEstimado.toLocaleString()}</span> : <span className="text-emerald-500">A Favor: ${Math.abs(calculoAnual.saldoAnualEstimado).toLocaleString()}</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
               <button 
                 onClick={() => setIsAnnualReportOpen(true)}
                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
               >
                  <Icon name="file" size={20}/> Generar Reporte de Proyección
               </button>
            </div>
         </div>
      )}

      {/* --- VISTA CONCILIACIÓN (RESICO) --- */}
      {viewMode === 'CONCILIACION' && (
         <div className="animate-in slide-in-from-right space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800 flex items-start gap-4">
                <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 p-3 rounded-xl">
                   <Icon name="check" size={32}/>
                </div>
                <div>
                   <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">Conciliación de Cobranza</h3>
                   <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      En RESICO solo pagas impuestos por lo que realmente cobraste.
                   </p>
                </div>
            </div>
            {/* Lista Facturas */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft overflow-hidden">
               <div className="p-4 bg-slate-50 dark:bg-slate-700 flex justify-between font-bold text-sm text-slate-600 dark:text-slate-300">
                  <span>Factura</span>
                  <span>Estado</span>
               </div>
               {invoices.filter(i => i.tipo === 'INGRESO').map(inv => (
                  <div key={inv.id} className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                     <div>
                        <p className="font-bold dark:text-white">{inv.nombre}</p>
                        <p className="text-xs text-slate-500">${inv.monto}</p>
                     </div>
                     <button onClick={() => toggleCobrada(inv.id)} className={`px-3 py-1 rounded-full text-xs font-bold ${inv.cobrada !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                        {inv.cobrada !== false ? 'Cobrado' : 'Pendiente'}
                     </button>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* REPORT PREVIEW MODAL */}
      {isReportPreviewOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsReportPreviewOpen(false)}>
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
               <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Vista Previa</h3>
                  <button onClick={() => setIsReportPreviewOpen(false)}><Icon name="close" size={24}/></button>
               </div>
               <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
                  <TaxReportTemplate 
                     data={{
                        clienteNombre: 'Cliente Demo',
                        clienteRfc: 'XAXX010101000',
                        periodo: 'Octubre 2025',
                        regimen: selectedRegimen,
                        calculos: { ingresos: totalIngresos, gastosDeducibles: totalGastosDeducibles, gastosNoDeducibles: totalGastosNoDeducibles, retenciones: totalRetenciones, saldoAplicado: saldoAplicado, totalPagar: totalPagarFinal },
                        facturas: invoices,
                        detalle: calculoDetalle
                     }}
                  />
               </div>
               <div className="p-4 bg-white border-t flex justify-end">
                  <button onClick={handleSendReport} className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><Icon name="message" size={20} /> ENVIAR POR WHATSAPP</button>
               </div>
            </div>
         </div>
      )}

      {/* ANNUAL REPORT PREVIEW MODAL */}
      {isAnnualReportOpen && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsAnnualReportOpen(false)}>
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95">
               <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Reporte Anual</h3>
                  <button onClick={() => setIsAnnualReportOpen(false)}><Icon name="close" size={24}/></button>
               </div>
               <div className="flex-1 overflow-y-auto bg-slate-200 p-8">
                  <AnnualProjectionTemplate 
                     data={{
                        clienteNombre: 'Cliente Demo',
                        anio: selectedAnio,
                        ingresos: calculoAnual.ingresosAcumulados || 0,
                        gastos: calculoAnual.gastosAcumulados || 0,
                        deducciones: deduccionesPersonales,
                        baseGravable: calculoAnual.baseAnual || 0,
                        impuestoCausado: calculoAnual.impuestoAnualCausado || 0,
                        pagosProvisionales: calculoAnual.totalPagosAnticipados || 0,
                        saldoFinal: calculoAnual.saldoAnualEstimado || 0
                     }}
                  />
               </div>
               <div className="p-4 bg-white border-t flex justify-end">
                  <button onClick={handleSendAnnualReport} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2"><Icon name="message" size={20} /> ENVIAR PROYECCIÓN</button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
