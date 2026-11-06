(function (root) {
  function parseCsv(text) {
    const result = [];
    let row = [], cell = '', quoted = false, closed = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') { quoted = false; closed = true; }
        else cell += c;
      } else if (c === '"') {
        if (cell || closed) throw Error('Unexpected quote in CSV.');
        quoted = true;
      } else if (c === ',') {
        row.push(cell); cell = ''; closed = false;
      } else if (c === '\n' || c === '\r') {
        row.push(cell); result.push(row); row = []; cell = ''; closed = false;
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else {
        if (closed) throw Error('Unexpected text after a quoted field.');
        cell += c;
      }
    }
    if (quoted) throw Error('Unclosed quoted field.');
    if (cell || row.length || closed) { row.push(cell); result.push(row); }
    return result;
  }

  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function stringifyCsv(records) {
    return records.map(record => record.map(csvCell).join(',')).join('\r\n');
  }

  function buildReviewCsv(template, rows) {
    if (template && template.records.length !== rows.length) throw Error('CSV review rows no longer match the imported questionnaire.');
    let records;
    if (template) {
      const width = template.records.reduce((max, record) => Math.max(max, record.length), template.header.length);
      const header = [...template.header, ...Array(Math.max(0, width - template.header.length)).fill('')];
      records = [[...header, 'Reviewed answer', 'Answer source'], ...template.records.map((record, i) => [...record, ...Array(width - record.length).fill(''), rows[i].answer, rows[i].source])];
    } else records = [['Question', 'Reviewed answer', 'Answer source'], ...rows.map(row => [row.question, row.answer, row.source])];
    return '\ufeff' + stringifyCsv(records);
  }

  function makeBackup(library, rows, csvTemplate) {
    return { version: 3, library, rows, ...(csvTemplate ? { csvTemplate } : {}) };
  }

  function isBackup(data) {
    const strings = (item, keys) => item && typeof item === 'object' && keys.every(k => typeof item[k] === 'string');
    if (!data || ![2, 3].includes(data.version) || !Array.isArray(data.library) || !Array.isArray(data.rows)) return false;
    if (!data.library.every(x => strings(x, ['topic', 'answer', 'source']))) return false;
    if (!data.rows.every(x => strings(x, ['question', 'answer', 'source']) && ['suggestion', 'suggestionSource'].every(k => x[k] === undefined || typeof x[k] === 'string'))) return false;
    if (data.version === 3 && data.csvTemplate !== undefined) {
      const template = data.csvTemplate;
      if (!template || !Array.isArray(template.header) || !template.header.every(x => typeof x === 'string') ||
          !Array.isArray(template.records) || !template.records.every(row => Array.isArray(row) && row.every(x => typeof x === 'string')) ||
          !Number.isInteger(template.questionColumn) || template.questionColumn < 0 || template.questionColumn >= template.header.length ||
          template.records.length !== data.rows.length) return false;
    }
    return true;
  }

  const api = { parseCsv, stringifyCsv, buildReviewCsv, makeBackup, isBackup };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.QuestionnaireCsv = api;
})(typeof window !== 'undefined' ? window : globalThis);
