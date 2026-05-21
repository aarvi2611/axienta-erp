'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AnalyticsCharts, KpiGrid, MiniBars, PageHeader } from '@/components/dashboard/dashboard-components';
import { Button } from '@/components/ui/button';
import { useLeads, useTasks, useEmployees } from '@/hooks/useFirestoreData';

export default function Reports() {
  const { data: leads } = useLeads();
  const { data: tasks } = useTasks();
  const { data: employees } = useEmployees();

  const converted = leads.filter(l => ['Confirmed', 'Converted'].includes(l.stage)).length;
  const conversion = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  const kpis = [
    { label: 'Employees', value: String(employees.length), trend: 'live' },
    { label: 'Leads', value: String(leads.length), trend: 'live' },
    { label: 'Conversion', value: `${conversion}%`, trend: 'live' },
    { label: 'Tasks', value: String(tasks.length), trend: 'live' }
  ];

  const handleExportCSV = () => {
    const csv = [
      'Type,Count,Status',
      `Employees,${employees.length},Active`,
      `Leads,${leads.length},All stages`,
      `Tasks,${tasks.length},All statuses`,
      `Conversion Rate,${conversion}%,Calculated`
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `axienta-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Daily, monthly, revenue, sales, employee productivity and lead conversion reports."
        actions={
          <>
            <Button variant="outline" onClick={handleExportCSV}>
              Export CSV
            </Button>
            <Button>Generate PDF</Button>
          </>
        }
      />
      <KpiGrid kpis={kpis} />
      <AnalyticsCharts leads={leads} />
      <div className="mt-6">
        <MiniBars leads={leads} tasks={tasks} />
      </div>
    </AppShell>
  );
}
