# StudentVault 🎓

> **AI-Powered Academic Intelligence Platform** — Natural language queries, role-based dashboards, and automated Excel imports for engineering college student data management.


---

## 📌 Overview

StudentVault is a full-stack web application that replaces manual student record management with an intelligent, role-aware platform. Faculty can upload bulk Excel files, query student data in plain English via **Campus IQ** (the AI chatbot), and students can view their own academic profile — all through a clean React dashboard.

---

## ✨ Features

### 🤖 Campus IQ — AI Chatbot
- Natural language queries: *"Who is the topper in CSE?"*, *"Show students with arrears"*, *"List students with CGPA above 8"*
- Rule-based intent detection + **Groq LLM** fallback for complex queries
- Role-scoped responses — students see only their own data; staff see only their department
- Student self-update requests routed through admin approval workflow

### 👤 Role-Based Access Control (RBAC)
| Role | Access |
|------|--------|
| **Student** | Own profile, results, attendance, internships |
| **Staff** | Their department's students, attendance upload, update approvals |
| **HOD** | Full department view including staff records |
| **Admin** | All departments, staff management, audit logs, system stats |

### 📊 Dashboards
- **Admin Dashboard** — Institution-wide stats, department breakdown, pending update requests, audit trail
- **Staff Dashboard** — Department-scoped student list, attendance management, internship registry
- **Student Dashboard** — Personal profile, results, attendance percentage, internship records

### 📂 Bulk Excel Import
- Auto-detects file type: Student Master / Attendance / Results
- Supports VSB standard result format (with subject-wise grade parsing)
- DOB parsing handles Excel serial numbers, DD/MM/YYYY, ISO strings
- Multi-alias column matching for real-world messy Excel files
- Department auto-detection from filename (e.g., `IT_students.xlsx`)

### 🔒 Authentication
- JWT-based auth (Bearer token + cookie fallback)
- OTP login for students (no password required)
- bcrypt password hashing for staff/admin accounts
- Rate limiter middleware for brute-force protection

### 📱 WhatsApp Integration *(Optional)*
- Webhook support via Twilio
- Students can query their data via WhatsApp messages

---

## 🛠️ Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Groq SDK (LLM — `llama3-70b-8192`)
- JWT + bcryptjs
- Multer (file uploads)
- ExcelJS / xlsx (Excel parsing)
- Cloudinary (photo storage)
- Twilio (WhatsApp webhook)
- Nodemailer (OTP emails)

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios

---

## 📁 Project Structure

```
StudentVault/
├── client/                        # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Landing.jsx        # Public landing page
│       │   ├── Login.jsx          # Login (role-aware)
│       │   ├── Dashboard.jsx      # Student dashboard
│       │   ├── StaffDashboard.jsx # Staff dashboard
│       │   └── AdminDashboard.jsx # Admin dashboard
│       ├── components/
│       │   ├── ChatBot.jsx        # Campus IQ chat UI
│       │   └── ...
│       └── context/
│           └── AuthContext.jsx    # Global auth state
│
└── server/                        # Express backend
    ├── index.js                   # Entry point, route mounting
    ├── models/
    │   ├── Student.js             # Student schema (OTP login)
    │   ├── Staff.js               # Staff schema
    │   ├── Result.js              # Semester results
    │   ├── Attendance.js          # Daily attendance records
    │   ├── Internship.js          # Internship registry
    │   ├── UpdateRequest.js       # Approval workflow
    │   ├── AuditLog.js            # Audit trail
    │   ├── Chat.js                # Chat history
    │   ├── OTP.js                 # OTP tokens
    │   └── WhatsappSession.js     # WhatsApp session state
    ├── routes/
    │   ├── auth.js                # Login, OTP, JWT issue
    │   ├── student.js             # Student self-access routes
    │   ├── staff.js               # Staff-scoped routes
    │   ├── admin.js               # Admin super-routes
    │   ├── chat.js                # Campus IQ chat endpoint
    │   ├── import.js              # Excel import endpoint
    │   └── whatsapp.js            # Twilio webhook
    ├── middleware/
    │   ├── auth.js                # JWT verify + role guards
    │   ├── upload.js              # Multer config
    │   └── rateLimiter.js         # Express rate limiter
    ├── services/
    │   ├── campusIQ.js            # AI chatbot logic (Groq + rules)
    │   ├── excelImportService.js  # Excel parse + DB upsert
    │   ├── auditService.js        # Audit log helper
    │   ├── otp.js                 # OTP generate + email
    │   └── photoService.js        # Cloudinary upload
    └── scripts/
        ├── seedAdmin.js           # Seed admin account
        ├── seedStaff.js           # Seed staff accounts
        └── seedData.js            # Seed sample student data
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Groq API key — [Free at console.groq.com](https://console.groq.com)

### 1. Clone the repository
```bash
git clone https://github.com/ponraj056/Student-Vault-System-AI-powered-Academic-Intelligence-Platform.git
cd Student-Vault-System-AI-powered-Academic-Intelligence-Platform
```

### 2. Configure environment
```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your_secret_key_here
GROQ_API_KEY=your_groq_api_key_here

