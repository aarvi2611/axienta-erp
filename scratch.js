const fs = require('fs');

const file = 'frontend/src/app/calling/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /const handleFileUpload = async \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(fileInputRef\.current\) fileInputRef\.current\.value = "";\s*\n\s*\}\s*\};/;

const replacement = \const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
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
            const leadObj: any = {};
            headers.forEach((h, index) => {
              if (h) leadObj[h] = rowData[index];
            });
            allLeads.push(leadObj);
          }
        } else {
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          allLeads = allLeads.concat(jsonData);
        }
      });

      if (allLeads.length > 0) {
        let count = 0;
        let skipped = 0;
        
        const existingPhones = new Set(callingLeads.map(l => String(l.phone || "").trim().replace(/\\D/g, '')).filter(Boolean));
        const existingNames = new Set(callingLeads.map(l => String(l.name || "").trim().toLowerCase()).filter(Boolean));

        const validLeads = [];
        
        allLeads.forEach((row) => {
          const rawName = row["Business Name"] || row["Business Name *"] || row["Business Name *\\n(Enter to Generate ID)"] || row.Name || row.name || row["Lead Name"] || row.Client || "";
          const rawPhone = row["Direct Contact No."] || row["Intl Contact / WhatsApp"] || row.Phone || row.phone || row.Number || row.Mobile || row["Phone Number"] || "";
          const rawEmail = row.Email || row.email || "";
          const rawCompany = row.Company || row.company || row["Industry Category"] || row["Industry Sector"] || "";
          const rawCity = row["Market Hub / City"] || row["City / Metro Hub"] || "";
          
          const name = String(rawName).trim();
          const phoneStr = String(rawPhone).trim();
          const cleanPhone = phoneStr.replace(/\\D/g, '');
          
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
               name,
               phone: phoneStr,
               email: String(rawEmail).trim(),
               company: String(rawCompany).trim() + (rawCity ? \ (\)\ : ""),
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
             const docRef = doc(collection(db, "calling_leads"));
             batch.set(docRef, lead);
             count++;
          });
          await batch.commit();
        }

        alert(\Successfully imported \ new leads! (\ duplicates skipped)\);
      } else {
         alert("No data found in Excel file.");
      }
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing Excel file.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };\;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content, 'utf8');
