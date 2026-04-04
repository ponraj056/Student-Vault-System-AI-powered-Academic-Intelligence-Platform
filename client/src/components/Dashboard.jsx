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

export default function Dashboard({ activeNav, onToast, onOpenModal }) {
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
          setStatsData(stats || {});
          setStudentsList(students?.data || []);
          setLoading(false);
          onToast('Backend data synced successfully ✓', 'success');
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
    const next = { ...filters, [key]: value };
    setFilters(next);
    const count = studentsList.filter(s => {
      if (next.dept && s.dept !== next.dept) return false;
      if (next.year && s.year !== parseInt(next.year)) return false;
      if (next.status === 'clear' && s.status !== 'clear') return false;
      if (next.status === 'arrear' && s.status !== 'arrear') return false;
      if (next.cgpa === '9+' && s.cgpa < 9) return false;
      if (next.cgpa === '8+' && (s.cgpa < 8 || s.cgpa >= 9)) return false;
      if (next.cgpa === '7+' && (s.cgpa < 7 || s.cgpa >= 8)) return false;
      if (next.cgpa === 'below7' && s.cgpa >= 7) return false;
      return true;
    }).length;
    if (count === 0) onToast('No students match these filters', 'error');
    else if (count < studentsList.length) onToast(`Found ${count} student${count > 1 ? 's' : ''}`, 'info');
  };

  const handleExport = (type) => {
    onToast(`${type === 'pdf' ? 'PDF report' : 'Excel export'} generated and downloading...`, 'success');
    
    // Create a mock download dynamically from current list
    const content = type === 'pdf' 
      ? 'Mock PDF Content - Imagine a beautifully formatted PDF here.' 
      : 'ID,Name,Dept,Year,CGPA,Attendance,Status\n' + filtered.map(s => `${s.id},${s.name},${s.dept},${s.year},${s.cgpa},${s.attendance},${s.status}`).join('\n');
    
    const blob = new Blob([content], { type: type === 'pdf' ? 'application/pdf' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Avoid filename path issues with slashes safely
    const safeDate = new Date().toISOString().split('T')[0];
    a.download = `Student_Records_${safeDate}.${type === 'pdf' ? 'pdf' : 'csv'}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (activeNav === 'chatbot') return <Chatbot standalone />;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2" style={{ fontSize: 10, letterSpacing: '0.15em' }}>
        <span className="text-gray-400 dark:text-[#8890b5] uppercase font-semibold">Campus Intelligence</span>
        <span className="material-symbols-outlined text-gray-300 dark:text-[#8890b5]" style={{ fontSize: 10 }}>chevron_right</span>
        <span className="text-[#16a34a] dark:text-[#4ff07f] uppercase font-bold">Dashboard</span>
      </nav>

      {/* Stats Row */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {getStatsConfig(statsData).map(s => (
          <div
            key={s.label}
            className="relative rounded-2xl p-5 overflow-hidden transition-all duration-200 hover:-translate-y-1
              bg-white dark:bg-[#1e1e32]
              border border-gray-200 dark:border-white/5
              hover:border-gray-300 dark:hover:border-white/10
              shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30"
          >
            {/* Left accent */}
            <span
              className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r"
              style={{ background: s.accent }}
            />

            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg} flex-shrink-0`}>
                <span
                  className={`material-symbols-outlined text-xl ${s.iconColor}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {s.icon}
                </span>
              </div>
              {s.live ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse bg-[#4ff07f]" />
                  <span className="text-xs font-bold text-[#4ff07f]">Live</span>
                </div>
              ) : (
                <span className={`badge ${s.badgeClass}`}>{s.badge}</span>
              )}
            </div>

            <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-400 dark:text-[#8890b5]">
              {s.label}
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</h3>
          </div>
        ))}
        </div>
      )}

      {/* AI Chatbot widget */}
      <Chatbot />

      {/* Analytics Charts */}
      <Analytics />

      {/* Student Records */}
      <div>
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Academic Records</h2>
            <p className="text-sm mt-0.5 text-gray-500 dark:text-[#8890b5]">
              Manage and filter student data across departments.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => handleExport('csv')}>
              <span className="material-symbols-outlined text-base">download</span>
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button className="btn-secondary" onClick={() => handleExport('pdf')}>
              <span className="material-symbols-outlined text-base">picture_as_pdf</span>
              <span className="hidden sm:inline">PDF Report</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl p-4 mb-6
          bg-white dark:bg-[#1e1e32]
          border border-gray-200 dark:border-white/5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-[#8890b5]">
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filters:
            </div>
            {[
              { key: 'dept', options: [['', 'All Depts'], ['CSE', 'CSE'], ['ECE', 'ECE'], ['IT', 'IT'], ['MECH', 'Mech'], ['CIVIL', 'Civil']] },
              { key: 'year', options: [['', 'All Years'], ['1', '1st Year'], ['2', '2nd Year'], ['3', '3rd Year'], ['4', '4th Year']] },
              { key: 'cgpa', options: [['', 'All CGPA'], ['9+', '9.0+'], ['8+', '8.0–8.9'], ['7+', '7.0–7.9'], ['below7', 'Below 7']] },
              { key: 'status', options: [['', 'All Status'], ['clear', 'Clear'], ['arrear', 'Arrear']] },
            ].map(f => (
              <select
                key={f.key}
                className="filter-select"
                value={filters[f.key]}
                onChange={e => handleFilterChange(f.key, e.target.value)}
              >
                {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            ))}
            <button
              onClick={resetFilters}
              className="ml-auto flex items-center gap-1 text-xs font-bold text-[#4ff07f] hover:text-[#25d366] transition-colors bg-transparent border-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Reset
            </button>
            <span className="text-xs font-mono text-gray-400 dark:text-[#8890b5]">
              {filtered.length === studentsList.length
                ? `All ${studentsList.length} students`
                : `${filtered.length} / ${studentsList.length}`}
            </span>
          </div>
        </div>

        {/* Skeleton loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Student Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {filtered.map(s => <StudentCard key={s.id} student={s} onOpen={onOpenModal} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state flex flex-col items-center justify-center py-20 rounded-2xl
            bg-white dark:bg-[#1e1e32] border border-gray-200 dark:border-white/5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-red-100 dark:bg-[#ffb4ab]/10">
              <span className="material-symbols-outlined text-3xl text-red-400 dark:text-[#ffb4ab]"
                style={{ fontVariationSettings: "'FILL' 1" }}>search_off</span>
            </div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white mb-1">No students found</h3>
            <p className="text-sm text-center max-w-xs text-gray-500 dark:text-[#8890b5] mb-5">
              Try adjusting your filter criteria to find the students.
            </p>
            <button className="btn-primary" onClick={resetFilters}>
              <span className="material-symbols-outlined text-base">refresh</span>
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between mt-5">
            <p className="text-xs font-mono text-gray-400 dark:text-[#8890b5]">
              Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs px-3 py-1.5">
                <span className="material-symbols-outlined text-base">chevron_left</span>
              </button>
              <span className="px-3 py-1.5 text-xs font-bold rounded-lg"
                style={{ background: 'rgba(79,240,127,0.12)', color: '#4ff07f', border: '1px solid rgba(79,240,127,0.2)' }}>
                1
              </span>
              <button className="btn-secondary text-xs px-3 py-1.5">
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
