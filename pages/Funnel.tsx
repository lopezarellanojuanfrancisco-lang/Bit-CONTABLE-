








import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROSPECTOS, DEFAULT_FUNNEL_CONFIG } from '../constants';
import { Icon, IconName } from '../components/Icon';
import { FunnelStepConfig, MediaType, EtapaEmbudo, FollowUpAction, PursuitIntensity } from '../types';

export const Funnel: React.FC = () => {
  const navigate = useNavigate();

  // STATE: Funnel Configuration
  const [funnelConfig, setFunnelConfig] = useState<FunnelStepConfig[]>(DEFAULT_FUNNEL_CONFIG);
  
  // STATE: Config Modal
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeConfigStep, setActiveConfigStep] = useState<number | null>(null); // For Accordion Logic

  // STATE: Master Filter
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Logic to filter prospects
  const filteredProspects = useMemo(() => {
    switch (activeFilter) {
      case 'ALL':
        return MOCK_PROSPECTOS.filter(p => p.etapa !== EtapaEmbudo.INACTIVO);
      case 'POSIBLE_PAGO':
        return MOCK_PROSPECTOS.filter(p => p.esPosiblePago);
      case 'PENDIENTE':
        return MOCK_PROSPECTOS.filter(p => p.tienePendiente);
      case 'UNREAD':
        return MOCK_PROSPECTOS.filter(p => p.tieneMensajesNoLeidos);
      case 'INACTIVE':
        return MOCK_PROSPECTOS.filter(p => p.etapa === EtapaEmbudo.INACTIVO);
      case 'ESPERANDO_SELLOS':
        const docSteps = funnelConfig.filter(s => s.isDocCollector).map(s => s.mappedEtapa);
        return MOCK_PROSPECTOS.filter(p => docSteps.includes(p.etapa));
      default:
        return MOCK_PROSPECTOS.filter(p => p.etapa === activeFilter);
    }
  }, [activeFilter, funnelConfig]);
  
  // Helper to count prospects in a specific stage/filter
  const getCount = (filterType: string) => {
    switch (filterType) {
      case 'ALL': return MOCK_PROSPECTOS.filter(p => p.etapa !== EtapaEmbudo.INACTIVO).length;
      case 'POSIBLE_PAGO': return MOCK_PROSPECTOS.filter(p => p.esPosiblePago).length;
      case 'PENDIENTE': return MOCK_PROSPECTOS.filter(p => p.tienePendiente).length;
      case 'UNREAD': return MOCK_PROSPECTOS.filter(p => p.tieneMensajesNoLeidos).length;
      case 'INACTIVE': return MOCK_PROSPECTOS.filter(p => p.etapa === EtapaEmbudo.INACTIVO).length;
      case 'ESPERANDO_SELLOS':
        const docSteps = funnelConfig.filter(s => s.isDocCollector).map(s => s.mappedEtapa);
        return MOCK_PROSPECTOS.filter(p => docSteps.includes(p.etapa)).length;
      default: return MOCK_PROSPECTOS.filter(p => p.etapa === filterType).length;
    }
  };

  // --- DYNAMIC STEPS LOGIC ---

  const handleAddStep = () => {
    const newId = funnelConfig.length > 0 ? Math.max(...funnelConfig.map(s => s.id)) + 1 : 1;
    const newStep: FunnelStepConfig = {
      id: newId,
      title: `Nuevo Paso ${newId}`,
      mappedEtapa: EtapaEmbudo.CONTACTO_INICIAL,
      autoMessage: { enabled: false, text: '', mediaType: 'NONE', initialDelayMinutes: 0 },
      aiConfig: { enabled: false, triggerQuestion: '', expectedKeywords: [], offTrackReply: '' },
      followUpSequence: [],
      moveToInactiveAfterFinish: false
    };
    
    setFunnelConfig([...funnelConfig, newStep]);
    setActiveConfigStep(newId);
  };

  const handleDeleteStep = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (funnelConfig.length <= 1) {
      alert("Debes mantener al menos un paso en el embudo.");
      return;
    }
    
    if (confirm("¿Estás seguro de eliminar este paso?")) {
      const newConfig = funnelConfig.filter(s => s.id !== id);
      setFunnelConfig(newConfig);
      if (activeConfigStep === id) setActiveConfigStep(null);
    }
  };

  const updateStepConfig = (id: number, updates: any) => {
    setFunnelConfig(prev => prev.map(step => {
      if (step.id !== id) return step;
      if (updates.autoMessage) return { ...step, autoMessage: { ...step.autoMessage, ...updates.autoMessage } };
      if (updates.aiConfig) return { ...step, aiConfig: { ...step.aiConfig, ...updates.aiConfig } };
      if (updates.smartPursuitConfig) return { ...step, smartPursuitConfig: { ...(step.smartPursuitConfig || {enabled: true, intensity: 'MEDIUM', customExcuses: []}), ...updates.smartPursuitConfig } };
      return { ...step, ...updates };
    }));
  };

  // --- FOLLOW UP SEQUENCE LOGIC ---
  const handleAddFollowUp = (stepId: number) => {
    setFunnelConfig(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      const newFollowUp: FollowUpAction = { id: `seq_${Date.now()}`, delayValue: 1, delayUnit: 'DAYS', message: '', mediaType: 'NONE' };
      return { ...step, followUpSequence: [...step.followUpSequence, newFollowUp] };
    }));
  };

  const handleDeleteFollowUp = (stepId: number, followUpId: string) => {
    setFunnelConfig(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      return { ...step, followUpSequence: step.followUpSequence.filter(f => f.id !== followUpId) };
    }));
  };

  const updateFollowUp = (stepId: number, followUpId: string, updates: Partial<FollowUpAction>) => {
    setFunnelConfig(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      return {
        ...step,
        followUpSequence: step.followUpSequence.map(f => f.id === followUpId ? { ...f, ...updates } : f)
      };
    }));
  };

  const handleProspectClick = (id: string) => {
    navigate(`/contador/prospecto/${id}`);
  };

  const renderMediaSelector = (currentType: MediaType, onChange: (type: MediaType, name?: string) => void) => {
    const options: { type: MediaType, label: string, icon: IconName, fileName: string }[] = [
      { type: 'NONE', label: 'Solo Texto', icon: 'file', fileName: '' },
      { type: 'IMAGE', label: 'Imagen', icon: 'image', fileName: 'imagen_promo.jpg' },
      { type: 'VIDEO', label: 'Video', icon: 'video', fileName: 'video_demo.mp4' },
      { type: 'AUDIO', label: 'Audio', icon: 'mic', fileName: 'audio_nota.mp3' },
      { type: 'PDF', label: 'PDF', icon: 'file', fileName: 'documento_info.pdf' },
    ];

    return (
      <div className="grid grid-cols-5 gap-2 mt-2">
        {options.map(opt => {
          const isSelected = currentType === opt.type;
          return (
            <button
              key={opt.type}
              onClick={() => onChange(opt.type, opt.fileName)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all active:scale-95
                ${isSelected 
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-slate-300'}
              `}
              title={opt.label}
            >
              <Icon name={opt.icon} size={20} className={isSelected ? 'mb-1' : ''} />
              {isSelected && <span className="text-[10px] font-bold uppercase hidden sm:block">{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  };

  const QuickFilterCard = ({ type, label, icon, color, special = false }: { type: string, label: string, icon: IconName, color: string, special?: boolean }) => {
     const isActive = activeFilter === type;
     const count = getCount(type);
     return (
        <button
          onClick={() => setActiveFilter(type)}
          className={`
             relative flex flex-col items-start p-4 rounded-2xl border-2 transition-all w-full md:w-48 shrink-0
             ${isActive ? `${color} shadow-lg scale-105 z-10` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300'}
          `}
        >
           <div className="flex justify-between w-full mb-2">
              <div className={`p-2 rounded-lg ${isActive ? 'bg-white/30 text-white' : (special ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500')}`}>
                 <Icon name={icon} size={24} />
              </div>
              <span className={`text-2xl font-black ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                 {count}
              </span>
           </div>
           <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-500'}`}>
              {label}
           </span>
           {isActive && (
              <div className="absolute top-2 right-2">
                 <Icon name="check" size={16} className="text-white"/>
              </div>
           )}
        </button>
     );
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Embudo de Ventas</h2>
           <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
             Gestiona tus prospectos desde que llegan por WhatsApp hasta que pagan.
           </p>
        </div>
        <button 
          onClick={() => setIsConfigOpen(true)}
          className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-6 py-3 rounded-xl font-bold flex items-center shadow-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-all active:scale-95"
        >
          <Icon name="settings" className="mr-2" size={20}/>
          Configurar Pasos
        </button>
      </header>

      {/* QUICK FILTERS */}
      <div className="flex flex-row gap-4 overflow-x-auto pb-4 hide-scrollbar">
         <QuickFilterCard type="ALL" label="Activos" icon="users" color="bg-slate-800 border-slate-900 text-white" />
         <QuickFilterCard type="UNREAD" label="WhatsApp Sin Leer" icon="message" color="bg-green-600 border-green-700 text-white" special={true} />
         <QuickFilterCard type="ESPERANDO_SELLOS" label="Esperando Sellos" icon="file-warning" color="bg-orange-500 border-orange-600 text-white" />
         <QuickFilterCard type="POSIBLE_PAGO" label="Posible Pago" icon="dollar" color="bg-emerald-500 border-emerald-600 text-white" />
         <QuickFilterCard type="PENDIENTE" label="Pendientes" icon="alert" color="bg-amber-500 border-amber-600 text-white" />
         <QuickFilterCard type="INACTIVE" label="Sin Respuesta" icon="archive" color="bg-slate-400 border-slate-500 text-white" />
      </div>

      {/* Funnel Visual Steps */}
      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex items-center min-w-max bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 gap-4">
          {funnelConfig.map((step, index) => {
            const stepCount = getCount(step.mappedEtapa);
            const isActiveStep = activeFilter === step.mappedEtapa;

            return (
              <div 
                key={step.id} 
                onClick={() => setActiveFilter(step.mappedEtapa)}
                className={`
                  flex items-center group relative cursor-pointer p-2 rounded-xl transition-all
                  ${isActiveStep ? 'bg-indigo-50 dark:bg-indigo-900/30 ring-2 ring-indigo-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}
                `}
              >
                 <div className={`
                   flex flex-col items-center justify-center w-12 h-12 rounded-full font-bold shadow-md transition-transform group-hover:scale-110 z-10 relative
                   ${isActiveStep 
                     ? 'bg-indigo-600 text-white scale-110' 
                     : (index < 2 ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-100')}
                 `}>
                   <span className="text-lg leading-none">{index + 1}</span>
                 </div>
                 <div className="ml-3 mr-4">
                    <span className={`font-bold text-sm block ${isActiveStep ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-white'}`}>
                      {step.title}
                    </span>
                    <span className={`text-xs font-bold ${isActiveStep ? 'text-indigo-500' : 'text-slate-400'}`}>
                      {stepCount} Prospectos
                    </span>
                 </div>
                 
                 {index < funnelConfig.length - 1 && (
                    <div className="h-0.5 w-8 bg-slate-200 dark:bg-slate-700 ml-2"></div>
                 )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prospect List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft overflow-hidden border border-slate-100 dark:border-slate-700">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-700/20">
           <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Icon name="filter" size={16}/> 
              Viendo: <span className="text-indigo-600 dark:text-indigo-400 uppercase">{activeFilter === 'ALL' ? 'Todos los Activos' : activeFilter === 'UNREAD' ? 'Sin Leer' : activeFilter === 'INACTIVE' ? 'Sin Respuesta / Inactivos' : activeFilter}</span>
           </h3>
           <span className="text-xs font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-600">
             {filteredProspects.length} Resultados
           </span>
        </div>

        {filteredProspects.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
             <Icon name="filter" size={48} className="mx-auto mb-4 text-slate-300"/>
             <p className="text-lg font-bold">No hay prospectos en esta vista.</p>
             {activeFilter !== 'ALL' && (
                <button onClick={() => setActiveFilter('ALL')} className="mt-4 text-indigo-600 font-bold underline">
                   Ver Activos
                </button>
             )}
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 hidden md:table-header-group">
              <tr>
                <th className="p-6 text-xs font-bold uppercase tracking-wider">Nombre / Contacto</th>
                <th className="p-6 text-xs font-bold uppercase tracking-wider">Etapa / Estatus</th>
                <th className="p-6 text-xs font-bold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProspects.map((prospect) => {
                const lastNote = prospect.notas && prospect.notas.length > 0 ? prospect.notas[0] : null;

                return (
                  <tr 
                    key={prospect.id} 
                    onClick={() => handleProspectClick(prospect.id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group flex flex-col md:table-row p-4 md:p-0 relative"
                  >
                    <td className="p-4 md:p-6">
                      <div className="flex items-start gap-4">
                        <div className={`
                           relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md shrink-0
                           ${prospect.etapa === EtapaEmbudo.INACTIVO ? 'bg-slate-400' : 'bg-gradient-to-br from-amber-500 to-orange-600'}
                        `}>
                          {prospect.nombre.charAt(0)}
                          {prospect.tieneMensajesNoLeidos && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                            </span>
                          )}
                        </div>
                        <div className="w-full">
                          <div className="flex flex-wrap items-center gap-2">
                             <p className={`font-bold text-lg transition-colors ${prospect.etapa === EtapaEmbudo.INACTIVO ? 'text-slate-500 line-through decoration-2' : 'text-slate-900 dark:text-white group-hover:text-primary'}`}>{prospect.nombre}</p>
                             {prospect.esPosiblePago && (
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center border border-emerald-200">
                                   <Icon name="dollar" size={10} className="mr-0.5"/> Pago
                                </span>
                             )}
                             {prospect.tienePendiente && (
                                <span className="bg-amber-100 text-amber-700 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center border border-amber-200">
                                   <Icon name="alert" size={10} className="mr-0.5"/> Pendiente
                                </span>
                             )}
                          </div>
                          
                          <div className="flex items-center text-slate-500 text-sm mt-0.5 mb-2">
                            <Icon name="message" size={14} className="mr-1" />
                            {prospect.telefono}
                          </div>

                          {lastNote && (
                            <div className="mt-2 bg-yellow-50 dark:bg-yellow-900/20 p-2.5 rounded-lg border border-yellow-200 dark:border-yellow-900/30 flex items-start gap-2 max-w-md shadow-sm">
                               <Icon name="edit" size={14} className="text-amber-500 mt-0.5 shrink-0" />
                               <div className="min-w-0">
                                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium italic line-clamp-2">"{lastNote.texto}"</p>
                                  <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">{lastNote.fecha}</p>
                               </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 pb-2 md:p-6 md:pb-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider md:hidden">Etapa Actual:</span>
                        <span className={`
                           inline-flex items-center px-4 py-1.5 rounded-lg font-bold text-sm uppercase tracking-wide border 
                           ${prospect.etapa === EtapaEmbudo.INACTIVO ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-900'}
                        `}>
                          {prospect.etapa}
                        </span>
                        <div className="flex items-center text-xs text-slate-400 mt-1">
                           <Icon name="clock" size={12} className="mr-1"/>
                           <span className="md:hidden mr-1">Último:</span>
                           {prospect.fechaUltimoContacto}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 md:p-6 text-right mt-2 md:mt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-700 pt-4 md:pt-6">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProspectClick(prospect.id);
                        }}
                        className={`
                           w-full md:w-auto px-6 py-2.5 rounded-xl shadow-lg font-bold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all
                           ${prospect.etapa === EtapaEmbudo.INACTIVO ? 'bg-slate-600 hover:bg-slate-700 text-white shadow-slate-500/20' : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'}
                        `}
                      >
                        <Icon name="message" size={18} />
                        ABRIR EXPEDIENTE
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ========================================================== */}
      {/*              CONFIGURATION MODAL                           */}
      {/* ========================================================== */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsConfigOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full sm:max-w-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 flex flex-col h-full sm:h-[90vh]">
             
             {/* Header */}
             <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900 shrink-0">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                     <Icon name="settings" className="text-amber-500" size={28} /> Configurar Embudo
                   </h3>
                   <p className="text-slate-500 text-base mt-1">Automatiza tu proceso de seguimiento de ventas.</p>
                </div>
                <button onClick={() => setIsConfigOpen(false)} className="p-3 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 transition-colors">
                  <Icon name="close" size={24}/>
                </button>
             </div>

             {/* ACCORDION LIST */}
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 bg-slate-100 dark:bg-slate-900/50 space-y-4">
                
                {funnelConfig.map((step, idx) => {
                   const isActive = activeConfigStep === step.id;
                   
                   return (
                      <div 
                        key={step.id} 
                        className={`
                           rounded-3xl transition-all duration-300 border shadow-sm overflow-hidden
                           ${isActive 
                              ? 'bg-white dark:bg-slate-800 border-amber-500 ring-4 ring-amber-500/10' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-amber-300 cursor-pointer'}
                        `}
                        onClick={() => !isActive && setActiveConfigStep(step.id)}
                      >
                         {/* STEP HEADER */}
                         <div className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className={`
                                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm shrink-0
                                  ${isActive ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}
                               `}>
                                  {idx + 1}
                               </div>
                               <div>
                                  <h4 className={`font-bold text-lg ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                     {step.title}
                                  </h4>
                                  {!isActive && (step.autoMessage.enabled || step.followUpSequence.length > 0) && (
                                     <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase mt-1">
                                        <Icon name="clock" size={12} /> Automatización Activa
                                     </div>
                                  )}
                               </div>
                            </div>
                            <div className="flex items-center gap-2">
                               {isActive ? (
                                  <button onClick={(e) => handleDeleteStep(step.id, e)} className="p-3 text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                                     <Icon name="trash" size={24} />
                                  </button>
                               ) : (
                                  <Icon name="chevron-right" className="text-slate-300 dark:text-slate-600 rotate-90" size={24} />
                               )}
                            </div>
                         </div>

                         {/* EXPANDED CONTENT */}
                         {isActive && (
                            <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2">
                               <div className="h-px w-full bg-slate-100 dark:bg-slate-700 mb-6"></div>

                               {/* --- NEW: SMART PURSUIT CONFIG FOR "POSIBLE PAGO" --- */}
                               {step.mappedEtapa === EtapaEmbudo.POSIBLE_PAGO && (
                                  <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 border-2 border-emerald-100 dark:border-emerald-900/30 mb-6 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                                     
                                     <div className="relative z-10">
                                        <div className="flex justify-between items-center mb-4">
                                           <div>
                                              <h5 className="font-bold text-emerald-900 dark:text-emerald-100 text-lg flex items-center gap-2">
                                                 <Icon name="zap" size={20} className="text-emerald-500" /> 
                                                 Persecución Inteligente (Smart Pursuit)
                                              </h5>
                                              <p className="text-xs text-emerald-700/60 dark:text-emerald-300/60 mt-1">
                                                 IA de cierre para prospectos calientes.
                                              </p>
                                           </div>
                                           <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
                                              <button onClick={() => updateStepConfig(step.id, { smartPursuitConfig: { enabled: false } })} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${!step.smartPursuitConfig?.enabled ? 'bg-slate-200 text-slate-600' : 'text-slate-400'}`}>Apagar</button>
                                              <button onClick={() => updateStepConfig(step.id, { smartPursuitConfig: { enabled: true } })} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1 ${step.smartPursuitConfig?.enabled ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400'}`}>Encender</button>
                                           </div>
                                        </div>

                                        {step.smartPursuitConfig?.enabled && (
                                           <div className="space-y-4 animate-in fade-in">
                                              <div>
                                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Intensidad de Seguimiento</label>
                                                 <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-emerald-100 dark:border-emerald-900">
                                                    {(['LOW', 'MEDIUM', 'HIGH'] as PursuitIntensity[]).map(intensity => (
                                                       <button 
                                                         key={intensity}
                                                         onClick={() => updateStepConfig(step.id, { smartPursuitConfig: { intensity } })}
                                                         className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${step.smartPursuitConfig?.intensity === intensity ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:text-emerald-500'}`}
                                                       >
                                                          {intensity === 'LOW' ? 'Baja (1/semana)' : intensity === 'MEDIUM' ? 'Media (2/semana)' : 'Alta (Diario)'}
                                                       </button>
                                                    ))}
                                                 </div>
                                              </div>
                                              <div>
                                                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Excusas Comunes (Para que la IA las rebata)</label>
                                                 <textarea 
                                                   className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-slate-900 text-slate-800 dark:text-white h-20 text-sm resize-none focus:ring-2 focus:ring-emerald-400 outline-none"
                                                   placeholder='Ej. "No tengo dinero", "Déjame pensarlo", "Está caro"...'
                                                   value={step.smartPursuitConfig.customExcuses?.join(', ')}
                                                   onChange={(e) => updateStepConfig(step.id, { smartPursuitConfig: { customExcuses: e.target.value.split(',').map(s => s.trim()) } })}
                                                 ></textarea>
                                              </div>
                                           </div>
                                        )}
                                     </div>
                                  </div>
                               )}

                               {/* 1. EDIT TITLE */}
                               <div className="mb-6">
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Nombre del Paso</label>
                                  <input 
                                     type="text" 
                                     value={step.title}
                                     onChange={(e) => updateStepConfig(step.id, { title: e.target.value })}
                                     className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-amber-500 outline-none text-xl font-bold text-slate-800 dark:text-white"
                                  />
                               </div>

                               {/* 2. AUTO MESSAGE BLOCK */}
                               <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-900/30 mb-6">
                                  <div className="flex justify-between items-center mb-4">
                                     <h5 className="font-bold text-amber-900 dark:text-amber-100 text-lg flex items-center gap-2">
                                        <Icon name="message" size={20}/> Mensaje Inmediato
                                     </h5>
                                     <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
                                        <button onClick={() => updateStepConfig(step.id, { autoMessage: { enabled: false } })} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${!step.autoMessage.enabled ? 'bg-slate-200 text-slate-600' : 'text-slate-400 hover:bg-slate-50'}`}>Apagar</button>
                                        <button onClick={() => updateStepConfig(step.id, { autoMessage: { enabled: true } })} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1 ${step.autoMessage.enabled ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><Icon name="check" size={14} /> Encender</button>
                                     </div>
                                  </div>

                                  {step.autoMessage.enabled && (
                                     <>
                                        {/* Initial Delay Config */}
                                        <div className="mb-4 bg-white dark:bg-slate-800 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50 flex items-center gap-3">
                                           <Icon name="clock" className="text-amber-500" size={20} />
                                           <div>
                                              <p className="text-xs font-bold text-slate-500 uppercase">Tiempo de espera antes de enviar:</p>
                                              <div className="flex items-center gap-2 mt-1">
                                                 <input 
                                                   type="number" 
                                                   min="0"
                                                   className="w-16 p-1 border rounded text-center font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white"
                                                   value={step.autoMessage.initialDelayMinutes}
                                                   onChange={(e) => updateStepConfig(step.id, { autoMessage: { initialDelayMinutes: parseInt(e.target.value) || 0 } })}
                                                 />
                                                 <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Minutos</span>
                                                 <span className="text-xs text-slate-400 ml-2">(0 = Inmediato)</span>
                                              </div>
                                           </div>
                                        </div>

                                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Mensaje:</label>
                                        {renderMediaSelector(step.autoMessage.mediaType, (type, name) => updateStepConfig(step.id, { autoMessage: { mediaType: type, mediaName: name } }))}
                                        
                                        <label className="block text-xs font-bold text-slate-400 uppercase mt-4 mb-1">Texto del Mensaje:</label>
                                        <textarea 
                                          className="w-full p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white h-24 text-sm resize-none focus:ring-2 focus:ring-amber-400 outline-none"
                                          value={step.autoMessage.text}
                                          onChange={(e) => updateStepConfig(step.id, { autoMessage: { text: e.target.value } })}
                                          placeholder="Escribe el mensaje de bienvenida..."
                                        ></textarea>
                                     </>
                                  )}
                               </div>

                               {/* 3. AI AGENT CONFIGURATION (HIDDEN IF DOC COLLECTOR MODE OR SMART PURSUIT IS ACTIVE) */}
                               {!step.isDocCollector && step.mappedEtapa !== EtapaEmbudo.POSIBLE_PAGO && (
                                 <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/30 mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                       <div>
                                          <h5 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg flex items-center gap-2">
                                             <Icon name="brain" size={20}/> Agente IA (Filtro)
                                          </h5>
                                          <p className="text-xs text-indigo-700/60 dark:text-indigo-300/60 mt-1">
                                             La IA evaluará la respuesta del cliente para avanzar.
                                          </p>
                                       </div>
                                       <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1 shadow-sm">
                                          <button onClick={() => updateStepConfig(step.id, { aiConfig: { enabled: !step.aiConfig?.enabled } })} className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all flex items-center gap-1 ${step.aiConfig?.enabled ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 bg-slate-200'}`}>
                                             {step.aiConfig?.enabled ? 'Activado' : 'Desactivado'}
                                          </button>
                                       </div>
                                    </div>

                                    {step.aiConfig?.enabled && (
                                       <div className="space-y-4 animate-in fade-in">
                                          <div>
                                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Pregunta Clave (Intención):</label>
                                             <input 
                                               type="text" 
                                               className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-medium"
                                               placeholder="Ej. ¿Eres Uber o Didi?"
                                               value={step.aiConfig.triggerQuestion}
                                               onChange={(e) => updateStepConfig(step.id, { aiConfig: { triggerQuestion: e.target.value } })}
                                             />
                                          </div>
                                          <div>
                                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Respuesta Esperada (Palabras clave):</label>
                                             <input 
                                               type="text" 
                                               className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-sm font-medium"
                                               placeholder="Ej. uber, didi, plataforma"
                                               value={step.aiConfig.expectedKeywords.join(', ')}
                                               onChange={(e) => updateStepConfig(step.id, { aiConfig: { expectedKeywords: e.target.value.split(',').map(s => s.trim()) } })}
                                             />
                                             <p className="text-[10px] text-slate-400 mt-1">Separa con comas. Si el cliente dice esto, avanza al siguiente paso.</p>
                                          </div>
                                          <div>
                                             <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Respuesta de Corrección:</label>
                                             <textarea 
                                               className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white h-20 text-sm resize-none"
                                               placeholder="Ej. Entendido, pero necesito saber si eres Uber o Didi para continuar."
                                               value={step.aiConfig.offTrackReply}
                                               onChange={(e) => updateStepConfig(step.id, { aiConfig: { offTrackReply: e.target.value } })}
                                             ></textarea>
                                             <p className="text-[10px] text-slate-400 mt-1">Si pregunta otra cosa, la IA responderá la duda corta y luego dirá esto.</p>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                               )}

                               {/* 4. FOLLOW UP SEQUENCE */}
                               <div className="mb-6">
                                  <div className="flex items-center justify-between mb-4">
                                    <h5 className="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-2">
                                        <Icon name="clock" size={20} className="text-indigo-500"/> Secuencia de Seguimiento
                                    </h5>
                                    <button onClick={() => handleAddFollowUp(step.id)} className="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2">
                                      <Icon name="add-user" size={16} /> Agregar Recordatorio
                                    </button>
                                  </div>
                                  
                                  <div className="space-y-4 pl-0 md:pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2 md:ml-4">
                                     {step.followUpSequence.map((followUp, fIndex) => (
                                        <div key={followUp.id} className="relative pb-4 animate-in slide-in-from-left-2">
                                           <div className="absolute -left-[26px] top-6 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-full border-4 border-white dark:border-slate-800"></div>
                                           <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
                                                 <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-400 uppercase">ESPERAR:</span>
                                                    <input 
                                                      type="number" 
                                                      min="1"
                                                      value={followUp.delayValue}
                                                      onChange={(e) => updateFollowUp(step.id, followUp.id, { delayValue: parseInt(e.target.value) || 1 })}
                                                      className="w-16 p-2 text-center font-bold bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white border-transparent focus:border-indigo-500 outline-none"
                                                    />
                                                    <select 
                                                      value={followUp.delayUnit}
                                                      onChange={(e) => updateFollowUp(step.id, followUp.id, { delayUnit: e.target.value as any })}
                                                      className="p-2 font-bold bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white border-transparent focus:border-indigo-500 outline-none"
                                                    >
                                                       <option value="MINUTES">Minutos</option>
                                                       <option value="HOURS">Horas</option>
                                                       <option value="DAYS">Días</option>
                                                    </select>
                                                 </div>
                                                 <button onClick={() => handleDeleteFollowUp(step.id, followUp.id)} className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors">
                                                    <Icon name="trash" size={14} /> Eliminar
                                                 </button>
                                              </div>
                                              <div className="space-y-4">
                                                 <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Adjuntar Multimedia:</label>
                                                    {renderMediaSelector(followUp.mediaType, (type, name) => updateFollowUp(step.id, followUp.id, { mediaType: type, mediaName: name }))}
                                                 </div>
                                                 <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Mensaje:</label>
                                                    <textarea 
                                                      className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                                                      value={followUp.message}
                                                      onChange={(e) => updateFollowUp(step.id, followUp.id, { message: e.target.value })}
                                                      placeholder="Escribe el mensaje de seguimiento..."
                                                    />
                                                 </div>
                                              </div>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               </div>

                               {/* 5. FINAL ACTION: MOVE TO INACTIVE (NEW) */}
                               <div className="mb-6 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                                  <div className="flex justify-between items-center">
                                     <div>
                                        <h5 className="font-bold text-slate-600 dark:text-slate-300 text-lg flex items-center gap-2">
                                           <Icon name="archive" size={20}/> Acción Final
                                        </h5>
                                        <p className="text-xs text-slate-500 mt-1">Si después de todos los mensajes no contesta:</p>
                                     </div>
                                     <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm">
                                        <button 
                                          onClick={() => updateStepConfig(step.id, { moveToInactiveAfterFinish: false })}
                                          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${!step.moveToInactiveAfterFinish ? 'bg-slate-300 text-slate-700' : 'text-slate-400'}`}
                                        >
                                          Mantener
                                        </button>
                                        <button 
                                          onClick={() => updateStepConfig(step.id, { moveToInactiveAfterFinish: true })}
                                          className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all ${step.moveToInactiveAfterFinish ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400'}`}
                                        >
                                          Mover a 'Sin Respuesta'
                                        </button>
                                     </div>
                                  </div>
                               </div>

                            </div>
                         )}
                      </div>
                   );
                })}

             </div>

             {/* Footer Actions */}
             <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-4 shrink-0">
                <button 
                  onClick={() => setIsConfigOpen(false)}
                  className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                   <Icon name="save" size={24} /> GUARDAR TODO
                </button>
             </div>

          </div>
        </div>
      )}

    </div>
  );
};