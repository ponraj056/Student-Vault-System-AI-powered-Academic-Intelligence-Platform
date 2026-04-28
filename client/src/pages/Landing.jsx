/**
 * client/src/pages/Landing.jsx
 * ─────────────────────────────
 * World-class SaaS landing page — Apple/Stripe level polish.
 * 7 sections: Navbar · Hero · Features · Demo · Testimonials · Pricing · Footer
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

/* ── tiny fade-in-on-scroll hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ══════════════════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      <Navbar scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} navigate={navigate} />
      <Hero navigate={navigate} />
      <Features />
      <Demo />
      <Testimonials />
      <Pricing navigate={navigate} />
      <Footer />
    </div>
  );
}

/* ── NAVBAR ─────────────────────────────────────────────────────────────────── */
function Navbar({ scrolled, mobileOpen, setMobileOpen, navigate }) {
  return (
    <nav className={`landing-nav ${scrolled ? 'landing-nav--scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#" className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#navgrad)" />
            <defs><linearGradient id="navgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#22d3ee"/></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="nav-brand">StudentVault</span>
        </a>

        <ul className={`nav-links ${mobileOpen ? 'nav-links--open' : ''}`}>
          {['Features','Pricing','About','Contact'].map(l => (
            <li key={l}><a href={`#${l.toLowerCase()}`} className="nav-link" onClick={() => setMobileOpen(false)}>{l}</a></li>
          ))}
        </ul>

        <div className="nav-actions">
          <button className="nav-signin" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-cta" onClick={() => navigate('/login')}>Get Started Free</button>
        </div>

        <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="menu">
          <span/><span/><span/>
        </button>
      </div>
    </nav>
  );
}

