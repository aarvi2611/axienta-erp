"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Phone, PhoneCall, PhoneOff, PhoneMissed, Clock, MessageSquare,
  Calendar, User, Plus, AlertCircle, Send, Upload, Edit, Trash2, Save
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { CallLog } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { collection, query, onSnapshot, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";

const statusBadge = (status: string) => {
  switch (status) {
    case "connected": return <Badge variant="success"><PhoneCall className="w-3 h-3 mr-1" />Connected</Badge>;
    case "no_answer": return <Badge variant="warning"><PhoneMissed className="w-3 h-3 mr-1" />No Answer</Badge>;
    case "busy": return <Badge variant="destructive"><PhoneOff className="w-3 h-3 mr-1" />Busy</Badge>;
    case "wrong_number": return <Badge variant="destructive">Wrong Number</Badge>;
    case "callback": return <Badge variant="info"><Clock className="w-3 h-3 mr-1" />Callback</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export default function CallingPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"domestic" | "international" | "history">("domestic");

  // Call Logs state
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [callStatus, setCallStatus] = useState("connected");
  const [duration, setDuration] = useState("0");
  const [response, setResponse] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  // Calling Leads state
  const [callingLeads, setCallingLeads] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp Templates state
  const [whatsappTemplates, setWhatsappTemplates] = useState<any[]>([]);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({ name: "", message: "" });
  const [selectedLeadPhone, setSelectedLeadPhone] = useState("");
  const [selectedLeadName, setSelectedLeadName] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  useEffect(() => {
    // 1. Fetch Call Logs
    const qLogs = query(collection(db, "call_logs"), orderBy("createdAt", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      setCallLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CallLog)));
    });

    // 2. Fetch Calling Leads
    const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubLeads = onSnapshot(qLeads, (snap) => {
      let leads = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (user && !["admin", "ceo", "head_manager"].includes(user.role)) {
        leads = leads.filter(l => l.assignedTo === user.uid || (l.assignedToName && user.displayName && l.assignedToName.toLowerCase().includes(user.displayName.toLowerCase())));
      }
      setCallingLeads(leads);
    });

    // 3. Fetch WhatsApp Templates
    const unsubTemplates = onSnapshot(doc(db, "operations", "whatsapp_templates"), (snap) => {
      if (snap.exists() && snap.data().templates) {
        setWhatsappTemplates(snap.data().templates);
      } else {
        // Fallback static templates if none
        setWhatsappTemplates([
          { id: "1", name: "Introduction", message: "Hello [Name]! I'm calling from Axenta Business Consulting. We offer premium business solutions tailored to your needs. Would you be interested in learning more?" },
          { id: "2", name: "Follow-Up", message: "Hi [Name]! This is a follow-up from our previous conversation. We'd love to schedule a meeting to discuss how we can help your business grow." }
        ]);
      }
    });

    return () => {
      unsubLogs();
      unsubLeads();
      unsubTemplates();
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileNameWithoutExt = file.name.replace(/\\.[^/.]+$/, "");

    setImporting(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      let allLeads: any[] = [];
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        let headerRowIndex = -1;
        let headers: string[] = [];

        // Find the actual header row (some sheets have titles on first few rows)
        for (let i = 0; i < Math.min(20, rows.length); i++) {
          const rowStr = rows[i].join(" ").toLowerCase();
          if (rowStr.includes("business name") || rowStr.includes("lead name") || rowStr.includes("contact no") || rowStr.includes("whatsapp")) {
            headerRowIndex = i;
            headers = rows[i].map(h => String(h || "").trim());
            break;
          }
        }

        if (headerRowIndex !== -1) {
          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const rowData = rows[i];
            const leadObj: any = { _sourceSheet: sheetName };
            headers.forEach((h, index) => {
              if (h) leadObj[h] = rowData[index];
            });
            allLeads.push(leadObj);
          }
        } else {
          // Fallback if no specific header matches
          const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          allLeads = allLeads.concat(jsonData.map(r => ({ ...r, _sourceSheet: sheetName })));
        }
      });

      if (allLeads.length > 0) {
        let count = 0;
        let skipped = 0;
        
        // Load existing phones and names for deduplication
        const existingPhones = new Set(callingLeads.map(l => String(l.phone || "").trim().replace(/\D/g, '')).filter(Boolean));
        const existingNames = new Set(callingLeads.map(l => String(l.name || "").trim().toLowerCase()).filter(Boolean));

        const validLeads: any[] = [];
        
        allLeads.forEach((row) => {
          let rawName = "";
          let rawPhone = "";
          let rawEmail = "";
          let rawCompany = "";
          let rawCity = "";
          let rawCountry = "";

          Object.keys(row).forEach(key => {
             const lowerKey = key.toLowerCase();
             if (lowerKey.includes("business name") || lowerKey === "name" || lowerKey.includes("lead name") || lowerKey.includes("client")) {
                 rawName = row[key];
             } else if (lowerKey.includes("contact no") || lowerKey.includes("whatsapp") || lowerKey === "phone" || lowerKey.includes("mobile") || lowerKey.includes("number")) {
                 rawPhone = row[key];
             } else if (lowerKey === "email") {
                 rawEmail = row[key];
             } else if (lowerKey.includes("company") || lowerKey.includes("industry sector") || lowerKey.includes("industry category")) {
                 rawCompany = row[key];
             } else if (lowerKey.includes("city") || lowerKey.includes("hub")) {
                 rawCity = row[key];
             } else if (lowerKey.includes("country")) {
                 rawCountry = row[key];
             }
          });
          
          const name = String(rawName).trim();
          const phoneStr = String(rawPhone).trim();
          const cleanPhone = phoneStr.replace(/\D/g, '');
          const isInternational = String(row._sourceSheet || "").toLowerCase().includes("international") || (rawCountry && !String(rawCountry).toLowerCase().includes("india"));
          
          if (name || phoneStr) {
             if (cleanPhone && existingPhones.has(cleanPhone)) {
               skipped++;
               return;
             }
             if (!cleanPhone && name && existingNames.has(name.toLowerCase())) {
               skipped++;
               return;
             }

             if (cleanPhone) existingPhones.add(cleanPhone);
             if (name) existingNames.add(name.toLowerCase());
             
             validLeads.push({
               name: name || "Unknown Lead",
               phone: phoneStr,
               email: String(rawEmail).trim(),
               company: String(rawCompany).trim() + (rawCity ? ` (${rawCity})` : ""),
               country: String(rawCountry).trim() || (isInternational ? "International" : "India"),
               leadType: isInternational ? "international" : "domestic",
               status: "new",
               importedAt: new Date().toISOString(),
               createdAt: new Date().toISOString(),
               assignedTo: user?.uid,
               assignedToName: fileNameWithoutExt || user?.displayName || "Executive",
               whatsappCount: 0,
             });
          }
        });

        // Chunk into 500 max per batch for Firestore
        const chunks = [];
        for (let i = 0; i < validLeads.length; i += 500) {
          chunks.push(validLeads.slice(i, i + 500));
        }

        for (const chunk of chunks) {
          const batch = writeBatch(db);
          chunk.forEach((lead) => {
             const docRef = doc(collection(db, "leads"));
             batch.set(docRef, lead);
             count++;
          });
          await batch.commit();
        }

        alert(`Successfully imported ${count} new leads! (${skipped} duplicates skipped)`);
      } else {
         alert("No data found in Excel file.");
      }
    } catch (error: any) {
      console.error("Import error:", error);
      alert("Error importing Excel file: " + (error.message || error.toString()));
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveLog = async () => {
    if (!leadName.trim()) return;
    setSavingLog(true);
    try {
      await addDoc(collection(db, "call_logs"), {
        leadName,
        calledBy: user?.uid || "u1",
        calledByName: user?.displayName || "Executive",
        duration: parseInt(duration) || 0,
        status: callStatus,
        response,
        notes,
        followUpDate: followUpDate || "",
        createdAt: new Date().toISOString(),
      });
      setLeadName("");
      setDuration("0");
      setResponse("");
      setFollowUpDate("");
      setNotes("");
      if (selectedLeadId) {
        await updateDoc(doc(db, "leads", selectedLeadId), {
          status: callStatus === "interested" ? "interested" : callStatus,
          remarks: notes
        });
      }
      setShowLogModal(false);
    } catch (err) {
      console.error("Save call log error:", err);
    } finally {
      setSavingLog(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.message) return;
    try {
      let updatedTemplates = [...whatsappTemplates];
      if (editingTemplate) {
        updatedTemplates = updatedTemplates.map(t => 
           t.id === editingTemplate.id ? { ...t, name: templateForm.name, message: templateForm.message } : t
        );
      } else {
        updatedTemplates.push({
           id: Date.now().toString(),
           name: templateForm.name,
           message: templateForm.message
        });
      }
      
      await setDoc(doc(db, "operations", "whatsapp_templates"), {
        templates: updatedTemplates
      });
      
      setShowTemplateModal(false);
      setEditingTemplate(null);
      setTemplateForm({ name: "", message: "" });
    } catch (err: any) {
      console.error("Save template error:", err);
      alert("Error saving template: " + (err.message || err.toString()));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        const updatedTemplates = whatsappTemplates.filter(t => t.id !== id);
        await setDoc(doc(db, "operations", "whatsapp_templates"), {
          templates: updatedTemplates
        });
      } catch (err: any) {
        console.error("Delete template error:", err);
        alert("Error deleting template: " + (err.message || err.toString()));
      }
    }
  };

  const openWhatsApp = async (template: any) => {
    let msg = template.message;
    if (selectedLeadName) {
      msg = msg.replace(/\[Name\]/g, selectedLeadName).replace(/{name}/g, selectedLeadName);
    }
    const cleanPhone = String(selectedLeadPhone).replace(/\D/g, "");
    const url = "https://wa.me/" + cleanPhone + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank");
    setShowWhatsApp(false);
    
    if (selectedLeadId) {
       const lead = callingLeads.find(l => l.id === selectedLeadId);
       if (lead) {
          const newCount = (lead.whatsappCount || 0) + 1;
          await updateDoc(doc(db, "leads", selectedLeadId), { whatsappCount: newCount });
       }
    }
  };

  const stats = {
    total: callLogs.length,
    connected: callLogs.filter(c => c.status === "connected").length,
    missed: callLogs.filter(c => c.status === "no_answer").length,
    callbacks: callLogs.filter(c => c.status === "callback").length,
  };

  const logColumns = [
    {
      key: "leadName", label: "Lead", sortable: true,
      render: (row: CallLog) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.leadName} size="sm" />
          <span className="font-medium dark:text-white">{row.leadName}</span>
        </div>
      ),
    },
    { key: "calledByName", label: "Called By", sortable: true },
    { key: "status", label: "Status", render: (row: CallLog) => statusBadge(row.status) },
    { key: "duration", label: "Duration", render: (row: CallLog) => row.duration ? Math.floor(row.duration / 60) + "m " + (row.duration % 60) + "s" : "-" },
    { key: "response", label: "Response", render: (row: CallLog) => <span className="text-xs text-slate-500 line-clamp-1">{row.response || "No response"}</span> },
    {
      key: "followUpDate", label: "Follow-Up",
      render: (row: CallLog) => row.followUpDate ? (
        <Badge variant="warning" className="text-[10px]"><Calendar className="w-2.5 h-2.5 mr-0.5" />{new Date(row.followUpDate).toLocaleDateString()}</Badge>
      ) : "-",
    },
    { key: "createdAt", label: "Time", render: (row: CallLog) => <span className="text-xs">{formatDateTime(row.createdAt)}</span> },
  ];

  const leadColumns = [
    {
      key: "name", label: "Lead Name", sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name || "Unknown"} size="sm" />
          <div>
            <div className="font-medium dark:text-white">{row.name || "Unknown"}</div>
            {row.company && <div className="text-[10px] text-slate-500">{row.company}</div>}
          </div>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (row: any) => <span className="text-sm">{row.phone || "-"}</span> },
    { key: "email", label: "Email", render: (row: any) => <span className="text-sm">{row.email || "-"}</span> },
    { key: "assignedToName", label: "Executive", render: (row: any) => <span className="text-xs">{row.assignedToName || "-"}</span> },
      { key: "remarks", label: "Remarks", render: (row: any) => <span className="text-xs truncate max-w-[120px] inline-block" title={row.remarks}>{row.remarks || "-"}</span> },
      { key: "createdAt", label: "Imported On", render: (row: any) => <span className="text-xs">{formatDateTime(row.createdAt)}</span> },
    {
      key: "actions", label: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8" onClick={() => {
            setLeadName(row.name || "");
            setSelectedLeadId(row.id);
            setShowLogModal(true);
          }}>
            <Phone className="w-3.5 h-3.5 mr-1" /> Call
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => {
            setSelectedLeadPhone(row.phone || "");
            setSelectedLeadName(row.name || "");
            setSelectedLeadId(row.id);
            setShowWhatsApp(true);
          }}>
            <MessageSquare className="w-3.5 h-3.5 mr-1" /> WA
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={async () => {
            if (confirm("Are you sure you want to delete this lead?")) {
              try {
                await deleteDoc(doc(db, "leads", row.id));
              } catch (err) {
                console.error("Error deleting lead:", err);
                alert("Failed to delete lead.");
              }
            }
          }}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Calling Panel"
        description="Manage leads, calls, follow-ups, and communication"
        icon={Phone}
        actions={
          <div className="flex gap-2">
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload className="w-4 h-4 mr-1" /> {importing ? "Importing..." : "Import Excel"}
            </Button>
            <Button variant="outline" onClick={() => {
              setSelectedLeadPhone("");
              setSelectedLeadName("");
              setShowWhatsApp(true);
            }}>
              <MessageSquare className="w-4 h-4 mr-1" /> WhatsApp Templates
            </Button>
            <Button onClick={() => setShowLogModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Log Call
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Calls" value={stats.total} icon={Phone} color="blue" />
        <StatsCard title="Connected" value={stats.connected} icon={PhoneCall} color="green" delay={0.1} />
        <StatsCard title="Missed" value={stats.missed} icon={PhoneMissed} color="red" delay={0.2} />
        <StatsCard title="Callbacks" value={stats.callbacks} icon={Clock} color="gold" delay={0.3} />
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "domestic" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("domestic")}
        >
          Domestic Leads ({callingLeads.filter(l => l.leadType !== "international").length})
        </button>
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "international" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("international")}
        >
          International Leads ({callingLeads.filter(l => l.leadType === "international").length})
        </button>
        <button
          className={"px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap " + (activeTab === "history" ? "border-[#0F2557] text-[#0F2557] dark:border-[#D4A843] dark:text-[#D4A843]" : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
          onClick={() => setActiveTab("history")}
        >
          Call History ({callLogs.length})
        </button>
      </div>

      {activeTab === "domestic" && (
        <DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType !== "international")} searchable searchKeys={["name", "phone", "email"]} rowClassName={(row) => { if (row.status === "interested") return "bg-amber-50 dark:bg-amber-900/20"; if (row.whatsappCount >= 2) return "bg-green-100 dark:bg-green-900/30"; if (row.whatsappCount === 1) return "bg-emerald-50 dark:bg-emerald-900/20"; return ""; }} />
      )}
      
      {activeTab === "international" && (
        <DataTable columns={leadColumns} data={callingLeads.filter(l => l.leadType === "international")} searchable searchKeys={["name", "phone", "email"]} rowClassName={(row) => { if (row.status === "interested") return "bg-amber-50 dark:bg-amber-900/20"; if (row.whatsappCount >= 2) return "bg-green-100 dark:bg-green-900/30"; if (row.whatsappCount === 1) return "bg-emerald-50 dark:bg-emerald-900/20"; return ""; }} />
      )}

      {activeTab === "history" && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Follow-up Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {callLogs.filter(c => c.followUpDate).slice(0, 3).map(log => (
                  <div key={log.id} className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
                    <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-white truncate">{log.leadName}</p>
                      <p className="text-xs text-slate-500">{new Date(log.followUpDate!).toLocaleDateString()}</p>
                    </div>
                    <Button size="sm" variant="outline" className="flex-shrink-0" onClick={() => {
                      setLeadName(log.leadName);
                      setShowLogModal(true);
                    }}>
                      <Phone className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <DataTable columns={logColumns} data={callLogs} searchable searchKeys={["leadName", "calledByName"]} />
        </>
      )}

      {/* Log Call Modal */}
      <Dialog open={showLogModal} onOpenChange={setShowLogModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log New Call</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Lead / Client Name *</label>
              <Input
                placeholder="Search or enter lead name"
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Call Status"
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
              >
                <option value="connected">Connected</option>
                  <option value="interested">Interested</option>
                <option value="no_answer">No Answer</option>
                <option value="busy">Busy</option>
                <option value="wrong_number">Wrong Number</option>
                <option value="callback">Callback</option>
              </Select>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Duration (seconds)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Client Response</label>
              <Textarea
                placeholder="What did the client say?"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Follow-up Date</label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogModal(false)}>Cancel</Button>
            <Button onClick={handleSaveLog} disabled={!leadName.trim() || savingLog}>
              {savingLog ? "Saving..." : "Save Call Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Templates Selection & Sending */}
      <Dialog open={showWhatsApp} onOpenChange={setShowWhatsApp}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>WhatsApp Templates</span>
              <Button size="sm" onClick={() => {
                setEditingTemplate(null);
                setTemplateForm({ name: "", message: "" });
                setShowTemplateModal(true);
              }}>
                <Plus className="w-3.5 h-3.5 mr-1" /> New Template
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {whatsappTemplates.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm dark:text-white">{t.name}</h4>
                  <div className="flex items-center gap-2">
                    {selectedLeadPhone && (
                      <Button size="sm" variant="gold" onClick={() => openWhatsApp(t)}>
                        <Send className="w-3 h-3 mr-1" /> Send
                      </Button>
                    )}
                    <Button size="icon" variant="outline" className="w-7 h-7" onClick={() => {
                      setEditingTemplate(t);
                      setTemplateForm({ name: t.name, message: t.message });
                      setShowTemplateModal(true);
                    }}>
                      <Edit className="w-3.5 h-3.5 text-blue-600" />
                    </Button>
                    {t.id.length > 2 && ( 
                      <Button size="icon" variant="outline" className="w-7 h-7 text-red-500 hover:text-red-600" onClick={() => handleDeleteTemplate(t.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{t.message}</p>
              </div>
            ))}
            {whatsappTemplates.length === 0 && (
              <div className="text-center p-6 text-sm text-slate-500">
                No templates found. Create one to get started!
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit/Add Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingTemplate ? "Edit Template" : "New Template"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g. Follow up 1"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Message Content</label>
              <Textarea
                placeholder="Use [Name] to automatically replace with lead's name"
                className="min-h-[120px]"
                value={templateForm.message}
                onChange={(e) => setTemplateForm({ ...templateForm, message: e.target.value })}
              />
              <p className="text-[10px] text-slate-500">Hint: Use [Name] in your message to personalize it.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
            <Button onClick={handleSaveTemplate} disabled={!templateForm.name || !templateForm.message}>
              <Save className="w-4 h-4 mr-1" /> Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </DashboardLayout>
  );
}
