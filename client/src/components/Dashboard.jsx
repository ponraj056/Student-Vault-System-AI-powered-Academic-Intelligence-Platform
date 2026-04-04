import { useState, useEffect } from 'react';
import StudentCard from './StudentCard';
import Analytics from './Analytics';
import Chatbot from './Chatbot';

const getStatsConfig = (data) => [
  {
    label: 'Total Students', value: data.totalStudents || '0', badge: '+12.4%', badgeClass: 'badge-success',
    icon: 'group', accent: '#4ff07f',
    bg: 'bg-[#4ff07f]/10 dark:bg-[#4ff07f]/10', iconColor: 'text-[#4ff07f] dark:text-[#4ff07f]',
    lightBg: '#f0fdf4', lightText: '#16a34a',
  },
  {
    label: 'Pass Rate', value: `${data.passRate || '0.00'}%`, badge: 'Recent', badgeClass: 'badge-info',
    icon: 'how_to_reg', accent: '#adc6ff',
    bg: 'bg-blue-100/80 dark:bg-[#adc6ff]/10', iconColor: 'text-blue-500 dark:text-[#adc6ff]',
    lightBg: '#eff6ff', lightText: '#2563eb',
  },
  {
    label: 'Arrear Count', value: data.totalArrears || '0', badge: `${data.failRate || '0.00'}% Fail`, badgeClass: 'badge-danger',
    icon: 'warning', accent: '#ffb4ab',
    bg: 'bg-red-100/80 dark:bg-[#ffb4ab]/10', iconColor: 'text-red-400 dark:text-[#ffb4ab]',
    lightBg: '#fff1f2', lightText: '#dc2626',
  },
  {
    label: 'Active Departments', value: data.departments || '16', badge: 'Live', badgeClass: 'badge-success',
    icon: 'analytics', accent: '#f9d03f',
    bg: 'bg-yellow-100/80 dark:bg-[#f9d03f]/10', iconColor: 'text-yellow-500 dark:text-[#f9d03f]',
    lightBg: '#fefce8', lightText: '#ca8a04', live: true,
  },
];

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-[#1e1e32] border border-gray-200 dark:border-white/5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded-lg bg-gray-200 dark:bg-white/10" />
          <div className="h-2 w-1/2 rounded-lg bg-gray-200 dark:bg-white/10" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-2 w-full rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="h-2 w-2/3 rounded-lg bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="h-8 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
    </div>
  );
}