/* ── HERO ───────────────────────────────────────────────────────────────────── */
function Hero({ navigate }) {
  const [ref, v] = useReveal();
  return (
    <section className="hero" ref={ref}>
      <div className="hero-bg-orb hero-bg-orb--1" />
      <div className="hero-bg-orb hero-bg-orb--2" />
      <div className="hero-bg-orb hero-bg-orb--3" />

      <div className={`hero-inner ${v ? 'reveal-in' : ''}`}>
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            AI-Powered Academic Intelligence
          </div>
          <h1 className="hero-title">
            Your Academic Life,<br />
            <span className="hero-title-gradient">Supercharged by AI</span>
          </h1>
          <p className="hero-subtitle">
            StudentVault gives students real-time insights into attendance, results, and internships — while giving faculty powerful tools to manage their entire department in one place.
          </p>
          <div className="hero-ctas">
            <button className="btn-hero-primary" onClick={() => navigate('/login')}>
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
          <p className="hero-note">Free forever for students · No credit card required</p>
        </div>

        <div className="hero-visual">
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

/* ── Dashboard Mockup Preview ── */
function DashboardMockup() {
  return (
    <div className="mockup-window">
      <div className="mockup-titlebar">
        <span className="mockup-dot mockup-dot--red" />
        <span className="mockup-dot mockup-dot--yellow" />
        <span className="mockup-dot mockup-dot--green" />
        <span className="mockup-url">app.studentvault.ai</span>
      </div>
      <div className="mockup-body">
        <div className="mockup-sidebar">
          <div className="mockup-sidebar-logo" />
          {['Dashboard','Attendance','Results','Internships','Campus IQ'].map((item, i) => (
            <div key={item} className={`mockup-sidebar-item ${i === 0 ? 'mockup-sidebar-item--active' : ''}`}>{item}</div>
          ))}
        </div>
        <div className="mockup-content">
          <div className="mockup-greeting">Good Morning, Ponraj 👋</div>
          <div className="mockup-cards">
            {[
              { label:'Avg Attendance', value:'79%', color:'#6c63ff' },
              { label:'Subjects',       value:'6',   color:'#22d3ee' },
              { label:'Internships',    value:'2',   color:'#10b981' },
            ].map(c => (
              <div key={c.label} className="mockup-card" style={{ borderTopColor: c.color }}>
                <p className="mockup-card-val" style={{ color: c.color }}>{c.value}</p>
                <p className="mockup-card-label">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="mockup-chart-label">Attendance by Subject</div>
          <div className="mockup-bars">
            {[['DB Mgmt','91%',91],['Software Eng','88%',88],['Data Str','82%',82],['OS','71%',71],['Networks','65%',65]].map(([s,p,n]) => (
              <div className="mockup-bar-row" key={s}>
                <span className="mockup-bar-name">{s}</span>
                <div className="mockup-bar-track"><div className="mockup-bar-fill" style={{ width:`${n}%`, background: n>=75?'#10b981':'#ef4444' }} /></div>
                <span className="mockup-bar-pct">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── FEATURES ───────────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon:'🎓', title:'Student Portal', desc:'Students log in with their register number and OTP. View attendance, results, internships, and update profile via chatbot commands.', color:'#6c63ff' },
  { icon:'👨‍🏫', title:'Staff Dashboard', desc:'Faculty and HODs manage their department—upload Excel data, enter attendance and results, search students with fuzzy matching and photos.', color:'#22d3ee' },
  { icon:'🤖', title:'Campus IQ Chatbot', desc:'Powered by Groq LLaMA 3.1. Answers academic queries, updates student data on command, and works on both web dashboard and WhatsApp.', color:'#10b981' },
  { icon:'🛡️', title:'Admin Control', desc:'Admins have full visibility across all departments — audit logs, staff management, cross-department analytics, and data protection.', color:'#f59e0b' },
  { icon:'📊', title:'Excel Bulk Import', desc:'Staff can upload an Excel file to instantly populate the database with hundreds of student records, attendance, or results in one click.', color:'#ec4899' },
  { icon:'📱', title:'WhatsApp Bot', desc:'Students query their academic data via WhatsApp. Same AI engine, same data — accessible anywhere without opening a browser.', color:'#06b6d4' },
];

function Features() {
  const [ref, v] = useReveal();
  return (
    <section id="features" className="section-features" ref={ref}>
      <div className={`section-inner ${v ? 'reveal-in' : ''}`}>
        <p className="section-tag">Features</p>
        <h2 className="section-title">Everything your institution needs</h2>
        <p className="section-sub">One platform for students, faculty, HODs, and admins — all powered by AI.</p>
        <div className="features-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background:`${f.color}18`, border:`1px solid ${f.color}30` }}>
                <span style={{ fontSize:'1.5rem' }}>{f.icon}</span>
              </div>
              <h3 className="feature-title" style={{ color: f.color }}>{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── DEMO ───────────────────────────────────────────────────────────────────── */
function Demo() {
  const [tab, setTab] = useState(0);
  const [ref, v] = useReveal();
  const tabs = [
    { label:'📊 Student View', content:<StudentDemo /> },
    { label:'👨‍🏫 Staff View',   content:<StaffDemo /> },
    { label:'🤖 Campus IQ',    content:<ChatDemo /> },
  ];
  return (
    <section id="demo" className="section-demo" ref={ref}>
      <div className={`section-inner ${v ? 'reveal-in' : ''}`}>
        <p className="section-tag">Product Demo</p>
        <h2 className="section-title">See it in action</h2>
        <div className="demo-tabs">
          {tabs.map((t, i) => (
            <button key={i} className={`demo-tab ${tab===i?'demo-tab--active':''}`} onClick={() => setTab(i)}>{t.label}</button>
          ))}
        </div>
        <div className="demo-content">{tabs[tab].content}</div>
      </div>
    </section>
  );
}

function StudentDemo() {
  return (
    <div className="demo-panel">
      <div className="demo-stat-row">
        {[['📊 Attendance','79%','Avg across 5 subjects','#6c63ff'],['📝 Results','A+','Semester 4 top grade','#22d3ee'],['💼 Internship','TCS','Software Dev Intern','#10b981']].map(([icon,val,sub,c]) => (
          <div key={val} className="demo-stat" style={{ borderLeftColor:c }}>
            <p style={{ fontSize:'1.6rem', fontWeight:800, color:c }}>{val}</p>
            <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:'2px' }}>{sub}</p>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'12px', padding:'1.25rem', marginTop:'1rem' }}>
        <p style={{ fontSize:'0.78rem', fontWeight:700, color:'#6ee7b7', marginBottom:'0.75rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>📊 Attendance by Subject</p>
        {[['Database Management',91,'#10b981'],['Software Engineering',88,'#10b981'],['Data Structures',82,'#10b981'],['Operating Systems',71,'#f59e0b'],['Computer Networks',65,'#ef4444']].map(([s,n,c]) => (
          <div key={s} style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
            <span style={{ fontSize:'0.78rem', color:'#cbd5e1', minWidth:'150px' }}>{s}</span>
            <div style={{ flex:1, height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'99px', overflow:'hidden' }}>
              <div style={{ width:`${n}%`, height:'100%', background:c, borderRadius:'99px' }} />
            </div>
            <span style={{ fontSize:'0.78rem', fontWeight:700, color:c }}>{n}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StaffDemo() {
  return (
    <div className="demo-panel">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
        {[['🎓 Total Students','48','CS Department'],['📊 Avg Attendance','78%','Across all subjects'],['⚠️ Low Attendance','5','Below 75%'],['💼 Active Internships','12','Currently ongoing']].map(([icon,v,s]) => (
          <div key={v} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'0.85rem', border:'1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize:'1.3rem', fontWeight:800, color:'#f1f5f9' }}>{v}</p>
            <p style={{ fontSize:'0.72rem', color:'#64748b' }}>{s}</p>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(239,68,68,0.05)', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'10px', padding:'1rem' }}>
        <p style={{ fontSize:'0.78rem', fontWeight:700, color:'#fca5a5', marginBottom:'0.5rem' }}>⚠️ Students Below 75% Attendance</p>
        {[['Arun Kumar','21CS042','68%'],['Priya S','21CS017','63%'],['Vikram M','21CS031','59%']].map(([n,r,p]) => (
          <div key={r} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize:'0.82rem', color:'#f1f5f9' }}>{n} <span style={{ color:'#64748b' }}>({r})</span></span>
            <span style={{ fontSize:'0.82rem', fontWeight:700, color:'#ef4444' }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatDemo() {
  const msgs = [
    { from:'user', text:'Show my attendance for all subjects' },
    { from:'ai',   text:'📊 Here\'s your attendance summary:\n• Database Management: 91% ✅\n• Software Engineering: 88% ✅\n• Data Structures: 82% ✅\n• Operating Systems: 71% ⚠️\n• Computer Networks: 65% ❌\n\nYour Overall average: 79.4% — You\'re doing great! Just try to improve Networks attendance.' },
    { from:'user', text:'update my phone to +919876543210' },
    { from:'ai',   text:'✅ Done! Your phone number has been updated to +919876543210. Your profile is now up to date.' },
  ];
  return (
    <div className="demo-panel" style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
      {msgs.map((m,i) => (
        <div key={i} style={{ display:'flex', justifyContent: m.from==='user'?'flex-end':'flex-start' }}>
          <div style={{ maxWidth:'80%', background: m.from==='user'?'linear-gradient(135deg,#6c63ff,#22d3ee)':'rgba(255,255,255,0.06)', padding:'0.65rem 0.95rem', borderRadius:'12px', fontSize:'0.82rem', color:'#f1f5f9', whiteSpace:'pre-line', lineHeight:1.6 }}>
            {m.text}
          </div>
        </div>
      ))}
      <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'10px', padding:'0.65rem 1rem', display:'flex', alignItems:'center', gap:'0.5rem', border:'1px solid rgba(255,255,255,0.08)', marginTop:'0.25rem' }}>
        <span style={{ flex:1, fontSize:'0.82rem', color:'#475569' }}>Ask about your attendance, results…</span>
        <div style={{ width:'28px', height:'28px', borderRadius:'50%', background:'linear-gradient(135deg,#6c63ff,#22d3ee)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  );
}

/* ── TESTIMONIALS ───────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name:'Dr. Anand Kumar', role:'Head of Department, CS', dept:'Sri Venkateswara College', text:'StudentVault transformed how we manage our department. The Excel import saved us hours every semester, and the AI chatbot means students get answers 24/7.', avatar:'A' },
  { name:'Ponraj Kumar', role:'Student, Computer Science', dept:'21CS101 · Semester 4', text:'I can check my attendance and results instantly. The chatbot even updated my phone number by just telling it what to change. It\'s incredible.', avatar:'P' },
  { name:'Prof. Meena Devi', role:'Faculty, Data Structures', dept:'Computer Science Dept.', text:'Finding students with low attendance used to take hours. Now I just search and see their photo, records, everything — in seconds.', avatar:'M' },
];

function Testimonials() {
  const [ref, v] = useReveal();
  return (
    <section id="about" className="section-testimonials" ref={ref}>
      <div className={`section-inner ${v ? 'reveal-in' : ''}`}>
        <p className="section-tag">Testimonials</p>
        <h2 className="section-title">Trusted by educators & students</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div className="testimonial-card" key={t.name}>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.avatar}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                  <p className="testimonial-dept">{t.dept}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── PRICING ────────────────────────────────────────────────────────────────── */
const PLANS = [
  { name:'Free', price:'₹0', period:'forever', desc:'Perfect for individual students', cta:'Get Started', popular:false,
    features:['Register number login + OTP','View own attendance & results','Campus IQ chatbot (30 queries/day)','WhatsApp bot access','Profile photo upload'] },
  { name:'Pro', price:'₹499', period:'per month', desc:'Ideal for faculty and HODs', cta:'Start Pro Trial', popular:true,
    features:['Everything in Free','Department-filtered student management','Excel bulk import (unlimited)','Attendance & results entry','Fuzzy photo search','Campus IQ unlimited queries'] },
  { name:'Enterprise', price:'Custom', period:'per institution', desc:'For entire colleges and universities', cta:'Contact Sales', popular:false,
    features:['Everything in Pro','All departments & admin control','White-label branding','SLA & dedicated support','API access','Custom integrations'] },
];

function Pricing({ navigate }) {
  const [ref, v] = useReveal();
  return (
    <section id="pricing" className="section-pricing" ref={ref}>
      <div className={`section-inner ${v ? 'reveal-in' : ''}`}>
        <p className="section-tag">Pricing</p>
        <h2 className="section-title">Simple, transparent pricing</h2>
        <p className="section-sub">Start free. Scale when you need.</p>
        <div className="pricing-grid">
          {PLANS.map(plan => (
            <div key={plan.name} className={`pricing-card ${plan.popular ? 'pricing-card--popular' : ''}`}>
              {plan.popular && <div className="pricing-badge">Most Popular</div>}
              <div className="pricing-header">
                <p className="pricing-name">{plan.name}</p>
                <div className="pricing-price">
                  <span className="pricing-amount">{plan.price}</span>
                  <span className="pricing-period">/{plan.period}</span>
                </div>
                <p className="pricing-desc">{plan.desc}</p>
              </div>
              <ul className="pricing-features">
                {plan.features.map(f => (
                  <li key={f} className="pricing-feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17 4 12" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`pricing-cta ${plan.popular ? 'pricing-cta--primary' : 'pricing-cta--outline'}`}
                onClick={() => plan.cta === 'Contact Sales' ? window.scrollTo({ top: 0 }) : navigate('/login')}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ─────────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer id="contact" className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <svg width="30" height="30" viewBox="0 0 44 44" fill="none">
            <rect width="44" height="44" rx="12" fill="url(#ftgrad)" />
            <defs><linearGradient id="ftgrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse"><stop stopColor="#6c63ff"/><stop offset="1" stopColor="#22d3ee"/></linearGradient></defs>
            <path d="M12 22l10 8 10-8M12 14l10 8 10-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="footer-brand-name">StudentVault</span>
        </div>
        <p className="footer-tagline">AI-Powered Academic Intelligence Platform</p>

        <div className="footer-links">
          {[['Product',['Features','Pricing','Changelog']],['Company',['About','Blog','Careers']],['Legal',['Privacy','Terms','Security']]].map(([col,links]) => (
            <div key={col} className="footer-col">
              <p className="footer-col-title">{col}</p>
              {links.map(l => <a key={l} href="#" className="footer-link">{l}</a>)}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 StudentVault. Built with ❤️ for academic excellence.</p>
          <div className="footer-socials">
            {['GitHub','Twitter','LinkedIn'].map(s => <a key={s} href="#" className="footer-social">{s}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
