// ============================================
// Axenta Client Portal - Type Definitions
// ============================================

export type ClientStatus = "Active" | "Paused" | "At Risk" | "Suspended";

export interface ClientPortalProfile {
  id: string;
  clientId: string; // e.g. "AXN-CLI-01"
  businessName: string;
  domain: string;
  contactPerson: string;
  email: string;
  phone: string;
  supportPin: string;
  clientStatus: ClientStatus;
  accountManager: string;
  monthlyRetainer: number;
  packageTier: "Enterprise" | "Growth" | "Starter" | "Custom";
  avatar?: string;
  logoUrl?: string;
  notes?: string;
  joinedDate: string;
}

export type InvoiceStatus = "paid" | "pending" | "overdue";

export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-2025-001"
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  paymentMethod?: string;
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
  pdfUrl?: string;
}

export type MilestoneStatus = "completed" | "in_progress" | "pending";

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  status: MilestoneStatus;
  dueDate: string;
  completedDate?: string;
}

export interface ProjectDeliverable {
  id: string;
  title: string;
  type: "Report" | "Audit" | "Creative" | "Code" | "Strategy" | "Document";
  date: string;
  fileSize?: string;
  fileUrl?: string;
  previewUrl?: string;
}

export interface ClientProject {
  id: string;
  clientId: string;
  clientName: string;
  projectName: string;
  serviceCategory: string;
  status: "onboarding" | "in_progress" | "review" | "completed" | "delivered";
  progress: number; // 0 to 100
  startDate: string;
  deadline: string;
  assignedManager: string;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  notes?: string;
}

export type WorkRequestCategory =
  | "SEO Campaign"
  | "Content & Blogs"
  | "Website Development"
  | "Google & Meta Ads"
  | "Technical Fix"
  | "Design & Branding"
  | "Other";

export type WorkRequestStatus = "Pending Review" | "Approved" | "In Progress" | "Completed" | "Declined";

export interface ClientWorkRequest {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  category: WorkRequestCategory;
  priority: "Normal" | "High" | "Urgent";
  estimatedBudget?: string;
  targetTimeline?: string;
  description: string;
  status: WorkRequestStatus;
  adminResponse?: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------------------------------
// SEO Services Specific Types (Daily Hub)
// --------------------------------------------

export interface TrackedKeyword {
  id: string;
  keyword: string;
  currentRank: number;
  previousRank: number;
  change: number; // positive = moved up, negative = dropped
  searchVolume: string;
  difficulty: "Low" | "Medium" | "Hard";
  targetUrl: string;
  serpFeature?: "Featured Snippet" | "Local 3-Pack" | "Top 3 Organic" | "Knowledge Panel";
  lastUpdated: string;
}

export interface DailySeoActivity {
  id: string;
  date: string;
  title: string;
  category: "Technical SEO" | "On-Page SEO" | "Backlinks & PR" | "Content Optimization" | "Speed & Core Web Vitals" | "Local SEO" | "Programmatic SEO";
  description: string;
  impact: "High" | "Medium" | "Positive";
  completedBy: string;
}

export interface TrafficDataPoint {
  date: string;
  organicTraffic: number;
  clicks: number;
  impressions: number;
  phoneCalls?: number;
}

export interface LocalPackKeyword {
  id: string;
  keyword: string;
  location: string;
  mapRank: number; // 1, 2, 3
  searchVolume: string;
}

export interface Tier1Backlink {
  id: string;
  domain: string;
  da: number;
  dr: number;
  targetUrl: string;
  anchorText: string;
  type: "Editorial PR" | "Guest Feature" | "Industry Citation" | "Brand Mention";
  acquiredDate: string;
}

export interface ProgrammaticTemplate {
  id: string;
  templateName: string;
  pagesCount: number;
  indexedCount: number;
  monthlyTraffic: number;
  topKeyword: string;
  avgPosition: number;
}

export interface CoreWebVitalsMetrics {
  lcp: string; // e.g. "1.4s (Good)"
  inp: string; // e.g. "42ms (Good)"
  cls: string; // e.g. "0.02 (Good)"
  performanceScore: number; // e.g. 96
}

export interface ClientSeoRecord {
  id: string;
  clientId: string;
  clientName: string;
  domain: string;
  lastUpdated: string;

