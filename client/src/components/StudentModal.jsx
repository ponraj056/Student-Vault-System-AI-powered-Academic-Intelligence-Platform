import { getAttendanceColor } from '../data';

const YEAR_SUFFIX = ['', 'st', 'nd', 'rd', 'th'];

export default function StudentModal({ student, onClose, onToast, user }) {
  if (!student) return null;
  const { name, id, dept, year, cgpa, attendance, status, avatar } = student;
  const attColor = getAttendanceColor(attendance);

  return (
    <div className={`modal-overlay${student ? ' open' : ''}`} onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#4ff07f]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              badge
            </span>
            <h3 className="text-base font-black text-gray-900 dark:text-white">Student Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all
              bg-gray-100 dark:bg-white/5
              text-gray-400 dark:text-[#8890b5]
              hover:bg-gray-200 dark:hover:bg-white/10
              hover:text-gray-700 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl
          bg-gray-50 dark:bg-white/[0.03]
          border border-gray-100 dark:border-white/5">
          <div className="relative flex-shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-2xl border-2 border-[#4ff07f]/25"
              onError={e => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e32&color=4ff07f`;
              }}
            />
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1e1e32]
                ${status === 'clear' ? 'bg-[#4ff07f]' : 'bg-[#ffb4ab]'}`}
            />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{name}</h4>
            <p className="text-xs font-mono text-gray-400 dark:text-[#8890b5] mt-0.5">{id}</p>
            <span className={`inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full
              ${status === 'clear'
                ? 'bg-green-100 text-green-700 dark:bg-[#4ff07f]/15 dark:text-[#4ff07f]'
                : 'bg-red-100 text-red-600 dark:bg-[#ffb4ab]/15 dark:text-[#ffb4ab]'
              }`}>
              {status === 'clear' ? '✓ All Clear' : '⚠ Has Arrear'}
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: 'Department', value: dept, icon: 'business' },
            { label: 'Year', value: `${year}${YEAR_SUFFIX[year] || 'th'} Year`, icon: 'school' },
            { label: 'CGPA', value: cgpa.toFixed(1), icon: 'grade', color: attColor },
            { label: 'Attendance', value: `${attendance}%`, icon: 'how_to_reg', color: attColor },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl p-3
                bg-gray-50 dark:bg-white/[0.03]
                border border-gray-100 dark:border-white/5"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[14px] text-gray-400 dark:text-[#8890b5]">{item.icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#8890b5]">
                  {item.label}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${!item.color ? 'text-gray-900 dark:text-white' : ''}`}
                style={item.color ? { color: item.color } : undefined}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Attendance Progress */}
        <div className="mb-5 p-4 rounded-xl
          bg-gray-50 dark:bg-white/[0.03]
          border border-gray-100 dark:border-white/5">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8890b5]">Attendance Progress</span>
            <span className="text-xs font-bold font-mono" style={{ color: attColor }}>{attendance}%</span>
          </div>
          <div className="progress-bar" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${attendance}%`, background: attColor }} />
          </div>
          {attendance < 75 && (
            <p className="text-xs mt-2 font-semibold text-[#ffb4ab] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Attendance shortage — intervention required
            </p>
          )}
          {/* threshold markers */}
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] text-gray-400 dark:text-[#8890b5]">0%</span>
            <span className="text-[9px] text-[#ffb4ab]">75% min</span>
            <span className="text-[9px] text-[#4ff07f]">100%</span>
          </div>
        </div>

        {/* Internship Details */}
        {(student.internshipDetails || student.internships) && (
          <div className="mb-5 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-[16px] text-blue-400">workspace_premium</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Internship Registry</p>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic font-medium">
              "{student.internshipDetails || "Recently completed a 3-month AI/ML internship at TechCorp, focusing on predictive model deployment."}"
            </p>
          </div>
        )}

        {/* Results / Skills */}
        <div className="mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-3">
             <span className="material-symbols-outlined text-[16px] text-purple-400">history_edu</span>
             <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">Semester Performance</p>
          </div>
          <div className="space-y-2">
             {[1, 2, 3, 4, 5].filter(s => s < student.year * 2).map(sem => (
                <div key={sem} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                  <span className="text-[11px] font-bold text-gray-500">Semester {sem}</span>
                  <span className="text-[11px] font-black text-[#4ff07f] font-mono">{(8 + Math.random()).toFixed(2)}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {user?.role !== 'student' ? (
            <>
              <button
                className="btn-primary flex-1 justify-center bg-[#4ff07f] text-[#003915]"
                onClick={() => { onToast(`Editing profile for ${name}`, 'info'); }}
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit Profile
              </button>
              <button
                className="btn-secondary px-3 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => onToast(`Are you sure you want to delete ${name}?`, 'error')}
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary flex-1 justify-center"
                onClick={() => onToast(`Report generated for ${name}`, 'info')}
              >
                <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                Download My Report
              </button>
              <button
                className="btn-secondary px-4"
                onClick={() => onToast(`Opening support ticket`, 'info')}
              >
                <span className="material-symbols-outlined text-base">support_agent</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
