import { useState, useRef, useEffect } from 'react';
import { SUGGESTIONS } from '../data';
import StudentCard from './StudentCard';

/* ---- Sub-components ---- */

function BotAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
      bg-gradient-to-br from-[#4ff07f] to-[#25d366] shadow-lg shadow-[#4ff07f]/20">
      <span className="material-symbols-outlined text-[16px] text-[#003915]"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        smart_toy
      </span>
    </div>
  );
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
      bg-gray-100 dark:bg-white/10 border border-[#4ff07f]/30">
      <span className="material-symbols-outlined text-[16px] text-[#4ff07f]"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        person
      </span>
    </div>
  );
}

function UserMessage({ msg }) {
  return (
    <div className="flex items-end gap-2 flex-row-reverse animate-slide-right">
      <UserAvatar />
      <div className="max-w-xs">
        <div className="px-4 py-3 rounded-2xl rounded-br-sm text-sm"
          style={{
            background: 'linear-gradient(135deg, #4ff07f, #25d366)',
            color: '#003915',
            fontWeight: '600',
            boxShadow: '0 4px 14px rgba(79,240,127,0.2)',
          }}>
          {msg.text}
        </div>
        <p className="text-[10px] mt-1 text-right pr-1 text-gray-400 dark:text-[#8890b5]">{msg.time}</p>
      </div>
    </div>
  );
}

