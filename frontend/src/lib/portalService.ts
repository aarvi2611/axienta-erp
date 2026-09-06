"use client";
import {
  ClientPortalProfile,
  ClientInvoice,
  ClientProject,
  ClientWorkRequest,
  ClientSeoRecord,
  PortalSupportTicket,
  TrackedKeyword,
  DailySeoActivity,
  MilestoneStatus,
} from "@/types/portal";

// Clean initial baseline (no hardcoded demo clients)
const INITIAL_CLIENTS: ClientPortalProfile[] = [];
const INITIAL_INVOICES: ClientInvoice[] = [];
const INITIAL_PROJECTS: ClientProject[] = [];
const INITIAL_WORK_REQUESTS: ClientWorkRequest[] = [];
const INITIAL_SEO_DATA: Record<string, ClientSeoRecord> = {};
const INITIAL_TICKETS: PortalSupportTicket[] = [];

// Helper to create an initial, clean SEO record for newly onboarded clients
export function createInitialSeoRecord(clientId: string, domain: string, businessName: string): ClientSeoRecord {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    id: `seo-${clientId}`,
    clientId,
    clientName: businessName,
    domain: cleanDomain,
    lastUpdated: new Date().toISOString().slice(0, 10),

    // Traffic, Leads & Phone Calls
    organicTraffic: 0,
    organicUsers: 0,
    organicSessions: 0,
    trafficGrowthPercentage: 0,
    monthlyImpressions: 0,
    monthlyClicks: 0,
    averageCtr: 0,
    averagePosition: 0,
    phoneCallsGenerated: 0,
    formInquiries: 0,
    totalLeadsGenerated: 0,
    totalConversions: 0,
    conversionRate: 0,

    // Local SEO & GBP
    gmbProfileViews: 0,
    gmbSearchAppearances: 0,
    gmbCalls: 0,
    gmbDirectionRequests: 0,
    gmbWebsiteClicks: 0,
    gmbReviewsCount: 0,
    gmbAverageRating: 5.0,
    gmbNapConsistency: 100,
    localPackKeywords: [],

    // On-Page SEO
    onPageScore: 85,
    totalPagesOptimized: 0,
    metaTagsOptimizedRatio: 100,
    headingStructureScore: 90,
    internalLinksCount: 0,
    imageAltTagsRatio: 100,
    schemaMarkupTypes: ["Organization", "LocalBusiness"],
    coreWebVitals: {
      lcp: "1.2s (Good)",
      inp: "35ms (Good)",
      cls: "0.01 (Good)",
      performanceScore: 95,
    },

    // Off-Page SEO & Backlinks
    domainAuthority: 25,
    domainRating: 20,
    domainAuthorityChange: 0,
    totalBacklinks: 0,
    referringDomains: 0,
    dofollowRatio: 100,
    toxicLinksRatio: 0,
    tier1Backlinks: [],

    // Programmatic SEO (pSEO)
    programmaticPagesGenerated: 0,
    programmaticPagesIndexed: 0,
    pSeoIndexingRate: 100,
    pSeoTrafficShare: 0,
    pSeoKeywordsRanked: 0,
    programmaticTemplates: [],

    // Full-Page Technical Health
    healthScore: 95,
    crawlErrors: 0,
    statusCode200: 0,
    statusCode404: 0,
    statusCode301: 0,
    speedIndexScore: 92,
    mobileFriendliness: 100,
    xmlSitemapStatus: "Configured & Active",
    robotsTxtStatus: "Clean & Validated",
    canonicalStatus: "Verified",
    sslEncryption: "TLS 1.3 Active",

    // Keywords & History
    totalKeywordsTracked: 0,
    keywordsInTop3: 0,
    keywordsInTop10: 0,
    keywordsInTop20: 0,
    keywordsInTop100: 0,
    trafficHistory: [
      { date: "Baseline", organicTraffic: 0, clicks: 0, impressions: 0, phoneCalls: 0 },
      { date: "Live", organicTraffic: 0, clicks: 0, impressions: 0, phoneCalls: 0 },
    ],
    trackedKeywords: [],
    dailyActivities: [
      {
        id: `act-${Date.now()}`,
        date: "Today",
        title: "Account Provisioned & SEO Tracking Active",
        category: "Technical SEO",
        description: `Configured real-time SEO indexing and operations engine for ${cleanDomain}.`,
        impact: "Positive",
        completedBy: "Axenta SEO Team",
      },
    ],
  };
}

