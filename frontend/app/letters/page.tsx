'use client';

import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { Building2, CalendarDays, FileSignature, FileText, Mail, MapPin, Phone, Plus, Printer, Save, Trash2 } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/dashboard/dashboard-components';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Select, Textarea } from '@/components/ui/input';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/providers';
import { CompanyLetter } from '@/types';

type LetterType = CompanyLetter['type'];

const letterTypes: LetterType[] = ['Application', 'Experience Letter', 'Resignation Letter', 'Agreement', 'Offer Letter', 'Other'];

const templates: Record<LetterType, string> = {
  Application:
    'To,\nThe HR Department\nAxienta Business Consulting\n\nSubject: Application\n\nRespected Sir/Madam,\n\nI am writing this application regarding ________________________________.\n\nKindly consider my request and do the needful.\n\nThank you.\n\nYours sincerely,\n[Name]',
  'Experience Letter':
    'To Whom It May Concern\n\nThis is to certify that [Employee Name] worked with Axienta Business Consulting as [Designation] from [Joining Date] to [Last Working Date].\n\nDuring the tenure, the employee performed assigned responsibilities sincerely and maintained professional conduct.\n\nWe wish them success in future endeavors.',
  'Resignation Letter':
    'To,\nThe Management\nAxienta Business Consulting\n\nSubject: Resignation Letter\n\nRespected Sir/Madam,\n\nI hereby submit my resignation from the position of [Designation]. My requested last working day is [Date].\n\nI am thankful for the opportunities and support provided during my tenure.\n\nYours sincerely,\n[Name]',
  Agreement:
    'Agreement\n\nThis agreement is made between Axienta Business Consulting and [Party Name] on [Date].\n\nBoth parties agree to the following terms:\n\n1. [Term one]\n2. [Term two]\n3. [Term three]\n\nThis agreement will remain valid as per the mutually accepted terms.',
  'Offer Letter':
    'Dear [Candidate Name],\n\nWe are pleased to offer you the position of [Designation] at Axienta Business Consulting.\n\nYour joining date will be [Date]. Detailed salary and employment terms will be shared separately or attached with this letter.\n\nWe look forward to having you on our team.',
  Other:
    'To,\n[Recipient]\n\nSubject: [Subject]\n\nDear Sir/Madam,\n\n[Type your letter content here]\n\nRegards,\nAxienta Business Consulting'
};

