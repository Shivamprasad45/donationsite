import { z } from 'zod'

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number').optional()
})

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/).optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string()
  }).optional()
})

// Charity validation schemas
export const charityRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number'),
  website: z.string().url('Invalid website URL').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  mission: z.string().min(10, 'Mission must be at least 10 characters').max(500, 'Mission cannot exceed 500 characters'),
  vision: z.string().min(10, 'Vision must be at least 10 characters').max(500, 'Vision cannot exceed 500 characters'),
  category: z.enum(['Education', 'Healthcare', 'Environment', 'Poverty', 'Animal Welfare', 'Disaster Relief', 'Human Rights', 'Arts & Culture', 'Sports', 'Other']),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required')
  }),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    bankName: z.string().min(1, 'Bank name is required'),
    ifscCode: z.string().min(1, 'IFSC code is required'),
    branch: z.string().min(1, 'Branch is required')
  })
})

export const charityLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Donation validation schemas
export const donationSchema = z.object({
  charityId: z.string().min(1, 'Charity ID is required'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  currency: z.enum(['USD', 'INR', 'EUR', 'GBP']).default('USD'),
  paymentMethod: z.enum(['stripe', 'razorpay']),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
  dedicatedTo: z.string().max(100, 'Dedication cannot exceed 100 characters').optional()
})

// Impact report validation schemas
export const impactReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description cannot exceed 2000 characters'),
  reportPeriod: z.object({
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str))
  }),
  totalFundsReceived: z.number().min(0, 'Total funds received must be non-negative'),
  totalFundsUtilized: z.number().min(0, 'Total funds utilized must be non-negative'),
  beneficiariesReached: z.number().min(0, 'Beneficiaries reached must be non-negative'),
  projects: z.array(z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().min(1, 'Project description is required'),
    fundsAllocated: z.number().min(0, 'Funds allocated must be non-negative'),
    fundsUtilized: z.number().min(0, 'Funds utilized must be non-negative'),
    status: z.enum(['planned', 'ongoing', 'completed', 'cancelled']),
    beneficiaries: z.number().min(0, 'Beneficiaries must be non-negative'),
    outcomes: z.array(z.string())
  })),
  financialBreakdown: z.array(z.object({
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0, 'Amount must be non-negative'),
    percentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    description: z.string().optional()
  }))
})

export const querySchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
  search: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'totalReceived', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})
