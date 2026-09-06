"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, CheckCircle, Clock, Users, FileText, Plus,
  Eye, Calendar, Search, IndianRupee,
  AlertTriangle, RefreshCw, Layers
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

export interface OperationItem {
  id: string;
  sourceCollection: "operations" | "projects";
  clientName: string;
  projectName: string;
  serviceType: string;
  details?: string;
  description?: string;
  status: string;
  normalizedStatus: "in_progress" | "completed" | "on_hold" | "review" | "onboarding";
  progress: number;
  assignedTo: string;
  assignedName: string;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  expenses: number;
  priority: string;
  notes?: string;
  taskId?: string;
  leadId?: string;
  deliverables: number;
  completedDeliverables: number;
}

interface EmployeeOption {
  uid: string;
  name: string;
  role: string;
  department: string;
}

function normalizeStatus(raw?: string): OperationItem["normalizedStatus"] {
  if (!raw) return "in_progress";
  const s = raw.toLowerCase().trim();
  if (s.includes("complete") || s.includes("closed") || s.includes("delivered") || s.includes("done")) {
    return "completed";
  }
  if (s.includes("hold") || s.includes("pause") || s.includes("block")) {
    return "on_hold";
  }
  if (s.includes("review") || s.includes("revision") || s.includes("testing")) {
    return "review";
  }
  if (s.includes("onboard") || s.includes("intake") || s.includes("init")) {
    return "onboarding";
  }
  return "in_progress";
}

function formatProjectDate(val: any): string {
  if (!val) return "N/A";
  if (typeof val === "object" && val.seconds) {
    return new Date(val.seconds * 1000).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "string") {
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return val;
  }
  return String(val);
}

const statusConfig = {
  onboarding: { label: "Onboarding", variant: "info" as const, color: "bg-blue-500", text: "text-blue-600" },
  in_progress: { label: "In Progress", variant: "warning" as const, color: "bg-amber-500", text: "text-amber-600" },
  review: { label: "Under Review", variant: "secondary" as const, color: "bg-purple-500", text: "text-purple-600" },
  on_hold: { label: "On Hold", variant: "destructive" as const, color: "bg-rose-500", text: "text-rose-600" },
  completed: { label: "Completed", variant: "success" as const, color: "bg-emerald-500", text: "text-emerald-600" },
};

