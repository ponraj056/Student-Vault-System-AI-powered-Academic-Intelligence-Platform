/**
 * client/src/pages/Login.jsx  (v3 — PRD-compliant, 3-tab)
 * ──────────────────────────────────────────────────────────
 * Single login page, no registration links.
 * 
 * Step 1: Enter ID → POST /api/auth/detect-role → detect type
 * Step 2a (student/staff): OTP → verify → JWT
 * Step 2b (admin): Password → verify → JWT
 * Step 3: Redirect based on role
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RESEND_SECS = 60;

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [tab, setTab]         = useState('student');  // student | staff | admin
  const [step, setStep]       = useState(1);          // 1=enterID, 2=OTP/password
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [info, setInfo]       = useState('');
  const [detectedRole, setDetectedRole] = useState('');
  const [detectedName, setDetectedName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp]         = useState(['','','','','','']);
  const [timer, setTimer]     = useState(0);
  const otpRefs               = useRef([]);
  const timerRef              = useRef(null);

  const switchTab = (t) => {
    setTab(t); setStep(1); setError(''); setInfo('');
    setIdentifier(''); setPassword('');
    setOtp(['','','','','','']); setDetectedRole(''); setDetectedName('');
    stopTimer();
  };

  // ── Timer ──
  const startTimer = () => {
    setTimer(RESEND_SECS);
    timerRef.current = setInterval(() => setTimer(p => {
      if (p <= 1) { clearInterval(timerRef.current); return 0; }
      return p - 1;
    }), 1000);
  };
  const stopTimer = () => { clearInterval(timerRef.current); setTimer(0); };
  useEffect(() => () => stopTimer(), []);

  // ── STEP 1: Continue (detect role or send OTP) ──
  const handleContinue = async () => {
    if (!identifier.trim()) {
      setError(tab === 'admin' ? 'Please enter your admin email.' : `Please enter your ${tab === 'student' ? 'register number' : 'employee ID'}.`);
      return;
    }
    setError(''); setLoading(true);

    try {
      if (tab === 'admin') {
        // For admin, go straight to password step
        const { data } = await axios.post(`${API}/api/auth/detect-role`, { id: identifier.trim() });
        if (data.role !== 'admin') {
          setError('This is not an admin account. Use the Student or Staff tab.');
          setLoading(false);
          return;
        }
        setDetectedName(data.name);
        setDetectedRole('admin');
        setStep(2);
      } else if (tab === 'student') {
        const { data } = await axios.post(`${API}/api/auth/student/send-otp`, {
          regNo: identifier.trim().toUpperCase()
        });
        setInfo(data.maskedEmail);
        setDetectedName(data.name);
        setDetectedRole('student');
        setStep(2);
        startTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        const { data } = await axios.post(`${API}/api/auth/staff/send-otp`, {
          employeeId: identifier.trim().toUpperCase()
        });
        setInfo(data.maskedEmail);
        setDetectedName(data.name);
        setDetectedRole(data.role || 'staff');
        setStep(2);
        startTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── RESEND OTP ──
  const resendOTP = async () => {
    setError(''); setLoading(true);
    try {
      if (tab === 'student') {
        await axios.post(`${API}/api/auth/student/send-otp`, { regNo: identifier.trim().toUpperCase() });
      } else {
        await axios.post(`${API}/api/auth/staff/send-otp`, { employeeId: identifier.trim().toUpperCase() });
      }
      startTimer();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally { setLoading(false); }
  };

  // ── OTP Input Handling ──
  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };
  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) { setOtp(pasted.split('')); otpRefs.current[5]?.focus(); }
  };

  // ── STEP 2: Verify ──
  const handleVerify = async () => {
    setError(''); setLoading(true);
    try {
      let data;

      if (tab === 'admin') {
        if (!password) { setError('Please enter your password.'); setLoading(false); return; }
        const res = await axios.post(`${API}/api/auth/admin/login`, {
          email: identifier.trim().toLowerCase(),
          password,
        });
        data = res.data;
      } else {
        const code = otp.join('');
        if (code.length < 6) { setError('Please enter the complete 6-digit OTP.'); setLoading(false); return; }
        const endpoint = tab === 'student'
          ? `${API}/api/auth/student/verify-otp`
          : `${API}/api/auth/staff/verify-otp`;
        const body = tab === 'student'
          ? { regNo: identifier.trim().toUpperCase(), otp: code }
          : { employeeId: identifier.trim().toUpperCase(), otp: code };
        const res = await axios.post(endpoint, body);
        data = res.data;
      }

      login(data.token, data.user);

      // Redirect based on role
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.portal === 'staff' || data.user.role === 'staff' || data.user.role === 'hod') navigate('/staff');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
      if (tab !== 'admin') {
        setOtp(['','','','','','']);
        otpRefs.current[0]?.focus();
      }
    } finally { setLoading(false); }
  };

  const handleSubmit = (e) => { e.preventDefault(); step === 1 ? handleContinue() : handleVerify(); };

  const tabConfig = {
    student: { icon: '🎓', label: 'Student', placeholder: 'e.g. 21CSR001', inputLabel: 'Register Number' },
    staff:   { icon: '👨‍🏫', label: 'Staff / HoD', placeholder: 'e.g. FAC001', inputLabel: 'Employee ID' },
    admin:   { icon: '🛡️', label: 'Admin', placeholder: 'e.g. admin@vsb.edu', inputLabel: 'Admin Email' },
  };

  const cur = tabConfig[tab];

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />

      <div className="login-card">
        <div className="login-logo">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="14" fill="url(#lgrad)" />
            <defs><linearGradient id="lgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#22d3ee"/></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="login-title">StudentVault</h1>
        <p className="login-sub">V.S.B. Engineering College — Academic Intelligence Platform</p>

        {/* Tabs */}
        <div className="portal-tabs">
          {Object.entries(tabConfig).map(([key, cfg]) => (
            <button
              key={key}
              className={`portal-tab ${tab === key ? 'portal-tab--active' : ''} ${key === 'staff' ? 'portal-tab--staff' : ''} ${key === 'admin' ? 'portal-tab--admin' : ''}`}
              onClick={() => switchTab(key)}
              type="button"
              id={`tab-${key}`}
            >
              {cfg.icon} {cfg.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} noValidate className="login-form">
          {/* ── Step 1: Enter ID ── */}
          {step === 1 && (
            <>
              <div className="form-group">
                <label htmlFor="identifier" className="form-label">{cur.inputLabel}</label>
                <input id="identifier" type={tab === 'admin' ? 'email' : 'text'} className="form-input"
                  placeholder={cur.placeholder}
                  value={identifier} onChange={e => { setIdentifier(e.target.value); setError(''); }} autoFocus />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" className={`btn-primary ${tab === 'staff' ? 'btn-primary--staff' : ''} ${tab === 'admin' ? 'btn-primary--admin' : ''}`} id="continue-btn" disabled={loading}>
                {loading ? <span className="btn-spinner"/> : 'Continue →'}
              </button>
            </>
          )}

          {/* ── Step 2a: OTP (student/staff) ── */}
          {step === 2 && tab !== 'admin' && (
            <>
              <div className="otp-info">
                <span className="otp-info-icon">📧</span>
                <div>
                  <p style={{margin:0}}>Welcome back, <strong>{detectedName}</strong></p>
                  <p style={{margin:'4px 0 0',fontSize:'0.8rem',opacity:0.7}}>OTP sent to <strong>{info}</strong></p>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Enter 6-Digit OTP</label>
                <div className="otp-boxes" onPaste={handleOtpPaste}>
                  {otp.map((d, i) => (
                    <input key={i} id={`otp-${i}`} ref={el => otpRefs.current[i] = el}
                      type="text" inputMode="numeric" maxLength={1}
                      className={`otp-box ${d ? 'otp-box--filled' : ''}`}
                      value={d} onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)} />
                  ))}
                </div>
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" id="verify-otp-btn" className={`btn-primary ${tab === 'staff' ? 'btn-primary--staff' : ''}`} disabled={loading}>
                {loading ? <span className="btn-spinner"/> : 'Verify & Sign In'}
              </button>
              <div className="otp-resend">
                {timer > 0
                  ? <p className="otp-timer">Resend in {timer}s</p>
                  : <button type="button" className="otp-resend-btn" onClick={resendOTP}>Resend OTP</button>
                }
                <button type="button" className="otp-back-btn" onClick={() => { setStep(1); setError(''); setOtp(['','','','','','']); stopTimer(); }}>← Change ID</button>
              </div>
            </>
          )}

          {/* ── Step 2b: Password (admin) ── */}
          {step === 2 && tab === 'admin' && (
            <>
              <div className="otp-info">
                <span className="otp-info-icon">🛡️</span>
                <div>
                  <p style={{margin:0}}>Welcome, <strong>{detectedName}</strong></p>
                  <p style={{margin:'4px 0 0',fontSize:'0.8rem',opacity:0.7}}>Admin login — enter your password</p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="admin-password" className="form-label">Password</label>
                <input id="admin-password" type="password" className="form-input"
                  placeholder="Enter admin password"
                  value={password} onChange={e => { setPassword(e.target.value); setError(''); }} autoFocus />
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button type="submit" id="admin-login-btn" className="btn-primary btn-primary--admin" disabled={loading}>
                {loading ? <span className="btn-spinner"/> : '🔐 Sign In'}
              </button>
              <div className="otp-resend">
                <button type="button" className="otp-back-btn" onClick={() => { setStep(1); setError(''); setPassword(''); }}>← Change Email</button>
              </div>
            </>
          )}
        </form>

        <p className="login-footer" style={{ marginTop: '1rem' }}>
          <a href="/" className="link" style={{ fontSize:'0.75rem', color:'#475569' }}>← Back to home</a>
        </p>
      </div>
    </div>
  );
}
