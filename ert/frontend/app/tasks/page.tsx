'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader, TaskList } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { createTask, useEmployees, useTasks } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';

export default function Tasks() {
  const { profile } = useAuth();
  const { data: employees, loading: empLoading } = useEmployees();
  const { data: tasks, loading: tasksLoading } = useTasks();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium' as const,
    attachments: []
  });

  const handleCreateTask = async () => {
    if (!form.title || !form.assignedTo || !form.deadline) {
      setMessage('Please fill all required fields');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const selectedEmployee = employees.find(e => e.uid === form.assignedTo);
      await createTask({
        ...form,
        assignedName: selectedEmployee?.name || 'Unknown'
      }, profile?.uid);

      setMessage('Task created successfully');
      setForm({
        title: '',
        description: '',
        assignedTo: '',
        deadline: '',
        priority: 'Medium',
        attachments: []
      });
    } catch (e: any) {
      setMessage(e.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const isManager = profile && ['CEO', 'Admin', 'Head Manager', 'Team Manager'].includes(profile.role);

  return (
    <AppShell>
      <PageHeader
        title="Task Management"
        subtitle="CEO/Head Manager assign daily work; employees only see assigned tasks."
        actions={isManager ? <Button onClick={() => setMessage('')}>Create Task</Button> : undefined}
      />

      {message && (
        <p className={`mb-4 rounded-xl p-3 text-sm font-semibold ${message.includes('successfully') ? 'bg-gold-50 text-navy-900' : 'bg-red-50 text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        {isManager && (
          <Card>
            <h3 className="font-bold">Assign Daily Work</h3>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                placeholder="Task description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Assign employee</option>
                {employees.map((e) => (
                  <option key={e.uid} value={e.uid}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </Select>
              {empLoading && <p className="text-xs text-slate-500">Loading employees...</p>}
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </Select>
              <Button className="w-full" disabled={saving} onClick={handleCreateTask}>
                {saving ? 'Creating...' : 'Assign Task'}
              </Button>
            </div>
          </Card>
        )}
        <div className="xl:col-span-2">
          {tasksLoading ? (
            <p className="text-sm text-slate-500">Loading tasks...</p>
          ) : (
            <TaskList items={tasks} />
          )}
        </div>
      </div>
    </AppShell>
  );
}
