const https = require('https');

https.get('https://firestore.googleapis.com/v1/projects/axientaerp/databases/(default)/documents/leads?pageSize=1000', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const leads = json.documents || [];
    let unknownLeads = [];
    leads.forEach(doc => {
      const name = doc.fields.name?.stringValue;
      if (name === "Unknown Lead" || name === "Unknown" || !name) {
        unknownLeads.push(doc.name);
      }
    });
    console.log('Found ' + unknownLeads.length + ' unknown leads.');
    
    // Delete them
    let deleted = 0;
    unknownLeads.forEach(docName => {
      const req = https.request('https://firestore.googleapis.com/v1/' + docName, { method: 'DELETE' }, (r) => {
        deleted++;
        if (deleted === unknownLeads.length) console.log('Deleted all ' + deleted + ' unknown leads!');
      });
      req.end();
    });
    if(unknownLeads.length === 0) console.log("No leads to delete.");
  });
});
