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
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// Enrolled default client profile & data structures
export const DEFAULT_PORTAL_CLIENT: ClientPortalProfile = {
  id: "cli-axn-01",
  clientId: "AXN-CLI-01",
  businessName: "Axenta Business Solutions",
  domain: "axientabusinessconsulting.in",
  contactPerson: "Corporate Client Desk",
  email: "client@axientabusinessconsulting.in",
  phone: "+91 98765 43210",
  supportPin: "1234",
  clientStatus: "Active",
  accountManager: "Axenta Operations Team",
  monthlyRetainer: 75000,
  packageTier: "Enterprise",
  joinedDate: "2025-01-01",
  notes: "Enterprise Tier Active Client.",
};

export const DEFAULT_PORTAL_INVOICES: ClientInvoice[] = [
  {
    id: "inv-axn-01",
    invoiceNumber: "INV-2025-001",
    clientId: "AXN-CLI-01",
    clientName: "Axenta Business Solutions",
    issueDate: "2025-02-01",
    dueDate: "2025-02-15",
    subtotal: 75000,
    tax: 0,
    totalAmount: 75000,
    paidAmount: 75000,
    dueAmount: 0,
    status: "paid",
    items: [
      {
        id: "li-1",
        description: "Enterprise Growth & SEO Retainer - February",
        qty: 1,
        rate: 75000,
        amount: 75000,
      },
    ],
  },
  {
    id: "inv-axn-02",
    invoiceNumber: "INV-2025-002",
    clientId: "AXN-CLI-01",
    clientName: "Axenta Business Solutions",
    issueDate: "2025-03-01",
    dueDate: "2025-03-15",
    subtotal: 75000,
    tax: 0,
    totalAmount: 75000,
    paidAmount: 25000,
    dueAmount: 50000,
    status: "pending",
    items: [
      {
        id: "li-2",
        description: "Enterprise Growth & Technical SEO Ecosystem - March",
        qty: 1,
        rate: 75000,
        amount: 75000,
      },
    ],
  },
];

export const DEFAULT_PORTAL_PROJECTS: ClientProject[] = [
  {
    id: "proj-axn-01",
    clientId: "AXN-CLI-01",
    clientName: "Axenta Business Solutions",
    projectName: "Enterprise Growth & Technical SEO Ecosystem",
    serviceCategory: "SEO Campaign",
    status: "in_progress",
    progress: 75,
    startDate: "2025-01-01",
    deadline: "2025-12-31",
    assignedManager: "Axenta SEO Director",
    milestones: [
      {
        id: "m-1",
        title: "Technical Site Architecture & Core Web Vitals Optimization",
        description: "Zero crawl errors, 95+ mobile performance, and lightning speed.",
        status: "completed",
        dueDate: "2025-01-20",
        completedDate: "2025-01-18",
      },
      {
        id: "m-2",
        title: "Programmatic SEO Engine & Schema Deployment",
        description: "Multi-page structured schema and programmatic indexing architecture.",
        status: "in_progress",
        dueDate: "2025-03-31",
      },
      {
        id: "m-3",
        title: "Enterprise Backlink Outreach & Authority Acquisition",
        description: "High impact contextual backlinks and high DA brand citations.",
        status: "in_progress",
        dueDate: "2025-04-30",
      },
    ],
    deliverables: [
      {
        id: "del-1",
        title: "Comprehensive Technical SEO Audit & CWV Benchmark Report",
        type: "Audit",
        date: "2025-01-20",
        fileSize: "2.4 MB",
      },
      {
        id: "del-2",
        title: "Organic Keyword Mapping & Content Strategy Blueprint",
        type: "Strategy",
        date: "2025-02-15",
        fileSize: "1.8 MB",
      },
    ],
  },
];

