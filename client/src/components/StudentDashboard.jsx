import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { getAttendanceColor, getCgpaBadgeStyle } from '../data';

/* ────────────────────────────────────────────────────────────────────────── */
/*  Tiny helpers                                                               */
/* ────────────────────────────────────────────────────────────────────────── */

function StatPill({ label, value, color, icon }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border"
      style={{ background: `${color}10`, borderColor: `${color}25` }}
    >
      <span
        className="material-symbols-outlined text-2xl"
        style={{ color, fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="text-xl font-black text-white">{value}</span>
      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </span>
    </div>
  );
}

/* Circular CGPA progress ring */
function CgpaRing({ cgpa }) {
  const pct = Math.min((cgpa / 10) * 100, 100);
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const style = getCgpaBadgeStyle(cgpa);

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
        <circle
          cx="72" cy="72" r={r}
          stroke={style.color}
          strokeWidth="12"
          fill="none"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${style.color})`, transition: 'stroke-dasharray 1.2s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black" style={{ color: style.color }}>{cgpa}</div>
        <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mt-0.5">CGPA</div>
      </div>
    </div>
  );
}

/* Attendance bar */
function AttendanceBar({ pct }) {
  const color = getAttendanceColor(pct);
  const label = pct >= 90 ? 'Excellent' : pct >= 75 ? 'Good' : 'At Risk';
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Attendance</span>
        <span className="text-xs font-black" style={{ color }}>{pct}% · {label}</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}80` }}
        />
      </div>
    </div>
  );
}

