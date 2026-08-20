import { Palette } from 'lucide-react';

export default function Navbar({ user, onLogout, currentTheme, setTheme, themeConfig }) {
  const themes = [
    { id: 'cartoon', label: 'Cartoon 🍊', icon: '🍊' },
    { id: 'peaceful', label: 'Peaceful 🌿', icon: '🌿' },
    { id: 'girly', label: 'Girly 🎀', icon: '🎀' },
    { id: 'gamer', label: 'Gamer 🎮', icon: '👾' },
  ];

  return (
    <nav className={`backdrop-blur-md border-b-2 px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center sticky top-0 z-40 transition-colors duration-300 ${themeConfig.navbarBg} ${themeConfig.borderColor}`}>
      {/* Title & Theme Match Icon */}
      <div className="flex items-center gap-3">
        <span className="text-3xl filter drop-shadow-sm animate-bounce">{themeConfig.icon}</span>
        <div>
          <h1 className={`font-black text-xl tracking-tight leading-none ${themeConfig.primaryText}`}>
            Viva La Vida
          </h1>
          <p className={`text-[11px] italic font-medium opacity-70 ${themeConfig.subText}`}>
            {themeConfig.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Selector Dropdown */}
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/10 p-1 rounded-2xl">
          <Palette className="w-4 h-4 ml-1.5 opacity-60" />
          <select
            value={currentTheme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-transparent text-xs font-bold py-1 px-2 rounded-xl focus:outline-none cursor-pointer"
          >
            {themes.map((t) => (
              <option key={t.id} value={t.id} className="text-stone-800 bg-white">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <span className={`font-bold px-3 py-1 rounded-full text-xs border ${themeConfig.badgeBg}`}>
              {user.username}
            </span>
            <button
              onClick={onLogout}
              className={`px-3 py-1 rounded-full text-xs font-bold transition shadow-sm cursor-pointer ${themeConfig.buttonSecondary}`}
            >
              Logout 👋
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}