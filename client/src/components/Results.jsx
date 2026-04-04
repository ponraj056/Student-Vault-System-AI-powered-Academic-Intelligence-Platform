import { useState, useEffect } from 'react';

export default function Results({ onToast, user }) {
  const [dept, setDept] = useState(user.role === 'student' ? user.department?.toUpperCase() || 'CSE' : 'CSE');
  const [activeTab, setActiveTab] = useState(user.role === 'student' ? 'personal' : 'ranking');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const url = activeTab === 'ranking' 
          ? `/api/results/ranking?dept=${dept}`
          : activeTab === 'arrears'
          ? `/api/results/arrears?dept=${dept}`
          : activeTab === 'personal'
          ? `/api/results/ranking?dept=${dept}` // Reuse ranking for personal search or add specific route
          : `/api/results/topper?dept=${dept}&semester=5`;
          
        const res = await fetch(url);
        const json = await res.json();
        if (active) {
          let list = json.data || [];
          if (user.role === 'student' && user.studentId) {
            list = list.filter(r => r.rollNo === user.studentId);
          }
          setData(list);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          onToast('Failed to fetch results', 'error');
          setLoading(false);
        }
      }
    };
    fetchResults();
    return () => { active = false; };
  }, [dept, activeTab, onToast, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            {user.role === 'student' ? 'My Academic Results' : 'Examination Results'}
          </h2>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
            {user.role === 'student' ? 'Your personal grade & performance records' : 'Grade & performance records'}
          </p>
        </div>
        <div className="flex gap-3">
          {user.role !== 'student' && (
            <>
              <div className="flex bg-white dark:bg-[#1e1e32] rounded-lg p-1 border border-gray-200 dark:border-white/5">
                {[
                  { id: 'ranking', label: 'Ranking' },
                  { id: 'toppers', label: 'Toppers' },
                  { id: 'arrears', label: 'Arrears' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-[#4ff07f]/10 text-[#4ff07f]' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-[#8890b5] dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
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
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e32] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#4ff07f] border-t-transparent animate-spin"/>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-[#8890b5]">
            {user.role === 'student' ? 'No result records found for you.' : `No result records found for ${dept} (${activeTab}).`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  {(activeTab === 'ranking' || user.role === 'student') && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Rank</th>}
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Semester</th>
                  {activeTab !== 'arrears' && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">CGPA</th>}
                  {activeTab === 'arrears' && <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Arrears</th>}
                </tr>
              </thead>
              <tbody>
                {data.map((record, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    {(activeTab === 'ranking' || user.role === 'student') && (
                      <td className="px-6 py-4 text-sm font-bold text-[#f9d03f]">
                        #{record.rank || i + 1}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(record.name?.substring(0,2) || 'S')}&backgroundColor=4ff07f&textColor=003915`}
                          alt="" className="w-8 h-8 rounded-lg"
                        />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{record.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-[#8890b5]">{record.rollNo || '-'}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-[#8890b5]">{record.semester || '-'}</td>
                    
                    {activeTab !== 'arrears' && (
                      <td className="px-6 py-4 text-sm font-bold text-[#4ff07f]">{record.cgpa}</td>
                    )}
                    {activeTab === 'arrears' && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-600 dark:bg-[#ffb4ab]/15 dark:text-[#ffb4ab]">
                          {record.arrears} Arrears
                        </span>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
