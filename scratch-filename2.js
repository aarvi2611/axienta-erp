const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const file = e\.target\.files\?\.\[0\];\s*if \(\!file\) return;\s*setImporting\(true\);/,
  'const file = e.target.files?.[0];\n    if (!file) return;\n    const fileNameWithoutExt = file.name.replace(/\\\\.[^/.]+$/, "");\n\n    setImporting(true);'
);

fs.writeFileSync(file, content, 'utf8');
