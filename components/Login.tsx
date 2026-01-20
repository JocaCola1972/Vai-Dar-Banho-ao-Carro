
import React, { useState } from 'react';
import { ICONS, THEME } from '../constants';
import { Rocket, Sparkles } from 'lucide-react';

interface LoginProps {
  // Fix: Updated onLogin to return a Promise<boolean> to match the async handleLogin in App.tsx
  onLogin: (email: string, pass: string) => Promise<boolean>;
  loginImageUrl: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, loginImageUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Fix: Updated handleSubmit to be async so it can await the result of onLogin
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onLogin(email, password);
    if (!success) {
      setError(true);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${THEME.bg}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {loginImageUrl ? (
          <img src={loginImageUrl} alt="Login Background" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_50%)]"></div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-md p-10 glass rounded-[2.5rem] shadow-2xl border border-white/10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
            <Rocket size={38} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2 text-center">Vai dar banho ao carro</h1>
          <div className="flex items-center space-x-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
            <Sparkles size={12} className="text-cyan-400" />
            <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.2em]">Ready for Liftoff</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2 ml-1">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all outline-none"
              placeholder="pilot@cloud.io"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-400 mb-2 ml-1">Access Code</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 p-4 rounded-2xl text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-pulse">
              Invalid credentials. Try again, pilot.
            </div>
          )}

          <button
            type="submit"
            className={`w-full ${THEME.button} py-4 text-sm tracking-wider uppercase shadow-xl hover:shadow-cyan-500/30`}
          >
            Launch Interface
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 flex justify-center space-x-6">
          <div className="text-slate-500 hover:text-cyan-400 transition-colors">{ICONS.Cloud}</div>
          <div className="text-slate-500 hover:text-violet-400 transition-colors">{ICONS.Systems}</div>
          <div className="text-slate-500 hover:text-pink-400 transition-colors">{ICONS.Data}</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
