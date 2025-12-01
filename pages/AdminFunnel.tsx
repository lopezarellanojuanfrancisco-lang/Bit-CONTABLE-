
import React, { useState } from 'react';
import { MOCK_ADMIN_LEADS } from '../constants';
import { AdminLead, AdminFunnelStage } from '../types';
import { Icon } from '../components/Icon';

export const AdminFunnel: React.FC = () => {
  // State for columns logic
  const [leads, setLeads] = useState<AdminLead[]>(MOCK_ADMIN_LEADS);
  
  // New Lead Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadPhone, setNewLeadPhone] = useState('');

  // Column Definitions
  const columns: { id: AdminFunnelStage; label: string; color: string }[] = [
    { id: 'LEAD', label: 'Leads Entrantes', color: 'bg-slate-100 border-slate-200' },
    { id: 'DEMO', label: 'Demo Agendada', color: 'bg-blue-50 border-blue-200' },
    { id: 'TRIAL', label: 'En Prueba (15 Días)', color: 'bg-indigo-50 border-indigo-200' },
    { id: 'NEGOTIATION', label: 'Negociación', color: 'bg-amber-50 border-amber-200' },
    { id: 'WON', label: 'Ganados / Pagados', color: 'bg-emerald-50 border-emerald-200' },
  ];

  const getLeadsByStage = (stage: AdminFunnelStage) => leads.filter(l => l.etapa === stage);

  const calculateTotalValue = () => leads.reduce((acc, curr) => acc + curr.valorPotencial, 0);

  const handleAddLead = () => {
    if (!newLeadName || !newLeadPhone) return;
    const newLead: AdminLead = {
      id: `new_${Date.now()}`,
      nombre: newLeadName,
      telefono: newLeadPhone,
      email: '',
      origen: 'Directo',
      etapa: 'LEAD',
      valorPotencial: 5988,
      notas: 'Nuevo lead manual',
      fechaIngreso: new Date().toISOString().split('T')[0]
    };
    setLeads([...leads, newLead]);
    setIsAddModalOpen(false);
    setNewLeadName('');
    setNewLeadPhone('');
  };

  const moveLead = (id: string, currentStage: AdminFunnelStage, direction: 'next' | 'prev') => {
    const stageOrder: AdminFunnelStage[] = ['LEAD', 'DEMO', 'TRIAL', 'NEGOTIATION', 'WON'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stageOrder.length) {
      const newStage = stageOrder[newIndex];
      setLeads(leads.map(l => l.id === id ? { ...l, etapa: newStage } : l));
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)] flex flex-col -m-4 lg:m-0">
      
      {/* Header */}
      <div className="p-4 lg:p-0 mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Embudo de Ventas (B2B)</h2>
          <p className="text-slate-500 dark:text-slate-400">
            Gestiona a tus prospectos de Contadores. <span className="font-bold text-emerald-600 ml-2">Pipeline: ${calculateTotalValue().toLocaleString()} MXN</span>
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center"
        >
          <Icon name="add-user" className="mr-2" size={20}/> Nuevo Prospecto
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar px-4 lg:px-0 pb-4">
        <div className="flex h-full gap-4 min-w-[1200px]"> {/* Min width ensures columns don't squash */}
          
          {columns.map((col) => (
            <div key={col.id} className={`flex-1 flex flex-col rounded-2xl border-t-4 ${col.color} bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm shadow-sm min-w-[280px]`}>
              
              {/* Column Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-wider">
                  {col.label}
                </h3>
                <span className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-xs font-bold">
                  {getLeadsByStage(col.id).length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                {getLeadsByStage(col.id).map((lead) => (
                  <div key={lead.id} className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 hover:shadow-md transition-shadow group relative">
                    
                    {/* Origin Badge */}
                    <div className="absolute top-4 right-4 text-[10px] font-bold uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {lead.origen}
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-white text-base pr-8 mb-1">{lead.nombre}</h4>
                    {lead.despacho && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{lead.despacho}</p>}
                    
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <Icon name="dollar" size={14} className="mr-1 text-emerald-500" />
                      Valor: <span className="font-bold text-emerald-600 dark:text-emerald-400 ml-1">${lead.valorPotencial.toLocaleString()}</span>
                    </div>

                    {lead.notas && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg mb-3">
                        <p className="text-xs text-slate-500 italic line-clamp-2">"{lead.notas}"</p>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-600">
                      <button className="text-emerald-500 hover:text-emerald-600 p-2 hover:bg-emerald-50 rounded-full transition-colors" title="WhatsApp">
                         <Icon name="message" size={18} />
                      </button>
                      
                      <div className="flex gap-1">
                        {col.id !== 'LEAD' && (
                          <button onClick={() => moveLead(lead.id, col.id, 'prev')} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg">
                             <Icon name="chevron-right" className="rotate-180" size={16}/>
                          </button>
                        )}
                        {col.id !== 'WON' && (
                          <button onClick={() => moveLead(lead.id, col.id, 'next')} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg">
                             <Icon name="chevron-right" size={16}/>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Add Button at bottom of column */}
              <button 
                 onClick={() => {
                   // Pre-set stage logic could go here
                   setIsAddModalOpen(true);
                 }}
                 className="m-3 py-2 border-2 border-dashed border-slate-200 dark:border-slate-600 text-slate-400 rounded-xl text-xs font-bold uppercase hover:border-indigo-400 hover:text-indigo-500 transition-colors"
              >
                + Agregar Aquí
              </button>

            </div>
          ))}

        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-xl p-6 animate-in zoom-in-95">
             <h3 className="font-bold text-xl mb-4 text-slate-900 dark:text-white">Nuevo Prospecto Rápido</h3>
             <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nombre del Contador"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500 outline-none"
                  value={newLeadName}
                  onChange={e => setNewLeadName(e.target.value)}
                />
                <input 
                  type="tel" 
                  placeholder="Teléfono / WhatsApp"
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500 outline-none"
                  value={newLeadPhone}
                  onChange={e => setNewLeadPhone(e.target.value)}
                />
                <button 
                  onClick={handleAddLead}
                  className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg"
                >
                  Guardar en Embudo
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};
