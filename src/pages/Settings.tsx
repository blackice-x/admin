import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Mail, Shield, Save, Moon, Sun } from 'lucide-react';

export default function Settings() {
  const { profile, user, theme, toggleTheme } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Profile Section */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Profile Information</h2>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                <div className="flex items-center input-field w-full bg-slate-50 dark:bg-slate-900 opacity-60">
                  <Mail className="h-4 w-4 mr-2 text-slate-400" />
                  <span>{user?.email}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed from the panel.</p>
              </div>
              
              <div className="pt-4 flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                {message && (
                  <span className={message.includes('success') ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                    {message}
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="glass-panel p-6 rounded-2xl">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Preferences</h2>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? <Moon className="h-5 w-5 text-blue-400" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Appearance</p>
                  <p className="text-xs text-slate-500">Switch between light and dark mode</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl text-center">
            <div className="h-20 w-20 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-500 text-3xl font-black mx-auto mb-4">
              {profile?.displayName?.[0] || profile?.email?.[0].toUpperCase()}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.displayName || 'User'}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{profile?.role}</p>
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-left space-y-2">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Account Status</p>
              <span className="inline-block px-2 py-0.5 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase">
                {profile?.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
