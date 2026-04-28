/**
 * client/src/components/ChatBot.jsx  (v3 — PRD-compliant)
 * ──────────────────────────────────────────────────────────
 * Floating Campus IQ chatbot widget. Works for student, staff & admin roles.
 * API: POST /api/chat  (requires JWT in Authorization header)
 */
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ChatBot.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Quick prompts per role
const QUICK_PROMPTS = {
  student: [
    'Show my attendance',
    'My latest results',
    'Do I have arrears?',
    'My CGPA',
    'My internships',
  ],
  staff: [
    'Department overview',
    'Students below 75% attendance',
    'Pending update requests',
    'Top performers',
  ],
  admin: [
    'System stats',
    'Department breakdown',
    'Recent audit logs',
    'Staff list',
  ],
};

// Typing indicator bubble
function TypingIndicator() {
  return (
    <div className="chat-message-row bot-row">
      <div className="bot-avatar">🤖</div>
      <div className="chat-bubble bot typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { token, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm **Campus IQ**, your AI academic assistant. Ask me anything about your data!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, loading]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const role = user?.role || user?.portal || 'student';
  const prompts = QUICK_PROMPTS[role] || QUICK_PROMPTS.student;

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/chat`,
        { message: msg },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = data?.data;
      let reply = '';

      if (typeof raw === 'string') {
        reply = raw;
      } else if (raw?.reply) {
        reply = raw.reply;
      } else if (raw?.message) {
        reply = raw.message;
      } else {
        reply = JSON.stringify(raw, null, 2);
      }

      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: `❌ ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render message text with basic markdown bold support
  const renderText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        id="chatbot-fab-btn"
        className={`chatbot-fab ${open ? 'chatbot-fab--active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close Campus IQ' : 'Open Campus IQ chat'}
        title={open ? 'Close chat' : 'Ask Campus IQ'}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        )}
        {!open && <span className="fab-badge">AI</span>}
      </button>

      {/* ── Chat Window ── */}
      <div
        id="chatbot-window"
        className={`chatbot-window ${open ? 'chatbot-window--open' : ''}`}
        role="dialog"
        aria-label="Campus IQ Chat"
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar-ring">🤖</div>
            <div>
              <p className="chatbot-name">Campus IQ</p>
              <p className="chatbot-status">
                <span className="status-dot" />
                AI-powered · Always on
              </p>
            </div>
          </div>
          <button
            className="chatbot-close-btn"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" id="chatbot-messages-list">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`chat-message-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}
            >
              {msg.role === 'bot' && <div className="bot-avatar">🤖</div>}
              <div className={`chat-bubble ${msg.role}`}>
                {renderText(msg.text)}
              </div>
            </div>
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && !loading && (
          <div className="chatbot-chips">
            {prompts.map((p) => (
              <button
                key={p}
                className="chip"
                onClick={() => sendMessage(p)}
                disabled={loading}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && <p className="chatbot-error" style={{ margin: '0 1rem' }}>{error}</p>}

        {/* Input Row */}
        <div className="chatbot-input-row">
          <input
            ref={inputRef}
            id="chatbot-input"
            className="chatbot-input"
            type="text"
            placeholder="Ask about attendance, results, CGPA…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            maxLength={500}
            aria-label="Chat message input"
          />
          <button
            id="chatbot-send-btn"
            className="chatbot-send-btn"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
            title="Send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
