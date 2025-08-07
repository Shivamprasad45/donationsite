export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  profileImage?: string;
  isVerified: boolean;
  role: "user" | "admin";
  totalDonated: number;
  donationHistory: Donation[];
}

export interface Charity {
  _id: string;
  createdAt?: Date;
  name: string;
  email: string;
  registrationNumber: string;
  phone: string;
  website?: string;
  description: string;
  mission: string;
  vision: string;
  category: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  logo?: string;
  images: string[];
  isVerified: boolean;
  isApproved: boolean;
  goals: Goal[];
  totalReceived: number;
  donorCount: number;
  rating: number;
  reviews: Review[];
}

export interface Goal {
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  isActive: boolean;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  donor: User;
  charity: Charity;
  amount: number;
  currency: string;
  paymentMethod: "stripe" | "razorpay";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  isAnonymous: boolean;
  message?: string;
  dedicatedTo?: string;
  receiptNumber: string;
  createdAt: string;
}

export interface ImpactReport {
  id: string;
  charity: Charity;
  title: string;
  description: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  totalFundsReceived: number;
  totalFundsUtilized: number;
  beneficiariesReached: number;
  projects: Project[];
  financialBreakdown: FinancialBreakdown[];
  images: string[];
  isPublished: boolean;
  publishedAt?: string;
}

export interface Project {
  name: string;
  description: string;
  fundsAllocated: number;
  fundsUtilized: number;
  status: "planned" | "ongoing" | "completed" | "cancelled";
  beneficiaries: number;
  outcomes: string[];
}

export interface FinancialBreakdown {
  category: string;
  amount: number;
  percentage: number;
  description?: string;
}
