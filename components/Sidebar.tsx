
import React from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon, LayoutDashboard, Terminal, Cloud } from 'lucide-react';
import { THEME } from '../constants';

interface SidebarProps {
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onLogout }) => {
  return (
    <aside className="w-72 bg-transparent p-4 hidden md:flex flex-col h-full">
      <div className="glass rounded-[2rem] flex flex-col h-full border border-white/10 overflow-hidden">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cloud size={20} className="text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 leading-tight">
              Vai dar banho<br/>ao carro
            </span>
          </div>
          
          <div className="flex items-center space-x-4 p-4 glass rounded-2xl border border-white/5">
            <div className="w-12 h-12 bg-white/10 border border-white/10 rounded-full flex items-center justify-center overflow-hidden">
              <UserIcon size={22} className="text-cyan-400" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user.firstName}</p>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-cyan-400/10 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-4 ml-2">Console</p>
          <div className="space-y-1">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-transparent rounded-2xl text-cyan-400 text-sm font-bold cursor-pointer border border-cyan-500/20">
              <LayoutDashboard size={18} />
              <span>Main Console</span>
            </div>
          </div>
        </nav>

        <div className="p-6 mt-auto">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-5 py-4 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all text-sm font-bold rounded-2xl group"
          >
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
            <span>End Mission</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
