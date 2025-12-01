

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CLIENTES, MOCK_CHAT_HISTORY, MOCK_EQUIPO } from '../constants';
import { Icon, IconName } from '../components/Icon';
import { WhatsAppPanel, Message } from '../components/WhatsAppPanel';
import { Nota, EtapaContable, SatCertificates, PagoCliente } from '../types';
import { SatDownloadModule } from '../components/SatDownloadModule';
import { AccountingModule } from '../components/AccountingModule'; // Importamos el módulo contable

type Tab = 'CONTABILIDAD' | 'XML' | 'TICKETS' | 'NOTAS' | 'MODULOS' | 'CHAT' | 'CERTIFICADOS' | 'PAGOS';

export const ClientFile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // DATA STATE
  const originalClient = MOCK_CLIENTES.find(c => c.id === id);
  const [clienteData, setClienteData] = useState(originalClient);
  
  // UI STATE
  const [activeTab, setActiveTab] = useState<Tab>('CONTABILIDAD');
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false); // Mobile toggle for extra info

  // MODALS STATE
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // EDITABLE FIELDS STATE
  const [currentEtapa, setCurrentEtapa] = useState<EtapaContable>(
    clienteData?.etapa || EtapaContable.PENDIENTE
  );
  const [currentResponsableId, setCurrentResponsableId] = useState<string>(
    clienteData?.responsableId || ''
  );

  // PAYMENT STATE
  const [payAmount, setPayAmount] = useState<string>('');
  const [payConcept, setPayConcept] = useState<string>('');
  const [voucherFile, setVoucherFile] = useState<string | null>(null);

  // CERTIFICATES STATE
  const [showKeyPass, setShowKeyPass] = useState(false);
  const [showCiecPass, setShowCiecPass] = useState(false);
  const [tempKeyPass, setTempKeyPass] = useState(clienteData?.satCertificados?.privateKeyPass || '');
  const [tempCiecPass, setTempCiecPass] = useState(clienteData?.satCertificados?.ciecPass || '');

  // CHAT STATE
  const initialMessages = id && MOCK_CHAT_HISTORY[id] ? MOCK_CHAT_HISTORY[id] : [];
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // NOTES STATE
  const [notes, setNotes] = useState<Nota[]>([
    { id: '1', autor: 'Auxiliar Contable', fecha: '10/10/2023 09:30 AM', texto: 'Se recibieron los estados de cuenta bancarios del mes anterior.' },
    { id: '2', autor: 'Contador Miguel', fecha: '05/10/2023 04:15 PM', texto: 'Cliente solicitó cambio de domicilio fiscal. Pendiente de enviar comprobante.' },
    ...(clienteData?.ultimaNota ? [{ id: '0', autor: 'Sistema', fecha: 'Reciente', texto: clienteData.ultimaNota }] : [])
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // --- HELPERS ---
  const getResponsableInfo = (auxId: string) => MOCK_EQUIPO.find(a => a.id === auxId) || null;
  const currentAux = getResponsableInfo(currentResponsableId);

  const getStatusColor = (etapa: EtapaContable) => {
    switch(etapa) {
      case EtapaContable.PENDIENTE: return 'bg-slate-100 text-slate-600 border-slate-200';
      case EtapaContable.INICIAR: return 'bg-blue-50 text-blue-600 border-blue-200';
      case EtapaContable.PRECIERRE: return 'bg-amber-50 text-amber-600 border-amber-200';
      case EtapaContable.AUTORIZAR: return 'bg-orange-50 text-orange-600 border-orange-200';
      case EtapaContable.TERMINADO: return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case EtapaContable.DEUDOR: return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-100';
    }
  };

  // --- HANDLERS ---
  const handleSendMessage = (text: string) => {
    const newMessage = { id: Date.now(), sender: 'contador', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMessage]);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: Nota = {
      id: Date.now().toString(),
      autor: 'Contador Miguel',
      fecha: new Date().toLocaleString([], {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'}),
      texto: newNoteText
    };
    setNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleStatusChange = (newEtapa: EtapaContable) => {
    setCurrentEtapa(newEtapa);
    setIsStatusModalOpen(false);
  };

  const handleAssignAuxiliar = (auxId: string) => {
    setCurrentResponsableId(auxId);
    setIsAssignModalOpen(false);
  };

  const updateClientCerts = (certs: SatCertificates) => {
    if (clienteData) setClienteData({ ...clienteData, satCertificados: certs });
  };

  const handleSavePasswords = () => {
    if (clienteData) {
       const newCerts: SatCertificates = {
           ...(clienteData.satCertificados || { hasCer: false, hasKey: false, hasPass: false, hasCiec: false }),
           hasPass: !!tempKeyPass, privateKeyPass: tempKeyPass, hasCiec: !!tempCiecPass, ciecPass: tempCiecPass,
           lastUpdated: new Date().toISOString().split('T')[0]
       };
       updateClientCerts(newCerts);
       alert('Contraseñas actualizadas correctamente.');
    }
  };

  const handleAddPayment = () => {
    if (!clienteData || !payAmount || !payConcept) return;
    const newPayment: PagoCliente = { id: `pay_${Date.now()}`, fecha: new Date().toLocaleDateString('es-MX'), monto: parseFloat(payAmount), concepto: payConcept, comprobanteUrl: voucherFile || undefined };
    setClienteData({ ...clienteData, historialPagos: [newPayment, ...(clienteData.historialPagos || [])] });
    setPayAmount(''); setPayConcept(''); setVoucherFile(null);
    alert('Honorario registrado correctamente.');
  };

  const handleUploadVoucher = () => {
    setTimeout(() => { setVoucherFile('comprobante_honorario.jpg'); alert('Comprobante adjuntado.'); }, 500);
  };

  // --- RENDER HELPERS ---
  const TabButton = ({ name, label, icon, special }: { name: Tab, label: string, icon: IconName, special?: boolean }) => {
    const isActive = activeTab === name;
    return (
      <button
        onClick={() => setActiveTab(name)}
        className={`
          relative flex items-center gap-2 px-1 py-3 border-b-2 transition-all font-bold text-sm mx-2
          ${isActive 
            ? 'border-primary text-primary dark:text-white dark:border-white' 
            : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}
        `}
      >
        <Icon name={icon} size={18} className={isActive ? 'text-primary dark:text-white' : ''} />
        <span className="whitespace-nowrap">{label}</span>
        {special && clienteData?.tieneMensajesNoLeidos && activeTab !== 'CHAT' && (
           <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-0 animate-pulse"></span>
        )}
      </button>
    );
  };

  if (!clienteData) return <div className="p-10 text-center">Cliente no encontrado</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      
      {/* ========================================================== */}
      {/* 1. UNIFIED HEADER (HERO SECTION) */}
      {/* ========================================================== */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          
          {/* Top Row: Back Btn + Identity + Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3 overflow-hidden">
               <button onClick={() => navigate('/contador')} className="p-2 -ml-2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300">
                 <Icon name="chevron-right" className="rotate-180" size={24} />
               </button>
               <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">{clienteData.nombre}</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <span className="font-mono">{clienteData.rfc}</span>
                     <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                     <span className="truncate">{clienteData.regimen}</span>
                  </div>
               </div>
            </div>

            {/* Desktop Actions Row */}
            <div className="hidden md:flex items-center gap-3">
               {/* Status Pill */}
               <button 
                  onClick={() => setIsStatusModalOpen(true)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:brightness-95 transition-all ${getStatusColor(currentEtapa)}`}
               >
                  {currentEtapa} <Icon name="edit" size={12} />
               </button>

               {/* Auxiliar Pill */}
               <button 
                  onClick={() => setIsAssignModalOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
               >
                  <Icon name="users" size={12} />
                  {currentAux ? currentAux.nombre.split(' ')[0] : 'Sin Asignar'}
               </button>

               {/* Chat Button */}
               <button 
                  onClick={() => setActiveTab('CHAT')}
                  className="px-4 py-2 bg-[#25D366] text-white rounded-full font-bold text-sm shadow-sm hover:bg-[#20bd5a] transition-all flex items-center gap-2"
               >
                  <Icon name="message" size={18} /> Chat
               </button>
            </div>
            
            {/* Mobile Actions Toggle */}
            <button 
               className="md:hidden flex items-center justify-between w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 text-sm font-bold"
               onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            >
               <span className="flex items-center gap-2"><Icon name="filter" size={16}/> Información y Estado</span>
               <Icon name="chevron-right" size={16} className={`transition-transform ${isHeaderExpanded ? '-rotate-90' : 'rotate-90'}`} />
            </button>
          </div>

          {/* Mobile Expanded Details (Drawer) */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${isHeaderExpanded ? 'max-h-64 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
             <div className="grid grid-cols-1 gap-3">
               <button onClick={() => setIsStatusModalOpen(true)} className={`w-full p-3 rounded-xl border text-left font-bold text-sm flex justify-between items-center ${getStatusColor(currentEtapa)}`}>
                  <span>Estado: {currentEtapa}</span>
                  <Icon name="edit" size={16}/>
               </button>
               <button onClick={() => setIsAssignModalOpen(true)} className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-left font-bold text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
                  <span>Resp: {currentAux ? currentAux.nombre : 'Sin Asignar'}</span>
                  <Icon name="users" size={16}/>
               </button>
               <button onClick={() => { setActiveTab('CHAT'); setIsHeaderExpanded(false); }} className="w-full p-3 bg-[#25D366] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md">
                  <Icon name="message" size={18}/> Abrir WhatsApp
               </button>
             </div>
          </div>

          {/* Navigation Tabs (Scrollable) */}
          <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 border-t border-slate-100 dark:border-slate-700 pt-1">
             <TabButton name="CONTABILIDAD" label="Contabilidad" icon="chart" />
             <TabButton name="XML" label="Facturas SAT" icon="download" />
             <TabButton name="NOTAS" label="Bitácora" icon="file" />
             <TabButton name="PAGOS" label="Honorarios" icon="dollar" />
             <TabButton name="CERTIFICADOS" label="Llaves" icon="key" />
             <TabButton name="MODULOS" label="Servicios" icon="briefcase" />
             <TabButton name="CHAT" label="WhatsApp" icon="message" special={true} />
             <TabButton name="TICKETS" label="Tickets" icon="image" />
          </div>

        </div>
      </div>

      {/* ========================================================== */}
      {/* 2. MAIN CONTENT CANVAS */}
      {/* ========================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`
           bg-white dark:bg-slate-800 rounded-[2rem] shadow-soft border border-slate-100 dark:border-slate-700 min-h-[500px] overflow-hidden flex flex-col
           ${activeTab === 'CHAT' ? 'bg-[#efeae2] dark:bg-slate-900 p-0' : 'p-6 lg:p-8'}
        `}>
           
           {/* -- TAB: CONTABILIDAD -- */}
           {activeTab === 'CONTABILIDAD' && (
             <AccountingModule />
           )}

           {/* -- TAB: XML (SAT) -- */}
           {activeTab === 'XML' && (
             <SatDownloadModule 
               clienteNombre={clienteData.nombre}
               clienteRfc={clienteData.rfc}
               certificados={clienteData.satCertificados}
               onUpdateCertificados={updateClientCerts}
             />
           )}

           {/* -- TAB: NOTAS -- */}
           {activeTab === 'NOTAS' && (
             <div className="max-w-3xl mx-auto w-full">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Bitácora de Seguimiento</h3>
               <div className="flex gap-4 mb-6">
                 <textarea 
                   value={newNoteText}
                   onChange={(e) => setNewNoteText(e.target.value)}
                   className="flex-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary dark:text-white resize-none h-24"
                   placeholder="Escribe una nueva nota..."
                 />
                 <button onClick={handleAddNote} disabled={!newNoteText.trim()} className="bg-primary text-white rounded-2xl w-24 font-bold flex flex-col items-center justify-center gap-1 hover:bg-primaryDark disabled:opacity-50 transition-all">
                    <Icon name="save" size={24} />
                    <span className="text-xs">GUARDAR</span>
                 </button>
               </div>
               <div className="space-y-4">
                  {notes.map(nota => (
                     <div key={nota.id} className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                        <p className="text-slate-800 dark:text-white whitespace-pre-wrap mb-2">{nota.texto}</p>
                        <div className="flex justify-between text-xs text-amber-700/60 dark:text-amber-500 font-bold uppercase">
                           <span>{nota.autor}</span>
                           <span>{nota.fecha}</span>
                        </div>
                     </div>
                  ))}
               </div>
             </div>
           )}

           {/* -- TAB: CHAT (Full Height) -- */}
           {activeTab === 'CHAT' && (
             <div className="h-[600px] lg:h-[700px] flex flex-col">
                <WhatsAppPanel 
                  contactName={clienteData.nombre}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  myRole="contador"
                />
             </div>
           )}

           {/* -- TAB: HONORARIOS -- */}
           {activeTab === 'PAGOS' && (
              <div className="max-w-4xl mx-auto w-full">
                 <div className="flex flex-col md:flex-row gap-8">
                    {/* Formulario */}
                    <div className="w-full md:w-1/3 space-y-4">
                       <h3 className="font-bold text-slate-800 dark:text-white">Registrar Nuevo Pago</h3>
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Concepto</label>
                            <input type="text" value={payConcept} onChange={e => setPayConcept(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none font-bold" placeholder="Mensualidad" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-400 uppercase">Monto</label>
                            <input type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 outline-none font-bold text-lg" placeholder="$0.00" />
                          </div>
                          <button onClick={handleUploadVoucher} className={`w-full py-3 border-2 border-dashed rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${voucherFile ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : 'border-slate-300 text-slate-400'}`}>
                             <Icon name={voucherFile ? 'check' : 'image'} size={16} /> {voucherFile ? 'Adjuntado' : 'Subir Voucher'}
                          </button>
                          <button onClick={handleAddPayment} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all">
                             REGISTRAR
                          </button>
                       </div>
                    </div>
                    {/* Lista */}
                    <div className="w-full md:w-2/3 space-y-4">
                       <h3 className="font-bold text-slate-800 dark:text-white">Historial</h3>
                       {(!clienteData.historialPagos || clienteData.historialPagos.length === 0) ? (
                          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-slate-400">Sin pagos registrados.</div>
                       ) : (
                          clienteData.historialPagos.map(p => (
                             <div key={p.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                   <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Icon name="dollar" size={20}/></div>
                                   <div>
                                      <p className="font-bold text-slate-900 dark:text-white">{p.concepto}</p>
                                      <p className="text-xs text-slate-500">{p.fecha}</p>
                                   </div>
                                </div>
                                <div className="text-right">
                                   <p className="font-bold text-lg text-slate-900 dark:text-white">${p.monto}</p>
                                   {p.comprobanteUrl && <span className="text-xs text-indigo-500 font-bold cursor-pointer hover:underline">Ver Voucher</span>}
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                 </div>
              </div>
           )}

           {/* -- TAB: CERTIFICADOS -- */}
           {activeTab === 'CERTIFICADOS' && (
              <div className="max-w-4xl mx-auto w-full">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Icon name="shield" className="text-indigo-500"/> Bóveda de Archivos
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Archivos */}
                    <div className="space-y-4">
                       <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                          <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">Archivos e.Firma</h4>
                          {/* Cer */}
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl mb-3 border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <Icon name="file" className={clienteData.satCertificados?.hasCer ? 'text-emerald-500' : 'text-slate-300'} />
                                <span className="text-sm font-bold truncate">{clienteData.satCertificados?.hasCer ? clienteData.satCertificados.cerFileName : 'Falta .CER'}</span>
                             </div>
                             {clienteData.satCertificados?.hasCer ? <Icon name="check" className="text-emerald-500"/> : <button className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold">Subir</button>}
                          </div>
                          {/* Key */}
                          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                             <div className="flex items-center gap-3 overflow-hidden">
                                <Icon name="key" className={clienteData.satCertificados?.hasKey ? 'text-emerald-500' : 'text-slate-300'} />
                                <span className="text-sm font-bold truncate">{clienteData.satCertificados?.hasKey ? clienteData.satCertificados.keyFileName : 'Falta .KEY'}</span>
                             </div>
                             {clienteData.satCertificados?.hasKey ? <Icon name="check" className="text-emerald-500"/> : <button className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg font-bold">Subir</button>}
                          </div>
                       </div>
                    </div>
                    {/* Contraseñas */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                       <h4 className="font-bold text-sm text-slate-500 uppercase mb-4">Credenciales</h4>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contraseña FIEL (Clave Privada)</label>
                          <div className="relative">
                             <input type={showKeyPass ? 'text' : 'password'} value={tempKeyPass} onChange={e => setTempKeyPass(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono text-sm bg-white dark:bg-slate-800" placeholder="•••••••" />
                             <button onClick={() => setShowKeyPass(!showKeyPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name={showKeyPass ? 'eye-off' : 'eye'} size={18}/></button>
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">Contraseña SAT (CIEC)</label>
                          <div className="relative">
                             <input type={showCiecPass ? 'text' : 'password'} value={tempCiecPass} onChange={e => setTempCiecPass(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 outline-none font-mono text-sm bg-white dark:bg-slate-800" placeholder="•••••••" />
                             <button onClick={() => setShowCiecPass(!showCiecPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name={showCiecPass ? 'eye-off' : 'eye'} size={18}/></button>
                          </div>
                       </div>
                       <button onClick={handleSavePasswords} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg mt-2">GUARDAR CREDENCIALES</button>
                    </div>
                 </div>
              </div>
           )}

           {/* -- TAB: MODULOS / SERVICIOS -- */}
           {activeTab === 'MODULOS' && (
              <div className="max-w-4xl mx-auto w-full">
                 <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Servicios Contratados</h3>
                 {clienteData.modulosActivos.length === 0 ? (
                    <div className="p-10 bg-slate-50 dark:bg-slate-900 rounded-3xl text-center">
                       <Icon name="shopping-bag" size={48} className="mx-auto text-slate-300 mb-4" />
                       <p className="text-slate-500 font-bold mb-4">Este cliente no tiene módulos extra.</p>
                       <button onClick={() => navigate('/contador/tienda')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Ir a la Tienda</button>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {clienteData.modulosActivos.map(mod => (
                          <div key={mod} className="p-4 rounded-2xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 flex items-center gap-4">
                             <div className="bg-green-200 dark:bg-green-800 p-3 rounded-full text-green-700 dark:text-green-100">
                                <Icon name="check" size={20} />
                             </div>
                             <div>
                                <h4 className="font-bold text-green-900 dark:text-green-100 uppercase">{mod.replace('mod_', '').replace('_', ' ')}</h4>
                                <p className="text-xs text-green-700 dark:text-green-300 font-bold">Activo</p>
                             </div>
                          </div>
                       ))}
                       <button onClick={() => navigate('/contador/tienda')} className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:text-indigo-500 text-slate-400 font-bold flex flex-col items-center justify-center gap-2 transition-all">
                          <Icon name="add-user" size={20} /> Vender Nuevo Servicio
                       </button>
                    </div>
                 )}
              </div>
           )}

           {/* -- TAB: TICKETS -- */}
           {activeTab === 'TICKETS' && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <Icon name="image" size={64} className="mb-4 opacity-50"/>
                 <h3 className="text-xl font-bold">Gestor de Tickets</h3>
                 <p>Próximamente disponible.</p>
              </div>
           )}

        </div>
      </div>

      {/* ========================================================== */}
      {/*              MODALS (Status / Assign)                      */}
      {/* ========================================================== */}
      {isStatusModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold mb-4 dark:text-white">Cambiar Estado</h3>
               <div className="space-y-2">
                  {Object.values(EtapaContable).map(etapa => (
                     <button key={etapa} onClick={() => handleStatusChange(etapa)} className={`w-full p-4 rounded-xl font-bold text-left flex justify-between border-2 ${currentEtapa === etapa ? 'border-slate-800 bg-slate-50 dark:border-white dark:bg-slate-700' : 'border-transparent bg-slate-100 dark:bg-slate-900'}`}>
                        {etapa} {currentEtapa === etapa && <Icon name="check" />}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {isAssignModalOpen && (
         <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAssignModalOpen(false)}>
            <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
               <h3 className="text-xl font-bold mb-4 dark:text-white">Asignar Responsable</h3>
               <div className="space-y-2 max-h-80 overflow-y-auto">
                  <button onClick={() => handleAssignAuxiliar('')} className={`w-full p-3 rounded-xl border-2 text-left font-bold ${!currentResponsableId ? 'border-red-500 bg-red-50' : 'border-transparent bg-slate-100'}`}>Sin Asignar</button>
                  {MOCK_EQUIPO.map(aux => (
                     <button key={aux.id} onClick={() => handleAssignAuxiliar(aux.id)} className={`w-full p-3 rounded-xl border-2 text-left font-bold flex justify-between ${currentResponsableId === aux.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent bg-slate-100'}`}>
                        <span>{aux.nombre}</span> {currentResponsableId === aux.id && <Icon name="check"/>}
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
