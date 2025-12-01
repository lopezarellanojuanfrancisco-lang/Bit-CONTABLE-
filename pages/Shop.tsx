
import React, { useState } from 'react';
import { MODULOS_DISPONIBLES, MOCK_CLIENTES } from '../constants';
import { Icon } from '../components/Icon';

export const Shop: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<number | string>('');

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setCustomPrice(product.costoBase);
    setSelectedClient('');
  };

  const handleBuy = () => {
    const clientName = MOCK_CLIENTES.find(c => c.id === selectedClient)?.nombre;
    alert(`¡Venta Exitosa!\n\nProducto: ${selectedProduct.nombre}\nCliente: ${clientName}\nPrecio Final: $${customPrice} / mes\n\nEl servicio se ha activado y se ha generado el cargo mensual.`);
    setSelectedProduct(null);
    setSelectedClient('');
    setCustomPrice('');
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Tienda de Servicios</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
          Vende módulos adicionales y servicios de facturación a tus clientes.
        </p>
      </header>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render ALL SERVICES */}
        {MODULOS_DISPONIBLES.map(servicio => {
          // Special Styling for the Unlimited Invoicing Service
          const isSpecial = servicio.id === 'serv_facturacion';

          return (
            <div 
              key={servicio.id} 
              className={`
                group rounded-[2rem] p-6 shadow-soft hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col relative overflow-hidden
                ${isSpecial 
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-none shadow-emerald-500/30' 
                  : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'}
              `}
            >
              {isSpecial && (
                <div className="absolute top-0 right-0 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider">
                  Más Vendido
                </div>
              )}

              <div className={`
                w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform
                ${isSpecial ? 'bg-white/20 text-white' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'}
              `}>
                <Icon name={isSpecial ? 'file' : 'briefcase'} size={32} />
              </div>

              <h3 className={`text-xl font-bold mb-2 ${isSpecial ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                {servicio.nombre}
              </h3>
              
              <p className={`text-sm mb-6 flex-1 ${isSpecial ? 'text-emerald-100' : 'text-slate-500'}`}>
                {servicio.descripcion}
              </p>
              
              {isSpecial && (
                <ul className="text-sm mb-6 space-y-2">
                  <li className="flex items-center text-white"><Icon name="check" size={16} className="mr-2"/> Timbres ilimitados</li>
                  <li className="flex items-center text-white"><Icon name="check" size={16} className="mr-2"/> Cancelaciones sin costo</li>
                </ul>
              )}

              <div className={`mt-auto pt-6 border-t flex items-center justify-between ${isSpecial ? 'border-white/20' : 'border-slate-100 dark:border-slate-700'}`}>
                 <span className={`text-2xl font-black ${isSpecial ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                   ${servicio.costoBase}<span className={`text-xs font-normal ${isSpecial ? 'text-emerald-200' : 'text-slate-400'}`}>/mes</span>
                 </span>
                 <button 
                   onClick={() => handleProductSelect(servicio)}
                   className={`
                     px-6 py-2 rounded-xl font-bold text-sm shadow-lg transition-transform active:scale-95
                     ${isSpecial 
                        ? 'bg-white text-emerald-700 hover:bg-emerald-50' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}
                   `}
                 >
                   VENDER
                 </button>
              </div>
            </div>
          );
        })}

      </div>

      {/* Sale Modal / Bottom Sheet */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setSelectedProduct(null)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                 <div>
                   <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Confirmar Venta</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm">Configura el precio y asigna el cliente.</p>
                 </div>
                 <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><Icon name="close" size={20}/></button>
              </div>

              {/* Product Summary */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl mb-6 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm ${selectedProduct.id === 'serv_facturacion' ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                    <Icon name={selectedProduct.id === 'serv_facturacion' ? 'file' : 'briefcase'} size={24} />
                 </div>
                 <div>
                   <p className="font-bold text-slate-900 dark:text-white text-lg">{selectedProduct.nombre}</p>
                   <p className="font-mono text-slate-500 dark:text-slate-300 text-sm">Costo base: ${selectedProduct.costoBase}</p>
                 </div>
              </div>

              {/* Form Area */}
              <div className="space-y-6">
                 
                 {/* Client Selector */}
                 <div>
                   <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">1. Selecciona el Cliente</label>
                   <div className="relative">
                     <select 
                       className="w-full p-4 pl-4 pr-10 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-700 dark:text-white appearance-none transition-all"
                       value={selectedClient}
                       onChange={(e) => setSelectedClient(e.target.value)}
                     >
                       <option value="">-- Elige un cliente --</option>
                       {MOCK_CLIENTES.map(c => (
                         <option key={c.id} value={c.id}>{c.nombre}</option>
                       ))}
                     </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                       <Icon name="chevron-right" size={20} className="rotate-90" />
                     </div>
                   </div>
                 </div>

                 {/* Price Editor */}
                 <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">2. Precio de Venta (Mensual)</label>
                    <div className="relative">
                       <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</div>
                       <input 
                          type="number" 
                          value={customPrice}
                          onChange={(e) => setCustomPrice(Number(e.target.value))}
                          className="w-full p-4 pl-10 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none font-black text-2xl text-slate-900 dark:text-white transition-all"
                          placeholder="0.00"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">MXN</div>
                    </div>
                    {Number(customPrice) !== selectedProduct.costoBase && (
                       <p className="text-xs text-amber-600 mt-2 font-bold flex items-center">
                         <Icon name="edit" size={12} className="mr-1"/> Precio modificado (Base: ${selectedProduct.costoBase})
                       </p>
                    )}
                 </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button 
                  disabled={!selectedClient || !customPrice}
                  onClick={handleBuy}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/20 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Icon name="check" size={24} />
                  CONFIRMAR CARGO ${customPrice}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
