/**
 * server/services/campusIQ.js  (v3 — PRD-compliant, role-aware)
 * ----------------------------------------------------------------
 * AI chatbot service with:
 *   - Role-scoped queries (student=own data, staff=dept, admin=all)
 *   - Update requests go through approval workflow (not direct DB write)
 *   - Rule-based intent detection + Groq LLM fallback
 */
const Groq            = require('groq-sdk');
const Student         = require('../models/Student');
const Attendance      = require('../models/Attendance');
const Result          = require('../models/Result');
const UpdateRequest   = require('../models/UpdateRequest');

const GROQ_KEY = process.env.GROQ_API_KEY;
if (!GROQ_KEY || GROQ_KEY.length < 20) {
  console.warn('[CampusIQ] ⚠️  GROQ_API_KEY missing. AI queries will use rule-based fallback.');
}
const groq = new Groq({ apiKey: GROQ_KEY || 'placeholder' });

// ── Allowed fields for student self-update ──────────────────────────────────
const STUDENT_UPDATABLE = ['phone', 'address', 'parentName', 'parentPhone', 'bloodGroup'];
const STUDENT_READONLY  = ['name', 'regNo', 'rollNo', 'email', 'department', 'cgpa', 'results', 'section', 'year'];

// ── Rule-based Command Patterns ─────────────────────────────────────────────
const UPDATE_PATTERN = /update\s+my\s+(\w[\w\s]*?)\s+to\s+(.+)/i;
const SHOW_PATTERN   = /(?:show|get|what(?:'s| is)|display)\s+(?:my\s+)?(.+)/i;
const TOPPER_PATTERN = /(?:who is|show|get|find)\s+(?:the\s+)?topper/i;
const ARREARS_PATTERN = /(?:students?\s+with|list|show|who\s+has)\s+arrears/i;
const CGPA_FILTER    = /students?\s+(?:with|having)\s+cgpa\s*(above|below|>|<|>=|<=)\s*([\d.]+)/i;

// ── Field name normalization ────────────────────────────────────────────────
function normalizeFieldName(raw) {
  const map = {
    'phone': 'phone', 'phone number': 'phone', 'mobile': 'phone', 'mobile number': 'phone',
    'address': 'address', 'home address': 'address',
    'parent name': 'parentName', 'father name': 'parentName', 'mother name': 'parentName',
    'parent phone': 'parentPhone', 'father phone': 'parentPhone', 'parent mobile': 'parentPhone',
    'blood group': 'bloodGroup', 'bloodgroup': 'bloodGroup',
    'name': 'name', 'email': 'email', 'department': 'department', 'dept': 'department',
    'cgpa': 'cgpa', 'gpa': 'cgpa', 'results': 'results', 'result': 'results',
    'roll no': 'regNo', 'rollno': 'regNo', 'reg no': 'regNo', 'register number': 'regNo',
  };
  return map[raw.toLowerCase().trim()] || raw.toLowerCase().trim();
}

// ── Handle Student Update Request (approval workflow) ────────────────────────
async function handleUpdateRequest(message, userCtx) {
  const match = message.match(UPDATE_PATTERN);
  if (!match) return null;

  const rawField = match[1].trim();
  const newValue = match[2].trim();
  const field = normalizeFieldName(rawField);

  // Check if field is readonly
  if (STUDENT_READONLY.includes(field)) {
    return {
      reply: `❌ You cannot update **${rawField}**. Only staff or admin can modify this field.`,
      intent: 'UPDATE_FIELD',
      data: null,
    };
  }

  // Check if field is allowed
  if (!STUDENT_UPDATABLE.includes(field)) {
    return {
      reply: `❌ The field "${rawField}" is not recognized or not updatable. You can update: **${STUDENT_UPDATABLE.join(', ')}**.`,
      intent: 'UPDATE_FIELD',
      data: null,
    };
  }

  // Get current value
  const student = await Student.findOne({ regNo: userCtx.rollNo }).lean();
  if (!student) {
    return { reply: '❌ Could not find your profile.', intent: 'UPDATE_FIELD', data: null };
  }

  const oldValue = student[field] || '';

  // If role is staff/admin, apply immediately
  if (['staff', 'hod', 'admin'].includes(userCtx.role)) {
    await Student.findOneAndUpdate({ regNo: userCtx.rollNo }, { [field]: newValue });
    return {
      reply: `✅ Done! **${field}** has been updated to **${newValue}** immediately (staff/admin privilege).`,
      intent: 'UPDATE_FIELD',
      action: 'refresh_profile',
      data: { field, oldValue, newValue },
    };
  }

  // Student: create update request (pending approval)
  await UpdateRequest.create({
    rollNo: userCtx.rollNo,
    department: userCtx.dept || student.department,
    field,
    oldValue: String(oldValue),
    newValue,
    status: 'pending',
  });

  return {
    reply: `📝 Your request to update **${field}** to "**${newValue}**" has been submitted and will be reviewed by staff. You'll see it applied once approved.`,
    intent: 'UPDATE_FIELD',
    data: { field, oldValue, newValue, status: 'pending' },
  };
}

// ── Handle Show/Query Commands (rule-based) ──────────────────────────────────
async function handleShowCommand(message, userCtx) {
  const msg = message.toLowerCase().trim();

  // "show my profile"
  if (msg.includes('profile') || msg.includes('my details') || msg.includes('my info')) {
    const student = await Student.findOne({ regNo: userCtx.rollNo }).select('-__v').lean();
    if (!student) return { reply: '❌ Profile not found.', intent: 'SHOW_PROFILE', data: null };
    return {
      reply: `📋 **Your Profile**\n\n**Name:** ${student.name}\n**Reg No:** ${student.regNo}\n**Department:** ${student.department}\n**Email:** ${student.email}\n**Phone:** ${student.phone || 'Not set'}\n**Section:** ${student.section || 'Not set'}\n**Year:** ${student.year || 'Not set'}\n**Batch:** ${student.batch || 'Not set'}\n**CGPA:** ${student.cgpa || 'Not available'}\n**Blood Group:** ${student.bloodGroup || 'Not set'}`,
      intent: 'SHOW_PROFILE',
      data: student,
    };
  }

  // "show my results" / "my cgpa"
  if (msg.includes('result') || msg.includes('cgpa') || msg.includes('grade') || msg.includes('marks')) {
    const student = await Student.findOne({ regNo: userCtx.rollNo });
    if (!student) return { reply: '❌ Student not found.', intent: 'SHOW_RESULTS', data: null };
    const results = await Result.find({ studentId: student._id }).sort({ semester: 1 }).lean();
    if (!results.length) return { reply: 'No results records found yet.', intent: 'SHOW_RESULTS', data: [] };

    // Group by semester
    const bySem = {};
    results.forEach(r => {
      if (!bySem[r.semester]) bySem[r.semester] = [];
      bySem[r.semester].push(r);
    });

    let reply = '📝 **Your Results**\n\n';
    for (const [sem, subjects] of Object.entries(bySem)) {
      reply += `**Semester ${sem}:**\n`;
      subjects.forEach(s => {
        reply += `  • ${s.subject}: ${s.marks} marks (Grade: ${s.grade})\n`;
      });
    }
    if (student.cgpa) reply += `\n**Overall CGPA:** ${student.cgpa}`;

    return { reply, intent: 'SHOW_RESULTS', data: results };
  }

  // "show my attendance"
  if (msg.includes('attendance')) {
    const student = await Student.findOne({ regNo: userCtx.rollNo });
    if (!student) return { reply: '❌ Student not found.', intent: 'SHOW_ATTENDANCE', data: null };
    const records = await Attendance.find({ studentId: student._id }).lean();
    if (!records.length) return { reply: 'No attendance records found yet.', intent: 'SHOW_ATTENDANCE', data: [] };

    let reply = '📊 **Your Attendance**\n\n';
    records.forEach(a => {
      const emoji = a.percentage >= 75 ? '🟢' : a.percentage >= 60 ? '🟡' : '🔴';
      reply += `${emoji} **${a.subject}** (${a.month}): ${a.percentage}%\n`;
    });

    const avg = Math.round(records.reduce((s, a) => s + a.percentage, 0) / records.length);
    reply += `\n**Average Attendance:** ${avg}%`;

    return { reply, intent: 'SHOW_ATTENDANCE', data: records };
  }

  return null;
}

// ── Staff/Admin Queries ──────────────────────────────────────────────────────
async function handleStaffQuery(message, userCtx) {
  const msg = message.toLowerCase().trim();

  // Topper query
  if (TOPPER_PATTERN.test(msg)) {
    const filter = userCtx.role === 'admin' ? {} : { department: userCtx.dept };
    const topper = await Student.findOne(filter).sort({ cgpa: -1 }).lean();
    if (!topper) return { reply: 'No students found.', intent: 'TOPPER', data: null };
    return {
      reply: `🏆 **Topper:** ${topper.name} (${topper.regNo})\n**CGPA:** ${topper.cgpa || 'N/A'}\n**Department:** ${topper.department}`,
      intent: 'TOPPER',
      data: topper,
    };
  }

  // CGPA filter
  const cgpaMatch = msg.match(CGPA_FILTER);
  if (cgpaMatch) {
    const op = cgpaMatch[1];
    const val = parseFloat(cgpaMatch[2]);
    const filter = userCtx.role === 'admin' ? {} : { department: userCtx.dept };
    if (op === 'above' || op === '>') filter.cgpa = { $gt: val };
    else if (op === '>=') filter.cgpa = { $gte: val };
    else if (op === 'below' || op === '<') filter.cgpa = { $lt: val };
    else if (op === '<=') filter.cgpa = { $lte: val };

    const students = await Student.find(filter).sort({ cgpa: -1 }).limit(20).lean();
    let reply = `📊 **Students with CGPA ${op} ${val}:** (${students.length} found)\n\n`;
    students.forEach(s => {
      reply += `• ${s.name} (${s.regNo}) — CGPA: ${s.cgpa || 'N/A'}\n`;
    });
    return { reply, intent: 'CGPA_FILTER', data: students };
  }

  // Arrears — single aggregation instead of N+1 loop
  if (ARREARS_PATTERN.test(msg)) {
    const matchFilter = userCtx.role === 'admin' ? {} : { department: userCtx.dept };

    // Aggregate: find students with at least one 'U' grade result
    const withArrears = await Student.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from:         'results',
          localField:   '_id',
          foreignField: 'studentId',
          as:           'results',
        },
      },
      {
        $addFields: {
          arrearCount: {
            $size: { $filter: { input: '$results', as: 'r', cond: { $eq: ['$$r.grade', 'U'] } } },
          },
        },
      },
      { $match: { arrearCount: { $gt: 0 } } },
      { $project: { name: 1, regNo: 1, department: 1, arrearCount: 1 } },
    ]);

    let reply = `⚠️ **Students with Arrears:** (${withArrears.length} found)\n\n`;
    withArrears.forEach(s => {
      reply += `• ${s.name} (${s.regNo}) — ${s.arrearCount} arrear(s)\n`;
    });
    return { reply, intent: 'ARREARS', data: withArrears };
  }

  return null;
}

