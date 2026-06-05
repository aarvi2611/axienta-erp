"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase, CheckCircle, Clock, Users, FileText, Plus,
  Eye, ArrowRight, AlertCircle, Calendar, TrendingUp
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ClientProject {
  id: string;
  clientName: string;
  projectName: string;
  status: "onboarding" | "in_progress" | "review" | "completed" | "delivered";
  progress: number;
  assignedTo: string;
  startDate: string;
  deadline: string;
  deliverables: number;
  completedDeliverables: number;
}

const demoProjects: ClientProject[] = [
  { id: "1", clientName: "Tech Solutions Pvt Ltd", projectName: "Digital Marketing Setup", status: "in_progress", progress: 65, assignedTo: "Vikram Singh", startDate: "2024-09-01", deadline: "2024-10-15", deliverables: 8, completedDeliverables: 5 },
  { id: "2", clientName: "Global Marketing Agency", projectName: "Brand Identity Design", status: "onboarding", progress: 15, assignedTo: "Priya Patel", startDate: "2024-10-01", deadline: "2024-11-30", deliverables: 5, completedDeliverables: 1 },
  { id: "3", clientName: "CloudNine Industries", projectName: "ERP Implementation", status: "review", progress: 90, assignedTo: "Rahul Sharma", startDate: "2024-07-15", deadline: "2024-10-30", deliverables: 12, completedDeliverables: 11 },
  { id: "4", clientName: "Digital Corp", projectName: "Website Redesign", status: "completed", progress: 100, assignedTo: "Amit Kumar", startDate: "2024-06-01", deadline: "2024-09-30", deliverables: 6, completedDeliverables: 6 },
  { id: "5", clientName: "NexGen Industries", projectName: "Social Media Management", status: "delivered", progress: 100, assignedTo: "Sneha Gupta", startDate: "2024-08-01", deadline: "2024-09-30", deliverables: 10, completedDeliverables: 10 },
];

const statusConfig = {
  onboarding: { label: "Onboarding", variant: "info" as const, color: "bg-blue-500" },
  in_progress: { label: "In Progress", variant: "warning" as const, color: "bg-amber-500" },
  review: { label: "Under Review", variant: "secondary" as const, color: "bg-purple-500" },
  completed: { label: "Completed", variant: "success" as const, color: "bg-emerald-500" },
  delivered: { label: "Delivered", variant: "default" as const, color: "bg-[#0F2557]" },
};

export default function OperationsPage() {
  const [projects] = useState(demoProjects);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  return (
    <DashboardLayout>
      <PageHeader
        title="Operations Panel"
        description="Manage confirmed clients and project delivery"
        icon={Briefcase}
        actions={
          <Button><Plus className="w-4 h-4 mr-1" /> New Project</Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Active Projects" value={projects.filter(p => p.status !== "delivered").length} icon={Briefcase} color="blue" />
        <StatsCard title="In Progress" value={projects.filter(p => p.status === "in_progress").length} icon={Clock} color="gold" delay={0.1} />
        <StatsCard title="Completed" value={projects.filter(p => p.status === "completed" || p.status === "delivered").length} icon={CheckCircle} color="green" delay={0.2} />
        <StatsCard title="Onboarding" value={projects.filter(p => p.status === "onboarding").length} icon={Users} color="purple" delay={0.3} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "All Projects" },
          { key: "onboarding", label: "Onboarding" },
          { key: "in_progress", label: "In Progress" },
          { key: "review", label: "Under Review" },
          { key: "completed", label: "Completed" },
          { key: "delivered", label: "Delivered" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === tab.key ? "bg-[#0F2557] text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((project, idx) => {
          const config = statusConfig[project.status];
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{project.projectName}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{project.clientName}</p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-500">Progress</span>
                      <span className="text-xs font-bold text-[#0F2557] dark:text-[#D4A843]">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} color={config.color} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {project.assignedTo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Due: {formatDate(project.deadline)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {project.completedDeliverables}/{project.deliverables} deliverables
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Started: {formatDate(project.startDate)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
