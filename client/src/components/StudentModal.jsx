import { getAttendanceColor, getCgpaBadgeStyle } from '../data';

const YEAR_SUFFIX = ['', 'st', 'nd', 'rd', 'th'];

export default function StudentModal({ student, onClose, onToast }) {
  if (!student) return null;
  const { name, id, dept, year, cgpa, attendance, status, avatar } = student;
  const attColor = getAttendanceColor(attendance);

  return (
    <div className={`modal-overlay${student ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-black text-white">Student Profile</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#8890b5' }}
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-xl"
            style={{ border: '1px solid rgba(79,240,127,0.2)' }}
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e32&color=4ff07f`; }}
          />
          <div>
            <h4 className="text-lg font-black text-white">{name}</h4>
            <p className="text-sm font-mono" style={{ color: '#8890b5' }}>{id}</p>
            <span className={`badge ${status === 'clear' ? 'badge-success' : 'badge-danger'} mt-1`}>
              {status === 'clear' ? '✓ All Clear' : '⚠ Has Arrear'}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Department', value: dept },
            { label: 'Year', value: `${year}${YEAR_SUFFIX[year] || 'th'} Year` },
            { label: 'CGPA', value: cgpa.toFixed(1), color: attColor },
            { label: 'Attendance', value: `${attendance}%`, color: attColor },
          ].map(item => (
            <div key={item.label} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8890b5' }}>{item.label}</p>
              <p className="text-sm font-bold" style={{ color: item.color || 'white' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="mb-5">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-semibold" style={{ color: '#8890b5' }}>Attendance Progress</span>
            <span className="text-xs font-bold font-mono" style={{ color: attColor }}>{attendance}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${attendance}%`, background: attColor }} />
          </div>
          {attendance < 75 && (
            <p className="text-xs mt-2 font-semibold" style={{ color: '#ffb4ab' }}>⚠ Attendance shortage — intervention required</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button className="btn-primary flex-1 justify-center" onClick={() => { onToast(`Notification sent to ${name}`, 'success'); onClose(); }}>
            <span className="material-symbols-outlined text-base">notifications</span>
            Notify Student
          </button>
          <button className="btn-secondary flex-1 justify-center" onClick={() => { onToast(`Report generated for ${name}`, 'info'); }}>
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
