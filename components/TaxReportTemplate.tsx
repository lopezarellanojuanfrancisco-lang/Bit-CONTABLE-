
import React from 'react';
import { Icon } from './Icon';
import { AccountingInvoice } from '../types';

interface TaxReportProps {
  data: {
    clienteNombre: string;
    clienteRfc: string;
    periodo: string;
    regimen: string;
    calculos: {
        ingresos: number;
        gastosDeducibles: number;
        gastosNoDeducibles: number;
        baseGravable?: number;
        impuestoCausado?: number;
        retenciones: number;
        saldoAplicado: number;
        totalPagar: number;
    };
    facturas: AccountingInvoice[];
    detalle?: any; // Recibimos el objeto detallado de cálculo
  };
}

export const TaxReportTemplate: React.FC<TaxReportProps> = ({ data }) => {
  const deducibles = data.facturas.filter(f => f.tipo === 'GASTO' && f.esDeducible);
  const noDeducibles = data.facturas.filter(f => f.tipo === 'GASTO' && !f.esDeducible);
  
  // Calculamos el "Ahorro Estimado" (aprox 30% de lo deducido entre ISR e IVA) para gamificar
  const ahorroEstimado = data.calculos.gastosDeducibles * 0.30; 

  const det = data.detalle || {};

  return (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen font-sans text-slate-800 relative overflow-hidden shadow-2xl">
      
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 rounded-b-[3rem] z-0"></div>
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/10 rounded-full blur-3xl z-0 animate-pulse"></div>

      <div className="relative z-10">
         
         {/* HEADER */}
         <div className="pt-10 pb-6 px-6 text-center text-white">
            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
               {data.periodo}
            </div>
            <h1 className="text-3xl font-black mb-1">Hola, {data.clienteNombre.split(' ')[0]}! 👋</h1>
            <p className="text-indigo-100 text-sm font-medium">Aquí está tu resumen fiscal del mes.</p>
         </div>

         {/* MAIN RESULT CARD (Hero) */}
         <div className="mx-6 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/30 text-center relative overflow-hidden">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total a Pagar al SAT</p>
            <div className="text-5xl font-black text-slate-900 tracking-tight mb-2">
               ${data.calculos.totalPagar.toLocaleString('es-MX', {maximumFractionDigits: 0})}
            </div>
            {data.calculos.totalPagar === 0 ? (
               <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">
                  ¡Felicidades! Todo cubierto 🎉
               </span>
            ) : (
               <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-xs font-bold">
                  Fecha límite: día 17
               </span>
            )}

            {/* Saldo aplicado Badge */}
            {data.calculos.saldoAplicado > 0 && (
               <div className="mt-4 bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center justify-center gap-2">
                  <Icon name="check" size={16} className="text-amber-500"/>
                  <p className="text-xs text-amber-800 font-bold">
                     Usamos ${data.calculos.saldoAplicado.toLocaleString()} de tu saldo a favor.
                  </p>
               </div>
            )}
         </div>

         {/* RECEIPT VIEW (DESGLOSE MATEMÁTICO) */}
         <div className="mx-6 mt-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="border-b-2 border-dashed border-slate-200 pb-4 mb-4 text-center">
               <h3 className="font-bold text-slate-700 text-lg flex items-center justify-center gap-2">
                  <Icon name="file" size={18}/> Entendiendo las Cuentas
               </h3>
               <p className="text-xs text-slate-400 mt-1">Transparencia Total</p>
            </div>

            <div className="space-y-3 font-mono text-sm text-slate-600">
               {/* RESICO LOGIC */}
               {det.tasaIsr !== undefined && (
                  <>
                     <div className="flex justify-between">
                        <span>(+) Lo que cobraste</span>
                        <span className="font-bold">${det.baseIsr?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-slate-400">
                        <span>(x) Tu tasa del {(det.tasaIsr * 100).toFixed(2)}%</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-2">
                        <span>(=) ISR Generado</span>
                        <span className="font-bold text-slate-800">${det.isrCausado?.toLocaleString()}</span>
                     </div>
                     {det.ivaCargo > 0 && (
                        <div className="flex justify-between pt-2">
                           <span>(+) IVA a Pagar</span>
                           <span className="font-bold text-slate-800">${det.ivaCargo?.toLocaleString()}</span>
                        </div>
                     )}
                  </>
               )}

               {/* PLATAFORMAS LOGIC */}
               {det.esPlataforma && (
                  <>
                     <div className="flex justify-between">
                        <span>(+) Tus Ventas</span>
                        <span className="font-bold">${data.calculos.ingresos.toLocaleString()}</span>
                     </div>
                     
                     {/* Show Depreciation Line if exists */}
                     {det.depreciacionMensual > 0 && (
                        <div className="flex justify-between text-blue-600">
                           <span>(-) Deducción Inversiones</span>
                           <span className="font-bold">-${det.depreciacionMensual.toLocaleString()}</span>
                        </div>
                     )}

                     <div className="flex justify-between text-slate-400">
                        <span>(x) Tasa Cálculo</span>
                     </div>
                     <div className="flex justify-between">
                        <span>(=) ISR Generado</span>
                        <span className="font-bold text-slate-800">${det.isrCausado?.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-rose-500">
                        <span>(-) Retenciones App</span>
                        <span>-${det.retencionIsr?.toLocaleString()}</span>
                     </div>
                     <div className="border-t border-slate-100 my-2 pt-2 flex justify-between">
                        <span>(+) IVA a Pagar</span>
                        <span className="font-bold">${det.ivaPagar?.toLocaleString()}</span>
                     </div>
                  </>
               )}

               {/* TOTAL */}
               <div className="border-t-2 border-dashed border-slate-200 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-slate-900 uppercase">Total Cargo</span>
                  <span className="font-black text-xl text-slate-900">${det.totalPrevio?.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* STATS ROW */}
         <div className="grid grid-cols-2 gap-4 px-6 mt-6">
            {/* Ingresos */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
               <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                  <Icon name="dollar" size={20}/>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase">Cobraste</span>
               <span className="text-xl font-black text-slate-800">${data.calculos.ingresos.toLocaleString()}</span>
            </div>
            {/* Gastos */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
               {ahorroEstimado > 0 && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-bl-xl">
                     Ahorraste ~${ahorroEstimado.toFixed(0)}
                  </div>
               )}
               <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
                  <Icon name="shopping-bag" size={20}/>
               </div>
               <span className="text-xs font-bold text-slate-400 uppercase">Dedujiste</span>
               <span className="text-xl font-black text-slate-800">${data.calculos.gastosDeducibles.toLocaleString()}</span>
            </div>
         </div>

         {/* DETAILS SECTION */}
         <div className="px-6 mt-8 pb-12 space-y-8">
            
            {/* Deducibles */}
            <div>
               <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                  ✅ Compras Útiles (Deducibles)
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full">{deducibles.length}</span>
               </h3>
               <div className="space-y-3">
                  {deducibles.length === 0 && <p className="text-sm text-slate-400 italic">No hubo gastos deducibles.</p>}
                  {deducibles.map(f => (
                     <div key={f.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between border border-slate-100">
                        <div className="flex items-center gap-3">
                           <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                              <Icon name="check" size={16}/>
                           </div>
                           <div>
                              <p className="font-bold text-slate-700 text-sm">{f.concepto}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">{f.nombre}</p>
                           </div>
                        </div>
                        <span className="font-black text-slate-800 text-sm">${f.monto.toLocaleString()}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* No Deducibles */}
            {noDeducibles.length > 0 && (
               <div>
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2 opacity-70">
                     🚫 Gastos Personales (No entraron)
                     <span className="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full">{noDeducibles.length}</span>
                  </h3>
                  <div className="space-y-3 opacity-70 hover:opacity-100 transition-opacity">
                     {noDeducibles.map(f => (
                        <div key={f.id} className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between border border-slate-200">
                           <div className="flex items-center gap-3">
                              <div className="bg-slate-200 text-slate-500 p-2 rounded-xl">
                                 <Icon name="close" size={16}/>
                              </div>
                              <div>
                                 <p className="font-bold text-slate-600 text-sm">{f.concepto}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{f.nombre}</p>
                              </div>
                           </div>
                           <span className="font-bold text-slate-500 text-sm">${f.monto.toLocaleString()}</span>
                        </div>
                     ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                     Estos gastos no cumplen requisitos fiscales o no son de la actividad.
                  </p>
               </div>
            )}

         </div>

      </div>

      {/* FOOTER BRANDING */}
      <div className="bg-slate-900 text-white p-6 text-center rounded-t-[2rem] relative z-10">
         <p className="font-bold text-lg mb-1">¿Dudas?</p>
         <p className="text-slate-400 text-sm mb-4">Estoy a un mensaje de distancia en WhatsApp.</p>
         <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
            <Icon name="shield" size={16} className="text-emerald-400"/>
            <span className="text-xs font-bold uppercase tracking-wider">Contabilidad Protegida</span>
         </div>
      </div>

    </div>
  );
};
