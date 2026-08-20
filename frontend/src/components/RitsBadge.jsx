export default function RitsBadge({ theme = 'cartoon' }) {
  const badgeStyles = {
    peaceful: 'bg-emerald-900/10 border-emerald-300 text-emerald-800 shadow-emerald-100',
    cartoon: 'bg-orange-500/10 border-orange-300 text-orange-600 shadow-orange-100',
    girly: 'bg-pink-500/10 border-pink-300 text-pink-600 shadow-pink-100',
    gamer: 'bg-cyan-950/80 border-cyan-400 text-cyan-400 shadow-cyan-950/50'
  };

  const currentStyle = badgeStyles[theme] || badgeStyles.cartoon;

  return (
    <div
      title="Crafted with ♡ by Rits"
      className={`fixed bottom-4 right-4 backdrop-blur-md border px-3.5 py-1.5 rounded-full flex items-center gap-2 cursor-pointer select-none text-xs font-black shadow-lg hover:scale-105 active:scale-95 transition-all z-50 ${currentStyle}`}
    >
      <div className="w-2 h-2 rounded-full animate-ping bg-current opacity-75" />
      <span className="font-mono tracking-widest uppercase">R I T S</span>
      <span className="opacity-80 text-[10px] font-sans font-normal">dev</span>
    </div>
  );
}