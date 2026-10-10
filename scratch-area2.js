const fs = require('fs');
const file = 'frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Area[\s\S]*?dataKey="revenue"[\s\S]*?name="Revenue \(₹\)"\s*\/>/;
content = content.replace(regex, '{canViewRevenue && (\n                            $& \n                            )}');

fs.writeFileSync(file, content, 'utf8');
