import { Lead, Task, UserProfile } from '@/types';
export const employees: UserProfile[] = [
 {uid:'ceo-1', employeeId:'AX-CEO-001', name:'Aarav Sharma', email:'ceo@axenta.com', role:'CEO', department:'Executive', phone:'+91 90000 00001', status:'active'},
 {uid:'mgr-1', employeeId:'AX-MGR-101', name:'Neha Verma', email:'manager@axenta.com', role:'Head Manager', department:'Management', phone:'+91 90000 00002', status:'active'},
 {uid:'sales-1', employeeId:'AX-SAL-220', name:'Kabir Singh', email:'sales@axenta.com', role:'Sales Executive', department:'Sales', status:'active'},
 {uid:'call-1', employeeId:'AX-CALL-330', name:'Riya Kapoor', email:'calling@axenta.com', role:'Calling Executive', department:'Calling', status:'active'},
 {uid:'ops-1', employeeId:'AX-OPS-410', name:'Mohit Jain', email:'ops@axenta.com', role:'Operations Team', department:'Operations', status:'active'},
 {uid:'hr-1', employeeId:'AX-HR-510', name:'Sara Khan', email:'hr@axenta.com', role:'HR', department:'Human Resources', status:'active'}
];
export const leads: Lead[] = [
 {id:'L-1001', businessName:'BluePeak Technologies', phone:'+91 99887 77665', email:'hello@bluepeak.in', website:'bluepeak.in', address:'Noida Sector 62', category:'IT Services', rating:4.6, stage:'Interested', ownerId:'sales-1', tags:['hot','website'], nextFollowUp:'2025-02-12', source:'Google Maps'},
 {id:'L-1002', businessName:'Royal FinServe', phone:'+91 88776 66554', address:'Gurugram', category:'Finance', rating:4.3, stage:'Follow-Up', ownerId:'call-1', tags:['call-back'], nextFollowUp:'2025-02-15', source:'CSV'},
 {id:'L-1003', businessName:'Urban Wellness Clinic', phone:'+91 77665 55443', email:'care@urbanwellness.in', address:'Delhi', category:'Healthcare', rating:4.8, stage:'Confirmed', ownerId:'ops-1', tags:['confirmed'], source:'Referral'},
 {id:'L-1004', businessName:'GreenKart Retail', phone:'+91 66554 44332', website:'greenkart.example', address:'Jaipur', category:'Retail', rating:4.1, stage:'New Lead', ownerId:'sales-1', tags:['new'], source:'Google Maps'}
];
export const tasks: Task[] = [
 {id:'T-9001', title:'Verify 80 scraped leads', description:'Check phone/email validity and remove duplicates.', assignedTo:'data-1', assignedName:'Data Team', deadline:'2025-02-10', priority:'High', status:'In Progress'},
 {id:'T-9002', title:'Follow-up confirmed proposal clients', description:'Send WhatsApp proposal and update CRM timeline.', assignedTo:'sales-1', assignedName:'Kabir Singh', deadline:'2025-02-11', priority:'Urgent', status:'Pending'},
 {id:'T-9003', title:'Prepare monthly productivity report', description:'Department wise KPI sheet for CEO review.', assignedTo:'hr-1', assignedName:'Sara Khan', deadline:'2025-02-28', priority:'Medium', status:'Completed'}
];
export const kpis = [{label:'Revenue', value:'₹18.4L', trend:'+18%'},{label:'Leads', value:'2,840', trend:'+31%'},{label:'Conversion', value:'24.8%', trend:'+6%'},{label:'Attendance', value:'96%', trend:'+2%'}];
export const chartData = [{name:'Mon', leads:42, revenue:28},{name:'Tue', leads:55, revenue:36},{name:'Wed', leads:48, revenue:44},{name:'Thu', leads:76, revenue:51},{name:'Fri', leads:90, revenue:68},{name:'Sat', leads:63, revenue:49}];
