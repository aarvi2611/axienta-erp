const fs = require('fs');

const file = 'frontend/src/app/leads/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<Edit className="w-4 h-4" />\n            </button>',
  \<Edit className="w-4 h-4" />\n            </button>\n            <button \n              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"\n              onClick={async (e) => {\n                e.stopPropagation();\n                if (confirm("Are you sure you want to delete this lead?")) {\n                  try {\n                    await deleteDoc(doc(db, "leads", row.id));\n                  } catch (err) {\n                    console.error("Error deleting lead:", err);\n                    alert("Failed to delete lead.");\n                  }\n                }\n              }}\n            >\n              <Trash2 className="w-4 h-4" />\n            </button>\
);

fs.writeFileSync(file, content, 'utf8');
