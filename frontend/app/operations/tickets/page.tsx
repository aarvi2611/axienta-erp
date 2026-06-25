'use client';

import { FormEvent, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Inbox,
  ListChecks,
  Search,
  ShieldAlert,
  Ticket,
  Trash2,
  X
} from 'lucide-react';
import { OperationsShell } from '../../components/operations-shell';
import { GradientCard, StatCard } from '../../components/gradient-card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useAuth } from '@/contexts/providers';
import {
  deleteClientTicket,
  updateClientTicket,
  useAllOpenTickets,
  useClients,
  useClientTickets
} from '@/hooks/useFirestoreData';
import { type ClientTicket, type Role, type TicketPriority, type TicketStatus } from '@/types';

const ALLOWED_ROLES: Role[] = ['CEO', 'Head Manager', 'Operations Team'];

const TICKET_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Awaiting Client', 'Resolved', 'Closed'];
const TICKET_PRIORITIES: TicketPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const TICKET_CATEGORIES = ['Billing', 'Service', 'Review', 'Call', 'Other'] as const;

const STATUS_TONE: Record<TicketStatus, 'rose' | 'amber' | 'cyan' | 'emerald' | 'slate'> = {
  Open: 'rose',
  'In Progress': 'amber',
  'Awaiting Client': 'cyan',
  Resolved: 'emerald',
  Closed: 'slate'
};

const PRIORITY_TONE: Record<TicketPriority, 'cyan' | 'emerald' | 'amber' | 'rose'> = {
  Low: 'cyan',
  Medium: 'emerald',
  High: 'amber',
  Urgent: 'rose'
};

export default function TicketsPage() {
  const { profile } = useAuth();
  const { data: tickets, loading } = useClientTickets();
  const { data: clients } = useClients();
  const { data: openTickets } = useAllOpenTickets();
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');
  const [clientFilter, setClientFilter] = useState<'all' | string>('all');
  const [search, setSearch] = useState('');
  const [editingTicket, setEditingTicket] = useState<ClientTicket | null>(null);
  const [message, setMessage] = useState('');

  const clientMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of clients) m[c.clientId.toUpperCase()] = c.businessName;
    return m;
  }, [clients]);

  const stats = useMemo(() => {
    const counts: Record<TicketStatus, number> = {
      Open: 0,
      'In Progress': 0,
      'Awaiting Client': 0,
      Resolved: 0,
      Closed: 0
    };
    for (const t of tickets) counts[t.status] = (counts[t.status] || 0) + 1;
    return counts;
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (clientFilter !== 'all' && t.clientId.toUpperCase() !== clientFilter.toUpperCase()) return false;
      if (!q) return true;
      return [t.title, t.description, t.clientId, t.businessName, t.raisedBy]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q));
    });
  }, [tickets, search, statusFilter, priorityFilter, clientFilter]);

  const handleStatusChange = async (ticket: ClientTicket, status: TicketStatus) => {
    try {
      await updateClientTicket(ticket.id, { status });
      setMessage(`Ticket "${ticket.title}" marked ${status}.`);
    } catch (err) {
      setMessage(`Failed: ${(err as Error).message}`);
    }
  };

  const handleDelete = async (ticket: ClientTicket) => {
    if (!confirm(`Delete ticket "${ticket.title}"? This cannot be undone.`)) return;
    try {
      await deleteClientTicket(ticket.id);
      setMessage('Ticket deleted.');
    } catch (err) {
      setMessage(`Delete failed: ${(err as Error).message}`);
    }
  };

  return (
    <OperationsShell
      allowed={ALLOWED_ROLES}
      title="Client Tickets"
      subtitle="Manage issues raised from the client portal. Update status, reassign or close."
      badge="Support Queue"
    >
      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard tone="rose" label="Open" value={stats.Open} icon={<AlertCircle size={20} />} delay={0.05} />
        <StatCard tone="amber" label="In Progress" value={stats['In Progress']} icon={<Clock3 size={20} />} delay={0.1} />
        <StatCard tone="cyan" label="Awaiting Client" value={stats['Awaiting Client']} icon={<Eye size={20} />} delay={0.15} />
        <StatCard tone="emerald" label="Resolved" value={stats.Resolved} icon={<CheckCircle2 size={20} />} delay={0.2} />
        <StatCard tone="slate" label="Closed" value={stats.Closed} icon={<Inbox size={20} />} delay={0.25} />
      </div>

      {message && (
        <GradientCard tone="cyan" hoverable={false} className="mb-4 py-3 text-sm">
          <p className="font-semibold">{message}</p>
        </GradientCard>
      )}

      {/* Filters */}
      <GradientCard tone="violet" hoverable={false} delay={0.3} className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-violet-100" />
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-3 text-slate-300" size={18} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, client or description"
              className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-400"
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TicketStatus)}
            className="border-white/15 bg-white/5 text-white"
          >
            <option value="all" className="text-black">All status</option>
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s} className="text-black">{s}</option>
            ))}
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | TicketPriority)}
            className="border-white/15 bg-white/5 text-white"
          >
            <option value="all" className="text-black">All priority</option>
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p} className="text-black">{p}</option>
            ))}
          </Select>
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="border-white/15 bg-white/5 text-white"
          >
            <option value="all" className="text-black">All clients</option>
            {clients.map((c) => (
              <option key={c.clientId} value={c.clientId} className="text-black">
                {c.businessName} ({c.clientId})
              </option>
            ))}
          </Select>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {filtered.length} result{filtered.length === 1 ? '' : 's'}
          </span>
        </div>
      </GradientCard>

      {/* Ticket list */}
      <GradientCard tone="cyan" hoverable={false} delay={0.35}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">
            <ListChecks size={18} className="mr-2 inline" />
            Ticket Queue
          </h2>
          <span className="text-xs text-white/70">Real-time from Firestore</span>
        </div>

        {loading && <p className="text-sm text-white/70">Loading tickets…</p>}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <Ticket className="mx-auto mb-2 text-white/40" size={28} />
            <p className="text-sm text-white/70">No tickets match the current filters.</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black">{t.title}</h3>
                    <Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge>
                    <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                      {t.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/70">
                    {clientMap[t.clientId.toUpperCase()] || t.businessName || 'Unknown client'} • {t.clientId}
                    {t.businessProfile ? ` • ${t.businessProfile}` : ''}
                    {t.raisedBy ? ` • raised by ${t.raisedBy}` : ''}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">{t.description}</p>
                  <p className="mt-1 text-xs text-white/50">
                    {t.createdAt?.toDate ? t.createdAt.toDate().toLocaleString() : 'Just now'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditingTicket(t)}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 font-bold text-slate-950"
                  >
                    <Eye size={14} /> Open
                  </Button>
                  {t.status !== 'Resolved' && t.status !== 'Closed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(t, 'Resolved')}
                      className="border-emerald-300/40 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25"
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </Button>
                  )}
                  {profile?.role === 'CEO' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(t)}
                      className="text-rose-300 hover:bg-rose-500/15"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </GradientCard>

      {/* Edit modal */}
      <AnimatePresence>
        {editingTicket && (
          <TicketModal
            ticket={editingTicket}
            onClose={() => setEditingTicket(null)}
            onSaved={(msg) => {
              setMessage(msg);
              setEditingTicket(null);
            }}
            clients={clients}
          />
        )}
      </AnimatePresence>
    </OperationsShell>
  );
}

