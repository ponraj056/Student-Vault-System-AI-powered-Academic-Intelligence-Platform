import { NAV_ITEMS } from '../data';

export default function Sidebar({ activeNav, onNavChange }) {
  return (
    <aside className="h-screen w-60 fixed left-0 top-0 flex flex-col py-6 z-50 shadow-2xl" style={{ background: '#1a1a2e' }}>
      {/* Logo */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-md" style={{ background: 'linear-gradient(135deg,#4ff07f,#25d366)' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#003915', fontVariationSettings: "'FILL' 1" }}>school</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-white leading-tight tracking-tight">V.S.B. Admin</h1>
            <p className="text-[10px] uppercase font-bold mt-0.5" style={{ color: '#4ff07f', letterSpacing: '0.18em' }}>Intelligence Hub</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1">
        {NAV_ITEMS.map(item => (
          <a
            key={item.key}
            href="#"
            className={`sidebar-link${activeNav === item.key ? ' active' : ''}`}
            onClick={e => { e.preventDefault(); onNavChange(item.key); }}
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(60,74,61,0.3)' }}>
        <a href="#" className="sidebar-link">
          <span className="material-symbols-outlined text-base">settings</span>
          <span>Settings</span>
        </a>
        <div className="flex items-center gap-3 px-4 py-3 mt-1">
          <img
            alt="Admin"
            className="w-8 h-8 rounded-lg object-cover"
            style={{ border: '1px solid rgba(79,240,127,0.2)' }}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwOf1vz7-Dmw0qiGfT5hzAve1T9pkXlXwJiGqS-XsrjvBBSk8MO8K0GQ7A9AwEpRLkLBoJgSc5VbSCg0Mbhfu1jmH-ZcKNXjJm4xCt6ZYpz_BcZ0kN_FsVqPk9DthS1XW0N6w2ZcOKJ0SHAkp_Mt3c_lygBq8kWZy_VIo6FJJCSAWYzKobKdgEK8lgL834pRLeRgW2p2qwUkzvJEU8GFkGF3D5hGF8UbcbbXJi9OtAa5Wi9rn_4Y6E5s8PnRxALESVfYuj1fYrCuUw"
          />
          <div>
            <p className="text-xs font-bold text-white">Dr. Rajesh K.</p>
            <p className="text-[10px]" style={{ color: '#8890b5' }}>Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
