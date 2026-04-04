import { useState } from 'react';

const PAGE_LABELS = {
  students:   { title: 'Student Dashboard', sub: 'Academic Intelligence Platform' },
  chatbot:    { title: 'AI Campus Assistant', sub: 'Conversational data insights' },
  attendance: { title: 'Attendance Tracker', sub: 'Real-time presence analytics' },
  results:    { title: 'Examination Results', sub: 'Grade & performance records' },
  reports:    { title: 'Reports Centre', sub: 'Generate & export insights' },
  upload:     { title: 'Data Upload', sub: 'Bulk import student records' },
};

export default function Topbar({ activeNav, onBroadcast, theme, setTheme }) {
  const [searchActive, setSearchActive] = useState(false);
  const isDark = theme === 'dark';
  const page = PAGE_LABELS[activeNav] || PAGE_LABELS.students;

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center gap-4 px-6 transition-colors duration-300"
      style={{
        left: 240,
        height: 64,
        background: isDark ? 'rgba(15,15,30,0.85)' : 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.08)',
        boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black truncate text-gray-900 dark:text-white">
            {page.title}
          </h2>
          <span className="hidden sm:block text-gray-300 dark:text-white/10">·</span>
          <p className="hidden sm:block text-xs truncate text-gray-500 dark:text-[#8890b5]">
            {page.sub}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className={`relative transition-all duration-300 ${searchActive ? 'w-64' : 'w-44'}`}>
        <span
          className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none"
          style={{ color: isDark ? '#8890b5' : '#9ca3af' }}
        >
          search
        </span>
        <input
          className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm outline-none transition-all duration-200
            ${isDark
              ? 'bg-white/5 border border-white/8 text-[#e2e0fc] placeholder-[#8890b5] focus:border-[#4ff07f]/40 focus:bg-white/8'
              : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-green-400/60 focus:bg-white focus:ring-2 focus:ring-green-400/10'
            }`}
          placeholder="Search..."
          type="text"
          onFocus={() => setSearchActive(true)}
          onBlur={() => setSearchActive(false)}
        />
      </div>

      {/* Actions group */}
      <div className="flex items-center gap-1.5">

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
            ${isDark
              ? 'bg-white/5 hover:bg-white/10 text-yellow-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
        >
          <span className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Notifications */}
        <button
          className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all duration-200
            ${isDark ? 'bg-white/5 hover:bg-white/10 text-[#8890b5]' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#4ff07f] ring-2 ring-offset-1 ring-[#4ff07f]/30" />
        </button>

        {/* Help */}
        <button
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
            ${isDark ? 'bg-white/5 hover:bg-white/10 text-[#8890b5]' : 'bg-gray-100 hover:bg-gray-200 text-gray-500'}`}
        >
          <span className="material-symbols-outlined text-[18px]">help_outline</span>
        </button>

        {/* Divider */}
        <div className={`h-6 w-px mx-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />

        {/* Broadcast CTA */}
        <button
          className="btn-primary text-sm"
          onClick={onBroadcast}
        >
          <span className="material-symbols-outlined text-[16px]">campaign</span>
          <span className="hidden sm:inline">Broadcast</span>
        </button>
      </div>
    </header>
  );
}