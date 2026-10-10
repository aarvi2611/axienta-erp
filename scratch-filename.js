const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add fileNameWithoutExt
content = content.replace(
  'const file = e.target.files?.[0];\\n    if (!file) return;\\n\\n    setImporting(true);',
  'const file = e.target.files?.[0];\\n    if (!file) return;\\n    const fileNameWithoutExt = file.name.replace(/\\\\.[^/.]+$/, "");\\n    setImporting(true);'
);

// 2. Change assignedToName
content = content.replace(
  'assignedToName: user?.displayName || "Executive",',
  'assignedToName: fileNameWithoutExt || user?.displayName || "Executive",'
);

// 3. Change filter logic
content = content.replace(
  'leads = leads.filter(l => l.assignedTo === user.uid);',
  'leads = leads.filter(l => l.assignedTo === user.uid || (l.assignedToName && user.displayName && l.assignedToName.toLowerCase().includes(user.displayName.toLowerCase())));'
);

fs.writeFileSync(file, content, 'utf8');
