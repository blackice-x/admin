/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import SupplierDashboard from './pages/SupplierDashboard';

import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Inventory from './pages/Inventory';
import Support from './pages/Support';
import Suppliers from './pages/Suppliers';
import Sales from './pages/Sales';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#020617]">
      {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      
      <div className={user ? "flex-1 lg:ml-64 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen"}>
        {user && <Navbar onMenuClick={() => setIsSidebarOpen(true)} />}
        
        <main className="flex-1 overflow-x-hidden">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/support" element={<Support />} />
              <Route path="/admin/sales" element={<Sales />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['supplier', 'admin', 'owner']} />}>
              <Route path="/supplier" element={<SupplierDashboard />} />
              <Route path="/supplier/products" element={<SupplierDashboard />} />
              <Route path="/supplier/stock" element={<Inventory />} />
              <Route path="/supplier/indiamart" element={<Suppliers />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="/" element={
              user ? (
                (profile?.role === 'admin' || profile?.role === 'owner') ? <Navigate to="/admin" replace /> : <Navigate to="/supplier" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {user && (
          <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            &copy; {new Date().getFullYear()} Malabar X Admin Panel. All rights reserved.
          </footer>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}


