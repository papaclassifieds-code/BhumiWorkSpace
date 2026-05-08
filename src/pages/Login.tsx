import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Leaf, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await login();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completing. Please try again.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError(`Domain not authorized. Please add ${window.location.hostname} to your Firebase project's Authorized Domains.`);
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 text-slate-900">
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-slate-200 border border-slate-200 max-w-sm w-full text-center">
        <div className="mx-auto h-24 flex items-center justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Bhumi WorkLife Logo" 
            className="h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden bg-[#1e293b] w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-300">
            <div className="w-8 h-8 border-[3px] border-white rounded-md"></div>
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase leading-none mb-3">Bhumi HR</h1>
        <p className="text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase leading-none mb-10">WorkLife Portal</p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100 flex gap-2 text-left items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-[#1e293b] hover:bg-slate-800 disabled:opacity-70 text-white font-black uppercase tracking-widest text-sm py-4 px-4 rounded-xl transition-colors shadow-md flex flex-row items-center justify-center gap-3"
        >
          {isLoggingIn ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <ShieldCheck className="w-5 h-5"/>
          )}
          {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
        </button>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Employee Access Portal</p>
    </div>
  );
}