  // Traffic, Inquiries & Phone Calls
  organicTraffic: number; // e.g. 34,250
  organicUsers?: number; // e.g. 28,100
  organicSessions?: number; // e.g. 41,500
  trafficGrowthPercentage: number; // e.g. +24.8%
  monthlyImpressions: number; // e.g. 340,000
  monthlyClicks: number; // e.g. 18,600
  averageCtr: number; // e.g. 5.4%
  averagePosition: number; // e.g. 7.8
  phoneCallsGenerated: number; // e.g. 342 calls
  formInquiries: number; // e.g. 186 inquiries
  totalLeadsGenerated: number; // e.g. 528 leads
  totalConversions?: number; // e.g. 412 conversions
  conversionRate: number; // e.g. 4.6%

  // Local SEO & Google Business Profile (GBP / GMB)
  gmbProfileViews: number; // e.g. 18,400
  gmbSearchAppearances: number; // e.g. 36,200
  gmbCalls: number; // e.g. 215
  gmbDirectionRequests: number; // e.g. 480
  gmbWebsiteClicks: number; // e.g. 960
  gmbReviewsCount: number; // e.g. 148
  gmbAverageRating: number; // e.g. 4.9
  gmbNapConsistency: number; // e.g. 100%
  localPackKeywords: LocalPackKeyword[];

  // On-Page SEO Health
  onPageScore: number; // e.g. 94/100
  totalPagesOptimized: number; // e.g. 92
  metaTagsOptimizedRatio: number; // e.g. 98%
  headingStructureScore: number; // e.g. 96%
  internalLinksCount: number; // e.g. 1,640
  imageAltTagsRatio: number; // e.g. 97%
  schemaMarkupTypes: string[]; // e.g. ["Organization", "LocalBusiness", "FAQPage", "BreadcrumbList", "Service"]
  coreWebVitals: CoreWebVitalsMetrics;

  // Off-Page SEO & Backlinks
  domainAuthority: number; // e.g. 52
  domainRating: number; // e.g. 48
  domainAuthorityChange: number; // e.g. +3
  totalBacklinks: number; // e.g. 3,850
  referringDomains: number; // e.g. 420
  dofollowRatio: number; // e.g. 84%
  toxicLinksRatio: number; // e.g. 0%
  tier1Backlinks: Tier1Backlink[];

  // Programmatic SEO (pSEO)
  programmaticPagesGenerated: number; // e.g. 380
  programmaticPagesIndexed: number; // e.g. 374
  pSeoIndexingRate: number; // e.g. 98.4%
  pSeoTrafficShare: number; // e.g. 42%
  pSeoKeywordsRanked: number; // e.g. 640
  programmaticTemplates: ProgrammaticTemplate[];

  // Full-Page & Technical Health
  healthScore: number; // e.g. 98/100
  crawlErrors: number; // e.g. 0
  statusCode200: number; // e.g. 480
  statusCode404: number; // e.g. 0
  statusCode301: number; // e.g. 14
  speedIndexScore: number; // e.g. 94/100
  mobileFriendliness: number; // e.g. 100%
  xmlSitemapStatus: string; // e.g. "Valid & Pinged Daily"
  robotsTxtStatus: string; // e.g. "Clean & Optimized"
  canonicalStatus: string; // e.g. "100% Verified"
  sslEncryption: string; // e.g. "TLS 1.3 / 256-bit"

  // Keyword Rankings & Historical
  totalKeywordsTracked: number;
  keywordsInTop3: number;
  keywordsInTop10: number;
  keywordsInTop20?: number;
  keywordsInTop100: number;
  monthlyReportUrl?: string;
  trafficHistory: TrafficDataPoint[];
  trackedKeywords: TrackedKeyword[];
  dailyActivities: DailySeoActivity[];
}

// --------------------------------------------
// Client Portal Support Tickets
// --------------------------------------------

export type PortalTicketCategory = "SEO & Rankings" | "Billing & Invoices" | "Project Deliverables" | "Website & Technical" | "General Inquiry";
export type PortalTicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type PortalTicketStatus = "Open" | "In Progress" | "Awaiting Client" | "Resolved" | "Closed";

export interface PortalTicketMessage {
  id: string;
  sender: "client" | "admin";
  senderName: string;
  senderRole?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface PortalSupportTicket {
  id: string;
  ticketId: string; // e.g. "TKT-1082"
  clientId: string;
  clientName: string;
  subject: string;
  category: PortalTicketCategory;
  priority: PortalTicketPriority;
  status: PortalTicketStatus;
  createdAt: string;
  updatedAt: string;
  messages: PortalTicketMessage[];
}

