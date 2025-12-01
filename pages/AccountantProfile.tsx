
import React from 'react';
import { CURRENT_CONTADOR_PROFILE } from '../constants';
import { Icon } from '../components/Icon';

export const AccountantProfile: React.FC = () => {
  const perfil = CURRENT_CONTADOR_PROFILE;
  const porcentajeUso = (perfil.plan.clientesUsados / perfil.plan.limiteClientes) * 100;

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mi Perfil y Suscripción</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
          Administra tu plan, métodos de pago y datos del despacho.
        </p>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 text-center">
             <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4">
                {perfil.nombre.charAt(0)}
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">{perfil.nombre}</h3>
             <p className="text-slate-500 text-sm mb-4">{perfil.despacho}</p>
             <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">
               Cuenta Verificada
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
             <h4 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
               <Icon name="settings" size={18} className="mr-2 text-slate-400"/> Datos de Contacto
             </h4>
             <div className="space-y-4 text-sm">
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold">Correo Electrónico</p>
                 <p className="text-slate-700 dark:text-slate-200 font-medium">{perfil.email}</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold">Teléfono</p>
                 <p className="text-slate-700 dark:text-slate-200 font-medium">{perfil.telefono}</p>
               </div>
               <button className="w-full py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                 Editar Datos
               </button>
             </div>
          </div>
        </div>

        {/* Right Column (Wider): Subscription & Billing */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hero Card: Subscription Status */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Tu Plan Actual</p>
                <h3 className="text-3xl font-black tracking-tight">{perfil.plan.nombre}</h3>
                <p className="text-emerald-400 font-bold mt-1 flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                  {perfil.plan.estado}
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Próximo Pago</p>
                <h3 className="text-2xl font-bold text-white">{perfil.plan.proximoPago}</h3>
                <p className="text-slate-400 text-sm mt-1">{perfil.plan.precio} / mes</p>
              </div>
            </div>

            {/* Usage Bar */}
            <div className="relative z-10 bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
               <div className="flex justify-between text-sm font-bold mb-2">
                 <span>Uso de Clientes</span>
                 <span>{perfil.plan.clientesUsados} de {perfil.plan.limiteClientes}</span>
               </div>
               <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                 <div 
                   className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000" 
                   style={{ width: `${porcentajeUso}%` }}
                 ></div>
               </div>
               <p className="text-xs text-slate-400 mt-3">
                 Te quedan {perfil.plan.limiteClientes - perfil.plan.clientesUsados} espacios disponibles en tu plan actual.
               </p>
            </div>

            <div className="relative z-10 mt-6 flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                <Icon name="briefcase" size={18} />
                CAMBIAR DE PLAN
              </button>
              <button className="flex-1 bg-slate-700 text-white py-3 rounded-xl font-bold hover:bg-slate-600 transition-colors border border-slate-600">
                ACTUALIZAR TARJETA
              </button>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h4 className="font-bold text-slate-900 dark:text-white text-lg">Historial de Pagos</h4>
              <button className="text-primary text-sm font-bold hover:underline">Ver todo</button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {perfil.historialPagos.map((pago) => (
                <div key={pago.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-3 rounded-full">
                      <Icon name="check" size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{pago.fecha}</p>
                      <p className="text-xs text-slate-500">Folio: {pago.folio}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{pago.monto}</p>
                    <button className="text-xs text-primary font-bold flex items-center justify-end mt-1 gap-1">
                      <Icon name="download" size={12} /> Factura
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
