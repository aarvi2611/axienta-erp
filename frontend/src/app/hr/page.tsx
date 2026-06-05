"use client";
import React, { useState } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { LeaveRequest } from "@/types";
import { formatDate } from "@/lib/utils";

const demoLeaves: LeaveRequest[] = [
  { id: "1", userId: "u1", userName: "Rahul Sharma", type: "casual", startDate: "2024-10-15", endDate: "2024-10-16", reason: "Family function", status: "pending", createdAt: new Date().toISOString() },
  { id: "2", userId: "u2", userName: "Priya Patel", type: "sick", startDate: "2024-10-10", endDate: "2024-10-11", reason: "Not feeling well", status: "approved", approvedBy: "CEO", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "3", userId: "u3", userName: "Amit Kumar", type: "earned", startDate: "2024-10-20", endDate: "2024-10-25", reason: "Vacation trip", status: "pending", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "4", userId: "u4", userName: "Sneha Gupta", type: "casual", startDate: "2024-10-05", endDate: "2024-10-05", reason: "Personal work", status: "rejected", createdAt: new Date(Date.now() - 604800000).toISOString() },
];

const salaryData = [
  { id: "1", name: "Arjun Malhotra", role: "CEO", department: "Management", salary: 250000, status: "paid" },
  { id: "2", name: "Sunita Verma", role: "Admin", department: "Administration", salary: 80000, status: "paid" },
  { id: "3", name: "Rahul Sharma", role: "Team Manager", department: "Sales", salary: 65000, status: "paid" },
  { id: "4", name: "Priya Patel", role: "Sales Executive", department: "Sales", salary: 45000, status: "pending" },
  { id: "5", name: "Amit Kumar", role: "Calling Executive", department: "Calling", salary: 35000, status: "paid" },
  { id: "6", name: "Sneha Gupta", role: "Data Scraper", department: "Data", salary: 40000, status: "pending" },
  { id: "7", name: "Vikram Singh", role: "Operations", department: "Operations", salary: 50000, status: "paid" },
  { id: "8", name: "Meena Reddy", role: "HR", department: "HR", salary: 55000, status: "paid" },
];

export default function HRPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<"leaves" | "salary" | "employees">("leaves");
  const [leaves, setLeaves] = useState(demoLeaves);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleLeaveAction = (id: string, action: "approved" | "rejected") => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
  };

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
            <Select label="Leave Type">
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Reason</label>
              <Textarea placeholder="Reason for leave..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLeaveModal(false)}>Cancel</Button>
            <Button onClick={() => setShowLeaveModal(false)}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
