
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CONTADORES, MOCK_CHAT_HISTORY } from '../constants';
import { WhatsAppPanel, Message } from '../components/WhatsAppPanel';
import { Icon } from '../components/Icon';
import { FrecuenciaPago } from '../types';

export const AdminAccountantFile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'INFO' | 'CHAT'>('INFO');
  
  // Data Fetching Simulation
  const contadorOriginal = MOCK_CONTADORES.find(c => c.id === id);
  
  // --- LOCAL STATE FOR SIMULATION ---
  const [diasRestantes, setDiasRestantes] = useState(contadorOriginal?.estado === 'Moroso' ? 0 : 12);
  const [planActual, setPlanActual] = useState(contadorOriginal?.plan || 'Básico');
  const [clientesUsados, setClientesUsados] = useState(contadorOriginal?.clientes || 0);
  const [limiteClientes, setLimiteClientes] = useState(planActual === 'Básico' ? 10 : planActual === 'Intermedio' ? 50 : 150);
  const [estadoCuenta, setEstadoCuenta] = useState<'Activo' | 'Moroso' | 'Prueba'>(contadorOriginal?.estado === 'Moroso' ? 'Moroso' : 'Activo');
  
  // Historial de Pagos Mock
  const [historialPagos, setHistorialPagos] = useState([
     { date: '10 Oct 2023', amount: 6888, method: 'Transferencia' },
     { date: '10 Sep 2023', amount: 6888, method: 'Stripe' }
  ]);

  // Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Subscription Edit State
  const [selectedPlanTemplate, setSelectedPlanTemplate] = useState<'BASICO' | 'INTERMEDIO' | 'PREMIUM'>('BASICO');
  const [duration, setDuration] = useState<FrecuenciaPago>(1);
  
  // LOGIC: Auto-update price based on plan selection
  const getPrice = (plan: string) => {
     if (plan === 'BASICO') return 1888;
     if (plan === 'INTERMEDIO') return 6888;
     if (plan === 'PREMIUM') return 9888;
     return 0;
  };
  
  const [newPrice, setNewPrice] = useState(getPrice(selectedPlanTemplate));

  // Update price when template changes
  const handleTemplateChange = (plan: 'BASICO' | 'INTERMEDIO' | 'PREMIUM') => {
     setSelectedPlanTemplate(plan);
     setNewPrice(getPrice(plan));
  };

  // Chat State
  const initialMessages = id && MOCK_CHAT_HISTORY[id as keyof typeof MOCK_CHAT_HISTORY] ? MOCK_CHAT_HISTORY[id as keyof typeof MOCK_CHAT_HISTORY] : [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (text: string) => {
    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, newMessage]);
  };

  // --- BUSINESS LOGIC HANDLERS ---

  const handleExtenderPrueba = () => {
    if (window.confirm('¿Otorgar 15 días más de prueba a este contador?')) {
      setDiasRestantes(diasRestantes + 15);
      setEstadoCuenta('Prueba');
      alert('Se han agregado 15 días a la vigencia.');
    }
  };

  const handleConfirmPlanChange = () => {
    let newLimit = 10;
    let name = 'Básico';
    
    if (selectedPlanTemplate === 'INTERMEDIO') { newLimit = 50; name = 'Intermedio'; }
    if (selectedPlanTemplate === 'PREMIUM') { newLimit = 150; name = 'Premium'; }

    setPlanActual(name);
    setLimiteClientes(newLimit);
    setEstadoCuenta('Activo');
    setDiasRestantes(duration * 30); 
    
    setHistorialPagos([{ date: new Date().toLocaleDateString(), amount: newPrice, method: `Suscripción ${duration} Mes(es)` }, ...historialPagos]);

    alert(`Plan actualizado a ${name}. Vigencia extendida por ${duration} meses. Costo registrado: $${newPrice}`);
    setIsPlanModalOpen(false);
  };

  const handleRegistrarPago = () => {
      const monto = prompt('Monto Pagado:');
      if (!monto) return;
      
      setHistorialPagos([{ date: new Date().toLocaleDateString(), amount: parseFloat(monto), method: 'Registro Manual' }, ...historialPagos]);
      setDiasRestantes(diasRestantes + 30); 
      setEstadoCuenta('Activo');
      alert('Pago registrado exitosamente.');
  };

  const handleSuspender = () => {
    if (window.confirm('¿Estás seguro de suspender el acceso? El contador no podrá entrar.')) {
      setEstadoCuenta('Moroso');
      setDiasRestantes(0);
    }
  };

  if (!contadorOriginal) return <div>Contador no encontrado</div>;

  const porcentajeUso = Math.min(100, (clientesUsados / limiteClientes) * 100);
  const isDanger = diasRestantes <= 3 || estadoCuenta === 'Moroso';

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-[calc(100vh-60px)] -m-4 lg:m-0 p-4 lg:p-0">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <button onClick={() => navigate('/admin')} className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 transition-colors">
          <Icon name="chevron-right" className="rotate-180" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-3xl font-bold dark:text-white truncate">{contadorOriginal.nombre}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${estadoCuenta === 'Activo' ? 'bg-emerald-100 text-emerald-700' : estadoCuenta === 'Prueba' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
              {estadoCuenta}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">ID Cliente: {contadorOriginal.id}</p>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden mb-4 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm shrink-0">
        <button onClick={() => setActiveTab('INFO')} className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-colors ${activeTab === 'INFO' ? 'bg-slate-900 text-white shadow-md' : 'text-gray-500'}`}>SUSCRIPCIÓN</button>
        <button onClick={() => setActiveTab('CHAT')} className={`flex-1 py-3 text-center rounded-lg font-bold text-sm transition-colors ${activeTab === 'CHAT' ? 'bg-[#25D366] text-white shadow-md' : 'text-gray-500'}`}>WHATSAPP</button>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        
        {/* LEFT COLUMN */}
        <div className={`overflow-y-auto space-y-6 h-full pb-20 lg:pb-0 pr-1 custom-scrollbar ${activeTab === 'CHAT' ? 'hidden lg:block' : 'block'}`}>
          
          <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg ${isDanger ? 'bg-gradient-to-br from-rose-600 to-red-800' : 'bg-gradient-to-br from-slate-800 to-slate-900'}`}>
             <div className="relative z-10 flex justify-between items-start">
                <div>
                   <p className="opacity-80 font-bold text-xs uppercase tracking-widest mb-1">Vencimiento del Servicio</p>
                   <h2 className="text-4xl font-black mb-1">{diasRestantes} Días</h2>
                   <p className="text-sm opacity-90 font-medium">{diasRestantes === 0 ? 'Servicio Suspendido' : 'Restantes para el corte.'}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Icon name={isDanger ? 'alert' : 'check'} size={32} /></div>
             </div>
             <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
                <button onClick={handleRegistrarPago} className="bg-white text-slate-900 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg"><Icon name="dollar" size={16} /> REGISTRAR PAGO</button>
                <button onClick={handleExtenderPrueba} className="bg-white/10 text-white border border-white/30 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Icon name="clock" size={16} /> +15 DÍAS PRUEBA</button>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><Icon name="chart" className="text-indigo-500"/> Plan Actual: {planActual}</h3>
             </div>
             <div className="mb-2 flex justify-between text-sm font-bold text-slate-600 dark:text-slate-300">
                <span>{clientesUsados} Clientes Registrados</span><span>Límite: {limiteClientes}</span>
             </div>
             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden mb-6">
                <div className={`h-full rounded-full transition-all duration-500 ${porcentajeUso > 90 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${porcentajeUso}%` }}></div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setIsPlanModalOpen(true)} className="py-3 border-2 border-slate-100 dark:border-slate-600 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 transition-colors">Cambiar / Renovar Plan</button>
                <button onClick={handleSuspender} className="py-3 border-2 border-slate-100 dark:border-slate-600 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors">Suspender Cuenta</button>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700">
             <h3 className="font-bold text-slate-800 dark:text-white mb-4">Historial de Pagos</h3>
             <div className="space-y-3">
                {historialPagos.map((pago, idx) => (
                   <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex items-center gap-3">
                         <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><Icon name="check" size={16} /></div>
                         <div><p className="font-bold text-sm dark:text-white">{pago.date}</p><p className="text-xs text-slate-400">{pago.method}</p></div>
                      </div>
                      <div className="text-right"><p className="font-bold text-slate-800 dark:text-white">${pago.amount}</p><span className="text-xs text-indigo-500 font-bold flex items-center justify-end mt-1"><Icon name="download" size={10} className="mr-1"/> Voucher</span></div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className={`h-full lg:block border-l dark:border-slate-700 pl-0 lg:pl-6 ${activeTab === 'INFO' ? 'hidden' : 'block'}`}>
          <WhatsAppPanel contactName={contadorOriginal.nombre} messages={messages} onSendMessage={handleSendMessage} myRole="admin"/>
        </div>
      </div>

      {/* MODAL: CAMBIAR PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPlanModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Suscripción Premium</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><Icon name="close" size={20}/></button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* 1. Seleccionar Nivel */}
                <div className="space-y-4">
                  {[
                    { id: 'BASICO', label: 'Básico', clientes: 10, price: 1888, icon: 'users', roi: 'Para Iniciar' },
                    { id: 'INTERMEDIO', label: 'Intermedio', clientes: 50, price: 6888, icon: 'briefcase', roi: 'ROI 5x (Recomendado)' },
                    { id: 'PREMIUM', label: 'Premium', clientes: 150, price: 9888, icon: 'shield', roi: 'Automatización Total' }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => handleTemplateChange(plan.id as any)}
                      className={`
                          w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between
                          ${selectedPlanTemplate === plan.id 
                            ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 shadow-xl scale-[1.02]' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 hover:border-slate-300 text-slate-500'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl ${selectedPlanTemplate === plan.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-900'}`}>
                            <Icon name={plan.icon as any} size={24} />
                         </div>
                         <div className="text-left">
                            <p className="font-bold text-sm uppercase">{plan.label}</p>
                            <p className="text-xs opacity-70">{plan.clientes} Clientes</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-xl">${plan.price}</p>
                         <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full">{plan.roi}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* 2. Seleccionar Duración */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Frecuencia de Facturación</label>
                   <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          onClick={() => setDuration(m as FrecuenciaPago)}
                          className={`py-2 rounded-lg font-bold text-sm border-2 ${duration === m ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-500'}`}
                        >
                          {m} Mes{m > 1 ? 'es' : ''}
                        </button>
                      ))}
                   </div>
                </div>

                {/* 3. Precio Final Editable */}
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio Total a Cobrar (Editable)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                       <input 
                          type="number" 
                          value={newPrice} 
                          onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                          className="w-full pl-8 p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 font-bold text-lg dark:text-white"
                       />
                    </div>
                </div>

            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
               <button 
                 onClick={handleConfirmPlanChange}
                 className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
               >
                 <Icon name="check" size={20} />
                 CONFIRMAR NUEVO PLAN
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
