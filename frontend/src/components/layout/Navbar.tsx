import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import CompanySearch from '../search/CompanySearch';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { logout } = useAuth();

  return (
    <header className="relative flex items-center justify-between px-8 py-3.5 z-40 border-b border-slate-800/80 backdrop-blur-xl bg-[#080d1a]/90 shadow-md h-20">
      <div className="flex items-center w-full max-w-2xl">
        <CompanySearch />
      </div>
      
      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 transition-all relative" aria-label="Notifications">
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></span>
        </button>
        <div className="w-px h-6 bg-slate-800 my-auto"></div>
        <button className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all flex items-center gap-2 border border-slate-700/40 px-3 py-1.5 bg-slate-900/60" aria-label="Profile">
          <User size={16} className="text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">Account</span>
        </button>
        <button onClick={logout} className="p-2 px-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1.5 text-xs font-semibold" aria-label="Logout">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
