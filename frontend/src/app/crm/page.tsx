"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Briefcase, GripVertical, Phone, Mail, Calendar, ArrowRight, Sparkles } from "lucide-react";
import { collection, query, onSnapshot, orderBy, doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LeadStatus, Lead } from "@/types";

const stageOrder: LeadStatus[] = ["new", "contacted", "follow_up", "interested", "confirmed", "converted", "rejected"];

export default function CRMPage() {
  const [leadsList, setLeadsList] = useState<Lead[]>([]);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setLeadsList(snap.docs.map(d => ({ id: d.id, ...d.data() } as Lead)));
        } else {
          setLeadsList([]);
        }
      }, () => {
        setLeadsList([]);
      });
      return () => unsub();
    } catch {
      setLeadsList([]);
    }
  }, []);

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (toStage: LeadStatus) => {
    if (!draggedLead || draggedLead.status === toStage) return;
    const targetLeadId = draggedLead.id;
    setDraggedLead(null);

    // Optimistic local update
    setLeadsList(prev => prev.map(l => l.id === targetLeadId ? { ...l, status: toStage } : l));

    try {
      await updateDoc(doc(db, "leads", targetLeadId), {
        status: toStage,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to update lead status:", err);
    }
  };

  const pipeline = stageOrder.reduce((acc, stage) => {
    acc[stage] = leadsList.filter(l => l.status === stage);
    return acc;
  }, {} as Record<LeadStatus, Lead[]>);

  const totalLeadsCount = leadsList.length;

  return (
    <DashboardLayout>
      <PageHeader
        title="CRM Pipeline"
        description={`Track and manage real leads through the active sales pipeline • ${totalLeadsCount} Total Leads`}
        icon={Briefcase}
      />

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {stageOrder.map((stage, idx) => {
            const leads = pipeline[stage] || [];
            return (
              <motion.div
                key={stage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex-1 min-w-[220px]"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column Header */}
                <div className="rounded-t-xl p-3 text-white text-center shadow-xs" style={{ backgroundColor: LEAD_STATUS_COLORS[stage] }}>
                  <h3 className="font-semibold text-sm">{LEAD_STATUS_LABELS[stage]}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs opacity-90">{leads.length} leads</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-xl p-2 space-y-2 min-h-[400px] border border-t-0 border-slate-200 dark:border-slate-700">
                  {leads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead)}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-slate-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {lead.businessName}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.contactPerson || "Contact"}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone || "No phone"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#D4A843]">{lead.category || "Direct Lead"}</span>
                            {lead.followUpDate && (
                              <Badge variant="warning" className="text-[10px]">
                                <Calendar className="w-2.5 h-2.5 mr-0.5" />
                                {lead.followUpDate.slice(0, 10)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {leads.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-xs">
                      Drop leads here
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