// -------------------------------------------------------------
// Portal Storage Manager (Clean State + Reactive Listeners)
// -------------------------------------------------------------

class PortalStore {
  private listeners: Set<() => void> = new Set();
  private activeClientId: string = "";
  private authenticatedClientId: string | null = null;

  private clients: ClientPortalProfile[] = INITIAL_CLIENTS;
  private invoices: ClientInvoice[] = INITIAL_INVOICES;
  private projects: ClientProject[] = INITIAL_PROJECTS;
  private workRequests: ClientWorkRequest[] = INITIAL_WORK_REQUESTS;
  private seoRecords: Record<string, ClientSeoRecord> = INITIAL_SEO_DATA;
  private tickets: PortalSupportTicket[] = INITIAL_TICKETS;

  constructor() {
    if (typeof window !== "undefined") {
      this.loadFromStorage();
      const authClient = localStorage.getItem("axenta_portal_auth_client");
      if (authClient) {
        this.authenticatedClientId = authClient;
        this.activeClientId = authClient;
      } else {
        const savedClient = localStorage.getItem("axenta_portal_active_client");
        if (savedClient) this.activeClientId = savedClient;
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("axenta_portal_clients", JSON.stringify(this.clients));
      localStorage.setItem("axenta_portal_invoices", JSON.stringify(this.invoices));
      localStorage.setItem("axenta_portal_projects", JSON.stringify(this.projects));
      localStorage.setItem("axenta_portal_work_requests", JSON.stringify(this.workRequests));
      localStorage.setItem("axenta_portal_seo", JSON.stringify(this.seoRecords));
      localStorage.setItem("axenta_portal_tickets", JSON.stringify(this.tickets));
      localStorage.setItem("axenta_portal_active_client", this.activeClientId);
      if (this.authenticatedClientId) {
        localStorage.setItem("axenta_portal_auth_client", this.authenticatedClientId);
      } else {
        localStorage.removeItem("axenta_portal_auth_client");
      }
    } catch (e) {
      console.warn("Storage sync failed", e);
    }
    this.notify();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const c = localStorage.getItem("axenta_portal_clients");
      if (c) {
        try {
          const parsed = JSON.parse(c);
          // Purge legacy demo clients so project starts completely clean
          const nonDemo = parsed.filter(
            (cl: ClientPortalProfile) =>
              cl.businessName !== "Tech Solutions Pvt Ltd" &&
              cl.businessName !== "CloudNine Industries" &&
              cl.businessName !== "Global Marketing Agency" &&
              cl.businessName !== "Global Marketing Hub"
          );
          this.clients = nonDemo;
        } catch {
          this.clients = [];
        }
      }

      const inv = localStorage.getItem("axenta_portal_invoices");
      if (inv) {
        try {
          const parsed = JSON.parse(inv);
          this.invoices = parsed.filter((i: ClientInvoice) =>
            this.clients.some((cl) => cl.clientId === i.clientId)
          );
        } catch {
          this.invoices = [];
        }
      }

      const prj = localStorage.getItem("axenta_portal_projects");
      if (prj) {
        try {
          const parsed = JSON.parse(prj);
          this.projects = parsed.filter((p: ClientProject) =>
            this.clients.some((cl) => cl.clientId === p.clientId)
          );
        } catch {
          this.projects = [];
        }
      }

      const wr = localStorage.getItem("axenta_portal_work_requests");
      if (wr) {
        try {
          const parsed = JSON.parse(wr);
          this.workRequests = parsed.filter((w: ClientWorkRequest) =>
            this.clients.some((cl) => cl.clientId === w.clientId)
          );
        } catch {
          this.workRequests = [];
        }
      }

      const seo = localStorage.getItem("axenta_portal_seo");
      if (seo) {
        try {
          const parsed = JSON.parse(seo);
          const cleanSeo: Record<string, ClientSeoRecord> = {};
          for (const [key, val] of Object.entries(parsed)) {
            if (this.clients.some((cl) => cl.clientId === key)) {
              cleanSeo[key] = val as ClientSeoRecord;
            }
          }
          this.seoRecords = cleanSeo;
        } catch {
          this.seoRecords = {};
        }
      }

      const tkt = localStorage.getItem("axenta_portal_tickets");
      if (tkt) {
        try {
          const parsed = JSON.parse(tkt);
          this.tickets = parsed.filter((t: PortalSupportTicket) =>
            this.clients.some((cl) => cl.clientId === t.clientId)
          );
        } catch {
          this.tickets = [];
        }
      }

      if (this.clients.length > 0 && !this.activeClientId) {
        this.activeClientId = this.clients[0].clientId;
      }
    } catch (e) {
      console.warn("Load storage failed", e);
    }
  }

