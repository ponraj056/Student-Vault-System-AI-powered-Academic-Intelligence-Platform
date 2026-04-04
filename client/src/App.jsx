import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import Attendance from './components/Attendance';
import Results from './components/Results';
import Reports from './components/Reports';
import Upload from './components/Upload';
import Settings from './components/Settings';
import StudentModal from './components/StudentModal';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

export default function App() {
  const [activeNav, setActiveNav] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const renderPage = () => {
    switch (activeNav) {
      case 'chatbot':    return <Chatbot standalone />;
      case 'attendance': return <Attendance onToast={showToast} />;
      case 'results':    return <Results onToast={showToast} />;
      case 'reports':    return <Reports onToast={showToast} />;
      case 'upload':     return <Upload onToast={showToast} />;
      case 'settings':   return <Settings theme={theme} setTheme={setTheme} onToast={showToast} />;
      default:           return (
        <Dashboard
          activeNav={activeNav}
          onToast={showToast}
          onOpenModal={setSelectedStudent}
          theme={theme}
        />
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111125] text-gray-900 dark:text-[#e2e0fc] transition-colors duration-300">
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      <Topbar
        activeNav={activeNav}
        onBroadcast={() => showToast('Broadcast panel coming soon!', 'info')}
        setTheme={setTheme}
        theme={theme}
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
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}