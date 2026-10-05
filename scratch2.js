const fs = require('fs');
const file = 'frontend/src/app/leads/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Edit className="w-4 h-4" \/>\s*<\/button>/g;

content = content.replace(regex, '<Edit className="w-4 h-4" />\n            </button>\n            <button onClick={async (e) => { e.stopPropagation(); if (confirm("Are you sure you want to delete this lead?")) { await deleteDoc(doc(db, "leads", row.id)); } }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-4 h-4" /></button>');

fs.writeFileSync(file, content, 'utf8');
