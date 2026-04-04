import { getAttendanceColor, getCgpaBadgeStyle } from '../data';

const YEAR_SUFFIX = ['', 'st', 'nd', 'rd', 'th'];

export default function StudentCard({ student, onOpen }) {
  const { name, id, dept, year, cgpa, attendance, status, avatar } = student;
  const attColor = getAttendanceColor(attendance);
  const cgpaBadge = getCgpaBadgeStyle(cgpa);

  return (
    <div className="student-card p-5 fade-in" onClick={() => onOpen(student)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-xl"
              style={{ border: '1px solid rgba(79,240,127,0.15)' }}
              onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e32&color=4ff07f`; }}
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full" style={{ border: '2px solid #1e1e32', background: status === 'clear' ? '#4ff07f' : '#ffb4ab' }} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{name}</p>
            <p className="text-xs font-mono mt-0.5" style={{ color: '#8890b5' }}>{id}</p>
          </div>
        </div>
        <span className={`badge ${status === 'clear' ? 'badge-success' : 'badge-danger'}`}>
          {status === 'clear' ? 'Clear' : 'Arrear'}
        </span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="badge badge-dept">{dept}</span>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#bbcbb9' }}>
          {year}{YEAR_SUFFIX[year] || 'th'} Year
        </span>
        <span className="badge ml-auto" style={cgpaBadge}>CGPA {cgpa.toFixed(1)}</span>
      </div>

      {/* Attendance bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold" style={{ color: '#8890b5' }}>Attendance</span>
          <span className="text-xs font-bold font-mono" style={{ color: attColor }}>{attendance}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${attendance}%`, background: attColor }} />
        </div>
        {attendance < 75 && (
          <p className="text-xs mt-1.5 font-semibold" style={{ color: '#ffb4ab' }}>⚠ Below minimum threshold</p>
        )}
      </div>

      {/* View button */}
      <button
        className="view-btn w-full flex items-center justify-center gap-1.5 py-2 rounded text-xs font-bold transition-all"
        style={{ background: 'rgba(79,240,127,0.08)', color: '#4ff07f', border: '1px solid rgba(79,240,127,0.15)' }}
        onClick={e => { e.stopPropagation(); onOpen(student); }}
      >
        <span className="material-symbols-outlined text-sm">open_in_new</span>
        View Details
      </button>
    </div>
  );
}
