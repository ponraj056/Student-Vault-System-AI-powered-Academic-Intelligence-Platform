import { NAV_ITEMS } from '../data';

export default function Sidebar({ activeNav, onNavChange }) {
  return (
    <aside className="h-screen w-60 fixed left-0 top-0 flex flex-col z-50
      bg-white dark:bg-[#0f0f1e]
      border-r border-gray-200 dark:border-white/5
      shadow-xl dark:shadow-black/40
      transition-colors duration-300">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg
            bg-gradient-to-br from-[#4ff07f] to-[#25d366] flex-shrink-0">
            <span className="material-symbols-outlined text-lg text-[#003915] font-black"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              school
            </span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-gray-900 dark:text-white leading-tight">
              StudentVault
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#4ff07f] mt-0.5">
              AI Platform
            </p>
          </div>
        </div>
      </div>

      {/* Nav Label */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-[#8890b5]">
          Navigation
        </p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => {
          const isActive = activeNav === item.key;
          return (
            <a
              key={item.key}
              href="#"
              onClick={e => { e.preventDefault(); onNavChange(item.key); }}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative
                ${isActive
                  ? 'bg-[#4ff07f]/10 dark:bg-[#4ff07f]/10 text-[#16a34a] dark:text-[#4ff07f] font-semibold'
                  : 'text-gray-500 dark:text-[#8890b5] hover:text-gray-800 dark:hover:text-[#e2e0fc] hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
            >
              {/* Active indicator */}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4ff07f] rounded-r-full" />
              )}

              <span
                className={`material-symbols-outlined text-[18px] transition-all
                  ${isActive ? 'text-[#4ff07f]' : 'text-gray-400 dark:text-[#8890b5] group-hover:text-gray-600 dark:group-hover:text-[#e2e0fc]'}`}
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>

              {/* Active badge */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#4ff07f] animate-pulse" />
              )}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-100 dark:border-white/5 mb-2" />

      {/* Footer actions */}
      <div className="px-3 pb-2">
        <button
          onClick={() => onNavChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${activeNav === 'settings'
              ? 'bg-[#4ff07f]/10 text-[#16a34a] dark:text-[#4ff07f] font-semibold'
              : 'text-gray-500 dark:text-[#8890b5] hover:text-gray-800 dark:hover:text-[#e2e0fc] hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
        >
          {activeNav === 'settings' && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4ff07f] rounded-r-full" />
          )}
          <span className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: activeNav === 'settings' ? "'FILL' 1" : "'FILL' 0" }}>
            settings
          </span>
          <span>Settings</span>
        </button>
      </div>

      {/* User footer */}
      <div className="mx-3 mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              alt="Admin"
              className="w-9 h-9 rounded-lg object-cover border-2 border-[#4ff07f]/30"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwOf1vz7-Dmw0qiGfT5hzAve1T9pkXlXwJiGqS-XsrjvBBSk8MO8K0GQ7A9AwEpRLkLBoJgSc5VbSCg0Mbhfu1jmH-ZcKNXjJm4xCt6ZYpz_BcZ0kN_FsVqPk9DthS1XW0N6w2ZcOKJ0SHAkp_Mt3c_lygBq8kWZy_VIo6FJJCSAWYzKobKdgEK8lgL834pRLeRgW2p2qwUkzvJEU8GFkGF3D5hGF8UbcbbXJi9OtAa5Wi9rn_4Y6E5s8PnRxALESVfYuj1fYrCuUw"
              onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Admin&background=4ff07f&color=003915'; }}
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4ff07f] border-2 border-white dark:border-[#0f0f1e] rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 dark:text-white truncate">Dr. Rajesh K.</p>
            <p className="text-[10px] text-gray-500 dark:text-[#8890b5] truncate">Super Admin</p>
          </div>
          <span className="material-symbols-outlined text-[16px] text-gray-400 dark:text-[#8890b5]">more_vert</span>
        </div>
      </div>
    </aside>
  );
}
