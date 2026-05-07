import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Leaf, ShieldCheck } from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();

  if (user) {
    return <Navigate to="/" replace />;
  }

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
        
        <button
          onClick={login}
          className="w-full bg-[#1e293b] hover:bg-slate-800 text-white font-black uppercase tracking-widest text-sm py-4 px-4 rounded-xl transition-colors shadow-md flex flex-row items-center justify-center gap-3"
        >
          <ShieldCheck className="w-5 h-5"/>
          Continue with Google
        </button>
      </div>
      <p className="mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Employee Access Portal</p>
    </div>
  );
}
