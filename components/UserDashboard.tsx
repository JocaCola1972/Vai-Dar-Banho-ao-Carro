
import React, { useState } from 'react';
import { User, Registration, AppSettings, Car } from '../types';
import { getWeekId, getMonthId, isThursdayRegistrationOpen } from '../utils';
import { supabase } from '../supabase';
import { Car as CarIcon, User as UserIcon, LogOut, ShieldCheck, AlertTriangle, Key, Plus, Trash2, Rocket, Cloud, MapPin, Sparkles, CheckCircle2, Activity } from 'lucide-react';
import { THEME } from '../constants';

interface UserDashboardProps {
  user: User;
  users: User[];
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  settings: AppSettings;
  updateProfile: (user: User) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ 
  user, users, registrations, setRegistrations, settings, updateProfile 
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'profile'>('home');
  const [selectedCarId, setSelectedCarId] = useState('');
  const [parkingSpot, setParkingSpot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentWeek = getWeekId();
  const currentMonth = getMonthId();
  
  const isRegisteredThisWeek = registrations.some(r => r.userId === user.id && r.weekId === currentWeek);
  const isRegisteredThisMonth = registrations.some(r => r.userId === user.id && r.monthId === currentMonth);
  const isFull = registrations.filter(r => r.weekId === currentWeek).length >= settings.weeklyCapacity;
  const isManualOpen = settings.manualOpenWeeks.includes(currentWeek);
  const isAutoOpen = isThursdayRegistrationOpen();
  const isOpen = isManualOpen || isAutoOpen;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCarId) return alert('Targeting failed: Select a car.');
    if (isRegisteredThisMonth) return;
    if (isFull) return;

