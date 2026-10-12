import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { User } from '../auth/auth.service';

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
  tradingName?: string;
  businessType: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP';
  taxId: string;
  registrationNumber: string;
  websiteUrl?: string;
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
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
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

const APPLICATION_META: {
  type: 'LLC' | 'CORPORATION' | 'SOLE_PROPRIETORSHIP' | 'PARTNERSHIP';
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  vol: number;
  ticket: number;
}[] = [
  { type: 'LLC', status: 'DRAFT', vol: 240000, ticket: 85 },
  { type: 'CORPORATION', status: 'SUBMITTED', vol: 1200000, ticket: 1850 },
  { type: 'LLC', status: 'UNDER_REVIEW', vol: 450000, ticket: 125 },
  { type: 'CORPORATION', status: 'APPROVED', vol: 820000, ticket: 68 },
  { type: 'PARTNERSHIP', status: 'REJECTED', vol: 950000, ticket: 35 },
  { type: 'LLC', status: 'APPROVED', vol: 180000, ticket: 18 },
  { type: 'CORPORATION', status: 'UNDER_REVIEW', vol: 2100000, ticket: 4500 },

  { type: 'LLC', status: 'DRAFT', vol: 150000, ticket: 750 },
  { type: 'CORPORATION', status: 'SUBMITTED', vol: 890000, ticket: 520 },
  { type: 'LLC', status: 'UNDER_REVIEW', vol: 650000, ticket: 220 },
  { type: 'CORPORATION', status: 'APPROVED', vol: 3200000, ticket: 1950 },
  { type: 'PARTNERSHIP', status: 'REJECTED', vol: 400000, ticket: 45 },
  { type: 'SOLE_PROPRIETORSHIP', status: 'APPROVED', vol: 420000, ticket: 240 },
  { type: 'CORPORATION', status: 'UNDER_REVIEW', vol: 1100000, ticket: 110 },

  { type: 'PARTNERSHIP', status: 'DRAFT', vol: 110000, ticket: 1500 },
  { type: 'LLC', status: 'SUBMITTED', vol: 780000, ticket: 620 },
  { type: 'SOLE_PROPRIETORSHIP', status: 'UNDER_REVIEW', vol: 340000, ticket: 3100 },
  { type: 'CORPORATION', status: 'APPROVED', vol: 920000, ticket: 380 },
  { type: 'LLC', status: 'REJECTED', vol: 500000, ticket: 60 },
  { type: 'LLC', status: 'APPROVED', vol: 290000, ticket: 14 },
  { type: 'CORPORATION', status: 'UNDER_REVIEW', vol: 4500000, ticket: 8500 }
];

const DUMMY_SALES = [
  { id: 'sales', name: 'Sales Representative 1' },
  { id: 'sales2', name: 'Sales Representative 2' },
  { id: 'sales3', name: 'Sales Representative 3' }
];

const DUMMY_REVIEWERS = [
  { id: 'reviewer', name: 'Risk Underwriter 1' },
  { id: 'reviewer2', name: 'Risk Underwriter 2' },
  { id: 'reviewer3', name: 'Risk Underwriter 3' }
];

