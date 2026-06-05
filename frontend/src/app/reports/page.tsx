"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Download, Calendar, TrendingUp, DollarSign,
  Users, Target, CheckSquare, FileText
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as XLSX from "xlsx";

const monthlyRevenue = [
  { month: "Jan", revenue: 420000, expenses: 280000, profit: 140000 },
  { month: "Feb", revenue: 550000, expenses: 320000, profit: 230000 },
  { month: "Mar", revenue: 480000, expenses: 300000, profit: 180000 },
  { month: "Apr", revenue: 610000, expenses: 350000, profit: 260000 },
  { month: "May", revenue: 530000, expenses: 310000, profit: 220000 },
  { month: "Jun", revenue: 720000, expenses: 400000, profit: 320000 },
  { month: "Jul", revenue: 680000, expenses: 380000, profit: 300000 },
  { month: "Aug", revenue: 750000, expenses: 420000, profit: 330000 },
  { month: "Sep", revenue: 690000, expenses: 390000, profit: 300000 },
  { month: "Oct", revenue: 810000, expenses: 450000, profit: 360000 },
];

const leadConversion = [
  { month: "Jan", generated: 120, converted: 18 },
  { month: "Feb", generated: 150, converted: 24 },
  { month: "Mar", generated: 135, converted: 20 },
  { month: "Apr", generated: 180, converted: 32 },
  { month: "May", generated: 160, converted: 28 },
  { month: "Jun", generated: 210, converted: 38 },
  { month: "Jul", generated: 195, converted: 35 },
  { month: "Aug", generated: 220, converted: 42 },
];

const departmentPerformance = [
  { name: "Sales", score: 85, color: "#0F2557" },
  { name: "Calling", score: 72, color: "#D4A843" },
  { name: "Operations", score: 93, color: "#10B981" },
  { name: "Data Team", score: 68, color: "#3B82F6" },
  { name: "HR", score: 88, color: "#8B5CF6" },
];

const employeeProductivity = [
  { name: "Rahul Sharma", tasks: 45, completed: 42, leads: 32, calls: 120, score: 93 },
  { name: "Priya Patel", tasks: 38, completed: 35, leads: 28, calls: 95, score: 92 },
  { name: "Amit Kumar", tasks: 52, completed: 44, leads: 0, calls: 200, score: 85 },
  { name: "Sneha Gupta", tasks: 30, completed: 28, leads: 180, calls: 0, score: 93 },
  { name: "Vikram Singh", tasks: 40, completed: 38, leads: 0, calls: 0, score: 95 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly");

  const handleExportReport = () => {
    const ws = XLSX.utils.json_to_sheet(monthlyRevenue);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    const ws2 = XLSX.utils.json_to_sheet(employeeProductivity);
    XLSX.utils.book_append_sheet(wb, ws2, "Productivity");
    XLSX.writeFile(wb, `Axenta_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive business intelligence and performance metrics"
        icon={BarChart3}
        actions={
          <div className="flex gap-2">
            <Select value={period} onChange={e => setPeriod(e.target.value)} className="w-36">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        }
      />

      {/* KPI Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Revenue" value="₹58.2L" change={15.8} icon={DollarSign} color="green" />
        <StatsCard title="Lead Conversion" value="17.2%" change={3.5} icon={Target} color="gold" delay={0.1} />
        <StatsCard title="Tasks Done" value="1,248" change={8.2} icon={CheckSquare} color="blue" delay={0.2} />
        <StatsCard title="Avg Productivity" value="87%" change={5.1} icon={TrendingUp} color="purple" delay={0.3} />
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5 text-[#D4A843]" />Revenue vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="url(#expGrad)" strokeWidth={2} name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-[#D4A843]" />Lead Conversion</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadConversion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                  <YAxis stroke="#94A3B8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="generated" fill="#0F2557" radius={[4, 4, 0, 0]} name="Generated" />
                  <Bar dataKey="converted" fill="#D4A843" radius={[4, 4, 0, 0]} name="Converted" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Department Performance & Top Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-[#D4A843]" />Department Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={departmentPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                  <YAxis dataKey="name" type="category" width={80} stroke="#94A3B8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]} name="Score">
                    {departmentPerformance.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#D4A843]" />Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {employeeProductivity.sort((a, b) => b.score - a.score).map((emp, i) => (
                  <div key={emp.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? "bg-[#D4A843] text-white" : i === 1 ? "bg-slate-300 text-slate-700" : i === 2 ? "bg-amber-700 text-white" : "bg-slate-100 text-slate-500"
                    }`}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.completed}/{emp.tasks} tasks • {emp.leads} leads • {emp.calls} calls</p>
                    </div>
                    <Badge variant={emp.score >= 90 ? "success" : "warning"}>{emp.score}%</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
