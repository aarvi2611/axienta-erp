// ============================================
// Axenta ERP - Type Definitions
// ============================================

export type UserRole =
  | "ceo"
  | "admin"
  | "head_manager"
  | "team_manager"
  | "sales_executive"
  | "calling_executive"
  | "data_scraper"
  | "operations"
  | "hr";

export type Role =
  | "CEO"
  | "Admin"
  | "Head Manager"
  | "Team Manager"
  | "Sales Executive"
  | "Calling Executive"
  | "Data Scraper"
  | "Operations Team"
  | "HR";

export const ROLE_LABELS: Record<UserRole, string> = {
  ceo: "CEO",
  admin: "Admin",
  head_manager: "Head Manager",
  team_manager: "Team Manager",
  sales_executive: "Sales Executive",
  calling_executive: "Calling Executive",
  data_scraper: "Data Scraper",
  operations: "Operations Team",
  hr: "HR",
};

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  department?: string;
  phone?: string;
  avatar?: string;
  employeeId: string;
  managerId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  address?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  salary?: number;
  bio?: string;
}

export interface UserProfile {
  uid: string;
  employeeId: string;
  name: string;
  email: string;
  role: "CEO" | "Admin" | "Head Manager" | "Team Manager" | "Sales Executive" | "Calling Executive" | "Data Scraper" | "Operations Team" | "HR";
  department: string;
  phone?: string;
  avatar?: string;
  status: "active" | "inactive";
  createdAt?: string;
  updatedAt?: string;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "interested"
  | "confirmed"
  | "converted"
  | "rejected";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New Lead",
  contacted: "Contacted",
  follow_up: "Follow-Up",
  interested: "Interested",
  confirmed: "Confirmed",
  converted: "Converted",
  rejected: "Rejected",
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: "#3B82F6",
  contacted: "#8B5CF6",
  follow_up: "#F59E0B",
  interested: "#10B981",
  confirmed: "#06B6D4",
  converted: "#22C55E",
  rejected: "#EF4444",
};

export interface Lead {
  id: string;
  businessName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category?: string;
  rating?: number;
  status: LeadStatus;
  stage?: string;
  ownerId?: string;
  assignedTo?: string;
  assignedToName?: string;
  source?: string;
  notes: LeadNote[];
  tags: string[];
  followUpDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface LeadNote {
  id: string;
  text: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  action: string;
  description: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
}

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "rejected"
  | "Pending"
  | "Accepted"
  | "In Progress"
  | "Submitted for Review"
  | "Revision Requested"
  | "Approved"
  | "Closed"
  | "Completed"
  | "Rejected";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#F97316",
  urgent: "#EF4444",
};

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedName?: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  deadline: string;
  priority: TaskPriority;
  status: TaskStatus;
  attachments: string[];
  statusUpdates: StatusUpdate[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  completionNote?: string;
  managerFeedback?: string;
  stageNote?: string;
}

export interface StatusUpdate {
  id: string;
  status: TaskStatus;
  note: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
}

export interface CallLog {
  id: string;
  leadId: string;
  leadName: string;
  calledBy: string;
  calledByName: string;
  duration?: number;
  status: "connected" | "no_answer" | "busy" | "wrong_number" | "callback";
  response?: string;
  notes?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: "present" | "absent" | "half_day" | "leave";
  hoursWorked?: number;
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: "casual" | "sick" | "earned" | "unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  createdAt: string;
}

export interface CompanyDocument {
  id: string;
  title: string;
  type: "application" | "experience" | "resignation" | "agreement" | "offer" | "other";
  referenceNo: string;
  recipientName: string;
  subject: string;
  content: string;
  status: "draft" | "final";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "task" | "lead" | "reminder" | "approval" | "message" | "attendance" | "system";
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  managerId?: string;
  managerName?: string;
  employeeCount: number;
}

export interface ClientProfile {
  id: string;
  clientId: string;
  businessName: string;
  businessProfiles: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  supportEmail?: string;
  supportPhone?: string;
  clientStatus: 'Active' | 'Paused' | 'At Risk';
  accountManager?: string;
  monthlyRetainer?: number;
  notes?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ClientDailyUpdate {
  id: string;
  clientId: string;
  businessProfile: string;
  updateDate: string;
  reviewsReceived: number;
  reviewsDropped: number;
  callsReceived: number;
  paymentsMade: number;
  paymentsPending: number;
  issueStatus: 'None' | 'Open' | 'Investigating' | 'Resolved';
  issueSummary?: string;
  contactStatus?: 'Open' | 'Needs Follow-up' | 'Closed';
  note?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ceo: [
    "dashboard", "leads", "crm", "tasks", "employees", "reports",
    "attendance", "notifications", "settings", "calling", "hr",
    "operations", "scraper", "profile", "create_users", "manage_roles",
    "view_analytics", "approve_work", "assign_tasks", "manage_all", "letters"
  ],
  admin: [
    "dashboard", "leads", "crm", "tasks", "employees", "reports",
    "attendance", "notifications", "settings", "calling", "hr",
    "operations", "scraper", "profile", "create_users", "manage_roles",
    "view_analytics", "approve_work", "assign_tasks"
  ],
  head_manager: [
    "dashboard", "leads", "crm", "tasks", "employees", "reports",
    "attendance", "notifications", "settings", "calling",
    "operations", "scraper", "profile", "create_users",
    "view_analytics", "approve_work", "assign_tasks", "letters"
  ],
  team_manager: [
    "dashboard", "leads", "crm", "tasks", "employees", "reports",
    "notifications", "profile", "assign_tasks", "approve_work"
  ],
  sales_executive: [
    "dashboard", "leads", "crm", "tasks", "notifications", "profile"
  ],
  calling_executive: [
    "dashboard", "leads", "calling", "tasks", "notifications", "profile"
  ],
  data_scraper: [
    "dashboard", "scraper", "leads", "tasks", "notifications", "profile"
  ],
  operations: [
    "dashboard", "operations", "leads", "tasks", "notifications", "profile"
  ],
  hr: [
    "dashboard", "hr", "employees", "attendance", "tasks",
    "notifications", "reports", "profile", "letters"
  ],
};
