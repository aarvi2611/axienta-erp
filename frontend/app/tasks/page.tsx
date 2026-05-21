'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Eye, RotateCcw, Send, X } from 'lucide-react';
import { serverTimestamp } from 'firebase/firestore';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Select } from '@/components/ui/input';
import { createTask, updateTask, useEmployees, useTasks } from '@/hooks/useFirestoreData';
import { useAuth } from '@/contexts/providers';
import { Task, TaskStatus } from '@/types';
import { cn } from '@/lib/utils';

const taskStatuses: TaskStatus[] = [
  'Pending',
  'Accepted',
  'In Progress',
  'Submitted for Review',
  'Revision Requested',
  'Approved',
  'Closed',
  'Completed',
  'Rejected'
];

const priorityStyles: Record<Task['priority'], string> = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-blue-50 text-blue-700',
  High: 'bg-gold-100 text-gold-700',
  Urgent: 'bg-red-50 text-red-700'
};

const statusStyles: Record<TaskStatus, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  Accepted: 'bg-indigo-50 text-indigo-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  'Submitted for Review': 'bg-amber-50 text-amber-700',
  'Revision Requested': 'bg-orange-50 text-orange-700',
  Approved: 'bg-emerald-50 text-emerald-700',
  Closed: 'bg-navy-800 text-white',
  Completed: 'bg-emerald-50 text-emerald-700',
  Rejected: 'bg-red-50 text-red-700'
};

