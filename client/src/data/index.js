export const STUDENTS = [
  { id: '922523205073', name: 'Kaviyarasan',    dept: 'IT',   year: 3, cgpa: 9.7, attendance: 98, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Ka&backgroundColor=4ff07f&textColor=003915' },
  { id: '721221104001', name: 'Abinesh K',      dept: 'CSE',  year: 2, cgpa: 9.2, attendance: 95, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=AK&backgroundColor=4f46e5&textColor=ffffff' },
  { id: '721221104005', name: 'Bhavani S',      dept: 'CSE',  year: 2, cgpa: 8.7, attendance: 88, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BS&backgroundColor=7c3aed&textColor=ffffff' },
  { id: '721221104012', name: 'Dinesh Kumar M', dept: 'CSE',  year: 3, cgpa: 6.8, attendance: 72, status: 'arrear', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DK&backgroundColor=dc2626&textColor=ffffff' },
  { id: '721221104024', name: 'Harish R',       dept: 'CSE',  year: 4, cgpa: 9.5, attendance: 97, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=HR&backgroundColor=059669&textColor=ffffff' },
  { id: '721221104045', name: 'Kaviyarasu',     dept: 'CSE',  year: 3, cgpa: 9.8, attendance: 99, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=K&backgroundColor=4ff07f&textColor=003915' },
  { id: '721221205001', name: 'Priya Nair',     dept: 'ECE',  year: 1, cgpa: 8.3, attendance: 82, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=PN&backgroundColor=0891b2&textColor=ffffff' },
  { id: '721221205008', name: 'Karthik V',      dept: 'ECE',  year: 2, cgpa: 7.4, attendance: 68, status: 'arrear', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=KV&backgroundColor=b45309&textColor=ffffff' },
  { id: '721221306002', name: 'Meena T',        dept: 'IT',   year: 3, cgpa: 9.0, attendance: 91, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=MT&backgroundColor=be185d&textColor=ffffff' },
  { id: '721221306015', name: 'Suresh G',       dept: 'IT',   year: 1, cgpa: 7.9, attendance: 79, status: 'clear',  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=SG&backgroundColor=7c3aed&textColor=ffffff' },
];

export const AI_RESPONSES = {
  attendance: '📊 Students with attendance below 75%:\n• Dinesh Kumar M (CSE) — 72% ⚠\n• Karthik V (ECE) — 68% ⚠\n\n2 students require immediate attention. Shall I send them a notification?',
  arrear:     '⚠ Arrear summary:\n• Dinesh Kumar M (CSE) — 1 Arrear, CGPA 6.8\n• Karthik V (ECE) — 1 Arrear, CGPA 7.4\n\nTotal: 2 students. Shall I generate a report for the HOD?',
  top:        '🏆 Top Performers by CGPA:\n1. Harish R (CSE, 4th Year) — 9.5\n2. Abinesh K (CSE, 2nd Year) — 9.2\n3. Meena T (IT, 3rd Year) — 9.0\n\nAll three maintain attendance above 90%!',
  it3:        '📋 3rd Year IT Students:\n• Meena T (721221306002) — CGPA 9.0, Attendance 91%\n\n1 student found in 3rd Year IT.',
  cgpa:       '📈 CGPA Analysis:\n• Above 9.0: 2 students\n• 8.0–8.9: 2 students\n• 7.0–7.9: 2 students\n• Below 7.0: 1 student\n\nOverall average CGPA: 8.35',
  report:     '📄 Dept Attendance Report:\n• CSE — Avg 88.0% (4 students)\n• ECE — Avg 75.0% (2 students)\n• IT  — Avg 85.0% (2 students)\n\nECE requires attention. Export as PDF or Excel?',
  default:    "I can help with:\n\n• 🎓 Student CGPA & attendance lookups\n• 📊 Department-wise performance\n• ⚠ Arrear & risk analysis\n• 📄 Report generation\n\nTry the suggestion chips!",
};

export function getAIResponse(msg) {
  const lower = msg.toLowerCase();

  // Custom check for specific student query
  const matchedStudent = STUDENTS.find(s => lower.includes(s.name.toLowerCase().split(' ')[0]) || lower.includes(s.id.toLowerCase()));
  if (matchedStudent) {
    return `Here are the academic records I retrieved for ${matchedStudent.name} (${matchedStudent.id}):\n\nDepartment: ${matchedStudent.dept}\nYear: ${matchedStudent.year}\nCGPA: ${matchedStudent.cgpa}\nAttendance: ${matchedStudent.attendance}%\nStatus: ${matchedStudent.status === 'clear' ? 'Clear ✓' : 'Arrear ⚠'}`;
  }

  // If a student search was attempted but no one was found
  if (lower.includes('details for') || lower.includes('find student') || lower.includes('show the details')) {
    return "I couldn't find any student matching that name or ID in the current database. Please check the spelling or registration number and try again.";
  }

  if (lower.includes('top') || lower.includes('performer') || lower.includes('best') || lower.includes('highest')) return AI_RESPONSES.top;
  if (lower.includes('low attendance') || lower.includes('below 75') || lower.includes('attendance below')) return AI_RESPONSES.attendance;
  if (lower.includes('arrear')) return AI_RESPONSES.arrear;
  if (lower.includes('3rd year it') || lower.includes('it department') || lower.includes('it students')) return AI_RESPONSES.it3;
  if (lower.includes('cgpa') || lower.includes('gpa') || lower.includes('grade')) return AI_RESPONSES.cgpa;
  if (lower.includes('report') || lower.includes('department') || lower.includes('dept')) return AI_RESPONSES.report;
  if (lower.includes('attendance')) return AI_RESPONSES.attendance;
  return AI_RESPONSES.default;
}

export function getAttendanceColor(att) {
  if (att >= 90) return '#4ff07f';
  if (att >= 75) return '#f9d03f';
  return '#ffb4ab';
}

export function getCgpaBadgeStyle(cgpa) {
  if (cgpa >= 9) return { background: 'rgba(79,240,127,0.15)', color: '#4ff07f', border: '1px solid rgba(79,240,127,0.3)' };
  if (cgpa >= 8) return { background: 'rgba(173,198,255,0.12)', color: '#adc6ff', border: '1px solid rgba(173,198,255,0.25)' };
  if (cgpa >= 7) return { background: 'rgba(249,208,63,0.12)', color: '#f9d03f', border: '1px solid rgba(249,208,63,0.25)' };
  return { background: 'rgba(255,180,171,0.12)', color: '#ffb4ab', border: '1px solid rgba(255,180,171,0.25)' };
}

export const NAV_ITEMS = [
  { key: 'students',   label: 'Students',   icon: 'group' },
  { key: 'chatbot',    label: 'AI Assistant', icon: 'smart_toy' },
  { key: 'attendance', label: 'Attendance', icon: 'calendar_today' },
  { key: 'results',    label: 'Results',    icon: 'grade' },
  { key: 'internship', label: 'Internship', icon: 'workspace_premium' },
  { key: 'reports',    label: 'Reports',    icon: 'description' },
  { key: 'upload',     label: 'Upload',     icon: 'cloud_upload' },
];

export const SUGGESTIONS = [
  { label: 'Top performers',  icon: 'emoji_events', query: 'Show top performers by CGPA' },
  { label: 'Low attendance',  icon: 'trending_down', query: 'Show students with low attendance below 75%' },
  { label: '3rd year IT',     icon: 'school', query: 'List all 3rd year IT department students' },
  { label: 'Arrear summary',  icon: 'warning', query: 'How many students have arrears?' },
  { label: 'Dept report',     icon: 'bar_chart', query: 'Generate department-wise attendance report' },
];

export const ATTENDANCE_CHART_DATA = {
  labels: ['CSE', 'ECE', 'IT', 'MECH', 'CIVIL'],
  data: [88, 75, 85, 91, 78],
};

export const CGPA_CHART_DATA = {
  labels: ['9.0+ (Excellent)', '8.0–8.9 (Good)', '7.0–7.9 (Average)', 'Below 7.0 (At Risk)'],
  data: [2, 2, 2, 1],
  colors: ['#4ff07f', '#adc6ff', '#f9d03f', '#ffb4ab'],
};
