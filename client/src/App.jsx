import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Attendance from './components/Attendance';
import Results from './components/Results';
import Internship from './components/Internship';
import Reports from './components/Reports';
import Upload from './components/Upload';
import Settings from './components/Settings';
import StudentModal from './components/StudentModal';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import Login from './components/Login';

export default function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeNav, setActiveNav] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'info');
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderPage = () => {
    switch (activeNav) {
      case 'chatbot':    return <Chatbot standalone user={user} />;
      case 'attendance': return <Attendance onToast={showToast} user={user} />;
      case 'results':    return <Results onToast={showToast} user={user} />;
      case 'internship': return <Internship onToast={showToast} user={user} />;
      case 'reports':    return <Reports onToast={showToast} user={user} />;
      case 'upload':     return <Upload onToast={showToast} user={user} />;
      case 'settings':   return <Settings theme={theme} setTheme={setTheme} onToast={showToast} user={user} />;
      default:           return (
        <Dashboard
          activeNav={activeNav}
          onToast={showToast}
          onOpenModal={setSelectedStudent}
          theme={theme}
          user={user}
        />
      );
    }
  };

  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-[#e5e7eb] transition-colors duration-300 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="bg-blob blob-1 hidden dark:block" />
      <div className="bg-blob blob-2 hidden dark:block" />

      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} user={user} onLogout={handleLogout} />

      <Topbar
        activeNav={activeNav}
        onBroadcast={() => showToast('Broadcast panel coming soon!', 'info')}
        setTheme={setTheme}
        theme={theme}
        user={user}
      />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-8">
          {renderPage()}
        </div>
      </main>

      <StudentModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onToast={showToast}
        user={user}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}