import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { 
  LogOut, 
  Menu, 
  Search, 
  Sun, 
  Moon,
  Bell,
  Settings
} from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, profile, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New support ticket received', time: '5m ago', unread: true },
    { id: 2, text: 'Product stock low: Urban Nomad', time: '1h ago', unread: true },
    { id: 3, text: 'New supplier registration', time: '2h ago', unread: false },
  ]);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const menuItems = [
    'Admin Dashboard',
    'Supplier Dashboard',
    'Product Management',
    'Stock Updates',
    'User Management',
    'Support Tickets',
    'Settings',
    'IndiaMART Suppliers'
  ];

  useEffect(() => {
    if (search.length > 1) {
      const filtered = menuItems.filter(item => 
        item.toLowerCase().includes(search.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [search]);

  if (!user) return null;

  return (
    <nav className="glass-panel sticky top-0 z-40 border-x-0 border-t-0 h-16">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center flex-1">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex relative max-w-md w-full ml-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="input-field w-full pl-10 py-1.5 text-sm"
                placeholder="Search menus, products, suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 glass-panel rounded-xl overflow-hidden shadow-2xl z-50">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => {
                        setSearch('');
                        setSuggestions([]);
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative"
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-blue-500 font-bold uppercase cursor-pointer hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl transition-all ${n.unread ? 'bg-blue-500/5 border border-blue-500/10' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                        <p className="text-sm text-slate-900 dark:text-white font-medium">{n.text}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-all">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>

            <Link to="/settings" className="p-2 text-slate-500 hover:text-blue-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-5 w-5" />
            </Link>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden sm:block"></div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">{profile?.displayName || 'User'}</span>
                <span className="text-[10px] text-slate-500 leading-tight uppercase tracking-wider">{profile?.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-500/10"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

