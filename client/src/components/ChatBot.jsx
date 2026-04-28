/**
 * client/src/components/ChatBot.jsx  (v3 — PRD-compliant)
 * ----------------------------------------------------------
 * Floating Campus IQ chatbot widget.
 * Now role-aware: uses /api/chat (which scopes by JWT role).
 * Handles update-request responses from the AI.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ChatBot.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const QUICK_PROMPTS = [
  { label: '📊 My attendance', text: 'Show my attendance for all subjects' },
  { label: '📝 Latest results', text: 'What are my latest exam results?' },
  { label: '📞 Update phone', text: 'Update my phone to ' },
  { label: '🎓 My profile', text: 'Show my profile' },
];

function TypingIndicator() {
  return (
    <div className="chat-bubble bot typing-bubble" aria-label="Campus IQ is thinking">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}

function Message({ msg }) {
  const isBot = msg.sender === 'bot';
  return (
    <div className={`chat-message-row ${isBot ? 'bot-row' : 'user-row'}`}>
      {isBot && (
        <div className="bot-avatar" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="url(#grad)" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
            <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
        {msg.text}
      </div>
    </div>
  );
}

export default function ChatBot() {
  const { token, user } = useAuth();
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError]     = useState('');
  const messagesEndRef         = useRef(null);
  const inputRef               = useRef(null);

  const regNo = user?.regNo || user?.employeeId;

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120);
      if (!historyLoaded) loadHistory();
    }
  }, [open]);

  const loadHistory = useCallback(async () => {
    if (!token || !regNo) return;
    try {
      const { data } = await axios.get(`${API}/api/chat/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { regNo },
      });
      const history = data.data || data.history || [];
      const formatted = history.flatMap((turn) => [
        { id: `u-${turn._id}`, sender: 'user', text: turn.message },
        { id: `b-${turn._id}`, sender: 'bot',  text: turn.reply  },
      ]);
      if (formatted.length > 0) {
        setMessages(formatted);
      } else {
        setMessages([{
          id: 'welcome', sender: 'bot',
          text: `👋 Hi ${user?.name || 'there'}! I'm Campus IQ, your AI academic assistant. Ask me anything about your attendance, results, or type "update my phone to ..." to request a change!`,
        }]);
      }
      setHistoryLoaded(true);
    } catch {
      setMessages([{
        id: 'welcome', sender: 'bot',
        text: `👋 Hi ${user?.name || 'there'}! I'm Campus IQ. How can I help you today?`,
      }]);
      setHistoryLoaded(true);
    }
  }, [token, user]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || loading) return;
    if (!token) { setError('Please log in to use Campus IQ.'); return; }

    setError('');
    setInput('');
    const userMsg = { id: Date.now() + '-u', sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API}/api/chat`,
        { message: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Handle structured response from role-aware campusIQ
      const result = data.data || data;
      const replyText = typeof result === 'string' ? result : (result.reply || JSON.stringify(result));
      const botMsg = { id: Date.now() + '-b', sender: 'bot', text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errText = err.response?.data?.error || 'Something went wrong. Please try again.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + '-err', sender: 'bot', text: `⚠️ ${errText}` },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, token, user]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!token) return null;

  return (
    <>
      {/* ── Chat Window ── */}
      <div className={`chatbot-window ${open ? 'chatbot-window--open' : ''}`} aria-label="Campus IQ Chat">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <div className="chatbot-avatar-ring">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="url(#hgrad)" />
                <defs>
                  <linearGradient id="hgrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6c63ff" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
                <path d="M8 12h8M12 8v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p className="chatbot-name">Campus IQ</p>
              <p className="chatbot-status">
                <span className="status-dot" />
                AI Academic Assistant
              </p>
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" role="log" aria-live="polite">
          {messages.map((msg) => <Message key={msg.id} msg={msg} />)}
          {loading && <TypingIndicator />}
          {error && <p className="chatbot-error">{error}</p>}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && !loading && (
          <div className="chatbot-chips" role="group" aria-label="Quick prompts">
            {QUICK_PROMPTS.map((q) => (
              <button key={q.text} className="chip" onClick={() => sendMessage(q.text)} disabled={loading}>
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-row">
          <input ref={inputRef} id="chatbot-input" type="text" className="chatbot-input"
            placeholder="Ask about attendance, results…"
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey} disabled={loading}
            aria-label="Chat message input" maxLength={500} />
          <button id="chatbot-send-btn" className="chatbot-send-btn"
            onClick={() => sendMessage()} disabled={loading || !input.trim()} aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── FAB Button ── */}
      <button id="chatbot-fab" className={`chatbot-fab ${open ? 'chatbot-fab--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Campus IQ chat' : 'Open Campus IQ chat'}
        title="Campus IQ — AI Assistant">
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
        <span className="fab-badge" aria-hidden="true">AI</span>
      </button>
    </>
  );
}
