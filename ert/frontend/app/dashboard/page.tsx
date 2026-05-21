'use client';

import { AppShell } from '@/components/layout/app-shell';
import { AnalyticsCharts, KpiGrid, MiniBars, PageHeader, TaskList } from '@/components/dashboard/dashboard-components';
import { useLeads, useTasks, useEmployees, useAttendance } from '@/hooks/useFirestoreData';

export default function Dashboard() {
  const { data: leads } = useLeads();
  const { data: tasks } = useTasks();
  const { data: employees } = useEmployees();
  const { data: attendance } = useAttendance();

  // Calculate KPIs from real data
  const converted = leads.filter(l => ['Confirmed', 'Converted'].includes(l.stage)).length;
  const conversion = leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  const kpis = [
    { label: 'Employees', value: String(employees.length), trend: 'live' },
    { label: 'Leads', value: String(leads.length), trend: 'live' },
    { label: 'Conversion', value: `${conversion}%`, trend: 'live' },
    { label: 'Tasks', value: String(tasks.length), trend: 'live' }
  ];

  return (
    <AppShell>
      <PageHeader
        title="Executive Dashboard"
        subtitle="Realtime KPIs for employees, revenue, lead conversion, attendance, pending work and productivity."
      />
      <KpiGrid kpis={kpis} />
      <AnalyticsCharts leads={leads} />
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <MiniBars leads={leads} tasks={tasks} />
        <TaskList items={tasks} />
      </div>
    </AppShell>
  );
}