export default function Dashboard({ activeNav, onToast, onOpenModal, user }) {
  const [filters, setFilters] = useState({ dept: '', year: '', cgpa: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [studentsList, setStudentsList] = useState([]);
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [statsRes, studentsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/dashboard/all-students')
        ]);
        const stats = await statsRes.json();
        const students = await studentsRes.json();
        
        if (active) {
          let list = students?.data || [];
          let filteredStats = stats || {};

          if (user.role === 'student' && user.studentId) {
            list = list.filter(s => s.id === user.studentId || s.rollNo === user.studentId);
            filteredStats = {
              totalStudents: '1',
              passRate: list[0]?.status === 'clear' ? '100' : '0',
              totalArrears: list[0]?.status === 'arrear' ? '1' : '0',
              departments: '1'
            };
          }

          setStatsData(filteredStats);
          setStudentsList(list);
          setLoading(false);
          onToast('Intelligence engine synced ✓', 'success');
        }
      } catch (err) {
        if (active) {
          setLoading(false);
          onToast('Failed to connect to backend.', 'error');
        }
      }
    };
    loadData();
    return () => { active = false; };
  }, []);

  const filtered = studentsList.filter(s => {
    if (filters.dept && s.dept !== filters.dept) return false;
    if (filters.year && s.year !== parseInt(filters.year)) return false;
    if (filters.status === 'clear' && s.status !== 'clear') return false;
    if (filters.status === 'arrear' && s.status !== 'arrear') return false;
    if (filters.cgpa === '9+' && s.cgpa < 9) return false;
    if (filters.cgpa === '8+' && (s.cgpa < 8 || s.cgpa >= 9)) return false;
    if (filters.cgpa === '7+' && (s.cgpa < 7 || s.cgpa >= 8)) return false;
    if (filters.cgpa === 'below7' && s.cgpa >= 7) return false;
    return true;
  });

  const resetFilters = () => setFilters({ dept: '', year: '', cgpa: '', status: '' });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const stats = [
    { label: user.role === 'student' ? 'My Status' : 'Students', value: statsData.totalStudents || '0', icon: 'groups', color: '#4ff07f' },
    { label: user.role === 'student' ? 'My Grade' : 'Pass Rate', value: `${statsData.passRate || '0.0'}%`, icon: 'auto_graph', color: '#adc6ff' },
    { label: user.role === 'student' ? 'Backlogs' : 'Arrears', value: statsData.totalArrears || '0', icon: 'warning', color: '#ffb4ab' },
    { label: 'Efficiency', value: '94%', icon: 'bolt', color: '#f9d03f' },
  ];

  return (
    <div className="space-y-10 pb-20 animate-fade-in hero-gradient">
      {/* --- HERO SECTION --- */}
      <div className="relative group overflow-hidden rounded-[2.5rem] glass-card p-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#4ff07f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ff07f] animate-pulse" />
            AI Intelligence Active
          </div>
          <h1 className="text-4xl md:text-5xl font-black luxury-text leading-tight">
            Hi, {user.name}! <br />
            System <span className="text-[#4ff07f]">Synced</span>.
          </h1>
          <p className="text-gray-800 dark:text-gray-400 text-lg font-medium leading-relaxed">
            {user.role === 'student' 
              ? "Your academic trajectory looks strong. You're in the top 15% of your department." 
              : "Institutional performance is up 12% this semester. AI analytics have identified 3 key growth areas."}
          </p>
          <div className="flex gap-4">
            <button className="btn-primary px-8 py-4 text-sm shadow-xl shadow-[#4ff07f]/20">
              Generate Insights
            </button>
            <button className="btn-secondary px-8 py-4 text-sm glass">
              View Analytics
            </button>
          </div>
        </div>

        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80 animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#4ff07f]/20 to-purple-600/20 blur-[60px] rounded-full" />
          <div className="relative w-full h-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl flex items-center justify-center p-8 overflow-hidden group-hover:border-[#4ff07f]/30 transition-all">
             <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-[#4ff07f] mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                   {user.role === 'student' ? 'school' : 'monitoring'}
                </span>
                <div className="text-2xl font-black text-gray-950 dark:text-white">{user.role === 'student' ? 'Lv. 4' : 'HOD v2'}</div>
                <div className="text-[10px] text-gray-700 dark:text-gray-400 uppercase tracking-[0.2em] mt-1">Verification Status</div>
             </div>
             {/* Decorative lines */}
             <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#4ff07f]/20 rounded-tr-[3rem]" />
             <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#4ff07f]/20 rounded-bl-[3rem]" />
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="group relative p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.08] cursor-default overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-2xl" style={{ color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                </div>
                <div className="flex -space-x-2">
                   {[1,2].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[#050505] bg-gray-600 overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/initials/svg?seed=U${i}&backgroundColor=121212&textColor=fff`} alt="" />
                      </div>
                   ))}
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-700 dark:text-gray-500 uppercase tracking-widest leading-none">{s.label}</p>
                <h3 className="text-3xl font-black text-gray-950 dark:text-white">{s.value}</h3>
             </div>
             {/* Sparkline effect (decorative) */}
             <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Table Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black luxury-text">Academic Directory</h2>
            <div className="flex gap-2">
               <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">ios_share</span>
               </button>
               <button className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl">tune</span>
               </button>
            </div>
          </div>

          <div className="rounded-[2rem] glass overflow-hidden border border-white/5 shadow-2xl">
             {loading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                   <div className="w-12 h-12 rounded-full border-2 border-[#4ff07f] border-t-transparent animate-spin" />
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Compiling Database...</p>
                </div>
             ) : (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-white/5">
                            <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Student Profile</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Department</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">CGPA</th>
                            <th className="px-8 py-5 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest text-right">Action</th>
                         </tr>
                      </thead>
                      <tbody>
                         {filtered.slice(0, 8).map((s) => (
                            <tr key={s.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-white/10">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`} alt="" />
                                     </div>
                                     <div>
                                        <div className="text-sm font-bold text-white mb-0.5">{s.name}</div>
                                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{s.id || s.rollNo}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-4">
                                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                     {s.dept}
                                  </span>
                               </td>
                               <td className="px-8 py-4">
                                  <div className="flex items-center gap-2">
                                     <div className="text-sm font-black text-[#4ff07f]">{s.cgpa}</div>
                                     <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#4ff07f]" style={{ width: `${s.cgpa * 10}%` }} />
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-4 text-right">
                                  <button onClick={() => onOpenModal(s)} className="p-2 rounded-lg bg-transparent hover:bg-[#4ff07f]/10 text-gray-500 hover:text-[#4ff07f] transition-all">
                                     <span className="material-symbols-outlined text-lg">open_in_new</span>
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             )}
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#4ff07f]/20 to-transparent border border-[#4ff07f]/10 hover:border-[#4ff07f]/30 transition-all">
              <span className="material-symbols-outlined text-3xl text-[#4ff07f] mb-6">psychology</span>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 tracking-tight">AI Insights</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                 Based on current performance patterns, overall retention is expected to increase by 4% next quarter.
              </p>
              <div className="space-y-3">
                 {[
                   { label: 'Improvement Potentail', val: '88%', color: '#4ff07f' },
                   { label: 'Risk Factor', val: '12%', color: '#ffb4ab' }
                 ].map(i => (
                    <div key={i.label} className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                       <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{i.label}</span>
                       <span className="text-xs font-black" style={{ color: i.color }}>{i.val}</span>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[2rem] bg-indigo-600/5 border border-indigo-600/10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 flex items-center justify-center mb-4">
                 <span className="material-symbols-outlined text-2xl text-indigo-400">workspace_premium</span>
              </div>
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-1">Upgrade To Pro</h3>
              <p className="text-xs text-gray-600 dark:text-gray-500 mb-6 px-4">Unlock predictive analytics and institutional reports.</p>
              <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
                 Explore Enterprise
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