export function createDummyApplications(): MerchantApplication[] {
  let assignedCounter = 0;
  return APPLICATION_META.map((meta, index) => {
    const num = 1001 + index;
    const isAssigned = meta.status !== 'DRAFT' && meta.status !== 'SUBMITTED';
    const salesUser = DUMMY_SALES[Math.floor(index / 7)];
    const reviewerUser = isAssigned ? DUMMY_REVIEWERS[assignedCounter++ % 3] : null;
    const riskHistory: RiskDecision[] = [];

    if (meta.status === 'APPROVED') {
      riskHistory.push({
        id: `RSK-${num}`,
        decision: 'APPROVE',
        notes: 'Dummy risk underwriting decision approved.',
        reviewerId: reviewerUser ? reviewerUser.id : 'reviewer',
        reviewerName: reviewerUser ? reviewerUser.name : 'Risk Underwriter 1',
        decidedAt: '2026-03-22T14:45:00Z'
      });
    } else if (meta.status === 'REJECTED') {
      riskHistory.push({
        id: `RSK-${num}`,
        decision: 'REJECT',
        notes: 'Dummy risk underwriting decision rejected.',
        reviewerId: reviewerUser ? reviewerUser.id : 'reviewer',
        reviewerName: reviewerUser ? reviewerUser.name : 'Risk Underwriter 1',
        decidedAt: '2026-03-21T16:20:00Z'
      });
    } else if (meta.status === 'UNDER_REVIEW') {
      riskHistory.push({
        id: `RSK-${num}`,
        decision: 'REQUEST_CHANGES',
        notes: 'Dummy risk underwriting request changes note.',
        reviewerId: reviewerUser ? reviewerUser.id : 'reviewer',
        reviewerName: reviewerUser ? reviewerUser.name : 'Risk Underwriter 1',
        decidedAt: '2026-03-20T10:15:00Z'
      });
    }

    return {
      id: `APP-${num}`,
      businessName: `Dummy Application ${num}`,
      tradingName: `Dummy Store ${num}`,
      businessType: meta.type,
      taxId: `12-${3456780 + index}`,
      registrationNumber: `REG-${99200 + index}`,
      websiteUrl: `https://dummy${num}.internal`,
      contactName: `Dummy Contact ${num}`,
      contactEmail: `dummy${num}@dummy.internal`,
      contactPhone: `(555) 019-${String(num).padStart(4, '0')}`,
      contactTitle: 'Dummy Officer',
      bankName: 'Dummy Bank',
      bankAccountNumber: `9876543210${String(num).padStart(4, '0')}`,
      routingNumber: '121000358',
      accountType: 'CHECKING',
      monthlyVolume: meta.vol,
      averageTicketSize: meta.ticket,
      currency: 'USD',
      status: meta.status,
      createdBySalesId: salesUser.id,
      createdByName: salesUser.name,
      assignedReviewerId: reviewerUser ? reviewerUser.id : null,
      assignedReviewerName: reviewerUser ? reviewerUser.name : null,
      riskHistory,
      createdAt: `2026-03-${String(1 + index).padStart(2, '0')}T08:30:00Z`,
      updatedAt: '2026-03-20T10:15:00Z',
      draftSavedAt: meta.status === 'DRAFT' ? '2026-03-26T15:10:00Z' : undefined,
      currentStep: meta.status === 'DRAFT' ? 2 : 4
    };
  });
}

@Injectable()
export class ApplicationsService {
  private applications: MerchantApplication[] = createDummyApplications();

  filterByRole(role: string, userId: string): MerchantApplication[] {
    if (role === 'ADMIN') {
      return this.applications;
    }
    if (role === 'SALES') {
      return this.applications.filter((a) => a.createdBySalesId === userId);
    }
    if (role === 'REVIEWER') {
      return this.applications.filter((a) => a.assignedReviewerId === userId);
    }
    return [];
  }

