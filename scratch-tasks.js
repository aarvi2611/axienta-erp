const fs = require('fs');
const file = 'frontend/src/app/tasks/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));',
  'let fetchedTasks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Task));\n            if (user && !["admin", "ceo", "head_manager"].includes(user.role)) {\n              fetchedTasks = fetchedTasks.filter(t => t.assignedTo === user.uid);\n            }\n            setTasks(fetchedTasks);'
);

fs.writeFileSync(file, content, 'utf8');
