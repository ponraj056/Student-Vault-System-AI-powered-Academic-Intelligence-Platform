/**
 * client/src/pages/Dashboard.jsx  (v3 — PRD-compliant)
 * ───────────────────────────────────────────────────────
 * Student dashboard: profile card w/ photo upload, CGPA, results,
 * attendance, pending update requests, AI chatbot.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatBot from '../components/ChatBot';
import './Dashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ── Stat Card ──
function StatCard({ title, value, sub, icon, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <p className="stat-value">{value}</p>
        <p className="stat-title">{title}</p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  );
}

// ── Attendance Row ──
function AttendanceRow({ subject, percentage, month }) {
  const pct = Math.round(percentage);
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="att-row">
      <div className="att-meta">
        <span className="att-subject">{subject}</span>
        <span className="att-month">{month}</span>
      </div>
      <div className="att-bar-track">
        <div className="att-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="att-pct" style={{ color }}>{pct}%</span>
    </div>
  );
}

// ── Result Row ──
function ResultRow({ subject, marks, grade, semester }) {
  const gradeColor = grade === 'O' ? '#10b981' : grade === 'U' ? '#ef4444' : '#a5b4fc';
  return (
    <div className="result-row">
      <div>
        <p className="result-subject">{subject}</p>
        <p className="result-sem">Semester {semester}</p>
      </div>
      <div className="result-right">
        <span className="result-marks">{marks}</span>
        <span className="result-grade" style={{ color: gradeColor }}>{grade}</span>
      </div>
    </div>
  );
}

// ── Profile Photo with Upload ──
function ProfilePhoto({ photo, name, regNo, token, onUploaded }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await axios.post(`${API}/api/student/upload-photo`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      onUploaded(data.data?.profilePhoto || data.profilePhoto);
    } catch (err) {
      alert(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const initials = name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <div className="profile-photo-wrap" onClick={() => fileRef.current?.click()} title="Click to upload photo">
      {photo ? (
        <img src={photo} alt={name} className="profile-photo-img" />
      ) : (
        <div className="profile-photo-fallback">{initials}</div>
      )}
      {uploading && <div className="profile-photo-loading"><span className="btn-spinner" /></div>}
      <div className="profile-photo-overlay">📷</div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleUpload} />
    </div>
  );
}

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile]     = useState(null);
  const [data, setData]           = useState({ attendance: [], results: [], internships: [] });
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchAll();
  }, [token]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [profRes, allRes, reqRes] = await Promise.allSettled([
        axios.get(`${API}/api/student/profile`, { headers }),
        axios.get(`${API}/api/student/all`, { headers }),
        axios.get(`${API}/api/student/update-requests`, { headers }),
      ]);

      if (profRes.status === 'fulfilled') setProfile(profRes.value.data.data || profRes.value.data);

      if (allRes.status === 'fulfilled') {
        const d = allRes.value.data.data || allRes.value.data;
        setData({
          attendance:  d.attendance || [],
          results:     d.results || [],
          internships: d.internships || [],
        });
      }

      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const avgAttendance = data.attendance.length
    ? Math.round(data.attendance.reduce((s, a) => s + a.percentage, 0) / data.attendance.length)
    : '—';

  const arrearCount = data.results.filter(r => r.grade === 'U').length;
  const latestResults = [...data.results].sort((a, b) => b.semester - a.semester);

  const TABS = [
    { id: 'overview',    icon: '🏠', label: 'Overview' },
    { id: 'results',     icon: '📝', label: 'Results' },
    { id: 'attendance',  icon: '📊', label: 'Attendance' },
    { id: 'internships', icon: '💼', label: 'Internships' },
    { id: 'requests',    icon: '📋', label: 'Requests' },
  ];

  return (
    <div className="dashboard">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#sgrad)" />
            <defs><linearGradient id="sgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6c63ff" /><stop offset="1" stopColor="#22d3ee" /></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sidebar-brand-name">StudentVault</span>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item ${activeTab === t.id ? 'nav-item--active' : ''}`}
              onClick={() => setActiveTab(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'S'}</div>
          <div className="user-info">
            <p className="user-name">{user?.name || 'Student'}</p>
            <p className="user-regno">{user?.regNo}</p>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout" aria-label="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 className="dash-greeting">
              Good {getGreeting()}, <span className="greeting-name">{user?.name?.split(' ')[0] || 'Student'}</span> 👋
            </h1>
            <p className="dash-subtitle">{user?.department} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="header-badge">
            <span className="role-badge student-badge">Student</span>
          </div>
        </header>

        {loading && (
          <div className="dash-loading">
            <div className="loading-ring" />
            <p>Loading your academic data…</p>
          </div>
        )}

        {!loading && activeTab === 'overview' && (
          <>
            {/* Profile Card */}
            {profile && (
              <div className="profile-card-main">
                <ProfilePhoto
                  photo={profile.profilePhoto}
                  name={profile.name}
                  regNo={profile.regNo}
                  token={token}
                  onUploaded={(url) => setProfile(p => ({ ...p, profilePhoto: url }))}
                />
                <div className="profile-card-info">
                  <h2 className="profile-card-name">{profile.name}</h2>
                  <p className="profile-card-meta">{profile.regNo} · {profile.department}</p>
                  <div className="profile-card-tags">
                    {profile.section && <span className="profile-tag">Sec {profile.section}</span>}
                    {profile.year && <span className="profile-tag">Year {profile.year}</span>}
                    {profile.batch && <span className="profile-tag">{profile.batch}</span>}
                    {profile.bloodGroup && <span className="profile-tag">🩸 {profile.bloodGroup}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="stats-grid">
              <StatCard title="CGPA" value={profile?.cgpa || '—'} sub="Cumulative GPA" icon="🎯" color="#6c63ff" />
              <StatCard title="Avg Attendance" value={`${avgAttendance}%`} sub={data.attendance.length ? `${data.attendance.length} subjects` : 'No records'} icon="📊" color="#22d3ee" />
              <StatCard title="Arrears" value={arrearCount} sub={arrearCount === 0 ? 'All clear! 🎉' : 'Need attention'} icon="⚠️" color={arrearCount > 0 ? '#ef4444' : '#10b981'} />
              <StatCard title="Internships" value={data.internships.length || 0} sub={data.internships.filter(i=>i.status==='ongoing').length + ' active'} icon="💼" color="#f59e0b" />
            </div>

            {/* Two column section */}
            <div className="dash-grid-2">
              <section className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">📊 Attendance</h2>
                  <span className="dash-card-count">{data.attendance.length} subjects</span>
                </div>
                {data.attendance.length === 0 ? (
                  <EmptyState message="No attendance records yet." />
                ) : (
                  <div className="att-list">
                    {data.attendance.map((a, i) => <AttendanceRow key={i} {...a} />)}
                  </div>
                )}
              </section>

              <section className="dash-card">
                <div className="dash-card-header">
                  <h2 className="dash-card-title">📝 Recent Results</h2>
                  <span className="dash-card-count">{data.results.length} records</span>
                </div>
                {latestResults.length === 0 ? (
                  <EmptyState message="No results yet." />
                ) : (
                  <div className="result-list">
                    {latestResults.slice(0, 8).map((r, i) => <ResultRow key={i} {...r} />)}
                  </div>
                )}
              </section>
            </div>

            {/* Chatbot CTA */}
            <div className="iq-banner">
              <div className="iq-banner-text">
                <h3>🤖 Ask Campus IQ anything</h3>
                <p>Your AI assistant knows your full academic profile. Click the chat button →</p>
              </div>
              <div className="iq-banner-chips">
                {['Show my attendance', 'My latest results', 'Update my phone'].map(q => (
                  <span key={q} className="iq-chip">{q}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && activeTab === 'results' && (
          <section className="dash-card dash-card--wide">
            <div className="dash-card-header">
              <h2 className="dash-card-title">📝 All Semester Results</h2>
              <span className="dash-card-count">{data.results.length} records</span>
            </div>
            {latestResults.length === 0 ? (
              <EmptyState message="No results recorded." />
            ) : (
              <div className="result-list">
                {latestResults.map((r, i) => <ResultRow key={i} {...r} />)}
              </div>
            )}
          </section>
        )}

        {!loading && activeTab === 'attendance' && (
          <section className="dash-card dash-card--wide">
            <div className="dash-card-header">
              <h2 className="dash-card-title">📊 Full Attendance</h2>
              <span className="dash-card-count">{data.attendance.length} subjects</span>
            </div>
            {data.attendance.length === 0 ? (
              <EmptyState message="No attendance records." />
            ) : (
              <div className="att-list">
                {data.attendance.map((a, i) => <AttendanceRow key={i} {...a} />)}
              </div>
            )}
          </section>
        )}

        {!loading && activeTab === 'internships' && (
          <section className="dash-card dash-card--wide">
            <div className="dash-card-header">
              <h2 className="dash-card-title">💼 Internships</h2>
              <span className="dash-card-count">{data.internships.length} records</span>
            </div>
            {data.internships.length === 0 ? (
              <EmptyState message="No internship records yet. Contact your staff to add internships." />
            ) : (
              <div className="internship-list">
                {data.internships.map((intern, i) => {
                  const statusColor = intern.status === 'ongoing' ? '#10b981' : intern.status === 'completed' ? '#6c63ff' : '#f59e0b';
                  const statusLabel = intern.status === 'ongoing' ? '🟢 Ongoing' : intern.status === 'completed' ? '✅ Completed' : '🕐 Upcoming';
                  const start = intern.startDate ? new Date(intern.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
                  const end = intern.endDate ? new Date(intern.endDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
                  return (
                    <div key={i} className="internship-card">
                      <div className="internship-card-left">
                        <div className="internship-logo">{intern.company?.[0]?.toUpperCase() || '?'}</div>
                        <div className="internship-info">
                          <p className="internship-company">{intern.company}</p>
                          <p className="internship-role">{intern.role}</p>
                          <p className="internship-dates">{start} → {end}</p>
                        </div>
                      </div>
                      <span className="internship-badge" style={{ background: statusColor + '22', color: statusColor, border: `1px solid ${statusColor}44` }}>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {!loading && activeTab === 'requests' && (
          <section className="dash-card dash-card--wide">
            <div className="dash-card-header">
              <h2 className="dash-card-title">📋 Update Requests</h2>
              <span className="dash-card-count">{requests.length} total</span>
            </div>
            {requests.length === 0 ? (
              <EmptyState message="No update requests. Use the chatbot to request profile changes." />
            ) : (
              <div className="requests-list">
                {requests.map((r, i) => (
                  <div key={i} className={`request-row request-row--${r.status}`}>
                    <div className="request-info">
                      <span className="request-field">Update <strong>{r.field}</strong></span>
                      <span className="request-values">"{r.oldValue || '—'}" → "{r.newValue}"</span>
                    </div>
                    <span className={`request-status request-status--${r.status}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <ChatBot />
    </div>
  );
}

function EmptyState({ message }) {
  return <div className="empty-state"><p>{message}</p></div>;
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening';
}
