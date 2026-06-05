"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Map, Upload, Download, Search, CheckCircle, AlertTriangle,
  FileSpreadsheet, Trash2, RefreshCw, Globe, Phone, Mail,
  Star, MapPin, Filter
} from "lucide-react";
import * as XLSX from "xlsx";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/common/PageHeader";
import StatsCard from "@/components/common/StatsCard";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

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

const demoScrapedData: ScrapedLead[] = [
  { id: "1", businessName: "Sharma & Associates", phone: "+91-9876540001", email: "info@sharma.com", website: "www.sharma.com", address: "Connaught Place, Delhi", category: "Legal Services", rating: 4.5, isDuplicate: false, isValid: true },
  { id: "2", businessName: "Patel Electronics", phone: "+91-9876540002", email: "sales@patel.in", website: "www.patel.in", address: "MG Road, Bangalore", category: "Electronics", rating: 4.2, isDuplicate: false, isValid: true },
  { id: "3", businessName: "Kumar Textiles", phone: "+91-9876540003", email: "info@kumartex.com", website: "", address: "Sector 17, Chandigarh", category: "Textiles", rating: 3.8, isDuplicate: true, isValid: true },
  { id: "4", businessName: "Gupta Pharma", phone: "+91-9876540004", email: "", website: "www.guptapharma.com", address: "Banjara Hills, Hyderabad", category: "Pharma", rating: 4.0, isDuplicate: false, isValid: false },
  { id: "5", businessName: "Singh Logistics", phone: "+91-9876540005", email: "contact@singhlog.com", website: "www.singhlog.com", address: "Andheri, Mumbai", category: "Logistics", rating: 4.3, isDuplicate: false, isValid: true },
  { id: "6", businessName: "Reddy Construction", phone: "+91-9876540006", email: "reddy@construct.in", website: "", address: "Jubilee Hills, Hyderabad", category: "Construction", rating: 3.5, isDuplicate: false, isValid: true },
  { id: "7", businessName: "Joshi IT Solutions", phone: "+91-9876540007", email: "joshi@itsol.com", website: "www.joshiit.com", address: "Koramangala, Bangalore", category: "IT", rating: 4.7, isDuplicate: true, isValid: true },
  { id: "8", businessName: "Mehta Financial", phone: "+91-9876540008", email: "info@mehtafin.com", website: "www.mehtafin.com", address: "BKC, Mumbai", category: "Finance", rating: 4.1, isDuplicate: false, isValid: true },
];

export default function ScraperPage() {
  const [data, setData] = useState<ScrapedLead[]>(demoScrapedData);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapeProgress, setScrapeProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalLeads = data.length;
  const duplicates = data.filter(d => d.isDuplicate).length;
  const valid = data.filter(d => d.isValid && !d.isDuplicate).length;
  const invalid = data.filter(d => !d.isValid).length;

  const handleScrape = () => {
    setScraping(true);
    setScrapeProgress(0);
    const interval = setInterval(() => {
      setScrapeProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setScraping(false);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws) as any[];
      const mapped: ScrapedLead[] = jsonData.map((row, i) => ({
        id: String(Date.now() + i),
        businessName: row["Business Name"] || row["businessName"] || "",
        phone: row["Phone"] || row["phone"] || "",
        email: row["Email"] || row["email"] || "",
        website: row["Website"] || row["website"] || "",
        address: row["Address"] || row["address"] || "",
        category: row["Category"] || row["category"] || "",
        rating: parseFloat(row["Rating"] || row["rating"] || "0"),
        isDuplicate: false,
        isValid: true,
      }));
      setData(prev => [...prev, ...mapped]);
    };
    reader.readAsBinaryString(file);
  };

  const handleExport = () => {
    const exportData = data.filter(d => d.isValid && !d.isDuplicate).map(d => ({
      "Business Name": d.businessName,
      "Phone": d.phone,
      "Email": d.email,
      "Website": d.website,
      "Address": d.address,
      "Category": d.category,
      "Rating": d.rating,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scraped Leads");
    XLSX.writeFile(wb, `Scraped_Leads_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const removeDuplicates = () => {
    setData(prev => prev.filter(d => !d.isDuplicate));
  };

  const columns = [
    {
      key: "businessName", label: "Business", sortable: true,
      render: (row: ScrapedLead) => (
        <div>
          <p className="font-medium dark:text-white">{row.businessName}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{row.address}</p>
        </div>
      ),
    },
    {
      key: "phone", label: "Phone",
      render: (row: ScrapedLead) => <span className="text-xs flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" />{row.phone}</span>,
    },
    {
      key: "email", label: "Email",
      render: (row: ScrapedLead) => <span className="text-xs flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" />{row.email || "N/A"}</span>,
    },
    { key: "category", label: "Category", sortable: true },
    {
      key: "rating", label: "Rating",
      render: (row: ScrapedLead) => (
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-[#D4A843] fill-[#D4A843]" />
          <span className="text-xs">{row.rating}</span>
        </div>
      ),
    },
    {
      key: "status", label: "Status",
      render: (row: ScrapedLead) => (
        <div className="flex gap-1">
          {row.isDuplicate && <Badge variant="warning" className="text-[10px]">Duplicate</Badge>}
          {!row.isValid && <Badge variant="destructive" className="text-[10px]">Invalid</Badge>}
          {row.isValid && !row.isDuplicate && <Badge variant="success" className="text-[10px]">Valid</Badge>}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Data Scraper"
        description="Scrape leads from Google Maps and manage imported data"
        icon={Map}
        actions={
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={handleFileUpload} />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Total Scraped" value={totalLeads} icon={Globe} color="blue" />
        <StatsCard title="Valid Leads" value={valid} icon={CheckCircle} color="green" delay={0.1} />
        <StatsCard title="Duplicates" value={duplicates} icon={AlertTriangle} color="gold" delay={0.2} />
        <StatsCard title="Invalid" value={invalid} icon={AlertTriangle} color="red" delay={0.3} />
      </div>

      {/* Scraper Tool */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Map className="w-5 h-5 text-[#D4A843]" />
            Google Maps Scraper
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder='Search query (e.g., "restaurants in Mumbai")' value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1" />
            <Input placeholder="Category filter" value={searchCategory} onChange={e => setSearchCategory(e.target.value)} className="sm:w-48" />
            <Button onClick={handleScrape} disabled={scraping || !searchQuery}>
              {scraping ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
              {scraping ? "Scraping..." : "Scrape"}
            </Button>
          </div>
          {scraping && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Scraping in progress...</span>
                <span className="text-xs font-medium">{Math.round(scrapeProgress)}%</span>
              </div>
              <Progress value={scrapeProgress} color="bg-[#D4A843]" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={removeDuplicates}>
          <Trash2 className="w-4 h-4 mr-1" /> Remove Duplicates ({duplicates})
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchable searchKeys={["businessName", "phone", "category", "address"]} />
    </DashboardLayout>
  );
}
