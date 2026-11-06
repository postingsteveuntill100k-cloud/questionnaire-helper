const assert = require('node:assert/strict');
const csv = require('../csv.js');

const source = '\ufeffID,Question,Notes,Extra\r\n' +
  '1,"How do you\r\nencrypt?","says ""AES""",kept\r\n' +
  '2,,=SUM(A1:A2)\r\n' +
  '\r\n' +
  '4,Access,"comma, text",tail\r\n';
const parsed = csv.parseCsv(source.replace(/^\ufeff/, ''));
assert.equal(parsed.length, 5, 'keeps the physically blank record between data rows');
assert.deepEqual(parsed[1], ['1', 'How do you\r\nencrypt?', 'says "AES"', 'kept'], 'keeps multiline fields, escaped quotes, and all columns');
assert.equal(parsed[2][1], '', 'keeps a blank selected question');

const template = { header: parsed[0], questionColumn: 1, records: parsed.slice(1) };
const reviewed = template.records.map((record, i) => ({
  question: record[1] ?? '',
  answer: i === 0 ? 'Reviewed answer, with comma' : '',
  source: i === 0 ? 'Policy "A"' : ''
}));
const exported = csv.parseCsv(csv.buildReviewCsv(template, reviewed).replace(/^\ufeff/, ''));
assert.equal(exported.length, parsed.length, 'keeps every data record, including blank rows');
assert.deepEqual(exported[0], [...parsed[0], 'Reviewed answer', 'Answer source']);
assert.deepEqual(exported[1].slice(0, 4), parsed[1], 'preserves source columns and multiline field contents');
assert.deepEqual(exported[1].slice(4), ['Reviewed answer, with comma', 'Policy "A"']);
assert.deepEqual(exported[2].slice(0, 4), ['2', '', "'=SUM(A1:A2)", ''], 'retains blank question and protects formula cells');
assert.deepEqual(exported[3], ['', '', '', '', '', ''], 'keeps a blank source row in the same column layout');
assert.deepEqual(exported[4].slice(0, 4), parsed[4], 'preserves later records in order');
const manualExport = csv.parseCsv(csv.buildReviewCsv(null, [{ question: 'Manual question', answer: 'Reviewed', source: 'Evidence' }]).replace(/^\ufeff/, ''));
assert.deepEqual(manualExport, [['Question', 'Reviewed answer', 'Answer source'], ['Manual question', 'Reviewed', 'Evidence']], 'keeps manual-entry export behavior');

const library = [{ topic: 'Access', answer: 'Reviewed', source: 'Policy' }];
const backup = csv.makeBackup(library, reviewed, template);
assert.equal(backup.version, 3);
assert.equal(csv.isBackup(JSON.parse(JSON.stringify(backup))), true, 'accepts a serialized version 3 backup with CSV data');
assert.deepEqual(csv.makeBackup(backup.library, backup.rows, backup.csvTemplate).csvTemplate, template, 'backup restore keeps original CSV template');
assert.equal(csv.isBackup({ version: 2, library, rows: reviewed }), true, 'continues accepting existing version 2 backups');
assert.equal(csv.isBackup({ ...backup, csvTemplate: { ...template, records: [] } }), false, 'rejects a mismatched backup template');
console.log('CSV preservation, export, injection protection, and backup tests passed.');
