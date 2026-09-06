"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LifeBuoy,
  PlusCircle,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  ShieldCheck,
  Send,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { PortalSupportTicket, PortalTicketCategory, PortalTicketPriority } from "@/types/portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ClientSupportPage() {
  const { client, tickets, createTicket, addTicketReply } = usePortalData();
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<PortalSupportTicket | null>(null);

  // New Ticket Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<PortalTicketCategory>("SEO & Rankings");
  const [priority, setPriority] = useState<PortalTicketPriority>("Medium");
  const [initialMessage, setInitialMessage] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // Thread Reply State
  const [replyText, setReplyText] = useState("");

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim() || !client) return;

    const newTkt = createTicket(
      {
        clientId: client.clientId,
        clientName: client.businessName,
        subject: subject.trim(),
        category,
        priority,
        status: "Open",
      },
      initialMessage.trim(),
      client.contactPerson
    );

    setCreateSuccess(true);
    setTimeout(() => {
      setNewTicketModalOpen(false);
      setCreateSuccess(false);
      setSubject("");
      setInitialMessage("");
      setSelectedTicket(newTkt);
    }, 1200);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim() || !client) return;

    addTicketReply(
      selectedTicket.id,
      "client",
      client.contactPerson,
      replyText.trim(),
      "Client Contact"
    );

    // Refresh selected ticket in modal view
    const updated = tickets.find((t) => t.id === selectedTicket.id);
    if (updated) {
      setSelectedTicket({ ...updated });
    }
    setReplyText("");
  };

  // Keep modal thread synced if ticket updates
  const currentModalTicket = selectedTicket ? tickets.find((t) => t.id === selectedTicket.id) || selectedTicket : null;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-600 font-bold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" />
            Direct Account Support Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Support Tickets & Inquiries
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Connect directly with your Axenta account managers, SEO strategists, and technical team.
          </p>
        </div>

        <button
          onClick={() => setNewTicketModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Raise New Support Ticket
        </button>
      </div>

      {/* SLA & Account Manager Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="corp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Priority SLA Guarantee</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">&lt; 2 Hours Fast Response</p>
          </div>
        </div>

        <div className="corp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Dedicated Account Lead</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">{client?.accountManager}</p>
          </div>
        </div>

        <div className="corp-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold">Client Support PIN</p>
            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">PIN: {client?.supportPin}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="corp-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-600" />
            Your Support History ({tickets.length})
          </h2>
          <span className="text-xs text-slate-400">Click any ticket to open discussion</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No tickets raised yet. Click &quot;Raise New Support Ticket&quot; to begin.
            </div>
          ) : (
            tickets.map((tkt) => (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicket(tkt)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {tkt.ticketId}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {tkt.category}
                    </Badge>
                    <Badge
                      variant={
                        tkt.priority === "Urgent"
                          ? "destructive"
                          : tkt.priority === "High"
                          ? "warning"
                          : "default"
                      }
                      className="text-[9px] uppercase font-bold"
                    >
                      {tkt.priority}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {tkt.subject}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {tkt.messages[tkt.messages.length - 1]?.message}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                  <Badge
                    variant={
                      tkt.status === "Resolved"
                        ? "success"
                        : tkt.status === "In Progress"
                        ? "info"
                        : tkt.status === "Awaiting Client"
                        ? "warning"
                        : "default"
                    }
                    className="text-[10px] uppercase font-bold"
                  >
                    {tkt.status}
                  </Badge>
                  <span className="text-[11px] text-slate-400">{tkt.updatedAt}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Conversation Thread Modal */}
      <AnimatePresence>
        {currentModalTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-6 flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {currentModalTicket.ticketId}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {currentModalTicket.category}
                    </Badge>
                    <Badge
                      variant={
                        currentModalTicket.status === "Resolved"
                          ? "success"
                          : currentModalTicket.status === "In Progress"
                          ? "info"
                          : "default"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {currentModalTicket.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {currentModalTicket.subject}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
                {currentModalTicket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "client" ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {msg.senderName}
                      </span>
                      {msg.senderRole && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                          {msg.senderRole}
                        </span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === "client"
                          ? "bg-[#0F2557] text-white rounded-br-none"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Type your response to the Axenta support team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Raise New Support Ticket Modal */}
      <AnimatePresence>
        {newTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-purple-600" />
                  Raise Support Ticket
                </h3>
                <button
                  onClick={() => setNewTicketModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {createSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold text-slate-900 dark:text-white">Ticket Created Successfully!</p>
                  <p className="text-xs text-slate-400">Opening conversation thread...</p>
                </div>
              ) : (
                <form onSubmit={handleCreateTicket} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Subject / Issue Summary
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Query regarding Google ranking update or invoice copy"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="SEO & Rankings">SEO & Rankings</option>
                        <option value="Billing & Invoices">Billing & Invoices</option>
                        <option value="Project Deliverables">Project Deliverables</option>
                        <option value="Website & Technical">Website & Technical</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Detailed Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain the problem or question with any relevant links..."
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewTicketModalOpen(false)}
                      className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-semibold"
                    >
                      Cancel
                    </button>
                    <Button type="submit" className="bg-purple-600 text-white font-bold hover:bg-purple-700">
                      Submit Ticket
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

