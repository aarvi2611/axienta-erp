"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Phone, PhoneCall, PhoneOff, PhoneMissed, Clock, MessageSquare,
  Calendar, User, Plus, CheckCircle, AlertCircle, Send
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
import { collection, query, onSnapshot, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";

const whatsappTemplates = [
  { id: 1, name: "Introduction", message: "Hello! I'm calling from Axenta Business Consulting. We offer premium business solutions tailored to your needs. Would you be interested in learning more?" },
  { id: 2, name: "Follow-Up", message: "Hi! This is a follow-up from our previous conversation. We'd love to schedule a meeting to discuss how we can help your business grow." },
  { id: 3, name: "Quotation", message: "Dear Sir/Madam, Please find attached our quotation for the discussed services. Feel free to reach out if you have any questions." },
];

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
  const [showLogModal, setShowLogModal] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [leadName, setLeadName] = useState("");
  const [callStatus, setCallStatus] = useState("connected");
  const [duration, setDuration] = useState("0");
  const [response, setResponse] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [notes, setNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, "call_logs"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setCallLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as CallLog)));
        } else {
          setCallLogs([]);
        }
      }, () => {
        setCallLogs([]);
      });
      return () => unsub();
    } catch {
      setCallLogs([]);
    }
  }, []);

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
      setShowLogModal(false);
    } catch (err) {
      console.error("Save call log error:", err);
    } finally {
      setSavingLog(false);
    }
  };

  const stats = {
    total: callLogs.length,
    connected: callLogs.filter(c => c.status === "connected").length,
    missed: callLogs.filter(c => c.status === "no_answer").length,
    callbacks: callLogs.filter(c => c.status === "callback").length,
  };

  const columns = [
    {
      key: "leadName", label: "Lead", sortable: true,
      render: (row: CallLog) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.leadName} size="sm" />
          <span className="font-medium dark:text-white">{row.leadName}</span>
        </div>
      ),
    },
    {
      key: "calledByName", label: "Called By", sortable: true,
    },
    {
      key: "status", label: "Status",
      render: (row: CallLog) => statusBadge(row.status),
    },
    {
      key: "duration", label: "Duration",
      render: (row: CallLog) => row.duration ? `${Math.floor(row.duration / 60)}m ${row.duration % 60}s` : "-",
    },
    {
      key: "response", label: "Response",
      render: (row: CallLog) => <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{row.response || "No response"}</span>,
    },
    {
      key: "followUpDate", label: "Follow-Up",
      render: (row: CallLog) => row.followUpDate ? (
        <Badge variant="warning" className="text-[10px]"><Calendar className="w-2.5 h-2.5 mr-0.5" />{new Date(row.followUpDate).toLocaleDateString()}</Badge>
      ) : "-",
    },
    {
      key: "createdAt", label: "Time",
      render: (row: CallLog) => <span className="text-xs">{formatDateTime(row.createdAt)}</span>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Calling Panel"
        description="Manage calls, follow-ups, and communication"
        icon={Phone}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowWhatsApp(true)}>
              <MessageSquare className="w-4 h-4 mr-1" /> WhatsApp
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

      {/* Follow-up Reminders */}
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
                <Button size="sm" variant="outline" className="flex-shrink-0">
                  <Phone className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={callLogs} searchable searchKeys={["leadName", "calledByName"]} />

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

      {/* WhatsApp Templates */}
      <Dialog open={showWhatsApp} onOpenChange={setShowWhatsApp}>
        <DialogContent>
          <DialogHeader><DialogTitle>WhatsApp Templates</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {whatsappTemplates.map(t => (
              <div key={t.id} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm dark:text-white">{t.name}</h4>
                  <Button size="sm" variant="gold">
                    <Send className="w-3 h-3 mr-1" /> Send
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.message}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
