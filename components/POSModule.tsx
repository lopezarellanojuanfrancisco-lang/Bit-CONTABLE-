
import React, { useState } from 'react';
import { MOCK_POS_PRODUCTS } from '../constants';
import { POSProduct, POSSaleItem } from '../types';
import { Icon } from './Icon';

export const POSModule: React.FC = () => {
  const [cart, setCart] = useState<POSSaleItem[]>([]);
  const [manualPrice, setManualPrice] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  // CALCULATED TOTAL
  const total = cart.reduce((acc, item) => acc + (item.product.precio * item.quantity), 0);

  const handleAddToCart = (product: POSProduct) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const handleAddManual = () => {
    if (!manualPrice) return;
    const price = parseFloat(manualPrice);
    if (price > 0) {
      const manualProduct: POSProduct = {
        id: `man_${Date.now()}`,
        nombre: 'Venta Manual',
        precio: price,
        categoria: 'General',
        color: 'bg-slate-500'
      };
      handleAddToCart(manualProduct);
      setManualPrice('');
    }
  };

  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.product.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (window.confirm(`¿Cobrar $${total.toLocaleString()}?`)) {
       alert('¡Venta Registrada Exitosamente!');
       setCart([]);
    }
  };

  const handleNumpadClick = (val: string) => {
    if (val === 'DEL') {
      setManualPrice(prev => prev.slice(0, -1));
    } else if (val === 'CLEAR') {
      setManualPrice('');
    } else {
      setManualPrice(prev => prev + val);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-slate-100 dark:bg-slate-900 overflow-hidden rounded-3xl shadow-2xl">
      
      {/* LEFT SIDE: PRODUCTS & KEYPAD */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative">
        
        {/* Mode Switcher */}
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm mb-4 shrink-0">
           <button 
             onClick={() => setIsManualMode(false)}
             className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${!isManualMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
              <Icon name="grid" size={18}/> Productos
           </button>
           <button 
             onClick={() => setIsManualMode(true)}
             className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${isManualMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
           >
              <Icon name="calculator" size={18}/> Manual
           </button>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 lg:pb-0">
           
           {/* GRID MODE */}
           {!isManualMode && (
             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {MOCK_POS_PRODUCTS.map(prod => (
                   <button 
                     key={prod.id}
                     onClick={() => handleAddToCart(prod)}
                     className={`${prod.color || 'bg-white'} p-4 rounded-2xl shadow-sm hover:shadow-md active:scale-95 transition-all h-32 flex flex-col items-center justify-center text-center relative group overflow-hidden`}
                   >
                      {/* Darken overlay for text readability if colored bg */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                      
                      <div className="relative z-10">
                        <div className="bg-white/30 p-2 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 backdrop-blur-sm">
                           <Icon name={prod.icono || 'shopping-bag'} size={20} className="text-white"/>
                        </div>
                        <span className="font-bold text-white text-sm leading-tight line-clamp-2 shadow-black drop-shadow-md">{prod.nombre}</span>
                        <span className="font-black text-white text-lg mt-1 drop-shadow-md">${prod.precio}</span>
                      </div>
                   </button>
                ))}
             </div>
           )}

           {/* MANUAL NUMPAD MODE */}
           {isManualMode && (
              <div className="h-full flex flex-col justify-center max-w-sm mx-auto">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg mb-4 text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Precio a ingresar</p>
                    <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                       ${manualPrice || '0'}
                    </p>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                       <button key={num} onClick={() => handleNumpadClick(num.toString())} className="p-6 bg-white dark:bg-slate-800 rounded-2xl font-bold text-2xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-slate-700 dark:text-white">
                          {num}
                       </button>
                    ))}
                    <button onClick={() => handleNumpadClick('CLEAR')} className="p-6 bg-red-100 text-red-600 rounded-2xl font-bold text-lg shadow-sm active:scale-95">C</button>
                    <button onClick={() => handleNumpadClick('0')} className="p-6 bg-white dark:bg-slate-800 rounded-2xl font-bold text-2xl shadow-sm hover:bg-slate-50 active:scale-95 text-slate-700 dark:text-white">0</button>
                    <button onClick={() => handleNumpadClick('DEL')} className="p-6 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-lg shadow-sm active:scale-95 flex items-center justify-center"><Icon name="trash" size={24}/></button>
                 </div>

                 <button onClick={handleAddManual} disabled={!manualPrice} className="mt-4 w-full py-4 bg-indigo-600 disabled:bg-slate-300 text-white rounded-2xl font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Icon name="check" size={24}/> AGREGAR
                 </button>
              </div>
           )}

        </div>
      </div>

      {/* RIGHT SIDE: CART & CHECKOUT */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl z-20">
         
         <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800 dark:text-white">
               <Icon name="shopping-bag" className="text-indigo-500"/> Ticket Actual
            </h3>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">{cart.length} items</span>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 opacity-50">
                  <Icon name="shopping-bag" size={64} className="mb-2"/>
                  <p className="font-bold">Carrito Vacío</p>
               </div>
            ) : (
               cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${item.product.color || 'bg-slate-400'}`}>
                           {item.quantity}x
                        </div>
                        <div>
                           <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{item.product.nombre}</p>
                           <p className="text-xs text-slate-500">${item.product.precio}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-900 dark:text-white">${(item.product.precio * item.quantity).toLocaleString()}</p>
                        <button onClick={() => handleRemoveItem(item.product.id)} className="text-red-400 hover:text-red-600"><Icon name="trash" size={16}/></button>
                     </div>
                  </div>
               ))
            )}
         </div>

         {/* TOTALS & ACTIONS */}
         <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-end mb-6">
               <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Total a Pagar</p>
               <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${total.toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <button className="p-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 font-bold text-slate-500 dark:text-slate-300 hover:border-red-400 hover:text-red-500 transition-all" onClick={() => setCart([])}>
                  CANCELAR
               </button>
               <button 
                 onClick={handleCheckout}
                 disabled={cart.length === 0}
                 className="p-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
               >
                  <Icon name="check" size={20}/> COBRAR
               </button>
            </div>
         </div>

      </div>

    </div>
  );
};