// ── Build Student Context (for Groq LLM) ─────────────────────────────────────
async function buildContext(regNo) {
  const student = await Student.findOne({ regNo }).lean();
  if (!student) throw new Error(`No student found with register number: ${regNo}`);

  const [attendance, results] = await Promise.all([
    Attendance.find({ studentId: student._id }).lean(),
    Result.find({ studentId: student._id }).lean(),
  ]);

  const attBlock = attendance.length === 0
    ? 'No attendance records.'
    : attendance.map(a => `${a.subject} (${a.month}): ${a.percentage}%`).join('\n');

  const resBySem = results.reduce((acc, r) => {
    if (!acc[r.semester]) acc[r.semester] = [];
    acc[r.semester].push(`${r.subject}: ${r.marks} marks, Grade ${r.grade}`);
    return acc;
  }, {});
  const resBlock = Object.keys(resBySem).length === 0
    ? 'No result records.'
    : Object.entries(resBySem).map(([sem, subs]) => `Semester ${sem}:\n  ${subs.join('\n  ')}`).join('\n');

  return `
STUDENT PROFILE
===============
Name       : ${student.name}
Reg No     : ${student.regNo}
Department : ${student.department}
Email      : ${student.email}
Phone      : ${student.phone || 'Not set'}
Section    : ${student.section || 'Not set'}
Year       : ${student.year || 'Not set'}
CGPA       : ${student.cgpa || 'Not available'}

ATTENDANCE
==========
${attBlock}

RESULTS
=======
${resBlock}
  `.trim();
}

