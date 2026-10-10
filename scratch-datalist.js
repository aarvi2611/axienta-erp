const fs = require('fs');
const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Input\s+placeholder="Search or enter lead name"\s+value={leadName}\s+onChange={\(e\) => setLeadName\(e.target.value\)}\s+\/>/;
content = content.replace(regex, <Input
                  placeholder="Search or enter lead name"
                  value={leadName}
                  onChange={(e) => {
                    setLeadName(e.target.value);
                    const match = callingLeads.find(l => l.name === e.target.value);
                    if (match) setSelectedLeadId(match.id);
                  }}
                  list="leads-list"
                />
                <datalist id="leads-list">
                  {callingLeads.filter(l => l.name).map(l => (
                    <option key={l.id} value={l.name} />
                  ))}
                </datalist>);

fs.writeFileSync(file, content, 'utf8');
