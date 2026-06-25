'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Headphones,
  Inbox,
  ListChecks,
  PhoneCall,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { OperationsShell } from '../../components/operations-shell';
import { GradientCard, StatCard } from '../../components/gradient-card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useAuth } from '@/contexts/providers';
import {
  createClientDailyUpdate,
  useAllOpenTickets,
  useClients,
  useClientDailyUpdates,
  useDailyUpdateNotificationsToday
} from '@/hooks/useFirestoreData';
import { type ClientDailyUpdate, type ClientProfile, type Role } from '@/types';

const ALLOWED_ROLES: Role[] = ['CEO', 'Head Manager', 'Operations Team'];

const issueStatuses = ['None', 'Open', 'Investigating', 'Resolved'] as const;
const contactStatuses = ['Open', 'Needs Follow-up', 'Closed'] as const;

const today = new Date().toISOString().slice(0, 10);

interface DraftRow {
  clientId: string;
  businessProfile: string;
  reviewsReceived: number;
  reviewsDropped: number;
  callsReceived: number;
  paymentsMade: number;
  paymentsPending: number;
  issueStatus: (typeof issueStatuses)[number];
  contactStatus: (typeof contactStatuses)[number];
  issueSummary: string;
  note: string;
  dirty: boolean;
  saving: boolean;
  saved: boolean;
}

function makeDraftRow(client: ClientProfile): DraftRow {
  return {
    clientId: client.clientId,
    businessProfile: client.businessProfiles[0] || '',
    reviewsReceived: 0,
    reviewsDropped: 0,
    callsReceived: 0,
    paymentsMade: 0,
    paymentsPending: 0,
    issueStatus: 'None',
    contactStatus: 'Open',
    issueSummary: '',
    note: '',
    dirty: false,
    saving: false,
    saved: false
  };
}

