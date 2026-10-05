const fs = require('fs');

const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update Tabs State
content = content.replace(
  'const [activeTab, setActiveTab] = useState<"leads" | "history">("leads");',
  'const [activeTab, setActiveTab] = useState<"domestic" | "international" | "history">("domestic");'
);

// 2. Update Tabs UI
const oldTabs = \      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 " + (activeTab === "leads" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("leads")}
        >
          Imported Leads (\)
        </button>
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 " + (activeTab === "history" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("history")}
        >
          Call History (\)
        </button>
      </div>

      {activeTab === "leads" && (
        <DataTable columns={leadColumns} data={callingLeads} searchable searchKeys={["name", "phone", "email"]} />
      )}\;

const newTabs = \      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "domestic" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("domestic")}
        >
          Domestic Leads (\)
        </button>
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "international" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("international")}
        >
          International Leads (\)
        </button>
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "history" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("history")}
        >
          Call History (\)
        </button>
      </div>

      {activeTab === "domestic" && (
        <DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType !== "international")} searchable searchKeys={["name", "phone", "email"]} />
      )}
      {activeTab === "international" && (
        <DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType === "international")} searchable searchKeys={["name", "phone", "email"]} />
      )}\;

content = content.replace(oldTabs, newTabs);

// 3. Update Excel Parse Logic
const oldUpload = /const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(fileInputRef\.current\) fileInputRef\.current\.value = "";\s*\n\s*\}\s*\};/;

const newUpload = \const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let allLeads: any[] = [];
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        let headerRowIndex = -1;
        let headers: string[] = [];

        // Find the actual header row
        for (let i = 0; i < Math.min(20, rows.length); i++) {
          const rowStr = rows[i].join(" ").toLowerCase();
          if (rowStr.includes("business name") || rowStr.includes("lead name") || rowStr.includes("contact no") || rowStr.includes("whatsapp")) {
            headerRowIndex = i;
            headers = rows[i].map(h => String(h || "").trim());
            break;
          }
        }

        if (headerRowIndex !== -1) {
          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowData = rows[i];
            const leadObj: any = { _sourceSheet: sheetName };
            headers.forEach((h, index) => {
              if (h) leadObj[h] = rowData[index];
            });
            allLeads.push(leadObj);
          }
        } else {
          // Fallback if no specific header matches
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          allLeads = allLeads.concat(jsonData.map(row => ({ ...row, _sourceSheet: sheetName })));
        }
      });

      if (allLeads.length > 0) {
        let count = 0;
        let skipped = 0;
        
        // Load existing phones and names for deduplication
        const existingPhones = new Set(callingLeads.map(l => String(l.phone || "").trim().replace(/\\D/g, '')).filter(Boolean));
        const existingNames = new Set(callingLeads.map(l => String(l.name || "").trim().toLowerCase()).filter(Boolean));

        const validLeads: any[] = [];
        
        allLeads.forEach((row) => {
          let rawName = "";
          let rawPhone = "";
          let rawEmail = "";
          let rawCompany = "";
          let rawCity = "";
          let rawCountry = "";

          Object.keys(row).forEach(key => {
             const lowerKey = key.toLowerCase();
             if (lowerKey.includes("business name") || lowerKey === "name" || lowerKey.includes("lead name") || lowerKey.includes("client")) {
                 rawName = row[key];
             } else if (lowerKey.includes("contact no") || lowerKey.includes("whatsapp") || lowerKey === "phone" || lowerKey.includes("mobile") || lowerKey.includes("number")) {
                 rawPhone = row[key];
             } else if (lowerKey === "email") {
                 rawEmail = row[key];
             } else if (lowerKey.includes("company") || lowerKey.includes("industry sector") || lowerKey.includes("industry category")) {
                 rawCompany = row[key];
             } else if (lowerKey.includes("city") || lowerKey.includes("hub")) {
                 rawCity = row[key];
             } else if (lowerKey.includes("country")) {
                 rawCountry = row[key];
             }
          });
          
          const name = String(rawName).trim();
          const phoneStr = String(rawPhone).trim();
          const cleanPhone = phoneStr.replace(/\\D/g, '');
          const isInternational = String(row._sourceSheet || "").toLowerCase().includes("international") || (rawCountry && !String(rawCountry).toLowerCase().includes("india"));
          
          if (name || phoneStr) {
             if (cleanPhone && existingPhones.has(cleanPhone)) {
               skipped++;
               return;
             }
             if (!cleanPhone && name && existingNames.has(name.toLowerCase())) {
               skipped++;
               return;
             }

             if (cleanPhone) existingPhones.add(cleanPhone);
             if (name) existingNames.add(name.toLowerCase());
             
             validLeads.push({
               name: name || "Unknown Lead",
               phone: phoneStr,
               email: String(rawEmail).trim(),
               company: String(rawCompany).trim() + (rawCity ? \ (\)\ : ""),
               country: String(rawCountry).trim() || (isInternational ? "International" : "India"),
               leadType: isInternational ? "international" : "domestic",
               status: "new",
               importedAt: new Date().toISOString(),
               createdAt: new Date().toISOString(),
             });
          }
        });

        // Chunk into 500 max per batch for Firestore
        const chunks = [];
        for (let i = 0; i < validLeads.length; i += 500) {
          chunks.push(validLeads.slice(i, i + 500));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach((lead) => {
             const docRef = doc(collection(db, "leads"));
             batch.set(docRef, lead);
             count++;
          });
          await batch.commit();
        }

        alert(\Successfully imported \ new leads! (\ duplicates skipped)\);
      } else {
         alert("No data found in Excel file.");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      alert("Error importing Excel file: " + (error.message || error.toString()));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };\;

content = content.replace(oldUpload, newUpload);

fs.writeFileSync(file, content, 'utf8');
