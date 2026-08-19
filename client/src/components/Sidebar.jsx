import { NAV_ITEMS } from '../data';

export default function Sidebar({ activeNav, onNavChange, user, onLogout }) {
  const isStudent = user.role?.toLowerCase() === 'student';

  // For students: prepend a 'My Dashboard' item, then show their scoped nav items
  const studentDashboardItem = { key: 'students', label: 'My Dashboard', icon: 'dashboard' };

  const filteredNavItems = isStudent
    ? [
        studentDashboardItem,
        ...NAV_ITEMS.filter(item =>
          ['chatbot', 'attendance', 'results', 'internship'].includes(item.key)
        ),
      ]
    : NAV_ITEMS.filter(item => {
        const role = user.role?.toLowerCase();
        if (role === 'faculty' || role === 'staff') {
          return ['students', 'chatbot', 'attendance', 'results', 'internship', 'upload'].includes(item.key);
        }
        if (role === 'hod' || role === 'admin') {
          return ['students', 'chatbot', 'attendance', 'results', 'internship', 'reports'].includes(item.key);
        }
        return true;
      });

  return (
    <aside className="h-screen w-60 fixed left-0 top-0 flex flex-col z-50
      bg-white dark:bg-[#050505]
      border-r border-gray-200 dark:border-white/5
      transition-colors duration-500 shadow-2xl">

      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#4ff07f]/20
            bg-gradient-to-tr from-[#4ff07f] to-[#25d366] flex-shrink-0 animate-float">
            <span className="material-symbols-outlined text-xl text-[#003915] font-black"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-gray-900 dark:text-white leading-none">
              Student<span className="text-[#4ff07f]"> Portal</span>
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
               <span className="text-[8px] uppercase font-black tracking-[0.2em] text-gray-500">VSB Engineering</span>
               <span className="px-1.5 py-0.5 rounded-full bg-[#4ff07f]/10 text-[#4ff07f] text-[7px] font-black uppercase tracking-widest border border-[#4ff07f]/20">2622</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-6 pb-4">
        <p className="text-[10px] uppercase font-black tracking-widest text-gray-600">
          Core Engine
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {filteredNavItems.map(item => {
          const isActive = activeNav === item.key;
          return (
            <a
              key={item.key}
              href="#"
              onClick={e => { e.preventDefault(); onNavChange(item.key); }}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden
                ${isActive
                  ? 'bg-gray-100 dark:bg-white/5 text-[#4ff07f] shadow-lg border border-gray-200 dark:border-white/5'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.03]'
                }`}
            >
              {/* Active Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#4ff07f]/10 to-transparent pointer-events-none" />
              )}

              <span
                className={`material-symbols-outlined text-xl transition-all duration-300
                  ${isActive ? 'text-[#4ff07f] scale-110' : 'text-gray-600 group-hover:text-gray-300'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">{item.label}</span>

              {isActive && (
                <div className="ml-auto w-1 h-4 bg-[#4ff07f] rounded-full shadow-[0_0_10px_#4ff07f]" />
              )}
            </a>
          );
        })}
      </nav>

      {/* User footer - Luxury refinement */}
      <div className="p-4">
         <div className="rounded-[2rem] bg-white/[0.03] border border-white/5 p-4 space-y-4">
             <div className="flex items-center gap-3">
               <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10 shadow-lg">
                     <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user.name}`} className="w-8 h-8 rounded-lg" alt="" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#4ff07f] border-4 border-[#0d0d0d] flex items-center justify-center">
                     <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                  </div>
               </div>
               <div className="min-w-0">
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate leading-none mb-1">{user.name}</p>
                  <p className="text-[9px] uppercase font-black text-gray-500 tracking-wider flex items-center gap-1">
                     <span className="w-1 h-1 rounded-full bg-[#4ff07f]" />
                     {user.role}
                  </p>
                  {/* Show register number for students */}
                  {isStudent && user.studentId && (
                    <p className="text-[8px] font-mono text-[#4ff07f]/70 mt-0.5 truncate">
                      {user.studentId}
                    </p>
                  )}
               </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
               <button 
                  onClick={() => onNavChange('settings')}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
               >
                  <span className="material-symbols-outlined text-sm">settings</span>
               </button>
               <button 
                  onClick={onLogout}
                  className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-all text-red-500/70 hover:text-red-400"
               >
                  <span className="material-symbols-outlined text-sm">power_settings_new</span>
               </button>
            </div>
         </div>
      </div>
    </aside>
  );
}
