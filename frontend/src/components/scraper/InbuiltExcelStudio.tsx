"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileSpreadsheet, Plus, Trash2, Download, Upload, Save,
  Search, RefreshCw, CheckCircle2, Cloud, ExternalLink,
  ShieldCheck, Settings, Columns, Filter, Calculator, Sparkles,
  ArrowUpDown, Share2, Users, FileText, Check, Lock, ChevronRight
} from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export interface ExcelRow {
  _id: string;
  [key: string]: any;
}

const DEFAULT_COLUMNS = [
  "Business Name",
  "Phone",
  "Email",
  "Category",
  "Rating",
  "Address",
  "Website",
  "Status",
  "Estimated Revenue",
  "Sales Rep",
  "Notes",
];

const INITIAL_DEMO_ROWS: ExcelRow[] = [
  {
    _id: "row-1",
    "Business Name": "Apex Financial Consulting",
    Phone: "+91 98201 12345",
    Email: "contact@apexfinance.in",
    Category: "Financial Services",
    Rating: "4.8",
    Address: "BKC, Mumbai",
    Website: "https://apexfinance.example.com",
    Status: "Hot Lead",
    "Estimated Revenue": "150000",
    "Sales Rep": "CEO / Admin",
    Notes: "Requested immediate business consultation",
  },
  {
    _id: "row-2",
    "Business Name": "Zenith Retail Group",
    Phone: "+91 98112 54321",
    Email: "info@zenithretail.in",
    Category: "E-Commerce & Retail",
    Rating: "4.5",
    Address: "Connaught Place, New Delhi",
    Website: "https://zenithretail.example.com",
    Status: "Proposal Sent",
    "Estimated Revenue": "85000",
    "Sales Rep": "Sales Team",
    Notes: "Interested in payment automation",
  },
  {
    _id: "row-3",
    "Business Name": "Nexus Tech Ventures",
    Phone: "+91 99000 88776",
    Email: "growth@nexustech.io",
    Category: "IT & Software",
    Rating: "4.9",
    Address: "HSR Layout, Bengaluru",
    Website: "https://nexustech.example.com",
    Status: "Contacted",
    "Estimated Revenue": "220000",
    "Sales Rep": "Calling Team",
    Notes: "High-value enterprise consulting lead",
  },
];

interface InbuiltExcelStudioProps {
  scrapedLeads?: any[];
  onPushToCrm?: (leads: any[]) => void;
}

