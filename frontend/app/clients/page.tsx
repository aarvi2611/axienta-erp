'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Edit3,
  Image as ImageIcon,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useAuth } from '@/contexts/providers';
import {
  createClient,
  createClientDailyUpdate,
  deleteClient,
  removeClientAsset,
  updateClient,
  uploadClientAsset,
  useClientAsset,
  useClientDailyUpdates,
  useClients
} from '@/hooks/useFirestoreData';
import { ClientProfile } from '@/types';

const clientStatuses: ClientProfile['clientStatus'][] = ['Active', 'Paused', 'At Risk'];
const issueStatuses = ['None', 'Open', 'Investigating', 'Resolved'] as const;
const contactStatuses = ['Open', 'Needs Follow-up', 'Closed'] as const;

const today = new Date().toISOString().slice(0, 10);
const currency = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function parseProfiles(value: string) {
  return value
    .split('\n')
    .flatMap((line) => line.split(','))
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ClientsPage() {
  const { profile } = useAuth();
  const { data: clients, loading } = useClients();
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [monthFilter, setMonthFilter] = useState(today.slice(0, 7));
  const [clientForm, setClientForm] = useState({
    clientId: '',
    businessName: '',
    businessProfilesText: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    supportEmail: '',
    supportPhone: '',
    clientStatus: 'Active' as ClientProfile['clientStatus'],
    accountManager: '',
    monthlyRetainer: 0,
    notes: ''
  });
  const [dailyForm, setDailyForm] = useState({
    businessProfile: '',
    updateDate: today,
    reviewsReceived: 0,
    reviewsDropped: 0,
    callsReceived: 0,
    paymentsMade: 0,
    paymentsPending: 0,
    issueStatus: 'None' as (typeof issueStatuses)[number],
    contactStatus: 'Open' as (typeof contactStatuses)[number],
    issueSummary: '',
    note: ''
  });

  const selectedClient = useMemo(
    () => clients.find((client) => client.clientId === selectedClientId) || null,
    [clients, selectedClientId]
  );

  const { data: clientUpdates } = useClientDailyUpdates(selectedClient?.clientId);
  const { data: clientAssets } = useClientAsset(selectedClient?.clientId);
  const clientAsset = clientAssets[0] || null;
  const [uploadingKind, setUploadingKind] = useState<'' | 'logo' | 'cover'>('');

  useEffect(() => {
    if (!selectedClientId && clients.length > 0) {
      setSelectedClientId(clients[0].clientId);
    }
  }, [clients, selectedClientId]);

  useEffect(() => {
    if (!selectedClient) return;

    setDailyForm((current) => ({
      ...current,
      businessProfile: current.businessProfile || selectedClient.businessProfiles[0] || '',
      updateDate: today
    }));
  }, [selectedClient]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((client) =>
      [client.clientId, client.businessName, client.contactName, client.accountManager]
        .filter(Boolean)
        .some((item) => item!.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const monthlyUpdates = useMemo(() => {
    if (!selectedClient) return [];
    return [...clientUpdates]
      .filter((entry) => entry.updateDate.startsWith(monthFilter))
      .sort((a, b) => b.updateDate.localeCompare(a.updateDate));
  }, [clientUpdates, monthFilter, selectedClient]);

  const allSelectedUpdates = useMemo(
    () => [...clientUpdates].sort((a, b) => b.updateDate.localeCompare(a.updateDate)),
    [clientUpdates]
  );

  const clientStats = useMemo(() => {
    const base = {
      totalClients: clients.length,
      activeClients: clients.filter((client) => client.clientStatus === 'Active').length,
      pausedClients: clients.filter((client) => client.clientStatus === 'Paused').length,
      atRiskClients: clients.filter((client) => client.clientStatus === 'At Risk').length,
      monthlyRevenue: clients.reduce((sum, client) => sum + Number(client.monthlyRetainer || 0), 0)
    };

    const updatesForMonth = selectedClient ? monthlyUpdates : [];
    return {
      ...base,
      monthReviews: updatesForMonth.reduce((sum, entry) => sum + Number(entry.reviewsReceived || 0), 0),
      monthDropped: updatesForMonth.reduce((sum, entry) => sum + Number(entry.reviewsDropped || 0), 0),
      monthCalls: updatesForMonth.reduce((sum, entry) => sum + Number(entry.callsReceived || 0), 0),
      monthPayments: updatesForMonth.reduce((sum, entry) => sum + Number(entry.paymentsMade || 0), 0),
      monthPending: updatesForMonth.reduce((sum, entry) => sum + Number(entry.paymentsPending || 0), 0),
      openIssues: updatesForMonth.filter((entry) => entry.issueStatus !== 'None').length
    };
  }, [clients, monthlyUpdates, selectedClient]);

  const saveClient = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        clientId: clientForm.clientId,
        businessName: clientForm.businessName,
        businessProfiles: parseProfiles(clientForm.businessProfilesText),
        contactName: clientForm.contactName,
        contactEmail: clientForm.contactEmail,
        contactPhone: clientForm.contactPhone,
        supportEmail: clientForm.supportEmail,
        supportPhone: clientForm.supportPhone,
        clientStatus: clientForm.clientStatus,
        accountManager: clientForm.accountManager,
        monthlyRetainer: clientForm.monthlyRetainer,
        notes: clientForm.notes
      };

      if (editingClientId) {
        await updateClient(editingClientId, payload);
        setMessage('Client updated successfully.');
      } else {
        await createClient(payload, profile?.uid);
        setMessage('Client created successfully.');
      }

      setClientForm({
        clientId: '',
        businessName: '',
        businessProfilesText: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        supportEmail: '',
        supportPhone: '',
        clientStatus: 'Active',
        accountManager: '',
        monthlyRetainer: 0,
        notes: ''
      });
      setEditingClientId(null);
    } catch (error: any) {
      setMessage(error?.message || 'Unable to save client.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (client: ClientProfile) => {
    setEditingClientId(client.clientId);
    setClientForm({
      clientId: client.clientId,
      businessName: client.businessName,
      businessProfilesText: client.businessProfiles.join(', '),
      contactName: client.contactName || '',
      contactEmail: client.contactEmail || '',
      contactPhone: client.contactPhone || '',
      supportEmail: client.supportEmail || '',
      supportPhone: client.supportPhone || '',
      clientStatus: client.clientStatus,
      accountManager: client.accountManager || '',
      monthlyRetainer: Number(client.monthlyRetainer || 0),
      notes: client.notes || ''
    });
  };

  const resetClientForm = () => {
    setEditingClientId(null);
    setClientForm({
      clientId: '',
      businessName: '',
      businessProfilesText: '',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      supportEmail: '',
      supportPhone: '',
      clientStatus: 'Active',
      accountManager: '',
      monthlyRetainer: 0,
      notes: ''
    });
  };

  const saveDailyUpdate = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedClient) {
      setMessage('Select a client first.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await createClientDailyUpdate(
        {
          ...dailyForm,
          clientId: selectedClient.clientId
        },
        profile?.uid
      );

      setMessage('Daily update saved.');
      setDailyForm((current) => ({
        ...current,
        updateDate: today,
        reviewsReceived: 0,
        reviewsDropped: 0,
        callsReceived: 0,
        paymentsMade: 0,
        paymentsPending: 0,
        issueStatus: 'None',
        contactStatus: 'Open',
        issueSummary: '',
        note: ''
      }));
    } catch (error: any) {
      setMessage(error?.message || 'Unable to save daily update.');
    } finally {
      setSaving(false);
    }
  };

  const fillDailyProfile = (value: string) => {
    setDailyForm((current) => ({ ...current, businessProfile: value }));
  };

  const contactAction = selectedClient?.supportEmail || selectedClient?.contactEmail;
  const phoneAction = selectedClient?.supportPhone || selectedClient?.contactPhone;

  return (
    <AppShell>
      <PageHeader
        title="Client Management"
        subtitle="Maintain one record per client, enter daily performance updates, and keep every client's business data fully separated."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setSelectedClientId(selectedClient?.clientId || clients[0]?.clientId || '')}>
              <RefreshCw size={16} />
              Refresh View
            </Button>
            <Button onClick={() => document.getElementById('client-create-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
              <Plus size={16} />
              New Client
            </Button>
          </div>
        }
      />

      {message && <div className="mb-4 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-900">{message}</div>}

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Clients</p>
            <Users className="text-cyan-600" size={18} />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{clientStats.totalClients}</p>
        </Card>
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Active</p>
            <Building2 className="text-emerald-600" size={18} />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{clientStats.activeClients}</p>
        </Card>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">At Risk</p>
            <ShieldAlert className="text-amber-600" size={18} />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{clientStats.atRiskClients}</p>
        </Card>
        <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Monthly Retainer</p>
            <CircleDollarSign className="text-violet-600" size={18} />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">₹{currency.format(clientStats.monthlyRevenue)}</p>
        </Card>
        <Card className="border-rose-200 bg-gradient-to-br from-rose-50 to-white">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-500">Open Issues</p>
            <Wrench className="text-rose-600" size={18} />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{selectedClient ? clientStats.openIssues : 0}</p>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Card className="border-slate-200 bg-white/95 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Client Directory</h2>
              <p className="text-sm text-slate-500">Search and keep each client isolated by its own client ID.</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client, manager or ID" className="pl-10" />
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {loading && <p className="text-sm text-slate-500">Loading clients...</p>}
            {!loading && filteredClients.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No clients found. Create the first record below.</p>}
            {filteredClients.map((client) => (
              <div
                key={client.clientId}
                className={`rounded-2xl border p-4 transition ${selectedClientId === client.clientId ? 'border-cyan-400 bg-cyan-50/80' : 'border-slate-200 bg-slate-50/80'}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900">{client.businessName}</h3>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600">{client.clientId}</span>
                      <span className="rounded-full px-2 py-1 text-xs font-bold text-white" style={{ background: client.clientStatus === 'Active' ? '#0f766e' : client.clientStatus === 'Paused' ? '#b45309' : '#be123c' }}>
                        {client.clientStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{client.contactName || 'Primary contact not set'} {client.accountManager ? `• Managed by ${client.accountManager}` : ''}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {client.businessProfiles.map((profileName) => (
                        <span key={profileName} className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                          {profileName}
                        </span>
                      ))}
                      {client.businessProfiles.length === 0 && <span className="text-xs text-slate-400">No business profiles added</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => setSelectedClientId(client.clientId)}>
                      View
                    </Button>
                    <Button variant="outline" onClick={() => startEdit(client)}>
                      <Edit3 size={16} />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        if (!confirm(`Delete ${client.businessName}?`)) return;
                        setSaving(true);
                        try {
                          await deleteClient(client.clientId);
                          if (selectedClientId === client.clientId) setSelectedClientId('');
                          setMessage('Client removed.');
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-gradient-to-br from-white to-cyan-50 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">{selectedClient ? selectedClient.businessName : 'Client Overview'}</h2>
                <p className="text-sm text-slate-500">{selectedClient ? selectedClient.clientId : 'Select a client to see the dashboard and daily updates.'}</p>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <CalendarDays className="text-cyan-600" size={22} />
              </div>
            </div>

            {selectedClient && (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-cyan-50 p-4">
                    <p className="text-xs font-bold uppercase text-cyan-700">Reviews</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthReviews}</p>
                    <p className="text-xs text-slate-500">Received this month</p>
                  </div>
                  <div className="rounded-2xl bg-rose-50 p-4">
                    <p className="text-xs font-bold uppercase text-rose-700">Drops</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthDropped}</p>
                    <p className="text-xs text-slate-500">Review drop-offs</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold uppercase text-emerald-700">Calls</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthCalls}</p>
                    <p className="text-xs text-slate-500">Incoming calls</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Contact</p>
                    <p className="mt-2 font-semibold text-slate-900">{selectedClient.contactName || 'Not set'}</p>
                    <p className="text-sm text-slate-600">{selectedClient.contactEmail || 'No email saved'}</p>
                    <p className="text-sm text-slate-600">{selectedClient.contactPhone || 'No phone saved'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Support</p>
                    <p className="mt-2 text-sm text-slate-600">{selectedClient.supportEmail || 'Support email not set'}</p>
                    <p className="text-sm text-slate-600">{selectedClient.supportPhone || 'Support phone not set'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        disabled={!contactAction}
                        onClick={() => contactAction && (window.location.href = `mailto:${contactAction}`)}
                      >
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!phoneAction}
                        onClick={() => phoneAction && (window.location.href = `tel:${phoneAction}`)}
                      >
                        Call
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card>

          <Card className="border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Daily Client Update</h2>
                <p className="text-sm text-slate-500">One entry per client, one business profile, one date.</p>
              </div>
              <Clock3 className="text-violet-500" size={22} />
            </div>

            <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={saveDailyUpdate}>
              <Select value={dailyForm.businessProfile} onChange={(e) => fillDailyProfile(e.target.value)} className="sm:col-span-2">
                <option value="">Select business profile</option>
                {(selectedClient?.businessProfiles || []).map((profileName) => (
                  <option key={profileName} value={profileName}>
                    {profileName}
                  </option>
                ))}
              </Select>
              <Input type="date" value={dailyForm.updateDate} onChange={(e) => setDailyForm((current) => ({ ...current, updateDate: e.target.value }))} />
              <Input type="number" min={0} placeholder="Reviews received" value={dailyForm.reviewsReceived} onChange={(e) => setDailyForm((current) => ({ ...current, reviewsReceived: Number(e.target.value) }))} />
              <Input type="number" min={0} placeholder="Reviews dropped" value={dailyForm.reviewsDropped} onChange={(e) => setDailyForm((current) => ({ ...current, reviewsDropped: Number(e.target.value) }))} />
              <Input type="number" min={0} placeholder="Calls received" value={dailyForm.callsReceived} onChange={(e) => setDailyForm((current) => ({ ...current, callsReceived: Number(e.target.value) }))} />
              <Input type="number" min={0} placeholder="Payments made" value={dailyForm.paymentsMade} onChange={(e) => setDailyForm((current) => ({ ...current, paymentsMade: Number(e.target.value) }))} />
              <Input type="number" min={0} placeholder="Payments pending" value={dailyForm.paymentsPending} onChange={(e) => setDailyForm((current) => ({ ...current, paymentsPending: Number(e.target.value) }))} />
              <Select value={dailyForm.issueStatus} onChange={(e) => setDailyForm((current) => ({ ...current, issueStatus: e.target.value as typeof dailyForm.issueStatus }))}>
                {issueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Select value={dailyForm.contactStatus} onChange={(e) => setDailyForm((current) => ({ ...current, contactStatus: e.target.value as typeof dailyForm.contactStatus }))}>
                {contactStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Textarea className="sm:col-span-2" placeholder="Issue summary or support note" value={dailyForm.issueSummary} onChange={(e) => setDailyForm((current) => ({ ...current, issueSummary: e.target.value }))} />
              <Textarea className="sm:col-span-2" placeholder="Optional internal note" value={dailyForm.note} onChange={(e) => setDailyForm((current) => ({ ...current, note: e.target.value }))} />
              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || !selectedClient}>
                  Save Daily Update
                </Button>
                <Button type="button" variant="outline" onClick={() => setMonthFilter(today.slice(0, 7))}>
                  This Month
                </Button>
              </div>
            </form>
          </Card>

          <Card className="border-slate-200 bg-gradient-to-br from-white to-cyan-50 shadow-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900">Client Branding</h2>
                <p className="text-sm text-slate-500">Upload logo and cover image — visible on the client portal.</p>
              </div>
              <ImageIcon className="text-cyan-600" size={22} />
            </div>

            {!selectedClient ? (
              <p className="mt-4 text-sm text-slate-500">Select a client to manage branding.</p>
            ) : (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(['logo', 'cover'] as const).map((kind) => {
                  const url = kind === 'logo' ? clientAsset?.logoUrl : clientAsset?.coverUrl;
                  return (
                    <div key={kind} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{kind}</p>
                      <div className="mt-2 grid h-32 w-full place-items-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
                        {url ? (
                          <img
                            src={url}
                            alt={`${kind}`}
                            className={kind === 'logo' ? 'h-full w-full object-contain' : 'h-full w-full object-cover'}
                          />
                        ) : (
                          <span className="text-sm text-slate-400">No {kind} uploaded</span>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-cyan-700">
                          <Upload size={14} />
                          {uploadingKind === kind ? 'Uploading…' : 'Upload'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingKind !== ''}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingKind(kind);
                              try {
                                await uploadClientAsset(selectedClient.clientId, file, kind, profile?.uid);
                                setMessage(`${kind === 'logo' ? 'Logo' : 'Cover'} uploaded.`);
                              } catch (err) {
                                setMessage(`Upload failed: ${(err as Error).message}`);
                              } finally {
                                setUploadingKind('');
                                e.target.value = '';
                              }
                            }}
                          />
                        </label>
                        {url && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              try {
                                await removeClientAsset(selectedClient.clientId, kind);
                                setMessage(`${kind === 'logo' ? 'Logo' : 'Cover'} removed.`);
                              } catch (err) {
                                setMessage(`Remove failed: ${(err as Error).message}`);
                              }
                            }}
                          >
                            <X size={14} /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Card id="client-create-form" className="border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">{editingClientId ? 'Edit Client' : 'Create Client'}</h2>
              <p className="text-sm text-slate-500">Keep the client ID unique. It is the key the client uses to open the portal.</p>
            </div>
            <Button variant="ghost" onClick={resetClientForm}>
              Reset
            </Button>
          </div>

          <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={saveClient}>
            <Input
              value={clientForm.clientId}
              onChange={(e) => setClientForm((current) => ({ ...current, clientId: e.target.value.toUpperCase() }))}
              placeholder="CLIENT-001"
              disabled={Boolean(editingClientId)}
            />
            <Input value={clientForm.businessName} onChange={(e) => setClientForm((current) => ({ ...current, businessName: e.target.value }))} placeholder="Business name" />
            <Textarea
              className="sm:col-span-2"
              value={clientForm.businessProfilesText}
              onChange={(e) => setClientForm((current) => ({ ...current, businessProfilesText: e.target.value }))}
              placeholder="Business profiles, separated by comma or new line"
            />
            <Input value={clientForm.contactName} onChange={(e) => setClientForm((current) => ({ ...current, contactName: e.target.value }))} placeholder="Primary contact name" />
            <Input value={clientForm.contactEmail} onChange={(e) => setClientForm((current) => ({ ...current, contactEmail: e.target.value }))} placeholder="Primary contact email" />
            <Input value={clientForm.contactPhone} onChange={(e) => setClientForm((current) => ({ ...current, contactPhone: e.target.value }))} placeholder="Primary contact phone" />
            <Input value={clientForm.supportEmail} onChange={(e) => setClientForm((current) => ({ ...current, supportEmail: e.target.value }))} placeholder="Support email" />
            <Input value={clientForm.supportPhone} onChange={(e) => setClientForm((current) => ({ ...current, supportPhone: e.target.value }))} placeholder="Support phone" />
            <Input type="number" min={0} value={clientForm.monthlyRetainer} onChange={(e) => setClientForm((current) => ({ ...current, monthlyRetainer: Number(e.target.value) }))} placeholder="Monthly retainer" />
            <Select value={clientForm.clientStatus} onChange={(e) => setClientForm((current) => ({ ...current, clientStatus: e.target.value as ClientProfile['clientStatus'] }))}>
              {clientStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
            <Input className="sm:col-span-2" value={clientForm.accountManager} onChange={(e) => setClientForm((current) => ({ ...current, accountManager: e.target.value }))} placeholder="Account manager" />
            <Textarea className="sm:col-span-2" value={clientForm.notes} onChange={(e) => setClientForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Internal notes, escalation details, or scope notes" />
            <Button className="sm:col-span-2" type="submit" disabled={saving || !clientForm.clientId.trim() || !clientForm.businessName.trim()}>
              {editingClientId ? 'Update Client' : 'Create Client'}
            </Button>
          </form>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white to-violet-50 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Selected Client Timeline</h2>
              <p className="text-sm text-slate-500">History for {selectedClient?.businessName || 'the selected client'}.</p>
            </div>
            <div className="flex items-center gap-2">
              <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-44" />
              <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">{monthlyUpdates.length} entries</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="text-xs font-bold uppercase text-cyan-700">Reviews</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthReviews}</p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-4">
              <p className="text-xs font-bold uppercase text-rose-700">Pending</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthPending}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase text-amber-700">Dropped</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthDropped}</p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase text-emerald-700">Payments</p>
              <p className="mt-2 text-2xl font-black text-slate-900">{clientStats.monthPayments}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {monthlyUpdates.length === 0 && <p className="rounded-2xl bg-white p-4 text-sm text-slate-500">No updates found for this month.</p>}
            {monthlyUpdates.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{entry.updateDate}</p>
                    <h3 className="mt-1 text-base font-black text-slate-900">{entry.businessProfile}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cyan-50 px-2 py-1 text-xs font-bold text-cyan-700">Reviews {entry.reviewsReceived}</span>
                    <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">Dropped {entry.reviewsDropped}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Calls {entry.callsReceived}</span>
                    <span className="rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700">Paid {entry.paymentsMade}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700">Pending {entry.paymentsPending}</span>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <p className="rounded-xl bg-slate-50 p-3 text-sm"><b className="block text-xs uppercase text-slate-500">Issue</b>{entry.issueStatus}</p>
                  <p className="rounded-xl bg-slate-50 p-3 text-sm"><b className="block text-xs uppercase text-slate-500">Contact</b>{entry.contactStatus}</p>
                  <p className="rounded-xl bg-slate-50 p-3 text-sm"><b className="block text-xs uppercase text-slate-500">Note</b>{entry.note || 'No extra note'}</p>
                </div>
                {entry.issueSummary && <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">{entry.issueSummary}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-xl">
          <h2 className="text-xl font-black text-slate-900">All Updates For Selected Client</h2>
          <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
            {allSelectedUpdates.length === 0 && <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No client history yet.</p>}
            {allSelectedUpdates.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{entry.updateDate}</p>
                    <p className="mt-1 font-black text-slate-900">{entry.businessProfile}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${entry.issueStatus === 'None' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {entry.issueStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{entry.note || entry.issueSummary || 'No detail added.'}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-slate-900 to-cyan-900 text-white shadow-xl">
          <h2 className="text-xl font-black">Operating Notes</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-100">
            <div className="rounded-2xl bg-white/10 p-4">
              Each client is stored under its own `clientId`, so data cannot bleed into another client's dashboard.
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              Daily updates are saved independently for each business profile, making it easy to compare month-by-month performance.
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              Only CEO, Head Manager, and Operations Team should handle this page in production.
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
