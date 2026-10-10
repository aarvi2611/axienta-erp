const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// replace raw \n with actual newlines
content = content.replace(/\\n/g, '\n');

fs.writeFileSync(file, content, 'utf8');
