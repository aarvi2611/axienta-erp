"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Printer,
  Eye,
  Send,
  Building,
  Calendar,
  X,
  ShieldCheck,
  ArrowUpRight,
  Trash2
} from "lucide-react";
import { usePortalData } from "@/hooks/usePortalData";
import { ClientInvoice } from "@/types/portal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ClientInvoicesPage() {
  const { client, invoices, dues, recordPayment } = usePortalData();
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);
  const [payModalInvoice, setPayModalInvoice] = useState<ClientInvoice | null>(null);

  // Pay Modal Form State
  const [payAmount, setPayAmount] = useState<string>("");
  const [payRef, setPayRef] = useState<string>("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter;
  });

  const handleOpenPayModal = (inv: ClientInvoice) => {
    setPayModalInvoice(inv);
    setPayAmount(String(inv.dueAmount ?? inv.totalAmount ?? 0));
    setPayRef("");
    setPaymentSuccess(false);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice || !payRef.trim()) return;
    const amount = Number(payAmount) || payModalInvoice.dueAmount;
    recordPayment(payModalInvoice.id, amount, payRef);
    setPaymentSuccess(true);
    setTimeout(() => {
      setPayModalInvoice(null);
      setPaymentSuccess(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#D4A843] font-bold uppercase tracking-wider">
            <CreditCard className="w-4 h-4" />
            Financial & Invoicing Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Invoices & Pending Dues
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your billing statements, view itemized receipts, and track cleared or pending dues.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            Billing Contact: <strong className="text-slate-900 dark:text-white">{client?.contactPerson}</strong>
          </div>
        </div>
      </div>

      {/* 3 Summary Ledger Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="corp-card p-5 border-l-4 border-l-blue-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Invoiced
          </p>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            ₹{(dues.totalPaid + dues.totalDue).toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-2">All billing cycles to date</p>
        </div>

        <div className="corp-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cleared & Paid
          </p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{dues.totalPaid.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Successfully Settled</span>
          </div>
        </div>

        <div className="corp-card p-5 border-l-4 border-l-amber-500 bg-amber-50/20 dark:bg-amber-950/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Pending Dues
          </p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
            ₹{dues.totalDue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-xs mt-2">
            {dues.overdueCount > 0 ? (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {dues.overdueCount} Overdue Invoice(s)
              </span>
            ) : dues.totalDue > 0 ? (
              <span className="text-amber-600 font-medium">Pending invoice settlement</span>
            ) : (
              <span className="text-emerald-600 font-semibold">Zero balance due</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { key: "all", label: "All Invoices", count: invoices.length },
            { key: "pending", label: "Pending", count: invoices.filter((i) => i.status === "pending").length },
            { key: "overdue", label: "Overdue", count: invoices.filter((i) => i.status === "overdue").length },
            { key: "paid", label: "Paid", count: invoices.filter((i) => i.status === "paid").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                filter === tab.key
                  ? "bg-[#0F2557] text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  filter === tab.key ? "bg-[#D4A843] text-slate-950" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400">Showing {filteredInvoices.length} billing records</p>
      </div>

      {/* Invoices Table */}
      <div className="corp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Invoice #</th>
                <th className="px-4 py-3.5">Description</th>
                <th className="px-4 py-3.5">Issue Date</th>
                <th className="px-4 py-3.5">Due Date</th>
                <th className="px-4 py-3.5 text-right">Total Amount</th>
                <th className="px-4 py-3.5 text-right">Due Balance</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No invoices matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                      {inv.items[0]?.description || "Consulting Retainer"}
                      {inv.items.length > 1 && (
                        <span className="text-[10px] text-slate-400 ml-1">+{inv.items.length - 1} more</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">{inv.issueDate}</td>
                    <td className="px-4 py-4 text-slate-500 font-medium">{inv.dueDate}</td>
                    <td className="px-4 py-4 text-right font-black text-slate-900 dark:text-white">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right font-black">
                      {inv.dueAmount > 0 ? (
                        <span className="text-red-500">₹{inv.dueAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-600">₹0</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge
                        variant={
                          inv.status === "paid"
                            ? "success"
                            : inv.status === "pending"
                            ? "warning"
                            : "destructive"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="View & Print Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.dueAmount > 0 && (
                          <button
                            onClick={() => handleOpenPayModal(inv)}
                            className="px-2.5 py-1 rounded-lg bg-[#D4A843] text-slate-950 font-bold hover:bg-[#E5BE5E] transition-colors text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail & Print Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Actions Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D4A843]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Official Invoice Voucher
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Invoice Printable View */}
              <div className="p-8 space-y-6 print:p-0">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#0F2557] text-[#D4A843] flex items-center justify-center font-black text-base">
                        A
                      </div>
                      <span className="font-extrabold text-lg text-[#0F2557] dark:text-white">
                        Axenta Business Consulting
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Enterprise ERP, Growth Consulting & SEO Services
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      GSTIN: 07AAACA1234F1Z5 • support@axenta.erp
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase font-bold text-slate-400">Invoice Number</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      {selectedInvoice.invoiceNumber}
                    </p>
                    <Badge
                      variant={
                        selectedInvoice.status === "paid"
                          ? "success"
                          : selectedInvoice.status === "pending"
                          ? "warning"
                          : "destructive"
                      }
                      className="mt-1 text-[10px] uppercase font-bold"
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>

                {/* Bill To & Dates */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs">
                  <div>
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Billed To</p>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">
                      {selectedInvoice.clientName}
                    </p>
                    <p className="text-slate-500">{client?.contactPerson}</p>
                    <p className="text-slate-500">{client?.email}</p>
                    <p className="text-slate-500">{client?.domain}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 uppercase text-[10px]">Invoice Dates</p>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5">
                      Date of Issue: <strong className="font-semibold">{selectedInvoice.issueDate}</strong>
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      Payment Due: <strong className="font-semibold text-red-500">{selectedInvoice.dueDate}</strong>
                    </p>
                    {selectedInvoice.paymentDate && (
                      <p className="text-emerald-600 font-semibold mt-1">
                        Settled on: {selectedInvoice.paymentDate}
                      </p>
                    )}
                  </div>
                </div>

                {/* Line Items */}
                <div className="border rounded-xl border-slate-200 dark:border-slate-700 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3 text-left">Service Item & Description</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                            {item.description}
                          </td>
                          <td className="p-3 text-center text-slate-500">{item.qty}</td>
                          <td className="p-3 text-right text-slate-500">₹{item.rate.toLocaleString()}</td>
                          <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{item.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end text-xs">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span>Total Invoice Amount:</span>
                      <span>₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-emerald-600">
                      <span>Amount Cleared:</span>
                      <span>₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-black text-amber-600 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
                      <span>Pending Due:</span>
                      <span>₹{selectedInvoice.dueAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500">
                    <strong>Notes:</strong> {selectedInvoice.notes}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Payment Reference Modal */}
      <AnimatePresence>
        {payModalInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#D4A843]" />
                  Submit Payment Reference
                </h3>
                <button
                  onClick={() => setPayModalInvoice(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {paymentSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <p className="font-bold text-slate-900 dark:text-white">Payment Recorded!</p>
                  <p className="text-xs text-slate-400">
                    Your payment ledger and invoice dues have been successfully updated.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirmPayment} className="mt-4 space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-1">
                    <p className="text-slate-500">Invoice: <strong className="text-slate-900 dark:text-white">{payModalInvoice.invoiceNumber}</strong></p>
                    <p className="text-slate-500">Outstanding Balance: <strong className="text-red-500">₹{payModalInvoice.dueAmount.toLocaleString()}</strong></p>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">Axenta Bank Details for NEFT/IMPS:</p>
                      <p>Bank: HDFC Bank • Account: 50200084729103</p>
                      <p>IFSC: HDFC0001042 • UPI ID: axenta.business@hdfcbank</p>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Amount Paying (₹)
                    </label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      max={payModalInvoice.dueAmount}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Bank Transaction ID / UTR / Reference #
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UTR1948203810 or UPI Ref"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPayModalInvoice(null)}
                      className="px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 font-semibold"
                    >
                      Cancel
                    </button>
                    <Button type="submit" className="bg-[#D4A843] text-slate-950 font-bold hover:bg-[#E5BE5E]">
                      Confirm Payment
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

