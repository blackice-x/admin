import React, { useState, useEffect } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === 'admin' || profile.role === 'owner') navigate('/admin');
      else if (profile.role === 'supplier') navigate('/supplier');
    }
  }, [profile, loading, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with this email but a different sign-in method.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Console. Please add this URL to your Firebase Auth authorized domains.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setError('Signed out successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If logged in but not admin/supplier, show unauthorized message
  if (user && profile && profile.role === 'customer') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
        <div className="max-w-md w-full glass-panel p-8 rounded-2xl text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Lock className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Access Restricted</h2>
          <p className="text-slate-400">
            Your account ({user.email}) is currently registered as a customer. 
            Only Admins and Suppliers can access the management panels.
          </p>
          <div className="pt-4 space-y-3">
            <button onClick={handleSignOut} className="w-full btn-primary">
              Sign Out & Try Another Account
            </button>
            <p className="text-xs text-slate-500">
              Contact the administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 rounded-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
            MALABAR <span className="text-blue-500">X</span>
          </h1>
          <h2 className="text-lg font-medium text-slate-400">
            {isSignUp ? 'Create your management account' : 'Sign in to your dashboard'}
          </h2>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleEmailAuth}>
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="email"
                required
                className="input-field w-full pl-10"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <input
                type="password"
                required
                className="input-field w-full pl-10"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button type="submit" className="w-full btn-primary flex items-center justify-center">
            <LogIn className="h-5 w-5 mr-2" />
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <button
            onClick={() => {
              if (!email) {
                setError('Please enter your email address first.');
                return;
              }
              import('firebase/auth').then(({ sendPasswordResetEmail }) => {
                sendPasswordResetEmail(auth, email)
                  .then(() => setError('Password reset email sent!'))
                  .catch((err) => setError(err.message));
              });
            }}
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-[#020617] text-slate-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex justify-center items-center py-3 px-4 border border-slate-700 rounded-lg bg-slate-900 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          <Chrome className="h-5 w-5 mr-2 text-blue-500" />
          Google
        </button>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

