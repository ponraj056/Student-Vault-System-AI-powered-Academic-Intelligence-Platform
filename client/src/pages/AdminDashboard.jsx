/**
 * client/src/pages/AdminDashboard.jsx  (v3 — PRD-compliant)
 * ────────────────────────────────────────────────────────────
 * Admin super-dashboard: cross-dept stats, student search w/ dept filter,
 * staff management, update requests, audit logs.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatBot from '../components/ChatBot';
import './AdminDashboard.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const TABS = [
  { id: 'overview',  label: '🏠 Dashboard' },
  { id: 'students',  label: '🎓 Students' },
  { id: 'staff',     label: '👨‍🏫 Staff' },
  { id: 'upload',    label: '📤 Upload' },
  { id: 'requests',  label: '📋 Requests' },
  { id: 'audit',     label: '📜 Audit Logs' },
];

export default function AdminDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [dash, setDash]         = useState(null);
  const [students, setStudents] = useState([]);
  const [searchQ, setSearchQ]   = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepts] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selStudent, setSelStudent] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');
  const [showStaffModal, setShowStaffModal] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    fetchDashboard();
    fetchDepartments();
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/dashboard`, { headers });
      setDash(data.data || data);
    } catch { setDash(null); }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/departments`, { headers });
      setDepts(data.data || []);
    } catch { setDepts([]); }
  };

  const fetchStudents = async (q = '', dept = '') => {
    try {
      const { data } = await axios.get(`${API}/api/admin/students`, { headers, params: { search: q, dept } });
      setStudents(data.data || data);
    } catch { setStudents([]); }
  };

  const fetchStudent = async (regNo) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/admin/students/${regNo}`, { headers });
      setSelStudent(data.data || data);
    } catch { setSelStudent(null); }
    setLoading(false);
  };

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/staff`, { headers });
      setStaffList(data.data || []);
    } catch { setStaffList([]); }
  };

  const fetchRequests = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/update-requests`, { headers });
      setRequests(data.data || []);
    } catch { setRequests([]); }
  };

  const fetchAuditLogs = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/audit-logs`, { headers });
      setAuditLogs(data.data || []);
    } catch { setAuditLogs([]); }
  };

  useEffect(() => {
    if (activeTab === 'students') fetchStudents(searchQ, deptFilter);
    if (activeTab === 'staff') fetchStaff();
    if (activeTab === 'requests') fetchRequests();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleSearch = (val) => {
    setSearchQ(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchStudents(val, deptFilter), 300);
  };

  const handleDeptFilter = (dept) => {
    setDeptFilter(dept);
    fetchStudents(searchQ, dept);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const handleApprove = async (id) => {
    try { await axios.post(`${API}/api/admin/update-requests/${id}/approve`, {}, { headers }); showToast('✅ Approved!'); fetchRequests(); }
    catch (e) { showToast('❌ ' + (e.response?.data?.error || 'Failed')); }
  };
  const handleReject = async (id) => {
    try { await axios.post(`${API}/api/admin/update-requests/${id}/reject`, {}, { headers }); showToast('Rejected.'); fetchRequests(); }
    catch (e) { showToast('❌ ' + (e.response?.data?.error || 'Failed')); }
  };

  const toggleStaffStatus = async (staffId, isActive) => {
    try {
      await axios.put(`${API}/api/admin/staff/${staffId}`, { isActive: !isActive }, { headers });
      showToast(isActive ? 'Staff deactivated' : 'Staff activated');
      fetchStaff();
    } catch (e) { showToast('❌ Failed'); }
  };

  const handleExportCsv = () => {
    const url = `${API}/api/admin/export-csv${deptFilter ? `?dept=${deptFilter}` : ''}`;
    fetch(url, { headers })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `students_${deptFilter || 'all'}_export.csv`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => showToast('❌ Export failed'));
  };

  return (
    <div className="admin-dash">
      {toast && <div className="admin-toast">{toast}</div>}

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <svg width="30" height="30" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#adgrad)" />
            <defs><linearGradient id="adgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#f59e0b" /><stop offset="1" stopColor="#ef4444" /></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="admin-brand-name">StudentVault</span>
        </div>
        <div className="admin-portal-badge">🛡️ Admin Portal</div>

        <nav className="admin-nav">
          {TABS.map(t => (
            <button key={t.id} className={`admin-nav-item ${activeTab === t.id ? 'admin-nav-item--active' : ''}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </nav>

        <div className="admin-user-card">
          <div className="admin-avatar">🛡️</div>
          <div className="admin-user-info">
            <p className="admin-user-name">{user?.name || 'Admin'}</p>
            <p className="admin-user-meta">System Admin</p>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </button>
        </div>
      </aside>

      <main className="admin-main">
        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <section>
            <h1 className="admin-page-title">System Dashboard</h1>
            {!dash ? <div className="admin-loading"><div className="loading-ring" /></div> : (
              <>
                <div className="admin-stats-grid">
                  <StatBox icon="🎓" label="Total Students" value={dash.totalStudents} color="#6c63ff" />
                  <StatBox icon="👨‍🏫" label="Total Staff" value={dash.totalStaff} color="#0ea5e9" />
                  <StatBox icon="⚠️" label="Students w/ Arrears" value={dash.arrearsCount} color="#ef4444" />
                  <StatBox icon="✅" label="Pass Rate" value={`${dash.passRate}%`} color="#10b981" />
                  <StatBox icon="📋" label="Pending Requests" value={dash.pendingRequests} color="#f59e0b" />
                  <StatBox icon="🏢" label="Departments" value={dash.departments?.length || 0} color="#8b5cf6" />
                </div>
                {dash.departments?.length > 0 && (
                  <div className="admin-card">
                    <h2 className="admin-card-title">🏢 Department Breakdown</h2>
                    <div className="dept-grid">
                      {dash.departments.map(d => (
                        <div key={d.dept} className="dept-chip" onClick={() => { setActiveTab('students'); setDeptFilter(d.dept); fetchStudents('', d.dept); }}>
                          <span className="dept-chip-name">{d.dept}</span>
                          <span className="dept-chip-count">{d.count} students</span>
                          <span className="dept-chip-arrow">›</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {/* ── STUDENTS ── */}
        {activeTab === 'students' && (
          <section>
            <h1 className="admin-page-title">All Students</h1>
            <div className="admin-search-row">
              <input className="admin-search-input" placeholder="🔍 Search students…" value={searchQ} onChange={e => handleSearch(e.target.value)} />
              <select className="admin-dept-select" value={deptFilter} onChange={e => handleDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.dept} value={d.dept}>{d.dept} ({d.count})</option>)}
              </select>
              <button className="admin-export-btn" onClick={handleExportCsv} title="Export to CSV">
                📥 Export CSV
              </button>
            </div>
            <div className="staff-grid-2">
              <div className="admin-card student-list-card" style={{maxHeight:'65vh',overflowY:'auto'}}>
                {students.length === 0 ? <p className="admin-empty">No students found.</p> : (
                  <div className="student-list">
                    {students.map(s => (
                      <button key={s.regNo} className={`student-row ${selStudent?.student?.regNo === s.regNo ? 'student-row--active' : ''}`} onClick={() => fetchStudent(s.regNo)}>
                        {s.profilePhoto ? <img src={s.profilePhoto} alt="" className="student-row-photo" /> : <div className="student-row-avatar">{s.name?.[0]}</div>}
                        <div className="student-row-info">
                          <p className="student-row-name">{s.name}</p>
                          <p className="student-row-meta">{s.regNo} · {s.department}</p>
                        </div>
                        <span className="student-row-arrow">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="admin-card" style={{maxHeight:'65vh',overflowY:'auto'}}>
                {loading && <div className="admin-loading"><div className="loading-ring" /></div>}
                {!loading && !selStudent && <div className="admin-empty" style={{padding:'3rem'}}>← Select a student</div>}
                {!loading && selStudent && (
                  <>
                    <div className="profile-header">
                      {selStudent.student.profilePhoto ? <img src={selStudent.student.profilePhoto} className="profile-avatar-img" alt="" /> : <div className="profile-avatar">{selStudent.student.name[0]}</div>}
                      <div>
                        <h3 className="profile-name">{selStudent.student.name}</h3>
                        <p className="profile-meta">{selStudent.student.regNo} · {selStudent.student.department}</p>
                        <p className="profile-email">{selStudent.student.email}</p>
                        {selStudent.student.cgpa && (
                          <span className="cgpa-badge">CGPA: {selStudent.student.cgpa}</span>
                        )}
                      </div>
                    </div>
                    <ProfileSection title="📊 Attendance" items={selStudent.attendance?.map(a => `${a.subject} (${a.month}): ${a.percentage}%`) || []} />
                    <ProfileSection title="📝 Results" items={selStudent.results?.map(r => `Sem ${r.semester} · ${r.subject}: ${r.marks} (${r.grade})`) || []} />
                    <ProfileSection title="💼 Internships" items={selStudent.internships?.map(i => `${i.company} — ${i.role} [${i.status}]`) || []} />
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── STAFF ── */}
        {activeTab === 'staff' && (
          <section>
            <div className="admin-title-row">
              <h1 className="admin-page-title">Staff Management</h1>
              <button className="admin-add-btn" onClick={() => setShowStaffModal(true)}>+ Add Staff</button>
            </div>
            <div className="admin-card">
              {staffList.length === 0 ? <p className="admin-empty">No staff accounts.</p> : (
                <div className="staff-table">
                  <div className="staff-table-header">
                    <span>Name</span><span>ID</span><span>Dept</span><span>Role</span><span>Email</span><span>Status</span><span>Action</span>
                  </div>
                  {staffList.map(s => (
                    <div key={s._id} className="staff-table-row">
                      <span className="staff-table-name">{s.name}</span>
                      <span className="staff-table-id">{s.employeeId}</span>
                      <span>{s.department}</span>
                      <span className={`role-tag role-tag--${s.role}`}>{s.role}</span>
                      <span className="staff-table-email">{s.email}</span>
                      <span className={`status-dot ${s.isActive ? 'status-dot--active' : 'status-dot--inactive'}`}>{s.isActive ? 'Active' : 'Inactive'}</span>
                      <button className="toggle-btn" onClick={() => toggleStaffStatus(s._id, s.isActive)}>{s.isActive ? '🔴 Deactivate' : '🟢 Activate'}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {showStaffModal && <CreateStaffModal headers={headers} onClose={() => { setShowStaffModal(false); fetchStaff(); }} onSuccess={(msg) => { showToast(msg); fetchStaff(); setShowStaffModal(false); }} />}
          </section>
        )}

        {/* ── UPLOAD ── */}
        {activeTab === 'upload' && (
          <section>
            <h1 className="admin-page-title">Upload Student Data (Any Department)</h1>
            <AdminExcelUpload headers={headers} departments={departments} onSuccess={(msg) => { showToast(msg); fetchDashboard(); }} />
          </section>
        )}

        {/* ── REQUESTS ── */}
        {activeTab === 'requests' && (
          <section>
            <h1 className="admin-page-title">All Update Requests</h1>
            <div className="admin-card">
              {requests.length === 0 ? <p className="admin-empty">No requests.</p> : (
                <div className="requests-table">
                  {requests.map(r => (
                    <div key={r._id} className={`request-card request-card--${r.status}`}>
                      <div className="request-card-info">
                        <p className="request-card-student">{r.rollNo} ({r.department})</p>
                        <p className="request-card-detail">Change <strong>{r.field}</strong>: "{r.oldValue || '—'}" → "<strong>{r.newValue}</strong>"</p>
                      </div>
                      {r.status === 'pending' ? (
                        <div className="request-card-actions">
                          <button className="req-btn req-btn--approve" onClick={() => handleApprove(r._id)}>✅</button>
                          <button className="req-btn req-btn--reject" onClick={() => handleReject(r._id)}>❌</button>
                        </div>
                      ) : (
                        <span className={`request-badge request-badge--${r.status}`}>{r.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── AUDIT ── */}
        {activeTab === 'audit' && (
          <section>
            <h1 className="admin-page-title">Audit Logs</h1>
            <div className="admin-card">
              {auditLogs.length === 0 ? <p className="admin-empty">No audit logs yet.</p> : (
                <div className="audit-list">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="audit-row">
                      <div className="audit-action">{log.action}</div>
                      <div className="audit-detail">
                        <span className="audit-by">{log.performedBy}</span>
                        <span className="audit-role">{log.role}</span>
                        {log.targetRollNo && <span className="audit-target">→ {log.targetRollNo}</span>}
                      </div>
                      <div className="audit-time">{new Date(log.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <ChatBot />
    </div>
  );
}

// ── Sub-components ──

function StatBox({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ borderLeftColor: color }}>
      <span className="admin-stat-icon">{icon}</span>
      <div>
        <p className="admin-stat-value" style={{ color }}>{value}</p>
        <p className="admin-stat-label">{label}</p>
      </div>
    </div>
  );
}

function ProfileSection({ title, items }) {
  return (
    <div className="profile-section" style={{ marginTop: '1rem' }}>
      <p className="profile-section-title">{title}</p>
      {items.length === 0 ? <p className="admin-empty">No records.</p> : items.map((item, i) => <p key={i} className="profile-item">{item}</p>)}
    </div>
  );
}

function CreateStaffModal({ headers, onClose, onSuccess }) {
  const [form, setForm] = useState({ employeeId: '', name: '', email: '', department: '', role: 'staff', phone: '', subject: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const onChange = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.employeeId || !form.name || !form.email || !form.department) { setErr('Fill all required fields.'); return; }
    setBusy(true);
    try {
      await axios.post(`${API}/api/admin/staff`, form, { headers });
      onSuccess(`✅ Staff ${form.name} created!`);
    } catch (err) { setErr(err.response?.data?.error || 'Failed.'); }
    setBusy(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Create Staff Account</h2>
        <form className="staff-form" onSubmit={submit}>
          <div className="staff-form-group"><label className="form-label">Employee ID *</label><input name="employeeId" className="form-input" value={form.employeeId} onChange={onChange} placeholder="e.g. FAC008" /></div>
          <div className="staff-form-group"><label className="form-label">Full Name *</label><input name="name" className="form-input" value={form.name} onChange={onChange} /></div>
          <div className="staff-form-group"><label className="form-label">Email *</label><input name="email" type="email" className="form-input" value={form.email} onChange={onChange} /></div>
          <div className="staff-form-group"><label className="form-label">Department *</label><input name="department" className="form-input" value={form.department} onChange={onChange} placeholder="e.g. CSE" /></div>
          <div className="staff-form-group"><label className="form-label">Role</label>
            <select name="role" className="form-input" value={form.role} onChange={onChange}>
              <option value="staff">Staff</option>
              <option value="hod">HoD</option>
            </select>
          </div>
          <div className="staff-form-group"><label className="form-label">Phone</label><input name="phone" className="form-input" value={form.phone} onChange={onChange} /></div>
          <div className="staff-form-group"><label className="form-label">Subject</label><input name="subject" className="form-input" value={form.subject} onChange={onChange} /></div>
          {err && <p className="form-error">{err}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="staff-submit-btn" disabled={busy}>{busy ? <span className="btn-spinner" /> : '✅ Create'}</button>
            <button type="button" className="staff-submit-btn" style={{ background: '#334155' }} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminExcelUpload({ headers, departments, onSuccess }) {
  const [file, setFile] = useState(null);
  const [dept, setDept] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const upload = async () => {
    if (!file) { setError('Select a file.'); return; }
    if (!dept) { setError('Select a department.'); return; }
    setError(''); setUploading(true); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('dept', dept);
      const { data } = await axios.post(`${API}/api/admin/upload-excel`, fd, { headers: { ...headers, 'Content-Type': 'multipart/form-data' } });
      setResult(data.data || data);
      onSuccess(`✅ Import complete: ${data.data?.inserted || 0} inserted, ${data.data?.updated || 0} updated`);
    } catch (err) { setError(err.response?.data?.error || 'Upload failed.'); }
    setUploading(false);
  };

  return (
    <div className="admin-card">
      <div className="admin-search-row" style={{ marginBottom: '1rem' }}>
        <input 
          list="dept-options"
          className="admin-search-input" 
          placeholder="Enter or select department (e.g. CSE) *" 
          value={dept} 
          onChange={e => setDept(e.target.value.toUpperCase())}
          style={{ maxWidth: '300px' }}
        />
        <datalist id="dept-options">
          <option value="CSE" />
          <option value="IT" />
          <option value="ECE" />
          <option value="EEE" />
          <option value="MECH" />
          {departments.map(d => <option key={d.dept} value={d.dept} />)}
        </datalist>
      </div>
      <div className="upload-zone" onClick={() => document.getElementById('admin-excel').click()}>
        <div className="upload-zone-icon">📁</div>
        <p className="upload-zone-text">{file ? `📄 ${file.name}` : 'Click to select Excel file'}</p>
        <input id="admin-excel" type="file" accept=".xlsx,.xls,.csv" hidden onChange={e => setFile(e.target.files[0])} />
      </div>
      {error && <p className="form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
      <button className="staff-submit-btn" style={{ marginTop: '1rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)' }} onClick={upload} disabled={uploading || !file || !dept}>
        {uploading ? <span className="btn-spinner" /> : '📤 Upload'}
      </button>
      {result && (
        <div className="upload-result"><p>Total: {result.total} · Inserted: {result.inserted} · Updated: {result.updated}</p></div>
      )}
    </div>
  );
}
