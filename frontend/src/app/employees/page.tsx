"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, Plus, Mail, Phone, Shield, Edit, Trash2,
  Copy, Eye, EyeOff, RefreshCw, UserPlus
} from "lucide-react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
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
import { User, UserRole, ROLE_LABELS } from "@/types";
import { formatDate, generatePassword } from "@/lib/utils";

const demoEmployees: User[] = [
  { uid: "1", email: "ceo@axenta.com", displayName: "Arjun Malhotra", role: "ceo", department: "Management", phone: "+91-9876543200", avatar: "", employeeId: "AXN-1001", isActive: true, createdAt: "2024-01-15", updatedAt: "2024-01-15", joiningDate: "2024-01-15" },
  { uid: "2", email: "admin@axenta.com", displayName: "Sunita Verma", role: "admin", department: "Administration", phone: "+91-9876543201", avatar: "", employeeId: "AXN-1002", isActive: true, createdAt: "2024-01-20", updatedAt: "2024-01-20", joiningDate: "2024-01-20" },
  { uid: "3", email: "rahul@axenta.com", displayName: "Rahul Sharma", role: "team_manager", department: "Sales", phone: "+91-9876543202", avatar: "", employeeId: "AXN-1003", isActive: true, createdAt: "2024-02-01", updatedAt: "2024-02-01", joiningDate: "2024-02-01" },
  { uid: "4", email: "priya@axenta.com", displayName: "Priya Patel", role: "sales_executive", department: "Sales", phone: "+91-9876543203", avatar: "", employeeId: "AXN-1004", isActive: true, createdAt: "2024-02-15", updatedAt: "2024-02-15", joiningDate: "2024-02-15" },
  { uid: "5", email: "amit@axenta.com", displayName: "Amit Kumar", role: "calling_executive", department: "Calling", phone: "+91-9876543204", avatar: "", employeeId: "AXN-1005", isActive: true, createdAt: "2024-03-01", updatedAt: "2024-03-01", joiningDate: "2024-03-01" },
  { uid: "6", email: "sneha@axenta.com", displayName: "Sneha Gupta", role: "data_scraper", department: "Data", phone: "+91-9876543205", avatar: "", employeeId: "AXN-1006", isActive: true, createdAt: "2024-03-15", updatedAt: "2024-03-15", joiningDate: "2024-03-15" },
  { uid: "7", email: "vikram@axenta.com", displayName: "Vikram Singh", role: "operations", department: "Operations", phone: "+91-9876543206", avatar: "", employeeId: "AXN-1007", isActive: true, createdAt: "2024-04-01", updatedAt: "2024-04-01", joiningDate: "2024-04-01" },
  { uid: "8", email: "meena@axenta.com", displayName: "Meena Reddy", role: "hr", department: "HR", phone: "+91-9876543207", avatar: "", employeeId: "AXN-1008", isActive: true, createdAt: "2024-04-15", updatedAt: "2024-04-15", joiningDate: "2024-04-15" },
];

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
  const { hasPermission, createEmployee } = useAuth();
  const [employees, setEmployees] = useState<User[]>(demoEmployees);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "", email: "", role: "sales_executive" as UserRole,
    department: "", phone: "", password: "",
  });

  useEffect(() => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setEmployees(snap.docs.map(d => ({ uid: d.id, ...d.data() } as User)));
        }
      }, () => {});
      return () => unsub();
    } catch {}
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

  const columns = [
    {
      key: "displayName", label: "Employee", sortable: true,
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.displayName} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{row.displayName}</p>
            <p className="text-xs text-slate-400">{row.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email", label: "Contact",
      render: (row: User) => (
        <div className="space-y-1">
          <p className="text-xs flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{row.email}</p>
          <p className="text-xs flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{row.phone || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "role", label: "Role", sortable: true,
      render: (row: User) => <Badge variant={roleBadgeVariant(row.role) as any}>{ROLE_LABELS[row.role]}</Badge>,
    },
    { key: "department", label: "Department", sortable: true },
    {
      key: "isActive", label: "Status",
      render: (row: User) => (
        <Badge variant={row.isActive ? "success" : "destructive"}>
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "joiningDate", label: "Joined",
      render: (row: User) => <span className="text-xs">{formatDate(row.joiningDate || row.createdAt)}</span>,
    },
  ];

  const activeCount = employees.filter(e => e.isActive).length;
  const departmentCount = new Set(employees.map(e => e.department).filter(Boolean)).size;

  return (
    <DashboardLayout>
      <PageHeader
        title="Employee Management"
        description="Manage all employee accounts and profiles"
        icon={Users}
        actions={
          hasPermission("create_users") ? (
            <Button onClick={() => setShowAddModal(true)}>
              <UserPlus className="w-4 h-4 mr-1" /> Add Employee
            </Button>
          ) : null
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Employees" value={employees.length} icon={Users} color="blue" />
        <StatsCard title="Active" value={activeCount} icon={Shield} color="green" delay={0.1} />
        <StatsCard title="Departments" value={departmentCount} icon={Users} color="purple" delay={0.2} />
        <StatsCard title="New This Month" value={3} icon={UserPlus} color="gold" delay={0.3} />
      </div>

      <DataTable
        columns={columns}
        data={employees}
        searchable
        searchKeys={["displayName", "email", "department", "employeeId"]}
      />

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