// ── Main handler: queryGroq (now role-aware) ──────────────────────────────────
/**
 * @param {string} userMessage
 * @param {object} userCtx — { role, dept, rollNo }
 */
async function queryGroq(userMessage, userCtx) {
  try {
    // Normalize userCtx
    if (typeof userCtx === 'string') {
      // Legacy call: queryGroq(message, regNo)
      userCtx = { role: 'student', dept: null, rollNo: userCtx };
    }
    const rollNo = userCtx.rollNo || userCtx.regNo;

    // 1) Check for update commands (student only via approval, staff/admin immediate)
    if (rollNo) {
      const updateResult = await handleUpdateRequest(userMessage, { ...userCtx, rollNo });
      if (updateResult) return updateResult;
    }

    // 2) Rule-based show/query commands
    if (rollNo) {
      const showResult = await handleShowCommand(userMessage, { ...userCtx, rollNo });
      if (showResult) return showResult;
    }

    // 3) Staff/admin queries
    if (['staff', 'hod', 'admin'].includes(userCtx.role)) {
      const staffResult = await handleStaffQuery(userMessage, userCtx);
      if (staffResult) return staffResult;
    }

    // 4) Groq LLM fallback
    if (!GROQ_KEY || GROQ_KEY.length < 20) {
      return {
        reply: "🤖 I understand your question but I'm running in basic mode. Try commands like:\n• \"show my results\"\n• \"show my attendance\"\n• \"update my phone to 9876543210\"\n• \"who is the topper\"",
        intent: 'UNKNOWN',
      };
    }

    const contextString = rollNo ? await buildContext(rollNo) : 'No student context (admin/staff query).';
    const systemPrompt = `
You are Campus IQ, a friendly AI academic assistant for StudentVault at V.S.B. Engineering College.
You have access to real academic data. Answer based on this data only. Be concise and helpful.
Never make up data not present in the context. The user's role is: ${userCtx.role}.

For profile updates, students should type: "update my [field] to [value]"
Allowed fields: phone, address, parentName, parentPhone, bloodGroup.
Updates require staff approval before being applied.

--- STUDENT DATA CONTEXT ---
${contextString}
--- END OF CONTEXT ---
    `.trim();

    const completion = await groq.chat.completions.create({
      model:       'llama-3.1-8b-instant',
      messages:    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
      temperature: 0.6,
      max_tokens:  512,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from Groq');
    return { reply, intent: 'LLM_RESPONSE' };

  } catch (err) {
    console.error(`[CampusIQ] Error:`, err.message);
    if (err.status === 429) return { reply: '⏳ Rate limit reached. Please wait a moment and try again.', intent: 'ERROR' };
    return { reply: `⚠️ Campus IQ encountered an error: ${err.message}`, intent: 'ERROR' };
  }
}

module.exports = { queryGroq };
