"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  Building2,
  CalendarDays,
  Download,
  FileSignature,
  FileText,
  Mail,
  MapPin,
  PenLine,
  Phone,
  Plus,
  Printer,
  Save,
  Trash2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { CompanyDocument } from "@/types";
import { formatDate } from "@/lib/utils";

type DocumentType = CompanyDocument["type"];

const documentTypes: { value: DocumentType; label: string }[] = [
  { value: "application", label: "Application" },
  { value: "experience", label: "Experience Letter" },
  { value: "resignation", label: "Resignation Letter" },
  { value: "agreement", label: "Agreement" },
  { value: "offer", label: "Offer Letter" },
  { value: "other", label: "Other" },
];

const templateContent: Record<DocumentType, string> = {
  application:
    "To,\nThe HR Department\nAxenta Business Consulting\n\nSubject: Application\n\nRespected Sir/Madam,\n\nI am writing this application regarding ________________________________.\n\nKindly consider my request and do the needful.\n\nThank you.\n\nYours sincerely,\n[Name]",
  experience:
    "To Whom It May Concern\n\nThis is to certify that [Employee Name] worked with Axenta Business Consulting as [Designation] from [Joining Date] to [Last Working Date].\n\nDuring the tenure, the employee performed assigned responsibilities sincerely and maintained professional conduct.\n\nWe wish them success in future endeavors.",
  resignation:
    "To,\nThe Management\nAxenta Business Consulting\n\nSubject: Resignation Letter\n\nRespected Sir/Madam,\n\nI hereby submit my resignation from the position of [Designation]. My requested last working day is [Date].\n\nI am thankful for the opportunities and support provided during my tenure.\n\nYours sincerely,\n[Name]",
  agreement:
    "Agreement\n\nThis agreement is made between Axenta Business Consulting and [Party Name] on [Date].\n\nBoth parties agree to the following terms:\n\n1. [Term one]\n2. [Term two]\n3. [Term three]\n\nThis agreement will remain valid as per the mutually accepted terms.",
  offer:
    "Dear [Candidate Name],\n\nWe are pleased to offer you the position of [Designation] at Axenta Business Consulting.\n\nYour joining date will be [Date]. Detailed salary and employment terms will be shared separately or attached with this letter.\n\nWe look forward to having you on our team.",
  other:
    "To,\n[Recipient]\n\nSubject: [Subject]\n\nDear Sir/Madam,\n\n[Type your letter content here]\n\nRegards,\nAxenta Business Consulting",
};

