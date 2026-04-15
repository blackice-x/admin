import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isSupplier: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isSupplier: false,
  theme: 'dark',
  toggleTheme: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          const isAdminEmail = firebaseUser.email === 'muhammadbadsha12378@gmail.com' || 
                               firebaseUser.email === 'alberttomy255@gmail.com' || 
                               firebaseUser.email === 'alberttomy255@gamil.com';
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (isAdminEmail && data.role !== 'admin' && data.role !== 'owner') {
              // Upgrade to admin/owner if email matches but role is different
              const newRole = firebaseUser.email.includes('alberttomy255') ? 'owner' : 'admin';
              await setDoc(docRef, { ...data, role: newRole }, { merge: true });
              setProfile({ ...data, role: newRole });
            } else {
              setProfile(data);
            }
          } else {
            // Create default profile if it doesn't exist
            const newProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: isAdminEmail ? (firebaseUser.email.includes('alberttomy255') ? 'owner' : 'admin') : 'customer',
              status: 'approved',
              createdAt: new Date().toISOString(),
            };
            await setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = React.useMemo(() => ({
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin' || profile?.role === 'owner',
    isSupplier: profile?.role === 'supplier',
    theme,
    toggleTheme,
  }), [user, profile, loading, theme]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