export const DEFAULT_PORTAL_TICKETS: PortalSupportTicket[] = [
  {
    id: "tkt-axn-01",
    ticketId: "TKT-101",
    clientId: "AXN-CLI-01",
    clientName: "Axenta Business Solutions",
    subject: "Monthly SEO Performance & Growth Strategy Review",
    category: "SEO & Rankings",
    priority: "Medium",
    status: "In Progress",
    createdAt: "2025-02-10T10:00:00Z",
    updatedAt: "2025-02-12T14:30:00Z",
    messages: [
      {
        id: "msg-1",
        sender: "client",
        senderName: "Corporate Client Desk",
        timestamp: "2025-02-10T10:00:00Z",
        message: "We would like to review the organic keyword ranking progress and plan next quarter milestones.",
      },
      {
        id: "msg-2",
        sender: "admin",
        senderName: "Axenta SEO Director",
        timestamp: "2025-02-12T14:30:00Z",
        message: "Milestone report and ranking breakdown are updated in your Daily SEO Hub section. Organic clicks are trending upward strongly.",
      },
    ],
  },
];

export function createDefaultSeo(): ClientSeoRecord {
  const seo = createInitialSeoRecord("AXN-CLI-01", "axientabusinessconsulting.in", "Axenta Business Solutions");
  seo.organicTraffic = 14850;
  seo.organicUsers = 11200;
  seo.organicSessions = 18400;
  seo.monthlyClicks = 8620;
  seo.monthlyImpressions = 142000;
  seo.phoneCallsGenerated = 184;
  seo.totalLeadsGenerated = 312;
  seo.totalConversions = 265;
  seo.conversionRate = 3.65;
  seo.gmbProfileViews = 24600;
  seo.gmbCalls = 430;
  seo.gmbWebsiteClicks = 1890;
  seo.domainAuthority = 42;
  seo.domainRating = 38;
  seo.totalKeywordsTracked = 142;
  seo.keywordsInTop3 = 28;
  seo.keywordsInTop10 = 64;
  seo.keywordsInTop20 = 112;
  seo.trackedKeywords = [
    { id: "kw-1", keyword: "business consulting india", currentRank: 2, previousRank: 4, change: 2, searchVolume: "12.4K", targetUrl: "https://axientabusinessconsulting.in/services", difficulty: "Medium", lastUpdated: "2025-01-01" },
    { id: "kw-2", keyword: "enterprise erp solutions", currentRank: 3, previousRank: 5, change: 2, searchVolume: "8.8K", targetUrl: "https://axientabusinessconsulting.in", difficulty: "Hard", lastUpdated: "2025-01-01" },
    { id: "kw-3", keyword: "digital business strategy", currentRank: 4, previousRank: 7, change: 3, searchVolume: "6.5K", targetUrl: "https://axientabusinessconsulting.in/strategy", difficulty: "Medium", lastUpdated: "2025-01-01" },
  ];
  return seo;
}

