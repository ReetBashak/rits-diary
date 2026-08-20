import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RitsBadge from './components/RitsBadge';

const THEMES = {
  cartoon: {
    name: 'cartoon',
    icon: '🍊',
    tagline: 'When life gives you tangerines, write cute stories ✨',
    pageBg: 'bg-[#FFFDF9] text-[#4A3E3D]',
    navbarBg: 'bg-white/80',
    cardBg: 'bg-white',
    inputBg: 'bg-orange-50/50',
    borderColor: 'border-orange-200',
    primaryText: 'text-orange-600',
    subText: 'text-stone-400',
    badgeBg: 'bg-green-100 text-stone-700 border-green-200',
    buttonPrimary: 'bg-orange-400 hover:bg-orange-500 text-white',
    buttonSecondary: 'bg-pink-100 hover:bg-pink-200 text-stone-700'
  },
  peaceful: {
    name: 'peaceful',
    icon: '🌿',
    tagline: 'Breathe in peace, exhale gratitude 🍵',
    pageBg: 'bg-[#F4F7F4] text-[#2D3A2F]',
    navbarBg: 'bg-[#EBF1EB]/90',
    cardBg: 'bg-[#FFFFFF]',
    inputBg: 'bg-[#F0F5F0]',
    borderColor: 'border-[#C8DBC8]',
    primaryText: 'text-emerald-700',
    subText: 'text-emerald-600/70',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    buttonSecondary: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
  },
  girly: {
    name: 'girly',
    icon: '🎀',
    tagline: 'Sugar, spice, sparkles & sweet memories 🌸',
    pageBg: 'bg-[#FFF5F7] text-[#4A2D35]',
    navbarBg: 'bg-[#FFE9EE]/90',
    cardBg: 'bg-white',
    inputBg: 'bg-pink-50/60',
    borderColor: 'border-pink-200',
    primaryText: 'text-pink-600',
    subText: 'text-pink-400',
    badgeBg: 'bg-pink-100 text-pink-700 border-pink-200',
    buttonPrimary: 'bg-pink-500 hover:bg-pink-600 text-white',
    buttonSecondary: 'bg-purple-100 hover:bg-purple-200 text-purple-800'
  },
  gamer: {
    name: 'gamer',
    icon: '👾',
    tagline: 'Leveling up memories, one quest at a time ⚡',
    pageBg: 'bg-[#0F172A] text-[#E2E8F0]',
    navbarBg: 'bg-[#1E293B]/90',
    cardBg: 'bg-[#1E293B]',
    inputBg: 'bg-[#0F172A]',
    borderColor: 'border-cyan-500/40',
    primaryText: 'text-cyan-400',
    subText: 'text-slate-400',
    badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-500/50',
    buttonPrimary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black',
    buttonSecondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200'
  }
};

export default function App() {
  const [user, setUser] = useState(null);
  const [currentTheme, setTheme] = useState(() => localStorage.getItem('diaryTheme') || 'cartoon');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleThemeChange = (themeKey) => {
    setTheme(themeKey);
    localStorage.setItem('diaryTheme', themeKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const themeConfig = THEMES[currentTheme] || THEMES.cartoon;

  return (
    <div className={`min-h-screen transition-colors duration-300 relative pb-16 ${themeConfig.pageBg}`}>
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentTheme={currentTheme}
        setTheme={handleThemeChange}
        themeConfig={themeConfig}
      />
      <main>
        {!user ? (
          <Auth onLoginSuccess={(u) => setUser(u)} />
        ) : (
          <Dashboard themeConfig={themeConfig} />
        )}
      </main>
      <RitsBadge theme={currentTheme} />
    </div>
  );
}