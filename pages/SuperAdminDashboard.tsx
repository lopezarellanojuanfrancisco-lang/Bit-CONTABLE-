
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CONTADORES } from '../constants';
import { Icon } from '../components/Icon';
import { FrecuenciaPago } from '../types';

export const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // --- KPI CARDS COMPONENT ---
  const KPICard = ({ title, value, icon, gradient }: any) => (
    <div className={`relative overflow-hidden rounded-3xl p-6 shadow-lg bg-gradient-to-br ${gradient} text-white`}>
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className="text-white/70 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-extrabold">{value}</h3>
        </div>
        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
          <Icon name={icon} size={28} className="text-white" />
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
  );

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // FORM DATA (Solo Datos Básicos)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    rfc: ''
  });

  // --- LOGIC HELPERS ---
  const handleOpenModal = () => {
    setFormData({ nombre: '', email: '', whatsapp: '', rfc: '' });
    setIsModalOpen(true);
  };

  const handleCreateAccountant = () => {
    if (!formData.nombre || !formData.whatsapp) return alert('Nombre y WhatsApp requeridos');
    
    // Simulación de creación
    alert(`
      ¡Contador Registrado Exitosamente!
      
      Nombre: ${formData.nombre}
      RFC: ${formData.rfc || 'N/A'}
      
      >> Se ha activado automáticamente una PRUEBA GRATUITA de 15 DÍAS.
      >> Puedes gestionar su plan y pagos desde su expediente.
    `);
    
    setIsModalOpen(false);
    // En una app real, aquí haríamos el POST a la API y luego navigate()
    // navigate('/admin/contador/new_id');
  };

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Panel Maestro
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Visión general del negocio y gestión de suscripciones.
        </p>
      </header>

      {/* Modern KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard title="Contadores Activos" value="42" icon="briefcase" gradient="from-slate-700 to-slate-900" />
        <KPICard title="Ingresos Mensuales" value="$128k" icon="dollar" gradient="from-emerald-500 to-teal-700" />
        <KPICard title="Pagos Pendientes" value="3" icon="alert" gradient="from-rose-500 to-pink-700" />
      </div>

      {/* Main Content Section */}
      <section className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-soft overflow-hidden">
        
        {/* Section Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Directorio de Contadores</h3>
            <p className="text-sm text-slate-500 mt-1">Administra accesos, planes y estados de cuenta.</p>
          </div>
          <button 
            onClick={handleOpenModal}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Icon name="add-user" className="mr-2" size={20}/>
            Nuevo Contador
          </button>
        </div>

        {/* Existing Table Code */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="p-6">Nombre / Despacho</th>
                <th className="p-6">Plan</th>
                <th className="p-6 text-center">Clientes</th>
                <th className="p-6">Estado</th>
                <th className="p-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {MOCK_CONTADORES.map((contador) => (
                <tr 
                  key={contador.id} 
                  onClick={() => navigate(`/admin/contador/${contador.id}`)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                >
                  <td className="p-6">
                    <p className="font-bold text-base text-slate-900 dark:text-white">{contador.nombre}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {contador.id}</p>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      contador.plan === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                      contador.plan === 'Intermedio' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {contador.plan}
                    </span>
                  </td>
                  <td className="p-6 text-center font-mono text-slate-600 dark:text-slate-400">{contador.clientes}</td>
                  <td className="p-6">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${contador.estado === 'Moroso' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                      <span className={`font-medium text-sm ${contador.estado === 'Moroso' ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {contador.estado}
                      </span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                     <div className="text-slate-300 group-hover:text-primary transition-colors"><Icon name="chevron-right" size={20} /></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden p-4 space-y-4">
           {MOCK_CONTADORES.map((contador) => (
             <div 
               key={contador.id}
               onClick={() => navigate(`/admin/contador/${contador.id}`)}
               className="bg-slate-50 dark:bg-slate-700/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 active:scale-95 transition-transform"
             >
                <div className="flex justify-between items-start mb-3">
                   <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{contador.nombre}</h4>
                      <p className="text-xs text-slate-400">ID: {contador.id}</p>
                   </div>
                   <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${contador.estado === 'Moroso' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {contador.estado}
                   </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500 dark:text-slate-400 font-medium">{contador.plan}</span>
                   <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
                      <Icon name="users" size={14} /> {contador.clientes}
                   </span>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* ========================================================== */}
      {/*              SIMPLE ADD ACCOUNTANT MODAL                   */}
      {/* ========================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registrar Contador</h3>
                   <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Se creará con 15 días de prueba gratis.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><Icon name="close" size={20}/></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-medium"
                    placeholder="Ej. Miguel Ángel López"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">RFC</label>
                  <input 
                    type="text" 
                    value={formData.rfc}
                    onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white uppercase font-medium"
                    placeholder="RFC del despacho (Opcional)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">WhatsApp (Usuario)</label>
                  <input 
                    type="tel" 
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-medium"
                    placeholder="55 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500 outline-none dark:text-white font-medium"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleCreateAccountant}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Icon name="check" size={20} />
                    CREAR Y DAR 15 DÍAS GRATIS
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
