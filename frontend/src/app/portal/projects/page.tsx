"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Zap,
  Download,
  PlusCircle,
  FileText,
  Calendar,
  User,
  ArrowRight,
  MessageSquare,
  Sparkles,
  X,
  Send,
  AlertCircle
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { WorkRequestCategory, ClientWorkRequest } from "@/types/portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function ClientProjectsPage() {
  const { client, projects, workRequests, createWorkRequest } = usePortalData();
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  // New Work Request Form
  const [reqTitle, setReqTitle] = useState("");
  const [reqCategory, setReqCategory] = useState<WorkRequestCategory>("SEO Campaign");
  const [reqPriority, setReqPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [reqBudget, setReqBudget] = useState("");
  const [reqTimeline, setReqTimeline] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [requestSuccess, setRequestSuccess] = useState(false);

  const activeProject = projects[0];

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim() || !reqDesc.trim() || !client) return;

    createWorkRequest({
      clientId: client.clientId,
      clientName: client.businessName,
      title: reqTitle.trim(),
      category: reqCategory,
      priority: reqPriority,
      estimatedBudget: reqBudget || "Flexible",
      targetTimeline: reqTimeline || "Flexible",
      description: reqDesc.trim(),
      status: "Pending Review",
    });

    setRequestSuccess(true);
    setTimeout(() => {
      setRequestModalOpen(false);
      setRequestSuccess(false);
      setReqTitle("");
      setReqDesc("");
      setReqBudget("");
      setReqTimeline("");
    }, 1500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            Operations & Deliverables
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Work Progress & Project Roadmap
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track live milestones, download verified deliverables, and request new scoped assignments.
          </p>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Request New Work / Service
        </button>
      </div>

      {/* Active Project Highlight Banner */}
      {activeProject ? (
        <div className="corp-card p-6 sm:p-8 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  {activeProject.serviceCategory}
                </span>
                <Badge variant="info" className="text-[10px]">
                  In Progress
                </Badge>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeProject.projectName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Lead: <strong className="text-slate-700 dark:text-slate-300">{activeProject.assignedManager}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Target Delivery: <strong className="text-slate-700 dark:text-slate-300">{activeProject.deadline}</strong>
                </span>
              </div>
            </div>

            {/* Progress Gauge */}
            <div className="w-full lg:w-72 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between mb-2 text-xs">
                <span className="font-semibold text-slate-500">Milestones Completion</span>
                <span className="font-black text-base text-blue-600 dark:text-blue-400">
                  {activeProject.progress}%
                </span>
              </div>
              <Progress value={activeProject.progress} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
              <p className="text-[10px] text-slate-400 mt-2">
                {activeProject.milestones.filter((m) => m.status === "completed").length} of{" "}
                {activeProject.milestones.length} milestones successfully achieved
              </p>
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="pt-6">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">
              Project Phase Timeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProject.milestones.map((milestone, idx) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-xl border transition-all ${
                    milestone.status === "completed"
                      ? "bg-emerald-50/40 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-800/40"
                      : milestone.status === "in_progress"
                      ? "bg-amber-50/40 dark:bg-amber-950/15 border-amber-200 dark:border-amber-800/40 ring-1 ring-amber-400/30"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Phase {idx + 1}
                    </span>
                    <Badge
                      variant={
                        milestone.status === "completed"
                          ? "success"
                          : milestone.status === "in_progress"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[9px] uppercase font-bold"
                    >
                      {milestone.status === "in_progress" ? "In Progress" : milestone.status}
                    </Badge>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {milestone.title}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>Due: {milestone.dueDate}</span>
                    {milestone.completedDate && (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Done {milestone.completedDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Two Columns: Verified Deliverables & Work Requests Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Deliverables Files */}
        <div className="corp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Verified Deliverables & Files
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Download reports, audit documents, and monthly matrices.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(activeProject?.deliverables || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No deliverable files uploaded yet.
              </p>
            ) : (
              (activeProject?.deliverables || []).map((del) => (
                <div
                  key={del.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{del.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {del.date} • {del.fileSize || "2.5 MB"} • {del.type}
                      </p>
                    </div>
                  </div>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Downloading ${del.title}...`);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Client-Submitted Work Requests Queue */}
        <div className="corp-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A843]" />
                Your Custom Work Requests
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of new tasks and add-ons requested by you.
              </p>
            </div>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              + New Request
            </button>
          </div>

          <div className="space-y-3">
            {workRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No custom work requests submitted yet.
              </div>
            ) : (
              workRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#D4A843]">
                        {req.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">
                        {req.title}
                      </h4>
                    </div>
                    <Badge
                      variant={
                        req.status === "Approved" || req.status === "Completed"
                          ? "success"
                          : req.status === "In Progress"
                          ? "warning"
                          : "secondary"
                      }
                      className="text-[10px] uppercase font-bold flex-shrink-0"
                    >
                      {req.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {req.description}
                  </p>

                  {req.adminResponse && (
                    <div className="p-2.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 text-[11px] text-blue-900 dark:text-blue-300">
                      <strong>Axenta Team Note:</strong> {req.adminResponse}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Target: {req.targetTimeline}</span>
                    <span>Budget: {req.estimatedBudget}</span>
                    <span>Submitted: {req.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Request New Work Modal */}
      <AnimatePresence>
        {requestModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-blue-600" />
                    Request New Work or Service
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Our team will review your requirements and share an operational timeline.
                  </p>
                </div>
                <button
                  onClick={() => setRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {requestSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold text-slate-900 dark:text-white">Work Request Sent!</p>
                  <p className="text-xs text-slate-400">
                    Your request has been routed to your account manager in the ERP admin console.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Project or Task Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 5 SEO Articles for Spring Campaign or Landing Page Redesign"
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Service Category
                      </label>
                      <select
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="SEO Campaign">SEO Campaign</option>
                        <option value="Content & Blogs">Content & Blogs</option>
                        <option value="Website Development">Website Development</option>
                        <option value="Google & Meta Ads">Google & Meta Ads</option>
                        <option value="Technical Fix">Technical Fix</option>
                        <option value="Design & Branding">Design & Branding</option>
                        <option value="Other">Other Custom Work</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Urgency / Priority
                      </label>
                      <select
                        value={reqPriority}
                        onChange={(e) => setReqPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent (Express)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Estimated Budget (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. ₹25,000 or As Quoted"
                        value={reqBudget}
                        onChange={(e) => setReqBudget(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Target Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2 Weeks / End of Month"
                        value={reqTimeline}
                        onChange={(e) => setReqTimeline(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Detailed Deliverable Description & Goals
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Specify your exact requirements, target keywords, reference websites, or deliverables needed..."
                      value={reqDesc}
                      onChange={(e) => setReqDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequestModalOpen(false)}
                      className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-semibold"
                    >
                      Cancel
                    </button>
                    <Button type="submit" className="bg-blue-600 text-white font-bold hover:bg-blue-700">
                      Submit Request to Admin
                    </Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

