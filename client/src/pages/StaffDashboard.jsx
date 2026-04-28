/**
 * client/src/pages/StaffDashboard.jsx  (v3 — PRD-compliant)
 * ───────────────────────────────────────────────────────────
 * Tabs: Overview, Students (live search), Upload Excel, Requests, Attendance, Results
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatBot from '../components/ChatBot';
import './StaffDashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TABS = [
  { id: 'overview',     label: '🏠 Overview' },
  { id: 'students',     label: '🎓 Students' },
  { id: 'upload',       label: '📤 Upload Excel' },
  { id: 'requests',     label: '📋 Requests' },
  { id: 'attendance',   label: '📊 Attendance' },
  { id: 'results',      label: '📝 Results' },
  { id: 'internships',  label: '💼 Internships' },
];

export default function StaffDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [overview, setOverview]   = useState(null);
  const [students, setStudents]   = useState([]);
  const [searchQ, setSearchQ]     = useState('');
  const [selStudent, setSelStudent] = useState(null);
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [toast, setToast]         = useState('');

  const headers = { Authorization: `Bearer ${token}` };
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchOverview();
    fetchRequests();
    fetchStudents(''); // pre-load so Students tab is ready instantly
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchOverview = async () => {
    try {
      const { data } = await axios.get(`${API}/api/staff/overview`, { headers });
      setOverview(data.data || data);
    } catch { setOverview(null); }
  };

  const fetchStudents = useCallback(async (q = '') => {
    try {
      const { data } = await axios.get(`${API}/api/staff/students`, { headers, params: { search: q } });
      setStudents(data.data || data);
    } catch { setStudents([]); }
  }, [token]);

  const fetchStudent = async (regNo) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/staff/students/${regNo}`, { headers });
      setSelStudent(data.data || data);
    } catch { setSelStudent(null); }
    setLoading(false);
  };

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${API}/api/staff/update-requests`, { headers });
      setRequests(data.data || []);
    } catch { setRequests([]); }
  };

  // Live search with debounce
  const handleSearch = (val) => {
    setSearchQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStudents(val), 300);
  };

  useEffect(() => {
    if (activeTab === 'students') fetchStudents(searchQ);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleApprove = async (id) => {
    try {
      await axios.post(`${API}/api/staff/update-requests/${id}/approve`, {}, { headers });
      showToast('✅ Request approved and applied!');
      fetchRequests();
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Failed')); }
  };

  const handleReject = async (id) => {
    try {
      await axios.post(`${API}/api/staff/update-requests/${id}/reject`, {}, { headers });
      showToast('Request rejected.');
      fetchRequests();
    } catch (err) { showToast('❌ ' + (err.response?.data?.error || 'Failed')); }
  };

  return (
    <div className="staff-dash">
      {toast && <div className="staff-toast">{toast}</div>}

      {/* ── Sidebar ── */}
      <aside className="staff-sidebar">
        <div className="staff-brand">
          <svg width="30" height="30" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#stgrad)" />
            <defs><linearGradient id="stgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#0ea5e9" /><stop offset="1" stopColor="#10b981" /></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="staff-brand-name">StudentVault</span>
        </div>
        <div className="staff-portal-badge">👨‍🏫 {user?.role === 'hod' ? 'HoD' : 'Staff'} Portal</div>

        <nav className="staff-nav">
          {TABS.map(t => (
            <button key={t.id}
              className={`staff-nav-item ${activeTab === t.id ? 'staff-nav-item--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >{t.label}</button>
          ))}
        </nav>

        <div className="staff-user-card">
          <div className="staff-avatar">{user?.name?.[0]?.toUpperCase() || 'S'}</div>
          <div className="staff-user-info">
            <p className="staff-user-name">{user?.name}</p>
            <p className="staff-user-meta">{user?.role?.toUpperCase()} · {user?.department}</p>
          </div>
          <button className="staff-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="staff-main">
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <section>
            <h1 className="staff-page-title">Department Overview — {user?.department}</h1>
            {!overview ? <div className="staff-loading"><div className="loading-ring" /></div> : (
              <>
                <div className="staff-stats-grid">
                  {[
                    { icon:'🎓', label:'Total Students', value: overview.totalStudents, color:'#6c63ff' },
                    { icon:'📚', label:'Subjects Tracked', value: overview.totalSubjects || '—', color:'#22d3ee' },
                    { icon:'⚠️', label:'Low Attendance', value: overview.lowAttendanceCount || 0, color:'#ef4444' },
                    { icon:'💼', label:'Active Internships', value: overview.activeInternships || 0, color:'#10b981' },
                  ].map(s => (
                    <div className="staff-stat-card" key={s.label} style={{ borderLeftColor: s.color }}>
                      <span className="staff-stat-icon">{s.icon}</span>
                      <div>
                        <p className="staff-stat-value" style={{ color: s.color }}>{s.value}</p>
                        <p className="staff-stat-label">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {overview.subjectAverages?.length > 0 && (
                  <div className="staff-card" style={{marginTop:'1rem'}}>
                    <h2 className="staff-card-title">📊 Attendance by Subject</h2>
                    <div className="att-list">
                      {overview.subjectAverages.map(s => (
                        <div className="att-row" key={s.subject}>
                          <div className="att-meta"><span className="att-subject">{s.subject}</span></div>
                          <div className="att-bar-track">
                            <div className="att-bar-fill" style={{ width:`${s.average}%`, background: s.average >= 75 ? '#10b981' : '#ef4444' }} />
                          </div>
                          <span className="att-pct" style={{ color: s.average >= 75 ? '#10b981' : '#ef4444' }}>{s.average}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* STUDENTS — Live Search */}
        {activeTab === 'students' && (
          <section>
            <h1 className="staff-page-title">Student Management</h1>
            <div className="staff-search-row">
              <input className="staff-search-input" placeholder="🔍  Search by name or register number…"
                value={searchQ} onChange={e => handleSearch(e.target.value)} autoFocus />
              <span className="staff-count">{students.length} students</span>
            </div>
            <div className="staff-grid-2">
              {/* Student list */}
              <div className="staff-card student-list-card">
                {students.length === 0 ? <p className="staff-empty">No students found.</p> : (
                  <div className="student-list">
                    {students.map(s => (
                      <button key={s.regNo}
                        className={`student-row ${selStudent?.student?.regNo === s.regNo ? 'student-row--active' : ''}`}
                        onClick={() => fetchStudent(s.regNo)}>
                        {s.profilePhoto ? (
                          <img src={s.profilePhoto} alt="" className="student-row-photo" />
                        ) : (
                          <div className="student-row-avatar">{s.name[0]}</div>
                        )}
                        <div className="student-row-info">
                          <p className="student-row-name">{s.name}</p>
                          <p className="student-row-meta">{s.regNo} · {s.section ? `Sec ${s.section}` : ''} {s.year ? `Y${s.year}` : ''}</p>
                        </div>
                        {s.cgpa && <span className="student-row-cgpa">{s.cgpa}</span>}
                        <span className="student-row-arrow">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Student profile */}
              <div className="staff-card student-profile-card">
                {loading && <div className="staff-loading"><div className="loading-ring" /></div>}
                {!loading && !selStudent && (
                  <div className="staff-empty" style={{ padding:'3rem' }}>← Select a student to view their full profile</div>
                )}
                {!loading && selStudent && (
                  <>
                    <div className="profile-header">
                      {selStudent.student.profilePhoto ? (
                        <img src={selStudent.student.profilePhoto} alt="" className="profile-avatar-img" />
                      ) : (
                        <div className="profile-avatar">{selStudent.student.name[0]}</div>
                      )}
                      <div>
                        <h3 className="profile-name">{selStudent.student.name}</h3>
                        <p className="profile-meta">{selStudent.student.regNo} · {selStudent.student.department}</p>
                        <p className="profile-email">{selStudent.student.email}</p>
                        {selStudent.student.cgpa && <p className="profile-cgpa">CGPA: <strong>{selStudent.student.cgpa}</strong></p>}
                      </div>
                    </div>
                    <div className="profile-sections">
                      <ProfileSection title="📊 Attendance" items={selStudent.attendance?.map(a => `${a.subject} (${a.month}): ${a.percentage}%`) || []} />
                      <ProfileSection title="📝 Results" items={selStudent.results?.map(r => `Sem ${r.semester} · ${r.subject}: ${r.marks} (${r.grade})`) || []} />
                      <ProfileSection title="💼 Internships" items={selStudent.internships?.map(i => `${i.company} — ${i.role} [${i.status}]`) || []} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* UPLOAD EXCEL */}
        {activeTab === 'upload' && (
          <section>
            <h1 className="staff-page-title">Upload Student Data (Excel)</h1>
            <ExcelUpload headers={headers} onSuccess={(msg) => { showToast(msg); fetchOverview(); }} />
          </section>
        )}

        {/* REQUESTS */}
        {activeTab === 'requests' && (
          <section>
            <h1 className="staff-page-title">Pending Update Requests</h1>
            <div className="staff-card">
              {requests.length === 0 ? <p className="staff-empty">No pending requests. 🎉</p> : (
                <div className="requests-table">
                  {requests.map(r => (
                    <div key={r._id} className={`request-card request-card--${r.status}`}>
                      <div className="request-card-info">
                        <p className="request-card-student">{r.rollNo}</p>
                        <p className="request-card-detail">
                          Change <strong>{r.field}</strong>: "{r.oldValue || '—'}" → "<strong>{r.newValue}</strong>"
                        </p>
                        <p className="request-card-time">{new Date(r.createdAt || r.requestedAt).toLocaleString()}</p>
                      </div>
                      {r.status === 'pending' && (
                        <div className="request-card-actions">
                          <button className="req-btn req-btn--approve" onClick={() => handleApprove(r._id)}>✅ Approve</button>
                          <button className="req-btn req-btn--reject" onClick={() => handleReject(r._id)}>❌ Reject</button>
                        </div>
                      )}
                      {r.status !== 'pending' && (
                        <span className={`request-badge request-badge--${r.status}`}>{r.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ATTENDANCE */}
        {activeTab === 'attendance' && (
          <section>
            <h1 className="staff-page-title">Enter Attendance</h1>
            <AttendanceForm headers={headers} onSuccess={msg => { showToast(msg); fetchOverview(); }} />
          </section>
        )}

        {/* RESULTS */}
        {activeTab === 'results' && (
          <section>
            <h1 className="staff-page-title">Enter Results</h1>
            <ResultsForm headers={headers} onSuccess={msg => { showToast(msg); fetchOverview(); }} />
          </section>
        )}
        {/* INTERNSHIPS */}
        {activeTab === 'internships' && (
          <section>
            <h1 className="staff-page-title">Add Internship Record</h1>
            <InternshipsForm headers={headers} onSuccess={msg => { showToast(msg); }} />
          </section>
        )}
      </main>

      <ChatBot />
    </div>
  );
}

// ── Sub-components ──

function ProfileSection({ title, items }) {
  return (
    <div className="profile-section">
      <p className="profile-section-title">{title}</p>
      {items.length === 0
        ? <p className="staff-empty">No records.</p>
        : items.map((item, i) => <p key={i} className="profile-item">{item}</p>)
      }
    </div>
  );
}

function ExcelUpload({ headers, onSuccess }) {
  const [file, setFile]       = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.name.match(/\.(xlsx|xls|csv)$/i)) setFile(f);
    else setError('Only .xlsx, .xls, or .csv files allowed.');
  };

  const upload = async () => {
    if (!file) { setError('Select a file first.'); return; }
    setError(''); setUploading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await axios.post(`${API}/api/staff/upload-excel`, fd, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data || data);
      onSuccess(`✅ Import complete: ${data.data?.inserted || 0} inserted, ${data.data?.updated || 0} updated`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally { setUploading(false); }
  };

  return (
    <div className="staff-card">
      <div className={`upload-zone ${dragging ? 'upload-zone--active' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('excel-input').click()}>
        <div className="upload-zone-icon">📁</div>
        <p className="upload-zone-text">
          {file ? `📄 ${file.name}` : 'Drag & drop Excel file here, or click to select'}
        </p>
        <p className="upload-zone-hint">Supports .xlsx, .xls, .csv (max 10MB)</p>
        <input id="excel-input" type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => setFile(e.target.files[0])} />
      </div>
      {error && <p className="form-error" style={{marginTop:'0.75rem'}}>{error}</p>}
      <button className="staff-submit-btn" style={{marginTop:'1rem'}} onClick={upload} disabled={uploading || !file}>
        {uploading ? <span className="btn-spinner"/> : '📤 Upload & Import'}
      </button>
      {result && (
        <div className="upload-result">
          <p>✅ <strong>Total rows:</strong> {result.total}</p>
          <p>📥 <strong>Inserted:</strong> {result.inserted}</p>
          <p>♻️ <strong>Updated:</strong> {result.updated}</p>
          {result.skipped > 0 && <p>⏭ <strong>Skipped:</strong> {result.skipped}</p>}
          {result.errors?.length > 0 && (
            <details style={{marginTop:'0.5rem'}}>
              <summary style={{cursor:'pointer',color:'#f59e0b',fontSize:'0.8rem'}}>⚠️ {result.errors.length} errors</summary>
              <ul style={{fontSize:'0.72rem',color:'#94a3b8',marginTop:'0.5rem'}}>
                {result.errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function AttendanceForm({ headers, onSuccess }) {
  const [form, setForm] = useState({ regNo: '', subject: '', percentage: '', month: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.regNo || !form.subject || !form.percentage || !form.month) { setErr('All fields are required.'); return; }
    setBusy(true);
    try {
      await axios.post(`${API}/api/staff/attendance`, form, { headers });
      onSuccess(`✅ Attendance saved for ${form.regNo} — ${form.subject}`);
      setForm({ regNo: '', subject: '', percentage: '', month: '' });
    } catch (err) { setErr(err.response?.data?.error || 'Failed to save.'); }
    setBusy(false);
  };

  return (
    <div className="staff-form-card">
      <form className="staff-form" onSubmit={submit}>
        <StaffField id="att-regNo" name="regNo" label="Register Number *" value={form.regNo} onChange={onChange} placeholder="e.g. 21CSR001" />
        <StaffField id="att-subject" name="subject" label="Subject *" value={form.subject} onChange={onChange} placeholder="e.g. Data Structures" />
        <StaffField id="att-pct" name="percentage" label="Attendance %" type="number" min="0" max="100" value={form.percentage} onChange={onChange} placeholder="0–100" />
        <StaffField id="att-month" name="month" label="Month *" value={form.month} onChange={onChange} placeholder="e.g. April 2025" />
        {err && <p className="form-error">{err}</p>}
        <button type="submit" className="staff-submit-btn" disabled={busy}>{busy ? <span className="btn-spinner"/> : '💾 Save Attendance'}</button>
      </form>
    </div>
  );
}

function ResultsForm({ headers, onSuccess }) {
  const [form, setForm] = useState({ regNo: '', semester: '', subject: '', marks: '', grade: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.regNo || !form.semester || !form.subject || !form.marks || !form.grade) { setErr('All fields are required.'); return; }
    setBusy(true);
    try {
      await axios.post(`${API}/api/staff/results`, form, { headers });
      onSuccess(`✅ Result saved for ${form.regNo} — ${form.subject}`);
      setForm({ regNo: '', semester: '', subject: '', marks: '', grade: '' });
    } catch (err) { setErr(err.response?.data?.error || 'Failed to save.'); }
    setBusy(false);
  };

  return (
    <div className="staff-form-card">
      <form className="staff-form" onSubmit={submit}>
        <StaffField id="res-regNo" name="regNo" label="Register Number *" value={form.regNo} onChange={onChange} placeholder="e.g. 21CSR001" />
        <StaffField id="res-sem" name="semester" label="Semester *" value={form.semester} onChange={onChange} placeholder="e.g. 4" type="number" min="1" max="8" />
        <StaffField id="res-subject" name="subject" label="Subject *" value={form.subject} onChange={onChange} placeholder="e.g. OS" />
        <StaffField id="res-marks" name="marks" label="Marks *" value={form.marks} onChange={onChange} placeholder="0–100" type="number" min="0" max="100" />
        <div className="staff-form-group">
          <label htmlFor="res-grade" className="form-label">Grade *</label>
          <select id="res-grade" name="grade" className="form-input staff-select" value={form.grade} onChange={onChange}>
            <option value="">Select grade</option>
            {['O','A+','A','B+','B','C','U'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        {err && <p className="form-error">{err}</p>}
        <button type="submit" className="staff-submit-btn staff-submit-btn--teal" disabled={busy}>{busy ? <span className="btn-spinner"/> : '💾 Save Result'}</button>
      </form>
    </div>
  );
}

function InternshipsForm({ headers, onSuccess }) {
  const [form, setForm] = useState({ regNo: '', company: '', role: '', startDate: '', endDate: '', status: 'ongoing' });
  const [err, setErr]   = useState('');
  const [busy, setBusy] = useState(false);
  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.regNo || !form.company || !form.role || !form.startDate || !form.endDate) { setErr('All fields are required.'); return; }
    setBusy(true);
    try {
      await axios.post(`${API}/api/staff/internships`, form, { headers });
      onSuccess(`✅ Internship saved for ${form.regNo} at ${form.company}`);
      setForm({ regNo: '', company: '', role: '', startDate: '', endDate: '', status: 'ongoing' });
    } catch (err) { setErr(err.response?.data?.error || 'Failed to save.'); }
    setBusy(false);
  };

  return (
    <div className="staff-form-card">
      <form className="staff-form" onSubmit={submit}>
        <StaffField id="int-regNo"  name="regNo"   label="Register Number *" value={form.regNo}   onChange={onChange} placeholder="e.g. 21CSR001" />
        <StaffField id="int-company" name="company" label="Company *"         value={form.company} onChange={onChange} placeholder="e.g. TCS" />
        <StaffField id="int-role"   name="role"    label="Role / Title *"    value={form.role}    onChange={onChange} placeholder="e.g. Software Engineer Intern" />
        <StaffField id="int-start"  name="startDate" label="Start Date *" value={form.startDate} onChange={onChange} type="date" />
        <StaffField id="int-end"    name="endDate"   label="End Date *"   value={form.endDate}   onChange={onChange} type="date" />
        <div className="staff-form-group">
          <label htmlFor="int-status" className="form-label">Status *</label>
          <select id="int-status" name="status" className="form-input staff-select" value={form.status} onChange={onChange}>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {err && <p className="form-error">{err}</p>}
        <button type="submit" className="staff-submit-btn" disabled={busy}>{busy ? <span className="btn-spinner"/> : '💾 Save Internship'}</button>
      </form>
    </div>
  );
}

function StaffField({ id, name, label, value, onChange, placeholder, type = 'text', min, max }) {
  return (
    <div className="staff-form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <input id={id} name={name} type={type} min={min} max={max} className="form-input"
        placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}
