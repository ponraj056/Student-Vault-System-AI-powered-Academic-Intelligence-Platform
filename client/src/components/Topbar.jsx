import { useState } from 'react';

export default function Topbar({ activeNav, onBroadcast, theme, setTheme, user }) {
  const [searchActive, setSearchActive] = useState(false);
  const isDark = theme === 'dark';

  const PAGE_LABELS = {
    students:   { title: user.role === 'student' ? 'My Portfolio' : 'Student Hub', sub: 'Academic Intelligence' },
    chatbot:    { title: 'Campus AI', sub: 'Neural insights' },
    attendance: { title: 'Presence', sub: 'Real-time analytics' },
    results:    { title: 'Performance', sub: 'Grade records' },
    reports:    { title: 'Intelligence', sub: 'Institutional data' },
    upload:     { title: 'Sync Center', sub: 'Bulk records' },
    settings:   { title: 'Parameters', sub: 'System preferences' },
  };

  const page = PAGE_LABELS[activeNav] || PAGE_LABELS.students;

  return (
    <header
      className="fixed top-4 right-4 z-40 flex items-center gap-6 px-8 rounded-[2rem] transition-all duration-500"
      style={{
        left: 260,
        height: 72,
        background: isDark ? 'rgba(13,13,13,0.7)' : 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(32px)',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.03)',
      }}
    >
      {/* Page Title & Status */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col">
          <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest luxury-text">
            {page.title}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-[#4ff07f] animate-pulse" />
             <p className="text-[10px] truncate text-gray-500 font-bold uppercase tracking-tighter">
               {page.sub}
             </p>
          </div>
        </div>
      </div>

      {/* Global Command/Search */}
      <div className={`relative group transition-all duration-500 ${searchActive ? 'w-80' : 'w-56'}`}>
        <span
          className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none transition-colors duration-300 group-hover:text-[#4ff07f]"
          style={{ color: isDark ? '#444' : '#9ca3af' }}
        >
          search
        </span>
        <input
          className={`w-full rounded-2xl pl-12 pr-4 py-3 text-xs font-bold outline-none transition-all duration-300
            ${isDark
              ? 'bg-white/[0.03] border border-white/5 text-white placeholder-gray-600 focus:border-[#4ff07f]/30 focus:bg-white/[0.06] focus:ring-4 focus:ring-[#4ff07f]/5'
              : 'bg-gray-100 border border-transparent text-gray-800 placeholder-gray-400 focus:border-green-400/30 focus:bg-white'
            }`}
          placeholder="Command center..."
          type="text"
          onFocus={() => setSearchActive(true)}
          onBlur={() => setSearchActive(false)}
        />
        {!searchActive && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-40 pointer-events-none">
             <span className="px-1.5 py-0.5 rounded border border-gray-200 dark:border-white/20 text-[9px] font-black text-gray-600 dark:text-white">⌘</span>
             <span className="px-1 py-0.5 rounded border border-gray-200 dark:border-white/20 text-[9px] font-black text-gray-600 dark:text-white">K</span>
          </div>
        )}
      </div>

      {/* Control Peripheral */}
      <div className="flex items-center gap-3">

        {/* Theme Hub */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 border
            ${isDark
              ? 'bg-white/5 hover:bg-white/10 border-white/5 text-yellow-400'
              : 'bg-gray-100 hover:bg-gray-200 border-transparent text-gray-600'
            }`}
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'temp_preferences_custom' : 'dark_mode'}
          </span>
        </button>

        {/* Notification Hub */}
        <button
          className={`w-11 h-11 rounded-2xl flex items-center justify-center relative transition-all duration-300 border
            ${isDark ? 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 border-transparent text-gray-500'}`}
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#4ff07f] border-2 border-[#0d0d0d]" />
        </button>

        {/* Action Trigger */}
        <button
          className="px-6 h-11 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-[#4ff07f] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          onClick={onBroadcast}
        >
          Broadcast
        </button>
      </div>
    </header>
  );
}