function Badge({
  tone,
  children
}: {
  tone: 'rose' | 'amber' | 'cyan' | 'emerald' | 'violet' | 'slate';
  children: React.ReactNode;
}) {
  const map: Record<string, string> = {
    rose: 'bg-rose-500/25 text-rose-50',
    amber: 'bg-amber-500/25 text-amber-50',
    cyan: 'bg-cyan-500/25 text-cyan-50',
    emerald: 'bg-emerald-500/25 text-emerald-50',
    violet: 'bg-violet-500/25 text-violet-50',
    slate: 'bg-slate-500/30 text-slate-50'
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${map[tone]}`}>{children}</span>;
}

function TicketModal({
  ticket,
  onClose,
  onSaved,
  clients
}: {
  ticket: ClientTicket;
  onClose: () => void;
  onSaved: (msg: string) => void;
  clients: { clientId: string; businessName: string }[];
}) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<TicketPriority>(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo || '');
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateClientTicket(ticket.id, { status, priority, assignedTo });
      onSaved(`Ticket "${ticket.title}" updated.`);
    } catch (err) {
      onSaved(`Failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 to-cyan-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[.24em] text-cyan-200">Ticket Details</p>
            <h2 className="mt-1 text-xl font-black">{ticket.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3 p-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-100">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-white">{ticket.description}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-bold uppercase tracking-widest text-white/70">Status</span>
              <Select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)} className="border-white/15 bg-white/5 text-white">
                {TICKET_STATUSES.map((s) => (
                  <option key={s} value={s} className="text-black">{s}</option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-xs">
              <span className="font-bold uppercase tracking-widest text-white/70">Priority</span>
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)} className="border-white/15 bg-white/5 text-white">
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p} className="text-black">{p}</option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1 text-xs sm:col-span-2">
              <span className="font-bold uppercase tracking-widest text-white/70">Assigned To</span>
              <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="border-white/15 bg-white/5 text-white">
                <option value="" className="text-black">Unassigned</option>
                {clients.map((c) => (
                  <option key={c.clientId} value={c.clientId} className="text-black">
                    {c.businessName} ({c.clientId})
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <Textarea
            value={ticket.description}
            readOnly
            className="border-white/10 bg-white/5 text-xs text-white/60"
            rows={2}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <span className="text-xs text-white/60">
              <ShieldAlert size={12} className="mr-1 inline" />
              Only CEO can permanently delete tickets.
            </span>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-emerald-500 to-cyan-500 font-black text-slate-950">
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}