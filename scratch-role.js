const fs = require('fs');
const file = 'frontend/src/types/index.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /sales_executive: \[\s*"dashboard", "leads", "crm", "tasks", "notifications", "profile"\s*\]/g,
  'sales_executive: [\n    "dashboard", "leads", "crm", "calling", "tasks", "notifications", "profile"\n  ]'
);

content = content.replace(
  /"Sales Executive": \[\s*"dashboard", "leads", "crm", "tasks", "notifications", "profile"\s*\]/g,
  '"Sales Executive": [\n    "dashboard", "leads", "crm", "calling", "tasks", "notifications", "profile"\n  ]'
);

fs.writeFileSync(file, content, 'utf8');
