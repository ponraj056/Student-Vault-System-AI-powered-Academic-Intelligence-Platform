import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import StudentModal from './components/StudentModal';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';

export default function App() {
  const [activeNav, setActiveNav] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { toasts, showToast, dismissToast } = useToast();

  const handleNavChange = (key) => {
    setActiveNav(key);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#111125' }}>
      <Sidebar activeNav={activeNav} onNavChange={handleNavChange} />
      <Topbar activeNav={activeNav} onBroadcast={() => showToast('Broadcast panel coming soon!', 'info')} />

      <main style={{ marginLeft: 240, marginTop: 64, padding: 32, minHeight: 'calc(100vh - 64px)' }}>
        <Dashboard
          activeNav={activeNav}
          onToast={showToast}
          onOpenModal={setSelectedStudent}
        />
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
