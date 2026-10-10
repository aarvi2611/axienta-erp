const fs = require('fs');
const file = 'frontend/src/components/common/DataTable.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700\/30"\s*\)/,
  'onRowClick && "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30",\n                      rowClassName && rowClassName(row)\n                    )'
);

fs.writeFileSync(file, content, 'utf8');