export default function InbuiltExcelStudio({
  scrapedLeads = [],
  onPushToCrm,
}: InbuiltExcelStudioProps) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<ExcelRow[]>(INITIAL_DEMO_ROWS);
  const [activeCell, setActiveCell] = useState<{ rowIdx: number; col: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ col: string; direction: "asc" | "desc" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>("");
  const [newColName, setNewColName] = useState("");
  const [showAddColDialog, setShowAddColDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbuilt" | "cloud_embed">("inbuilt");
  const [formulaResult, setFormulaResult] = useState<string | null>(null);

  // CEO Master Cloud Config State
  const [showCeoConfigDialog, setShowCeoConfigDialog] = useState(false);
  const [cloudSheetUrl, setCloudSheetUrl] = useState(
    "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit?usp=sharing"
  );
  const [cloudSheetTitle, setCloudSheetTitle] = useState("Axienta Master Sales & Scraper Sheet");
  const [isCeoSaved, setIsCeoSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCeoOrAdmin =
    user?.role === "ceo" ||
    user?.role === "admin" ||
    user?.role === "head_manager" ||
    user?.email?.toLowerCase().includes("ceo");

  // Load shared master excel state from Firebase Firestore
  useEffect(() => {
    async function loadSharedExcel() {
      try {
        const docRef = doc(db, "operations", "shared_scraper_excel");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          if (Array.isArray(data.columns) && data.columns.length > 0) {
            setColumns(data.columns);
          }
          if (Array.isArray(data.rows) && data.rows.length > 0) {
            setRows(data.rows);
          }
          if (data.updatedAt) {
            setLastSaved(new Date(data.updatedAt).toLocaleTimeString());
          }
        } else {
          // Check local storage fallback
          const local = localStorage.getItem("axienta_shared_excel_sheet");
          if (local) {
            const parsed = JSON.parse(local);
            if (parsed.columns) setColumns(parsed.columns);
            if (parsed.rows) setRows(parsed.rows);
          }
        }
      } catch (err) {
        console.warn("Notice loading shared excel sheet:", err);
      }

      // Load CEO cloud config
      try {
        const configRef = doc(db, "settings", "shared_excel_config");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
          const cfg = configSnap.data();
          if (cfg.url) setCloudSheetUrl(cfg.url);
          if (cfg.title) setCloudSheetTitle(cfg.title);
          setIsCeoSaved(true);
        }
      } catch (err) {}
    }
    loadSharedExcel();
  }, []);

  // Save to Firebase Firestore (Shared across all user accounts / IDs)
  const saveToCloud = async (customRows = rows, customCols = columns) => {
    setIsSaving(true);
    try {
      const payload = {
        columns: customCols,
        rows: customRows,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.displayName || user?.email || "Team Member",
        totalRows: customRows.length,
      };

      await setDoc(doc(db, "operations", "shared_scraper_excel"), payload, { merge: true });
      localStorage.setItem("axienta_shared_excel_sheet", JSON.stringify(payload));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn("Cloud save warning, saving locally:", err);
      localStorage.setItem(
        "axienta_shared_excel_sheet",
        JSON.stringify({ columns: customCols, rows: customRows, updatedAt: new Date().toISOString() })
      );
      setLastSaved(new Date().toLocaleTimeString());
    } finally {
      setIsSaving(false);
    }
  };

  // Save CEO Master Cloud Configuration
  const handleSaveCeoConfig = async () => {
    try {
      await setDoc(
        doc(db, "settings", "shared_excel_config"),
        {
          url: cloudSheetUrl,
          title: cloudSheetTitle,
          configuredBy: user?.displayName || user?.email || "CEO",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setIsCeoSaved(true);
      setShowCeoConfigDialog(false);
      alert("CEO Master Cloud Excel configuration saved! All employees across all accounts now share this sheet.");
    } catch (err: any) {
      alert("Error saving configuration: " + err.message);
    }
  };

  // Insert Scraped Leads into the Inbuilt Excel
  const importScrapedLeadsToExcel = (leadsToImport = scrapedLeads) => {
    if (!leadsToImport || leadsToImport.length === 0) {
      alert("No scraped leads found in buffer to send to Excel. Scrape leads first!");
      return;
    }

    const newRows: ExcelRow[] = leadsToImport.map((lead, idx) => ({
      _id: `lead-${Date.now()}-${idx}`,
      "Business Name": lead.businessName || "",
      Phone: lead.phone || "",
      Email: lead.email || "",
      Category: lead.category || "Scraped Business",
      Rating: String(lead.rating || "4.5"),
      Address: lead.address || "",
      Website: lead.website || "",
      Status: lead.isValid ? "Verified Lead" : "Needs Review",
      "Estimated Revenue": "50000",
      "Sales Rep": user?.displayName || "Unassigned",
      Notes: `Scraped from Maps. Source ID: ${lead.id || idx}`,
    }));

    const updated = [...newRows, ...rows];
    setRows(updated);
    saveToCloud(updated, columns);
    alert(`Successfully transferred ${newRows.length} scraped leads into the Inbuilt Excel Sheet!`);
  };

  // Cell editing
  const handleStartEdit = (rowIdx: number, col: string, currentVal: any) => {
    setActiveCell({ rowIdx, col });
    setEditValue(currentVal !== undefined && currentVal !== null ? String(currentVal) : "");
  };

  const handleCommitEdit = () => {
    if (!activeCell) return;
    const { rowIdx, col } = activeCell;
    const updated = [...rows];
    updated[rowIdx] = {
      ...updated[rowIdx],
      [col]: editValue,
    };
    setRows(updated);
    setActiveCell(null);
    setEditValue("");
  };

  // Row & Column operations
  const handleAddRow = () => {
    const newRow: ExcelRow = {
      _id: `row-${Date.now()}`,
    };
    columns.forEach((col) => {
      newRow[col] = "";
    });
    const updated = [newRow, ...rows];
    setRows(updated);
    saveToCloud(updated, columns);
  };

  const handleDeleteRow = (index: number) => {
    const updated = rows.filter((_, idx) => idx !== index);
    setRows(updated);
    saveToCloud(updated, columns);
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const colTrimmed = newColName.trim();
    if (columns.includes(colTrimmed)) {
      alert("Column already exists!");
      return;
    }
    const newCols = [...columns, colTrimmed];
    setColumns(newCols);
    setNewColName("");
    setShowAddColDialog(false);
    saveToCloud(rows, newCols);
  };

  // Sorting
  const handleSort = (col: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.col === col && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ col, direction });

    const sorted = [...rows].sort((a, b) => {
      const valA = a[col] || "";
      const valB = b[col] || "";
      if (typeof valA === "number" && typeof valB === "number") {
        return direction === "asc" ? valA - valB : valB - valA;
      }
      return direction === "asc"
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    setRows(sorted);
  };

  // Quick calculations / formula metrics
  const calculateTotalRevenue = () => {
    const sum = rows.reduce((acc, r) => {
      const num = parseFloat(String(r["Estimated Revenue"] || "0").replace(/[^0-9.]/g, ""));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);
    setFormulaResult(`Total Pipeline Value: ₹${sum.toLocaleString("en-IN")} (${rows.length} records)`);
  };

  const calculateAvgRating = () => {
    let count = 0;
    const sum = rows.reduce((acc, r) => {
      const num = parseFloat(String(r["Rating"] || "0"));
      if (!isNaN(num) && num > 0) {
        count++;
        return acc + num;
      }
      return acc;
    }, 0);
    const avg = count > 0 ? (sum / count).toFixed(2) : "0.0";
    setFormulaResult(`Average Lead Rating: ⭐ ${avg} / 5.0 across ${count} rated businesses`);
  };

  // File Import (.xlsx / .csv)
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];

        if (jsonData.length === 0) {
          alert("Selected file is empty.");
          return;
        }

        // Extract columns from file
        const allKeys = new Set<string>();
        jsonData.forEach((item) => {
          Object.keys(item).forEach((k) => allKeys.add(k));
        });
        const importedCols = Array.from(allKeys);

        const importedRows: ExcelRow[] = jsonData.map((row, i) => ({
          _id: `imported-${Date.now()}-${i}`,
          ...row,
        }));

        setColumns(importedCols);
        setRows(importedRows);
        saveToCloud(importedRows, importedCols);
        alert(`Successfully imported ${importedRows.length} rows with ${importedCols.length} columns!`);
      } catch (err: any) {
        alert("Failed to read Excel file: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel file
  const handleExportXLSX = () => {
    const exportData = rows.map((r) => {
      const cleaned: Record<string, any> = {};
      columns.forEach((col) => {
        cleaned[col] = r[col] || "";
      });
      return cleaned;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Axienta Sales Sheet");
    XLSX.writeFile(wb, `Axienta_Sales_Excel_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filtered rows
  const filteredRows = rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return columns.some((col) => String(row[col] || "").toLowerCase().includes(q));
  });

  // Convert Google Sheet URL to embeddable preview if applicable
  const getEmbeddableSheetUrl = (rawUrl: string) => {
    if (!rawUrl) return "";
    if (rawUrl.includes("docs.google.com/spreadsheets") && !rawUrl.includes("pubhtml")) {
      return rawUrl.replace(/\/edit.*$/, "/preview");
    }
    return rawUrl;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Master Single-Login Cloud Status */}
      <div className="bg-gradient-to-r from-[#0F2557] via-[#1A3A7A] to-[#0A192F] text-white p-4 rounded-2xl border border-[#D4A843]/40 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#D4A843] text-slate-950 flex items-center justify-center font-black shadow-lg shadow-[#D4A843]/20">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">Axienta Sales Inbuilt Excel Studio</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3 h-3" /> Unified Shared Workspace
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Work on scraped leads inside this unified spreadsheet • Real-time cloud sync across all employee IDs
            </p>
          </div>
        </div>

        {/* CEO Master Setup & View Switcher */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {isCeoOrAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCeoConfigDialog(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
            >
              <Settings className="w-3.5 h-3.5 mr-1 text-[#D4A843]" />
              CEO Cloud Master Setup
            </Button>
          )}

          <div className="flex items-center bg-black/30 p-1 rounded-lg border border-white/10">
            <button
              onClick={() => setActiveTab("inbuilt")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1",
                activeTab === "inbuilt"
                  ? "bg-[#D4A843] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Inbuilt Sheet Studio
            </button>
            <button
              onClick={() => setActiveTab("cloud_embed")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1",
                activeTab === "cloud_embed"
                  ? "bg-[#D4A843] text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              )}
            >
              <Cloud className="w-3.5 h-3.5" />
              CEO Master Cloud Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === "inbuilt" ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-lg">
          {/* Studio Action Toolbar */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            {/* Left Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" onClick={handleAddRow} className="bg-[#0F2557] hover:bg-[#1a387a] text-white">
                <Plus className="w-4 h-4 mr-1 text-[#D4A843]" /> Add Row
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddColDialog(true)}
                className="border-slate-300 dark:border-slate-700"
              >
                <Columns className="w-4 h-4 mr-1 text-slate-500" /> Add Column
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => importScrapedLeadsToExcel()}
                className="bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                title="Send any scraped data in buffer directly into this sheet"
              >
                <Sparkles className="w-4 h-4 mr-1 text-[#D4A843]" />
                Pull Scraped Leads ({scrapedLeads.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveToCloud()}
                disabled={isSaving}
                className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                {isSaving ? (
                  <RefreshCw className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 mr-1" />
                )}
                {isSaving ? "Saving..." : "Save to Cloud"}
              </Button>
            </div>

            {/* Right Tools: Import/Export, Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <Input
                  placeholder="Filter sheet rows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-8 bg-white dark:bg-slate-950"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileImport}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1" /> Import
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportXLSX}
                className="h-8 text-xs border-[#D4A843]/60 hover:bg-[#D4A843]/10"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-[#D4A843]" /> Export .xlsx
              </Button>
            </div>
          </div>

          {/* Quick Formula & Calculations Bar */}
          <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-[#D4A843]" /> Formulas:
              </span>
              <button
                onClick={calculateTotalRevenue}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#D4A843] transition-colors"
              >
                Calculate Total Pipeline (SUM)
              </button>
              <button
                onClick={calculateAvgRating}
                className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#D4A843] transition-colors"
              >
                Calculate Avg Rating (AVG)
              </button>
              {formulaResult && (
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                  {formulaResult}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                {lastSaved ? `Shared live at ${lastSaved}` : "Auto-sync active"}
              </span>
              <span>•</span>
              <span>{filteredRows.length} rows loaded</span>
            </div>
          </div>

          {/* Excel Grid Container */}
          <div className="overflow-x-auto max-h-[620px] select-text">
            <table className="w-full border-collapse text-xs font-sans">
              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
                <tr>
                  <th className="w-12 px-2 py-2.5 text-center font-bold text-slate-500 border-r border-slate-300 dark:border-slate-700 bg-slate-300/60 dark:bg-slate-900">
                    #
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left font-bold text-slate-700 dark:text-slate-200 border-r border-slate-300 dark:border-slate-700 whitespace-nowrap min-w-[130px]"
                    >
                      <div className="flex items-center justify-between gap-1 group">
                        <span className="truncate">{col}</span>
                        <button
                          onClick={() => handleSort(col)}
                          className="opacity-40 group-hover:opacity-100 hover:text-[#D4A843] transition-opacity"
                          title={`Sort by ${col}`}
                        >
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="w-16 px-2 py-2 text-center font-bold text-slate-500">Action</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 2} className="py-12 text-center text-slate-400">
                      <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#D4A843]" />
                      <p className="font-medium text-sm">No spreadsheet data available</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Click &quot;Add Row&quot;, &quot;Pull Scraped Leads&quot; or import an Excel file to begin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, rIdx) => (
                    <tr
                      key={row._id || rIdx}
                      className="hover:bg-amber-50/40 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Row Index */}
                      <td className="px-2 py-1.5 text-center font-mono text-[11px] text-slate-400 bg-slate-100/60 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800">
                        {rIdx + 1}
                      </td>

                      {/* Cell Columns */}
                      {columns.map((col) => {
                        const isEditing = activeCell?.rowIdx === rIdx && activeCell?.col === col;
                        const cellVal = row[col];

                        return (
                          <td
                            key={col}
                            onClick={() => handleStartEdit(rIdx, col, cellVal)}
                            className={cn(
                              "px-3 py-1.5 border-r border-slate-200 dark:border-slate-800 max-w-[260px] truncate cursor-pointer",
                              isEditing
                                ? "p-0 bg-blue-50 dark:bg-blue-950/50 ring-2 ring-[#0F2557] ring-inset"
                                : ""
                            )}
                          >
                            {isEditing ? (
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleCommitEdit}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleCommitEdit();
                                  if (e.key === "Escape") setActiveCell(null);
                                }}
                                className="w-full h-full px-2 py-1 text-xs outline-none bg-transparent dark:text-white"
                              />
                            ) : (
                              <span
                                className={cn(
                                  cellVal ? "text-slate-800 dark:text-slate-200" : "text-slate-400 italic",
                                  col === "Status" && cellVal === "Hot Lead" && "font-semibold text-amber-500",
                                  col === "Status" && cellVal === "Verified Lead" && "font-semibold text-emerald-500",
                                  col === "Estimated Revenue" && "font-mono font-medium text-slate-700 dark:text-slate-300"
                                )}
                              >
                                {cellVal !== undefined && cellVal !== "" ? String(cellVal) : "—"}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* Delete Row Action */}
                      <td className="px-2 py-1.5 text-center">
                        <button
                          onClick={() => handleDeleteRow(rIdx)}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Push to CRM */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500">
              💡 Tip: Click any cell to edit inline. Press Enter or click away to save.
            </span>
            {rows.length > 0 && onPushToCrm && (
              <Button
                size="sm"
                onClick={() => onPushToCrm(rows)}
                className="bg-gradient-to-r from-[#0F2557] to-[#1A3A7A] text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-1 text-[#D4A843]" />
                Send Current Sheet Leads ({rows.length}) to CRM Pipeline
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* CEO Master Cloud Sheet Embed (Google Sheets / Microsoft 365) */
        <Card className="border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">{cloudSheetTitle}</h3>
                <p className="text-xs text-slate-400">
                  Shared Master Cloud Workbook • CEO Configured Single Login
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(cloudSheetUrl, "_blank")}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1 text-[#D4A843]" /> Open in New Tab
              </Button>
              {isCeoOrAdmin && (
                <Button
                  size="sm"
                  onClick={() => setShowCeoConfigDialog(true)}
                  className="bg-[#D4A843] hover:bg-[#c49835] text-slate-950 font-bold text-xs"
                >
                  <Settings className="w-3.5 h-3.5 mr-1" /> Change Link
                </Button>
              )}
            </div>
          </div>

          {/* Embedded Cloud Sheet iFrame */}
          <div className="h-[750px] w-full bg-white relative">
            <iframe
              src={getEmbeddableSheetUrl(cloudSheetUrl)}
              title="CEO Shared Cloud Sheet"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
            />
          </div>
        </Card>
      )}

      {/* Dialog: Add Custom Column */}
      <Dialog open={showAddColDialog} onOpenChange={setShowAddColDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Columns className="w-5 h-5 text-[#D4A843]" /> Add Column to Spreadsheet
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <p className="text-xs text-slate-500">
              Enter the header name for the new column. It will immediately appear across all team members&apos; views.
            </p>
            <Input
              placeholder="e.g. Lead Score, WhatsApp, Meeting Date"
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddColDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddColumn} className="bg-[#0F2557] text-white">
              Add Column
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: CEO Master Cloud Account Setup */}
      <Dialog open={showCeoConfigDialog} onOpenChange={setShowCeoConfigDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Lock className="w-5 h-5 text-[#D4A843]" /> CEO Master Cloud Excel Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-900 dark:text-amber-200">
              <p className="font-semibold mb-1">👑 Master Single-Login Rule:</p>
              <p>
                As CEO / Executive, configure your company&apos;s Google Sheets or Microsoft Excel 365 Web URL once below.
                All employees who log in with their respective IDs will automatically access and collaborate on this exact same file without needing individual logins!
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200">Workbook Title</label>
              <Input
                value={cloudSheetTitle}
                onChange={(e) => setCloudSheetTitle(e.target.value)}
                placeholder="Axienta Master Sales & Scraper Sheet"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-200">
                Shared Cloud URL (Google Sheets or Excel 365 Embed/Share Link)
              </label>
              <Input
                value={cloudSheetUrl}
                onChange={(e) => setCloudSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              />
              <p className="text-[11px] text-slate-400">
                Tip: For Google Sheets, make sure the link sharing setting is &quot;Anyone with the link can edit/view&quot;.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCeoConfigDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCeoConfig} className="bg-[#0F2557] hover:bg-[#1b3a7c] text-white">
              Save Master Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
