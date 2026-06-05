"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GripVertical, Phone, Mail, Calendar, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, LeadStatus } from "@/types";

interface PipelineLead {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  value: string;
  followUp?: string;
}

const initialPipeline: Record<LeadStatus, PipelineLead[]> = {
  new: [
    { id: "1", businessName: "TechVista Solutions", contactPerson: "Raj Mehta", phone: "+91-98765-43210", value: "₹2.5L" },
    { id: "2", businessName: "CloudPeak Inc", contactPerson: "Sita Ram", phone: "+91-98765-43211", value: "₹1.8L" },
    { id: "3", businessName: "DataFlow Corp", contactPerson: "Anil Shah", phone: "+91-98765-43212", value: "₹3.2L" },
  ],
  contacted: [
    { id: "4", businessName: "Global Marketing Hub", contactPerson: "Priya Sharma", phone: "+91-98765-43213", value: "₹4.0L", followUp: "Tomorrow" },
    { id: "5", businessName: "InnoTech Labs", contactPerson: "Vikram Joshi", phone: "+91-98765-43214", value: "₹2.1L" },
  ],
  follow_up: [
    { id: "6", businessName: "SmartBiz Analytics", contactPerson: "Neha Gupta", phone: "+91-98765-43215", value: "₹5.5L", followUp: "Today" },
    { id: "7", businessName: "ProServe Consulting", contactPerson: "Amit Patel", phone: "+91-98765-43216", value: "₹1.5L", followUp: "In 2 days" },
  ],
  interested: [
    { id: "8", businessName: "Digital Corp", contactPerson: "Sneha Reddy", phone: "+91-98765-43217", value: "₹8.0L" },
  ],
  confirmed: [
    { id: "9", businessName: "EliteStar Group", contactPerson: "Rahul Kumar", phone: "+91-98765-43218", value: "₹12.0L" },
  ],
  converted: [
    { id: "10", businessName: "NexGen Industries", contactPerson: "Meena Singh", phone: "+91-98765-43219", value: "₹6.5L" },
  ],
  rejected: [
    { id: "11", businessName: "QuickFix Services", contactPerson: "Suresh Nair", phone: "+91-98765-43220", value: "₹1.0L" },
  ],
};

const stageOrder: LeadStatus[] = ["new", "contacted", "follow_up", "interested", "confirmed", "converted", "rejected"];

export default function CRMPage() {
  const [pipeline, setPipeline] = useState(initialPipeline);
  const [draggedItem, setDraggedItem] = useState<{ lead: PipelineLead; fromStage: LeadStatus } | null>(null);

  const handleDragStart = (lead: PipelineLead, stage: LeadStatus) => {
    setDraggedItem({ lead, fromStage: stage });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toStage: LeadStatus) => {
    if (!draggedItem || draggedItem.fromStage === toStage) return;
    setPipeline(prev => {
      const newPipeline = { ...prev };
      newPipeline[draggedItem.fromStage] = prev[draggedItem.fromStage].filter(l => l.id !== draggedItem.lead.id);
      newPipeline[toStage] = [...prev[toStage], draggedItem.lead];
      return newPipeline;
    });
    setDraggedItem(null);
  };

  const totalValue = Object.values(pipeline).flat().reduce((acc, lead) => {
    const num = parseFloat(lead.value.replace("₹", "").replace("L", "")) || 0;
    return acc + num;
  }, 0);

  return (
    <DashboardLayout>
      <PageHeader
        title="CRM Pipeline"
        description={`Track and manage leads through the sales pipeline • Total Value: ₹${totalValue.toFixed(1)}L`}
        icon={Briefcase}
      />

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1200px]">
          {stageOrder.map((stage, idx) => {
            const leads = pipeline[stage];
            const stageValue = leads.reduce((acc, l) => acc + (parseFloat(l.value.replace("₹", "").replace("L", "")) || 0), 0);
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
                <div className="rounded-t-xl p-3 text-white text-center" style={{ backgroundColor: LEAD_STATUS_COLORS[stage] }}>
                  <h3 className="font-semibold text-sm">{LEAD_STATUS_LABELS[stage]}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs opacity-90">{leads.length} leads</span>
                    <span className="text-xs opacity-70">•</span>
                    <span className="text-xs opacity-90">₹{stageValue.toFixed(1)}L</span>
                  </div>
                </div>

                {/* Cards */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-b-xl p-2 space-y-2 min-h-[400px] border border-t-0 border-slate-200 dark:border-slate-700">
                  {leads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      draggable
                      onDragStart={() => handleDragStart(lead, stage)}
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
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.contactPerson}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.phone.slice(-5)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs font-bold text-[#D4A843]">{lead.value}</span>
                            {lead.followUp && (
                              <Badge variant="warning" className="text-[10px]">
                                <Calendar className="w-2.5 h-2.5 mr-0.5" />
                                {lead.followUp}
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
