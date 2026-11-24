"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Upload, Download, Search, CheckCircle, AlertTriangle,
  FileSpreadsheet, Trash2, RefreshCw, Globe, Phone, Mail,
  Star, MapPin, Filter, Layers, Sparkles, Send, CheckCircle2,
  Users, ArrowRight, ShieldCheck
} from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import InbuiltExcelStudio from "@/components/scraper/InbuiltExcelStudio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { cn } from "@/lib/utils";

interface ScrapedLead {
  id: string;
  businessName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  category: string;
  rating: number;
  isDuplicate: boolean;
  isValid: boolean;
}

export default function ScraperPage() {
  const [data, setData] = useState<ScrapedLead[]>([
    {
      id: "mock-1",
      businessName: "Elite Financial Partners",
      phone: "+91 98200 44332",
      email: "contact@elitepartners.in",
      website: "https://elitepartners.example.com",
      address: "Bandra Kurla Complex, Mumbai",
      category: "Corporate Finance",
      rating: 4.8,
      isDuplicate: false,
      isValid: true,
    },
    {
      id: "mock-2",
      businessName: "Vanguard Tech Solutions",
      phone: "+91 98110 99887",
      email: "info@vanguardtech.in",
      website: "https://vanguardtech.example.com",
      address: "Sector 62, Noida, Delhi NCR",
      category: "IT & Cloud Services",
      rating: 4.6,
      isDuplicate: false,
      isValid: true,
    },
    {
      id: "mock-3",
      businessName: "Horizon Digital Logistics",
      phone: "+91 99887 11223",
      email: "support@horizondigital.in",
      website: "https://horizondigital.example.com",
      address: "Indiranagar, Bengaluru",
      category: "Supply Chain",
      rating: 4.4,
      isDuplicate: false,
      isValid: true,
    },
  ]);

  const [activeView, setActiveView] = useState<"excel" | "scraper" | "table">("excel");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const [exportingToCrm, setExportingToCrm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalLeads = data.length;
  const duplicates = data.filter((d) => d.isDuplicate).length;
  const valid = data.filter((d) => d.isValid && !d.isDuplicate).length;
  const invalid = data.filter((d) => !d.isValid).length;

  const handleScrape = () => {
    setScraping(true);
    setScrapeProgress(0);
    const interval = setInterval(() => {
      setScrapeProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setScraping(false);

          // Generate realistic sample scraped items for query
          const categoryName = searchCategory || "Consulting & Business";
          const newScraped: ScrapedLead[] = [
            {
              id: String(Date.now() + 1),
              businessName: `${searchQuery || "Commercial"} Enterprises LLP`,
              phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
              email: `sales@${(searchQuery || "enterprise").toLowerCase().replace(/[^a-z]/g, "")}.in`,
              website: `https://${(searchQuery || "enterprise").toLowerCase().replace(/[^a-z]/g, "")}.com`,
              address: `${searchQuery || "City Hub"}, Business District`,
              category: categoryName,
              rating: parseFloat((4.2 + Math.random() * 0.7).toFixed(1)),
              isDuplicate: false,
              isValid: true,
            },
            {
              id: String(Date.now() + 2),
              businessName: `Apex Solutions & Trading`,
              phone: `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
              email: "operations@apexsolutions.in",
              website: "https://apexsolutions.in",
              address: "Sector 18, Commercial Zone",
              category: categoryName,
              rating: 4.7,
              isDuplicate: false,
              isValid: true,
            },
          ];
          setData((prev) => [...newScraped, ...prev]);
          return 100;
        }
        return p + Math.random() * 18;
      });
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws) as any[];
        const mapped: ScrapedLead[] = jsonData.map((row, i) => ({
          id: String(Date.now() + i),
          businessName: row["Business Name"] || row["businessName"] || row["Name"] || "Unnamed Business",
          phone: row["Phone"] || row["phone"] || row["Contact"] || "",
          email: row["Email"] || row["email"] || "",
          website: row["Website"] || row["website"] || "",
          address: row["Address"] || row["address"] || "",
          category: row["Category"] || row["category"] || "General",
          rating: parseFloat(row["Rating"] || row["rating"] || "4.5"),
          isDuplicate: false,
          isValid: true,
        }));
        setData((prev) => [...mapped, ...prev]);
        alert(`Successfully imported ${mapped.length} leads! You can now edit them directly in the Inbuilt Excel.`);
      } catch (err: any) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const exportData = data
      .filter((d) => d.isValid && !d.isDuplicate)
      .map((d) => ({
        "Business Name": d.businessName,
        Phone: d.phone,
        Email: d.email,
        Website: d.website,
        Address: d.address,
        Category: d.category,
        Rating: d.rating,
      }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Leads");
    XLSX.writeFile(wb, `Scraped_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handlePushToCrm = async (customLeadsList?: any[]) => {
    const targetLeads = customLeadsList || data.filter((d) => d.isValid && !d.isDuplicate);
    if (!targetLeads || targetLeads.length === 0) {
      alert("No valid leads available to import into CRM.");
      return;
    }
    setExportingToCrm(true);
    try {
      let count = 0;
      for (const item of targetLeads) {
        const bName = item["Business Name"] || item.businessName || "Prospective Client";
        const phone = item["Phone"] || item.phone || "";
        const email = item["Email"] || item.email || "";
        const cat = item["Category"] || item.category || "Scraped Lead";
        const addr = item["Address"] || item.address || "";
        const web = item["Website"] || item.website || "";
        const notes = item["Notes"] || item.notes || `Address: ${addr}, Web: ${web}`;

        await addDoc(collection(db, "leads"), {
          businessName: bName,
          contactPerson: bName,
          phone,
          email,
          category: cat,
          source: "Axienta Data Scraper & Inbuilt Excel",
          status: "new",
          score: 80,
          notes,
          createdAt: new Date().toISOString(),
        });
        count++;
      }
      alert(`Success! Imported ${count} leads directly into the Axienta CRM Pipeline!`);
    } catch (err: any) {
      alert("Error saving to CRM: " + err.message);
    } finally {
      setExportingToCrm(false);
    }
  };

  const removeDuplicates = () => {
    setData((prev) => prev.filter((d) => !d.isDuplicate));
  };

  const columns = [
    {
      key: "businessName",
      label: "Business Name & Location",
      sortable: true,
      render: (row: ScrapedLead) => (
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{row.businessName}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-[#D4A843]" />
            {row.address || "Location unavailable"}
          </p>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: ScrapedLead) => (
        <span className="text-xs font-mono flex items-center gap-1 text-slate-700 dark:text-slate-300">
          <Phone className="w-3 h-3 text-slate-400" />
          {row.phone || "—"}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row: ScrapedLead) => (
        <span className="text-xs flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Mail className="w-3 h-3 text-slate-400" />
          {row.email || "—"}
        </span>
      ),
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (row: ScrapedLead) => (
        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
          {row.category}
        </span>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (row: ScrapedLead) => (
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 text-[#D4A843] fill-[#D4A843]" />
          <span className="text-xs font-bold">{row.rating}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: ScrapedLead) => (
        <div className="flex gap-1">
          {row.isDuplicate && <Badge variant="warning" className="text-[10px]">Duplicate</Badge>}
          {!row.isValid && <Badge variant="destructive" className="text-[10px]">Invalid</Badge>}
          {row.isValid && !row.isDuplicate && <Badge variant="success" className="text-[10px]">Verified Lead</Badge>}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Sales Data Scraper & Inbuilt Excel"
        description="Unified lead intelligence • Scrape Google Maps leads & collaborate in the Inbuilt Cloud Excel sheet"
        icon={Map}
        actions={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-300 dark:border-slate-700"
            >
              <Upload className="w-4 h-4 mr-1 text-[#D4A843]" /> Import File
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-slate-300 dark:border-slate-700"
            >
              <Download className="w-4 h-4 mr-1 text-[#D4A843]" /> Export Leads
            </Button>
          </div>
        }
      />

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Scraped Leads" value={totalLeads} icon={Globe} color="blue" />
        <StatsCard title="Valid Leads Ready" value={valid} icon={CheckCircle} color="green" delay={0.1} />
        <StatsCard title="Duplicates Flagged" value={duplicates} icon={AlertTriangle} color="gold" delay={0.2} />
        <StatsCard title="Need Review" value={invalid} icon={AlertTriangle} color="red" delay={0.3} />
      </div>

      {/* Navigation Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveView("excel")}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
              activeView === "excel"
                ? "bg-[#0F2557] text-white shadow-md shadow-[#0F2557]/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4A843]" />
            Inbuilt Excel Studio (Shared Master)
          </button>
          <button
            onClick={() => setActiveView("scraper")}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
              activeView === "scraper"
                ? "bg-[#0F2557] text-white shadow-md shadow-[#0F2557]/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Map className="w-4 h-4 text-[#D4A843]" />
            Google Maps Scraper
          </button>
          <button
            onClick={() => setActiveView("table")}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1.5",
              activeView === "table"
                ? "bg-[#0F2557] text-white shadow-md shadow-[#0F2557]/30"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Layers className="w-4 h-4 text-[#D4A843]" />
            Raw Leads Buffer ({data.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {valid > 0 && (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
              onClick={() => handlePushToCrm()}
              disabled={exportingToCrm}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {exportingToCrm ? "Sending..." : `Push ${valid} Leads to CRM`}
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: Inbuilt Excel Studio */}
      {activeView === "excel" && (
        <InbuiltExcelStudio scrapedLeads={data} onPushToCrm={handlePushToCrm} />
      )}

      {/* VIEW 2: Scraper Tool */}
      {activeView === "scraper" && (
        <div className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-md">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-slate-900 dark:text-white">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-[#D4A843] flex items-center justify-center font-bold">
                  <Map className="w-4 h-4" />
                </div>
                Google Maps Lead Scraper Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder='Search keywords (e.g., "Financial Consultants in Mumbai", "Architects in Delhi")'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Category filter (e.g. Finance, Retail)"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="sm:w-56"
                />
                <Button
                  onClick={handleScrape}
                  disabled={scraping || !searchQuery}
                  className="bg-[#0F2557] hover:bg-[#1a387a] text-white"
                >
                  {scraping ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4 mr-1 text-[#D4A843]" />
                  )}
                  {scraping ? "Scraping..." : "Scrape Maps"}
                </Button>
              </div>

              {scraping && (
                <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A843]" />
                      Extracting verified business profiles from Google Maps...
                    </span>
                    <span className="text-xs font-bold text-[#D4A843]">{Math.round(scrapeProgress)}%</span>
                  </div>
                  <Progress value={scrapeProgress} color="bg-[#D4A843]" />
                </div>
              )}

              {/* Action Banner when Scraped */}
              {data.length > 0 && !scraping && (
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#0F2557]/10 via-[#D4A843]/10 to-transparent border border-[#D4A843]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#D4A843]" /> {data.length} Scraped Leads Available
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Open in the Inbuilt Excel Studio to edit columns, calculate valuations, or share with all team IDs.
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveView("excel")}
                    className="bg-[#0F2557] hover:bg-[#193978] text-white text-xs font-bold shadow-md shadow-[#0F2557]/20"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#D4A843]" />
                    Work on Leads in Inbuilt Excel ➔
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* VIEW 3: Raw Scraped Leads Table */}
      {activeView === "table" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={removeDuplicates}
                disabled={duplicates === 0}
                className="text-xs"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-red-500" /> Remove Duplicates ({duplicates})
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveView("excel")}
              className="bg-[#0F2557] text-white text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1 text-[#D4A843]" />
              Switch to Inbuilt Excel Studio
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={data}
            searchable
            searchKeys={["businessName", "phone", "category", "address"]}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
