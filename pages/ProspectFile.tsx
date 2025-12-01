


import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_PROSPECTOS, MOCK_CHAT_HISTORY, DEFAULT_FUNNEL_CONFIG } from '../constants';
import { Icon, IconName } from '../components/Icon';
import { WhatsAppPanel, Message } from '../components/WhatsAppPanel';
import { EtapaEmbudo, SatCertificates, PagoProspecto, Cotizacion, CotizacionItem, MediaType, RegimenFiscal, ItemDeclaracionCero } from '../types';
import { RegularizationQuoteTemplate } from '../components/RegularizationQuoteTemplate';

type ViewSection = 'SEGUIMIENTO' | 'QUOTES' | 'DOCS' | 'PAGOS';
type Tab = 'CHAT' | ViewSection;

export const ProspectFile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const originalProspect = MOCK_PROSPECTOS.find(p => p.id === id);
  const [prospecto, setProspecto] = useState(originalProspect);
  
  // UNIFIED NAVIGATION STATE
  const [activeTab, setActiveTab] = useState<Tab>('CHAT'); 
  const [leftColumnView, setLeftColumnView] = useState<ViewSection>('SEGUIMIENTO');

  const initialMessages = id && MOCK_CHAT_HISTORY[id] ? MOCK_CHAT_HISTORY[id] : [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [targetStepId, setTargetStepId] = useState<number | null>(null);

  // --- CONVERSION STATE ---
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertData, setConvertData] = useState({
    regimen: RegimenFiscal.PLATAFORMAS,
    email: '',
    rfc: prospecto?.rfc || ''
  });

  // --- AI LOGIC STATE ---
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // --- CERTIFICATE LOGIC ---
  const [showKeyPass, setShowKeyPass] = useState(false);
  const [showCiecPass, setShowCiecPass] = useState(false);
  const [tempKeyPass, setTempKeyPass] = useState(prospecto?.satCertificados?.privateKeyPass || '');
  const [tempCiecPass, setTempCiecPass] = useState(prospecto?.satCertificados?.ciecPass || '');

  // --- PAYMENT LOGIC ---
  const [payAmount, setPayAmount] = useState<string>('');
  const [payConcept, setPayConcept] = useState<string>('');
  const [voucherFile, setVoucherFile] = useState<string | null>(null);

  // --- QUOTE LOGIC (REGULARIZATION) ---
  const [regMeses, setRegMeses] = useState<number>(12);
  const [regIngresos, setRegIngresos] = useState<number>(22000);
  const [regCostoHon, setRegCostoHon] = useState<number>(250);
  
  const [itemsCeros, setItemsCeros] = useState<ItemDeclaracionCero[]>([
     { id: 'item_1', texto: 'Debes año 2023', monto: 950 },
     { id: 'item_2', texto: 'Debes año 2024', monto: 950 },
     { id: 'item_3', texto: 'Debes año 2025', monto: 950 },
  ]);

  const handleAddItemCero = () => {
     const newItem: ItemDeclaracionCero = {
        id: `item_${Date.now()}`,
        texto: 'Debes año 20XX',
        monto: 950
     };
     setItemsCeros([...itemsCeros, newItem]);
  };

  const handleRemoveItemCero = (id: string) => {
     setItemsCeros(itemsCeros.filter(i => i.id !== id));
  };

  const handleUpdateItemCero = (id: string, field: keyof ItemDeclaracionCero, value: any) => {
     setItemsCeros(itemsCeros.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  // --- AI AGENT BRAIN ---
  const handleIncomingMessage = (text: string) => {
    // 1. Add user message to chat
    const userMsg = { id: Date.now(), sender: 'prospecto', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);

    // 2. Check if AI is active
    if (!prospecto?.aiAgentEnabled) return;

    // 3. Find current Step Configuration
    const currentConfig = DEFAULT_FUNNEL_CONFIG.find(s => s.mappedEtapa === prospecto.etapa);
    
    // If no AI config for this step, do nothing
    if (!currentConfig) return;

    // IF STEP IS DOCUMENT COLLECTOR, IGNORE CHAT LOGIC (It handles files only)
    if (currentConfig.isDocCollector) {
        if (text.toLowerCase().includes('subi') || text.toLowerCase().includes('listo')) {
           setIsAiProcessing(true);
           setTimeout(() => {
              setIsAiProcessing(false);
              sendAiMessage("Gracias. Estoy validando los archivos en el portal... Un momento.");
           }, 1500);
        }
        return; 
    }

    if (!currentConfig.aiConfig?.enabled) return;

    // 4. Simulate AI Thinking
    setIsAiProcessing(true);
    setTimeout(() => {
        setIsAiProcessing(false);
        processAiResponse(text, currentConfig);
    }, 1500);
  };

  const processAiResponse = (userText: string, stepConfig: any) => {
      const lowerText = userText.toLowerCase();
      const keywords = stepConfig.aiConfig.expectedKeywords || [];
      
      // FAQ Interception
      if (lowerText.includes('precio') || lowerText.includes('costo') || lowerText.includes('cuanto')) {
          sendAiMessage("Nuestros planes van desde $300 pesos mensuales.");
          setTimeout(() => {
             sendAiMessage(stepConfig.aiConfig.offTrackReply || "Retomando... " + stepConfig.aiConfig.triggerQuestion);
          }, 1000);
          return;
      }

      if (lowerText.includes('ubicacion') || lowerText.includes('donde')) {
          sendAiMessage("Estamos en el Centro, pero atendemos 100% en línea a todo México.");
          setTimeout(() => {
             sendAiMessage(stepConfig.aiConfig.offTrackReply || "Por favor, confírmame: " + stepConfig.aiConfig.triggerQuestion);
          }, 1000);
          return;
      }

      // Success Condition
      const matchesKeyword = keywords.some((kw: string) => lowerText.includes(kw));
      
      if (matchesKeyword) {
          sendAiMessage("¡Excelente! Gracias por confirmar.");
          const nextStepId = stepConfig.id + 1;
          const nextConfig = DEFAULT_FUNNEL_CONFIG.find(s => s.id === nextStepId);
          
          if (nextConfig) {
             setTimeout(() => {
                if (prospecto) {
                    setProspecto(prev => prev ? { ...prev, etapa: nextConfig.mappedEtapa } : null);
                    if (nextConfig.autoMessage.enabled) {
                        sendAiMessage(nextConfig.autoMessage.text);
                    }
                }
             }, 1000);
          }
      } else {
          sendAiMessage(stepConfig.aiConfig.offTrackReply || "Entiendo, pero para avanzar necesito saber: " + stepConfig.aiConfig.triggerQuestion);
      }
  };

  const sendAiMessage = (text: string) => {
      const aiMsg = { id: Date.now(), sender: 'contador', text: `🤖 ${text}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, aiMsg]);
  };

  // --- SMART PURSUIT GENERATOR ---
  const handleGenerateAiSuggestion = (): string => {
      if (!prospecto) return '';
      const currentConfig = DEFAULT_FUNNEL_CONFIG.find(s => s.mappedEtapa === prospecto.etapa);
      
      if (!currentConfig || !currentConfig.smartPursuitConfig?.enabled) {
          return `Hola ${prospecto.nombre}, ¿tienes alguna duda?`;
      }

      const { intensity } = currentConfig.smartPursuitConfig;
      const firstName = prospecto.nombre.split(' ')[0];

      if (intensity === 'LOW') {
          return `Hola ${firstName}, ¿pudiste revisar la información? Quedo pendiente por cualquier duda.`;
      } else if (intensity === 'MEDIUM') {
          return `Hola ${firstName}, sigo pendiente de tu caso. ¿Te gustaría agendar una llamada rápida para resolver dudas?`;
      } else {
          // HIGH
          return `${firstName}, estamos cerrando agenda para declaraciones de este mes. ¿Te aparto tu lugar o lo dejamos para después?`;
      }
  };

  // --- SIMULATE CLIENT UPLOAD (DOC COLLECTOR) ---
  const handleSimulateClientUpload = () => {
      if (!prospecto) return;
      const currentConfig = DEFAULT_FUNNEL_CONFIG.find(s => s.mappedEtapa === prospecto.etapa);
      
      if (currentConfig && currentConfig.isDocCollector) {
          sendAiMessage("📂 El sistema detectó carga de archivos. Validando en el SAT...");
          setIsAiProcessing(true);
          
          setTimeout(() => {
             setIsAiProcessing(false);
             const success = Math.random() > 0.3; // 70% success chance
             
             if (success) {
                 sendAiMessage("✅ Archivos Validados Correctamente. ¡Gracias!");
                 // AUTO ADVANCE
                 setTimeout(() => {
                    const nextStepId = currentConfig.id + 1;
                    const nextConfig = DEFAULT_FUNNEL_CONFIG.find(s => s.id === nextStepId);
                    if (nextConfig) {
                        setProspecto(prev => prev ? { ...prev, etapa: nextConfig.mappedEtapa } : null);
                        if (nextConfig.autoMessage.enabled) {
                            sendAiMessage(nextConfig.autoMessage.text);
                        }
                    }
                 }, 1000);
             } else {
                 sendAiMessage("❌ Error: La contraseña de la FIEL es incorrecta. Por favor intenta de nuevo.");
             }
          }, 2000);
      }
  };

  // --- EXISTING HANDLERS ---

  const handleSendMessage = (text: string) => {
    const newMessage = { id: Date.now(), sender: 'contador', text: text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMessage]);
  };

  const toggleFlag = (flag: 'esPosiblePago' | 'tienePendiente') => {
      if (!prospecto) return;
      setProspecto({ ...prospecto, [flag]: !prospecto[flag] });
  };

  const toggleAiAgent = () => {
      if (!prospecto) return;
      setProspecto({ ...prospecto, aiAgentEnabled: !prospecto.aiAgentEnabled });
  };

  // Helper to find config for a stage
  const getStepConfig = (etapa: EtapaEmbudo) => {
    return DEFAULT_FUNNEL_CONFIG.find(s => s.mappedEtapa === etapa);
  };
  
  const getStepConfigById = (id: number) => {
    return DEFAULT_FUNNEL_CONFIG.find(s => s.id === id);
  };

  const currentStepConfig = prospecto ? getStepConfig(prospecto.etapa) : null;

  const handleStageChange = () => {
     if (!targetStepId || !prospecto) return;
     const targetConfig = getStepConfigById(targetStepId);
     if (!targetConfig) return;

     setProspecto({ ...prospecto, etapa: targetConfig.mappedEtapa });
     
     if (targetConfig.autoMessage.enabled) {
        setTimeout(() => {
           const autoMsg = targetConfig.autoMessage;
           let text = `🤖 [AUTO] ${autoMsg.text}`;
           if (autoMsg.mediaType !== 'NONE') {
              text += `\n📎 ADJUNTO: ${autoMsg.mediaType} (${autoMsg.mediaName})`;
           }
           handleSendMessage(text);
        }, 500);
     }
     setTargetStepId(null);
  };

  const handleConvertToClient = () => {
    if (!prospecto) return;
    
    // Simulate API Call
    setTimeout(() => {
      alert(`
        ¡Felicidades! ${prospecto.nombre} es ahora un Cliente.
        
        > Expediente Creado
        > Régimen: ${convertData.regimen}
        > Certificados transferidos
        > Prospecto archivado del embudo
      `);
      
      // Navigate to "Client File" (Mocking ID 1 for demo purposes)
      navigate('/contador/cliente/1');
    }, 1000);
  };

  const handleAddPayment = () => {
    if (!prospecto || !payAmount || !payConcept) return;
    const newPayment: PagoProspecto = { id: `pay_${Date.now()}`, fecha: new Date().toLocaleDateString('es-MX'), monto: parseFloat(payAmount), concepto: payConcept, comprobanteUrl: voucherFile || undefined };
    setProspecto({ ...prospecto, historialPagos: [newPayment, ...(prospecto.historialPagos || [])] });
    setPayAmount(''); setPayConcept(''); setVoucherFile(null);
    alert('Pago registrado correctamente.');
  };

  const handleUploadVoucher = () => {
    setTimeout(() => { setVoucherFile('comprobante_pago.jpg'); alert('Comprobante adjuntado.'); }, 500);
  };

  const handleSavePasswords = () => {
    if (prospecto) {
       const newCerts: SatCertificates = {
           ...(prospecto.satCertificados || { hasCer: false, hasKey: false, hasPass: false, hasCiec: false }),
           hasPass: !!tempKeyPass, privateKeyPass: tempKeyPass, hasCiec: !!tempCiecPass, ciecPass: tempCiecPass,
           lastUpdated: new Date().toISOString().split('T')[0]
       };
       setProspecto({ ...prospecto, satCertificados: newCerts });
       alert('Contraseñas actualizadas correctamente.');
    }
  };

  // Helper to get media icon
  const getMediaIcon = (type: MediaType): IconName => {
     switch(type) {
        case 'VIDEO': return 'video';
        case 'AUDIO': return 'mic';
        case 'IMAGE': return 'image';
        case 'PDF': return 'file';
        default: return 'file';
     }
  };

  if (!prospecto) return <div>Prospecto no encontrado</div>;

  const targetConfig = targetStepId ? getStepConfigById(targetStepId) : null;

  // View Helpers
  const isViewVisible = (sectionName: string) => {
    // Logic: 
    // If ActiveTab matches (Mobile) -> Show
    // If LeftColumnView matches (Desktop) -> Show
    return activeTab === sectionName || leftColumnView === sectionName;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)] -m-4 lg:m-0 p-4 lg:p-0">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/contador/embudo')} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <Icon name="chevron-right" className="rotate-180" size={24}/>
          </button>
          <div>
            <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">{prospecto.nombre}</h1>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-extrabold uppercase tracking-wider border border-amber-200">
                    Prospecto
                </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{prospecto.telefono}</p>
          </div>
        </div>

        {/* CONVERT BUTTON */}
        <button 
          onClick={() => setIsConvertModalOpen(true)}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
           <Icon name="add-user" size={20} />
           CONVERTIR A CLIENTE
        </button>
      </div>

      {/* Tabs Mobile (Scrollable) */}
      <div className="flex lg:hidden mb-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm shrink-0 overflow-x-auto hide-scrollbar gap-1">
        <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 px-4 text-center rounded-lg font-bold text-xs uppercase whitespace-nowrap ${activeTab === 'CHAT' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-slate-400'}`}>WhatsApp</button>
        <button onClick={() => setActiveTab('SEGUIMIENTO')} className={`flex-1 py-3 px-4 text-center rounded-lg font-bold text-xs uppercase whitespace-nowrap ${activeTab === 'SEGUIMIENTO' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-slate-400'}`}>Seguimiento</button>
        <button onClick={() => setActiveTab('QUOTES')} className={`flex-1 py-3 px-4 text-center rounded-lg font-bold text-xs uppercase whitespace-nowrap ${activeTab === 'QUOTES' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-slate-400'}`}>Cotizar</button>
        <button onClick={() => setActiveTab('DOCS')} className={`flex-1 py-3 px-4 text-center rounded-lg font-bold text-xs uppercase whitespace-nowrap ${activeTab === 'DOCS' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-slate-400'}`}>Llaves</button>
        <button onClick={() => setActiveTab('PAGOS')} className={`flex-1 py-3 px-4 text-center rounded-lg font-bold text-xs uppercase whitespace-nowrap ${activeTab === 'PAGOS' ? 'bg-amber-500 text-white' : 'text-gray-500 dark:text-slate-400'}`}>Pagos</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* LEFT COLUMN: ACTIONS */}
        <div className={`
          w-full lg:w-1/2 flex flex-col gap-6 overflow-y-auto pb-20 lg:pb-0 custom-scrollbar
          ${(activeTab !== 'CHAT') ? 'flex' : 'hidden lg:flex'}
        `}>
           
           {/* DESKTOP TOGGLE */}
           <div className="hidden lg:flex bg-slate-200 dark:bg-slate-700 rounded-xl p-1 shrink-0">
              <button onClick={() => setLeftColumnView('SEGUIMIENTO')} className={`flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${leftColumnView === 'SEGUIMIENTO' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Etapas</button>
              <button onClick={() => setLeftColumnView('QUOTES')} className={`flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${leftColumnView === 'QUOTES' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Cotizar</button>
              <button onClick={() => setLeftColumnView('DOCS')} className={`flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${leftColumnView === 'DOCS' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Llaves</button>
              <button onClick={() => setLeftColumnView('PAGOS')} className={`flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${leftColumnView === 'PAGOS' ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-800 dark:text-white' : 'text-slate-500'}`}>Pagos</button>
           </div>

           {/* --- VIEW: SEGUIMIENTO (FUNNEL) --- */}
           {isViewVisible('SEGUIMIENTO') && (
             <>
               <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border-t-8 border-amber-500">
                  
                  {/* AI AGENT SWITCH */}
                  <div className="flex justify-between items-center mb-6 bg-slate-100 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                     <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-2">
                           <Icon name="brain" className={prospecto.aiAgentEnabled ? "text-emerald-500 animate-pulse" : "text-slate-400"} /> 
                           Agente IA
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{prospecto.aiAgentEnabled ? 'Respondiendo y avanzando automáticamente.' : 'Apagado. Control manual.'}</p>
                     </div>
                     <button 
                       onClick={toggleAiAgent}
                       className={`
                          w-14 h-8 rounded-full p-1 transition-colors relative
                          ${prospecto.aiAgentEnabled ? 'bg-emerald-500' : 'bg-slate-300'}
                       `}
                     >
                        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${prospecto.aiAgentEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                     </button>
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center justify-between">
                    <span>Etapa Actual</span>
                    <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-500">Paso {currentStepConfig?.id || '?'}</span>
                  </h3>
                  
                  {/* VISUAL FOR DOC COLLECTOR MODE */}
                  {currentStepConfig?.isDocCollector ? (
                     <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-2xl mb-6 border-2 border-orange-200 dark:border-orange-800 text-center animate-in zoom-in-95">
                        <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600">
                           <Icon name="file-warning" size={32} className="animate-pulse" />
                        </div>
                        <h4 className="text-xl font-black text-orange-700 dark:text-orange-400 uppercase">Esperando Sellos</h4>
                        <p className="text-sm text-orange-800 dark:text-orange-200 font-bold mt-2 mb-4">El embudo está pausado hasta recibir los archivos.</p>
                        
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-left text-sm text-slate-600 dark:text-slate-400 mb-4 border border-orange-100">
                           <p className="mb-2"><strong>La IA está solicitando:</strong></p>
                           <ul className="list-disc pl-4 space-y-1">
                              <li>Archivo .CER</li>
                              <li>Archivo .KEY</li>
                              <li>Contraseña</li>
                           </ul>
                        </div>

                        <button 
                           onClick={handleSimulateClientUpload}
                           className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                        >
                           <Icon name="download" size={20} /> Simular Carga de Cliente
                        </button>
                     </div>
                  ) : currentStepConfig?.smartPursuitConfig?.enabled ? (
                     // SMART PURSUIT VISUAL
                     <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl mb-6 border-2 border-emerald-200 dark:border-emerald-800 animate-in zoom-in-95 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                        <div className="relative z-10">
                           <div className="flex items-center gap-3 mb-2">
                              <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 p-2 rounded-lg">
                                 <Icon name="zap" size={24} />
                              </div>
                              <div>
                                 <h4 className="font-black text-emerald-800 dark:text-emerald-200 uppercase">Persecución Inteligente</h4>
                                 <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Modo: {currentStepConfig.smartPursuitConfig.intensity === 'HIGH' ? 'Alta (Diario)' : currentStepConfig.smartPursuitConfig.intensity === 'MEDIUM' ? 'Media (2/semana)' : 'Baja (1/semana)'}</p>
                              </div>
                           </div>
                           <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-2 mb-2">
                              La IA está haciendo seguimiento activo para cerrar la venta.
                           </p>
                           <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg text-xs font-mono text-emerald-800 dark:text-emerald-200 flex justify-between">
                              <span>Próximo toque:</span>
                              <span className="font-bold">Mañana 10:00 AM</span>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl mb-6 border border-amber-100 dark:border-amber-900/30 text-center">
                        <p className="font-black text-amber-600 dark:text-amber-400 text-lg uppercase tracking-wide">
                           {prospecto.etapa}
                        </p>
                     </div>
                  )}

                  {/* STAGE SELECTOR (Manual Override) */}
                  <p className="text-xs font-bold text-slate-400 uppercase mb-3">Mover manualmente:</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {DEFAULT_FUNNEL_CONFIG.map((step) => {
                        const isCurrent = step.mappedEtapa === prospecto.etapa;
                        const isSelected = targetStepId === step.id;
                        
                        return (
                          <button
                            key={step.id}
                            disabled={isCurrent}
                            onClick={() => setTargetStepId(isSelected ? null : step.id)}
                            className={`
                              w-full p-3 rounded-xl border-2 text-left transition-all relative
                              ${isCurrent ? 'bg-slate-100 dark:bg-slate-700 border-transparent opacity-50 cursor-not-allowed' : isSelected ? 'bg-indigo-50 border-indigo-500' : 'bg-white dark:bg-slate-800 border-slate-200'}
                            `}
                          >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isCurrent ? 'bg-slate-300 text-slate-600' : 'bg-slate-200 text-slate-500'}`}>
                                      {step.id}
                                    </div>
                                    <div>
                                       <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">{step.title}</span>
                                       {step.isDocCollector && <span className="text-[10px] text-orange-500 font-bold uppercase flex items-center gap-1"><Icon name="file-warning" size={10}/> Recolector</span>}
                                       {step.smartPursuitConfig?.enabled && !step.isDocCollector && <span className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1"><Icon name="zap" size={10}/> Smart Pursuit</span>}
                                    </div>
                                </div>
                              </div>
                          </button>
                        );
                    })}
                  </div>

                  {/* PREVIEW & CONFIRMATION CARD */}
                  {targetConfig && (
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 shadow-xl animate-in slide-in-from-bottom-4 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                        
                        <h4 className="font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
                           <Icon name="eye" size={18}/> Vista Previa de Envío
                        </h4>

                        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-700">
                           <p className="text-xs text-slate-400 font-bold uppercase mb-2">Esto recibirá el cliente:</p>
                           
                           {/* Message Preview */}
                           {targetConfig.autoMessage.enabled ? (
                              <div className="relative">
                                 {targetConfig.autoMessage.mediaType !== 'NONE' && (
                                    <div className="flex items-center gap-2 mb-2 bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600 w-fit">
                                       <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded text-indigo-600 dark:text-indigo-300">
                                          <Icon name={getMediaIcon(targetConfig.autoMessage.mediaType)} size={16}/> 
                                       </div>
                                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{targetConfig.autoMessage.mediaName || 'Archivo Adjunto'}</span>
                                    </div>
                                 )}
                                 <div className="bg-white dark:bg-slate-700 p-3 rounded-lg rounded-tl-none border border-slate-100 dark:border-slate-600 shadow-sm inline-block max-w-full">
                                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{targetConfig.autoMessage.text}</p>
                                 </div>
                              </div>
                           ) : (
                              <p className="text-sm text-slate-400 italic flex items-center gap-2">
                                 <Icon name="close" size={14}/> Sin mensaje automático configurado.
                              </p>
                           )}
                        </div>

                        <button onClick={handleStageChange} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
                          <Icon name="check" size={20} /> CONFIRMAR Y MOVER
                        </button>
                    </div>
                  )}

                  {/* FLAGS */}
                  <div className="h-px bg-slate-100 dark:bg-slate-700 w-full my-6"></div>
                  <div className="space-y-3">
                    <button onClick={() => toggleFlag('esPosiblePago')} className={`w-full flex items-center justify-between p-3 rounded-xl border-2 ${prospecto.esPosiblePago ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'}`}>
                        <div className="flex items-center gap-3"><Icon name="dollar" size={16} /> <span className="font-bold text-sm">Posible Pago</span></div>
                        {prospecto.esPosiblePago && <Icon name="check" className="text-emerald-500" size={20} />}
                    </button>
                  </div>

               </div>
             </>
           )}

           {/* --- VIEW: QUOTES --- */}
           {isViewVisible('QUOTES') && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft">
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6">Generador de Cotización</h3>
                 
                 <div className="space-y-4 mb-8 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h4 className="font-bold text-xs text-slate-500 uppercase mb-2">Datos Generales</h4>
                    <div className="grid grid-cols-3 gap-4">
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Meses Adeudo</label>
                          <input type="number" value={regMeses} onChange={e => setRegMeses(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg font-bold" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Ingresos Promedio</label>
                          <input type="number" value={regIngresos} onChange={e => setRegIngresos(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg font-bold" />
                       </div>
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Costo Honorarios</label>
                          <input type="number" value={regCostoHon} onChange={e => setRegCostoHon(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-slate-800 border rounded-lg font-bold" />
                       </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                       <div className="flex justify-between items-center mb-3">
                          <label className="font-bold text-xs text-slate-500 uppercase">Desglose de Años (Ceros)</label>
                          <button onClick={handleAddItemCero} className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded font-bold hover:bg-slate-300">+ Agregar Año</button>
                       </div>
                       <div className="space-y-2">
                          {itemsCeros.map((item, idx) => (
                             <div key={item.id} className="flex gap-2 items-center">
                                <input 
                                  type="text" 
                                  value={item.texto} 
                                  onChange={e => handleUpdateItemCero(item.id, 'texto', e.target.value)}
                                  className="flex-1 p-2 bg-white dark:bg-slate-800 border rounded-lg text-sm font-medium"
                                  placeholder="Ej. Debes año 2023"
                                />
                                <div className="relative w-24">
                                   <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                                   <input 
                                     type="number"
                                     value={item.monto}
                                     onChange={e => handleUpdateItemCero(item.id, 'monto', Number(e.target.value))}
                                     className="w-full p-2 pl-4 bg-white dark:bg-slate-800 border rounded-lg text-sm font-bold"
                                   />
                                </div>
                                <button onClick={() => handleRemoveItemCero(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded"><Icon name="trash" size={16}/></button>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* LIVE PREVIEW COMPONENT */}
                 <div className="mb-6 transform scale-95 origin-top">
                    <RegularizationQuoteTemplate 
                       data={{
                          nombreCliente: prospecto.nombre,
                          mesesAdeudo: regMeses,
                          ingresosPromedio: regIngresos,
                          costoHonorariosMensual: regCostoHon,
                          itemsCeros: itemsCeros
                       }}
                    />
                 </div>

                 <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                    <Icon name="message" size={20}/> ENVIAR PDF POR WHATSAPP
                 </button>
              </div>
           )}

           {/* --- VIEW: DOCS (LLAVES) --- */}
           {isViewVisible('DOCS') && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft">
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2">
                    <Icon name="key" className="text-amber-500" /> Bóveda de Claves
                 </h3>
                 <div className="space-y-6">
                    {/* Archivos */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">Archivos e.Firma</h4>
                        {/* Cer */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl mb-3 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Icon name="file" className={prospecto.satCertificados?.hasCer ? 'text-emerald-500' : 'text-slate-300'} />
                                <span className="text-sm font-bold truncate">{prospecto.satCertificados?.hasCer ? 'Archivo .CER Cargado' : 'Falta .CER'}</span>
                            </div>
                            {prospecto.satCertificados?.hasCer ? <Icon name="check" className="text-emerald-500"/> : <button className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold">Subir</button>}
                        </div>
                        {/* Key */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Icon name="key" className={prospecto.satCertificados?.hasKey ? 'text-emerald-500' : 'text-slate-300'} />
                                <span className="text-sm font-bold truncate">{prospecto.satCertificados?.hasKey ? 'Archivo .KEY Cargado' : 'Falta .KEY'}</span>
                            </div>
                            {prospecto.satCertificados?.hasKey ? <Icon name="check" className="text-emerald-500"/> : <button className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold">Subir</button>}
                        </div>
                    </div>
                    {/* Contraseñas */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">Credenciales</h4>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contraseña FIEL (Clave Privada)</label>
                            <div className="relative">
                                <input type={showKeyPass ? 'text' : 'password'} value={tempKeyPass} onChange={e => setTempKeyPass(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono text-sm bg-white dark:bg-slate-800" placeholder="•••••••" />
                                <button onClick={() => setShowKeyPass(!showKeyPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="show" size={18}/></button>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contraseña SAT (CIEC)</label>
                            <div className="relative">
                                <input type={showCiecPass ? 'text' : 'password'} value={tempCiecPass} onChange={e => setTempCiecPass(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono text-sm bg-white dark:bg-slate-800" placeholder="•••••••" />
                                <button onClick={() => setShowCiecPass(!showCiecPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="show" size={18}/></button>
                            </div>
                        </div>
                        <button onClick={handleSavePasswords} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg mt-2">GUARDAR CREDENCIALES</button>
                    </div>
                 </div>
              </div>
           )}

           {/* --- VIEW: PAGOS --- */}
           {isViewVisible('PAGOS') && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft">
                 <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-6 flex items-center gap-2">
                    <Icon name="dollar" className="text-emerald-500" /> Control de Pagos
                 </h3>
                 
                 <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 mb-8">
                    <h4 className="font-bold text-sm text-slate-500 uppercase">Registrar Anticipo / Pago</h4>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Concepto</label>
                        <input type="text" value={payConcept} onChange={e => setPayConcept(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none font-bold" placeholder="Asesoría Inicial" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase">Monto</label>
                        <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-lg" placeholder="$0.00" />
                    </div>
                    <button onClick={handleUploadVoucher} className={`w-full py-3 border-2 border-dashed rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${voucherFile ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-slate-300 text-slate-400'}`}>
                        <Icon name={voucherFile ? 'check' : 'image'} size={16} /> {voucherFile ? 'Adjuntado' : 'Subir Comprobante'}
                    </button>
                    <button onClick={handleAddPayment} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">
                        REGISTRAR PAGO
                    </button>
                 </div>

                 <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">Historial</h4>
                 <div className="space-y-3">
                    {(!prospecto.historialPagos || prospecto.historialPagos.length === 0) ? (
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400 text-sm">Sin pagos registrados.</div>
                    ) : (
                        prospecto.historialPagos.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Icon name="dollar" size={20}/></div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">{p.concepto}</p>
                                        <p className="text-xs text-slate-500">{p.fecha}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg text-slate-900 dark:text-white">${p.monto}</p>
                                    {p.comprobanteUrl && <span className="text-[10px] text-indigo-500 font-bold cursor-pointer hover:underline">Ver Voucher</span>}
                                </div>
                            </div>
                        ))
                    )}
                 </div>
              </div>
           )}

        </div>

        {/* RIGHT COLUMN: CHAT */}
        <div className={`w-full lg:w-1/2 h-full ${activeTab === 'CHAT' ? 'block' : 'hidden lg:block'}`}>
           {isAiProcessing && (
              <div className="bg-indigo-50 text-indigo-700 p-2 text-xs font-bold text-center animate-pulse">
                 🤖 La IA está escribiendo una respuesta...
              </div>
           )}
           <WhatsAppPanel 
             contactName={prospecto.nombre}
             messages={messages}
             onSendMessage={handleSendMessage}
             myRole="contador"
             onReceiveMessage={handleIncomingMessage} // Connect AI Brain
             onRequestAiSuggestion={currentStepConfig?.smartPursuitConfig?.enabled ? handleGenerateAiSuggestion : undefined} // Connect Smart Pursuit
           />
        </div>

      </div>

      {/* ========================================================== */}
      {/*              CONVERT TO CLIENT MODAL                       */}
      {/* ========================================================== */}
      {isConvertModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsConvertModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Convertir a Cliente</h3>
                <button onClick={() => setIsConvertModalOpen(false)} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 transition-colors"><Icon name="close" size={20}/></button>
             </div>

             <div className="p-8 space-y-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center gap-3">
                   <Icon name="check" className="text-emerald-500" size={24} />
                   <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-200 text-sm">El prospecto ha aceptado.</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Complete los datos para crear su expediente fiscal.</p>
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre del Cliente</label>
                   <input type="text" value={prospecto.nombre} disabled className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-transparent font-bold text-slate-500 cursor-not-allowed" />
                </div>

                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Régimen Fiscal</label>
                   <select 
                     className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 focus:border-emerald-500 outline-none font-bold text-slate-800 dark:text-white"
                     value={convertData.regimen}
                     onChange={(e) => setConvertData({ ...convertData, regimen: e.target.value as RegimenFiscal })}
                   >
                      <option value={RegimenFiscal.PLATAFORMAS}>Plataformas Tecnológicas</option>
                      <option value={RegimenFiscal.RESICO}>RESICO</option>
                      <option value={RegimenFiscal.RIF}>RIF</option>
                      <option value={RegimenFiscal.PERSONA_MORAL}>Persona Moral</option>
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">RFC</label>
                      <input 
                        type="text" 
                        value={convertData.rfc} 
                        onChange={(e) => setConvertData({...convertData, rfc: e.target.value.toUpperCase()})}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 focus:border-emerald-500 outline-none font-mono font-bold text-slate-800 dark:text-white uppercase"
                        placeholder="XAXX010101000"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Correo</label>
                      <input 
                        type="email" 
                        value={convertData.email} 
                        onChange={(e) => setConvertData({...convertData, email: e.target.value})}
                        className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-600 focus:border-emerald-500 outline-none font-bold text-slate-800 dark:text-white"
                        placeholder="cliente@email.com"
                      />
                   </div>
                </div>

                <button 
                  onClick={handleConvertToClient}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg"
                >
                   <Icon name="save" size={24} />
                   CREAR EXPEDIENTE
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};