import { useEffect, useState } from 'react';

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const icons = { success: 'check_circle', error: 'cancel', info: 'info' };

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div className={`toast ${toast.type} ${visible ? 'show' : ''}`}>
      <span className="material-symbols-outlined toast-icon" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
        {icons[toast.type]}
      </span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8890b5', padding: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
      </button>
      <div className="toast-bar" style={{ animation: 'shrinkBar 3.5s linear forwards' }} />
    </div>
  );
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}
