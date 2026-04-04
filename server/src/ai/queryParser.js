/**
 * Rule-based Natural Language Query Parser
 * Detects intent from plain English queries about student data
 */

const INTENTS = {
  TOPPER:       'TOPPER',
  ARREARS:      'ARREARS',
  CGPA_FILTER:  'CGPA_FILTER',
  CGPA_RANKING: 'CGPA_RANKING',
  PASS_FAIL:    'PASS_FAIL',
  SEARCH:       'SEARCH',
  ATTENDANCE:   'ATTENDANCE',
  MY_INFO:      'MY_INFO',
  UNKNOWN:      'UNKNOWN',
};

/**
 * Extract semester number from text
 */
function extractSemester(text) {
  const m = text.match(/sem(?:ester)?\s*(\d)/i) || text.match(/(\d)(?:st|nd|rd|th)?\s+sem/i);
  return m ? parseInt(m[1]) : null;
}

/**
 * Extract year from text
 */
function extractYear(text) {
  const m = text.match(/(\d)(?:st|nd|rd|th)?\s+year/i) || text.match(/year\s*(\d)/i);
  return m ? parseInt(m[1]) : null;
}

/**
 * Extract department from text
 */
function extractDept(text) {
  const depts = ['cse','it','ece','eee','mech','civil','aids','aiml','csbs','cce','biomed','biotech','chemical','mba','mca','me'];
  const lower = text.toLowerCase();
  return depts.find(d => lower.includes(d)) || null;
}

/**
 * Extract CGPA threshold from text
 * e.g. "cgpa above 8" → 8, "cgpa less than 6" → { op: '<', val: 6 }
 */
function extractCgpaFilter(text) {
  const above = text.match(/(?:above|greater than|>|min|atleast)\s*(\d+(?:\.\d+)?)/i);
  const below = text.match(/(?:below|less than|<|max|under)\s*(\d+(?:\.\d+)?)/i);
  if (above) return { op: '>=', val: parseFloat(above[1]) };
  if (below) return { op: '<=', val: parseFloat(below[1]) };
  const plain = text.match(/cgpa\s+(\d+(?:\.\d+)?)/i);
  if (plain) return { op: '>=', val: parseFloat(plain[1]) };
  return null;
}

/**
 * Extract student name from text
 * e.g. "find student John" → "John"
 */
function extractName(text) {
  const m = text.match(/(?:find|search|show|who is|details of|profile of)\s+(?:student\s+)?(.+?)(?:\s+in|\s+from|\s+of|\s*$)/i);
  return m ? m[1].trim() : null;
}

/**
 * Main parser: returns { intent, params }
 */
function parseQuery(query) {
  if (!query || typeof query !== 'string') return { intent: INTENTS.UNKNOWN, params: {} };

  const text = query.trim();
  const lower = text.toLowerCase();

  // MY_INFO intent (Higher priority)
  if (/\bmy\b\s+(attendance|result|cgpa|internship|status|profile|mark|details|record)/i.test(lower)) {
    let subType = 'profile';
    if (lower.includes('attendance')) subType = 'attendance';
    if (lower.includes('result') || lower.includes('mark')) subType = 'results';
    if (lower.includes('cgpa')) subType = 'cgpa';
    if (lower.includes('internship')) subType = 'internship';
    
    return {
      intent: INTENTS.MY_INFO,
      params: { subType, semester: extractSemester(lower) }
    };
  }

  // TOPPER intent
  if (/topper|top student|highest mark|rank 1|first rank/i.test(lower)) {
    return {
      intent: INTENTS.TOPPER,
      params: {
        semester: extractSemester(lower),
        dept:     extractDept(lower),
      },
    };
  }

  // ARREARS intent
  if (/arrear|backlog|fail|detained|re-appear/i.test(lower)) {
    return {
      intent: INTENTS.ARREARS,
      params: {
        dept:     extractDept(lower),
        semester: extractSemester(lower),
      },
    };
  }

  // PASS/FAIL stats
  if (/pass.?fail|pass rate|fail rate|pass percentage|how many pass|stat/i.test(lower)) {
    return {
      intent: INTENTS.PASS_FAIL,
      params: {
        semester: extractSemester(lower),
        dept:     extractDept(lower),
      },
    };
  }

  // CGPA FILTER
  if (/cgpa/i.test(lower) && (extractCgpaFilter(lower) || /rank|list|show/i.test(lower))) {
    const filter = extractCgpaFilter(lower);
    if (filter) {
      return {
        intent: INTENTS.CGPA_FILTER,
        params: { ...filter, dept: extractDept(lower) },
      };
    }
    return {
      intent: INTENTS.CGPA_RANKING,
      params: { dept: extractDept(lower) },
    };
  }

  // CGPA RANKING
  if (/rank|ranking|cgpa list|top cgpa|best student/i.test(lower)) {
    return {
      intent: INTENTS.CGPA_RANKING,
      params: { dept: extractDept(lower), semester: extractSemester(lower) },
    };
  }

  // ATTENDANCE
  if (/attendance|present|absent|bunk/i.test(lower)) {
    return {
      intent: INTENTS.ATTENDANCE,
      params: { dept: extractDept(lower), name: extractName(lower) },
    };
  }

  // STUDENT SEARCH / LIST
  if (/find|search|show|who is|details|profile|list|get|students/i.test(lower)) {
    return {
      intent: INTENTS.SEARCH,
      params: { 
        name: extractName(lower), 
        dept: extractDept(lower),
        year: extractYear(lower)
      },
    };
  }

  return { intent: INTENTS.UNKNOWN, params: {} };
}

module.exports = { parseQuery, INTENTS };
