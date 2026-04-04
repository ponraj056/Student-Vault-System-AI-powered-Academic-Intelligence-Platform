# 🚀 StudentVault System

**StudentVault** is an AI-powered academic intelligence platform that enables instant access, analysis, and management of student data using natural language queries.

> ❝ No dashboards. Just insights. ❞

---

## 🎯 Problem

Academic data is often:
- Scattered across multiple systems
- Hard to access quickly
- Dependent on complex dashboards
- Time-consuming for generating reports

---

## 💡 Solution

StudentVault simplifies everything by allowing users to:

- 🔍 Search students instantly
- 🤖 Ask questions like:
  - "Topper in semester 5"
  - "Students with arrears"
- 📊 View academic insights
- 📁 Generate reports automatically

---

## 🔥 Features

- 🔍 Smart student search (name / roll number)
- 🤖 Natural language query system
- 📊 Academic insights (CGPA, ranking, arrears)
- 📁 Report generation (PDF/Excel)
- 🖼️ Detailed student profile view

---

## 🧠 How It Works

User Input → Query Processing → Backend API → Database → AI Logic → Result

---

## ⚙️ Tech Stack

### Frontend
- React
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas

### AI Layer
- Rule-based Query Parser (extendable to LLM)

---

## 📁 Project Structure

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
