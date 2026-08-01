/**
 * VSB Engineering College — Rich Student Data Seed
 * 20 CSE students with complete academic records
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { getDeptModels } = require('./models/deptModels');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// ── 20 CSE Students ──────────────────────────────────────────────
const sampleStudents = [
  { rollNo: '23CS001', name: 'Adhinarayanan S',    year: 2, section: 'A', email: 'adhinarayanan.s@vsb.edu.in',   phone: '9876500001', batch: '2023-27', cgpa: 9.2, attendance: 95, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'O+', course: 'B.E CSE',
    internships: [{ company: 'Microsoft Research', role: 'AI Engineering Intern', duration: '3 Months (Jan–Mar 2024)', summary: 'Developed neural retrieval systems for academic search engines.', verified: true },
                  { company: 'Google Cloud',        role: 'Cloud Intern',         duration: '2 Months (May–Jul 2024)', summary: 'Optimized server-side sync for large datasets.', verified: true }] },

  { rollNo: '23CS002', name: 'Priya Mehta',         year: 2, section: 'A', email: 'priya.mehta@vsb.edu.in',       phone: '9876500002', batch: '2023-27', cgpa: 8.8, attendance: 92, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'A+', course: 'B.E CSE',
    internships: [{ company: 'Infosys',              role: 'SDE Intern',           duration: '2 Months',              summary: 'Java Spring Boot microservices.',                               verified: true }] },

  { rollNo: '23CS003', name: 'Rahul Nair',           year: 2, section: 'B', email: 'rahul.nair@vsb.edu.in',         phone: '9876500003', batch: '2023-27', cgpa: 7.2, attendance: 78, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'B+', course: 'B.E CSE', internships: [] },

  { rollNo: '23CS004', name: 'Sneha Iyer',           year: 2, section: 'B', email: 'sneha.iyer@vsb.edu.in',         phone: '9876500004', batch: '2023-27', cgpa: 5.5, attendance: 65, arrearCount: 2, hostel: 'Hostel',     bloodGroup: 'AB+', course: 'B.E CSE', internships: [] },

  { rollNo: '23CS005', name: 'Vikram Patel',         year: 2, section: 'A', email: 'vikram.patel@vsb.edu.in',       phone: '9876500005', batch: '2023-27', cgpa: 4.8, attendance: 60, arrearCount: 3, hostel: 'Day Scholar', bloodGroup: 'O-', course: 'B.E CSE', internships: [] },

  { rollNo: '22CS001', name: 'Kavya Reddy',          year: 3, section: 'A', email: 'kavya.reddy@vsb.edu.in',        phone: '9876500006', batch: '2022-26', cgpa: 9.5, attendance: 98, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'A-', course: 'B.E CSE',
    internships: [{ company: 'TCS',                  role: 'Data Analyst Intern',  duration: '3 Months',              summary: 'Built dashboards using Power BI.',                              verified: true }] },

  { rollNo: '22CS002', name: 'Aditya Kumar',         year: 3, section: 'B', email: 'aditya.kumar@vsb.edu.in',       phone: '9876500007', batch: '2022-26', cgpa: 8.1, attendance: 85, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'B-', course: 'B.E CSE', internships: [] },

  { rollNo: '22CS003', name: 'Deepika Singh',        year: 3, section: 'A', email: 'deepika.singh@vsb.edu.in',      phone: '9876500008', batch: '2022-26', cgpa: 7.6, attendance: 80, arrearCount: 1, hostel: 'Hostel',     bloodGroup: 'O+', course: 'B.E CSE', internships: [] },

  { rollNo: '22CS004', name: 'Rohan Verma',          year: 3, section: 'A', email: 'rohan.verma@vsb.edu.in',        phone: '9876500009', batch: '2022-26', cgpa: 8.9, attendance: 90, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'A+', course: 'B.E CSE',
    internships: [{ company: 'Amazon',               role: 'SDE Intern',           duration: '6 Months',              summary: 'Built distributed caching layer.',                              verified: true }] },

  { rollNo: '22CS005', name: 'Meera Krishnan',       year: 3, section: 'B', email: 'meera.krishnan@vsb.edu.in',     phone: '9876500010', batch: '2022-26', cgpa: 9.0, attendance: 93, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'B+', course: 'B.E CSE',
    internships: [{ company: 'Wipro',                role: 'ML Intern',            duration: '3 Months',              summary: 'Implemented NLP pipeline.',                                    verified: true }] },

  { rollNo: '21CS001', name: 'Suresh Babu',          year: 4, section: 'A', email: 'suresh.babu@vsb.edu.in',        phone: '9876500011', batch: '2021-25', cgpa: 7.8, attendance: 88, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'AB-', course: 'B.E CSE', internships: [] },

  { rollNo: '21CS002', name: 'Anjali Nair',          year: 4, section: 'B', email: 'anjali.nair@vsb.edu.in',        phone: '9876500012', batch: '2021-25', cgpa: 8.3, attendance: 91, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'O+', course: 'B.E CSE',
    internships: [{ company: 'HCL',                  role: 'DevOps Intern',        duration: '2 Months',              summary: 'CI/CD pipeline automation.',                                   verified: true }] },

  { rollNo: '21CS003', name: 'Karthik Raj',          year: 4, section: 'A', email: 'karthik.raj@vsb.edu.in',        phone: '9876500013', batch: '2021-25', cgpa: 6.9, attendance: 72, arrearCount: 1, hostel: 'Day Scholar', bloodGroup: 'A+', course: 'B.E CSE', internships: [] },

  { rollNo: '21CS004', name: 'Lakshmi Devi',         year: 4, section: 'B', email: 'lakshmi.devi@vsb.edu.in',       phone: '9876500014', batch: '2021-25', cgpa: 8.5, attendance: 89, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'B+', course: 'B.E CSE',
    internships: [{ company: 'Zoho',                 role: 'Frontend Intern',      duration: '3 Months',              summary: 'React dashboard for Zoho CRM.',                                verified: true }] },

  { rollNo: '24CS001', name: 'Naveen Sundar',        year: 1, section: 'A', email: 'naveen.sundar@vsb.edu.in',      phone: '9876500015', batch: '2024-28', cgpa: 7.4, attendance: 76, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'O-', course: 'B.E CSE', internships: [] },

  { rollNo: '24CS002', name: 'Pooja Sharma',         year: 1, section: 'A', email: 'pooja.sharma@vsb.edu.in',       phone: '9876500016', batch: '2024-28', cgpa: 8.6, attendance: 94, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'A+', course: 'B.E CSE', internships: [] },

  { rollNo: '24CS003', name: 'Dinesh Murugan',       year: 1, section: 'B', email: 'dinesh.murugan@vsb.edu.in',     phone: '9876500017', batch: '2024-28', cgpa: 6.5, attendance: 69, arrearCount: 0, hostel: 'Day Scholar', bloodGroup: 'O+', course: 'B.E CSE', internships: [] },

  { rollNo: '23CS006', name: 'Sowmiya R',            year: 2, section: 'B', email: 'sowmiya.r@vsb.edu.in',          phone: '9876500018', batch: '2023-27', cgpa: 9.1, attendance: 97, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'B+', course: 'B.E CSE',
    internships: [{ company: 'Cognizant',            role: 'QA Intern',            duration: '2 Months',              summary: 'Automated testing with Selenium.',                              verified: true }] },

  { rollNo: '23CS007', name: 'Harish Babu T',        year: 2, section: 'A', email: 'harish.babu@vsb.edu.in',        phone: '9876500019', batch: '2023-27', cgpa: 5.2, attendance: 58, arrearCount: 3, hostel: 'Day Scholar', bloodGroup: 'AB+', course: 'B.E CSE', internships: [] },

  { rollNo: '22CS006', name: 'Nithya Priya S',       year: 3, section: 'A', email: 'nithya.priya@vsb.edu.in',       phone: '9876500020', batch: '2022-26', cgpa: 8.4, attendance: 87, arrearCount: 0, hostel: 'Hostel',     bloodGroup: 'O+', course: 'B.E CSE',
    internships: [{ company: 'Tech Mahindra',        role: 'Backend Intern',       duration: '3 Months',              summary: 'Node.js REST API development.',                                 verified: true }] },
];

// ── Results ──────────────────────────────────────────────────────
const sampleResults = [
  // Semester 1 — 1st years
  { rollNo: '24CS001', name: 'Naveen Sundar',  semester: 1, subject: 'Engineering Mathematics I', subCode: 'MA1101', grade: 'B+', gp: 7,  cgpa: 7.4, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '24CS002', name: 'Pooja Sharma',   semester: 1, subject: 'Engineering Mathematics I', subCode: 'MA1101', grade: 'A+', gp: 9,  cgpa: 8.6, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '24CS003', name: 'Dinesh Murugan', semester: 1, subject: 'Engineering Mathematics I', subCode: 'MA1101', grade: 'B',  gp: 6,  cgpa: 6.5, arrears: 0, result: 'Pass', status: 'Pass' },
  // Semester 3 — 2nd years
  { rollNo: '23CS001', name: 'Adhinarayanan S', semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'O',  gp: 10, cgpa: 9.2, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '23CS001', name: 'Adhinarayanan S', semester: 3, subject: 'Digital Electronics',      subCode: 'EC2101', grade: 'O',  gp: 10, cgpa: 9.2, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '23CS002', name: 'Priya Mehta',     semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'A+', gp: 9,  cgpa: 8.8, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '23CS003', name: 'Rahul Nair',      semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'B+', gp: 7,  cgpa: 7.2, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '23CS004', name: 'Sneha Iyer',      semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'RA', gp: 0,  cgpa: 5.5, arrears: 2, result: 'Fail', status: 'Fail' },
  { rollNo: '23CS005', name: 'Vikram Patel',    semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'RA', gp: 0,  cgpa: 4.8, arrears: 3, result: 'Fail', status: 'Fail' },
  { rollNo: '23CS006', name: 'Sowmiya R',       semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'O',  gp: 10, cgpa: 9.1, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '23CS007', name: 'Harish Babu T',   semester: 3, subject: 'Data Structures',          subCode: 'CS2101', grade: 'RA', gp: 0,  cgpa: 5.2, arrears: 3, result: 'Fail', status: 'Fail' },
  // Semester 5 — 3rd years
  { rollNo: '22CS001', name: 'Kavya Reddy',     semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'O',  gp: 10, cgpa: 9.5, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '22CS001', name: 'Kavya Reddy',     semester: 5, subject: 'Computer Networks',        subCode: 'CS3102', grade: 'O',  gp: 10, cgpa: 9.5, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '22CS002', name: 'Aditya Kumar',    semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'A',  gp: 8,  cgpa: 8.1, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '22CS003', name: 'Deepika Singh',   semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'RA', gp: 0,  cgpa: 7.6, arrears: 1, result: 'Fail', status: 'Fail' },
  { rollNo: '22CS004', name: 'Rohan Verma',     semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'A+', gp: 9,  cgpa: 8.9, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '22CS005', name: 'Meera Krishnan',  semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'O',  gp: 10, cgpa: 9.0, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '22CS006', name: 'Nithya Priya S',  semester: 5, subject: 'Operating Systems',        subCode: 'CS3101', grade: 'A+', gp: 9,  cgpa: 8.4, arrears: 0, result: 'Pass', status: 'Pass' },
  // Semester 7 — 4th years
  { rollNo: '21CS001', name: 'Suresh Babu',     semester: 7, subject: 'Machine Learning',         subCode: 'CS4101', grade: 'B+', gp: 7,  cgpa: 7.8, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '21CS002', name: 'Anjali Nair',     semester: 7, subject: 'Machine Learning',         subCode: 'CS4101', grade: 'A',  gp: 8,  cgpa: 8.3, arrears: 0, result: 'Pass', status: 'Pass' },
  { rollNo: '21CS003', name: 'Karthik Raj',     semester: 7, subject: 'Machine Learning',         subCode: 'CS4101', grade: 'RA', gp: 0,  cgpa: 6.9, arrears: 1, result: 'Fail', status: 'Fail' },
  { rollNo: '21CS004', name: 'Lakshmi Devi',    semester: 7, subject: 'Machine Learning',         subCode: 'CS4101', grade: 'A+', gp: 9,  cgpa: 8.5, arrears: 0, result: 'Pass', status: 'Pass' },
];

// ── Attendance ────────────────────────────────────────────────────
const dates = ['2024-07-01','2024-07-02','2024-07-03','2024-07-04','2024-07-05'];
const attendanceMap = {
  '23CS001': ['P','P','P','P','P'], '23CS002': ['P','P','P','P','A'],
  '23CS003': ['P','A','P','P','A'], '23CS004': ['A','A','P','A','P'],
  '23CS005': ['A','A','A','P','A'], '22CS001': ['P','P','P','P','P'],
  '22CS002': ['P','P','A','P','P'], '22CS003': ['P','A','P','A','P'],
  '22CS004': ['P','P','P','P','A'], '22CS005': ['P','P','P','P','P'],
  '21CS001': ['P','P','A','P','P'], '21CS002': ['P','P','P','P','P'],
  '21CS003': ['A','P','A','P','P'], '21CS004': ['P','P','P','A','P'],
  '24CS001': ['P','A','P','P','P'], '24CS002': ['P','P','P','P','P'],
  '24CS003': ['A','P','A','P','A'], '23CS006': ['P','P','P','P','P'],
  '23CS007': ['A','A','P','A','A'], '22CS006': ['P','P','P','A','P'],
};

const sampleAttendance = [];
for (const [rollNo, statuses] of Object.entries(attendanceMap)) {
  const student = sampleStudents.find(s => s.rollNo === rollNo);
  if (!student) continue;
  dates.forEach((date, i) => {
    sampleAttendance.push({ rollNo, name: student.name, date, status: statuses[i] });
  });
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'college_db' });
    console.log('✅ Connected to MongoDB → college_db');

    const { Student, Result, Attendance } = getDeptModels('cse');

    await Student.deleteMany({});
    await Result.deleteMany({});
    await Attendance.deleteMany({});

    await Student.insertMany(sampleStudents);
    await Result.insertMany(sampleResults);
    await Attendance.insertMany(sampleAttendance);

    console.log(`✅ Seeded ${sampleStudents.length} students (CSE)`);
    console.log(`✅ Seeded ${sampleResults.length} result records`);
    console.log(`✅ Seeded ${sampleAttendance.length} attendance records`);
    console.log('\n🎉 Seed complete! Refresh your browser.');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();
