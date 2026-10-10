const fs = require('fs');
const file = 'frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Area\n                              type="monotone"\n                              dataKey="revenue"',
  '{canViewRevenue && (\n                            <Area\n                              type="monotone"\n                              dataKey="revenue"'
);

content = content.replace(
  'name="Revenue (₹)"\n                            />\n                            <Area\n                              type="monotone"\n                              dataKey="leads"',
  'name="Revenue (₹)"\n                            />\n                            )}\n                            <Area\n                              type="monotone"\n                              dataKey="leads"'
);

fs.writeFileSync(file, content, 'utf8');
