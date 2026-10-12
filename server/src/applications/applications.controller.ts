import { Controller, Get, Post, Put, Param, Query, Body, Headers } from '@nestjs/common';
import { ApplicationsService, MerchantApplication } from './applications.service';
import { AuthService } from '../auth/auth.service';

@Controller()
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly authService: AuthService
  ) {}

  @Get('applications')
  findAll(
    @Headers('authorization') authHeader: string,
    @Query() query: { page?: number; pageSize?: number; search?: string; status?: string; businessType?: string }
  ) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.findAll(user, query);
  }

  @Get('status-counts')
  getStatusCounts(@Headers('authorization') authHeader: string) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.getStatusCounts(user);
  }

  @Get('applications/:id')
  findById(@Headers('authorization') authHeader: string, @Param('id') id: string) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.findById(user, id);
  }

  @Post('applications')
  create(@Headers('authorization') authHeader: string, @Body() body: Partial<MerchantApplication>) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.create(user, body);
  }

  @Put('applications/:id')
  update(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: Partial<MerchantApplication>
  ) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.update(user, id, body);
  }

  @Post('applications/:id/risk-decision')
  recordRiskDecision(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES'; notes: string }
  ) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.recordRiskDecision(user, id, body.decision, body.notes);
  }

  @Post('applications/:id/assign')
  assignReviewer(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: { reviewerId: string; reviewerName: string }
  ) {
    const user = this.authService.getUserFromHeader(authHeader);
    return this.applicationsService.assignReviewer(user, id, body.reviewerId, body.reviewerName);
  }
}