function formatDate(value?: string) {
  if (!value) return 'No deadline';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function statusCount(tasks: Task[], status: TaskStatus) {
  return tasks.filter((task) => task.status === status).length;
}

export default function Tasks() {
  const { profile } = useAuth();
  const { data: employees, loading: empLoading } = useEmployees();
  const { data: tasks, loading: tasksLoading } = useTasks();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeStatus, setActiveStatus] = useState<TaskStatus | 'All'>('All');
  const [search, setSearch] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [managerFeedback, setManagerFeedback] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium' as Task['priority'],
    attachments: [] as string[]
  });

  const isManager = profile && ['CEO', 'Admin', 'Head Manager', 'Team Manager'].includes(profile.role);
  const canReview = profile && ['CEO', 'Admin', 'Head Manager'].includes(profile.role);
  const canClose = profile && ['CEO', 'Admin'].includes(profile.role);

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesStatus = activeStatus === 'All' || task.status === activeStatus;
      const matchesSearch =
        !needle ||
        [task.title, task.description, task.assignedName, task.priority, task.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));

      return matchesStatus && matchesSearch;
    });
  }, [activeStatus, search, tasks]);

  const reviewTasks = useMemo(
    () => tasks.filter((task) => task.status === 'Submitted for Review'),
    [tasks]
  );

  const handleCreateTask = async () => {
    if (!form.title || !form.assignedTo || !form.deadline) {
      setMessage('Please fill all required fields');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const selectedEmployee = employees.find((employee) => employee.uid === form.assignedTo);
      await createTask(
        {
          ...form,
          assignedName: selectedEmployee?.name || 'Unknown'
        },
        profile?.uid
      );

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

  const updateSelectedTask = async (task: Task, updates: Partial<Task>, successMessage: string) => {
    setSaving(true);
    setMessage('');
    try {
      await updateTask(task.id, updates);
      setSelectedTask({ ...task, ...updates });
      setMessage(successMessage);
      setCompletionNote('');
      setManagerFeedback('');
    } catch (e: any) {
      setMessage(e.message || 'Task update failed');
    } finally {
      setSaving(false);
    }
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setCompletionNote(task.completionNote || '');
    setManagerFeedback(task.managerFeedback || '');
  };

  const isAssignedToMe = selectedTask?.assignedTo === profile?.uid;

  return (
    <AppShell>
      <PageHeader
        title="Task Management"
        subtitle="Assign work, track employee progress, review submissions and close approved tasks."
      />

      {message && (
        <p
          className={cn(
            'mb-4 rounded-xl p-3 text-sm font-semibold',
            message.includes('successfully') || message.includes('updated') || message.includes('sent') || message.includes('closed') || message.includes('approved')
              ? 'bg-gold-50 text-navy-900'
              : 'bg-red-50 text-red-600'
          )}
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {isManager && (
          <Card className="h-fit lg:sticky lg:top-20">
            <h3 className="font-bold text-navy-900">Assign Daily Work</h3>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Task title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Textarea
                rows={5}
                placeholder="Task description, full address, links and expected output"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <Select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Assign employee</option>
                {employees.map((employee) => (
                  <option key={employee.uid} value={employee.uid}>
                    {employee.name} ({employee.role})
                  </option>
                ))}
              </Select>
              {empLoading && <p className="text-xs text-slate-500">Loading employees...</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                />
                <Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Task['priority'] })}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </Select>
              </div>
              <Button className="w-full" disabled={saving} onClick={handleCreateTask}>
                {saving ? 'Creating...' : 'Assign Task'}
              </Button>
            </div>
          </Card>
        )}

        <section className={cn('min-w-0', !isManager && 'lg:col-span-2')}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Assigned</p>
              <b className="mt-2 block text-2xl text-navy-900">{tasks.length}</b>
            </Card>
            <Card className="rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">In Progress</p>
              <b className="mt-2 block text-2xl text-blue-700">{statusCount(tasks, 'In Progress')}</b>
            </Card>
            <Card className="rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Head Manager Review</p>
              <b className="mt-2 block text-2xl text-amber-700">{reviewTasks.length}</b>
            </Card>
            <Card className="rounded-xl p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Closed</p>
              <b className="mt-2 block text-2xl text-emerald-700">{statusCount(tasks, 'Closed')}</b>
            </Card>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200 md:flex-row">
            <Input
              placeholder="Search task, employee, priority or status"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="md:max-w-sm"
            />
            <Select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value as TaskStatus | 'All')}
              className="md:max-w-xs"
            >
              <option>All</option>
              {taskStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
          </div>

          {canReview && reviewTasks.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold text-amber-900">Head Manager Review Queue</h3>
                  <p className="text-sm text-amber-800">Submitted work waiting for approval or feedback.</p>
                </div>
                <Button variant="outline" onClick={() => setActiveStatus('Submitted for Review')}>
                  View Queue
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {tasksLoading && <p className="text-sm text-slate-500">Loading tasks...</p>}
            {!tasksLoading && filteredTasks.length === 0 && (
              <Card className="rounded-xl p-6 text-sm text-slate-500">
                No tasks found for this view.
              </Card>
            )}
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-gold-300"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="max-w-full break-words text-base font-bold text-navy-900 md:text-lg">
                        {task.title}
                      </h3>
                      <span className={cn('rounded-full px-2 py-1 text-xs font-bold', statusStyles[task.status] || statusStyles.Pending)}>
                        {task.status || 'Pending'}
                      </span>
                      <span className={cn('rounded-full px-2 py-1 text-xs font-bold', priorityStyles[task.priority] || priorityStyles.Medium)}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-slate-600">
                      {task.description || 'No description added.'}
                    </p>
                    <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-3">
                      <span>Employee: <b className="text-slate-700">{task.assignedName || task.assignedTo || 'Unassigned'}</b></span>
                      <span>Deadline: <b className="text-slate-700">{formatDate(task.deadline)}</b></span>
                      <span>Updated: <b className="text-slate-700">Live Firestore</b></span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full shrink-0 md:w-auto" onClick={() => openTask(task)}>
                    <Eye size={16} />
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/70 p-3 backdrop-blur sm:p-6">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white p-4 sm:p-6">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gold-600">Task Details</p>
                <h2 className="mt-1 break-words text-xl font-black text-navy-900 sm:text-2xl">{selectedTask.title}</h2>
              </div>
              <Button variant="ghost" className="px-3" onClick={() => setSelectedTask(null)} title="Close details">
                <X size={18} />
              </Button>
            </div>

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Full Work Details</h3>
                  <p className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {selectedTask.description || 'No description added.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Assigned To</p>
                    <b className="mt-1 block break-words text-navy-900">{selectedTask.assignedName || selectedTask.assignedTo}</b>
                  </div>
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-widest text-slate-500">Deadline</p>
                    <b className="mt-1 block text-navy-900">{formatDate(selectedTask.deadline)}</b>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700">Employee Completion Note</h3>
                  <Textarea
                    rows={5}
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                    placeholder="Add completed work details, links, proof, remarks or blockers"
                    disabled={!isAssignedToMe || ['Submitted for Review', 'Approved', 'Closed'].includes(selectedTask.status)}
                    className="mt-2"
                  />
                </div>

                {canReview && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-700">Manager Feedback</h3>
                    <Textarea
                      rows={4}
                      value={managerFeedback}
                      onChange={(e) => setManagerFeedback(e.target.value)}
                      placeholder="Approval note or changes required"
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Current Stage</p>
                  <span className={cn('mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold', statusStyles[selectedTask.status] || statusStyles.Pending)}>
                    {selectedTask.status}
                  </span>
                  {isManager && (
                    <Select
                      className="mt-4"
                      value={selectedTask.status}
                      onChange={(e) =>
                        updateSelectedTask(
                          selectedTask,
                          { status: e.target.value as TaskStatus, stageNote: `Stage changed by ${profile?.name || 'manager'}` },
                          'Task stage updated'
                        )
                      }
                    >
                      {taskStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </Select>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-widest text-slate-500">Priority</p>
                  <span className={cn('mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold', priorityStyles[selectedTask.priority] || priorityStyles.Medium)}>
                    {selectedTask.priority}
                  </span>
                </div>

                {isAssignedToMe && !['Submitted for Review', 'Approved', 'Closed'].includes(selectedTask.status) && (
                  <div className="space-y-2">
                    {['Pending', 'Revision Requested'].includes(selectedTask.status) && (
                      <Button
                        className="w-full"
                        disabled={saving}
                        onClick={() =>
                          updateSelectedTask(
                            selectedTask,
                            { status: 'Accepted', acceptedAt: serverTimestamp() as any },
                            'Task accepted successfully'
                          )
                        }
                      >
                        <CheckCircle2 size={16} />
                        Accept Work
                      </Button>
                    )}
                    {selectedTask.status === 'Accepted' && (
                      <Button
                        className="w-full"
                        disabled={saving}
                        onClick={() =>
                          updateSelectedTask(
                            selectedTask,
                            { status: 'In Progress', startedAt: serverTimestamp() as any },
                            'Task moved to In Progress'
                          )
                        }
                      >
                        Start Work
                      </Button>
                    )}
                    {['Accepted', 'In Progress', 'Revision Requested'].includes(selectedTask.status) && (
                      <Button
                        className="w-full"
                        disabled={saving || !completionNote.trim()}
                        onClick={() =>
                          updateSelectedTask(
                            selectedTask,
                            {
                              status: 'Submitted for Review',
                              completionNote: completionNote.trim(),
                              submittedAt: serverTimestamp() as any
                            },
                            'Task sent to Head Manager review'
                          )
                        }
                      >
                        <Send size={16} />
                        Send to Head Manager
                      </Button>
                    )}
                  </div>
                )}

                {canReview && selectedTask.status === 'Submitted for Review' && (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      disabled={saving}
                      onClick={() =>
                        updateSelectedTask(
                          selectedTask,
                          {
                            status: 'Approved',
                            managerFeedback: managerFeedback.trim(),
                            reviewedBy: profile?.uid,
                            approvedAt: serverTimestamp() as any
                          },
                          'Task approved successfully'
                        )
                      }
                    >
                      <CheckCircle2 size={16} />
                      Approve Work
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={saving}
                      onClick={() =>
                        updateSelectedTask(
                          selectedTask,
                          {
                            status: 'Revision Requested',
                            managerFeedback: managerFeedback.trim() || 'Please revise and send again.',
                            reviewedBy: profile?.uid
                          },
                          'Task sent back for changes'
                        )
                      }
                    >
                      <RotateCcw size={16} />
                      Send Back
                    </Button>
                  </div>
                )}

                {canClose && selectedTask.status === 'Approved' && (
                  <Button
                    className="w-full"
                    disabled={saving}
                    onClick={() =>
                      updateSelectedTask(
                        selectedTask,
                        {
                          status: 'Closed',
                          closedBy: profile?.uid,
                          closedAt: serverTimestamp() as any
                        },
                        'Task closed successfully'
                      )
                    }
                  >
                    Close Task
                  </Button>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
