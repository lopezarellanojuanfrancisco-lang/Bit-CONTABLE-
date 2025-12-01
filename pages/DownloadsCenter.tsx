import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_GLOBAL_DOWNLOADS } from '../constants';
import { Icon } from '../components/Icon';
import { GlobalDownloadJob } from '../types';

export const DownloadsCenter: React.FC = () => {
  const navigate = useNavigate();

  // --- SORTING LOGIC: FINISHED FIRST ---
  // We want:
  // 1. COMPLETED jobs at the TOP
  // 2. Then IN_PROGRESS
  // 3. Then ERROR
  // Within COMPLETED, sort by finish time (descending - hypothetical)
  const sortedDownloads = [...MOCK_GLOBAL_DOWNLOADS].sort((a, b) => {
    // Map status to priority score (Higher number = Higher priority in display)
    const getScore = (status: string) => {
      if (status === 'COMPLETED') return 3;
      if (status === 'IN_PROGRESS') return 2;
      return 1; // ERROR
    };
    return getScore(b.status) - getScore(a.status);
  });

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (status === 'IN_PROGRESS') return 'bg-blue-50 text-blue-600 border-blue-200';
    return 'bg-rose-50 text-rose-600 border-rose-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'COMPLETED') return 'check';
    if (status === 'IN_PROGRESS') return 'download'; // Or loader logic
    return 'alert';
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
             <Icon name="activity" className="text-indigo-500" size={32} />
             Centro de Descargas
           </h2>
           <p className="text-lg text-slate-500 dark:text-slate-400 mt-1">
             Monitorea el progreso de descarga de todos tus clientes en tiempo real.
           </p>
        </div>
        <div className="flex gap-2">
           <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold text-sm border border-emerald-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Terminados: 2
           </div>
           <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm border border-blue-100 flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> En Proceso: 1
           </div>
        </div>
      </header>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-700 overflow-hidden">
         
         {/* Desktop Table Header */}
         <div className="hidden md:grid grid-cols-12 bg-slate-50 dark:bg-slate-700/50 p-4 text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
            <div className="col-span-4 pl-2">Cliente / RFC</div>
            <div className="col-span-2">Periodo</div>
            <div className="col-span-3 text-center">Resultados (I / G / R)</div>
            <div className="col-span-3 text-right pr-2">Estatus / Tiempos</div>
         </div>

         <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {sortedDownloads.map((job) => (
               <div 
                 key={job.id}
                 onClick={() => navigate(`/contador/cliente/${job.clienteId}`)}
                 className={`
                    group flex flex-col md:grid md:grid-cols-12 p-4 md:items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all cursor-pointer relative
                    ${job.status === 'COMPLETED' ? 'border-l-4 border-l-emerald-500 bg-emerald-50/10' : 'border-l-4 border-l-transparent'}
                 `}
               >  
                  {/* Column 1: Client Info */}
                  <div className="col-span-4 pl-2 mb-2 md:mb-0">
                     <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors">{job.clienteNombre}</h4>
                     <p className="text-xs text-slate-500 font-mono">{job.clienteRfc}</p>
                  </div>

                  {/* Column 2: Period */}
                  <div className="col-span-2 mb-2 md:mb-0">
                     <span className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                       {job.periodoLabel}
                     </span>
                  </div>

                  {/* Column 3: Stats Pills */}
                  <div className="col-span-3 flex items-center justify-start md:justify-center gap-2 mb-3 md:mb-0">
                     <div className="flex flex-col items-center min-w-[50px]">
                        <span className={`text-lg font-black ${job.breakdown.ingresos > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                           {job.breakdown.ingresos}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ing</span>
                     </div>
                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                     <div className="flex flex-col items-center min-w-[50px]">
                        <span className={`text-lg font-black ${job.breakdown.gastos > 0 ? 'text-rose-500' : 'text-slate-300'}`}>
                           {job.breakdown.gastos}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Gas</span>
                     </div>
                     <div className="w-px h-6 bg-slate-200 dark:bg-slate-600"></div>
                     <div className="flex flex-col items-center min-w-[50px]">
                        <span className={`text-lg font-black ${job.breakdown.retenciones > 0 ? 'text-purple-500' : 'text-slate-300'}`}>
                           {job.breakdown.retenciones}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Ret</span>
                     </div>
                  </div>

                  {/* Column 4: Status & Time */}
                  <div className="col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center pr-2">
                     <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-2 mb-1 ${getStatusColor(job.status)}`}>
                        {job.status === 'IN_PROGRESS' && <Icon name="download" size={12} className="animate-bounce"/>}
                        {job.status === 'COMPLETED' && <Icon name="check" size={12} />}
                        {job.status === 'ERROR' && <Icon name="alert" size={12} />}
                        {job.status === 'COMPLETED' ? 'Terminado' : job.status === 'IN_PROGRESS' ? 'Trabajando...' : 'Error'}
                     </div>
                     
                     <div className="text-right">
                        {job.status === 'COMPLETED' ? (
                           <p className="text-[10px] text-slate-400 font-bold">
                             Fin: {job.fechaFin}
                           </p>
                        ) : job.status === 'IN_PROGRESS' ? (
                           <p className="text-[10px] text-blue-400 font-bold animate-pulse">
                             Inicio: {job.fechaInicio}
                           </p>
                        ) : (
                           <button className="text-[10px] text-rose-500 font-bold underline">Reintentar</button>
                        )}
                     </div>
                  </div>

               </div>
            ))}
         </div>
      </div>

    </div>
  );
};