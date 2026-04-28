function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  if (!rows.length) return '';

  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    const line = headers.map((key) => escapeCsv(row[key])).join(',');
    lines.push(line);
  }

  return `${lines.join('\n')}\n`;
}

module.exports = { toCsv };
