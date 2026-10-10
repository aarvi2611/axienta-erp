
const fs = require("fs");
const file = "frontend/src/app/calling/page.tsx";
let content = fs.readFileSync(file, "utf8");

content = content.replace(
  "const [selectedLeadName, setSelectedLeadName] = useState(\"\");",
  "const [selectedLeadName, setSelectedLeadName] = useState(\"\");\\n  const [selectedLeadId, setSelectedLeadId] = useState(\"\");"
);

content = content.replace(
  "createdAt: new Date().toISOString(),",
  "createdAt: new Date().toISOString(),\\n               assignedTo: user?.uid,\\n               assignedToName: user?.displayName || \"Executive\",\\n               whatsappCount: 0,"
);

content = content.replace(
  "setCallingLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));",
  "let leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));\\n      if (user && ![\"admin\", \"ceo\", \"head_manager\"].includes(user.role)) {\\n        leads = leads.filter(l => l.assignedTo === user.uid);\\n      }\\n      setCallingLeads(leads);"
);

content = content.replace(
  "setShowLogModal(false);",
  "if (selectedLeadId) {\\n        await updateDoc(doc(db, \"leads\", selectedLeadId), {\\n          status: callStatus === \"interested\" ? \"interested\" : callStatus,\\n          remarks: notes\\n        });\\n      }\\n      setShowLogModal(false);"
);

content = content.replace(
  /const openWhatsApp = \(template: any\) => \{[\s\S]*?setShowWhatsApp\(false\);\s*\};/,
  "const openWhatsApp = async (template: any) => {\\n    let msg = template.message;\\n    if (selectedLeadName) {\\n      msg = msg.replace(/\\[Name\\]/g, selectedLeadName).replace(/{name}/g, selectedLeadName);\\n    }\\n    const cleanPhone = String(selectedLeadPhone).replace(/\\\\D/g, \\\"\\\");\\n    const url = \\\"https://wa.me/\\\" + cleanPhone + \\\"?text=\\\" + encodeURIComponent(msg);\\n    window.open(url, \\\"_blank\\\");\\n    setShowWhatsApp(false);\\n    \\n    if (selectedLeadId) {\\n       const lead = callingLeads.find(l => l.id === selectedLeadId);\\n       if (lead) {\\n          const newCount = (lead.whatsappCount || 0) + 1;\\n          await updateDoc(doc(db, \\\"leads\\\", selectedLeadId), { whatsappCount: newCount });\\n       }\\n    }\\n  };"
);

content = content.replace(
  /setLeadName\(row\.name \|\| ""\);\s*setShowLogModal\(true\);/g,
  "setLeadName(row.name || \"\");\\n            setSelectedLeadId(row.id);\\n            setShowLogModal(true);"
);

content = content.replace(
  /setSelectedLeadPhone\(row\.phone \|\| ""\);\s*setSelectedLeadName\(row\.name \|\| ""\);\s*setShowWhatsApp\(true\);/g,
  "setSelectedLeadPhone(row.phone || \"\");\\n            setSelectedLeadName(row.name || \"\");\\n            setSelectedLeadId(row.id);\\n            setShowWhatsApp(true);"
);

content = content.replace(
  "{ key: \"createdAt\", label: \"Imported On\"",
  "{ key: \"assignedToName\", label: \"Executive\", render: (row: any) => <span className=\"text-xs\">{row.assignedToName || \"-\"}</span> },\\n      { key: \"remarks\", label: \"Remarks\", render: (row: any) => <span className=\"text-xs truncate max-w-[120px] inline-block\" title={row.remarks}>{row.remarks || \"-\"}</span> },\\n      { key: \"createdAt\", label: \"Imported On\""
);

const dataTableRegex = /<DataTable columns=\{leadColumns\} data=\{callingLeads\.filter\(l => l\.leadType !== "international"\)\} searchable searchKeys=\{\["name", "phone", "email"\]\} \/>/g;
content = content.replace(
  dataTableRegex,
  "<DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType !== \"international\")} searchable searchKeys={[\"name\", \"phone\", \"email\"]} rowClassName={(row) => { if (row.status === \"interested\") return \"bg-amber-50 dark:bg-amber-900/20\"; if (row.whatsappCount >= 2) return \"bg-green-100 dark:bg-green-900/30\"; if (row.whatsappCount === 1) return \"bg-emerald-50 dark:bg-emerald-900/20\"; return \"\"; }} />"
);

const dataTableIntlRegex = /<DataTable columns=\{leadColumns\} data=\{callingLeads\.filter\(l => l\.leadType === "international"\)\} searchable searchKeys=\{\["name", "phone", "email"\]\} \/>/g;
content = content.replace(
  dataTableIntlRegex,
  "<DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType === \"international\")} searchable searchKeys={[\"name\", \"phone\", \"email\"]} rowClassName={(row) => { if (row.status === \"interested\") return \"bg-amber-50 dark:bg-amber-900/20\"; if (row.whatsappCount >= 2) return \"bg-green-100 dark:bg-green-900/30\"; if (row.whatsappCount === 1) return \"bg-emerald-50 dark:bg-emerald-900/20\"; return \"\"; }} />"
);

content = content.replace(
  "<option value=\"connected\">Connected</option>",
  "<option value=\"connected\">Connected</option>\\n                  <option value=\"interested\">Interested</option>"
);

fs.writeFileSync(file, content, "utf8");

