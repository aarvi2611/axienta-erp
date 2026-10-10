const fs = require('fs');
const file = 'frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add canViewRevenue variable
content = content.replace(
  'const isManager = user && ["admin", "ceo", "head_manager"].includes(user.role);',
  'const isManager = user && ["admin", "ceo", "head_manager"].includes(user.role);\n  const canViewRevenue = user && ["admin", "ceo", "head_manager", "sales_executive"].includes(user.role);'
);

// 2. Wrap StatsCard for Revenue
content = content.replace(
  '<StatsCard\n              title="Client Retainers (MTD)"',
  '{canViewRevenue && (\n            <StatsCard\n              title="Client Retainers (MTD)"'
);
content = content.replace(
  'color="purple"\n              delay={0.3}\n            />\n          </div>',
  'color="purple"\n              delay={0.3}\n            />\n          )}\n          </div>'
);

// 3. Wrap AreaChart for Revenue
content = content.replace(
  '<Area\n                              type="monotone"\n                              dataKey="revenue"',
  '{canViewRevenue && (\n                              <Area\n                              type="monotone"\n                              dataKey="revenue"'
);
content = content.replace(
  'name="Revenue (₹)"\n                            />\n                            <Area\n                              type="monotone"\n                              dataKey="leads"',
  'name="Revenue (₹)"\n                            />\n                            )}\n                            <Area\n                              type="monotone"\n                              dataKey="leads"'
);

fs.writeFileSync(file, content, 'utf8');
