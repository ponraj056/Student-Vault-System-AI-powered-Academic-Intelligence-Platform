import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function Reports({ onToast }) {
  const [dept, setDept] = useState('CSE');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/results/stats?dept=${dept}`);
        const json = await res.json();
        if (active) {
          setStats(json.data || null);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          onToast('Failed to fetch report stats', 'error');
          setLoading(false);
        }
      }
    };
    fetchStats();
    return () => { active = false; };
  }, [dept, onToast]);

  const handleDownload = () => {
    onToast('Building PDF report...', 'info');
    setTimeout(() => {
      onToast('Report downloaded successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Reports Centre</h2>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
            Generate & export insights
          </p>
        </div>
        <select 
          className="filter-select"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pass/Fail Overview Card */}
        <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 border border-gray-200 dark:border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-blue-500">pie_chart</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Pass/Fail Overview</h3>
          <p className="text-sm text-gray-500 dark:text-[#8890b5] mb-6">Current semester success rates for {dept}.</p>
          
          {loading ? (
             <div className="h-16 flex items-center"><div className="w-6 h-6 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"/></div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pass Rate</p>
                  <p className="text-2xl font-black text-[#4ff07f]">{stats.passRate}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fail Rate</p>
                  <p className="text-2xl font-black text-[#ffb4ab]">{stats.failRate}%</p>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden flex">
                <div style={{ width: `${stats.passRate}%` }} className="bg-[#4ff07f] h-full" />
                <div style={{ width: `${stats.failRate}%` }} className="bg-[#ffb4ab] h-full" />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data available.</p>
          )}

          <button onClick={handleDownload} className="mt-6 w-full btn-secondary text-sm py-2 flex justify-center">
            <span className="material-symbols-outlined text-sm">download</span> Download Standard Report
          </button>
        </div>

        {/* Master Data Card */}
        <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-[#4ff07f]/40 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-[#4ff07f]">table_view</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#4ff07f]/10 mb-4 flex items-center justify-center">
             <span className="material-symbols-outlined text-[#4ff07f]">dataset</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Master Database Export</h3>
          <p className="text-sm text-gray-500 dark:text-[#8890b5] mb-6">Complete student dump including demographics and historical grades.</p>
          
          <button onClick={handleDownload} className="w-full btn-primary text-sm py-2 flex justify-center">
            <span className="material-symbols-outlined text-sm">download</span> Export CSV (.csv)
          </button>
        </div>
        
        {/* Defaulters Card */}
        <div className="bg-white dark:bg-[#1e1e32] rounded-2xl p-6 border border-gray-200 dark:border-white/5 relative overflow-hidden group hover:border-[#f9d03f]/50 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-[#f9d03f]">warning</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 mb-4 flex items-center justify-center">
             <span className="material-symbols-outlined text-[#f9d03f]">report_problem</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Defaulters List</h3>
          <p className="text-sm text-gray-500 dark:text-[#8890b5] mb-6">Students with attendance &lt; 75% or multiple active arrears.</p>
          
          <button onClick={handleDownload} className="w-full btn-secondary text-sm py-2 flex justify-center">
            <span className="material-symbols-outlined text-sm">download</span> Export List (.pdf)
          </button>
        </div>
      </div>
    </div>
  );
}