export default function DailyUpdatesPage() {
  const { profile } = useAuth();
  const { data: clients, loading: clientsLoading } = useClients();
  const { data: todayNotifs } = useDailyUpdateNotificationsToday();
  const { data: openTickets } = useAllOpenTickets();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(today.slice(0, 7));
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');

  // Build draft rows per client (initialised once per client list change)
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});

  // Initialise draft rows when clients first load
  useMemo(() => {
    if (clientsLoading) return;
    setDrafts((current) => {
      const next = { ...current };
      for (const c of clients) {
        if (!next[c.clientId]) next[c.clientId] = makeDraftRow(c);
      }
      return next;
    });
  }, [clients, clientsLoading]);

  const updatedClientIds = useMemo(
    () => new Set(todayNotifs.map((n) => n.clientId.toUpperCase())),
    [todayNotifs]
  );

  const missedClients = useMemo(
    () => clients.filter((c) => !updatedClientIds.has(c.clientId.toUpperCase())),
    [clients, updatedClientIds]
  );

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [c.clientId, c.businessName, c.contactName, c.accountManager]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const updatedCount = clients.length - missedClients.length;
  const dirtyCount = Object.values(drafts).filter((d) => d.dirty).length;

  const updateDraft = (clientId: string, patch: Partial<DraftRow>) => {
    setDrafts((current) => ({
      ...current,
      [clientId]: { ...current[clientId], ...patch, dirty: true, saved: false }
    }));
  };

  const saveRow = async (clientId: string) => {
    const row = drafts[clientId];
    if (!row) return;
    setDrafts((current) => ({ ...current, [clientId]: { ...row, saving: true } }));
    try {
      await createClientDailyUpdate(
        {
          clientId,
          businessProfile: row.businessProfile,
          updateDate: today,
          reviewsReceived: row.reviewsReceived,
          reviewsDropped: row.reviewsDropped,
          callsReceived: row.callsReceived,
          paymentsMade: row.paymentsMade,
          paymentsPending: row.paymentsPending,
          issueStatus: row.issueStatus,
          contactStatus: row.contactStatus,
          issueSummary: row.issueSummary,
          note: row.note
        },
        profile?.uid
      );
      setDrafts((current) => ({
        ...current,
        [clientId]: { ...row, dirty: false, saving: false, saved: true }
      }));
    } catch (err) {
      console.error(err);
      setDrafts((current) => ({ ...current, [clientId]: { ...row, saving: false } }));
      setBulkMessage(`Save failed for ${clientId}: ${(err as Error).message}`);
    }
  };

  const saveAllDirty = async () => {
    setBulkSaving(true);
    setBulkMessage('');
    try {
      const dirtyIds = Object.values(drafts)
        .filter((d) => d.dirty && !d.saving)
        .map((d) => d.clientId);
      // Process in batches of 10 to respect Firestore write rate
      for (let i = 0; i < dirtyIds.length; i += 10) {
        const batch = dirtyIds.slice(i, i + 10);
        await Promise.all(batch.map((id) => saveRow(id)));
      }
      setBulkMessage(`${dirtyIds.length} daily update${dirtyIds.length === 1 ? '' : 's'} saved.`);
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <OperationsShell
      allowed={ALLOWED_ROLES}
      title="Daily Client Updates"
      subtitle="Bulk entry for today's reviews, drops, calls, payments and issues — one row per client."
      badge="Operations"
    >
      {/* Missed-update alert strip */}
      {missedClients.length > 0 && (
        <GradientCard tone="rose" delay={0} hoverable={false} className="mb-6 border-rose-300/40">
          <div className="flex flex-wrap items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/30">
              <AlertTriangle size={22} className="text-rose-100" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-[.24em] text-rose-100">
                Missed Updates — {today}
              </p>
              <p className="mt-1 text-sm text-rose-50/90">
                {missedClients.length} client{missedClients.length === 1 ? '' : 's'} have no entry for today.
                Use the table below to fill them in.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missedClients.slice(0, 12).map((c) => (
                  <span
                    key={c.clientId}
                    className="rounded-full bg-rose-500/25 px-3 py-1 text-xs font-bold text-rose-50"
                  >
                    {c.businessName} ({c.clientId})
                  </span>
                ))}
                {missedClients.length > 12 && (
                  <span className="rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-100">
                    +{missedClients.length - 12} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </GradientCard>
      )}

      {/* Stats row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          tone="cyan"
          label="Total Clients"
          value={clients.length}
          icon={<Building2 size={20} />}
          hint="Active in the system"
          delay={0.05}
        />
        <StatCard
          tone="emerald"
          label="Updated Today"
          value={updatedCount}
          icon={<CheckCircle2 size={20} />}
          hint={`${today}`}
          delay={0.1}
        />
        <StatCard
          tone="amber"
          label="Pending Today"
          value={missedClients.length}
          icon={<Clock3 size={20} />}
          hint="Need an entry"
          delay={0.15}
        />
        <StatCard
          tone="violet"
          label="Open Tickets"
          value={openTickets.length}
          icon={<Inbox size={20} />}
          hint="From client portal"
          delay={0.2}
        />
      </div>

      {/* Toolbar */}
      <GradientCard tone="slate" delay={0.25} hoverable={false} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 text-slate-300" size={18} />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client, ID or manager"
                className="border-white/15 bg-white/5 pl-10 text-white placeholder:text-slate-400"
              />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
              {filteredClients.length} client{filteredClients.length === 1 ? '' : 's'}
            </span>
            {dirtyCount > 0 && (
              <span className="rounded-full bg-amber-500/30 px-3 py-1 text-xs font-bold text-amber-50">
                {dirtyCount} unsaved
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setMonthFilter(today.slice(0, 7))}
              className="border-white/15 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCw size={16} /> This Month
            </Button>
            <Button
              onClick={saveAllDirty}
              disabled={bulkSaving || dirtyCount === 0}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-base font-black text-slate-950"
            >
              <Save size={16} /> {bulkSaving ? 'Saving…' : `Save All (${dirtyCount})`}
            </Button>
          </div>
        </div>
      </GradientCard>

      {bulkMessage && (
        <GradientCard tone={bulkMessage.toLowerCase().includes('failed') ? 'rose' : 'emerald'} hoverable={false} delay={0.3} className="mb-4 py-3 text-sm">
          <p className="font-semibold">{bulkMessage}</p>
        </GradientCard>
      )}

      {/* Bulk entry table */}
      <GradientCard tone="cyan" delay={0.35} hoverable={false} className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-black">Today's Entry — {today}</h2>
          <span className="text-xs text-white/70">
            <ListChecks size={14} className="mr-1 inline" /> Each row is isolated by client ID
          </span>
        </div>

        <div className="space-y-4">
          {clientsLoading && <p className="text-sm text-white/70">Loading clients…</p>}
          {!clientsLoading && filteredClients.length === 0 && (
            <p className="rounded-2xl bg-white/5 p-4 text-sm text-white/70">No clients match your search.</p>
          )}

          {filteredClients.map((client) => {
            const row = drafts[client.clientId] || makeDraftRow(client);
            const updated = updatedClientIds.has(client.clientId.toUpperCase());
            return (
              <div
                key={client.clientId}
                className={`rounded-2xl border p-4 transition ${
                  row.saved
                    ? 'border-emerald-300/50 bg-emerald-500/10'
                    : row.dirty
                      ? 'border-amber-300/50 bg-amber-500/10'
                      : updated
                        ? 'border-cyan-300/30 bg-white/5'
                        : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-black">{client.businessName}</h3>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-bold text-white">
                        {client.clientId}
                      </span>
                      {updated && (
                        <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-50">
                          Updated today
                        </span>
                      )}
                      {row.saved && (
                        <span className="rounded-full bg-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-50">
                          Just saved
                        </span>
                      )}
                      {row.dirty && !row.saved && (
                        <span className="rounded-full bg-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-50">
                          Unsaved
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-white/70">
                      {client.contactName || 'No contact'} • Managed by {client.accountManager || 'unassigned'}
                    </p>
                  </div>
                  <Button
                    onClick={() => saveRow(client.clientId)}
                    disabled={row.saving || !row.dirty}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 font-black text-slate-950"
                    size="sm"
                  >
                    <Save size={14} /> {row.saving ? 'Saving…' : 'Save Row'}
                  </Button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                  <Select
                    value={row.businessProfile}
                    onChange={(e) => updateDraft(client.clientId, { businessProfile: e.target.value })}
                    className="border-white/15 bg-white/5 text-white"
                  >
                    <option value="" className="text-black">Select profile</option>
                    {client.businessProfiles.map((p) => (
                      <option key={p} value={p} className="text-black">
                        {p}
                      </option>
                    ))}
                  </Select>
                  <NumberField
                    label="Reviews"
                    icon={<TrendingUp size={14} />}
                    value={row.reviewsReceived}
                    onChange={(v) => updateDraft(client.clientId, { reviewsReceived: v })}
                  />
                  <NumberField
                    label="Drops"
                    icon={<TrendingDown size={14} />}
                    value={row.reviewsDropped}
                    onChange={(v) => updateDraft(client.clientId, { reviewsDropped: v })}
                  />
                  <NumberField
                    label="Calls"
                    icon={<PhoneCall size={14} />}
                    value={row.callsReceived}
                    onChange={(v) => updateDraft(client.clientId, { callsReceived: v })}
                  />
                  <NumberField
                    label="Paid"
                    icon={<CircleDollarSign size={14} />}
                    value={row.paymentsMade}
                    onChange={(v) => updateDraft(client.clientId, { paymentsMade: v })}
                  />
                  <NumberField
                    label="Pending"
                    icon={<Clock3 size={14} />}
                    value={row.paymentsPending}
                    onChange={(v) => updateDraft(client.clientId, { paymentsPending: v })}
                  />
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Select
                    value={row.issueStatus}
                    onChange={(e) =>
                      updateDraft(client.clientId, {
                        issueStatus: e.target.value as DraftRow['issueStatus']
                      })
                    }
                    className="border-white/15 bg-white/5 text-white"
                  >
                    {issueStatuses.map((s) => (
                      <option key={s} value={s} className="text-black">
                        Issue: {s}
                      </option>
                    ))}
                  </Select>
                  <Select
                    value={row.contactStatus}
                    onChange={(e) =>
                      updateDraft(client.clientId, {
                        contactStatus: e.target.value as DraftRow['contactStatus']
                      })
                    }
                    className="border-white/15 bg-white/5 text-white"
                  >
                    {contactStatuses.map((s) => (
                      <option key={s} value={s} className="text-black">
                        Contact: {s}
                      </option>
                    ))}
                  </Select>
                  <Input
                    placeholder="Issue summary (optional)"
                    value={row.issueSummary}
                    onChange={(e) => updateDraft(client.clientId, { issueSummary: e.target.value })}
                    className="border-white/15 bg-white/5 text-white placeholder:text-slate-400"
                  />
                </div>
                <Textarea
                  className="mt-2 border-white/15 bg-white/5 text-white placeholder:text-slate-400"
                  placeholder="Internal note for this client (optional)"
                  value={row.note}
                  onChange={(e) => updateDraft(client.clientId, { note: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      </GradientCard>

      <ClientHistoryList clientIds={filteredClients.map((c) => c.clientId)} monthFilter={monthFilter} />
    </OperationsShell>
  );
}

function NumberField({
  label,
  icon,
  value,
  onChange
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 transition focus-within:border-cyan-300/60">
      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/60">
        {icon} {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent text-base font-black text-white outline-none"
      />
    </label>
  );
}

function ClientHistoryList({ clientIds, monthFilter }: { clientIds: string[]; monthFilter: string }) {
  // Show history for the first client as a representative view; users can switch via Clients page.
  const firstId = clientIds[0];
  const { data: history } = useClientDailyUpdates(firstId);

  const monthHistory = useMemo(
    () =>
      [...history]
        .filter((u) => u.updateDate.startsWith(monthFilter))
        .sort((a, b) => b.updateDate.localeCompare(a.updateDate)),
    [history, monthFilter]
  );

  if (!firstId) return null;

  return (
    <GradientCard tone="amber" delay={0.4} hoverable={false}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.24em] text-amber-100">Recent History</p>
          <h2 className="mt-1 text-lg font-black">Past updates — {firstId}</h2>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-amber-100" />
          <Input
            type="month"
            value={monthFilter}
            onChange={(e) => null}
            className="w-44 border-white/15 bg-white/5 text-white"
            readOnly
          />
        </div>
      </div>

      <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
        {monthHistory.length === 0 && <p className="text-sm text-white/70">No history for this client in {monthFilter}.</p>}
        {monthHistory.map((u) => (
          <HistoryRow key={u.id} entry={u} />
        ))}
      </div>
      <p className="mt-3 text-xs text-white/60">
        <ArrowRight size={12} className="mr-1 inline" /> Switch to other clients from the Clients page for full history.
      </p>
    </GradientCard>
  );
}

function HistoryRow({ entry }: { entry: ClientDailyUpdate }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
      <div className="min-w-0">
        <p className="font-black">{entry.businessProfile}</p>
        <p className="text-xs text-white/60">{entry.updateDate}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Pill color="cyan">Reviews {entry.reviewsReceived}</Pill>
        <Pill color="rose">Drops {entry.reviewsDropped}</Pill>
        <Pill color="emerald">
          <Headphones size={10} className="mr-0.5 inline" /> {entry.callsReceived}
        </Pill>
        <Pill color="violet">Paid {entry.paymentsMade}</Pill>
        <Pill color="amber">Pending {entry.paymentsPending}</Pill>
        <Pill color={entry.issueStatus === 'None' ? 'emerald' : 'rose'}>{entry.issueStatus}</Pill>
      </div>
    </div>
  );
}

function Pill({ color, children }: { color: 'cyan' | 'rose' | 'emerald' | 'amber' | 'violet'; children: React.ReactNode }) {
  const toneMap = {
    cyan: 'bg-cyan-500/20 text-cyan-50',
    rose: 'bg-rose-500/20 text-rose-50',
    emerald: 'bg-emerald-500/20 text-emerald-50',
    amber: 'bg-amber-500/20 text-amber-50',
    violet: 'bg-violet-500/20 text-violet-50'
  } as const;
  return <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${toneMap[color]}`}>{children}</span>;
}