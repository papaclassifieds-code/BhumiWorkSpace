import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LogOut, LayoutDashboard, History, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export default function Layout() {
  const { logout, dbUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-900">
      <nav className="h-20 lg:h-24 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-12 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <img 
            src="/logo.png" 
            alt="Bhumi WorkLife Logo" 
            className="h-10 lg:h-12 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden">
            <h1 className="text-lg lg:text-xl font-black tracking-tighter uppercase leading-none text-slate-900">Bhumi HR</h1>
            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 tracking-[0.3em] uppercase leading-none mt-1">WorkLife</p>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-8">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider capitalize">{dbUser?.role || 'Employee'}</p>
            <p className="text-sm font-black text-slate-900">{dbUser?.displayName || 'User'}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-12 py-0 hidden sm:block">
        <div className="flex justify-start gap-8">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex flex-row items-center gap-2 py-4 border-b-2 transition-colors",
              isActive ? "text-slate-900 border-slate-900" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">Dashboard</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => cn(
              "flex flex-row items-center gap-2 py-4 border-b-2 transition-colors",
              isActive ? "text-slate-900 border-slate-900" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            <History className="w-5 h-5" />
            <span className="text-sm font-black uppercase tracking-wider">History</span>
          </NavLink>
        </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 lg:px-8 py-8 pb-32 sm:pb-12">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-safe z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] sm:hidden">
        <div className="flex justify-around">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#1e293b]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">Dashboard</span>
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 p-2 transition-colors",
              isActive ? "text-[#1e293b]" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <History className="w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-wider">History</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
