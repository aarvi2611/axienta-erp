const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\\"/g, '"');
content = content.replace(/\\\\D/g, '\\D');

fs.writeFileSync(file, content, 'utf8');