  findAll(user: User, query: { page?: number; pageSize?: number; search?: string; status?: string; businessType?: string }) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 5);
    const search = (query.search || '').toLowerCase().trim();
    const status = query.status || 'ALL';
    const businessType = query.businessType || 'ALL';

    let list = this.filterByRole(user.role, user.id);
    list = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (search) {
      list = list.filter(
        (app) =>
          app.businessName.toLowerCase().includes(search) ||
          (app.tradingName && app.tradingName.toLowerCase().includes(search)) ||
          app.id.toLowerCase().includes(search) ||
          app.contactEmail.toLowerCase().includes(search)
      );
    }

    if (status && status !== 'ALL') {
      list = list.filter((app) => app.status === status);
    }

    if (businessType && businessType !== 'ALL') {
      list = list.filter((app) => app.businessType === businessType);
    }

    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const validPage = Math.min(page, totalPages);
    const startIndex = (validPage - 1) * pageSize;
    const pagedData = list.slice(startIndex, startIndex + pageSize);

    return {
      data: pagedData,
      total,
      page: validPage,
      pageSize,
      totalPages
    };
  }

  findById(user: User, id: string): MerchantApplication {
    const app = this.applications.find((a) => a.id === id);
    if (!app) {
      throw new NotFoundException('Application not found');
    }

    if (user.role === 'SALES' && app.createdBySalesId !== user.id) {
      throw new ForbiddenException('Access denied to this application');
    }

    if (user.role === 'REVIEWER' && app.assignedReviewerId !== user.id) {
      throw new ForbiddenException('Reviewers can only access applications assigned to them');
    }

    return app;
  }

  create(user: User, body: Partial<MerchantApplication>): MerchantApplication {
    const newId = `APP-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();

    const newApp: MerchantApplication = {
      id: newId,
      businessName: body.businessName || '',
      tradingName: body.tradingName || body.businessName || '',
      businessType: body.businessType || 'LLC',
      taxId: body.taxId || '',
      registrationNumber: body.registrationNumber || '',
      websiteUrl: body.websiteUrl || '',
      contactName: body.contactName || '',
      contactEmail: body.contactEmail || '',
      contactPhone: body.contactPhone || '',
      contactTitle: body.contactTitle || '',
      bankName: body.bankName || '',
      bankAccountNumber: body.bankAccountNumber || '',
      routingNumber: body.routingNumber || '',
      accountType: body.accountType || 'CHECKING',
      monthlyVolume: Number(body.monthlyVolume) || 0,
      averageTicketSize: Number(body.averageTicketSize) || 0,
      currency: body.currency || 'USD',
      status: body.status || 'DRAFT',
      createdBySalesId: user.id,
      createdByName: user.name,
      assignedReviewerId: null,
      assignedReviewerName: null,
      riskHistory: [],
      createdAt: timestamp,
      updatedAt: timestamp,
      draftSavedAt: body.status === 'DRAFT' ? timestamp : undefined,
      currentStep: Number(body.currentStep) || 1
    };

    this.applications.unshift(newApp);
    return newApp;
  }

  update(user: User, id: string, body: Partial<MerchantApplication>): MerchantApplication {
    const index = this.applications.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new NotFoundException('Application not found');
    }

    const current = this.applications[index];
    if (user.role === 'SALES' && current.createdBySalesId !== user.id) {
      throw new ForbiddenException('Cannot modify this application');
    }

    if (user.role === 'REVIEWER') {
      throw new ForbiddenException('Reviewers cannot modify application data');
    }

    const updated: MerchantApplication = {
      ...current,
      ...body,
      currentStep: body.currentStep !== undefined ? Number(body.currentStep) : current.currentStep,
      updatedAt: new Date().toISOString()
    };

    if (body.status === 'DRAFT') {
      updated.draftSavedAt = new Date().toISOString();
    }

    this.applications[index] = updated;
    return updated;
  }

  recordRiskDecision(
    user: User,
    id: string,
    decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    notes: string
  ): MerchantApplication {
    if (user.role === 'SALES') {
      throw new ForbiddenException('Sales role cannot make risk decisions');
    }

    const app = this.findById(user, id);
    if (user.role === 'REVIEWER') {
      if (app.assignedReviewerId !== user.id) {
        throw new ForbiddenException('Reviewers can only record decisions for assigned applications');
      }
      if (app.status === 'APPROVED' || app.status === 'REJECTED') {
        throw new ForbiddenException('Reviewers cannot change a decision once approved or rejected. Only administrators can modify or override decisions.');
      }
    }

    const decisionEntry: RiskDecision = {
      id: `RSK-${Date.now()}`,
      decision,
      notes,
      reviewerId: user.id,
      reviewerName: user.name,
      decidedAt: new Date().toISOString()
    };

    let nextStatus = app.status;
    if (decision === 'APPROVE') nextStatus = 'APPROVED';
    if (decision === 'REJECT') nextStatus = 'REJECTED';
    if (decision === 'REQUEST_CHANGES') nextStatus = 'UNDER_REVIEW';

    app.status = nextStatus;
    app.riskHistory.unshift(decisionEntry);
    app.updatedAt = new Date().toISOString();

    return app;
  }

  assignReviewer(user: User, id: string, reviewerId: string, reviewerName: string): MerchantApplication {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can assign reviewers');
    }

    const app = this.findById(user, id);
    app.assignedReviewerId = reviewerId;
    app.assignedReviewerName = reviewerName;
    if (app.status === 'SUBMITTED') {
      app.status = 'UNDER_REVIEW';
    }
    app.updatedAt = new Date().toISOString();
    return app;
  }

  getStatusCounts(user: User) {
    const visible = this.filterByRole(user.role, user.id);
    return {
      total: visible.length,
      draft: visible.filter((a) => a.status === 'DRAFT').length,
      submitted: visible.filter((a) => a.status === 'SUBMITTED').length,
      underReview: visible.filter((a) => a.status === 'UNDER_REVIEW').length,
      approved: visible.filter((a) => a.status === 'APPROVED').length,
      rejected: visible.filter((a) => a.status === 'REJECTED').length
    };
  }
}