# Optional
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Seed initial accounts
```bash
cd server
npm run seed:admin    # Creates admin account
npm run seed:staff    # Creates sample staff accounts
```

### 5. Run the application
```bash
# Terminal 1 — Backend
cd server
npm run dev           # Runs on http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev           # Runs on http://localhost:5173
```

---

## 🔑 Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin@vsb.edu.in` | `Admin@123` |
| Staff | `staff@vsb.edu.in` | `Staff@123` |
| Student | Register number email | OTP via email |

> ⚠️ Change all default credentials before deploying to production.

---

## 📤 Excel Upload Format

### Student Master
| Column | Example |
|--------|---------|
| Register Number | 622623104001 |
| Name | Ponraj D |
| Department | IT |
| Email | ponraj@vsb.edu.in |
| Phone | 9876543210 |
| Section | A |
| Year | 2 |
| Batch | 2023-27 |
| CGPA | 8.7 |
| Blood Group | O+ |
| Father Name | Dhanapal |
| Address | Karur, TN |

### Attendance
- Filename format: `IT_attendance_01-03-26.xlsx`
- Values: `P` / `A` / `Present` / `Absent`

### Results
- VSB standard result format supported (subject-wise with grade/GP)
- Auto-detected via `Subject #` header pattern

---

## 🔗 API Endpoints

### Auth
```
POST /api/auth/login          → Staff/Admin JWT login
POST /api/auth/student/otp    → Request OTP (student)
POST /api/auth/student/verify → Verify OTP, receive JWT
```

### Student (self-access)
```
GET  /api/student/profile     → Own profile
GET  /api/student/results     → Own results
GET  /api/student/attendance  → Own attendance
GET  /api/student/internships → Own internship records
```

### Staff
```
GET  /api/staff/students       → Department students
POST /api/staff/attendance     → Upload attendance
GET  /api/staff/update-requests → Pending student update requests
POST /api/staff/update-requests/:id/approve
```

### Admin
```
GET  /api/admin/dashboard      → System-wide stats
GET  /api/admin/students       → Search all students
GET  /api/admin/staff          → List all staff
POST /api/admin/staff          → Create staff account
POST /api/admin/upload-excel   → Bulk import
GET  /api/admin/audit-logs     → Full audit trail
```

### Chat
```
POST /api/chat                 → Campus IQ query
```

### WhatsApp
```
GET  /webhook/whatsapp         → Twilio webhook verify
POST /webhook/whatsapp         → Twilio message handler
```

---

## 🧠 Campus IQ — How It Works

1. **Intent Detection** — Rule-based regex patterns match common queries (toppers, arrears, CGPA filters, attendance, self-info)
2. **Role Scoping** — Student queries are automatically restricted to their own `regNo`; staff queries filter by their `department`
3. **Groq Fallback** — Unrecognized intents are forwarded to `llama3-70b-8192` with structured context about the database schema
4. **Update Workflow** — When a student requests a field update (e.g., "update my phone to 9876543210"), it creates an `UpdateRequest` record for staff approval rather than directly modifying the database

---

## 🚀 Deployment

### Backend (Render / Railway)
1. Push to GitHub
2. Set environment variables in the hosting platform
3. Build command: `npm install`
4. Start command: `node index.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m 'Add your feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Ponraj D**
- GitHub: [@ponraj056](https://github.com/ponraj056)
- Portfolio: [ponraj-dr-portfolio.netlify.app](https://ponraj-dr-portfolio.netlify.app)

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Built with ❤️ for V.S.B. Engineering College, Karur, Tamil Nadu.*
