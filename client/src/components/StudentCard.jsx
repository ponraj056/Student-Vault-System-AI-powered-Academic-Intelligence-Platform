import { getAttendanceColor, getCgpaBadgeStyle } from '../data';

const YEAR_SUFFIX = ['', 'st', 'nd', 'rd', 'th'];

export default function StudentCard({ student, onOpen }) {
  const { name, id, dept, year, cgpa, attendance, status, avatar } = student;
  const attColor = getAttendanceColor(attendance);
  const cgpaBadge = getCgpaBadgeStyle(cgpa);

  return (
    <div
      className="group relative rounded-2xl cursor-pointer fade-in
        bg-white dark:bg-[#1a1a2e]
        border border-gray-200 dark:border-white/5
        hover:border-[#4ff07f]/40 dark:hover:border-[#4ff07f]/30
        shadow-sm hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40
        transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      onClick={() => onOpen(student)}
    >
      {/* Top accent stripe - per status */}
      <div
        className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl"
        style={{ background: status === 'clear' ? '#4ff07f' : '#ffb4ab' }}
      />

      <div className="p-5 pt-6">
        {/* Header: Avatar + Name + Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <img
                src={avatar}
                alt={name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-gray-100 dark:border-white/10 group-hover:border-[#4ff07f]/30 transition-all duration-300"
                onError={e => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e1e32&color=4ff07f`;
                }}
              />
              {/* Status dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2
                  border-white dark:border-[#1a1a2e]
                  ${status === 'clear' ? 'bg-[#4ff07f]' : 'bg-[#ffb4ab]'}`}
              />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-gray-900 dark:text-white group-hover:text-[#16a34a] dark:group-hover:text-[#4ff07f] transition-colors">
                {name}
              </p>
              <p className="text-[11px] font-mono mt-0.5 text-gray-400 dark:text-[#8890b5]">
                {id}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 text-[11px] rounded-full font-bold flex-shrink-0
              ${status === 'clear'
                ? 'bg-green-100 text-green-700 dark:bg-[#4ff07f]/15 dark:text-[#4ff07f]'
                : 'bg-red-100 text-red-600 dark:bg-[#ffb4ab]/15 dark:text-[#ffb4ab]'
              }`}
          >
            {status === 'clear' ? 'Clear' : 'Arrear'}
          </span>
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2 py-0.5 text-[11px] rounded-lg font-semibold
            bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
            {dept}
          </span>
          <span className="px-2 py-0.5 text-[11px] rounded-lg font-semibold
            bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300">
            Y{year}
          </span>
          <span
            className="ml-auto px-2 py-0.5 text-[11px] rounded-lg font-bold"
            style={cgpaBadge}
          >
            {cgpa.toFixed(1)} GPA
          </span>
        </div>

        {/* Attendance bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#8890b5] uppercase tracking-wide">
              Attendance
            </span>
            <span className="text-[11px] font-bold font-mono" style={{ color: attColor }}>
              {attendance}%
            </span>
          </div>

          <div className="w-full h-1.5 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${attendance}%`, background: attColor }}
            />
          </div>

          {attendance < 75 && (
            <p className="text-[11px] mt-1.5 font-semibold text-[#ffb4ab] flex items-center gap-1">
              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Below 75% threshold
            </p>
          )}
        </div>

        {/* CTA button */}
        <button
          className="view-btn w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
            bg-gray-50 text-gray-600 border border-gray-200
            hover:bg-[#4ff07f]/10 hover:border-[#4ff07f]/40 hover:text-[#16a34a]
            dark:bg-white/5 dark:text-[#8890b5] dark:border-white/8
            dark:hover:bg-[#4ff07f]/10 dark:hover:border-[#4ff07f]/30 dark:hover:text-[#4ff07f]"
          onClick={e => { e.stopPropagation(); onOpen(student); }}
        >
          <span className="material-symbols-outlined text-sm">open_in_new</span>
          View Profile
        </button>
      </div>
    </div>
  );
}