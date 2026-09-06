"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  UserCog, DollarSign, Calendar, Clock, FileText, Users,
  CheckCircle, XCircle, AlertCircle, Plus, Download, FileSignature
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { LeaveRequest, User } from "@/types";
import { formatDate } from "@/lib/utils";

export default function HRPage() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<"leaves" | "salary" | "employees">("leaves");
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState<"casual" | "sick" | "earned" | "unpaid">("casual");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const q = query(collection(db, "leaves"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaveRequest)));
        } else {
          setLeaves([]);
        }
      }, () => {
        setLeaves([]);
      });
      return () => unsub();
    } catch {
      setLeaves([]);
    }
  }, []);

  useEffect(() => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setEmployees(snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
        } else {
          setEmployees([]);
        }
      }, () => {});
      return () => unsub();
    } catch {}
  }, []);

  const handleLeaveAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "leaves", id), {
        status: action,
        approvedBy: user?.displayName || "HR Admin",
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Leave update error:", err);
    }
  };

  const handleCreateLeave = async () => {
    if (!startDate || !endDate || !reason.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "leaves"), {
        userId: user?.uid || "u1",
        userName: user?.displayName || "Employee",
        type: leaveType,
        startDate,
        endDate,
        reason,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      setStartDate("");
      setEndDate("");
      setReason("");
      setShowLeaveModal(false);
    } catch (err) {
      console.error("Failed to request leave:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const salaryData = employees.map((emp) => ({
    id: emp.uid,
    name: emp.displayName,
    role: emp.role,
    department: emp.department || "General",
    salary: emp.role === "ceo" ? 250000 : emp.role === "admin" ? 80000 : 50000,
    status: emp.isActive ? "Active" : "On Hold",
  }));

  const leaveColumns = [
    {
      key: "userName", label: "Employee", sortable: true,
      render: (row: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.userName} size="sm" />
          <span className="font-medium dark:text-white">{row.userName}</span>
        </div>
      ),
    },
    {
      key: "type", label: "Type",
      render: (row: LeaveRequest) => <Badge variant="secondary" className="capitalize">{row.type}</Badge>,
    },
    {
      key: "startDate", label: "Duration",
      render: (row: LeaveRequest) => <span className="text-xs">{formatDate(row.startDate)} - {formatDate(row.endDate)}</span>,
    },
    { key: "reason", label: "Reason" },
    {
      key: "status", label: "Status",
      render: (row: LeaveRequest) => (
        <Badge variant={row.status === "approved" ? "success" : row.status === "rejected" ? "destructive" : "warning"}>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (row: LeaveRequest) => row.status === "pending" ? (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => handleLeaveAction(row.id, "approved")} className="text-emerald-500 hover:text-emerald-700 p-1 h-auto">
            <CheckCircle className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleLeaveAction(row.id, "rejected")} className="text-red-500 hover:text-red-700 p-1 h-auto">
            <XCircle className="w-4 h-4" />
          </Button>
        </div>
      ) : null,
    },
  ];

  const salaryColumns = [
    {
      key: "name", label: "Employee", sortable: true,
      render: (row: any) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name} size="sm" />
          <div>
            <p className="font-medium dark:text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.role}</p>
          </div>
        </div>
      ),
    },
    { key: "department", label: "Department", sortable: true },
    {
      key: "salary", label: "Salary", sortable: true,
      render: (row: any) => <span className="font-semibold text-[#0F2557] dark:text-[#D4A843]">₹{row.salary.toLocaleString()}</span>,
    },
    {
      key: "status", label: "Status",
      render: (row: any) => <Badge variant={row.status === "paid" ? "success" : "warning"}>{row.status}</Badge>,
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="HR Module"
        description="Leave management, salary records, and employee administration"
        icon={UserCog}
        actions={
          <>
            {hasPermission("letters") && (
              <Button asChild variant="outline">
                <Link href="/letters">
                  <FileSignature className="w-4 h-4 mr-1" /> Letters
                </Link>
              </Button>
            )}
            <Button onClick={() => setShowLeaveModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Request Leave
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Employees" value={salaryData.length} icon={Users} color="blue" />
        <StatsCard title="Pending Leaves" value={leaves.filter(l => l.status === "pending").length} icon={Clock} color="gold" delay={0.1} />
        <StatsCard title="Total Payroll" value={`₹${(salaryData.reduce((a, b) => a + b.salary, 0) / 100000).toFixed(1)}L`} icon={DollarSign} color="green" delay={0.2} />
        <StatsCard title="Salary Pending" value={salaryData.filter(s => s.status === "pending").length} icon={AlertCircle} color="red" delay={0.3} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "leaves", label: "Leave Requests", icon: Calendar },
          { key: "salary", label: "Salary Records", icon: DollarSign },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? "bg-[#0F2557] text-white shadow-md" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "leaves" && (
        <DataTable columns={leaveColumns} data={leaves} searchable searchKeys={["userName", "reason"]} />
      )}

      {activeTab === "salary" && (
        <DataTable columns={salaryColumns} data={salaryData} searchable searchKeys={["name", "department"]} />
      )}

      {/* Leave Request Modal */}
      <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Select
              label="Leave Type"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason</label>
              <Textarea
                placeholder="Reason for leave..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
            <Button onClick={handleCreateLeave} disabled={!startDate || !endDate || !reason.trim() || submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
