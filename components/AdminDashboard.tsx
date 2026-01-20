
import React, { useState } from 'react';
import { User, Registration, AppSettings, Car } from '../types';
import { getWeekId, exportToCSV } from '../utils';
import { supabase } from '../supabase';
import { Users, Calendar, Settings as SettingsIcon, Download, Plus, Trash2, Key, Filter, CheckCircle, Database, BarChart3, Activity, X, Edit2 } from 'lucide-react';
import { THEME } from '../constants';

interface AdminDashboardProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  refreshData: () => Promise<void>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  users, setUsers, registrations, setRegistrations, settings, setSettings, refreshData 
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'history' | 'settings'>('users');
  const [historyFilter, setHistoryFilter] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const currentWeek = getWeekId();
  const weekRegistrations = registrations.filter(r => r.weekId === currentWeek);

  const handleOpenNow = async () => {
    const updatedWeeks = [...settings.manualOpenWeeks, currentWeek];
    const { error } = await supabase.from('settings').update({ manual_open_weeks: updatedWeeks }).eq('id', 1);
    if (!error) refreshData();
  };

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      first_name: formData.get('firstName'),
      last_name: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      password: editingUser ? editingUser.password : '123'
    };

    if (editingUser) {
      await supabase.from('profiles').update(userData).eq('id', editingUser.id);
    } else {
      await supabase.from('profiles').insert([userData]);
    }
    
    setShowUserModal(false);
    setEditingUser(null);
    refreshData();
  };

  const handleResetPassword = async (userId: string) => {
    const { error } = await supabase.from('profiles').update({ password: '123' }).eq('id', userId);
    if (!error) {
      alert('Password reset to 123');
      refreshData();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Eliminar este utilizador permanentemente?')) return;
    await supabase.from('profiles').delete().eq('id', userId);
    refreshData();
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Activity size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Master Interface</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">Central Command</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleOpenNow}
            disabled={settings.manualOpenWeeks.includes(currentWeek)}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border ${settings.manualOpenWeeks.includes(currentWeek) ? 'border-white/5 text-slate-500' : 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
          >
            {settings.manualOpenWeeks.includes(currentWeek) ? 'Protocol: Online' : 'Manual Open'}
          </button>
          <button onClick={() => exportToCSV(weekRegistrations, `wash_${currentWeek}.csv`)} className="flex items-center space-x-2 px-6 py-3 glass rounded-2xl text-[10px] font-black uppercase text-white hover:bg-white/10">
            <Download size={14} className="text-violet-400" />
            <span>Export Data</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Week Load</p>
          <div className="flex items-end space-x-2">
            <span className="text-4xl font-black text-white">{weekRegistrations.length}</span>
            <span className="text-lg font-bold text-slate-600 mb-1">/ {settings.weeklyCapacity}</span>
          </div>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Active Fleet</p>
          <p className="text-4xl font-black text-white">{users.length}</p>
        </div>
        <div className="glass p-8 rounded-[2rem] border border-white/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest">Active Frame</p>
          <p className="text-xl font-mono font-black text-violet-400">{currentWeek}</p>
        </div>
      </div>

      <div className="glass rounded-[2rem] overflow-hidden border border-white/10">
        <nav className="flex px-6 pt-6 space-x-4 border-b border-white/5 bg-white/5">
          <button onClick={() => setActiveTab('users')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'users' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-500'}`}>Directory</button>
          <button onClick={() => setActiveTab('history')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'history' ? 'border-violet-400 text-violet-400' : 'border-transparent text-slate-500'}`}>Logs</button>
          <button onClick={() => setActiveTab('settings')} className={`pb-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === 'settings' ? 'border-pink-400 text-pink-400' : 'border-transparent text-slate-500'}`}>Config</button>
        </nav>

        <div className="p-8">
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button onClick={() => { setEditingUser(null); setShowUserModal(true); }} className="flex items-center space-x-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-colors">
                  <Plus size={14} />
                  <span>Add Personnel</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                      <th className="pb-6">Profile</th>
                      <th className="pb-6">Role</th>
                      <th className="pb-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-white/5 group hover:bg-white/5">
                        <td className="py-6">
                          <p className="font-bold text-white">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        </td>
                        <td className="py-6">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-cyan-400/10 text-cyan-400' : 'bg-white/5 text-slate-400'}`}>{u.role}</span>
                        </td>
                        <td className="py-6 text-right space-x-2">
                          <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-2 text-slate-400 hover:text-white"><Edit2 size={16}/></button>
                          <button onClick={() => handleResetPassword(u.id)} className="p-2 text-slate-400 hover:text-amber-400"><Key size={16}/></button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <input 
                type="text" 
                placeholder="Search history (Plate, Name, Week)..." 
                className="w-full glass bg-white/5 p-4 rounded-xl text-sm outline-none focus:border-violet-400"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              />
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase text-slate-500 font-black tracking-widest border-b border-white/5">
                      <th className="pb-6">Week</th>
                      <th className="pb-6">Pilot</th>
                      <th className="pb-6">Vessel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations
                      .filter(r => {
                        const u = users.find(u => u.id === r.userId);
                        const c = u?.cars.find(c => c.id === r.carId);
                        const str = `${r.weekId} ${u?.firstName} ${u?.lastName} ${c?.plate}`.toLowerCase();
                        return str.includes(historyFilter.toLowerCase());
                      })
                      .map(r => {
                        const u = users.find(u => u.id === r.userId);
                        const c = u?.cars.find(c => c.id === r.carId);
                        return (
                          <tr key={r.id} className="border-b border-white/5 text-xs">
                            <td className="py-6 font-mono text-violet-400">{r.weekId}</td>
                            <td className="py-6">{u?.firstName} {u?.lastName}</td>
                            <td className="py-6 text-cyan-400">{c?.plate} <span className="text-slate-500">({c?.make})</span></td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-md space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Capacity</label>
                <input 
                  type="number" 
                  value={settings.weeklyCapacity} 
                  onChange={async (e) => {
                    const val = parseInt(e.target.value);
                    await supabase.from('settings').update({ weekly_capacity: val }).eq('id', 1);
                    refreshData();
                  }}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-2xl font-black outline-none" 
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Interface Skin (Base64)</label>
                <input 
                  type="file" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = async () => {
                        await supabase.from('settings').update({ login_image_url: r.result }).eq('id', 1);
                        refreshData();
                      };
                      r.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-500" 
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass w-full max-w-lg rounded-[2rem] p-10 border border-white/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest">{editingUser ? 'Sync Entity' : 'New Identity'}</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleSaveUser} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" defaultValue={editingUser?.firstName} placeholder="First Name" required className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
                <input name="lastName" defaultValue={editingUser?.lastName} placeholder="Last Name" required className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
              </div>
              <input name="email" type="email" defaultValue={editingUser?.email} placeholder="Email / ID" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
              <input name="phone" defaultValue={editingUser?.phone} placeholder="Phone" required className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm" />
              <select name="role" defaultValue={editingUser?.role || 'user'} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm">
                <option value="user">USER</option>
                <option value="admin">ADMIN</option>
              </select>
              <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs">Authorize Personnel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