function BotMessage({ msg }) {
  return (
    <div className="flex items-end gap-2 animate-slide-left">
      <BotAvatar />
      <div className="max-w-sm">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm
          bg-white dark:bg-[#1a1a1a]
          border border-gray-200 dark:border-white/8
          text-gray-950 dark:text-[#f3f4f6]"
          style={{ whiteSpace: 'pre-line' }}>
          {msg.text}
        </div>
        {msg.students && msg.students.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-bold text-gray-600 dark:text-[#8890b5] uppercase tracking-wider ml-1">
              Matched Records ({msg.students.length})
            </p>
            <div className="grid grid-cols-1 gap-2">
              {msg.students.map(s => (
                <div key={s.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                    bg-white dark:bg-[#151515]
                    border border-gray-200 dark:border-white/8
                    hover:border-[#4ff07f]/40 transition-all">
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="w-8 h-8 rounded-lg"
                    onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=1e1e32&color=4ff07f`; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                    <p className="text-[10px] font-mono text-gray-600 dark:text-[#8890b5]">{s.dept} · Y{s.year} · {s.cgpa.toFixed(1)} GPA</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'clear'
                    ? 'bg-green-100 text-green-700 dark:bg-[#4ff07f]/15 dark:text-[#4ff07f]'
                    : 'bg-red-100 text-red-600 dark:bg-[#ffb4ab]/15 dark:text-[#ffb4ab]'}`}>
                    {s.attendance}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-[10px] mt-1 pl-1 text-gray-400 dark:text-[#8890b5]">{msg.time}</p>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-slide-left">
      <BotAvatar />
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2
        bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/8">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#4ff07f] typing-dot" />
          ))}
        </div>
        <span className="text-xs font-semibold text-[#4ff07f] ml-1" style={{ animation: 'fadeIn 1.4s ease infinite' }}>
          Thinking...
        </span>
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { text: '📊 Low attendance (<75%)', query: 'Show students with low attendance below 75%', color: 'rgba(79,240,127,0.08)', border: 'rgba(79,240,127,0.2)', textColor: '#4ff07f', role: 'faculty' },
  { text: '⚠️ Arrear list', query: 'List arrear students', color: 'rgba(255,180,171,0.08)', border: 'rgba(255,180,171,0.2)', textColor: '#ffb4ab', role: 'faculty' },
  { text: '🏆 Top performers', query: 'Show top performers by CGPA', color: 'rgba(249,208,63,0.08)', border: 'rgba(249,208,63,0.2)', textColor: '#f9d03f', role: 'faculty' },
  
  { text: '📈 My Attendance', query: 'Show my attendance', color: 'rgba(79,240,127,0.08)', border: 'rgba(79,240,127,0.2)', textColor: '#4ff07f', role: 'student' },
  { text: '📜 My Results', query: 'Show my results', color: 'rgba(173,198,255,0.08)', border: 'rgba(173,198,255,0.2)', textColor: '#adc6ff', role: 'student' },
  { text: '💼 My Internship', query: 'Show my internship details', color: 'rgba(249,208,63,0.08)', border: 'rgba(249,208,63,0.2)', textColor: '#f9d03f', role: 'student' },
];

const INITIAL_MESSAGES = [];



/* ---- Main Chatbot component ---- */
export default function Chatbot({ standalone = false, user }) {
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

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: msg, time: now() }]);
    setTyping(true);
    
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: msg,
          userRole: user?.role,
          studentId: user?.studentId || user?.username
        })
      });
      const data = await response.json();
      
      let matchedData = [];
      if (data.data && Array.isArray(data.data)) {
        // Map backend formatting to expected frontend bot format
        matchedData = data.data.map((item, idx) => ({
          ...item,
          id: item.rollNo || item._id || String(idx),
          name: item.name,
          dept: item._dept || item.dept || 'Unknown',
          year: item.year || item.semester || 3,
          cgpa: item.cgpa || 0,
          attendance: item.attendance || 90,
          status: item.arrears > 0 ? 'arrear' : 'clear',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(item.name?.substring(0,2) || 'XX')}&backgroundColor=4ff07f&textColor=003915`
        }));
      }

      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: data.message || "I couldn't process that properly.",
        time: now(),
        students: matchedData,
      }]);
    } catch (e) {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'ai',
        text: "Error connecting to AI service.",
        time: now(),
      }]);
    }
  };

  const clearChat = () => setMessages([{ id: Date.now(), role: 'ai', time: now(), text: '🗑️ Chat cleared. How can I help you? 👋' }]);
  const toggleMic = () => { setMicActive(true); setTimeout(() => setMicActive(false), 4000); };

  const chatHeight = standalone ? 'h-[68vh]' : 'h-80';

  return (
    <div className={`${standalone ? '' : 'mb-8'}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className={`font-black tracking-tight text-gray-900 dark:text-white ${standalone ? 'text-2xl' : 'text-xl'}`}>
            AI Campus Assistant
          </h2>
          <p className="text-sm mt-0.5 text-gray-600 dark:text-[#8890b5]">
            Ask anything about students, attendance, results, or reports.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-[#4ff07f]/8 dark:bg-[#4ff07f]/8 border border-[#4ff07f]/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ff07f] animate-pulse" />
          <span className="text-xs font-bold text-[#4ff07f]">Online</span>
        </div>
      </div>

      {/* Chat window */}
      <div className="rounded-2xl overflow-hidden
        bg-white dark:bg-[#121212]
        border border-gray-200 dark:border-white/5
        shadow-xl shadow-black/5 dark:shadow-black/40"
        style={{ maxWidth: standalone ? '100%' : 860, margin: '0 auto' }}>

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-3.5
          border-b border-gray-100 dark:border-white/5
          bg-gray-50 dark:bg-[#4ff07f]/[0.04]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            bg-gradient-to-br from-[#4ff07f] to-[#25d366] shadow-md shadow-[#4ff07f]/20">
            <span className="material-symbols-outlined text-[18px] text-[#003915]"
              style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">VSB AI Assistant</p>
            <p className="text-xs text-gray-600 dark:text-[#8890b5]">Powered by Institutional Intelligence</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={clearChat}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all
                text-gray-400 dark:text-[#8890b5]
                hover:bg-gray-100 dark:hover:bg-white/8 hover:text-gray-700 dark:hover:text-white"
              title="Clear chat"
            >
              <span className="material-symbols-outlined text-base">delete_sweep</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className={`flex flex-col gap-4 p-5 ${chatHeight} overflow-y-auto scrollbar-thin
          bg-gray-50/50 dark:bg-black/20`}>

          {/* Quick action chips inside chat */}
          <div className="flex items-end gap-2">
            <BotAvatar />
            <div className="max-w-sm">
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm text-sm
                bg-white dark:bg-[#28283d]
                border border-gray-200 dark:border-white/8">
                <p className="font-semibold mb-2.5 text-xs text-gray-600 dark:text-[#8890b5]">Quick actions — click to ask:</p>
                <div className="space-y-1.5">
                  {QUICK_ACTIONS.filter(a => !a.role || a.role === user?.role).map(item => (
                    <button
                      key={item.text}
                      onClick={() => sendMessage(item.query)}
                      className="block w-full text-left text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.01]"
                      style={{ background: item.color, color: item.textColor, border: `1px solid ${item.border}` }}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {messages.map(m =>
            m.role === 'user'
              ? <UserMessage key={m.id} msg={m} />
              : <BotMessage key={m.id} msg={m} />
          )}
          {typing && <TypingIndicator />}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto no-scrollbar
          border-t border-gray-100 dark:border-white/5
          bg-white dark:bg-[#0d0d0d]">
          {SUGGESTIONS.map(s => (
            <button
              key={s.label}
              className="suggestion-chip flex-shrink-0"
              onClick={() => { setInput(s.query); inputRef.current?.focus(); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="px-4 py-3 bg-white dark:bg-[#0d0d0d]">
          <div className="flex items-center gap-2">
            <button
              className={`mic-btn ${micActive ? 'listening' : ''}`}
              onClick={toggleMic}
              title="Voice input"
            >
              <span className="material-symbols-outlined text-base">{micActive ? 'mic_off' : 'mic'}</span>
            </button>
            <input
              ref={inputRef}
              className="chat-input flex-1"
              placeholder="Ask about students, attendance, results..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
            <button
              className={`send-btn ${!input.trim() ? 'opacity-60' : ''}`}
              onClick={() => sendMessage()}
              title="Send"
            >
              <span className="material-symbols-outlined text-base">send</span>
            </button>
          </div>
          <p className="text-[10px] mt-2 text-center text-gray-600 dark:text-[#8890b5]">
            Press Enter to send · Results are shown as inline student cards
          </p>
        </div>
      </div>
    </div>
  );
}
