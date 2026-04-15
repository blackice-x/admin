import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Users, 
  MessageSquare, 
  BarChart3, 
  Truck, 
  ClipboardList,
  ChevronRight,
  Music
} from 'lucide-react';

import { cn } from '../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOGO_URL = "https://i.ibb.co/fVvSrTD1/Chat-GPT-Image-Apr-10-2026-10-47-43-PM-removebg-preview.png";

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, isAdmin, isSupplier } = useAuth();
  const location = useLocation();

  const adminLinks = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Inventory Control', href: '/admin/inventory', icon: ClipboardList },
    { name: 'Support Tickets', href: '/admin/support', icon: MessageSquare },
    { name: 'Sales Performance', href: '/admin/sales', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const supplierLinks = [
    { name: 'Dashboard', href: '/supplier', icon: LayoutDashboard },
    { name: 'My Products', href: '/supplier/products', icon: Package },
    { name: 'Stock Update', href: '/supplier/stock', icon: ClipboardList },
    { name: 'IndiaMART Info', href: '/supplier/indiamart', icon: Truck },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const links = isAdmin ? adminLinks : isSupplier ? supplierLinks : [];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 glass-panel border-y-0 border-l-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <Link to="/" className="flex items-center space-x-2" onClick={onClose}>
              <img src={LOGO_URL} alt="Malabar X" className="h-8 w-auto" referrerPolicy="no-referrer" />
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                MALABAR <span className="text-blue-500">X</span>
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center">
                    <Icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-500")} />
                    <span className="font-medium">{link.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-900/50">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-500 font-bold mr-3">
                {profile?.displayName?.[0] || profile?.email?.[0].toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile?.displayName || 'User'}</span>
                <span className="text-[10px] text-slate-500 truncate uppercase tracking-wider">{profile?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
