export type Role =
  | 'CEO'
  | 'Admin'
  | 'Head Manager'
  | 'Team Manager'
  | 'Sales Executive'
  | 'Calling Executive'
  | 'Data Scraper'
  | 'Operations Team'
  | 'HR';

export type LeadStage = 'New Lead' | 'Contacted' | 'Follow-Up' | 'Interested' | 'Confirmed' | 'Converted' | 'Rejected';
export type TaskStatus = 'Pending' | 'Accepted' | 'In Progress' | 'Submitted for Review' | 'Revision Requested' | 'Approved' | 'Closed' | 'Completed' | 'Rejected';

export interface UserProfile {
  uid: string;
  employeeId: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  salary?: number;
  bankAccount?: string;
  taxId?: string;
  joiningDate?: string;
  leaveBalance?: number;
  performanceRating?: number;
  appraisalDate?: string;
  createdAt?: any;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  fromDate: string;
  toDate: string;
  type: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: any;
  updatedAt?: any;
}

export interface CompanyLetter {
  id: string;
  title: string;
  type: 'Application' | 'Experience Letter' | 'Resignation Letter' | 'Agreement' | 'Offer Letter' | 'Other';
  referenceNo: string;
  recipientName: string;
  subject: string;
  content: string;
  status: 'Draft' | 'Final';
  createdBy: string;
  createdAt: any;
  updatedAt?: any;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  month: string;
  slipNo?: string;
  basicSalary: number;
  hra: number;
  conveyance: number;
  incentives: number;
  deductions: number;
  deductionReason?: string;
  grossSalary?: number;
  netSalary: number;
  bankAccount?: string;
  taxId?: string;
  workingDays?: number;
  paidDays?: number;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  generatedBy: string;
  approvedBy?: string;
  approvedAt?: any;
  signatureName?: string;
  headManagerSignatureName?: string;
  headManagerSignatureType?: 'Digital' | 'Manual';
  headManagerSignatureImage?: string;
  ceoSignatureName?: string;
  ceoSignatureType?: 'Digital' | 'Manual';
  ceoSignatureImage?: string;
  rejectionReason?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface Lead {
  id: string;
  businessName: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  category?: string;
  rating?: number;
  stage: LeadStage;
  ownerId?: string;
  tags: string[];
  notes?: string;
  nextFollowUp?: string;
  source?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedName?: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: TaskStatus;
  attachments?: string[];
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
  acceptedAt?: any;
  startedAt?: any;
  submittedAt?: any;
  approvedAt?: any;
  closedAt?: any;
  reviewedBy?: string;
  closedBy?: string;
  completionNote?: string;
  managerFeedback?: string;
  stageNote?: string;
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

export type TicketStatus = 'Open' | 'In Progress' | 'Awaiting Client' | 'Resolved' | 'Closed';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketCategory = 'Billing' | 'Service' | 'Review' | 'Call' | 'Other';

export interface ClientTicket {
  id: string;
  clientId: string;
  businessName?: string;
  businessProfile?: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  raisedBy?: string;
  assignedTo?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface PaymentReminder {
  id: string;
  clientId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'Upcoming' | 'Due Soon' | 'Overdue' | 'Paid';
  invoiceNo?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface ClientAsset {
  clientId: string;
  logoUrl?: string;
  coverUrl?: string;
  logoPath?: string;
  coverPath?: string;
  updatedBy?: string;
  updatedAt?: any;
}

export interface DailyUpdateNotification {
  id: string;
  clientId: string;
  updateDate: string;
  updatedBy?: string;
  updatedAt?: any;
}
