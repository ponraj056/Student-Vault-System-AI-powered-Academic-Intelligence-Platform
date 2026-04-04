export default function Settings({ theme, setTheme, onToast }) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    onToast(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} mode`, 'success');
  };

  const handleSave = () => {
    onToast('Settings saved successfully', 'success');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">System Settings</h2>
        <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
          Configure your platform preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-white dark:bg-[#1e1e32] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ff07f]">person</span>
              Admin Profile
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=Rajesh" alt="Admin" className="w-16 h-16 rounded-2xl bg-[#4ff07f]/10" />
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">Dr. Rajesh K.</h4>
                <p className="text-sm text-gray-500 dark:text-[#8890b5]">System Administrator</p>
              </div>
              <button className="ml-auto btn-secondary text-sm px-3 py-1.5">Change</button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-[#8890b5] mb-1">Email Address</label>
              <input type="email" defaultValue="admin@studentvault.edu" className="filter-select w-full bg-gray-50 dark:bg-white/[0.02]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-[#8890b5] mb-1">Department Scope</label>
              <select className="filter-select w-full bg-gray-50 dark:bg-white/[0.02]" defaultValue="ALL">
                <option value="ALL">All Departments (Global)</option>
                <option value="CSE">Computer Science</option>
              </select>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-[#1e1e32] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-white/5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-400">tune</span>
              Preferences
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Appearance</p>
                <p className="text-xs text-gray-500 dark:text-[#8890b5]">Toggle dark/light mode</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="w-12 h-6 rounded-full bg-gray-200 dark:bg-[#4ff07f]/20 relative transition-colors focus:outline-none"
              >
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-[#4ff07f] absolute top-1 transition-all ${theme === 'dark' ? 'left-7' : 'left-1 shadow-sm'}`} />
              </button>
            </div>

            {/* AI Settings */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">AI Assistant Strict Mode</p>
                <p className="text-xs text-gray-500 dark:text-[#8890b5]">Force deterministic data queries</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-[#4ff07f]/20 relative transition-colors focus:outline-none">
                <div className="w-4 h-4 rounded-full bg-[#4ff07f] absolute top-1 left-7 shadow-sm" />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Email Reports</p>
                <p className="text-xs text-gray-500 dark:text-[#8890b5]">Receive daily summary emails</p>
              </div>
              <button className="w-12 h-6 rounded-full bg-gray-200 dark:bg-white/10 relative transition-colors focus:outline-none">
                <div className="w-4 h-4 rounded-full bg-white dark:bg-gray-400 absolute top-1 left-1 shadow-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={handleSave} className="btn-primary">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Changes
        </button>
      </div>
    </div>
  );
}
