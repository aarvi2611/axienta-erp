"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target, Plus, Filter, Download, Upload, Phone, Mail,
  Globe, MapPin, Star, Edit, Trash2, Eye, MessageSquare,
  Calendar, Tag, UserPlus, ArrowRight
} from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, where } from "firebase/firestore";
import { db } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Lead, LeadStatus, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, ROLE_LABELS } from "@/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import * as XLSX from "xlsx";

const statusBadgeVariant = (status: LeadStatus) => {
  switch (status) {
    case "new": return "info";
    case "contacted": return "secondary";
    case "follow_up": return "warning";
    case "interested": return "success";
    case "confirmed": return "default";
    case "converted": return "success";
    case "rejected": return "destructive";
    default: return "secondary";
  }
};

export default function LeadsPage() {
  const { user, hasPermission } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    businessName: "", contactPerson: "", phone: "", email: "",
    website: "", address: "", category: "", status: "new" as LeadStatus,
    source: "", tags: "",
  });

  // Load from Firestore
  useEffect(() => {
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const firestoreLeads = snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead));
          setLeads(firestoreLeads);
        } else {
          setLeads([]);
        }
      }, () => {
        setLeads([]);
      });
      return () => unsub();
    } catch {
      setLeads([]);
    }
  }, []);

  const filteredLeads = statusFilter === "all" ? leads : leads.filter(l => l.status === statusFilter);

  const handleAddLead = async () => {
    const newLead: any = {
      ...formData,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      notes: [],
      timeline: [],
      assignedTo: "",
      assignedToName: "",
      createdBy: user?.uid || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rating: 0,
      followUpDate: "",
    };

    try {
      await addDoc(collection(db, "leads"), newLead);
    } catch {
      newLead.id = String(Date.now());
      setLeads(prev => [newLead, ...prev]);
    }

    setShowAddModal(false);
    setFormData({
      businessName: "", contactPerson: "", phone: "", email: "",
      website: "", address: "", category: "", status: "new",
      source: "", tags: "",
    });
  };

  const handleExport = () => {
    const exportData = leads.map(l => ({
      "Business Name": l.businessName,
      "Contact Person": l.contactPerson,
      "Phone": l.phone,
      "Email": l.email,
      "Website": l.website,
      "Address": l.address,
      "Category": l.category,
      "Status": LEAD_STATUS_LABELS[l.status],
      "Source": l.source,
      "Assigned To": l.assignedToName,
      "Created": formatDate(l.createdAt),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `Axenta_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const columns = [
    {
      key: "businessName",
      label: "Business",
      sortable: true,
      render: (row: Lead) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.businessName} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.businessName}</p>
            <p className="text-xs text-slate-400">{row.contactPerson}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Contact",
      render: (row: Lead) => (
        <div className="space-y-1">
          {row.phone && (
            <div className="flex items-center gap-1 text-xs">
              <Phone className="w-3 h-3 text-slate-400" /> {row.phone}
            </div>
          )}
          {row.email && (
            <div className="flex items-center gap-1 text-xs">
              <Mail className="w-3 h-3 text-slate-400" /> {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (row: Lead) => (
        <Badge variant="secondary">{row.category || "N/A"}</Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: Lead) => (
        <Badge variant={statusBadgeVariant(row.status) as any}>
          {LEAD_STATUS_LABELS[row.status]}
        </Badge>
      ),
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
    },
    {
      key: "assignedToName",
      label: "Assigned To",
      render: (row: Lead) => row.assignedToName || <span className="text-slate-400">Unassigned</span>,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (row: Lead) => <span className="text-xs">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Lead) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedLead(row); setShowViewModal(true); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F2557] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-1.5 rounded-lg text-slate-400 hover:text-[#D4A843] hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Status counts
  const statusCounts = {
    all: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    follow_up: leads.filter(l => l.status === "follow_up").length,
    interested: leads.filter(l => l.status === "interested").length,
    confirmed: leads.filter(l => l.status === "confirmed").length,
    converted: leads.filter(l => l.status === "converted").length,
    rejected: leads.filter(l => l.status === "rejected").length,
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Lead Management"
        description="Manage and track all business leads"
        icon={Target}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Add Lead
            </Button>
          </div>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All Leads" },
          { key: "new", label: "New" },
          { key: "contacted", label: "Contacted" },
          { key: "follow_up", label: "Follow-Up" },
          { key: "interested", label: "Interested" },
          { key: "confirmed", label: "Confirmed" },
          { key: "converted", label: "Converted" },
          { key: "rejected", label: "Rejected" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === tab.key
                ? "bg-[#0F2557] text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {tab.label} ({statusCounts[tab.key as keyof typeof statusCounts] || 0})
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredLeads}
        searchable
        searchKeys={["businessName", "contactPerson", "phone", "email", "category"]}
        onRowClick={(row) => { setSelectedLead(row); setShowViewModal(true); }}
      />

      {/* Add Lead Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Business Name *</label>
              <Input
                placeholder="Enter business name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Contact Person</label>
              <Input
                placeholder="Enter contact name"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <Input
                placeholder="+91-XXXXXXXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website</label>
              <Input
                placeholder="www.example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <Input
                placeholder="e.g., IT Services"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
              <Input
                placeholder="Full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
              <Select value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })}>
                <option value="">Select source</option>
                <option value="Google Maps">Google Maps</option>
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags (comma separated)</label>
              <Input
                placeholder="e.g., Premium, Enterprise"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddLead} disabled={!formData.businessName}>
              <Plus className="w-4 h-4 mr-1" /> Add Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Lead Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar name={selectedLead.businessName} size="lg" />
                  <div>
                    <span className="block">{selectedLead.businessName}</span>
                    <Badge variant={statusBadgeVariant(selectedLead.status) as any} className="mt-1">
                      {LEAD_STATUS_LABELS[selectedLead.status]}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Contact Person</p>
                      <p className="text-sm font-medium dark:text-white">{selectedLead.contactPerson || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Phone</p>
                      <p className="text-sm font-medium dark:text-white">{selectedLead.phone || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-medium dark:text-white">{selectedLead.email || "N/A"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Category</p>
                      <p className="text-sm font-medium dark:text-white">{selectedLead.category || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Source</p>
                      <p className="text-sm font-medium dark:text-white">{selectedLead.source || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase">Rating</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#D4A843] fill-[#D4A843]" />
                        <span className="text-sm font-medium dark:text-white">{selectedLead.rating || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Address</p>
                  <p className="text-sm font-medium dark:text-white flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {selectedLead.address || "N/A"}
                  </p>
                </div>
                {selectedLead.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase mb-1">Tags</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedLead.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="text-xs text-slate-400">
                  Created: {formatDateTime(selectedLead.createdAt)}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
