export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type BusinessType = 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP';

export interface RiskDecision {
  id: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes: string;
  reviewerId: string;
  reviewerName: string;
  decidedAt: string;
}

export interface MerchantApplication {
  id: string;
  businessName: string;
  tradingName: string;
  businessType: BusinessType;
  taxId: string;
  registrationNumber: string;
  websiteUrl: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactTitle: string;
  bankName: string;
  bankAccountNumber: string;
  routingNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  monthlyVolume: number;
  averageTicketSize: number;
  currency: string;
  status: ApplicationStatus;
  createdBySalesId: string;
  createdByName: string;
  assignedReviewerId: string | null;
  assignedReviewerName: string | null;
  riskHistory: RiskDecision[];
  createdAt: string;
  updatedAt: string;
  draftSavedAt?: string;
  currentStep?: number;
}

export interface ApplicationFilterParams {
  page: number;
  pageSize: number;
  search?: string;
  status?: ApplicationStatus | 'ALL';
  businessType?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StatusCounts {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  approved: number;
  rejected: number;
}