function newLetter(createdBy = 'System'): Omit<CompanyLetter, 'id'> {
  const now = new Date().toISOString();
  return {
    title: 'New Letter',
    type: 'Application',
    referenceNo: `AXN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    recipientName: '',
    subject: 'Application',
    content: templates.Application,
    status: 'Draft',
    createdBy,
    createdAt: now,
    updatedAt: now
  };
}

function formatDocDate(value: any) {
  const raw = value?.toDate ? value.toDate() : value ? new Date(value) : new Date();
  return raw.toLocaleDateString('en-IN');
}

export default function Letters() {
  const { profile } = useAuth();
  const [letters, setLetters] = useState<CompanyLetter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CompanyLetter, 'id'>>(() => newLetter());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'companyLetters'), orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        setLetters(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as CompanyLetter[]);
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  const selectedLabel = useMemo(() => form.type || 'Letter', [form.type]);

  const createBlank = () => {
    setSelectedId(null);
    setForm(newLetter(profile?.name));
  };

  const selectLetter = (letter: CompanyLetter) => {
    const { id, ...data } = letter;
    setSelectedId(id);
    setForm(data);
  };

  const changeType = (type: LetterType) => {
    setForm((current) => ({
      ...current,
      type,
      title: current.title === 'New Letter' || letterTypes.includes(current.title as LetterType) ? type : current.title,
      subject: type,
      content: templates[type],
      updatedAt: new Date().toISOString()
    }));
  };

  const saveLetter = async () => {
    setSaving(true);
    const payload = {
      ...form,
      createdBy: form.createdBy || profile?.name || 'System',
      updatedAt: new Date().toISOString()
    };

    try {
      if (selectedId) {
        await updateDoc(doc(db, 'companyLetters', selectedId), payload);
      } else {
        const created = await addDoc(collection(db, 'companyLetters'), {
          ...payload,
          createdAt: new Date().toISOString()
        });
        setSelectedId(created.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteLetter = async () => {
    if (!selectedId) return;
    await deleteDoc(doc(db, 'companyLetters', selectedId));
    createBlank();
  };

  return (
    <AppShell>
      <div className="screen-only">
        <PageHeader
          title="Letters"
          subtitle="Create, save and print applications, experience letters, resignation letters and agreements on company letterhead."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={createBlank}><Plus size={16} />New</Button>
              <Button type="button" onClick={saveLetter} disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Save'}</Button>
              <Button type="button" variant="outline" onClick={() => window.print()}><Printer size={16} />Print / PDF</Button>
            </div>
          }
        />
      </div>

      <div className="screen-only grid gap-6 xl:grid-cols-5">
        <div className="space-y-4 xl:col-span-2">
          <Card className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">Document Details</h3>
                <p className="text-sm text-slate-500">Saved documents remain available in Firestore.</p>
              </div>
              <FileSignature className="text-gold-600" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Type</p>
                <Select value={form.type} onChange={(e) => changeType(e.target.value as LetterType)}>
                  {letterTypes.map((type) => <option key={type}>{type}</option>)}
                </Select>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CompanyLetter['status'] })}>
                  <option>Draft</option>
                  <option>Final</option>
                </Select>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Title</p>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Reference No.</p>
                <Input value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Recipient</p>
                <Input value={form.recipientName} onChange={(e) => setForm({ ...form, recipientName: e.target.value })} />
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Subject</p>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>

            <div>
              <p className="text-sm text-slate-500">Letter Body</p>
              <Textarea className="min-h-[320px] font-mono" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={saveLetter} disabled={saving}><Save size={16} />Save Document</Button>
              <Button type="button" variant="outline" onClick={() => window.print()}><Printer size={16} />Export PDF</Button>
              <Button type="button" variant="danger" onClick={deleteLetter} disabled={!selectedId}><Trash2 size={16} />Delete</Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold">Saved Documents</h3>
            {loading ? <p className="mt-4 text-sm text-slate-500">Loading documents...</p> : null}
            <div className="mt-4 space-y-2">
              {letters.map((letter) => (
                <button
                  key={letter.id}
                  type="button"
                  onClick={() => selectLetter(letter)}
                  className={`w-full rounded-2xl border p-3 text-left transition hover:border-gold-500 ${selectedId === letter.id ? 'border-gold-500 bg-gold-50' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-navy-900">{letter.title}</p>
                      <p className="text-xs text-slate-500">{letter.referenceNo} • {letter.type}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{letter.status}</span>
                  </div>
                </button>
              ))}
              {!loading && letters.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No documents saved yet.</p> : null}
            </div>
          </Card>
        </div>

        <div className="xl:col-span-3">
          <LetterPreview form={form} typeLabel={selectedLabel} />
        </div>
      </div>

      <div className="print-only">
        <LetterPreview form={form} typeLabel={selectedLabel} />
      </div>
    </AppShell>
  );
}

function LetterPreview({ form, typeLabel }: { form: Omit<CompanyLetter, 'id'>; typeLabel: string }) {
  return (
    <article className="letter-page mx-auto bg-white text-slate-950 shadow-premium">
      <header className="letter-header">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="letter-logo"><Building2 size={36} /></div>
            <div>
              <h2>Axienta Business Consulting</h2>
              <p>Business Consulting & ERP Services</p>
            </div>
          </div>
          <div className="letter-meta">
            <p className="font-semibold">{typeLabel}</p>
            <p>Ref: {form.referenceNo || 'AXN/----'}</p>
            <p>Date: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>
        <div className="letter-contact">
          <span><Phone size={14} /> +91-1234567890</span>
          <span><Mail size={14} /> info@axenta.com</span>
          <span><MapPin size={14} /> Business Tower, Mumbai, Maharashtra, India</span>
        </div>
      </header>

      <main className="letter-body">
        <div className="letter-topline">
          <div>
            <p className="text-xs uppercase text-slate-500">Recipient</p>
            <p className="font-semibold">{form.recipientName || 'Recipient Name'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Document</p>
            <p className="font-semibold">{form.title || typeLabel}</p>
          </div>
        </div>

        <div className="letter-subject"><FileText size={16} />Subject: {form.subject || typeLabel}</div>

        <div className="letter-content">
          {form.content.split('\n').map((line, index) => (
            <p key={`${index}-${line}`} className={line.trim() ? '' : 'min-h-5'}>{line}</p>
          ))}
        </div>
      </main>

      <footer className="letter-footer">
        <div>
          <p className="font-semibold">For Axienta Business Consulting</p>
          <div className="signature-line" />
          <p>Authorized Signatory</p>
        </div>
        <div className="text-right">
          <CalendarDays size={16} className="ml-auto mb-1 text-gold-600" />
          <p>Generated on {formatDocDate(form.updatedAt)}</p>
        </div>
      </footer>
    </article>
  );
}
