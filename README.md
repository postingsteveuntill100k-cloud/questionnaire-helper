# Security Questionnaire Helper

Early, browser-local prototype for reviewing answers to security questionnaires. It has no hosted service, authentication, payment flow, team workspace, automated security verification or customer data synchronization.

Open `index.html` in a browser or serve this folder with a static HTTP server. Add verified question/answer/source entries, paste one question per line or import a question column from CSV, review suggested answers, and export a CSV. CSV imports retain the original header and every data row and column, including rows where the selected question is blank; exports append reviewed-answer and answer-source columns. Spreadsheet formula-like cells are prefixed with an apostrophe on export for CSV injection protection. Data is stored in that browser's local storage; clearing site data removes it. Word overlap is a rough suggestion, not proof that an answer is accurate or applicable.

Download a JSON backup to transfer the library and review to another browser. Backups include the retained CSV data so a restored review can still export the original questionnaire columns. Version 2 backups remain restorable. Restoring a backup replaces the destination workspace; keep the backup private because it contains all included answers and source references.

Before selling or publishing as a commercial product: test with real questionnaires and users; improve matching and spreadsheet imports; establish secure data handling, accessible UX, commercial terms, support, payment processing and a sustainable hosting plan. Do not promise compliance or advertise a subscription until those features exist.

CSV export preserves cell values and record order, not the original file's byte formatting, line endings, or quoting choices.
