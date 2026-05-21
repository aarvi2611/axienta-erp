'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, LeadTable } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLead, useLeads } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';

export default function Scraper() {
  const { profile } = useAuth();
  const { data: leads } = useLeads();
  const [rows, setRows] = useState<any[]>([]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await f.arrayBuffer();
    const wb = XLSX.read(data);
    const json: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    setRows(json);
  };

  const importRows = async () => {
    for (const row of rows) {
      await createLead(
        {
          businessName: row.businessName || row['Business Name'] || row.Name || 'Untitled',
          phone: row.phone || row.Phone || '',
          email: row.email || row.Email || '',
          website: row.website || row.Website || '',
          address: row.address || row.Address || '',
          category: row.category || row.Category || '',
          rating: Number(row.rating || row.Rating || 0),
          stage: 'New Lead',
          tags: ['imported'],
          source: 'Excel/CSV'
        } as any,
        profile?.uid
      );
    }
    setRows([]);
  };

  return (
    <AppShell>
      <PageHeader title="Google Maps Scraper" subtitle="Imported rows are saved to Firebase leads collection." />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <h3 className="font-bold">Scrape / Import Leads</h3>
          <div className="mt-4 space-y-3">
            <Input placeholder="Keyword e.g. dentists in Delhi" />
            <Input placeholder="Location" />
            <Button className="w-full">Start Google Maps Scrape</Button>
            <Input type="file" accept=".csv,.xlsx,.xls" onChange={onFile} />
            <Button variant="outline" className="w-full">Validate & Detect Duplicates</Button>
            <Button className="w-full" disabled={!rows.length} onClick={importRows}>Save {rows.length} Rows to Firebase</Button>
            <p className="text-sm text-slate-500">Imported rows ready: {rows.length}</p>
          </div>
        </Card>

        <div className="xl:col-span-2">
          <LeadTable items={leads} />
        </div>
      </div>
    </AppShell>
  );
}
