
import React, { useState } from 'react';
import { User, Registration, AppSettings, Car } from '../types';
import { getWeekId, exportToCSV } from '../utils';
import { Users, Calendar, Settings as SettingsIcon, Download, Plus, Trash2, Key, Filter, CheckCircle, Database, BarChart3, Activity } from 'lucide-react';
import { THEME } from '../constants';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, setUsers, registrations, setRegistrations, settings, setSettings 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'settings'>('users');
  const [historyFilter, setHistoryFilter] = useState('');

  const currentWeek = getWeekId();
  const weekRegistrations = registrations.filter(r => r.weekId === currentWeek);

  const handleOpenNow = () => {
    if (!settings.manualOpenWeeks.includes(currentWeek)) {
      setSettings(prev => ({
        ...prev,
        manualOpenWeeks: [...prev.manualOpenWeeks, currentWeek]
      }));
    }
  };

  const handleExport = () => {
    const data = weekRegistrations.map(r => {
      const u = users.find(user => user.id === r.userId);
      const c = u?.cars.find(car => car.id === r.carId);
      return {
        Week: r.weekId,
        Name: `${u?.firstName} ${u?.lastName}`,
        Phone: u?.phone,
        Car: `${c?.make} ${c?.model} (${c?.plate})`,
        Time: new Date(r.timestamp).toLocaleString()
      };
    });
    exportToCSV(data, `wash_registrations_${currentWeek}.csv`);
  };

  const handleCreateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: '123',
      role: 'user',
      cars: []
    };
    setUsers(prev => [...prev, newUser]);
    e.currentTarget.reset();
  };

  const handleResetPassword = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: '123' } : u));
    alert('Passcode reset to 123');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, loginImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Activity size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Master Interface</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Cloud Command</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleOpenNow}
            disabled={settings.manualOpenWeeks.includes(currentWeek)}
            className={`px-6 py-3 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all border ${settings.manualOpenWeeks.includes(currentWeek) ? 'border-white/5 text-slate-500 cursor-not-allowed' : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
          >
            {settings.manualOpenWeeks.includes(currentWeek) ? 'Protocol: Online' : 'Force Initialize'}
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-3 px-6 py-3 glass rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
          >
            <Download size={16} className="text-violet-400" />
            <span>Telemetry Export</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <BarChart3 className="text-cyan-400" size={24} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Efficiency</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-1">Week Capacity</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-white">{weekRegistrations.length}</span>
            <span className="text-xl font-bold text-slate-600 mb-1">/ {settings.weeklyCapacity}</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(100, (weekRegistrations.length / settings.weeklyCapacity) * 100)}%` }} 
            />
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <Users className="text-violet-400" size={24} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Population</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-1">Managed Users</p>
          <p className="text-4xl font-black text-white">{users.length}</p>
          <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold tracking-widest">Global Directory</p>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-lg bg-gradient-to-br from-violet-500/10 to-transparent">
          <div className="flex justify-between items-start mb-4">
            <Calendar className="text-pink-400" size={24} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timeframe</span>
          </div>
          <p className="text-xs text-slate-400 font-medium mb-1">Active Window</p>
          <p className="text-2xl font-black text-white font-mono uppercase">{currentWeek}</p>
          <div className="flex items-center space-x-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">System Live</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/10">
        <nav className="flex px-4 pt-4 space-x-2 border-b border-white/5 bg-white/5">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-t-2xl ${activeTab === 'users' ? 'bg-[#050a14] text-cyan-400 border-x border-t border-white/10 shadow-[0_-5px_15px_-5px_rgba(6,182,212,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Directory
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-t-2xl ${activeTab === 'history' ? 'bg-[#050a14] text-violet-400 border-x border-t border-white/10 shadow-[0_-5px_15px_-5px_rgba(139,92,246,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Logs
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all rounded-t-2xl ${activeTab === 'settings' ? 'bg-[#050a14] text-pink-400 border-x border-t border-white/10 shadow-[0_-5px_15px_-5px_rgba(236,72,153,0.2)]' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Core Settings
          </button>
        </nav>

        <div className="p-10 bg-[#050a14]/40">
          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <form onSubmit={handleCreateUser} className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-10 p-6 glass rounded-3xl border border-white/5">
                <input name="firstName" placeholder="First Name" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl outline-none focus:border-cyan-400" />
                <input name="lastName" placeholder="Last Name" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl outline-none focus:border-cyan-400" />
                <input name="email" type="email" placeholder="Work Email" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl outline-none focus:border-cyan-400" />
                <input name="phone" placeholder="Contact #" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl outline-none focus:border-cyan-400" />
                <button type="submit" className={`${THEME.button} py-4 text-xs tracking-widest uppercase`}>
                  Provision Account
                </button>
              </form>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                      <th className="py-6 px-4">Entity</th>
                      <th className="py-6 px-4">Frequency</th>
                      <th className="py-6 px-4">Permissions</th>
                      <th className="py-6 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map(u => (
                      <tr key={u.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                        <td className="py-6 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center font-bold text-cyan-400 group-hover:scale-110 transition-transform">
                              {u.firstName[0]}{u.lastName[0]}
                            </div>
                            <div>
                              <div className="text-white font-bold">{u.firstName} {u.lastName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-6 px-4 text-slate-400 font-medium">{u.phone}</td>
                        <td className="py-6 px-4">
                          <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full ${u.role === 'admin' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-6 px-4 text-right">
                          <div className="flex justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleResetPassword(u.id)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 hover:text-amber-400 transition-all" title="Reset Key">
                              <Key size={16} />
                            </button>
                            {u.role !== 'admin' && (
                              <button onClick={() => setUsers(prev => prev.filter(user => user.id !== u.id))} className="p-3 bg-white/5 rounded-xl hover:bg-red-500/20 hover:text-red-500 transition-all">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex mb-10">
                <div className="relative flex-1">
                  <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search logs by pilot, unit, or cycle..." 
                    className="w-full glass bg-white/5 border border-white/10 p-5 pl-14 text-sm rounded-[2rem] outline-none focus:border-violet-500 transition-all"
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                      <th className="py-6 px-4">Temporal Cycle</th>
                      <th className="py-6 px-4">Subject</th>
                      <th className="py-6 px-4">Hardware Profile</th>
                      <th className="py-6 px-4">Log Signature</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {registrations
                      .filter(r => {
                        const u = users.find(u => u.id === r.userId);
                        const c = u?.cars.find(c => c.id === r.carId);
                        const searchStr = `${r.weekId} ${u?.firstName} ${u?.lastName} ${c?.plate}`.toLowerCase();
                        return searchStr.includes(historyFilter.toLowerCase());
                      })
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map(r => {
                        const u = users.find(u => u.id === r.userId);
                        const c = u?.cars.find(c => c.id === r.carId);
                        return (
                          <tr key={r.id} className="hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                            <td className="py-6 px-4 font-mono text-violet-400 font-bold">{r.weekId}</td>
                            <td className="py-6 px-4 text-white font-bold">{u?.firstName} {u?.lastName}</td>
                            <td className="py-6 px-4">
                              <span className="text-cyan-400 font-bold bg-cyan-400/5 px-2 py-1 rounded-lg border border-cyan-400/10 mr-2">{c?.plate}</span>
                              <span className="text-slate-500 text-xs">{c?.make} {c?.model}</span>
                            </td>
                            <td className="py-6 px-4 text-slate-600 text-[11px] font-mono">
                              {new Date(r.timestamp).toISOString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-2xl space-y-12">
              <div className="glass p-8 rounded-[2rem] border border-white/10">
                <label className="block text-[11px] font-black uppercase tracking-widest text-pink-400 mb-6 flex items-center">
                  <Activity size={16} className="mr-2" /> Global Bandwidth (Slots)
                </label>
                <div className="flex items-center space-x-6">
                  <input 
                    type="number" 
                    className="bg-white/5 border border-white/10 p-5 w-40 rounded-2xl text-2xl font-black outline-none focus:border-pink-500"
                    value={settings.weeklyCapacity}
                    onChange={(e) => setSettings(prev => ({ ...prev, weeklyCapacity: parseInt(e.target.value) || 0 }))}
                  />
                  <div>
                    <p className="text-white font-bold">Weekly Units</p>
                    <p className="text-xs text-slate-500">Limits the number of concurrent wash protocols.</p>
                  </div>
                </div>
              </div>

              <div className="glass p-8 rounded-[2rem] border border-white/10">
                <label className="block text-[11px] font-black uppercase tracking-widest text-cyan-400 mb-6 flex items-center">
                  <Database size={16} className="mr-2" /> Interface Overlays
                </label>
                <div className="space-y-6">
                  {settings.loginImageUrl && (
                    <div className="relative group">
                      <img src={settings.loginImageUrl} alt="Login Preview" className="w-full h-40 object-cover rounded-3xl border border-white/10 shadow-lg" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl backdrop-blur-sm">
                        <button onClick={() => setSettings(prev => ({ ...prev, loginImageUrl: null }))} className="bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Wipe Background</button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-white/10 rounded-[2rem] hover:border-cyan-400/50 transition-colors bg-white/5 cursor-pointer" onClick={() => document.getElementById('img-upload')?.click()}>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden" 
                      id="img-upload" 
                    />
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4">
                      <Plus className="text-cyan-400" size={24} />
                    </div>
                    <p className="text-sm font-bold text-white">Upload Neural Background</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-2">Optimal 1920x1080</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