export default function OperationsPage() {
  const [operations, setOperations] = useState<OperationItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<OperationItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Edit / Quick update state
  const [editForm, setEditForm] = useState<{
    status: string;
    progress: number;
    spent: number;
    notes: string;
  }>({
    status: "In Progress",
    progress: 0,
    spent: 0,
    notes: "",
  });

  // Create form state
  const [newProject, setNewProject] = useState({
    clientName: "",
    projectName: "",
    serviceType: "Assigned Work",
    details: "",
    description: "",
    status: "In Progress",
    progress: 0,
    assignedName: "",
    assignedTo: "",
    priority: "High",
    budget: 0,
    spent: 0,
    startDate: new Date().toISOString().slice(0, 10),
    deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    deliverables: 5,
    completedDeliverables: 0,
    notes: "",
  });

  // Load Real Data from Firebase
  useEffect(() => {
    setLoading(true);

    let opsItems: OperationItem[] = [];
    let projectsItems: OperationItem[] = [];

    const mergeAndSet = () => {
      // Operations take priority over projects with same ID
      const map = new Map<string, OperationItem>();
      projectsItems.forEach((p) => map.set(p.id, p));
      opsItems.forEach((o) => map.set(o.id, o));
      setOperations(Array.from(map.values()));
      setLoading(false);
    };

    // 1. Subscribe to 'operations' collection (primary real collection)
    const unsubOps = onSnapshot(
      collection(db, "operations"),
      (snapshot) => {
        opsItems = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const rawStatus = d.status || (d.progress === 100 ? "Completed" : "In Progress");
          return {
            id: docSnap.id,
            sourceCollection: "operations" as const,
            clientName: d.clientName || d.projectName || "Client Business",
            projectName: d.projectName || d.serviceType || d.details || d.clientName || "Project",
            serviceType: d.serviceType || d.details || "General",
            details: d.details || "",
            description: d.description || d.details || "",
            status: rawStatus,
            normalizedStatus: normalizeStatus(rawStatus),
            progress: typeof d.progress === "number" ? d.progress : (rawStatus.toLowerCase().includes("complete") ? 100 : 0),
            assignedTo: d.assignedTo || "",
            assignedName: d.assignedName || d.assignedTo || "Operations Team",
            startDate: formatProjectDate(d.startDate),
            deadline: formatProjectDate(d.deadline),
            budget: Number(d.budget || 0),
            spent: Number(d.spent || d.expenses || 0),
            expenses: Number(d.expenses || d.spent || 0),
            priority: d.priority || "Medium",
            notes: d.notes || "",
            taskId: d.taskId || "",
            leadId: d.leadId || "",
            deliverables: d.deliverables ?? (d.progress === 100 ? 1 : 3),
            completedDeliverables: d.completedDeliverables ?? (d.progress === 100 ? 1 : 0),
          };
        });
        mergeAndSet();
      },
      (err) => {
        console.warn("Could not read operations collection:", err.message);
        setLoading(false);
      }
    );

    // 2. Also listen to 'projects' collection (fallback/legacy)
    const unsubProjects = onSnapshot(
      collection(db, "projects"),
      (snapshot) => {
        projectsItems = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const rawStatus = d.status || "In Progress";
          return {
            id: docSnap.id,
            sourceCollection: "projects" as const,
            clientName: d.clientName || d.projectName || "Client",
            projectName: d.projectName || "Project",
            serviceType: d.serviceType || "Project Delivery",
            details: d.details || "",
            description: d.description || "",
            status: rawStatus,
            normalizedStatus: normalizeStatus(rawStatus),
            progress: typeof d.progress === "number" ? d.progress : 0,
            assignedTo: d.assignedTo || "",
            assignedName: d.assignedName || d.assignedTo || "Operations",
            startDate: formatProjectDate(d.startDate),
            deadline: formatProjectDate(d.deadline),
            budget: Number(d.budget || 0),
            spent: Number(d.spent || 0),
            expenses: Number(d.expenses || 0),
            priority: d.priority || "Medium",
            notes: d.notes || "",
            taskId: d.taskId || "",
            leadId: d.leadId || "",
            deliverables: d.deliverables ?? 1,
            completedDeliverables: d.completedDeliverables ?? 0,
          };
        });
        mergeAndSet();
      },
      () => {
        mergeAndSet();
      }
    );

    // 3. Subscribe to users for employee assignment dropdown
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      const emps: EmployeeOption[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        emps.push({
          uid: docSnap.id,
          name: d.displayName || d.name || d.email || "Staff Member",
          role: d.role || "Executive",
          department: d.department || "Operations",
        });
      });
      setEmployees(emps);
    });

    return () => {
      unsubOps();
      unsubProjects();
      unsubUsers();
    };
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.projectName || !newProject.clientName) {
      alert("Please enter both Client Name and Project Title");
      return;
    }

    try {
      await addDoc(collection(db, "operations"), {
        clientName: newProject.clientName,
        projectName: newProject.projectName,
        serviceType: newProject.serviceType || "Assigned Work",
        details: newProject.details || newProject.projectName,
        description: newProject.description || "",
        status: newProject.status,
        progress: Number(newProject.progress) || 0,
        assignedName: newProject.assignedName || "Operations Team",
        assignedTo: newProject.assignedTo || "",
        priority: newProject.priority || "Medium",
        budget: Number(newProject.budget) || 0,
        spent: Number(newProject.spent) || 0,
        expenses: Number(newProject.spent) || 0,
        startDate: newProject.startDate,
        deadline: newProject.deadline,
        deliverables: Number(newProject.deliverables) || 1,
        completedDeliverables: Number(newProject.completedDeliverables) || 0,
        notes: newProject.notes || "",
        createdAt: new Date().toISOString(),
        source: "Operations Panel",
      });

      setShowAddModal(false);
      setNewProject({
        clientName: "",
        projectName: "",
        serviceType: "Assigned Work",
        details: "",
        description: "",
        status: "In Progress",
        progress: 0,
        assignedName: "",
        assignedTo: "",
        priority: "High",
        budget: 0,
        spent: 0,
        startDate: new Date().toISOString().slice(0, 10),
        deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        deliverables: 5,
        completedDeliverables: 0,
        notes: "",
      });
    } catch (err: any) {
      alert("Failed to create operation project: " + err.message);
    }
  };

  const handleOpenEdit = (op: OperationItem) => {
    setSelectedOperation(op);
    setEditForm({
      status: op.status,
      progress: op.progress,
      spent: op.spent,
      notes: op.notes || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedOperation) return;
    try {
      const colName = selectedOperation.sourceCollection;
      const ref = doc(db, colName, selectedOperation.id);
      await updateDoc(ref, {
        status: editForm.status,
        progress: Number(editForm.progress) || 0,
        spent: Number(editForm.spent) || 0,
        expenses: Number(editForm.spent) || 0,
        notes: editForm.notes,
        updatedAt: new Date().toISOString(),
      });
      setShowEditModal(false);
    } catch (err: any) {
      alert("Failed to update: " + err.message);
    }
  };

  const handleDelete = async (op: OperationItem) => {
    if (!confirm(`Are you sure you want to delete "${op.clientName}"?`)) return;
    try {
      await deleteDoc(doc(db, op.sourceCollection, op.id));
      setShowDetailModal(false);
      setShowEditModal(false);
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  // Filter and Search logic
  const filtered = operations.filter((item) => {
    const matchesFilter =
      filter === "all" ? true : item.normalizedStatus === filter;

    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      item.clientName.toLowerCase().includes(query) ||
      item.projectName.toLowerCase().includes(query) ||
      item.serviceType.toLowerCase().includes(query) ||
      item.assignedName.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const totalProjects = operations.length;
  const inProgressCount = operations.filter((p) => p.normalizedStatus === "in_progress").length;
  const completedCount = operations.filter((p) => p.normalizedStatus === "completed").length;
  const onHoldCount = operations.filter((p) => p.normalizedStatus === "on_hold").length;
  const totalBudget = operations.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalSpent = operations.reduce((sum, p) => sum + (p.spent || 0), 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="Operations & Project Delivery"
        description="Real-time operational tracking, client project milestones, and live Firebase sync"
        icon={Briefcase}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#0F2557] hover:bg-[#1b3b82] text-white shadow-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" /> New Operation Project
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Operations"
          value={totalProjects}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="gold"
          delay={0.1}
        />
        <StatsCard
          title="Completed Work"
          value={completedCount}
          icon={CheckCircle}
          color="green"
          delay={0.2}
        />
        <StatsCard
          title="Total Budget (INR)"
          value={`₹${totalBudget.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="purple"
          delay={0.3}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { key: "all", label: `All (${operations.length})` },
            { key: "in_progress", label: `In Progress (${inProgressCount})` },
            { key: "completed", label: `Completed (${completedCount})` },
            { key: "on_hold", label: `On Hold (${onHoldCount})` },
            { key: "review", label: "Under Review" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === tab.key
                  ? "bg-[#0F2557] text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search clients, staff, services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0F2557]" />
          <span className="ml-3 text-sm text-slate-500 font-medium">
            Fetching real operations records from Firebase...
          </span>
        </div>
      )}

      {/* Operations Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filtered.map((project, idx) => {
              const cfg = statusConfig[project.normalizedStatus] || statusConfig.in_progress;
              const hasBudget = project.budget > 0;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                >
                  <Card className="h-full flex flex-col hover:shadow-md transition-all border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden group">
                    <CardContent className="p-5 flex flex-col flex-1">
                      {/* Top Badges & Meta */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant={cfg.variant} className="text-[11px] font-medium py-0.5">
                          {project.status || cfg.label}
                        </Badge>
                        {project.priority && (
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              project.priority.toLowerCase() === "urgent"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                : project.priority.toLowerCase() === "high"
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {project.priority}
                          </span>
                        )}
                      </div>

                      {/* Client & Service Title */}
                      <div className="mb-3">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1 group-hover:text-[#0F2557] dark:group-hover:text-[#D4A843] transition-colors">
                          {project.clientName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#D4A843] shrink-0" />
                          <span className="truncate">{project.serviceType || project.projectName}</span>
                        </p>
                      </div>

                      {/* Description Preview */}
                      {project.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                          {project.description}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4 mt-auto">
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="text-slate-500 font-medium">Completion Progress</span>
                          <span className="font-bold text-[#0F2557] dark:text-[#D4A843]">
                            {project.progress}%
                          </span>
                        </div>
                        <Progress value={project.progress} color={cfg.color} className="h-2" />
                      </div>

                      {/* Financials / Budget row if available */}
                      {hasBudget && (
                        <div className="mb-3.5 px-3 py-2 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Budget</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              ₹{project.budget.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-500 text-[10px] block">Spent</span>
                            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                              ₹{project.spent.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Assignee & Dates */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 truncate">
                          <Avatar name={project.assignedName || "U"} size="sm" className="w-5 h-5 text-[10px]" />
                          <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                            {project.assignedName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">Due: {project.deadline}</span>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-8"
                          onClick={() => {
                            setSelectedOperation(project);
                            setShowDetailModal(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Full
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-8 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                          onClick={() => handleOpenEdit(project)}
                        >
                          Update Status
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 my-6">
          <Briefcase className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-semibold text-slate-800 dark:text-slate-200">
            No Operational Records Found
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            {searchTerm
              ? `No project matching "${searchTerm}" was found.`
              : filter === "all"
              ? "No operations records found in Firebase."
              : `No projects found in category "${filter}".`}
          </p>
          <Button
            size="sm"
            className="mt-4 bg-[#0F2557] hover:bg-[#1b3b82] text-white"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" /> Create Operation Record
          </Button>
        </div>
      )}

      {/* View Full Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          {selectedOperation && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={statusConfig[selectedOperation.normalizedStatus]?.variant || "default"}>
                    {selectedOperation.status}
                  </Badge>
                  {selectedOperation.priority && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                      {selectedOperation.priority} Priority
                    </span>
                  )}
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedOperation.clientName}
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium">
                  Service: {selectedOperation.serviceType || selectedOperation.projectName}
                </p>
              </DialogHeader>

              <div className="space-y-4 text-xs py-2">
                {/* Financials and Progress */}
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Progress</span>
                    <span className="font-bold text-sm text-[#0F2557] dark:text-[#D4A843]">
                      {selectedOperation.progress}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Project Budget</span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      ₹{selectedOperation.budget.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Amount Spent</span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      ₹{selectedOperation.spent.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Team & Timeline */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Assigned Executive</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedOperation.assignedName || "Unassigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Timeline</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedOperation.startDate} → {selectedOperation.deadline}
                    </span>
                  </div>
                </div>

                {/* Full Description / Requirements */}
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#D4A843]" /> Description & Requirements
                  </h4>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {selectedOperation.description || selectedOperation.details || "No extended details provided."}
                  </div>
                </div>

                {/* Notes if any */}
                {selectedOperation.notes && (
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Completion / Work Notes
                    </h4>
                    <p className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-900 dark:text-amber-200">
                      {selectedOperation.notes}
                    </p>
                  </div>
                )}

                {/* Task Reference */}
                {selectedOperation.taskId && (
                  <div className="text-[11px] text-slate-400">
                    Linked Task ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{selectedOperation.taskId}</code>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:justify-between pt-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(selectedOperation)}
                >
                  Delete Record
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    className="bg-[#0F2557] hover:bg-[#1b3b82] text-white"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenEdit(selectedOperation);
                    }}
                  >
                    Edit & Update
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Edit / Update Status Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Operation Status</DialogTitle>
            <p className="text-xs text-slate-500">
              {selectedOperation?.clientName}
            </p>
          </DialogHeader>
          <div className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Status
              </label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Under Review">Under Review</option>
                <option value="Revision Requested">Revision Requested</option>
                <option value="Onboarding">Onboarding</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Progress ({editForm.progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={editForm.progress}
                onChange={(e) => setEditForm({ ...editForm, progress: Number(e.target.value) })}
                className="w-full mt-2"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Amount Spent (INR)
              </label>
              <Input
                type="number"
                value={editForm.spent}
                onChange={(e) => setEditForm({ ...editForm, spent: Number(e.target.value) || 0 })}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Work Notes / Completion Remarks
              </label>
              <Textarea
                placeholder="Add notes about delivered links, status change, or client feedback..."
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="mt-1 text-xs min-h-[70px]"
              />
            </div>
          </div>
          <DialogFooter className="pt-3">
            <Button variant="outline" size="sm" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEdit} className="bg-[#0F2557] hover:bg-[#1b3b82] text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Project Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Operation Project</DialogTitle>
            <p className="text-xs text-slate-500">
              Creates a live entry in Firebase Operations
            </p>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Client Business Name *
              </label>
              <Input
                placeholder="e.g. Royal Spa & Salon / Acme Corporation"
                value={newProject.clientName}
                onChange={(e) => setNewProject({ ...newProject, clientName: e.target.value })}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Project Title *
                </label>
                <Input
                  placeholder="e.g. Google Business Profile / SEO Website"
                  value={newProject.projectName}
                  onChange={(e) => setNewProject({ ...newProject, projectName: e.target.value })}
                  required
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Service Category
                </label>
                <select
                  value={newProject.serviceType}
                  onChange={(e) => setNewProject({ ...newProject, serviceType: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <option value="Assigned Work">Assigned Work</option>
                  <option value="Google My Business Listing">Google My Business</option>
                  <option value="Website Development">Website Development</option>
                  <option value="Local SEO & Citations">Local SEO & Citations</option>
                  <option value="Lead Generation">Lead Generation</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assigned Team Member
                </label>
                {employees.length > 0 ? (
                  <select
                    value={newProject.assignedName}
                    onChange={(e) => {
                      const emp = employees.find((x) => x.name === e.target.value);
                      setNewProject({
                        ...newProject,
                        assignedName: e.target.value,
                        assignedTo: emp ? emp.uid : "",
                      });
                    }}
                    className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.uid} value={emp.name}>
                        {emp.name} ({emp.department})
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="e.g. Abhi Verma"
                    value={newProject.assignedName}
                    onChange={(e) => setNewProject({ ...newProject, assignedName: e.target.value })}
                    className="mt-1 text-xs"
                  />
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Budget (₹)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 9500"
                  value={newProject.budget}
                  onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) || 0 })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Status
                </label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Onboarding">Onboarding</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Deadline
                </label>
                <Input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Detailed Scope / Client Instructions / Address
              </label>
              <Textarea
                rows={3}
                placeholder="Enter client address, phone number, Google map link, notes or deliverables..."
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#0F2557] hover:bg-[#1b3b82] text-white">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
