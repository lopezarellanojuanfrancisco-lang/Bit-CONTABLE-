import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_LINKS_CONTADOR, NAV_LINKS_ADMIN, NAV_LINKS_CLIENTE } from '../constants';
import { UserRole } from '../types';
import { Icon } from './Icon';

interface LayoutProps {
  children: React.ReactNode;
  role?: UserRole;
}

export const Layout: React.FC<LayoutProps> = ({ children, role = UserRole.CONTADOR }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Desktop Only
  const [isMobile, setIsMobile] = useState(false);
  const [isBottomSheetOpen, setBottomSheetOpen] = useState(false); // Mobile "More" Menu
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // On desktop, default sidebar to open
      if (!mobile) {
        setSidebarOpen(true);
        setBottomSheetOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) document.documentElement.classList.remove('dark');
    else document.documentElement.classList.add('dark');
  };

  const handleLogout = () => navigate('/');

  // Role Configuration
  let allLinks = NAV_LINKS_CONTADOR;
  let userName = 'Contador Miguel';
  let headerTitle = 'CONTADOR PRO';
  let gradientClass = 'bg-gradient-to-b from-primary to-primaryDark'; // Default Indigo

  if (role === UserRole.SUPER_ADMIN) {
    allLinks = NAV_LINKS_ADMIN;
    userName = 'Super Admin';
    headerTitle = 'ADMINISTRACIÓN';
    gradientClass = 'bg-gradient-to-b from-slate-800 to-slate-950'; 
  } else if (role === UserRole.CLIENTE) {
    allLinks = NAV_LINKS_CLIENTE;
    userName = 'Juan Chofer';
    headerTitle = 'MI PORTAL';
    gradientClass = 'bg-gradient-to-b from-emerald-600 to-emerald-800'; 
  }

  // LOGIC FOR BOTTOM BAR (Mobile)
  // We limit to 3 main links to ensure the 4th is always "More" (MoreHorizontal icon).
  // This guarantees the "Logout" button (inside the sheet) is always accessible via "More".
  const maxMainLinks = 3;
  
  // We force "More" if there are more links than slots OR if we just want consistent layout
  // In this design, we will use the 4th slot for "More" if there are > 3 links.
  const showMoreButton = allLinks.length > maxMainLinks;
  
  const mainLinks = showMoreButton ? allLinks.slice(0, maxMainLinks) : allLinks;
  const secondaryLinks = showMoreButton ? allLinks.slice(maxMainLinks) : [];

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row ${isDarkMode ? 'dark bg-dark' : 'bg-slate-50'}`}>
      
      {/* =========================================
          DESKTOP SIDEBAR (Hidden on Mobile)
      ========================================= */}
      <aside className={`
        hidden lg:flex flex-col h-screen sticky top-0 z-50 transition-all duration-300 ease-out shadow-2xl
        ${gradientClass} text-white
        ${isSidebarOpen ? 'w-[280px]' : 'w-[88px]'}
      `}>
        {/* Logo Area */}
        <div className="h-24 flex items-center justify-between px-6">
           <div className={`font-extrabold text-xl tracking-wider transition-opacity duration-200 ${!isSidebarOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            {headerTitle.split(' ')[0]}<span className="opacity-50">{headerTitle.split(' ')[1]}</span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 py-4 hide-scrollbar">
          {allLinks.map((link) => {
            const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`
                  w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-white text-primaryDark shadow-glow font-bold' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }
                  ${!isSidebarOpen ? 'justify-center' : ''}
                `}
                title={link.label}
              >
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary' : ''} ${!isSidebarOpen ? '' : 'mr-4'}`}>
                   <Icon name={link.icon as any} size={24} />
                </div>
                <span className={`text-base whitespace-nowrap overflow-hidden transition-all duration-300 ${!isSidebarOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}`}>
                  {link.label}
                </span>
                {!isSidebarOpen && isActive && (
                  <div className="absolute right-2 top-2 w-2 h-2 bg-accent rounded-full shadow-lg" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer Actions */}
        <div className="p-6 space-y-4">
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)} 
             className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
           >
              <Icon name={isSidebarOpen ? 'menu' : 'chevron-right'} size={24} />
           </button>
           <button onClick={handleLogout} className={`w-full flex items-center p-3 rounded-xl text-red-200 hover:bg-red-500/20 hover:text-red-100 transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`}>
             <Icon name="logout" size={24} />
             {isSidebarOpen && <span className="ml-3 font-semibold">Salir</span>}
           </button>
        </div>
      </aside>


      {/* =========================================
          MOBILE TOP BAR (Minimal Header - No Hamburger)
      ========================================= */}
      <header className="lg:hidden flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <h1 className="font-black text-xl tracking-tight text-slate-800 dark:text-white">
          {headerTitle.split(' ')[0]}<span className="text-primary">{headerTitle.split(' ')[1]}</span>
        </h1>
        <button onClick={toggleTheme} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors active:scale-95">
          <Icon name={isDarkMode ? 'sun' : 'moon'} size={20} />
        </button>
      </header>


      {/* =========================================
          MAIN CONTENT AREA
      ========================================= */}
      <main className="flex-1 w-full max-w-[100vw] overflow-hidden bg-slate-50 dark:bg-dark relative">
        <div className="h-full p-4 pb-28 lg:p-10 lg:pb-10 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </main>


      {/* =========================================
          MOBILE BOTTOM NAVIGATION (Fixed)
      ========================================= */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-40 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex justify-around items-center px-2 py-3">
          
          {/* Main Links Loop */}
          {mainLinks.map((link) => {
             const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
             return (
               <button
                 key={link.path}
                 onClick={() => {
                   setBottomSheetOpen(false);
                   navigate(link.path);
                 }}
                 className="flex flex-col items-center justify-center w-full space-y-1 active:scale-90 transition-transform group"
               >
                 <div className={`
                    p-2 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800'}
                 `}>
                   <Icon name={link.icon as any} size={24} className={isActive ? 'stroke-[2.5px]' : ''} />
                 </div>
                 <span className={`text-[10px] font-bold ${isActive ? 'text-primary dark:text-white' : 'text-slate-400'}`}>
                   {link.label.split(' ')[0]}
                 </span>
               </button>
             );
          })}

          {/* "Más" Button (Triggers Bottom Sheet) */}
          {showMoreButton && (
            <button
              onClick={() => setBottomSheetOpen(true)}
              className="flex flex-col items-center justify-center w-full space-y-1 active:scale-90 transition-transform group"
            >
              <div className={`
                 p-2 rounded-xl transition-all duration-300
                 ${isBottomSheetOpen ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:bg-slate-50 dark:group-hover:bg-slate-800'}
              `}>
                <Icon name="more" size={24} />
              </div>
              <span className={`text-[10px] font-bold ${isBottomSheetOpen ? 'text-primary dark:text-white' : 'text-slate-400'}`}>
                Más
              </span>
            </button>
          )}

        </div>
      </nav>


      {/* =========================================
          MOBILE BOTTOM SHEET (The "More" Menu)
      ========================================= */}
      {isMobile && (
        <>
          {/* Backdrop */}
          {isBottomSheetOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 z-50 backdrop-blur-sm transition-opacity"
              onClick={() => setBottomSheetOpen(false)}
            />
          )}

          {/* Sheet Panel */}
          <div className={`
            fixed bottom-0 left-0 w-full bg-slate-50 dark:bg-slate-800 z-[60] rounded-t-[2rem] shadow-2xl transition-transform duration-300 ease-out
            ${isBottomSheetOpen ? 'translate-y-0' : 'translate-y-full'}
            border-t border-slate-200 dark:border-slate-700 max-h-[85vh] overflow-y-auto flex flex-col
          `}>
            
            {/* Handle Bar */}
            <div className="w-full flex justify-center pt-4 pb-2 shrink-0" onClick={() => setBottomSheetOpen(false)}>
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>

            {/* User Profile Summary */}
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4 shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-white dark:ring-slate-700">
                {userName.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">{userName}</h3>
                <p className="text-sm text-emerald-600 font-bold flex items-center">
                   <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                   Sesión Activa
                </p>
              </div>
            </div>

            {/* Scrollable Content: Extra Links */}
            <div className="p-6 grid grid-cols-2 gap-4 overflow-y-auto">
              {secondaryLinks.map((link) => {
                 const isActive = location.pathname === link.path;
                 return (
                   <button
                     key={link.path}
                     onClick={() => {
                       setBottomSheetOpen(false);
                       navigate(link.path);
                     }}
                     className={`
                       flex flex-col items-center justify-center p-5 rounded-2xl border transition-all active:scale-95 shadow-sm
                       ${isActive 
                         ? 'bg-primary/5 border-primary text-primary shadow-inner' 
                         : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-primary/50'}
                     `}
                   >
                      <Icon name={link.icon as any} size={32} className="mb-3" />
                      <span className="font-bold text-sm text-center leading-tight">{link.label}</span>
                   </button>
                 );
              })}
            </div>

            {/* Fixed Bottom Action: LOGOUT */}
            <div className="p-6 pt-2 mt-auto shrink-0 bg-slate-50 dark:bg-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-sm border border-red-200 dark:border-transparent"
              >
                <Icon name="logout" size={24} />
                Cerrar Sesión
              </button>
            </div>
            
            {/* Safe Area Spacer for iPhone X+ */}
            <div className="h-4 w-full bg-slate-50 dark:bg-slate-800"></div>
          </div>
        </>
      )}

    </div>
  );
};