const blankDocument = (userName?: string): Omit<CompanyDocument, "id"> => {
  const now = new Date().toISOString();
  return {
    title: "New Letter",
    type: "application",
    referenceNo: `AXN/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
    recipientName: "",
    subject: "Application",
    content: templateContent.application,
    status: "draft",
    createdBy: userName || "System",
    createdAt: now,
    updatedAt: now,
  };
};

export default function LettersPage() {
  const { user, hasPermission } = useAuth();
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<CompanyDocument, "id">>(() => blankDocument());

  const canManageLetters = hasPermission("letters");

  useEffect(() => {
    if (!canManageLetters) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "companyLetters"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })) as CompanyDocument[];
        setDocuments(rows);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [canManageLetters]);

  const selectedTypeLabel = useMemo(
    () => documentTypes.find((type) => type.value === form.type)?.label || "Letter",
    [form.type]
  );

  const handleTypeChange = (type: DocumentType) => {
    const label = documentTypes.find((item) => item.value === type)?.label || "Letter";
    setForm((prev) => ({
      ...prev,
      type,
      title: prev.title === "New Letter" || documentTypes.some((item) => item.label === prev.title) ? label : prev.title,
      subject: label,
      content: templateContent[type],
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleNew = () => {
    setSelectedId(null);
    setForm(blankDocument(user?.displayName));
  };

  const handleSelect = (row: CompanyDocument) => {
    setSelectedId(row.id);
    const { id, ...data } = row;
    setForm(data);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      createdBy: form.createdBy || user?.displayName || "System",
      updatedAt: new Date().toISOString(),
    };

    try {
      if (selectedId) {
        await updateDoc(doc(db, "companyLetters", selectedId), payload);
      } else {
        const created = await addDoc(collection(db, "companyLetters"), {
          ...payload,
          createdAt: new Date().toISOString(),
        });
        setSelectedId(created.id);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    await deleteDoc(doc(db, "companyLetters", selectedId));
    handleNew();
  };

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      key: "title",
      label: "Document",
      sortable: true,
      render: (row: CompanyDocument) => (
        <div>
          <p className="font-medium dark:text-white">{row.title}</p>
          <p className="text-xs text-slate-400">{row.referenceNo}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (row: CompanyDocument) => (
        <Badge variant="secondary">
          {documentTypes.find((type) => type.value === row.type)?.label || row.type}
        </Badge>
      ),
    },
    { key: "recipientName", label: "Recipient" },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (row: CompanyDocument) => <span className="text-xs">{formatDate(row.updatedAt)}</span>,
    },
  ];

  if (!canManageLetters) {
    return (
      <DashboardLayout>
        <PageHeader title="Letters" description="Company letterhead documents" icon={FileSignature} />
        <Card>
          <CardContent className="py-10 text-center text-slate-500">
            You do not have permission to manage company letters.
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="screen-only">
        <PageHeader
          title="Letters"
          description="Create, save, and print company letterhead documents"
          icon={FileSignature}
          actions={
            <>
              <Button variant="outline" onClick={handleNew}>
                <Plus className="w-4 h-4 mr-1" /> New
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-1" /> {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="gold" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" /> Print
              </Button>
            </>
          }
        />
      </div>

      <div className="screen-only grid grid-cols-1 xl:grid-cols-5 gap-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PenLine className="w-4 h-4 text-[#D4A843]" /> Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select label="Document Type" value={form.type} onChange={(event) => handleTypeChange(event.target.value as DocumentType)}>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value as CompanyDocument["status"] }))}
                >
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Reference No.</label>
                  <Input value={form.referenceNo} onChange={(event) => setForm((prev) => ({ ...prev, referenceNo: event.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Recipient</label>
                  <Input value={form.recipientName} onChange={(event) => setForm((prev) => ({ ...prev, recipientName: event.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                <Input value={form.subject} onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Letter Body</label>
                <Textarea
                  value={form.content}
                  onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
                  className="min-h-[320px] font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-1" /> Save Document
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Download className="w-4 h-4 mr-1" /> Export PDF
                </Button>
                <Button variant="ghost" onClick={handleDelete} disabled={!selectedId} className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={documents}
            loading={loading}
            searchable
            searchKeys={["title", "referenceNo", "recipientName", "subject"]}
            pageSize={5}
            onRowClick={handleSelect}
            emptyMessage="No saved documents"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Letterhead Preview</p>
            <Badge variant={form.status === "final" ? "success" : "warning"}>{form.status}</Badge>
          </div>
          <LetterheadPreview form={form} typeLabel={selectedTypeLabel} />
        </motion.div>
      </div>

      <div className="print-only">
        <LetterheadPreview form={form} typeLabel={selectedTypeLabel} />
      </div>
    </DashboardLayout>
  );
}

function LetterheadPreview({ form, typeLabel }: { form: Omit<CompanyDocument, "id">; typeLabel: string }) {
  return (
    <article className="letter-page bg-white text-slate-950 shadow-xl border border-slate-200 mx-auto">
      <header className="letter-header">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="letter-logo">
              <Building2 className="w-9 h-9" />
            </div>
            <div>
              <h2>Axenta Business Consulting</h2>
              <p>Business Consulting & ERP Services</p>
            </div>
          </div>
          <div className="letter-meta">
            <p className="font-semibold">{typeLabel}</p>
            <p>Ref: {form.referenceNo || "AXN/----"}</p>
            <p>Date: {new Date().toLocaleDateString("en-IN")}</p>
          </div>
        </div>
        <div className="letter-contact">
          <span><Phone className="w-3.5 h-3.5" /> +91-1234567890</span>
          <span><Mail className="w-3.5 h-3.5" /> info@axenta.com</span>
          <span><MapPin className="w-3.5 h-3.5" /> Business Tower, Mumbai, Maharashtra, India</span>
        </div>
      </header>

      <main className="letter-body">
        <div className="letter-topline">
          <div>
            <p className="text-xs uppercase text-slate-500">Recipient</p>
            <p className="font-semibold">{form.recipientName || "Recipient Name"}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Document</p>
            <p className="font-semibold">{form.title || typeLabel}</p>
          </div>
        </div>

        <div className="letter-subject">
          <FileText className="w-4 h-4" />
          <span>Subject: {form.subject || typeLabel}</span>
        </div>

        <div className="letter-content">
          {form.content.split("\n").map((line, index) => (
            <p key={`${line}-${index}`} className={line.trim() ? "" : "min-h-5"}>
              {line}
            </p>
          ))}
        </div>
      </main>

      <footer className="letter-footer">
        <div>
          <p className="font-semibold">For Axenta Business Consulting</p>
          <div className="signature-line" />
          <p>Authorized Signatory</p>
        </div>
        <div className="text-right">
          <CalendarDays className="w-4 h-4 ml-auto mb-1 text-[#D4A843]" />
          <p>Generated on {new Date().toLocaleDateString("en-IN")}</p>
        </div>
      </footer>
    </article>
  );
}
