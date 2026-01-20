
import React, { useState, useEffect } from 'react';
import { User, Registration, AppSettings, AuthState } from './types';
import { supabase } from './supabase';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    weeklyCapacity: 10,
    manualOpenWeeks: [],
    loginImageUrl: null
  });
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  const mapProfile = (p: any): User => ({
    id: p.id,
    firstName: p.first_name || '',
    lastName: p.last_name || '',
    phone: p.phone || '',
    email: p.email || '',
    password: p.password || '123',
    role: p.role || 'user',
    cars: p.cars || []
  });

  const fetchData = async () => {
    try {
      const { data: sData } = await supabase.from('settings').select('*').single();
      if (sData) {
        setSettings({
          weeklyCapacity: sData.weekly_capacity,
          manualOpenWeeks: sData.manual_open_weeks || [],
          loginImageUrl: sData.login_image_url
        });
      }

      const { data: rData } = await supabase.from('registrations').select('*');
      if (rData) {
        setRegistrations(rData.map(r => ({
          id: r.id,
          userId: r.user_id,
          carId: r.car_id,
          weekId: r.week_id,
          monthId: r.month_id,
          timestamp: r.timestamp,
          parkingSpot: r.parking_spot
        })));
      }

      const { data: pData } = await supabase.from('profiles').select('*');
      if (pData) setUsers(pData.map(mapProfile));
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) setAuth({ user: mapProfile(profile), isAuthenticated: true });
      } else {
        setAuth({ user: null, isAuthenticated: false });
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    // Para simplificar no protótipo, verificamos primeiro na tabela profiles
    const userInDb = users.find(u => u.email === email && u.password === pass);
    if (userInDb) {
      setAuth({ user: userInDb, isAuthenticated: true });
      return true;
    }
    // Fallback para Supabase Auth real se as contas já existirem
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    return !error;
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
    supabase.auth.signOut();
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050a14] text-cyan-400 font-mono">
      <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] tracking-[0.5em] uppercase">Booting System...</p>
    </div>
  );

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} loginImageUrl={settings.loginImageUrl} />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar user={auth.user!} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {auth.user?.role === 'admin' ? (
          <AdminDashboard 
            users={users} setUsers={setUsers}
            registrations={registrations} setRegistrations={setRegistrations}
            settings={settings} setSettings={setSettings}
            refreshData={fetchData}
          />
        ) : (
          <UserDashboard 
            user={auth.user!} users={users}
            registrations={registrations} setRegistrations={setRegistrations}
            settings={settings}
            updateProfile={async (u) => {
              const { error } = await supabase.from('profiles').update({
                first_name: u.firstName,
                last_name: u.lastName,
                phone: u.phone,
                password: u.password,
                cars: u.cars
              }).eq('id', u.id);
              if (!error) {
                setAuth(prev => ({ ...prev, user: u }));
                fetchData();
              }
            }}
          />
        )}
      </main>
    </div>
  );
};

export default App;
