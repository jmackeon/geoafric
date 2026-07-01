import {
  Controller, Get, Post, Delete, Body, Param,
  Query, Request, UseGuards, HttpCode, HttpStatus, Headers, RawBodyRequest,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto, VerifyPaymentDto } from './payments.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

type AuthReq = ExpressRequest & { user: { id: string } };

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  // ── Public ─────────────────────────────────────────────────────────────────
  @Get('plans')
  @ApiOperation({ summary: 'Get all available subscription plans' })
  getPlans() {
    return this.payments.getPlans();
  }

  // ── Webhook (no auth — verified by signature) ──────────────────────────────
  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Payment provider webhook handler' })
  webhook(
    @Param('provider') provider: string,
    @Body() body: any,
    @Headers('x-paystack-signature') paystackSig: string,
    @Headers('verif-hash') flutterwaveSig: string,
  ) {
    const sig = paystackSig ?? flutterwaveSig ?? '';
    return this.payments.handleWebhook(provider, body, sig);
  }

  // ── Authenticated ──────────────────────────────────────────────────────────
  @Get('subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current subscription' })
  getSubscription(@Request() req: AuthReq) {
    return this.payments.getSubscription(req.user.id);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get payment history' })
  getTransactions(@Request() req: AuthReq) {
    return this.payments.getTransactions(req.user.id);
  }

  @Post('initialize')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initialize a payment checkout' })
  initialize(@Request() req: AuthReq, @Body() dto: InitializePaymentDto) {
    return this.payments.initializePayment(req.user.id, dto);
  }

  @Post('verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify payment after redirect' })
  verify(@Request() req: AuthReq, @Body() dto: VerifyPaymentDto) {
    return this.payments.verifyPayment(req.user.id, dto);
  }

  @Delete('subscription')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription at period end' })
  cancel(@Request() req: AuthReq) {
    return this.payments.cancelSubscription(req.user.id);
  }
}
