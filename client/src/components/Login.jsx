import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setError(data.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Connection failed. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] font-['Inter'] relative overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/15 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full animate-float-delayed" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-cyan-500/8 blur-[100px] rounded-full animate-float-slow" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 px-4">

        {/* Logo & Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25 mb-5">
            <span className="material-symbols-outlined text-white text-3xl" style={{ fontVariationSettings: "'wght' 600" }}>school</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Student <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Vault</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Sign in to your academic dashboard</p>
        </div>

        {/* Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative bg-[#111118]/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl">

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">person</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-13 pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all placeholder:text-gray-600"
                    placeholder="Enter your username or email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-500 text-xl">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-13 pl-12 pr-12 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm font-medium text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.06] transition-all placeholder:text-gray-600"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 animate-shake">
                  <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                  <span className="text-xs font-medium text-red-400">{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm tracking-wide hover:from-blue-400 hover:to-purple-500 transition-all hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-5 border-t border-white/[0.06]">
              <p className="text-center text-[11px] text-gray-600">
                Students: use your register number as username
              </p>
              <p className="text-center text-[11px] text-gray-600 mt-1">
                Faculty & Admin: use your portal email
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[11px] text-gray-600">
            V.S.B Engineering College &middot; Namakkal, Tamil Nadu
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {['NAAC A+', 'NBA'].map(tag => (
              <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[9px] font-bold text-gray-500 uppercase tracking-widest">{tag}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-25px) scale(1.03); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(20px) scale(1.05); } }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        .animate-float { animation: float 8s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 10s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 3; }
        .h-13 { height: 3.25rem; }
      `}</style>
    </div>
  );
};

export default Login;
