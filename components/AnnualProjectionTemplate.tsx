
import React from 'react';
import { Icon } from './Icon';

interface AnnualProjectionProps {
  data: {
    clienteNombre: string;
    anio: string;
    ingresos: number;
    gastos: number;
    deducciones: number;
    baseGravable: number;
    impuestoCausado: number;
    pagosProvisionales: number;
    saldoFinal: number; // > 0 A Pagar, < 0 A Favor
  };
}

export const AnnualProjectionTemplate: React.FC<AnnualProjectionProps> = ({ data }) => {
  const isSaldoFavor = data.saldoFinal < 0;
  const finalAmount = Math.abs(data.saldoFinal);

  return (
    <div className="w-full max-w-md mx-auto bg-white min-h-screen font-sans text-slate-800 relative overflow-hidden shadow-2xl flex flex-col">
      
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-8 pb-12 rounded-b-[3rem] shadow-xl relative z-10">
         <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-bold text-slate-900">P</div>
               <span className="font-bold text-lg tracking-wider">PROYECCIÓN</span>
            </div>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold">{data.anio}</span>
         </div>
         
         <h1 className="text-2xl font-black mb-2">Hola, {data.clienteNombre.split(' ')[0]}</h1>
         <p className="text-slate-400 text-sm leading-relaxed">
            Este es un estimado de cómo cerrarías tu año fiscal si la declaración fuera hoy.
         </p>
      </div>

      {/* MAIN RESULT */}
      <div className="mx-6 -mt-8 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 relative z-20 text-center">
         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Estimación al cierre</p>
         
         {isSaldoFavor ? (
            <>
               <div className="text-4xl font-black text-emerald-500 tracking-tight mb-1">
                  +${finalAmount.toLocaleString('es-MX', {maximumFractionDigits: 0})}
               </div>
               <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                  Saldo a Favor 🎉
               </div>
            </>
         ) : (
            <>
               <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">
                  ${finalAmount.toLocaleString('es-MX', {maximumFractionDigits: 0})}
               </div>
               <div className="inline-block bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold uppercase">
                  A Pagar (Estimado)
               </div>
            </>
         )}
      </div>

      {/* DETALLE - TIMELINE */}
      <div className="p-8 space-y-6">
         
         {/* 1. LO QUE GANASTE */}
         <div className="flex gap-4">
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">1</div>
               <div className="w-0.5 h-full bg-slate-100 my-1"></div>
            </div>
            <div className="flex-1 pb-4">
               <h4 className="font-bold text-slate-800">Ingresos Acumulados</h4>
               <p className="text-xs text-slate-500 mb-2">Total cobrado en el año.</p>
               <p className="text-xl font-black text-slate-700">${data.ingresos.toLocaleString()}</p>
            </div>
         </div>

         {/* 2. LO QUE GASTASTE */}
         <div className="flex gap-4">
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</div>
               <div className="w-0.5 h-full bg-slate-100 my-1"></div>
            </div>
            <div className="flex-1 pb-4">
               <h4 className="font-bold text-slate-800">Deducciones Totales</h4>
               <p className="text-xs text-slate-500 mb-2">Gastos de negocio + Gastos personales.</p>
               <div className="flex justify-between text-sm font-medium bg-slate-50 p-3 rounded-xl">
                  <span>Gastos: ${data.gastos.toLocaleString()}</span>
                  <span className="text-indigo-600">Personales: ${data.deducciones.toLocaleString()}</span>
               </div>
            </div>
         </div>

         {/* 3. TU UTILIDAD REAL */}
         <div className="flex gap-4">
            <div className="flex flex-col items-center">
               <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">3</div>
               <div className="w-0.5 h-full bg-slate-100 my-1"></div>
            </div>
            <div className="flex-1 pb-4">
               <h4 className="font-bold text-slate-800">Base Gravable</h4>
               <p className="text-xs text-slate-500 mb-2">Sobre esto se calcula el impuesto.</p>
               <p className="text-xl font-black text-slate-900">${data.baseGravable.toLocaleString()}</p>
            </div>
         </div>

         {/* 4. CÁLCULO FINAL */}
         <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10 space-y-2 text-sm">
               <div className="flex justify-between">
                  <span className="text-slate-400">Impuesto Anual</span>
                  <span className="font-bold">${data.impuestoCausado.toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-emerald-400">(-) Ya pagaste</span>
                  <span className="font-bold text-emerald-400">-${data.pagosProvisionales.toLocaleString()}</span>
               </div>
               <div className="h-px bg-white/20 my-2"></div>
               <div className="flex justify-between text-lg font-black">
                  <span>Diferencia</span>
                  <span>${finalAmount.toLocaleString()}</span>
               </div>
            </div>
         </div>

      </div>

      {/* RECOMMENDATION */}
      {!isSaldoFavor && (
         <div className="px-8 pb-8">
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3">
               <Icon name="shield" className="text-amber-500 shrink-0" />
               <div>
                  <p className="font-bold text-amber-800 text-sm">Recomendación</p>
                  <p className="text-xs text-amber-700/80 mt-1">
                     Aún puedes bajar este pago. Intenta facturar gastos médicos, dentales o lentes antes de que termine el año.
                  </p>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
