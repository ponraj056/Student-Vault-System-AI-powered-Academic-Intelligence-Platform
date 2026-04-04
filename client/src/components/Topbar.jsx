export default function Topbar({ activeNav, onBroadcast }) {
  const labels = { students: 'Dashboard', chatbot: 'AI Chatbot', attendance: 'Attendance', results: 'Results', reports: 'Reports', upload: 'Upload' };

  return (
    <header className="fixed top-0 right-0 z-40 flex items-center justify-between px-8" style={{ width: 'calc(100% - 240px)', height: '64px', background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(20px)', boxShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
      {/* Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base" style={{ color: '#8890b5' }}>search</span>
          <input
            className="w-full rounded-lg pl-10 pr-4 py-2 text-sm transition-all"
            style={{ background: '#111125', border: '1px solid rgba(60,74,61,0.4)', color: '#e2e0fc' }}
            placeholder="Search students, reports..."
            type="text"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-lg flex items-center justify-center relative transition-all" style={{ background: 'rgba(255,255,255,0.04)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,240,127,0.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
          <span className="material-symbols-outlined text-base" style={{ color: '#8890b5' }}>notifications</span>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: '#4ff07f' }}></span>
        </button>
        <button className="w-9 h-9 rounded-lg flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <span className="material-symbols-outlined text-base" style={{ color: '#8890b5' }}>help_outline</span>
        </button>
        <div className="h-5 w-px mx-1" style={{ background: 'rgba(60,74,61,0.4)' }}></div>
        <button className="btn-primary" onClick={onBroadcast}>
          <span className="material-symbols-outlined text-base">add</span>
          New Broadcast
        </button>
      </div>
    </header>
  );
}
