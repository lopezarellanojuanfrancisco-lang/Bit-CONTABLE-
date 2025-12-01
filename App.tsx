

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LoginSelection } from './pages/LoginSelection';
import { Dashboard } from './pages/Dashboard';
import { ClientFile } from './pages/ClientFile';
import { Funnel } from './pages/Funnel';
import { ProspectFile } from './pages/ProspectFile';
import { Shop } from './pages/Shop'; // New Import
import { AccountantProfile } from './pages/AccountantProfile'; // New Import
import { Team } from './pages/Team'; // New Import
import { DownloadsCenter } from './pages/DownloadsCenter'; // NEW IMPORT
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { AdminAccountantFile } from './pages/AdminAccountantFile'; 
import { AdminFunnel } from './pages/AdminFunnel'; // NEW IMPORT
import { ClientPortal } from './pages/ClientPortal';
import { UserRole } from './types';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        
        {/* Entry Point */}
        <Route path="/" element={<LoginSelection />} />

        {/* SUPER ADMIN Routes */}
        <Route 
          path="/admin/*" 
          element={
            <Layout role={UserRole.SUPER_ADMIN}>
              <Routes>
                <Route path="/" element={<SuperAdminDashboard />} />
                <Route path="/embudo" element={<AdminFunnel />} /> {/* NEW ROUTE */}
                <Route path="/contador/:id" element={<AdminAccountantFile />} />
                <Route path="*" element={<Navigate to="/admin" />} />
              </Routes>
            </Layout>
          } 
        />

        {/* CONTADOR Routes (Main App) */}
        <Route 
          path="/contador/*" 
          element={
            <Layout role={UserRole.CONTADOR}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/descargas" element={<DownloadsCenter />} /> {/* NEW ROUTE */}
                <Route path="/embudo" element={<Funnel />} />
                <Route path="/cliente/:id" element={<ClientFile />} />
                <Route path="/prospecto/:id" element={<ProspectFile />} />
                <Route path="/tienda" element={<Shop />} />
                <Route path="/equipo" element={<Team />} /> {/* New Route */}
                <Route path="/perfil" element={<AccountantProfile />} /> 
                <Route path="*" element={<Navigate to="/contador" />} />
              </Routes>
            </Layout>
          } 
        />

        {/* CLIENTE FINAL Routes */}
        <Route 
          path="/portal/*" 
          element={
            <Layout role={UserRole.CLIENTE}>
              <Routes>
                <Route path="/" element={<ClientPortal />} />
                <Route path="*" element={<Navigate to="/portal" />} />
              </Routes>
            </Layout>
          } 
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </HashRouter>
  );
};

export default App;