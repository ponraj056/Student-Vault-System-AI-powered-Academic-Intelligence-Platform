import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const ROLE_HINTS = {
    student: { id: 'firstname.lastname@vsb.edu.in', pin: 'Register No. (e.g. 23205019)', placeholder: 'yourname@vsb.edu.in', pinPlaceholder: 'e.g. 23205019' },
    faculty: { id: 'name.dept@vsb.edu.in',          pin: 'Faculty ID (e.g. FAC001)',     placeholder: 'kumar.cse@vsb.edu.in',  pinPlaceholder: 'FAC001' },
    hod:     { id: 'hod.dept@vsb.edu.in',            pin: 'HOD ID (e.g. HOD001)',         placeholder: 'hod.cse@vsb.edu.in',    pinPlaceholder: 'HOD001' },
    admin:   { id: 'admin@vsb.edu.in',                pin: 'Administrator password',       placeholder: 'admin@vsb.edu.in',      pinPlaceholder: 'Administrator password' },
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    setUsername('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toLowerCase().trim(), password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data);
      } else {
        setError(data.message || 'Invalid credentials. Please verify your portal access.');
      }
    } catch (err) {
      setError('Connection failed. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const FEATURES = [
    { icon: 'analytics',  label: 'Attendance AI' },
    { icon: 'auto_graph', label: 'Performance Analytics' },
    { icon: 'hub',        label: 'Campus Intelligence' },
  ];

  const hint = ROLE_HINTS[role];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] font-['Inter'] relative overflow-hidden p-4">
      
      {/* Dynamic Neural Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-float opacity-40" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#4ff07f]/5 blur-[150px] rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-4xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-[#4ff07f]/10 to-cyan-500/20 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-all duration-1000"></div>
        
        <div className="relative flex flex-col md:flex-row bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
          
          {/* Left Panel: Branding */}
          <div className="w-full md:w-[45%] p-10 lg:p-12 border-b md:border-b-0 md:border-r border-white/5 relative">
             <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-blue-500/20 rounded-tl-[2.5rem]" />
             
             <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-[#4ff07f] flex items-center justify-center shadow-[0_0_25px_rgba(79,240,127,0.4)]">
                      <span className="material-symbols-outlined text-[#003915] font-black text-2xl">auto_awesome</span>
                   </div>
                   <div className="h-10 w-px bg-white/10" />
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] leading-none">Code: 2622</p>
                </div>

                <div className="space-y-4">
                   <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-[0.95]">
                      V.S.B <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-500">Engineering.</span>
                   </h1>
                   <p className="text-gray-400 text-xs font-medium tracking-wide">Namakkal, Tamil Nadu, 637001</p>
                </div>

                <div className="space-y-4 pt-6">
                   {FEATURES.map(f => (
                      <div key={f.label} className="flex items-center gap-4 group/item">
                         <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#4ff07f]/60 group-hover/item:text-[#4ff07f] group-hover/item:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'wght' 700" }}>{f.icon}</span>
                         </div>
                         <span className="text-xs font-bold text-gray-400 group-hover/item:text-white transition-colors tracking-wide">{f.label}</span>
                      </div>
                   ))}
                </div>

                <div className="flex flex-wrap gap-2 pt-10">
                   {['NAAC A+', 'NBA'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/10 text-[8px] font-black text-blue-400 uppercase tracking-widest">{tag}</span>
                   ))}
                </div>
             </div>
          </div>

          {/* Right Panel: Login Form */}
          <div className="flex-1 p-10 lg:p-12 bg-white/[0.01]">
             <div className="max-w-sm mx-auto space-y-8">
                <div className="space-y-1">
                   <h2 className="text-2xl font-black text-white tracking-tight">Student Portal</h2>
                   <p className="text-gray-500 text-[11px] font-medium uppercase tracking-widest">V.S.B Engineering College</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                   {/* Role Switcher */}
                   <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                      {['student', 'faculty', 'hod', 'admin'].map(r => (
                         <button
                           key={r}
                           type="button"
                           onClick={() => handleRoleSwitch(r)}
                           className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${role === r ? 'bg-white text-black shadow-2xl' : 'text-gray-500 hover:text-white'}`}
                         >
                            {r}
                         </button>
                      ))}
                   </div>

                   <div className="space-y-4">
                      {/* Email / Username field */}
                      <div className="group space-y-2">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-blue-400 transition-colors">
                              {role === 'student' ? 'Email Address' : 'Portal Access ID'}
                            </label>
                            <span className="text-[8px] text-gray-600 font-mono">VSB-2622</span>
                         </div>
                         <input
                           type="text"
                           value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                           placeholder={hint.placeholder}
                           required
                         />
                      </div>

                      {/* Password field */}
                      <div className="group space-y-2 relative">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 group-focus-within:text-blue-400 transition-colors">
                              {role === 'student' ? 'Register Number' : 'Credential PIN'}
                            </label>
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-[9px] font-black uppercase text-blue-400 hover:text-white transition-colors">
                               {showPassword ? 'Hide' : 'Show'}
                            </button>
                         </div>
                         <input
                           type={showPassword ? 'text' : 'password'}
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-gray-700"
                           placeholder={hint.pinPlaceholder}
                           required
                         />
                      </div>
                   </div>

                   {error && (
                      <div className="animate-shake p-4 rounded-2xl bg-red-500/10 border border-red-500/15 flex items-center gap-3">
                         <span className="material-symbols-outlined text-red-500 text-lg">shield_with_heart</span>
                         <span className="text-[10px] font-bold text-red-400 leading-tight">{error}</span>
                      </div>
                   )}

                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full h-14 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-[0.2em] hover:bg-[#4ff07f] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-blue-500/5 disabled:opacity-50 overflow-hidden relative group/btn"
                   >
                     {loading ? (
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto"></div>
                     ) : (
                        <span className="relative z-10 flex items-center justify-center gap-2">
                           Sign In
                           <span className="material-symbols-outlined text-xs">login</span>
                        </span>
                     )}
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
                   </button>
                </form>

                {/* Credential hints */}
                <div className="pt-6 border-t border-white/5 space-y-3">
                   <p className="text-[8px] font-black uppercase tracking-widest text-gray-700 text-center">Credential Format</p>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                         <p className="text-[8px] text-gray-600 mb-1">ID</p>
                         <p className="text-[9px] text-blue-400 font-mono truncate">{hint.id}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                         <p className="text-[8px] text-gray-600 mb-1">Password</p>
                         <p className="text-[9px] text-cyan-400 font-mono">{hint.pin}</p>
                  </div>
                  <p className="text-[9px] text-gray-600 text-center">Students can sign in using their register number or email address.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.05); } }
        .animate-float { animation: float 10s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
      `}</style>
    </div>
  );
};

export default Login;
