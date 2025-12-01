
import React, { useState } from 'react';
import { MOCK_EQUIPO } from '../constants';
import { Auxiliar, RolAuxiliar } from '../types';
import { Icon } from '../components/Icon';

export const Team: React.FC = () => {
  const [equipo, setEquipo] = useState<Auxiliar[]>(MOCK_EQUIPO);
  
  // ADD MODAL STATE
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<RolAuxiliar>(RolAuxiliar.BASICO);

  // RESET PASSWORD MODAL STATE
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [memberToReset, setMemberToReset] = useState<Auxiliar | null>(null);
  const [resetPasswordNew, setResetPasswordNew] = useState('');

  // --- HANDLERS FOR ADDING ---
  const handleAddMember = () => {
    if (!newName || !newUsername || !newPassword) return;

    const newMember: Auxiliar = {
      id: `aux_${Date.now()}`,
      nombre: newName,
      usuario: newUsername,
      contrasena: newPassword,
      rol: selectedRole,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };

    setEquipo([...equipo, newMember]);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setSelectedRole(RolAuxiliar.BASICO);
  };

  // --- HANDLERS FOR DELETING ---
  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar a este usuario? Ya no podrá entrar al sistema.')) {
      setEquipo(equipo.filter(m => m.id !== id));
    }
  };

  // --- HANDLERS FOR RESET PASSWORD ---
  const openResetModal = (member: Auxiliar) => {
    setMemberToReset(member);
    setResetPasswordNew(''); // Start empty
    setIsResetModalOpen(true);
  };

  const handleSaveNewPassword = () => {
    if (!memberToReset || !resetPasswordNew) return;

    // Update the password in the state
    const updatedEquipo = equipo.map(member => {
      if (member.id === memberToReset.id) {
        return { ...member, contrasena: resetPasswordNew };
      }
      return member;
    });

    setEquipo(updatedEquipo);
    alert(`¡Contraseña actualizada correctamente para ${memberToReset.nombre}!`);
    setIsResetModalOpen(false);
    setMemberToReset(null);
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mi Equipo</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 mt-2">
            Gestiona a tus auxiliares y controla lo que pueden ver.
          </p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
        >
          <Icon name="add-user" className="mr-2" size={20}/>
          AGREGAR AUXILIAR
        </button>
      </header>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {equipo.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
             
             {/* Role Badge */}
             <div className={`
               absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl text-xs font-bold uppercase tracking-wider
               ${member.rol === RolAuxiliar.AVANZADO ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}
             `}>
               {member.rol === RolAuxiliar.AVANZADO ? 'Full Access' : 'Básico'}
             </div>

             <div className="flex items-center gap-4 mb-6">
               <div className={`
                 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm
                 ${member.rol === RolAuxiliar.AVANZADO ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' : 'bg-slate-50 text-slate-500 dark:bg-slate-700'}
               `}>
                 {member.nombre.charAt(0)}
               </div>
               <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white">{member.nombre}</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">@{member.usuario}</p>
                 <p className="text-xs text-slate-400 mt-1">Clave: ••••••••</p>
               </div>
             </div>

             {/* Permissions List */}
             <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-6">
               <p className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-widest">Permisos Activos</p>
               <div className="flex flex-wrap gap-2">
                 <span className="px-2 py-1 rounded bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs font-bold text-slate-600 dark:text-slate-200 flex items-center">
                   <Icon name="file" size={12} className="mr-1"/> XML / Facturas
                 </span>
                 <span className="px-2 py-1 rounded bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 text-xs font-bold text-slate-600 dark:text-slate-200 flex items-center">
                   <Icon name="chart" size={12} className="mr-1"/> Contabilidad
                 </span>
                 {member.rol === RolAuxiliar.AVANZADO && (
                   <>
                    <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center">
                      <Icon name="message" size={12} className="mr-1"/> WhatsApp
                    </span>
                   </>
                 )}
               </div>
             </div>

             <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700 pt-4">
               <button 
                 onClick={() => openResetModal(member)}
                 className="text-slate-400 hover:text-primary font-bold text-sm flex items-center px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
               >
                 <Icon name="key" size={16} className="mr-2"/> Reset Clave
               </button>
               <button 
                 onClick={() => handleDelete(member.id)}
                 className="text-red-400 hover:text-red-600 font-bold text-sm flex items-center px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
               >
                 <Icon name="trash" size={16} className="mr-2"/> Eliminar
               </button>
             </div>
          </div>
        ))}
      </div>

      {/* ========================================================== */}
      {/*                ADD USER MODAL                              */}
      {/* ========================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Agregar Nuevo Auxiliar</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full hover:bg-slate-200"><Icon name="close" size={20}/></button>
              </div>

              <div className="space-y-6">
                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Nombre Completo</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-primary outline-none dark:text-white font-medium"
                      placeholder="Ej. Laura González"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Nombre de Usuario</label>
                    <input 
                      type="text" 
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-primary outline-none dark:text-white font-medium"
                      placeholder="Ej. laura_aux"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Contraseña Temporal</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full p-3 pl-10 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-primary outline-none dark:text-white font-mono"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Icon name="key" size={18} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 uppercase mb-4">Selecciona Nivel de Permisos</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Basic Role Card */}
                    <button 
                      onClick={() => setSelectedRole(RolAuxiliar.BASICO)}
                      className={`
                        p-4 rounded-2xl border-2 text-left transition-all relative
                        ${selectedRole === RolAuxiliar.BASICO 
                          ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60 hover:opacity-100'}
                      `}
                    >
                      {selectedRole === RolAuxiliar.BASICO && (
                        <div className="absolute top-2 right-2 text-primary"><Icon name="check" size={20}/></div>
                      )}
                      <div className="bg-slate-200 dark:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <Icon name="file" className="text-slate-600 dark:text-slate-300" size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Auxiliar Contable</h4>
                      <p className="text-xs text-slate-500 mb-3">Ideal para captura de datos.</p>
                      <ul className="space-y-1">
                        <li className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400"><Icon name="check" size={12} className="mr-1 text-green-500"/> Ver Facturas / XML</li>
                        <li className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400"><Icon name="check" size={12} className="mr-1 text-green-500"/> Ver Contabilidad</li>
                      </ul>
                    </button>

                    {/* Advanced Role Card */}
                    <button 
                      onClick={() => setSelectedRole(RolAuxiliar.AVANZADO)}
                      className={`
                        p-4 rounded-2xl border-2 text-left transition-all relative
                        ${selectedRole === RolAuxiliar.AVANZADO 
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10 shadow-md scale-[1.02]' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 opacity-60 hover:opacity-100'}
                      `}
                    >
                      {selectedRole === RolAuxiliar.AVANZADO && (
                        <div className="absolute top-2 right-2 text-purple-600"><Icon name="check" size={20}/></div>
                      )}
                      <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-full flex items-center justify-center mb-3">
                        <Icon name="shield" className="text-purple-600 dark:text-purple-300" size={20} />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1">Auxiliar Full / Gerente</h4>
                      <p className="text-xs text-slate-500 mb-3">Gestión completa de clientes.</p>
                      <ul className="space-y-1">
                        <li className="flex items-center text-xs font-bold text-purple-700 dark:text-purple-300"><Icon name="check" size={12} className="mr-1"/> TODO LO ANTERIOR</li>
                        <li className="flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400"><Icon name="check" size={12} className="mr-1 text-green-500"/> Chat WhatsApp</li>
                      </ul>
                    </button>

                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button 
                  onClick={handleAddMember}
                  disabled={!newName || !newUsername || !newPassword}
                  className="w-full py-4 bg-primary hover:bg-primaryDark disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95"
                >
                  CONFIRMAR Y AGREGAR
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/*              RESET PASSWORD MODAL                          */}
      {/* ========================================================== */}
      {isResetModalOpen && memberToReset && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setIsResetModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                 <Icon name="key" size={32} />
              </div>
              
              <h3 className="text-xl font-black text-center text-slate-900 dark:text-white mb-2">
                Restablecer Contraseña
              </h3>
              <p className="text-center text-slate-500 dark:text-slate-400 text-sm mb-6">
                Ingresa la nueva clave para <strong>{memberToReset.nombre}</strong>.
              </p>

              <div className="mb-6">
                 <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nueva Contraseña</label>
                 <div className="relative">
                   <input 
                     type="text" 
                     autoFocus
                     className="w-full p-4 pl-12 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-transparent focus:border-amber-500 outline-none dark:text-white font-mono text-lg"
                     placeholder="Nueva Clave..."
                     value={resetPasswordNew}
                     onChange={e => setResetPasswordNew(e.target.value)}
                   />
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Icon name="edit" size={20} />
                   </div>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button 
                   onClick={() => setIsResetModalOpen(false)}
                   className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={handleSaveNewPassword}
                   disabled={!resetPasswordNew}
                   className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                 >
                   Guardar
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
