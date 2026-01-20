
import React from 'react';
import { Shield, Cloud, Server, Database, Lock, Cpu } from 'lucide-react';

export const THEME = {
  bg: 'bg-[#050a14]',
  bgGradient: 'bg-gradient-to-br from-[#050a14] via-[#0d1b33] to-[#050a14]',
  text: 'text-slate-100',
  border: 'border-white/10',
  card: 'bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl',
  accent: 'text-cyan-400',
  button: 'bg-gradient-to-r from-cyan-500 to-violet-500 text-white hover:scale-105 transition-all duration-300 rounded-full font-bold shadow-lg shadow-cyan-500/20',
  input: 'bg-slate-900/50 border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white rounded-xl',
};

export const ICONS = {
  Security: <Shield size={20} className="text-emerald-400" />,
  Cloud: <Cloud size={20} className="text-cyan-400" />,
  Infrastructure: <Server size={20} className="text-violet-400" />,
  Data: <Database size={20} className="text-pink-400" />,
  Encryption: <Lock size={20} className="text-amber-400" />,
  Systems: <Cpu size={20} className="text-blue-400" />,
};

export const DEFAULT_CAPACITY = 10;
export const DEFAULT_PASSWORD = "123";