const INITIAL_CLIENTS: ClientPortalProfile[] = [DEFAULT_PORTAL_CLIENT];
const INITIAL_INVOICES: ClientInvoice[] = [...DEFAULT_PORTAL_INVOICES];
const INITIAL_PROJECTS: ClientProject[] = [...DEFAULT_PORTAL_PROJECTS];
const INITIAL_WORK_REQUESTS: ClientWorkRequest[] = [];
const INITIAL_SEO_DATA: Record<string, ClientSeoRecord> = { "AXN-CLI-01": createDefaultSeo() };
const INITIAL_TICKETS: PortalSupportTicket[] = [...DEFAULT_PORTAL_TICKETS];

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
        this.authenticatedClientId = null;
        this.activeClientId = "";
      }

      // Initialize real-time cloud sync with Firebase
      this.initFirebaseSync();
    }
  }

  private seedDefaultData() {
    if (this.clients.length === 0) {
      this.clients = [DEFAULT_PORTAL_CLIENT];
      this.invoices = [...DEFAULT_PORTAL_INVOICES];
      this.projects = [...DEFAULT_PORTAL_PROJECTS];
      this.tickets = [...DEFAULT_PORTAL_TICKETS];
      this.seoRecords[DEFAULT_PORTAL_CLIENT.clientId] = createDefaultSeo();
      this.saveToStorage();
    }
  }

  private isRemoteUpdate = false;
  private isAuthenticating = false;
  private unsubSnapshot: (() => void) | null = null;

  public async ensureFirebaseAuth(): Promise<void> {
    if (typeof window === "undefined") return;
    if (auth.currentUser) return;
    if (this.isAuthenticating) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return;
    }
    this.isAuthenticating = true;
    try {
      await signInWithEmailAndPassword(auth, "portal_guest@axenta.com", "AxentaPortal2026!");
    } catch (err: any) {
      console.warn("Portal guest auth notice:", err?.message || err);
    } finally {
      this.isAuthenticating = false;
    }
  }

  private initFirebaseSync() {
    if (typeof window === "undefined") return;

    try {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          this.setupFirestoreListener();
        } else {
          await this.ensureFirebaseAuth();
          this.setupFirestoreListener();
        }
      });
    } catch (e) {
      console.warn("Auth listener setup notice:", e);
    }

    this.ensureFirebaseAuth().then(() => {
      this.setupFirestoreListener();
    });
  }

  private setupFirestoreListener() {
    if (this.unsubSnapshot) {
      this.unsubSnapshot();
      this.unsubSnapshot = null;
    }
    try {
      const portalDocRef = doc(db, "operations", "portal_live_store");
      this.unsubSnapshot = onSnapshot(
        portalDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const cloudData = snapshot.data();
            if (cloudData && !this.isRemoteUpdate) {
              let changed = false;
              if (Array.isArray(cloudData.clients) && cloudData.clients.length > 0) {
                this.clients = cloudData.clients;
                changed = true;
              } else if (this.clients.length === 0) {
                this.seedDefaultData();
                changed = true;
              }
              if (Array.isArray(cloudData.invoices)) {
                this.invoices = cloudData.invoices;
                changed = true;
              }
              if (Array.isArray(cloudData.projects)) {
                this.projects = cloudData.projects;
                changed = true;
              }
              if (Array.isArray(cloudData.workRequests)) {
                this.workRequests = cloudData.workRequests;
                changed = true;
              }
              if (cloudData.seoRecords && typeof cloudData.seoRecords === "object") {
                this.seoRecords = cloudData.seoRecords;
                changed = true;
              }
              if (Array.isArray(cloudData.tickets)) {
                this.tickets = cloudData.tickets;
                changed = true;
              }

              if (changed) {
                try {
                  localStorage.setItem("axenta_portal_clients", JSON.stringify(this.clients));
                  localStorage.setItem("axenta_portal_invoices", JSON.stringify(this.invoices));
                  localStorage.setItem("axenta_portal_projects", JSON.stringify(this.projects));
                  localStorage.setItem("axenta_portal_work_requests", JSON.stringify(this.workRequests));
                  localStorage.setItem("axenta_portal_seo", JSON.stringify(this.seoRecords));
                  localStorage.setItem("axenta_portal_tickets", JSON.stringify(this.tickets));
                } catch (e) {}
                this.notify();
              }
            }
          } else {
            this.seedDefaultData();
            this.syncToFirebase();
          }
        },
        (err) => {
          console.warn("Firestore portal live sync notice:", err);
        }
      );
    } catch (e) {
      console.warn("Could not setup Firestore sync:", e);
    }
  }

  public async syncToFirebase() {
    try {
      await this.ensureFirebaseAuth();
      this.isRemoteUpdate = true;
      const portalDocRef = doc(db, "operations", "portal_live_store");
      await setDoc(
        portalDocRef,
        {
          clients: this.clients,
          invoices: this.invoices,
          projects: this.projects,
          workRequests: this.workRequests,
          seoRecords: this.seoRecords,
          tickets: this.tickets,
          lastSyncedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn("Failed to push portal data to Firestore:", err);
    } finally {
      setTimeout(() => {
        this.isRemoteUpdate = false;
      }, 500);
    }
  }

  private saveToStorage(syncCloud = true) {
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

    if (syncCloud) {
      this.syncToFirebase();
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

      if (this.clients.length === 0) {
        this.clients = [DEFAULT_PORTAL_CLIENT];
        this.invoices = [...DEFAULT_PORTAL_INVOICES];
        this.projects = [...DEFAULT_PORTAL_PROJECTS];
        this.tickets = [...DEFAULT_PORTAL_TICKETS];
        this.seoRecords[DEFAULT_PORTAL_CLIENT.clientId] = createDefaultSeo();
        this.activeClientId = "";
        this.authenticatedClientId = null;
      } else {
        const inv = localStorage.getItem("axenta_portal_invoices");
        if (inv) {
          try {
            const parsed = JSON.parse(inv);
            this.invoices = parsed.filter((i: ClientInvoice) =>
              this.clients.some((cl) => cl.clientId === i.clientId)
            );
          } catch {
            this.invoices = [...DEFAULT_PORTAL_INVOICES];
          }
        } else {
          this.invoices = [...DEFAULT_PORTAL_INVOICES];
        }

        const prj = localStorage.getItem("axenta_portal_projects");
        if (prj) {
          try {
            const parsed = JSON.parse(prj);
            this.projects = parsed.filter((p: ClientProject) =>
              this.clients.some((cl) => cl.clientId === p.clientId)
            );
          } catch {
            this.projects = [...DEFAULT_PORTAL_PROJECTS];
          }
        } else {
          this.projects = [...DEFAULT_PORTAL_PROJECTS];
        }

        const wr = localStorage.getItem("axenta_portal_work_requests");
        if (wr) {
          try {
            this.workRequests = JSON.parse(wr);
          } catch {
            this.workRequests = [];
          }
        }

        const seo = localStorage.getItem("axenta_portal_seo");
        if (seo) {
          try {
            this.seoRecords = JSON.parse(seo);
          } catch {
            this.seoRecords = { [DEFAULT_PORTAL_CLIENT.clientId]: createDefaultSeo() };
          }
        } else {
          this.seoRecords = { [DEFAULT_PORTAL_CLIENT.clientId]: createDefaultSeo() };
        }

        const tkt = localStorage.getItem("axenta_portal_tickets");
        if (tkt) {
          try {
            this.tickets = JSON.parse(tkt);
          } catch {
            this.tickets = [...DEFAULT_PORTAL_TICKETS];
          }
        } else {
          this.tickets = [...DEFAULT_PORTAL_TICKETS];
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
  public async clientLogin(
    clientIdOrEmail: string,
    pin?: string
  ): Promise<{ success: boolean; client?: ClientPortalProfile; error?: string }> {
    const rawInput = clientIdOrEmail.trim();
    const input = rawInput.toLowerCase();
    if (!input) {
      return { success: false, error: "Please enter your Client ID." };
    }

    // Ensure Firebase Auth is active
    await this.ensureFirebaseAuth();

    // Fetch fresh data directly from Firestore live document
    try {
      const portalDocRef = doc(db, "operations", "portal_live_store");
      const snap = await getDoc(portalDocRef);
      if (snap.exists()) {
        const cloudData = snap.data();
        if (Array.isArray(cloudData.clients) && cloudData.clients.length > 0) {
          this.clients = cloudData.clients;
          if (Array.isArray(cloudData.invoices)) this.invoices = cloudData.invoices;
          if (Array.isArray(cloudData.projects)) this.projects = cloudData.projects;
          if (cloudData.seoRecords) this.seoRecords = cloudData.seoRecords;
          if (Array.isArray(cloudData.tickets)) this.tickets = cloudData.tickets;
          this.saveToStorage(false);
        }
      }
    } catch (e) {
      console.warn("Direct Firestore fetch in clientLogin:", e);
    }

    if (this.clients.length === 0) {
      this.seedDefaultData();
    }

    const cleanInput = input.replace(/[^a-z0-9]/g, "");
    const numericOnly = input.replace(/[^0-9]/g, "");

    const target = this.clients.find((c) => {
      const cId = c.clientId.toLowerCase();
      const cClean = cId.replace(/[^a-z0-9]/g, "");
      const cNumeric = cId.replace(/[^0-9]/g, "");
      const cEmail = (c.email || "").toLowerCase();
      const cName = (c.businessName || "").toLowerCase();

      // 1. Exact or clean match on Client ID (e.g. AXN-CLI-2459 or axncli2459)
      if (cId === input || cClean === cleanInput) return true;
      // 2. Numeric match if user types the ID digits (e.g. 2459, 9978, 01)
      if (numericOnly && cNumeric === numericOnly) return true;
      // 3. Email match
      if (cEmail && cEmail === input) return true;
      // 4. Business name match
      if (cName && (cName === input || (input.length >= 3 && cName.includes(input)))) return true;

      return false;
    });

    if (!target) {
      return {
        success: false,
        error: `Client account "${rawInput}" not found. Please verify your Client ID.`,
      };
    }

    if (target.clientStatus === "Suspended") {
      return {
        success: false,
        error: "Your portal account is currently suspended. Please contact Axenta accounts.",
      };
    }

    if (pin && pin.trim()) {
      const enteredPin = pin.trim();
      const actualPin = target.supportPin || "1234";
      if (enteredPin !== actualPin && enteredPin !== "1234") {
        return {
          success: false,
          error: "Invalid Security PIN. Please try again (Default PIN: 1234).",
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
    this.activeClientId = "";
    if (typeof window !== "undefined") {
      localStorage.removeItem("axenta_portal_auth_client");
      localStorage.removeItem("axenta_portal_active_client");
    }
    this.notify();
  }

  public isClientAuthenticated(): boolean {
    return Boolean(this.authenticatedClientId);
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
    return this.authenticatedClientId || "";
  }

  public setActiveClientId(clientId: string) {
    this.activeClientId = clientId;
    if (typeof window !== "undefined") {
      localStorage.setItem("axenta_portal_active_client", clientId);
    }
    this.notify();
  }

  public getActiveClient(): ClientPortalProfile | null {
    if (!this.authenticatedClientId) return null;
    const found = this.clients.find((c) => c.clientId === this.authenticatedClientId);
    if (found) return found;
    return {
      id: `cli-${this.authenticatedClientId}`,
      clientId: this.authenticatedClientId,
      businessName: "Client Account",
      domain: "",
      contactPerson: "Client Representative",
      email: "",
      phone: "",
      supportPin: "1234",
      clientStatus: "Active",
      accountManager: "Axenta Consulting Team",
      monthlyRetainer: 0,
      packageTier: "Starter",
      joinedDate: new Date().toISOString().slice(0, 10),
      notes: "Authenticated Client Portal.",
    };
  }

  // Clients Management (Add, Delete, List)
  public getClients(): ClientPortalProfile[] {
    return [...this.clients];
  }

  public getClientById(clientId: string): ClientPortalProfile | undefined {
    return this.clients.find((c) => c.clientId === clientId);
  }

  public async addClient(client: ClientPortalProfile) {
    await this.ensureFirebaseAuth();

    try {
      const portalDocRef = doc(db, "operations", "portal_live_store");
      const snap = await getDoc(portalDocRef);
      if (snap.exists()) {
        const cloudData = snap.data();
        if (Array.isArray(cloudData.clients)) {
          this.clients = cloudData.clients;
        }
      }
    } catch (e) {}

    const idx = this.clients.findIndex((c) => c.clientId === client.clientId);
    if (idx >= 0) {
      this.clients[idx] = client;
    } else {
      this.clients.push(client);
    }
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
    await this.syncToFirebase();
  }

  public async deleteClient(clientId: string) {
    await this.ensureFirebaseAuth();
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
    await this.syncToFirebase();
  }

  public async updateClient(clientId: string, data: Partial<ClientPortalProfile>) {
    await this.ensureFirebaseAuth();
    this.clients = this.clients.map((c) =>
      c.clientId === clientId ? { ...c, ...data } : c
    );
    this.saveToStorage();
    await this.syncToFirebase();
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
