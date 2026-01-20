
import React, { useState, useEffect, useCallback } from 'react';
import { User, Registration, AppSettings, AuthState, Role } from './types';
import { getWeekId, getMonthId, isThursdayRegistrationOpen } from './utils';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import Sidebar from './components/Sidebar';
import { DEFAULT_CAPACITY, DEFAULT_PASSWORD } from './constants';

const INITIAL_ADMIN: User = {
  id: 'admin-1',
  firstName: 'Cloud',
  lastName: 'Admin',
  phone: '999999999',
  email: 'admin@company.com',
  password: DEFAULT_PASSWORD,
  role: 'admin',
  cars: []
};

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cc_users');
    return saved ? JSON.parse(saved) : [INITIAL_ADMIN];
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    const saved = localStorage.getItem('cc_registrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('cc_settings');
    return saved ? JSON.parse(saved) : {
      weeklyCapacity: DEFAULT_CAPACITY,
      manualOpenWeeks: [],
      loginImageUrl: null
    };
  });

  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem('cc_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cc_registrations', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('cc_settings', JSON.stringify(settings));
  }, [settings]);

  const handleLogin = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setAuth({ user, isAuthenticated: true });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ user: null, isAuthenticated: false });
  };

  const updateUserProfile = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setAuth(prev => ({ ...prev, user: updatedUser }));
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} loginImageUrl={settings.loginImageUrl} />;
  }

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      <Sidebar 
        user={auth.user!} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {auth.user?.role === 'admin' ? (
          <AdminDashboard 
            users={users} 
            setUsers={setUsers}
            registrations={registrations}
            setRegistrations={setRegistrations}
            settings={settings}
            setSettings={setSettings}
          />
        ) : (
          <UserDashboard 
            user={auth.user!}
            users={users}
            registrations={registrations}
            setRegistrations={setRegistrations}
            settings={settings}
            updateProfile={updateUserProfile}
          />
        )}
      </main>
    </div>
  );
};

export default App;