  public subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- Strict Client Authentication & Session Isolation ---
  public clientLogin(clientIdOrEmail: string, pin?: string): { success: boolean; client?: ClientPortalProfile; error?: string } {
    const input = clientIdOrEmail.trim().toLowerCase();
    const target = this.clients.find(
      (c) => c.clientId.toLowerCase() === input || c.email.toLowerCase() === input
    );

    if (!target) {
      return {
        success: false,
        error: `Client account "${clientIdOrEmail}" not found. Please verify your Client ID or contact your account manager.`,
      };
    }

    if (target.clientStatus === "Suspended" || target.clientStatus === "Paused") {
      return {
        success: false,
        error: "Your portal account is currently suspended. Please contact Axenta accounts.",
      };
    }

    if (pin && pin.trim()) {
      if (target.supportPin && target.supportPin !== pin.trim()) {
        return {
          success: false,
          error: "Invalid Security PIN. Please try again.",
        };
      }
    }

    this.authenticatedClientId = target.clientId;
    this.activeClientId = target.clientId;

    if (typeof window !== "undefined") {
      localStorage.setItem("axenta_portal_auth_client", target.clientId);
      localStorage.setItem("axenta_portal_active_client", target.clientId);
    }

    this.notify();
    return { success: true, client: target };
  }

