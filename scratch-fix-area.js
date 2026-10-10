const fs = require('fs');
const file = 'frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Area\n                            type="monotone"\n                            dataKey="revenue"',
  '{canViewRevenue && (\n                          <Area\n                            type="monotone"\n                            dataKey="revenue"'
);

fs.writeFileSync(file, content, 'utf8');
