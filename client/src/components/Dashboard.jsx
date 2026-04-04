import { useState, useEffect } from 'react';
import { STUDENTS } from '../data';
import StudentCard from './StudentCard';
import Analytics from './Analytics';
import Chatbot from './Chatbot';

const STATS = [
  { label: 'Total Students', value: '4,892', badge: '+12.4%', badgeClass: 'badge-success', icon: 'group', accent: '#4ff07f', bg: 'rgba(79,240,127,0.1)', iconColor: '#4ff07f' },
  { label: 'Present Today', value: '4,608', badge: '94.2%', badgeClass: 'badge-info', icon: 'how_to_reg', accent: '#adc6ff', bg: 'rgba(173,198,255,0.1)', iconColor: '#adc6ff' },
  { label: 'Arrear Count', value: '214', badge: '-2.1%', badgeClass: 'badge-danger', icon: 'warning', accent: '#ffb4ab', bg: 'rgba(255,180,171,0.1)', iconColor: '#ffb4ab' },
  { label: 'Active Reports', value: '18', badge: 'Live', badgeClass: 'badge-success', icon: 'analytics', accent: '#f9d03f', bg: 'rgba(249,208,63,0.1)', iconColor: '#f9d03f', live: true },
];

function SkeletonCard() {
  return (
    <div className="rounded-xl p-5" style={{ background: '#1e1e32', border: '1px solid rgba(60,74,61,0.3)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="skeleton w-12 h-12 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-3 w-3/4 mb-2" />
          <div className="skeleton h-2 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-2 w-full mb-2" />
      <div className="skeleton h-2 w-2/3 mb-4" />
      <div className="skeleton h-6 w-full rounded-xl" />
    </div>
  );
}

export default function Dashboard({ activeNav, onToast, onOpenModal }) {
  const [filters, setFilters] = useState({ dept: '', year: '', cgpa: '', status: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
      onToast('Data fetched successfully ✓', 'success');
    }, 900);
    return () => clearTimeout(t);
  }, []);

  const filtered = STUDENTS.filter(s => {
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
    const count = STUDENTS.filter(s => {
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
    if (count === 0) onToast('No students found for selected filters', 'error');
    else if (count < STUDENTS.length) onToast(`Found ${count} student${count > 1 ? 's' : ''} matching filters`, 'info');
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-6" style={{ fontSize: 10, color: '#8890b5', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
        <span>Campus Intelligence</span>
        <span className="material-symbols-outlined" style={{ fontSize: 10 }}>chevron_right</span>
        <span style={{ color: '#4ff07f' }}>Dashboard</span>
      </nav>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="stat-card">
            <div className="absolute top-0 left-0 w-[3px] h-full rounded-l" style={{ background: s.accent }} />
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <span className="material-symbols-outlined text-xl" style={{ color: s.iconColor, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              {s.live ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ff07f' }} />
                  <span className="text-xs font-bold" style={{ color: '#4ff07f' }}>Live</span>
                </div>
              ) : (
                <span className={`badge ${s.badgeClass}`}>{s.badge}</span>
              )}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8890b5' }}>{s.label}</p>
            <h3 className="text-2xl font-black text-white">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Chatbot */}
      <Chatbot />

      {/* Charts */}
      <Analytics />

      {/* Student Records */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Academic Records</h2>
            <p className="text-sm mt-0.5" style={{ color: '#8890b5' }}>Manage and filter student data across departments.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => onToast('Excel export initiated', 'info')}>
              <span className="material-symbols-outlined text-base">download</span> Export Excel
            </button>
            <button className="btn-secondary" onClick={() => onToast('PDF report generation started', 'info')}>
              <span className="material-symbols-outlined text-base">picture_as_pdf</span> PDF Report
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl p-5 mb-6" style={{ background: '#1e1e32', border: '1px solid rgba(60,74,61,0.3)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#8890b5' }}>
              <span className="material-symbols-outlined text-base">filter_list</span>
              Filters:
            </div>
            {[
              { key: 'dept', options: [['', 'All Departments'], ['CSE', 'CSE'], ['ECE', 'ECE'], ['IT', 'IT'], ['MECH', 'Mechanical'], ['CIVIL', 'Civil']] },
              { key: 'year', options: [['', 'All Years'], ['1', '1st Year'], ['2', '2nd Year'], ['3', '3rd Year'], ['4', '4th Year']] },
              { key: 'cgpa', options: [['', 'CGPA: All'], ['9+', '9.0 and above'], ['8+', '8.0 – 8.9'], ['7+', '7.0 – 7.9'], ['below7', 'Below 7.0']] },
              { key: 'status', options: [['', 'All Status'], ['clear', 'All Clear'], ['arrear', 'Has Arrear']] },
            ].map(f => (
              <select key={f.key} className="filter-select" value={filters[f.key]} onChange={e => handleFilterChange(f.key, e.target.value)}>
                {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            ))}
            <button onClick={resetFilters} className="ml-auto flex items-center gap-1 text-xs font-bold transition-colors" style={{ color: '#4ff07f', background: 'none', border: 'none', cursor: 'pointer' }}>
              <span className="material-symbols-outlined text-sm">refresh</span> Reset
            </button>
            <div className="text-xs font-medium font-mono" style={{ color: '#8890b5' }}>
              {filtered.length === STUDENTS.length ? `Showing all ${STUDENTS.length} students` : `Showing ${filtered.length} of ${STUDENTS.length} students`}
            </div>
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
            {filtered.map(s => <StudentCard key={s.id} student={s} onOpen={onOpenModal} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,180,171,0.1)' }}>
              <span className="material-symbols-outlined text-3xl" style={{ color: '#ffb4ab' }}>search_off</span>
            </div>
            <h3 className="text-base font-bold text-white mb-1">No students found</h3>
            <p className="text-sm text-center max-w-xs" style={{ color: '#8890b5' }}>Try adjusting your filter criteria.</p>
            <button className="btn-primary mt-4" onClick={resetFilters}>
              <span className="material-symbols-outlined text-base">refresh</span> Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs font-mono" style={{ color: '#8890b5' }}>Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}</p>
            <div className="flex items-center gap-2">
              <button className="btn-secondary text-xs px-3 py-1.5"><span className="material-symbols-outlined text-base">chevron_left</span></button>
              <span className="px-3 py-1.5 text-xs font-bold rounded" style={{ background: 'rgba(79,240,127,0.12)', color: '#4ff07f', border: '1px solid rgba(79,240,127,0.2)' }}>1</span>
              <button className="btn-secondary text-xs px-3 py-1.5"><span className="material-symbols-outlined text-base">chevron_right</span></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
