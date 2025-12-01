import React from 'react';
import { Cliente, EtapaContable } from '../types';
import { Icon } from './Icon';

interface ClientCardProps {
  cliente: Cliente;
  onClick: (id: string) => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ cliente, onClick }) => {
  
  const getStatusStyle = (etapa: EtapaContable) => {
    switch(etapa) {
      case EtapaContable.PENDIENTE: return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
      case EtapaContable.INICIAR: return 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300';
      case EtapaContable.PRECIERRE: return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300';
      case EtapaContable.AUTORIZAR: return 'bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300';
      case EtapaContable.TERMINADO: return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300';
      case EtapaContable.DEUDOR: return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div 
      onClick={() => onClick(cliente.id)}
      className="group relative bg-white dark:bg-slate-800 rounded-3xl shadow-soft hover:shadow-xl transition-all duration-300 p-5 mb-4 border border-transparent hover:border-primary/10 cursor-pointer overflow-hidden"
    >
      {/* Hover decoration */}
      <div className="absolute top-0 left-0 w-1 h-full bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />

      <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
        
        {/* 1. Icon & Name Info */}
        <div className="flex items-center w-full md:w-5/12">
          <div className={`
            relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm mr-4 transition-transform group-hover:scale-105 shrink-0
            ${cliente.tieneMensajesNoLeidos 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 text-primary dark:from-slate-700 dark:to-slate-800 dark:border-slate-600 dark:text-slate-300'}
          `}>
             <Icon name={cliente.tieneMensajesNoLeidos ? 'message' : 'users'} size={26} />
             {cliente.tieneMensajesNoLeidos && (
               <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
               </span>
             )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate group-hover:text-primary transition-colors">
              {cliente.nombre}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-[10px] font-bold uppercase text-slate-500 tracking-wide">
                {cliente.regimen}
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{cliente.rfc}</span>
            </div>
          </div>
        </div>

        {/* 2. Status & Note (Middle) */}
        <div className="w-full md:w-4/12 flex flex-col justify-center pl-2 md:pl-0 md:border-l border-slate-100 dark:border-slate-700 md:border-r">
          <div className="flex flex-col items-start px-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${getStatusStyle(cliente.etapa)}`}>
              {cliente.etapa}
            </span>
            {cliente.ultimaNota && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic truncate w-full flex items-center">
                <Icon name="edit" size={12} className="inline mr-2 opacity-50 shrink-0" />
                <span className="truncate">{cliente.ultimaNota}</span>
              </p>
            )}
          </div>
        </div>

        {/* 3. Actions (Right / Bottom on Mobile) */}
        <div className="w-full md:w-3/12 flex flex-row items-center justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700">
          
          {cliente.tieneMensajesNoLeidos && (
            <button 
              className="flex-1 md:flex-none h-10 w-10 md:w-auto md:px-4 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
              onClick={(e) => { e.stopPropagation(); /* Go to chat */ }}
              title="Ver Mensajes"
            >
              <Icon name="message" size={18} />
              <span className="hidden lg:inline ml-2 font-bold text-sm">Chat</span>
            </button>
          )}
          
          <button 
            className="flex-1 md:flex-none h-10 w-full md:w-auto px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            ABRIR
            <Icon name="chevron-right" size={16} />
          </button>
        </div>

      </div>
    </div>
  );
};