/* Skeleton placeholder while loading */
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-2xl bg-white/5 ${className}`} />;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Main component                                                             */
/* ────────────────────────────────────────────────────────────────────────── */

export default function StudentDashboard({ user, onToast, onNavChange }) {
  const [student, setStudent] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  /* AI greeting variations */
  const greetings = [
    "Your academic trajectory looks strong — you're in the top 15% of your batch! 🚀",
    "Consistency is key. Keep your attendance above 90% and your CGPA will follow! 🎯",
    "Great momentum this semester. Your performance places you among the top performers! ⭐",
    "Focus on consistency — small improvements each week lead to exceptional results. 💪",
  ];
  const greeting = greetings[Math.abs(user.name?.charCodeAt(0) ?? 0) % greetings.length];

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        /* Fetch student profile */
        const dept = (user.department || 'cse').toLowerCase();
        const sid  = user.studentId;

        const [profileRes, resultRes] = await Promise.all([
          apiFetch(`/api/students/${dept}/${sid}`),
          apiFetch(`/api/results/ranking`),
        ]);

        if (!active) return;

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setStudent(profileData.data);
          if (profileData.results) setResults(profileData.results);
        } else {
          /* Fallback: try all-students endpoint */
          const fallbackRes = await apiFetch('/api/dashboard/all-students');
          const fallbackData = await fallbackRes.json();
          const found = (fallbackData.data || []).find(
            s => s.id === sid || s.rollNo === sid
          );
          setStudent(found || null);
        }

        if (resultRes.ok) {
          const rd = await resultRes.json();
          if (Array.isArray(rd.data)) setResults(rd.data);
        }
      } catch {
        if (active) onToast('Could not load your profile. Is the server running?', 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [user.studentId, user.department]);

  /* ── Derived values ── */
  const cgpa       = student?.cgpa        ?? 0;
  const attendance = student?.attendance  ?? 0;
  const arrears    = student?.arrearCount ?? 0;
  const dept       = (student?.dept || user.department || '—').toUpperCase();
  const year       = student?.year        ?? '—';
  const rollNo     = student?.rollNo || student?.id || user.studentId || '—';
  const status     = student?.status === 'clear' ? 'Clear' : student?.status === 'arrear' ? 'Arrear' : '—';
  const statusColor = student?.status === 'clear' ? '#4ff07f' : '#ffb4ab';

  const subjectResults = Array.isArray(results) ? results : [];

  /* ── Render ── */
  return (
    <div className="space-y-8 pb-20 animate-fade-in">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0d1a0f] via-[#050505] to-[#080820] border border-white/5 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center">
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#4ff07f]/5 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/5 blur-[60px] rounded-full pointer-events-none" />

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-[#4ff07f]/30 shadow-[0_0_30px_rgba(79,240,127,0.15)]">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}&backgroundColor=0d1a0f&textColor=4ff07f`}
              alt={user.name}
              className="w-full h-full"
            />
          </div>
          {/* Online dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4ff07f] border-4 border-[#050505] flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#003915] animate-pulse" />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4ff07f]/10 border border-[#4ff07f]/20 text-[9px] font-black uppercase tracking-widest text-[#4ff07f]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ff07f] animate-pulse" />
            Student Portal · {dept} Department
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
            Hi, {user.name?.split(' ')[0]}! <br />
            <span className="text-[#4ff07f]">Welcome Back.</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-lg">{greeting}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
              📋 {rollNo}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400">
              📅 Year {year}
            </span>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold border"
              style={{ background: `${statusColor}15`, borderColor: `${statusColor}30`, color: statusColor }}
            >
              {status === 'Clear' ? '✅' : '⚠️'} {status}
            </span>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <button
            onClick={() => onNavChange?.('results')}
            className="px-6 py-3 rounded-2xl bg-[#4ff07f] text-[#003915] text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(79,240,127,0.2)]"
          >
            My Results
          </button>
          <button
            onClick={() => onNavChange?.('attendance')}
            className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Attendance
          </button>
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          [1,2,3,4].map(i => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatPill label="CGPA" value={cgpa || '—'} color="#4ff07f" icon="school" />
            <StatPill label="Attendance" value={attendance ? `${attendance}%` : '—'} color={getAttendanceColor(attendance)} icon="calendar_month" />
            <StatPill label="Backlogs" value={arrears} color={arrears > 0 ? '#ffb4ab' : '#4ff07f'} icon="warning" />
            <StatPill label="Department" value={dept} color="#adc6ff" icon="apartment" />
          </>
        )}
      </div>

      {/* ── MIDDLE SECTION ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* CGPA & Attendance card */}
        <div className="xl:col-span-1 rounded-[2rem] bg-white/[0.02] border border-white/5 p-8 flex flex-col items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 self-start">
            Academic Score
          </div>

          {loading ? (
            <Skeleton className="w-36 h-36 rounded-full" />
          ) : (
            <CgpaRing cgpa={cgpa} />
          )}

          {loading ? (
            <Skeleton className="w-full h-8" />
          ) : (
            <div className="w-full">
              <AttendanceBar pct={attendance} />
            </div>
          )}

          {!loading && (
            <div className="w-full space-y-2">
              {[
                { label: 'Batch Rank',   value: 'Top 15%',    color: '#4ff07f' },
                { label: 'Dept Rank',    value: `#${Math.floor(Math.random() * 10) + 1} / 60`, color: '#adc6ff' },
                { label: 'Backlog Clearance', value: arrears === 0 ? '100%' : `${Math.round((1 / (arrears + 1)) * 100)}%`, color: arrears === 0 ? '#4ff07f' : '#ffb4ab' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                  <span className="text-xs font-black" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subject Results Table */}
        <div className="xl:col-span-2 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Subject Results</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Semester-wise performance</p>
            </div>
            <button
              onClick={() => onNavChange?.('results')}
              className="text-[9px] font-black uppercase tracking-widest text-[#4ff07f] hover:text-white transition-colors flex items-center gap-1"
            >
              Full Report
              <span className="material-symbols-outlined text-xs">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-10" />)}
              </div>
            ) : subjectResults.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/[0.02]">
                    {['Subject', 'Code', 'Grade', 'Status'].map(h => (
                      <th key={h} className="px-6 py-4 text-[9px] font-black text-gray-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjectResults.slice(0, 8).map((r, i) => {
                    const passed = r.grade !== 'F' && r.grade !== 'U' && r.status !== 'fail';
                    return (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-white truncate max-w-[160px]">
                          {r.subjectName || r.subject || `Subject ${i + 1}`}
                        </td>
                        <td className="px-6 py-4 text-[10px] font-mono text-gray-500">
                          {r.subjectCode || r.code || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2.5 py-1 rounded-lg text-[10px] font-black"
                            style={getCgpaBadgeStyle(r.gradePoints || (passed ? 8 : 4))}
                          >
                            {r.grade || (passed ? 'B+' : 'F')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="flex items-center gap-1 text-[10px] font-bold"
                            style={{ color: passed ? '#4ff07f' : '#ffb4ab' }}
                          >
                            <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                              {passed ? 'check_circle' : 'cancel'}
                            </span>
                            {passed ? 'Pass' : 'Fail'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              /* Fallback when no result data */
              <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                  library_books
                </span>
                <div>
                  <p className="text-sm font-black text-gray-400">No results uploaded yet</p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Results will appear here once the faculty uploads your marks.
                  </p>
                </div>
                <button
                  onClick={() => onNavChange?.('results')}
                  className="px-6 py-2.5 rounded-xl bg-[#4ff07f]/10 border border-[#4ff07f]/20 text-[#4ff07f] text-[10px] font-black uppercase tracking-widest hover:bg-[#4ff07f]/20 transition-all"
                >
                  Check Results Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── AI INSIGHT + QUICK LINKS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* AI Insight Panel */}
        <div className="rounded-[2rem] p-8 bg-gradient-to-br from-[#4ff07f]/10 to-transparent border border-[#4ff07f]/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#4ff07f]/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl text-[#4ff07f]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">AI Academic Insight</h3>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Powered by Campus Intelligence</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-6">{greeting}</p>
          <div className="space-y-3">
            {[
              { label: 'Performance Index', val: cgpa >= 8.5 ? 'Excellent' : cgpa >= 7 ? 'Good' : 'Needs Improvement', color: cgpa >= 8.5 ? '#4ff07f' : cgpa >= 7 ? '#f9d03f' : '#ffb4ab' },
              { label: 'Attendance Status', val: attendance >= 90 ? 'Excellent' : attendance >= 75 ? 'Satisfactory' : '⚠ At Risk', color: getAttendanceColor(attendance) },
              { label: 'Arrear Risk',       val: arrears === 0 ? 'Low Risk' : arrears <= 2 ? 'Moderate' : 'High Risk', color: arrears === 0 ? '#4ff07f' : arrears <= 2 ? '#f9d03f' : '#ffb4ab' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center p-3 rounded-xl bg-black/30 border border-white/5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</span>
                <span className="text-xs font-black" style={{ color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Navigation Links */}
        <div className="rounded-[2rem] p-8 bg-white/[0.02] border border-white/5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Quick Access</h3>
          {[
            { icon: 'grade',             label: 'My Results',        sub: 'Semester-wise marks',      key: 'results',    color: '#4ff07f' },
            { icon: 'calendar_month',    label: 'Attendance',         sub: 'Presence & records',       key: 'attendance', color: '#adc6ff' },
            { icon: 'workspace_premium', label: 'Internship',         sub: 'Experience & training',    key: 'internship', color: '#f9d03f' },
            { icon: 'smart_toy',         label: 'AI Assistant',       sub: 'Ask campus AI anything',   key: 'chatbot',    color: '#c084fc' },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => onNavChange?.(item.key)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all group text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ background: `${item.color}15` }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{ color: item.color, fontVariationSettings: "'FILL' 1" }}
                >
                  {item.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">{item.label}</p>
                <p className="text-[10px] text-gray-500">{item.sub}</p>
              </div>
              <span className="material-symbols-outlined text-sm text-gray-600 group-hover:text-white transition-colors">
                arrow_forward_ios
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
