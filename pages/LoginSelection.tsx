import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, IconName } from '../components/Icon';

export const LoginSelection: React.FC = () => {
  const navigate = useNavigate();

  const RoleCard = ({ title, desc, icon, path, gradient }: { title: string, desc: string, icon: IconName, path: string, gradient: string }) => (
    <button 
      onClick={() => navigate(path)}
      className="group relative flex flex-col items-center p-8 rounded-[2rem] bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl w-full md:w-80 overflow-hidden text-left md:text-center"
    >
      <div className={`
        absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500
      `}></div>

      <div className={`
        mb-6 p-5 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-500 text-white
      `}>
        <Icon name={icon} size={40} />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h2>
      <p className="text-blue-100/80 text-sm leading-relaxed mb-8 h-10">{desc}</p>
      
      <div className="w-full py-3 rounded-xl bg-white/10 group-hover:bg-white text-white group-hover:text-primaryDark font-bold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2">
        Ingresar <Icon name="chevron-right" size={16} />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-6 font-sans">
      
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/30 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="z-10 text-center mb-16 max-w-2xl">
        <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-sm">
          Sistema Contable SaaS 2.0
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
          Contador<span className="text-indigo-400">Pro</span>
        </h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          La plataforma integral para contadores, clientes y administración. 
          Simple, accesible y conectada.
        </p>
      </div>

      <div className="z-10 flex flex-col md:flex-row gap-6 w-full max-w-6xl justify-center">
        
        {/* Super Admin */}
        <RoleCard 
          title="Administrador" 
          desc="Panel maestro de gestión de suscripciones y contadores."
          icon="settings" 
          path="/admin"
          gradient="from-slate-700 to-slate-900"
        />

        {/* Contador */}
        <RoleCard 
          title="Contador" 
          desc="Gestión profesional de clientes, impuestos y equipo."
          icon="briefcase" 
          path="/contador"
          gradient="from-indigo-500 to-indigo-700"
        />

        {/* Cliente / Subusuario */}
        <RoleCard 
          title="Cliente" 
          desc="Portal personal para facturas, tickets y estatus."
          icon="users" 
          path="/portal"
          gradient="from-emerald-500 to-emerald-700"
        />

      </div>

      <div className="z-10 mt-20 text-slate-500 text-sm font-medium">
        <p>© 2024 ContadorPro México. Seguridad y Accesibilidad Primero.</p>
      </div>
    </div>
  );
};