import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

export default function Attendance({ onToast, user }) {
  const [dept, setDept] = useState(user.role === 'student' ? user.department?.toUpperCase() || 'CSE' : 'CSE');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/attendance/${dept}`);
        const data = await res.json();
        if (active) {
          let list = data.data || [];
          if (user.role === 'student' && user.studentId) {
            list = list.filter(r => r.rollNo === user.studentId);
          }
          setRecords(list);
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          onToast('Failed to fetch attendance', 'error');
          setLoading(false);
        }
      }
    };
    fetchAttendance();
    return () => { active = false; };
  }, [dept, onToast, user]);

  const filtered = records.filter(r => {
    if (dateFilter && !r.date.includes(dateFilter)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
            {user.role === 'student' ? 'My Attendance' : 'Attendance Tracker'}
          </h2>
          <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
            {user.role === 'student' ? 'Personal presence analytics' : 'Real-time presence analytics'}
          </p>
        </div>
        <div className="flex gap-3">
          {user.role !== 'student' && (
            <select 
              className="filter-select"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
            >
              {['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}
          <input 
            type="text"
            placeholder="Filter Date (e.g. 01-Apr)"
            className="filter-select bg-white dark:bg-[#1e1e32]"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1e32] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#4ff07f] border-t-transparent animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-[#8890b5]">
            {user.role === 'student' ? 'No attendance records found for you.' : `No attendance records found for ${dept}.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-[#8890b5] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
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
                    <td className="px-6 py-4 text-sm font-mono text-gray-500 dark:text-[#8890b5]">{record.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        record.status === 'P' 
                          ? 'bg-green-100 text-green-700 dark:bg-[#4ff07f]/15 dark:text-[#4ff07f]' 
                          : 'bg-red-100 text-red-600 dark:bg-[#ffb4ab]/15 dark:text-[#ffb4ab]'
                      }`}>
                        {record.status === 'P' ? 'Present' : 'Absent'}
                      </span>
                    </td>
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
