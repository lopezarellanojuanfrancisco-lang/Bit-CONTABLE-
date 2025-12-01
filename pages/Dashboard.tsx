
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterBadge } from '../components/FilterBadge';
import { ClientCard } from '../components/ClientCard';
import { MOCK_CLIENTES } from '../constants';
import { EtapaContable } from '../types';
import { Icon, IconName } from '../components/Icon';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('TODOS');
  
  // Logic to filter clients
  const filteredClients = useMemo(() => {
    if (filter === 'TODOS') return MOCK_CLIENTES;
    if (filter === 'MENSAJES') return MOCK_CLIENTES.filter(c => c.tieneMensajesNoLeidos);
    return MOCK_CLIENTES.filter(c => c.etapa === filter);
  }, [filter]);

  // Counts for badges
  const getCount = (stage: string) => {
    if (stage === 'TODOS') return MOCK_CLIENTES.length;
    if (stage === 'MENSAJES') return MOCK_CLIENTES.filter(c => c.tieneMensajesNoLeidos).length;
    return MOCK_CLIENTES.filter(c => c.etapa === stage).length;
  };

  // Helper for Icons per Stage
  const getStageIcon = (etapa: string): IconName => {
     switch(etapa) {
        case EtapaContable.PENDIENTE: return 'clock';
        case EtapaContable.INICIAR: return 'play'; // Rocket concept
        case EtapaContable.PRECIERRE: return 'chart';
        case EtapaContable.AUTORIZAR: return 'shield';
        case EtapaContable.TERMINADO: return 'check';
        case EtapaContable.DEUDOR: return 'alert';
        default: return 'filter';
     }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Buenos días, Miguel.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mt-1">
            Aquí tienes el resumen de tu operación hoy.
          </p>
        </div>
        <button className="w-full md:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all active:scale-95">
             <Icon name="add-user" size={20} className="mr-2"/>
             NUEVO CLIENTE
        </button>
      </header>

      {/* Filter Cards Row - Horizontal Scroll on Mobile */}
      <section className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto pb-6 hide-scrollbar">
        <div className="flex md:grid md:grid-cols-4 lg:grid-cols-8 gap-4 min-w-max md:min-w-0">
          <div className="w-32 md:w-auto">
            <FilterBadge 
              label="TODOS" 
              count={getCount('TODOS')} 
              isSelected={filter === 'TODOS'} 
              onClick={() => setFilter('TODOS')} 
              icon="users"
            />
          </div>
          <div className="w-32 md:w-auto">
            <FilterBadge 
              label="MENSAJES" 
              count={getCount('MENSAJES')} 
              isSelected={filter === 'MENSAJES'} 
              onClick={() => setFilter('MENSAJES')} 
              special={true}
              icon="message"
            />
          </div>
          {Object.values(EtapaContable).map((etapa) => (
            <div key={etapa} className="w-32 md:w-auto">
              <FilterBadge 
                label={etapa} 
                count={getCount(etapa)} 
                isSelected={filter === etapa} 
                onClick={() => setFilter(etapa)}
                icon={getStageIcon(etapa)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Client List */}
      <section>
        <div className="mb-6 flex items-baseline justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
             <Icon name={filter === 'TODOS' ? 'users' : filter === 'MENSAJES' ? 'message' : getStageIcon(filter)} className="text-indigo-500"/>
             {filter === 'TODOS' ? 'Todos los Clientes' : filter}
           </h3>
           <span className="text-sm font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
             {filteredClients.length} Resultados
           </span>
        </div>

        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-full mb-4 animate-pulse">
              <Icon name="search" size={40} className="text-slate-400" />
            </div>
            <p className="text-xl text-slate-500 font-bold mb-2">No hay clientes en esta etapa.</p>
            <p className="text-sm text-slate-400">Intenta seleccionar otro filtro o agrega un cliente nuevo.</p>
            <button 
              onClick={() => setFilter('TODOS')}
              className="mt-6 text-primary font-bold hover:underline"
            >
              Ver todos los clientes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredClients.map(cliente => (
              <ClientCard 
                key={cliente.id} 
                cliente={cliente} 
                onClick={(id) => navigate(`/contador/cliente/${id}`)} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
