/**
 * server/scripts/seed.js  (v4 — Multi-dept, richer data)
 * ─────────────────────────────────────────────────────────
 * Master seed: creates demo users + academic data.
 * Departments: CSE, IT, ECE
 * Usage: node scripts/seed.js
 */
require('dotenv').config();
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');

const Student    = require('../models/Student');
const Staff      = require('../models/Staff');
const Attendance = require('../models/Attendance');
const Result     = require('../models/Result');
const Internship = require('../models/Internship');

// Grade-point map (Anna University) for CGPA calculation
const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'U': 0 };
function calcCgpa(results) {
  if (!results.length) return null;
  const total = results.reduce((s, r) => s + (GRADE_POINTS[r.grade] || 0), 0);
  return parseFloat((total / results.length).toFixed(2));
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // ── 1. Clear old demo data ──────────────────────────────────────────────────
  const regNos = [
    '21CSR001','21CSR002','21CSR003',
    '21ITR001','21ITR002','21ITR003',
    '21ECR001','21ECR002','21ECR003',
  ];
  const empIds = ['FAC001','FAC002','FAC003','FAC004','FAC005','ADM001'];

  const oldStudents = await Student.find({ regNo: { $in: regNos } }).lean();
  const oldIds = oldStudents.map(s => s._id);

  if (oldIds.length) {
    await Attendance.deleteMany({ studentId: { $in: oldIds } });
    await Result.deleteMany({ studentId: { $in: oldIds } });
    await Internship.deleteMany({ studentId: { $in: oldIds } });
  }
  await Student.deleteMany({ regNo: { $in: regNos } });
  await Staff.deleteMany({ employeeId: { $in: empIds } });
  console.log('🗑  Cleared old demo records');

  // ── 2. Students (3 per department) ─────────────────────────────────────────
  // CSE students
  const [s1, s2, s3] = await Student.create([
    { name:'Arjun Ravi',   regNo:'21CSR001', department:'CSE', email:'student@demo.com', phone:'+919876543100', section:'A', year:3, semester:5, batch:'2021-25', bloodGroup:'O+',  isActive:true },
    { name:'Priya Sharma', regNo:'21CSR002', department:'CSE', email:'priya@demo.com',   phone:'+919876543101', section:'A', year:3, semester:5, batch:'2021-25', bloodGroup:'A+',  isActive:true },
    { name:'Vikram Mohan', regNo:'21CSR003', department:'CSE', email:'vikram@demo.com',  phone:'+919876543102', section:'B', year:3, semester:5, batch:'2021-25', bloodGroup:'B+',  isActive:true },
  ]);
  // IT students
  const [s4, s5, s6] = await Student.create([
    { name:'Keerthana Raj', regNo:'21ITR001', department:'IT', email:'keerthana@demo.com', phone:'+919876543103', section:'A', year:3, semester:5, batch:'2021-25', bloodGroup:'AB+', isActive:true },
    { name:'Rahul Nair',    regNo:'21ITR002', department:'IT', email:'rahul@demo.com',     phone:'+919876543104', section:'B', year:3, semester:5, batch:'2021-25', bloodGroup:'O-',  isActive:true },
    { name:'Divya Krishnan',regNo:'21ITR003', department:'IT', email:'divya@demo.com',     phone:'+919876543105', section:'B', year:3, semester:5, batch:'2021-25', bloodGroup:'A-',  isActive:true },
  ]);
  // ECE students
  const [s7, s8, s9] = await Student.create([
    { name:'Sanjay Kumar',  regNo:'21ECR001', department:'ECE', email:'sanjay@demo.com', phone:'+919876543106', section:'A', year:3, semester:5, batch:'2021-25', bloodGroup:'B-',  isActive:true },
    { name:'Lakshmi Devi',  regNo:'21ECR002', department:'ECE', email:'lakshmi@demo.com',phone:'+919876543107', section:'A', year:3, semester:5, batch:'2021-25', bloodGroup:'O+',  isActive:true },
    { name:'Arun Prasad',   regNo:'21ECR003', department:'ECE', email:'arun@demo.com',   phone:'+919876543108', section:'B', year:3, semester:5, batch:'2021-25', bloodGroup:'AB-', isActive:true },
  ]);
  console.log('✅ 9 students created (CSE×3, IT×3, ECE×3)');

  // ── 3. Staff (HoD + Staff per dept, 1 admin) ─────────────────────────────────
  await Staff.create([
    { name:'Dr. Ramesh Kumar', employeeId:'FAC001', department:'CSE', email:'ramesh@vsb.edu', phone:'+919876543001', role:'hod',   subject:'Software Engineering', isActive:true },
    { name:'Prof. Meena Devi', employeeId:'FAC002', department:'CSE', email:'meena@vsb.edu',  phone:'+919876543002', role:'staff', subject:'Data Structures',       isActive:true },
    { name:'Dr. Sundar Raj',   employeeId:'FAC003', department:'IT',  email:'sundar@vsb.edu', phone:'+919876543003', role:'hod',   subject:'Web Technologies',      isActive:true },
    { name:'Prof. Anitha S.',  employeeId:'FAC004', department:'IT',  email:'anitha@vsb.edu', phone:'+919876543004', role:'staff', subject:'Computer Networks',      isActive:true },
    { name:'Dr. Karthik B.',   employeeId:'FAC005', department:'ECE', email:'karthik@vsb.edu',phone:'+919876543005', role:'hod',   subject:'Embedded Systems',       isActive:true },
  ]);

  const adminHash = await bcrypt.hash('Admin@1234', 12);
  await Staff.create({ name:'System Administrator', employeeId:'ADM001', department:'Administration', email:'admin@vsb.edu', phone:'+919876543000', role:'admin', passwordHash:adminHash, isActive:true });
  console.log('✅ 5 faculty + 1 admin created');

  // ── 4. Attendance ────────────────────────────────────────────────────────────
  const allAttendance = [
    // CSE
    { studentId:s1._id, subject:'Data Structures',     percentage:82, month:'March 2026' },
    { studentId:s1._id, subject:'Operating Systems',   percentage:71, month:'March 2026' },
    { studentId:s1._id, subject:'Database Management', percentage:91, month:'March 2026' },
    { studentId:s1._id, subject:'Computer Networks',   percentage:65, month:'March 2026' },
    { studentId:s1._id, subject:'Software Engineering',percentage:88, month:'March 2026' },
    { studentId:s2._id, subject:'Data Structures',     percentage:95, month:'March 2026' },
    { studentId:s2._id, subject:'Operating Systems',   percentage:90, month:'March 2026' },
    { studentId:s2._id, subject:'Database Management', percentage:92, month:'March 2026' },
    { studentId:s3._id, subject:'Data Structures',     percentage:58, month:'March 2026' },
    { studentId:s3._id, subject:'Operating Systems',   percentage:62, month:'March 2026' },
    { studentId:s3._id, subject:'Database Management', percentage:70, month:'March 2026' },
    // IT
    { studentId:s4._id, subject:'Web Technologies',    percentage:89, month:'March 2026' },
    { studentId:s4._id, subject:'Computer Networks',   percentage:84, month:'March 2026' },
    { studentId:s4._id, subject:'DBMS',                percentage:78, month:'March 2026' },
    { studentId:s5._id, subject:'Web Technologies',    percentage:55, month:'March 2026' },
    { studentId:s5._id, subject:'Computer Networks',   percentage:60, month:'March 2026' },
    { studentId:s5._id, subject:'DBMS',                percentage:73, month:'March 2026' },
    { studentId:s6._id, subject:'Web Technologies',    percentage:93, month:'March 2026' },
    { studentId:s6._id, subject:'Computer Networks',   percentage:91, month:'March 2026' },
    { studentId:s6._id, subject:'DBMS',                percentage:88, month:'March 2026' },
    // ECE
    { studentId:s7._id, subject:'Circuits & Networks', percentage:76, month:'March 2026' },
    { studentId:s7._id, subject:'Embedded Systems',    percentage:80, month:'March 2026' },
    { studentId:s7._id, subject:'Digital Electronics', percentage:69, month:'March 2026' },
    { studentId:s8._id, subject:'Circuits & Networks', percentage:91, month:'March 2026' },
    { studentId:s8._id, subject:'Embedded Systems',    percentage:88, month:'March 2026' },
    { studentId:s8._id, subject:'Digital Electronics', percentage:95, month:'March 2026' },
    { studentId:s9._id, subject:'Circuits & Networks', percentage:52, month:'March 2026' },
    { studentId:s9._id, subject:'Embedded Systems',    percentage:68, month:'March 2026' },
    { studentId:s9._id, subject:'Digital Electronics', percentage:61, month:'March 2026' },
  ];
  await Attendance.insertMany(allAttendance);
  console.log(`✅ ${allAttendance.length} attendance records seeded`);

  // ── 5. Results (with CGPA auto-computation) ──────────────────────────────────
  const resultsData = [
    // CSE — Arjun
    { studentId:s1._id, semester:5, subject:'Data Structures',     marks:89, grade:'A+' },
    { studentId:s1._id, semester:5, subject:'Operating Systems',   marks:74, grade:'B+' },
    { studentId:s1._id, semester:5, subject:'Database Management', marks:92, grade:'O'  },
    { studentId:s1._id, semester:4, subject:'Computer Networks',   marks:78, grade:'A'  },
    { studentId:s1._id, semester:4, subject:'Software Engineering',marks:85, grade:'A'  },
    // CSE — Priya (topper)
    { studentId:s2._id, semester:5, subject:'Data Structures',     marks:96, grade:'O'  },
    { studentId:s2._id, semester:5, subject:'Operating Systems',   marks:91, grade:'O'  },
    { studentId:s2._id, semester:5, subject:'Database Management', marks:94, grade:'O'  },
    { studentId:s2._id, semester:4, subject:'Computer Networks',   marks:88, grade:'A+' },
    { studentId:s2._id, semester:4, subject:'Software Engineering',marks:93, grade:'O'  },
    // CSE — Vikram (arrear)
    { studentId:s3._id, semester:5, subject:'Data Structures',     marks:35, grade:'U'  },
    { studentId:s3._id, semester:5, subject:'Operating Systems',   marks:52, grade:'C'  },
    { studentId:s3._id, semester:5, subject:'Database Management', marks:61, grade:'B'  },
    // IT — Keerthana
    { studentId:s4._id, semester:5, subject:'Web Technologies',    marks:88, grade:'A+' },
    { studentId:s4._id, semester:5, subject:'Computer Networks',   marks:82, grade:'A'  },
    { studentId:s4._id, semester:5, subject:'DBMS',                marks:79, grade:'A'  },
    { studentId:s4._id, semester:4, subject:'Java Programming',    marks:91, grade:'O'  },
    // IT — Rahul (arrear)
    { studentId:s5._id, semester:5, subject:'Web Technologies',    marks:40, grade:'U'  },
    { studentId:s5._id, semester:5, subject:'Computer Networks',   marks:63, grade:'B'  },
    { studentId:s5._id, semester:5, subject:'DBMS',                marks:58, grade:'C'  },
    // IT — Divya (high performer)
    { studentId:s6._id, semester:5, subject:'Web Technologies',    marks:93, grade:'O'  },
    { studentId:s6._id, semester:5, subject:'Computer Networks',   marks:90, grade:'O'  },
    { studentId:s6._id, semester:5, subject:'DBMS',                marks:87, grade:'A+' },
    { studentId:s6._id, semester:4, subject:'Java Programming',    marks:95, grade:'O'  },
    // ECE — Sanjay
    { studentId:s7._id, semester:5, subject:'Circuits & Networks', marks:76, grade:'A'  },
    { studentId:s7._id, semester:5, subject:'Embedded Systems',    marks:81, grade:'A'  },
    { studentId:s7._id, semester:5, subject:'Digital Electronics', marks:69, grade:'B'  },
    // ECE — Lakshmi (high performer)
    { studentId:s8._id, semester:5, subject:'Circuits & Networks', marks:91, grade:'O'  },
    { studentId:s8._id, semester:5, subject:'Embedded Systems',    marks:88, grade:'A+' },
    { studentId:s8._id, semester:5, subject:'Digital Electronics', marks:94, grade:'O'  },
    // ECE — Arun (arrear)
    { studentId:s9._id, semester:5, subject:'Circuits & Networks', marks:33, grade:'U'  },
    { studentId:s9._id, semester:5, subject:'Embedded Systems',    marks:70, grade:'B+' },
    { studentId:s9._id, semester:5, subject:'Digital Electronics', marks:55, grade:'C'  },
  ];
  await Result.insertMany(resultsData);

  // Compute and store CGPA per student
  const studentList = [s1,s2,s3,s4,s5,s6,s7,s8,s9];
  for (const s of studentList) {
    const recs = resultsData.filter(r => r.studentId.equals ? r.studentId.equals(s._id) : r.studentId.toString() === s._id.toString());
    const cgpa = calcCgpa(recs);
    if (cgpa) await Student.findByIdAndUpdate(s._id, { cgpa });
  }
  console.log(`✅ ${resultsData.length} results seeded, CGPA auto-computed`);

  // ── 6. Internships ──────────────────────────────────────────────────────────
  const internships = [
    { studentId:s1._id, company:'TCS',     role:'Software Developer Intern',  startDate:new Date('2025-12-01'), endDate:new Date('2026-02-28'), status:'completed' },
    { studentId:s1._id, company:'Infosys', role:'Data Science Intern',        startDate:new Date('2026-05-01'), endDate:new Date('2026-07-31'), status:'upcoming'  },
    { studentId:s2._id, company:'Wipro',   role:'Web Developer Intern',       startDate:new Date('2026-01-15'), endDate:new Date('2026-03-15'), status:'completed' },
    { studentId:s2._id, company:'Google',  role:'SWE Intern',                 startDate:new Date('2026-06-01'), endDate:new Date('2026-08-31'), status:'upcoming'  },
    { studentId:s4._id, company:'Zoho',    role:'Full Stack Developer Intern', startDate:new Date('2026-01-01'), endDate:new Date('2026-03-31'), status:'completed' },
    { studentId:s6._id, company:'HCL',     role:'UI Developer Intern',        startDate:new Date('2026-02-01'), endDate:new Date('2026-04-30'), status:'ongoing'   },
    { studentId:s7._id, company:'BSNL',    role:'Telecom Engineer Intern',    startDate:new Date('2025-11-01'), endDate:new Date('2026-01-31'), status:'completed' },
    { studentId:s8._id, company:'Qualcomm',role:'VLSI Design Intern',         startDate:new Date('2026-05-15'), endDate:new Date('2026-08-15'), status:'upcoming'  },
  ];
  await Internship.insertMany(internships);
  console.log(`✅ ${internships.length} internship records seeded`);

  // ── 7. Summary ──────────────────────────────────────────────────────────────
  console.log('\n🎉 ─────────────── SEED COMPLETE (v4) ───────────────');
  console.log('');
  console.log('   STUDENT LOGIN (OTP — check server console in DEV):');
  console.log('     CSE:  21CSR001 / 21CSR002 / 21CSR003');
  console.log('     IT:   21ITR001 / 21ITR002 / 21ITR003');
  console.log('     ECE:  21ECR001 / 21ECR002 / 21ECR003');
  console.log('');
  console.log('   STAFF LOGIN (OTP):');
  console.log('     CSE HoD:   FAC001 → ramesh@vsb.edu');
  console.log('     CSE Staff: FAC002 → meena@vsb.edu');
  console.log('     IT HoD:    FAC003 → sundar@vsb.edu');
  console.log('     IT Staff:  FAC004 → anitha@vsb.edu');
  console.log('     ECE HoD:   FAC005 → karthik@vsb.edu');
  console.log('');
  console.log('   ADMIN LOGIN (email + password):');
  console.log('     admin@vsb.edu / Admin@1234');
  console.log('────────────────────────────────────────────────────────');

  await mongoose.disconnect();
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
