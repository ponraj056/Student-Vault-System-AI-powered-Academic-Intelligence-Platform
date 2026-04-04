# 🎓 Campus AI Assistant — React + Vite + Tailwind

AI-powered campus intelligence dashboard for V.S.B. Engineering College.

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# http://localhost:5173
```

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx        ← Left navigation
│   ├── Topbar.jsx         ← Top navbar
│   ├── Dashboard.jsx      ← Main page (stats + records)
│   ├── Chatbot.jsx        ← AI chat interface
│   ├── Analytics.jsx      ← Charts (Bar + Doughnut)
│   ├── StudentCard.jsx    ← Individual student card
│   ├── StudentModal.jsx   ← Student detail popup
│   └── ToastContainer.jsx ← Notification toasts
├── data/
│   └── index.js           ← Student data + AI responses
├── hooks/
│   └── useToast.js        ← Toast state hook
├── App.jsx                ← Root component
├── main.jsx               ← Entry point
└── index.css              ← Global styles
```

## 🛠️ Tech Stack

| Layer     | Tech                    |
|-----------|-------------------------|
| Frontend  | React 18 + Vite         |
| Styling   | Tailwind CSS            |
| Charts    | Chart.js + react-chartjs-2 |
| Icons     | Material Symbols        |

## 🌐 GitHub Push

```bash
git init
git add .
git commit -m "feat: campus AI assistant React app"
git remote add origin https://github.com/YOUR_USERNAME/campus-ai-assistant.git
git push -u origin main
```

## 🔜 Next Steps

- [ ] FastAPI backend (`/api/students`, `/api/chat`)
- [ ] MongoDB student database
- [ ] OpenAI / LLM real query parsing
- [ ] Authentication (JWT)
- [ ] Real-time updates (WebSocket)

---
> "AI-powered campus assistant that reduces manual student data retrieval time using natural language."