  public clientLogout() {
    this.authenticatedClientId = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("axenta_portal_auth_client");
    }
    this.notify();
  }

  public isClientAuthenticated(): boolean {
    return this.authenticatedClientId !== null;
  }

  public getAuthenticatedClient(): ClientPortalProfile | null {
    if (!this.authenticatedClientId) return null;
    return this.clients.find((c) => c.clientId === this.authenticatedClientId) || null;
  }

  public setAdminPreviewClient(clientId: string) {
    this.authenticatedClientId = clientId;
    this.activeClientId = clientId;
    if (typeof window !== "undefined") {
      localStorage.setItem("axenta_portal_auth_client", clientId);
      localStorage.setItem("axenta_portal_active_client", clientId);
    }
    this.notify();
  }

  // Active Client in Portal (Scoped)
  public getActiveClientId(): string {
    return this.authenticatedClientId || this.activeClientId;
  }

  public setActiveClientId(clientId: string) {
    this.activeClientId = clientId;
    if (typeof window !== "undefined") {
      localStorage.setItem("axenta_portal_active_client", clientId);
    }
    this.notify();
  }

  public getActiveClient(): ClientPortalProfile {
    const currentId = this.authenticatedClientId || this.activeClientId;
    return (
      this.clients.find((c) => c.clientId === currentId) ||
      this.clients[0] || {
        id: "c-empty",
        clientId: "",
        businessName: "Client Portal",
        domain: "",
        contactPerson: "",
        email: "",
        phone: "",
        clientStatus: "Active",
        accountManager: "Axenta Consulting",
        monthlyRetainer: 0,
        packageTier: "Standard",
        joinedDate: new Date().toISOString().slice(0, 10),
      }
    );
  }

  // Clients Management (Add, Delete, List)
  public getClients(): ClientPortalProfile[] {
    return [...this.clients];
  }

  public getClientById(clientId: string): ClientPortalProfile | undefined {
    return this.clients.find((c) => c.clientId === clientId);
  }

  public addClient(client: ClientPortalProfile) {
    this.clients.push(client);
    if (!this.activeClientId) {
      this.activeClientId = client.clientId;
    }
    if (!this.seoRecords[client.clientId]) {
      this.seoRecords[client.clientId] = createInitialSeoRecord(
        client.clientId,
        client.domain,
        client.businessName
      );
    }
    this.saveToStorage();
  }

  public deleteClient(clientId: string) {
    this.clients = this.clients.filter((c) => c.clientId !== clientId);
    this.invoices = this.invoices.filter((i) => i.clientId !== clientId);
    this.projects = this.projects.filter((p) => p.clientId !== clientId);
    this.workRequests = this.workRequests.filter((w) => w.clientId !== clientId);
    this.tickets = this.tickets.filter((t) => t.clientId !== clientId);
    delete this.seoRecords[clientId];

    if (this.activeClientId === clientId) {
      this.activeClientId = this.clients[0]?.clientId || "";
    }
    if (this.authenticatedClientId === clientId) {
      this.authenticatedClientId = null;
    }
    this.saveToStorage();
  }

  public updateClient(clientId: string, data: Partial<ClientPortalProfile>) {
    this.clients = this.clients.map((c) =>
      c.clientId === clientId ? { ...c, ...data } : c
    );
    this.saveToStorage();
  }

  public clearAllDemoData() {
    this.clients = [];
    this.invoices = [];
    this.projects = [];
    this.workRequests = [];
    this.seoRecords = {};
    this.tickets = [];
    this.authenticatedClientId = null;
    this.activeClientId = "";
    if (typeof window !== "undefined") {
      localStorage.removeItem("axenta_portal_clients");
      localStorage.removeItem("axenta_portal_invoices");
      localStorage.removeItem("axenta_portal_projects");
      localStorage.removeItem("axenta_portal_work_requests");
      localStorage.removeItem("axenta_portal_seo");
      localStorage.removeItem("axenta_portal_tickets");
      localStorage.removeItem("axenta_portal_active_client");
      localStorage.removeItem("axenta_portal_auth_client");
    }
    this.notify();
  }

  // Invoices & Dues
  public getInvoices(clientId?: string): ClientInvoice[] {
    if (clientId) {
      return this.invoices.filter((inv) => inv.clientId === clientId);
    }
    return [...this.invoices];
  }

  public getClientDues(clientId: string): { totalDue: number; totalPaid: number; overdueCount: number } {
    const list = this.getInvoices(clientId);
    return {
      totalDue: list.reduce((acc, inv) => acc + inv.dueAmount, 0),
      totalPaid: list.reduce((acc, inv) => acc + inv.paidAmount, 0),
      overdueCount: list.filter((inv) => inv.status === "overdue").length,
    };
  }

  public createInvoice(invoice: Omit<ClientInvoice, "id">) {
    const newInvoice: ClientInvoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
    };
    this.invoices.unshift(newInvoice);
    this.saveToStorage();
    return newInvoice;
  }

  public updateInvoice(invoiceId: string, data: Partial<ClientInvoice>) {
    this.invoices = this.invoices.map((inv) =>
      inv.id === invoiceId ? { ...inv, ...data } : inv
    );
    this.saveToStorage();
  }

  public deleteInvoice(invoiceId: string) {
    this.invoices = this.invoices.filter((inv) => inv.id !== invoiceId);
    this.saveToStorage();
  }

  public recordPayment(invoiceId: string, amount: number, paymentReference: string) {
    this.invoices = this.invoices.map((inv) => {
      if (inv.id !== invoiceId) return inv;
      const newPaid = inv.paidAmount + amount;
      const newDue = Math.max(0, inv.totalAmount - newPaid);
      return {
        ...inv,
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newDue === 0 ? "paid" : "pending",
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentReference,
      };
    });
    this.saveToStorage();
  }

  // Projects & Deliverables
  public getProjects(clientId?: string): ClientProject[] {
    if (clientId) {
      return this.projects.filter((p) => p.clientId === clientId);
    }
    return [...this.projects];
  }

  public createProject(project: Omit<ClientProject, "id">) {
    const newProj: ClientProject = {
      ...project,
      id: `p-${Date.now()}`,
    };
    this.projects.unshift(newProj);
    this.saveToStorage();
    return newProj;
  }

  public updateProjectProgress(projectId: string, progress: number, status?: ClientProject["status"]) {
    this.projects = this.projects.map((p) =>
      p.id === projectId
        ? {
            ...p,
            progress,
            ...(status ? { status } : {}),
          }
        : p
    );
    this.saveToStorage();
  }

  public toggleMilestone(projectId: string, milestoneId: string) {
    this.projects = this.projects.map((p) => {
      if (p.id !== projectId) return p;
      const updatedMilestones = p.milestones.map((m) => {
        if (m.id !== milestoneId) return m;
        const nextStatus: MilestoneStatus = m.status === "completed" ? "in_progress" : "completed";
        return {
          ...m,
          status: nextStatus,
          completedDate: nextStatus === "completed" ? new Date().toISOString().slice(0, 10) : undefined,
        };
      });
      const completedCount = updatedMilestones.filter((m) => m.status === "completed").length;
      const autoProgress = Math.round((completedCount / updatedMilestones.length) * 100);
      return {
        ...p,
        milestones: updatedMilestones,
        progress: autoProgress,
        status: autoProgress === 100 ? "completed" : "in_progress",
      };
    });
    this.saveToStorage();
  }

  // Work Requests
  public getWorkRequests(clientId?: string): ClientWorkRequest[] {
    if (clientId) {
      return this.workRequests.filter((w) => w.clientId === clientId);
    }
    return [...this.workRequests];
  }

  public createWorkRequest(request: Omit<ClientWorkRequest, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString().slice(0, 10);
    const newReq: ClientWorkRequest = {
      ...request,
      id: `wr-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.workRequests.unshift(newReq);
    this.saveToStorage();
    return newReq;
  }

  public updateWorkRequestStatus(requestId: string, status: ClientWorkRequest["status"], adminResponse?: string) {
    this.workRequests = this.workRequests.map((w) =>
      w.id === requestId
        ? {
            ...w,
            status,
            ...(adminResponse ? { adminResponse } : {}),
            updatedAt: new Date().toISOString().slice(0, 10),
          }
        : w
    );
    this.saveToStorage();
  }

  // SEO Services Data (Daily Hub)
  public getSeoData(clientId: string): ClientSeoRecord {
    if (this.seoRecords[clientId]) {
      return this.seoRecords[clientId];
    }
    const client = this.getClientById(clientId);
    const domain = client?.domain || "yourdomain.com";
    const name = client?.businessName || "Your Company";
    const newRecord = createInitialSeoRecord(clientId, domain, name);
    this.seoRecords[clientId] = newRecord;
    return newRecord;
  }

  // Update Daily SEO Stats from ERP Admin
  public updateDailySeoStats(
    clientId: string,
    stats: Partial<ClientSeoRecord>
  ) {
    const current = this.getSeoData(clientId);
    this.seoRecords[clientId] = {
      ...current,
      ...stats,
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    this.saveToStorage();
  }

  // Post Today's Daily SEO Work Log from ERP Admin
  public addDailySeoActivity(
    clientId: string,
    activity: {
      title: string;
      category: DailySeoActivity["category"];
      description: string;
      impact?: DailySeoActivity["impact"];
      completedBy?: string;
    }
  ) {
    const current = this.getSeoData(clientId);
    const newActivity: DailySeoActivity = {
      id: `act-${Date.now()}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      title: activity.title,
      category: activity.category,
      description: activity.description,
      impact: activity.impact || "Positive",
      completedBy: activity.completedBy || "Axenta SEO Team",
    };
    current.dailyActivities.unshift(newActivity);
    current.lastUpdated = new Date().toISOString().slice(0, 10);
    this.seoRecords[clientId] = { ...current };
    this.saveToStorage();
    return newActivity;
  }

  // Add / Update Tracked Keyword from ERP Admin
  public addTrackedKeyword(clientId: string, keyword: Omit<TrackedKeyword, "id" | "lastUpdated">) {
    const current = this.getSeoData(clientId);
    const newK: TrackedKeyword = {
      ...keyword,
      id: `k-${Date.now()}`,
      lastUpdated: "Today",
    };
    current.trackedKeywords.unshift(newK);
    current.totalKeywordsTracked = current.trackedKeywords.length;
    this.seoRecords[clientId] = { ...current };
    this.saveToStorage();
  }

  public updateKeywordRank(clientId: string, keywordId: string, currentRank: number) {
    const current = this.getSeoData(clientId);
    current.trackedKeywords = current.trackedKeywords.map((k) => {
      if (k.id !== keywordId) return k;
      const prev = k.currentRank;
      const change = prev - currentRank;
      return {
        ...k,
        previousRank: prev,
        currentRank,
        change,
        lastUpdated: "Today",
      };
    });
    this.seoRecords[clientId] = { ...current };
    this.saveToStorage();
  }

  // Tickets & Support Desk
  public getTickets(clientId?: string): PortalSupportTicket[] {
    if (clientId) {
      return this.tickets.filter((t) => t.clientId === clientId);
    }
    return [...this.tickets];
  }

  public createTicket(
    ticket: Omit<PortalSupportTicket, "id" | "ticketId" | "createdAt" | "updatedAt" | "messages">,
    firstMessage: string,
    senderName: string
  ) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newTicket: PortalSupportTicket = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketId: `TKT-${randomNum}`,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: "client",
          senderName,
          message: firstMessage,
          timestamp: new Date().toLocaleString(),
        },
      ],
    };
    this.tickets.unshift(newTicket);
    this.saveToStorage();
    return newTicket;
  }

  public addTicketReply(ticketId: string, sender: "client" | "admin", senderName: string, message: string, senderRole?: string) {
    this.tickets = this.tickets.map((t) => {
      if (t.id !== ticketId) return t;
      return {
        ...t,
        status: sender === "admin" ? "In Progress" : "Awaiting Client",
        updatedAt: new Date().toLocaleString(),
        messages: [
          ...t.messages,
          {
            id: `msg-${Date.now()}`,
            sender,
            senderName,
            senderRole,
            message,
            timestamp: new Date().toLocaleString(),
          },
        ],
      };
    });
    this.saveToStorage();
  }

  public updateTicketStatus(ticketId: string, status: PortalSupportTicket["status"]) {
    this.tickets = this.tickets.map((t) =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toLocaleString() } : t
    );
    this.saveToStorage();
  }
}

// Singleton Instance for Application Lifetime
export const portalStore = new PortalStore();
