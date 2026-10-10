const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Input\s+placeholder="Search or enter lead name"\s+value={leadName}\s+onChange={\(e\) => setLeadName\(e.target.value\)}\s+\/>/;
content = content.replace(regex, '<Input\n                  placeholder="Search or enter lead name"\n                  value={leadName}\n                  onChange={(e) => {\n                    setLeadName(e.target.value);\n                    const match = callingLeads.find(l => l.name === e.target.value);\n                    if (match) setSelectedLeadId(match.id);\n                  }}\n                  list="leads-list"\n                />\n                <datalist id="leads-list">\n                  {callingLeads.filter(l => l.name).map(l => (\n                    <option key={l.id} value={l.name} />\n                  ))}\n                </datalist>');

fs.writeFileSync(file, content, 'utf8');
