import { useState, useRef, useEffect } from 'react';
import { getAIResponse, SUGGESTIONS } from '../data';

function BotIcon() {
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,240,127,0.12)' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#4ff07f', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
    </div>
  );
}

function UserIcon() {
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(79,240,127,0.15)', border: '1px solid rgba(79,240,127,0.2)' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#4ff07f', fontVariationSettings: "'FILL' 1" }}>person</span>
    </div>
  );
}

function Message({ msg }) {
  const time = msg.time;
  if (msg.role === 'user') {
    return (
      <div className="flex items-end gap-2 flex-row-reverse animate-slide-right">
        <UserIcon />
        <div>
          <div className="bubble-user px-4 py-3 max-w-xs text-sm ml-auto" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
          <p className="text-xs mt-1 text-right pr-1" style={{ color: '#8890b5' }}>{time}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-end gap-2 animate-slide-left">
      <BotIcon />
      <div>
        <div className="bubble-ai px-4 py-3 max-w-sm text-sm" style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
        <p className="text-xs mt-1 pl-1" style={{ color: '#8890b5' }}>{time}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotIcon />
      <div className="bubble-ai px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4ff07f' }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4ff07f' }} />
          <div className="w-2 h-2 rounded-full typing-dot" style={{ background: '#4ff07f' }} />
        </div>
        <span className="text-xs font-semibold ml-1" style={{ color: '#4ff07f', animation: 'fadeInOut 1.4s ease infinite' }}>AI is thinking...</span>
      </div>
    </div>
  );
}

const INITIAL_MESSAGES = [
  { id: 1, role: 'ai', time: 'Today, 9:00 AM', text: '👋 Hello! I\'m your VSB AI Campus Assistant. Ask me about student records, attendance, CGPA, arrears, or generate reports instantly.' },
];

export default function Chatbot() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: now() }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: getAIResponse(msg), time: now() }]);
    }, 1000 + Math.random() * 700);
  };

  const clearChat = () => setMessages([{ id: Date.now(), role: 'ai', time: now(), text: 'Chat cleared. How can I assist you? 👋' }]);

  const toggleMic = () => {
    setMicActive(true);
    setTimeout(() => setMicActive(false), 4000);
  };

  return (
    <div className="mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">AI Campus Assistant</h2>
          <p className="text-sm mt-0.5" style={{ color: '#8890b5' }}>Ask anything about students, attendance, results, or reports.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(79,240,127,0.08)', border: '1px solid rgba(79,240,127,0.2)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4ff07f' }} />
          <span className="text-xs font-bold" style={{ color: '#4ff07f' }}>Online</span>
        </div>
      </div>

      {/* Chat window */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#1e1e32', border: '1px solid rgba(60,74,61,0.3)', maxWidth: 820, margin: '0 auto' }}>
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(60,74,61,0.3)', background: 'rgba(79,240,127,0.06)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(79,240,127,0.15)', border: '1px solid rgba(79,240,127,0.25)' }}>
            <span className="material-symbols-outlined text-xl" style={{ color: '#4ff07f', fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <p className="text-sm font-bold text-white">VSB AI Assistant</p>
            <p className="text-xs" style={{ color: '#8890b5' }}>Powered by Institutional Intelligence</p>
          </div>
          <button onClick={clearChat} className="ml-auto transition-colors" style={{ color: '#8890b5', background: 'none', border: 'none', cursor: 'pointer' }} title="Clear chat">
            <span className="material-symbols-outlined text-base">delete_sweep</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-4 p-5 h-80 overflow-y-auto scrollbar-thin" style={{ background: 'rgba(17,17,37,0.3)' }}>
          {/* Quick actions bubble */}
          <div className="flex items-end gap-2">
            <BotIcon />
            <div>
              <div className="bubble-ai px-4 py-3 max-w-sm text-sm">
                <p className="font-semibold mb-2 text-xs" style={{ color: '#8890b5' }}>Try asking:</p>
                <div className="space-y-1.5">
                  {[
                    { text: '📊 Show students with attendance below 75%', color: 'rgba(79,240,127,0.08)', border: 'rgba(79,240,127,0.15)', textColor: '#4ff07f' },
                    { text: '⚠️ List CSE department arrear students', color: 'rgba(255,180,171,0.08)', border: 'rgba(255,180,171,0.15)', textColor: '#ffb4ab' },
                    { text: '🏆 Who has the highest CGPA in ECE?', color: 'rgba(249,208,63,0.08)', border: 'rgba(249,208,63,0.15)', textColor: '#f9d03f' },
                  ].map(item => (
                    <button key={item.text} onClick={() => sendMessage(item.text.replace(/^[^\s]+\s/, ''))}
                      className="block w-full text-left text-xs px-3 py-1.5 rounded transition-colors"
                      style={{ background: item.color, color: item.textColor, border: `1px solid ${item.border}` }}>
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs mt-1 pl-1" style={{ color: '#8890b5' }}>Today, 9:00 AM</p>
            </div>
          </div>

          {messages.map(m => <Message key={m.id} msg={m} />)}
          {typing && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion chips */}
        <div className="px-5 pt-3 pb-1 flex gap-2 overflow-x-auto no-scrollbar" style={{ background: '#1a1a2e', borderTop: '1px solid rgba(60,74,61,0.3)' }}>
          {SUGGESTIONS.map(s => (
            <button key={s.label} className="suggestion-chip" onClick={() => { setInput(s.query); inputRef.current?.focus(); }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-5 py-4" style={{ background: '#1a1a2e' }}>
          <div className="flex items-center gap-3">
            <button className={`mic-btn${micActive ? ' listening' : ''}`} onClick={toggleMic} title="Voice input">
              <span className="material-symbols-outlined text-base">mic</span>
            </button>
            <input
              ref={inputRef}
              className="chat-input flex-1"
              placeholder="Ask about students, attendance, results..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button className="send-btn" onClick={() => sendMessage()} title="Send">
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
