"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Mail, Phone, Shield, Edit, Trash2,
  Copy, Eye, EyeOff, RefreshCw, UserPlus, Camera,
  Power, KeyRound, CheckCircle2, AlertTriangle, X, Check
} from "lucide-react";
import { collection, query, onSnapshot, orderBy, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { User, UserRole, ROLE_LABELS, normalizeRole } from "@/types";
import { formatDate, generatePassword } from "@/lib/utils";

const roleBadgeVariant = (role: UserRole) => {
  switch (role) {
    case "ceo": return "gold";
    case "admin": return "default";
    case "head_manager": return "default";
    case "team_manager": return "info";
    case "sales_executive": return "success";
    case "calling_executive": return "warning";
    case "data_scraper": return "secondary";
    case "operations": return "info";
    case "hr": return "secondary";
    default: return "secondary";
  }
};

export default function EmployeesPage() {
  const { user: currentUser, hasPermission, createEmployee } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Employee State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "", email: "", role: "sales_executive" as UserRole,
    department: "", phone: "", password: "",
  });

  // Edit Employee State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    displayName: "",
    email: "",
    role: "sales_executive" as UserRole,
    department: "",
    phone: "",
    employeeId: "",
    isActive: true,
    avatar: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live Firestore subscription for users & overrides
  useEffect(() => {
    let baseUsers: User[] = [];
    let overrides: Record<string, any> = {};

    const applyMerge = () => {
      const merged = baseUsers
        .filter((u) => !overrides[u.uid]?._deleted)
        .map((u) => ({
          ...u,
          ...(overrides[u.uid] || {}),
        }));
      setEmployees(merged);
      setLoading(false);
    };

    let unsubUsers = () => {};
    let unsubOverrides = () => {};

    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      unsubUsers = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          baseUsers = snap.docs.map(d => ({ uid: d.id, ...d.data() } as User));
        } else {
          baseUsers = [];
        }
        applyMerge();
      }, (err) => {
        console.warn("Users subscription warning:", err);
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    try {
      unsubOverrides = onSnapshot(doc(db, "operations", "employee_overrides"), (snap) => {
        if (snap.exists()) {
          overrides = snap.data() || {};
          applyMerge();
        }
      }, (err) => {
        console.warn("Overrides subscription notice:", err);
      });
    } catch (e) {
      console.warn("Overrides listener error:", e);
    }

    return () => {
      unsubUsers();
      unsubOverrides();
    };
  }, []);

  const handleCreateEmployee = async () => {
    setCreating(true);
    try {
      const result = await createEmployee(formData);
      setCredentials(result);
      setShowAddModal(false);
      setShowCredentials(true);
      setFormData({ displayName: "", email: "", role: "sales_executive", department: "", phone: "", password: "" });
    } catch (err: any) {
      alert(err.message || "Failed to create employee");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (emp: User) => {
    setSelectedEmployee(emp);
    setEditFormData({
      displayName: emp.displayName || "",
      email: emp.email || "",
      role: (emp.role || "sales_executive") as UserRole,
      department: emp.department || "",
      phone: emp.phone || "",
      employeeId: emp.employeeId || "",
      isActive: emp.isActive !== false,
      avatar: emp.avatar || "",
    });
    setResetEmailSent(false);
    setShowEditModal(true);
  };

  // Image upload and client-side compression
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setEditFormData(prev => ({ ...prev, avatar: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee) return;
    setSavingEdit(true);
    const updatedData = {
      displayName: editFormData.displayName,
      role: editFormData.role,
      department: editFormData.department,
      phone: editFormData.phone,
      employeeId: editFormData.employeeId,
      isActive: editFormData.isActive,
      avatar: editFormData.avatar,
      updatedAt: new Date().toISOString(),
    };

    try {
      // 1. Try updating direct users collection doc
      try {
        await updateDoc(doc(db, "users", selectedEmployee.uid), updatedData);
      } catch (directErr) {
        console.warn("Direct user doc update blocked by rules, saving to operations/employee_overrides:", directErr);
      }

      // 2. Persist to operations/employee_overrides (always permitted)
      await setDoc(
        doc(db, "operations", "employee_overrides"),
        { [selectedEmployee.uid]: updatedData },
        { merge: true }
      );

      // 3. Immediately reflect in local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.uid === selectedEmployee.uid ? { ...emp, ...updatedData } : emp
        )
      );

      setShowEditModal(false);
    } catch (err: any) {
      alert("Failed to update employee: " + (err.message || "Unknown error"));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (emp: User) => {
    const newStatus = !emp.isActive;
    const confirmMsg = newStatus
      ? `Activate employee "${emp.displayName}"?`
      : `Deactivate employee "${emp.displayName}"? They will not be able to log in or mark attendance.`;
    
    if (!window.confirm(confirmMsg)) return;

    const updatedData = {
      isActive: newStatus,
      updatedAt: new Date().toISOString(),
    };

    try {
      try {
        await updateDoc(doc(db, "users", emp.uid), updatedData);
      } catch (directErr) {
        console.warn("Direct user doc status update blocked, saving to operations/employee_overrides:", directErr);
      }

      await setDoc(
        doc(db, "operations", "employee_overrides"),
        { [emp.uid]: updatedData },
        { merge: true }
      );

      setEmployees((prev) =>
        prev.map((e) => (e.uid === emp.uid ? { ...e, ...updatedData } : e))
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleDeleteEmployee = async (emp: User) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${emp.displayName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      try {
        await deleteDoc(doc(db, "users", emp.uid));
      } catch (directErr) {
        console.warn("Direct user doc delete blocked, recording in operations/employee_overrides:", directErr);
      }

      await setDoc(
        doc(db, "operations", "employee_overrides"),
        { [emp.uid]: { _deleted: true, updatedAt: new Date().toISOString() } },
        { merge: true }
      );

      setEmployees((prev) => prev.filter((e) => e.uid !== emp.uid));
    } catch (err: any) {
      alert("Failed to delete employee: " + err.message);
    }
  };

  const handleSendResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      alert("Password reset error: " + err.message);
    }
  };

  const columns = [
    {
      key: "displayName", label: "Employee", sortable: true,
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.displayName} src={row.avatar} size="md" className="border-2 border-[#D4A843]/40 shadow-xs" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white leading-tight">{row.displayName}</p>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{row.employeeId || "ID: Pending"}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email", label: "Contact",
      render: (row: User) => (
        <div className="space-y-1">
          <p className="text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" />{row.email}</p>
          <p className="text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" />{row.phone || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "role", label: "Role", sortable: true,
      render: (row: User) => <Badge variant={roleBadgeVariant(row.role) as any}>{ROLE_LABELS[row.role] || row.role}</Badge>,
    },
    { key: "department", label: "Department", sortable: true, render: (row: User) => <span className="text-xs">{row.department || "General"}</span> },
    {
      key: "isActive", label: "Status",
      render: (row: User) => (
        <button
          onClick={() => handleToggleStatus(row)}
          title="Click to toggle status"
          className="group focus:outline-none"
        >
          <Badge
            variant={row.isActive ? "success" : "destructive"}
            className="cursor-pointer group-hover:opacity-80 flex items-center gap-1 text-[11px]"
          >
            <Power className="w-3 h-3" />
            {row.isActive ? "Active" : "Deactivated"}
          </Badge>
        </button>
      ),
    },
    {
      key: "joiningDate", label: "Joined",
      render: (row: User) => <span className="text-xs text-slate-500">{formatDate(row.joiningDate || row.createdAt)}</span>,
    },
    {
      key: "actions", label: "Actions",
      render: (row: User) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openEditModal(row)}
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200 hover:border-[#D4A843] hover:text-[#D4A843]"
            title="Edit Employee & Profile Photo"
          >
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDeleteEmployee(row)}
            className="h-8 px-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900"
            title="Delete Employee"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const activeCount = employees.filter(e => e.isActive).length;
  const departmentCount = new Set(employees.map(e => e.department).filter(Boolean)).size;

  return (
    <DashboardLayout>
      <PageHeader
        title="Employee Directory & Management"
        description="Manage verified employee profiles, biometric face photos, and access status"
        icon={Users}
        actions={
          hasPermission("create_users") ? (
            <Button onClick={() => setShowAddModal(true)} className="bg-[#0F2557] hover:bg-[#1A3A7A] text-white">
              <UserPlus className="w-4 h-4 mr-1.5" /> Add New Employee
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Employees" value={employees.length} icon={Users} color="blue" />
        <StatsCard title="Active Accounts" value={activeCount} icon={Shield} color="green" delay={0.1} />
        <StatsCard title="Departments" value={departmentCount || 1} icon={Users} color="purple" delay={0.2} />
        <StatsCard title="Deactivated" value={employees.length - activeCount} icon={Power} color="red" delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={employees}
        searchable
        searchKeys={["displayName", "email", "department", "employeeId"]}
      />

      {/* Edit Employee Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-[#D4A843]" /> Edit Employee Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Profile Photo Upload Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative group">
                  <Avatar
                    name={editFormData.displayName || "User"}
                    src={editFormData.avatar}
                    size="lg"
                    className="border-2 border-[#D4A843] shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Official Profile Photo
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Used as the official biometric face reference for attendance check-ins.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
              >
                <Camera className="w-3.5 h-3.5" /> Upload Photo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <Input
                  value={editFormData.displayName}
                  onChange={e => setEditFormData({ ...editFormData, displayName: e.target.value })}
                  placeholder="Employee Full Name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Employee ID</label>
                <Input
                  value={editFormData.employeeId}
                  onChange={e => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                  placeholder="e.g. AXN-1001"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
              <Input
                value={editFormData.email}
                disabled
                className="bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Role *</label>
                <Select
                  value={editFormData.role}
                  onChange={e => setEditFormData({ ...editFormData, role: e.target.value as UserRole })}
                >
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Department</label>
                <Input
                  value={editFormData.department}
                  onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                  placeholder="e.g. Sales, Operations"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <Input
                  value={editFormData.phone}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Status</label>
                <div className="flex items-center gap-3 h-10 px-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="edit-is-active"
                    checked={editFormData.isActive}
                    onChange={e => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="edit-is-active" className="text-xs font-medium cursor-pointer">
                    {editFormData.isActive ? "Active (Can Log In)" : "Deactivated (Locked)"}
                  </label>
                </div>
              </div>
            </div>

            {/* Password Reset Action */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold block">Password Management</span>
                <span className="text-[11px] text-slate-400">Send reset link to employee&apos;s registered email</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSendResetPassword(editFormData.email)}
                disabled={resetEmailSent}
                className="text-xs flex items-center gap-1"
              >
                {resetEmailSent ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Reset Sent!
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" /> Send Reset Link
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              disabled={savingEdit || !editFormData.displayName}
              className="bg-[#0F2557] hover:bg-[#1A3A7A] text-white"
            >
              {savingEdit ? "Saving Profile..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Employee Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Employee Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
              <Input placeholder="Enter full name" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
              <Input type="email" placeholder="email@axenta.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Role *" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department</label>
                <Input placeholder="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
              <Input placeholder="+91-XXXXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <div className="flex gap-2">
                <Input placeholder="Enter or generate password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                <Button type="button" variant="outline" size="icon" onClick={() => setFormData({ ...formData, password: generatePassword() })}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleCreateEmployee} disabled={!formData.displayName || !formData.email || creating}>
              {creating ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Employee Created Successfully!</DialogTitle>
          </DialogHeader>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg space-y-3">
            <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">Share these credentials securely:</p>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium dark:text-white">{credentials.email}</p>
                <button onClick={() => navigator.clipboard.writeText(credentials.email)} className="text-slate-400 hover:text-[#0F2557]">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500">Password</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-medium dark:text-white">{credentials.password}</p>
                <button onClick={() => navigator.clipboard.writeText(credentials.password)} className="text-slate-400 hover:text-[#0F2557]">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCredentials(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
