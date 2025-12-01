
import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus } from '../types';
import { Icon } from './Icon';

interface TicketManagerProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (ticketId: string, status: TicketStatus) => void;
}

export const TicketManager: React.FC<TicketManagerProps> = ({ tickets, onUpdateTicketStatus }) => {
  const [view, setView] = useState<'PENDING' | 'HISTORY'>('PENDING');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // FILTER HELPER
  const matchesSearch = (ticket: Ticket) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (ticket.subcategoria?.toLowerCase() || '').includes(term) ||
      (ticket.montoTotal?.toString() || '').includes(term) ||
      (ticket.rfcEmisor?.toLowerCase() || '').includes(term) ||
      (ticket.fechaTicket || '').includes(term) ||
      (ticket.fechaCarga || '').toLowerCase().includes(term)
    );
  };

  // Filter Data
  const pendingTickets = tickets.filter(t => t.status === 'PENDING' && matchesSearch(t));
  const historyTickets = tickets.filter(t => t.status !== 'PENDING' && matchesSearch(t));

  // Auto-select first pending ticket if none selected and we have tickets
  useEffect(() => {
    if (view === 'PENDING' && pendingTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(pendingTickets[0].id);
    }
  }, [view, pendingTickets, selectedTicketId]);

  const activeTicket = tickets.find(t => t.id === selectedTicketId);

  // Copy Helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Toast notification here
  };

  // HANDLER: Process & Auto-Advance
  const handleProcess = (status: TicketStatus) => {
    if (!activeTicket) return;

    // 1. Find current index to determine next ticket
    const currentIndex = pendingTickets.findIndex(t => t.id === activeTicket.id);
    const nextTicket = pendingTickets[currentIndex + 1] || pendingTickets[currentIndex - 1] || null;

    // 2. Update Status (Parent)
    onUpdateTicketStatus(activeTicket.id, status);

    // 3. Auto-Advance Selection
    if (nextTicket) {
      setSelectedTicketId(nextTicket.id);
    } else {
      setSelectedTicketId(null); // List empty
    }
  };

  // GROUPING LOGIC (By Date)
  const groupedPending = pendingTickets.reduce((groups, ticket) => {
    const date = ticket.fechaTicket || 'Sin Fecha';
    if (!groups[date]) groups[date] = [];
    groups[date].push(ticket);
    return groups;
  }, {} as Record<string, Ticket[]>);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl">
      
      {/* HEADER & SEARCH */}
      <div className="flex-none bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg">
            <Icon name="image" className="text-indigo-500" />
            Gestión de Gastos (Tickets)
          </h3>
          
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setView('PENDING')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${view === 'PENDING' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Bandeja Entrada
              {tickets.filter(t => t.status === 'PENDING').length > 0 && (
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] min-w-[20px] text-center">{tickets.filter(t => t.status === 'PENDING').length}</span>
              )}
            </button>
            <button 
              onClick={() => setView('HISTORY')}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${view === 'HISTORY' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Historial
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="px-4 pb-4">
           <div className="relative">
              <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por concepto, monto, RFC o fecha (Ej. 2023-10)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium text-sm transition-shadow shadow-sm focus:shadow-md"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                   <Icon name="close" size={16} />
                </button>
              )}
           </div>
        </div>
      </div>

      {/* --- VIEW: PENDING (MASTER-DETAIL) --- */}
      {view === 'PENDING' && (
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: LIST (MASTER) */}
          <div className="w-full md:w-1/3 lg:w-80 border-r border-slate-100 dark:border-slate-700 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
            {pendingTickets.length === 0 ? (
               <div className="p-10 text-center text-slate-400 flex flex-col items-center">
                  <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                    <Icon name={searchTerm ? 'search' : 'check'} size={32} className="opacity-50 text-slate-500"/>
                  </div>
                  <p className="text-sm font-bold">{searchTerm ? 'No se encontraron tickets.' : 'Todo procesado'}</p>
               </div>
            ) : (
               <div className="p-2 space-y-4">
                  {Object.keys(groupedPending).map(date => (
                    <div key={date}>
                       <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider sticky top-0 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm z-10 flex justify-between">
                          <span>{date}</span>
                          <span>{groupedPending[date].length}</span>
                       </div>
                       <div className="space-y-1">
                          {groupedPending[date].map(ticket => (
                             <button
                               key={ticket.id}
                               onClick={() => setSelectedTicketId(ticket.id)}
                               className={`
                                  w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 relative
                                  ${selectedTicketId === ticket.id 
                                     ? 'bg-white dark:bg-slate-700 border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10' 
                                     : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-600'}
                               `}
                             >
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-lg flex items-center justify-center shrink-0 text-slate-400">
                                   <Icon name="image" size={16} />
                                </div>
                                <div className="min-w-0 flex-1">
                                   <p className={`text-sm font-bold truncate ${selectedTicketId === ticket.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                      {ticket.subcategoria || 'Sin Categoría'}
                                   </p>
                                   <p className="text-xs text-slate-500 font-mono font-bold">${ticket.montoTotal?.toFixed(2) || '0.00'}</p>
                                </div>
                                {selectedTicketId === ticket.id && (
                                   <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-xl"></div>
                                )}
                             </button>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            )}
          </div>

          {/* RIGHT: WORKSPACE (DETAIL) */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 relative">
             {activeTicket ? (
                <>
                   <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                      <div className="flex flex-col xl:flex-row gap-6 h-full">
                         
                         {/* 1. IMAGE PREVIEW (Zoomable) */}
                         <div className="flex-1 bg-slate-900 rounded-2xl flex items-center justify-center relative min-h-[300px] group overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div className="text-slate-500 flex flex-col items-center">
                               <Icon name="image" size={64} className="opacity-50"/>
                               <p className="mt-4 text-xs font-mono text-slate-400 uppercase tracking-widest">Vista Previa del Ticket</p>
                            </div>
                            
                            {/* Overlay Controls */}
                            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70"><Icon name="search" size={20}/></button>
                               <button className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70"><Icon name="download" size={20}/></button>
                            </div>
                         </div>

                         {/* 2. DATA FORM */}
                         <div className="w-full xl:w-96 shrink-0 flex flex-col gap-6">
                            
                            {/* AI Extraction Card */}
                            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                               <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase flex items-center gap-2">
                                     <Icon name="search" size={14}/> Datos Detectados
                                  </h4>
                                  <span className="bg-white dark:bg-slate-800 text-[10px] font-bold px-2 py-1 rounded border border-indigo-100 dark:border-indigo-900 text-indigo-500">
                                     Confianza 98%
                                  </span>
                               </div>

                               <div className="space-y-4">
                                  <div>
                                     <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">RFC Emisor</label>
                                     <div className="flex gap-2">
                                        <input type="text" readOnly value={activeTicket.rfcEmisor || 'XAXX010101000'} className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-sm font-mono font-bold border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200" />
                                        <button onClick={() => copyToClipboard(activeTicket.rfcEmisor || '')} className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg text-indigo-600"><Icon name="file" size={16}/></button>
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                     <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha</label>
                                        <input type="text" readOnly value={activeTicket.fechaTicket || ''} className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-sm font-mono font-bold border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200" />
                                     </div>
                                     <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Monto Total</label>
                                        <div className="relative">
                                           <input type="text" readOnly value={`$${activeTicket.montoTotal}`} className="w-full bg-white dark:bg-slate-800 p-2 rounded-lg text-sm font-mono font-bold border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200" />
                                           <button onClick={() => copyToClipboard(activeTicket.montoTotal?.toString() || '')} className="absolute right-1 top-1 p-1 hover:bg-indigo-50 rounded text-indigo-600"><Icon name="file" size={14}/></button>
                                        </div>
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* Classification Form */}
                            <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Clasificación Contable</label>
                               <select 
                                 className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white"
                                 defaultValue={activeTicket.subcategoria}
                               >
                                  <option value="Combustible">Combustible</option>
                                  <option value="Viáticos">Viáticos y Pasajes</option>
                                  <option value="Papelería">Papelería y Oficina</option>
                                  <option value="Mantenimiento">Mantenimiento Automotriz</option>
                                  <option value="Equipo">Equipo de Cómputo</option>
                                  <option value="Otros">Otros Gastos Generales</option>
                               </select>
                            </div>

                            {/* Notes */}
                            <div>
                               <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-2">Notas Internas</label>
                               <textarea className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 h-24 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Observaciones sobre este gasto..."></textarea>
                            </div>

                         </div>
                      </div>
                   </div>

                   {/* FOOTER ACTIONS (FIXED) */}
                   <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex gap-4 items-center">
                      <button 
                        onClick={() => handleProcess('REJECTED')}
                        className="px-6 py-4 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 transition-all active:scale-95 flex items-center gap-2"
                      >
                         <Icon name="close" size={20} /> RECHAZAR
                      </button>
                      
                      <div className="flex-1"></div>

                      <div className="text-right mr-4 hidden sm:block">
                         <p className="text-xs text-slate-400 font-bold uppercase">Siguiente Ticket</p>
                         <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Automático</p>
                      </div>

                      <button 
                        onClick={() => handleProcess('INVOICED')}
                        className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center gap-3"
                      >
                         <Icon name="check" size={24} /> 
                         <span>MARCAR FACTURADO</span>
                      </button>
                   </div>
                </>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
                   <Icon name="image" size={64} className="mb-4 opacity-50" />
                   <p className="font-bold text-lg">Selecciona un ticket para procesar</p>
                </div>
             )}
          </div>

        </div>
      )}

      {/* --- VIEW: HISTORY --- */}
      {view === 'HISTORY' && (
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
           <div className="space-y-3">
             {historyTickets.length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                   <Icon name="search" size={40} className="mb-4 opacity-30"/>
                   <p>{searchTerm ? 'No se encontraron tickets en el historial.' : 'No hay historial disponible.'}</p>
                </div>
             ) : (
                historyTickets.map(ticket => (
                  <div key={ticket.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${ticket.status === 'INVOICED' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                           <Icon name={ticket.status === 'INVOICED' ? 'check' : 'close'} size={20} />
                        </div>
                        <div>
                           <p className="font-bold text-slate-800 dark:text-white text-base">{ticket.subcategoria} - ${ticket.montoTotal}</p>
                           <p className="text-xs text-slate-500 font-mono">
                              {ticket.fechaCarga} • <span className="font-bold">{ticket.fechaTicket}</span>
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full border ${ticket.status === 'INVOICED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                           {ticket.status === 'INVOICED' ? 'Facturado' : 'Rechazado'}
                        </span>
                        <button className="text-slate-400 hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Icon name="edit" size={18} />
                        </button>
                     </div>
                  </div>
                ))
             )}
           </div>
        </div>
      )}

    </div>
  );
};
