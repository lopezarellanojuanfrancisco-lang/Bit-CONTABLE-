
import React, { useState } from 'react';
import { Icon } from '../components/Icon';

export const ClientPortal: React.FC = () => {
  
  // AI CAMERA STATE
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [scanStep, setScanStep] = useState<'IDLE' | 'SCANNING' | 'ANALYZING' | 'RESULT_SUCCESS' | 'RESULT_ERROR'>('IDLE');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [ticketCategory, setTicketCategory] = useState<'GASTO' | 'VENTA' | null>(null);

  // LOGIC: Open Camera
  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setScanStep('IDLE');
    setCapturedImage(null);
    setTicketCategory(null);
  };

  // LOGIC: Capture & Analyze
  const handleCapture = () => {
    setScanStep('SCANNING');
    
    // Simulate Processing Delay
    setTimeout(() => {
      setScanStep('ANALYZING');
      
      // Simulate Result (90% Success, 10% Blur Error)
      setTimeout(() => {
        const isBlurry = Math.random() > 0.9;
        
        if (isBlurry) {
          setScanStep('RESULT_ERROR');
        } else {
          setScanStep('RESULT_SUCCESS');
        }
      }, 1500);

    }, 1000);
  };

  // LOGIC: Finalize
  const handleFinalize = (category: 'GASTO' | 'VENTA') => {
    setTicketCategory(category);
    // Here we would actually save to DB
    setTimeout(() => {
      alert("¡Listo! Tu factura fue registrada exitosamente. Gracias por enviarla.");
      setIsCameraOpen(false);
    }, 500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* Hero Card */}
      <header className="relative bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-8 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="relative z-10">
          <p className="opacity-80 font-semibold tracking-wide uppercase text-sm mb-2">Bienvenido de nuevo</p>
          <h2 className="text-4xl font-black tracking-tight mb-2">Juan Pérez</h2>
          <div className="inline-block bg-white/20 backdrop-blur-md rounded-lg px-3 py-1 text-sm font-bold">
            Régimen: Plataformas Tecnológicas
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
             <div className="bg-white text-emerald-600 p-3 rounded-full mr-4 w-12 h-12 flex items-center justify-center shrink-0 shadow-lg">
               <Icon name="check" size={24} />
             </div>
             <div>
               <p className="text-emerald-100 text-xs uppercase font-bold tracking-wider">Estado Fiscal</p>
               <p className="text-lg font-bold">Tus impuestos de MARZO están <span className="underline decoration-2 underline-offset-4">PAGADOS</span>.</p>
             </div>
          </div>
        </div>
        
        {/* Decorative blobs */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-emerald-400 rounded-full blur-[80px] opacity-40"></div>
        <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-teal-300 rounded-full blur-[80px] opacity-30"></div>
      </header>

      {/* Main Actions Grid - Mobile First */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upload Button */}
        <button 
          onClick={handleOpenCamera}
          className="group relative bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-soft hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center h-72 text-center hover:-translate-y-1"
        >
           <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-full text-emerald-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
             <Icon name="image" size={40} /> 
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-emerald-600 transition-colors">Subir Foto Ticket</h3>
           <p className="text-slate-500 text-sm px-6 leading-relaxed">Toma una foto a tus tickets. La IA la leerá por ti.</p>
        </button>

        {/* Facturas Button */}
        <button className="group bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-soft hover:shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center h-72 text-center hover:-translate-y-1">
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
             <Icon name="file" size={40} />
           </div>
           <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">Mis Facturas</h3>
           <p className="text-slate-500 text-sm px-6 leading-relaxed">Consulta y descarga tus declaraciones fiscales pasadas.</p>
        </button>

        {/* Contact Strip */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-soft border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
             <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 text-slate-500 dark:text-slate-300">
               <Icon name="users" size={28} />
             </div>
             <div className="text-center sm:text-left">
               <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Tu Contador Asignado</p>
               <h3 className="text-xl font-bold text-slate-800 dark:text-white">Despacho López y Asoc.</h3>
             </div>
           </div>
           
           <button className="w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center shadow-lg hover:shadow-green-500/30 transition-all active:scale-95">
             <Icon name="message" className="mr-2" size={20} />
             CONTACTAR
           </button>
        </div>

      </div>

      {/* ========================================================== */}
      {/*              AI CAMERA SIMULATION MODAL                    */}
      {/* ========================================================== */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
           
           {/* CAMERA UI */}
           <div className="relative w-full max-w-md h-full bg-black flex flex-col">
              
              {/* Header */}
              <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
                 <button onClick={() => setIsCameraOpen(false)} className="text-white p-2 rounded-full bg-black/20 backdrop-blur-md">
                    <Icon name="close" size={28} />
                 </button>
                 <span className="text-white font-bold text-sm bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">Modo IA Activado</span>
              </div>

              {/* Viewport */}
              <div className="flex-1 relative flex items-center justify-center bg-slate-900 overflow-hidden">
                 
                 {scanStep === 'IDLE' && (
                    <div className="flex flex-col items-center text-slate-500">
                       <Icon name="image" size={64} className="mb-4 opacity-50"/>
                       <p>Vista Previa de Cámara</p>
                    </div>
                 )}

                 {scanStep === 'SCANNING' && (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                       <div className="w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-[scan_2s_infinite]"></div>
                    </div>
                 )}

                 {scanStep === 'ANALYZING' && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-8 text-center backdrop-blur-sm">
                       <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                       <h3 className="text-xl font-bold">Analizando imagen...</h3>
                       <p className="text-slate-400 mt-2">La IA está leyendo los datos del ticket.</p>
                    </div>
                 )}

                 {/* RESULT: SUCCESS */}
                 {scanStep === 'RESULT_SUCCESS' && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                       <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                          <Icon name="check" size={40} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">¡Lectura Exitosa!</h3>
                       <p className="text-slate-500 mb-8">Se detectó un monto de <strong className="text-slate-800 dark:text-white">$500.00</strong> con fecha de hoy.</p>
                       
                       <p className="font-bold text-slate-400 uppercase text-xs mb-4">¿Qué tipo de movimiento es?</p>
                       
                       <div className="grid grid-cols-2 gap-4 w-full">
                          <button 
                            onClick={() => handleFinalize('GASTO')}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-2xl font-bold text-lg shadow-lg flex flex-col items-center gap-2"
                          >
                             <Icon name="shopping-bag" size={28} />
                             ES UN GASTO
                             <span className="text-[10px] opacity-80 font-normal">(Gasolina, Refacciones...)</span>
                          </button>
                          <button 
                            onClick={() => handleFinalize('VENTA')}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-2xl font-bold text-lg shadow-lg flex flex-col items-center gap-2"
                          >
                             <Icon name="dollar" size={28} />
                             ES UNA VENTA
                             <span className="text-[10px] opacity-80 font-normal">(Ingreso extra)</span>
                          </button>
                       </div>
                    </div>
                 )}

                 {/* RESULT: ERROR */}
                 {scanStep === 'RESULT_ERROR' && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center animate-in zoom-in-95">
                       <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                          <Icon name="alert" size={40} />
                       </div>
                       <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2">Imagen Borrosa</h3>
                       <p className="text-slate-500 mb-8">La IA no pudo leer los datos correctamente. Por favor intenta de nuevo con mejor luz.</p>
                       
                       <button 
                         onClick={() => setScanStep('IDLE')}
                         className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold shadow-lg"
                       >
                          REINTENTAR FOTO
                       </button>
                    </div>
                 )}

              </div>

              {/* Footer Controls (Only visible when IDLE) */}
              {scanStep === 'IDLE' && (
                 <div className="p-8 pb-12 flex justify-center items-center relative">
                    <button 
                      onClick={handleCapture}
                      className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] active:scale-95 transition-transform"
                    ></button>
                 </div>
              )}

           </div>
        </div>
      )}

    </div>
  );
};
