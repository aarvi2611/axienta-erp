import { z } from 'zod';

const roleValues = [
  'CEO',
  'Admin',
  'Head Manager',
  'Team Manager',
  'Sales Executive',
  'Calling Executive',
  'Data Scraper',
  'Operations Team',
  'HR'
] as const;

export const employeeCreateSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(roleValues),
  department: z.string().trim().min(1),
  employeeId: z.string().trim().min(1).optional(),
  phone: z.string().trim().optional(),
  salary: z.coerce.number().min(0).optional(),
  leaveBalance: z.coerce.number().min(0).optional(),
  bankAccount: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
  joiningDate: z.string().trim().optional(),
  appraisalDate: z.string().trim().optional(),
  performanceRating: z.coerce.number().min(1).max(5).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

export const employeeUpdateSchema = employeeCreateSchema
  .omit({ password: true })
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });

export const leaveRequestCreateSchema = z.object({
  fromDate: z.string().trim().min(1),
  toDate: z.string().trim().min(1),
  type: z.string().trim().min(1),
  reason: z.string().trim().min(1)
});

export const leaveRequestUpdateSchema = z.object({
  status: z.enum(['Approved', 'Rejected'])
});