    setIsSubmitting(true);
    const newReg = {
      user_id: user.id,
      car_id: selectedCarId,
      week_id: currentWeek,
      month_id: currentMonth,
      parking_spot: parkingSpot,
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase.from('registrations').insert([newReg]).select();

    if (!error && data) {
      // Mapping back to our local type if necessary
      const savedReg: Registration = {
        id: data[0].id,
        userId: data[0].user_id,
        carId: data[0].car_id,
        weekId: data[0].week_id,
        monthId: data[0].month_id,
        timestamp: data[0].timestamp,
        parkingSpot: data[0].parking_spot
      };
      setRegistrations(prev => [...prev, savedReg]);
    } else {
      alert('Erro ao comunicar com a base de dados: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const handleAddCar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCar: Car = {
      id: Math.random().toString(36).substr(2, 9),
      make: formData.get('make') as string,
      model: formData.get('model') as string,
      plate: formData.get('plate') as string,
    };
    
    const updatedCars = [...user.cars, newCar];
    updateProfile({ ...user, cars: updatedCars });
    e.currentTarget.reset();
  };

  const removeCar = (carId: string) => {
    const updatedCars = user.cars.filter(c => c.id !== carId);
    updateProfile({ ...user, cars: updatedCars });
  };

  const renderRegistrationMessage = () => {
    if (isRegisteredThisWeek) {
      const reg = registrations.find(r => r.userId === user.id && r.weekId === currentWeek);
      const car = user.cars.find(c => c.id === reg?.carId);
      return (
        <div className="p-10 glass rounded-[2.5rem] border border-cyan-400/30 text-center space-y-6 relative overflow-hidden bg-gradient-to-br from-cyan-500/10 to-transparent">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div className="w-20 h-20 bg-cyan-500 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/40 transform rotate-6">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">System Locked & Loaded!</h2>
            <p className="text-cyan-400 font-bold text-xs uppercase tracking-[0.3em]">Sequence Confirmed</p>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-md mx-auto">
            You are scheduled for a deep clean this week with your <span className="text-white font-bold">{car?.plate || 'Unit Registered'}</span>.
            <br /><br />
            <span className="text-[11px] font-black text-slate-500 uppercase block mb-2">Protocol Checklist:</span>
            Deixe a chave do seu carro na receção no dia da lavagem e indique onde o estacionou.
          </p>
          <div className="inline-flex items-center space-x-3 p-4 glass rounded-2xl border border-white/10">
            <MapPin size={16} className="text-violet-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-widest">{reg?.parkingSpot || 'Scan In Progress...'}</span>
          </div>
        </div>
      );
    }

    if (isRegisteredThisMonth) {
      return (
        <div className="p-10 glass rounded-[2.5rem] border border-white/5 text-center space-y-6 opacity-80">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto grayscale">
            <Activity size={40} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Cooldown Active</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">1 Cycle Per Month</p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Já beneficiou da sua lavagem mensal. Por favor, aguarde o próximo mês para um novo ciclo.
          </p>
        </div>
      );
    }

    if (isFull) {
      return (
        <div className="p-10 glass rounded-[2.5rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-500/20 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
            <Rocket size={40} className="text-amber-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Bay Fully Occupied</h2>
            <p className="text-amber-500 font-bold text-xs uppercase tracking-[0.3em]">Traffic Jam Detected</p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            Não conseguiu um lugar nesta semana, mas poderá tentar na semana seguinte. A capacidade máxima foi atingida.
          </p>
        </div>
      );
    }

    if (!isOpen) {
      return (
        <div className="p-10 glass rounded-[2.5rem] border border-white/5 text-center space-y-6">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto border border-white/5">
            <Key size={40} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tight">Offline Window</h2>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em]">Awaiting Thursday Sync</p>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
            As inscrições abrem todas as quintas-feiras às 08:00 AM.
          </p>
        </div>
      );
    }

    return (
      <div className="p-10 glass rounded-[2.5rem] border border-cyan-400/20 space-y-8 bg-gradient-to-br from-cyan-400/5 to-transparent">
        <div className="flex items-center space-x-4 mb-2">
          <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
            <Sparkles className="text-cyan-400" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Initialize Clean</h2>
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Operational Phase 1</p>
          </div>
        </div>
        
        {user.cars.length === 0 ? (
          <div className="text-center p-10 glass rounded-3xl border border-dashed border-white/10">
            <p className="text-slate-400 text-sm mb-6">O seu perfil não tem nenhuma viatura registada.</p>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`${THEME.button} px-8 py-3`}
            >
              Sync Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">Viatura a Lavar</label>
                <select 
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-sm text-white outline-none focus:border-cyan-400"
                >
                  <option value="">Selecione o carro...</option>
                  {user.cars.map(c => (
                    <option key={c.id} value={c.id}>{c.make} {c.model} • {c.plate}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-2 ml-1 tracking-widest">Local de Estacionamento</label>
                <input 
                  type="text" 
                  placeholder="ex: Piso -1, Lugar 24"
                  value={parkingSpot}
                  onChange={(e) => setParkingSpot(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-2xl text-sm text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full ${THEME.button} py-5 text-sm uppercase tracking-[0.2em] shadow-lg shadow-cyan-500/20 disabled:opacity-50`}
            >
              {isSubmitting ? 'Processing...' : 'Confirmar Inscrição'}
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Cloud size={16} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400/70">Personnel Interface</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Pilot Terminal</h1>
        </div>
        <nav className="flex glass p-1.5 rounded-[1.5rem] border border-white/5">
          <button 
            onClick={() => setActiveTab('home')}
            className={`px-8 py-3 text-xs font-black rounded-2xl transition-all uppercase tracking-widest ${activeTab === 'home' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Mission
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-8 py-3 text-xs font-black rounded-2xl transition-all uppercase tracking-widest ${activeTab === 'profile' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            Profile
          </button>
        </nav>
      </header>

      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 animate-in fade-in slide-in-from-left-4 duration-700">
            {renderRegistrationMessage()}
          </div>
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
              <h3 className="text-[10px] uppercase font-black text-slate-500 mb-6 tracking-[0.3em]">Telemetry Status</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-400">Bandwidth Use</span>
                    <span className="text-white font-mono">{registrations.filter(r => r.weekId === currentWeek).length} / {settings.weeklyCapacity}</span>
                  </div>
                  <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-1000" style={{ width: `${Math.min(100, (registrations.filter(r => r.weekId === currentWeek).length / settings.weeklyCapacity) * 100)}%` }}></div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Active Cycle</span>
                    <span className="text-xs font-mono font-bold text-violet-400">{currentMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Signal State</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                      <span className={`text-[10px] font-black tracking-widest ${isOpen ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isOpen ? 'ACTIVE' : 'LOCKED'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-xl space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-violet-400/10 rounded-2xl border border-violet-400/20">
                <UserIcon size={24} className="text-violet-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Personnel Bio</h2>
            </div>
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedUser: User = {
                  ...user,
                  firstName: formData.get('firstName') as string,
                  lastName: formData.get('lastName') as string,
                  phone: formData.get('phone') as string,
                  password: (formData.get('password') as string) || user.password
                };
                updateProfile(updatedUser);
            }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">First Name</label>
                  <input name="firstName" defaultValue={user.firstName} placeholder="First Name" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl w-full focus:border-violet-400 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Last Name</label>
                  <input name="lastName" defaultValue={user.lastName} placeholder="Last Name" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl w-full focus:border-violet-400 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Comms #</label>
                <input name="phone" defaultValue={user.phone} placeholder="Phone Number" required className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl w-full focus:border-violet-400 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Override Passcode</label>
                <input name="password" type="password" placeholder="••••••••" className="bg-white/5 border border-white/10 p-4 text-sm rounded-2xl w-full focus:border-violet-400 outline-none" />
              </div>
              <button type="submit" className={`w-full ${THEME.button} py-4 text-xs tracking-[0.2em] uppercase`}>Commit Settings</button>
            </form>
          </div>

          <div className="glass p-10 rounded-[2.5rem] border border-white/10 shadow-xl space-y-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-cyan-400/10 rounded-2xl border border-cyan-400/20">
                <CarIcon size={24} className="text-cyan-400" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Hardware Log</h2>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {user.cars.length === 0 && <p className="text-slate-500 text-sm italic py-4">Nenhuma viatura registada.</p>}
              {user.cars.map(car => (
                <div key={car.id} className="group flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-cyan-400/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 glass bg-white/5 rounded-xl flex items-center justify-center font-bold text-cyan-400">
                      {car.make[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white tracking-widest">{car.plate}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase">{car.make} {car.model}</p>
                    </div>
                  </div>
                  <button onClick={() => removeCar(car.id)} className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCar} className="pt-8 border-t border-white/5 space-y-4">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Register New Unit</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input name="make" placeholder="Marca" required className="bg-white/5 border border-white/10 p-3 text-xs rounded-xl outline-none focus:border-cyan-400" />
                <input name="model" placeholder="Modelo" required className="bg-white/5 border border-white/10 p-3 text-xs rounded-xl outline-none focus:border-cyan-400" />
                <input name="plate" placeholder="Matrícula" required className="bg-white/5 border border-white/10 p-3 text-xs rounded-xl outline-none focus:border-cyan-400" />
              </div>
              <button type="submit" className="w-full bg-slate-800 text-white font-black py-4 text-xs tracking-[0.2em] uppercase hover:bg-slate-700 rounded-2xl transition-all flex items-center justify-center">
                <Plus size={16} className="mr-2" /> Sync New Hardware
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
