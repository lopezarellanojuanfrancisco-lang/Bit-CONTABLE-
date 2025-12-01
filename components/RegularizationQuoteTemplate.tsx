import React from 'react';
import { Icon } from './Icon';
import { ItemDeclaracionCero } from '../types';

interface RegularizationQuoteProps {
  data: {
    nombreCliente: string;
    mesesAdeudo: number;
    ingresosPromedio: number;
    costoHonorariosMensual: number;
    // New: Dynamic list of items instead of single cost
    itemsCeros: ItemDeclaracionCero[];
  };
}

export const RegularizationQuoteTemplate: React.FC<RegularizationQuoteProps> = ({ data }) => {
  // Cálculos basados en la lógica del PDF (Aproximación para MVP)
  const isr = data.ingresosPromedio * 0.021; // 2.1% según PDF
  const iva = data.ingresosPromedio * 0.08;  // 8% según PDF
  const seguro = data.ingresosPromedio * 0.02; // 2% según PDF
  
  const totalImpuestosMensual = isr + iva + seguro; 
  
  const impuestosTotalesEstimados = (isr + iva) * data.mesesAdeudo; 
  const honorariosTotales = data.costoHonorariosMensual * data.mesesAdeudo;
  const totalOpcion1 = impuestosTotalesEstimados + honorariosTotales;

  // Opción 2: Dynamic Sum Calculation
  const totalOpcion2 = data.itemsCeros.reduce((acc, item) => acc + item.monto, 0);

  return (
    <div className="bg-white w-full max-w-[800px] mx-auto shadow-2xl overflow-hidden font-sans text-slate-800 relative">
      
      {/* HEADER VISUAL */}
      <div className="relative bg-[#007AFF] h-64 overflow-hidden">
        {/* Círculos decorativos de fondo */}
        <div className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
        <div className="absolute bottom-[-20px] right-[-20px] w-96 h-96 rounded-full bg-blue-400/20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full pt-4">
           {/* Logo Placeholder */}
           <div className="flex flex-col items-center mb-4">
              <Icon name="chart" className="text-white mb-2" size={40} />
              <h1 className="text-white font-bold text-xl tracking-widest uppercase">ALTOS CONTABLE</h1>
              <span className="text-blue-200 text-[10px] tracking-[0.3em] uppercase">Contabilidad en Línea</span>
           </div>

           {/* Illustration Placeholder (Woman with papers) */}
           <div className="bg-white p-2 rounded-t-3xl shadow-lg mt-auto w-64 h-32 flex items-end justify-center relative -bottom-2">
              <div className="text-blue-600 flex flex-col items-center">
                 <Icon name="users" size={64} />
                 <span className="text-[10px] text-slate-400">Ilustración Personal</span>
              </div>
           </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        
        {/* TITLE */}
        <h2 className="text-center text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
          Cotización para regularizar<br/>
          plataformas digitales
        </h2>

        <div className="text-center mb-8">
           <span className="bg-blue-100 text-blue-800 font-bold px-4 py-1 rounded-full uppercase text-sm">
              Prospecto: {data.nombreCliente}
           </span>
        </div>

        {/* SUMMARY BOX */}
        <div className="bg-[#EAF4FF] rounded-xl overflow-hidden mb-12">
           <div className="flex justify-between items-center p-4 border-b border-blue-100">
              <span className="font-bold text-slate-700 text-lg">Total meses con adeudo</span>
              <span className="font-bold text-slate-900 text-xl">{data.mesesAdeudo}</span>
           </div>
           <div className="flex justify-between items-center p-4">
              <span className="font-bold text-slate-700 text-lg">Ingresos promedio</span>
              <span className="font-bold text-slate-900 text-xl">$ {data.ingresosPromedio.toLocaleString('es-MX')}</span>
           </div>
        </div>

        {/* OPCIÓN 1 */}
        <div className="mb-12">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#2F80ED] flex items-center justify-center text-white shadow-lg shrink-0">
                 <Icon name="dollar" size={32} />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-bold uppercase">Opción 1</p>
                 <h3 className="text-2xl font-black text-slate-900">Pago mes a mes</h3>
              </div>
           </div>

           <div className="space-y-3 mb-6 text-sm md:text-base">
              <div className="flex justify-between">
                 <span className="font-medium text-slate-600">Ingresos</span>
                 <span className="font-bold">$ {data.ingresosPromedio.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                 <span className="font-medium text-slate-600">ISR 2.1%</span>
                 <span className="font-bold">$ {isr.toLocaleString('es-MX', {maximumFractionDigits:0})}</span>
              </div>
              <div className="flex justify-between">
                 <span className="font-medium text-slate-600">IVA 8%</span>
                 <span className="font-bold">$ {iva.toLocaleString('es-MX', {maximumFractionDigits:0})}</span>
              </div>
              <p className="text-xs text-slate-400 italic">Este solo pagaste la mitad falta pagar los otros ${(iva).toLocaleString('es-MX', {maximumFractionDigits:0})}</p>
              
              <div className="flex justify-between">
                 <span className="font-medium text-slate-600">Seguro 2%</span>
                 <span className="font-bold">$ {seguro.toLocaleString('es-MX', {maximumFractionDigits:0})}</span>
              </div>
           </div>

           <div className="bg-[#EAF4FF] p-6 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                 <span className="font-bold text-slate-700">Total a pagar impuestos</span>
                 <span className="font-bold text-slate-900">$ {impuestosTotalesEstimados.toLocaleString('es-MX')}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="font-bold text-slate-700">${data.costoHonorariosMensual} x mes de Honorarios</span>
                 <span className="font-bold text-slate-900">$ {honorariosTotales.toLocaleString('es-MX')}</span>
              </div>
              <div className="h-px bg-blue-200 w-full my-2"></div>
              <div className="flex justify-between items-center text-xl">
                 <span className="font-bold text-slate-800">Total a pagar</span>
                 <span className="font-black text-slate-900">$ {totalOpcion1.toLocaleString('es-MX')}</span>
              </div>
           </div>
        </div>

        {/* OPCIÓN 2 (DYNAMIC LIST) */}
        <div className="mb-12">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#2F80ED] flex items-center justify-center text-white shadow-lg shrink-0">
                 <Icon name="file" size={32} />
              </div>
              <div>
                 <p className="text-sm text-slate-500 font-bold uppercase">Opción 2</p>
                 <h3 className="text-2xl font-black text-slate-900">Declaración en ceros</h3>
              </div>
           </div>

           <div className="space-y-4 mb-6">
              {/* Dynamic Items Render */}
              {data.itemsCeros.map(item => (
                 <div key={item.id} className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-700">{item.texto}</span>
                    <span className="font-bold text-slate-900">$ {item.monto.toLocaleString('es-MX')}</span>
                 </div>
              ))}
              
              {data.itemsCeros.length === 0 && (
                 <p className="text-center text-slate-400 italic text-sm">No se han agregado años a declarar.</p>
              )}
           </div>

           <div className="bg-[#EAF4FF] p-6 rounded-xl flex justify-between items-center mb-4">
              <span className="font-bold text-slate-700 text-lg">Total</span>
              <span className="font-black text-slate-900 text-2xl">$ {totalOpcion2.toLocaleString('es-MX')}</span>
           </div>
           
           <p className="text-xs text-slate-500 text-center px-4 leading-relaxed">
              El pago lo puedes hacer diferido a meses sin intereses.
           </p>
        </div>

        {/* BENEFICIOS TEXTO */}
        <div className="mb-12 text-slate-700">
           <h3 className="text-3xl font-black text-center mb-8">Beneficios</h3>
           
           <h4 className="font-bold text-lg mb-2">¿Por qué es posible presentar la declaración en ceros?</h4>
           <p className="text-sm mb-6 leading-relaxed">
              Porque el SAT lo permite expresamente en su normativa cuando no solicitas devolución de impuestos y no estás siendo auditado.
           </p>

           <h4 className="font-bold text-lg mb-4">Esto se basa en:</h4>
           
           <div className="mb-6">
              <p className="font-bold text-sm mb-1">Artículo 22 del Código Fiscal de la Federación:</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                 Establece que los contribuyentes pueden presentar declaraciones complementarias o aclaratorias de forma voluntaria, siempre y cuando no se haya iniciado una auditoría ni se solicite devolución.
              </p>
           </div>

           <div className="mb-6">
              <p className="font-bold text-sm mb-1">Regla 2.3.2 de la Resolución Miscelánea Fiscal (RMF):</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                 Permite presentar declaraciones en ceros cuando no se tuvieron ingresos o deducciones que declarar.
              </p>
           </div>

           <div className="bg-[#EAF4FF] p-4 rounded-lg text-center">
              <p className="text-xs font-bold text-slate-800">
                 NOTA: El servicio no incluye la declaración Anual, ese servicio se paga por separado.
              </p>
           </div>
        </div>

        {/* FOOTER VISUAL */}
        <div className="text-center">
           {/* Illustration Placeholder */}
           <div className="flex justify-center mb-6">
              <div className="w-48 h-32 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                 <Icon name="video" size={32} className="mb-2"/>
                 <span className="text-[10px] font-bold uppercase">Video Soporte</span>
              </div>
           </div>

           <h3 className="text-2xl font-black mb-4">Sin preocupaciones</h3>
           <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
              Te enseñaremos por medio de videos cómo tú mismo puedes revisar que hemos hecho tu contabilidad directamente desde el portal del SAT. También te entregaremos los PDFs sellados por el SAT como comprobante de que ya estás al día.
           </p>
        </div>

      </div>

      {/* Decorative Bottom Circles */}
      <div className="h-32 relative overflow-hidden">
         <div className="absolute bottom-[-50px] left-[-20px] w-40 h-40 rounded-full border-[16px] border-[#2F80ED]"></div>
         <div className="absolute bottom-[-80px] right-[-20px] w-64 h-64 rounded-full bg-[#2F80ED]"></div>
      </div>

    </div>
  );
};