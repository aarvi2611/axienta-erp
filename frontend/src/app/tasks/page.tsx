"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckSquare, Plus, Calendar, Clock, AlertCircle, CheckCircle,
  XCircle, Paperclip, User, Filter
} from "lucide-react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { Task, TaskStatus, TaskPriority, TASK_STATUS_LABELS, PRIORITY_COLORS } from "@/types";
import { formatDate } from "@/lib/utils";

const priorityBadge = (priority: TaskPriority) => {
  switch (priority) {
    case "urgent": return "destructive";
    case "high": return "warning";
    case "medium": return "info";
    case "low": return "success";
    default: return "secondary";
  }
};

const statusIcon = (status: TaskStatus) => {
  switch (status) {
    case "pending": return <Clock className="w-4 h-4 text-slate-400" />;
    case "in_progress": return <AlertCircle className="w-4 h-4 text-blue-500" />;
    case "completed": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "rejected": return <XCircle className="w-4 h-4 text-red-500" />;
  }
};

interface EmployeeOption {
  uid: string;
  name: string;
  role: string;
  department: string;
  email: string;
}

export default function TasksPage() {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    assignedToName: "",
    assignedToRole: "",
    deadline: "",
    priority: "medium" as TaskPriority,
  });

  useEffect(() => {
    try {
      const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() } as Task)));
        } else {
          setTasks([]);
        }
      }, () => {
        setTasks([]);
      });

      const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        const emps: EmployeeOption[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          emps.push({
            uid: docSnap.id,
            name: d.displayName || d.name || d.email || "Employee",
            role: d.role || "Executive",
            department: d.department || "General",
            email: d.email || "",
          });
        });
        setEmployees(emps);
      });

      return () => {
        unsub();
        unsubUsers();
      };
    } catch {
      setTasks([]);
    }
  }, []);

  const filteredTasks = statusFilter === "all" ? tasks : tasks.filter(t => t.status === statusFilter);

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "pending").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    completed: tasks.filter(t => t.status === "completed").length,
  };

  const handleAddTask = async () => {
    const newTask: any = {
      ...formData,
      assignedTo: formData.assignedTo,
      assignedToName: formData.assignedToName || "Unassigned",
      assignedToRole: formData.assignedToRole || "Team Member",
      assignedBy: user?.uid || "",
      assignedByName: user?.displayName || "Admin",
      status: "pending",
      attachments: [],
      statusUpdates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "tasks"), newTask);
    } catch {
      newTask.id = String(Date.now());
      setTasks(prev => [newTask, ...prev]);
    }
    setShowAddModal(false);
    setFormData({
      title: "",
      description: "",
      assignedTo: "",
      assignedToName: "",
      assignedToRole: "",
      deadline: "",
      priority: "medium",
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
    try {
      await updateDoc(doc(db, "tasks", taskId), { status: newStatus, updatedAt: new Date().toISOString() });
    } catch {}
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Task Management"
        description="Assign and track tasks across teams"
        icon={CheckSquare}
        actions={
          hasPermission("assign_tasks") ? (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" /> Assign Task
            </Button>
          ) : null
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Tasks" value={stats.total} icon={CheckSquare} color="blue" />
        <StatsCard title="Pending" value={stats.pending} icon={Clock} color="gold" delay={0.1} />
        <StatsCard title="In Progress" value={stats.inProgress} icon={AlertCircle} color="cyan" delay={0.2} />
        <StatsCard title="Completed" value={stats.completed} icon={CheckCircle} color="green" delay={0.3} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All Tasks" },
          { key: "pending", label: "Pending" },
          { key: "in_progress", label: "In Progress" },
          { key: "completed", label: "Completed" },
          { key: "rejected", label: "Rejected" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === tab.key
                ? "bg-[#0F2557] text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant={priorityBadge(task.priority) as any} className="capitalize">
                    {task.priority}
                  </Badge>
                  {statusIcon(task.status)}
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{task.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5 text-blue-500" />
                    <span>
                      Assigned to: <strong className="text-slate-700 dark:text-slate-200">{task.assignedToName}</strong>
                      {(task as any).assignedToRole && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                          {(task as any).assignedToRole}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: <strong className={new Date(task.deadline) < new Date() && task.status !== "completed" ? "text-red-500" : "text-slate-700 dark:text-slate-200"}>
                      {formatDate(task.deadline)}
                    </strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5" />
                    <span>By: {task.assignedByName}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <Select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs h-8 flex-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No tasks found</p>
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Task Title *</label>
              <Input placeholder="Enter task title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <Textarea placeholder="Task description..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign To (Employee & Role) *</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => {
                    const selectedUid = e.target.value;
                    const emp = employees.find((x) => x.uid === selectedUid);
                    if (emp) {
                      setFormData({
                        ...formData,
                        assignedTo: emp.uid,
                        assignedToName: emp.name,
                        assignedToRole: emp.role,
                      });
                    } else {
                      setFormData({
                        ...formData,
                        assignedTo: "",
                        assignedToName: "",
                        assignedToRole: "",
                      });
                    }
                  }}
                  className="w-full h-10 px-3 py-2 border rounded-md text-xs bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-[#0F2557]"
                >
                  <option value="">-- Select Employee & Role --</option>
                  {employees.map((emp) => (
                    <option key={emp.uid} value={emp.uid}>
                      {emp.name} — [{emp.role.toUpperCase()}] ({emp.department})
                    </option>
                  ))}
                </select>
                {/* Optional manual override if employee not registered yet */}
                {employees.length === 0 && (
                  <Input
                    placeholder="Or enter employee name manually"
                    value={formData.assignedToName}
                    onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value, assignedToRole: "Staff" })}
                    className="mt-1.5 text-xs"
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                <Select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
              <Input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={!formData.title}><Plus className="w-4 h-4 mr-1" /> Assign Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
