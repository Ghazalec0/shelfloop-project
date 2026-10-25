import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PayFineDto } from './dto/fines.dto';
import { ConfigService } from '@nestjs/config';
import Stripe = require('stripe');

@Injectable()
export class FinesService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(secretKey);
  }

  async checkAndGenerateFines(userId: string) {
    const activeOrRecentBorrows = await this.prisma.borrowing.findMany({
      where: { userId },
      include: { fine: true },
    });
    const now = new Date();
    for (const borrowing of activeOrRecentBorrows) {
      const returnDateRef = borrowing.returnDate || (now > borrowing.dueDate ? now : null);
      if (!returnDateRef || returnDateRef <= borrowing.dueDate) continue;
      const diffTime = returnDateRef.getTime() - borrowing.dueDate.getTime();
      const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const amount = daysLate * 5;
      if (!borrowing.fine) {
        await this.prisma.fine.create({
          data: { borrowingId: borrowing.id, userId, amount, daysLate, status: 'PENDING' },
        });
      } else if (borrowing.fine.status === 'PENDING') {
        await this.prisma.fine.update({
          where: { id: borrowing.fine.id },
          data: { amount, daysLate },
        });
      }
    }
  }

  async findMyFines(userId: string) {
    await this.checkAndGenerateFines(userId);
    return this.prisma.fine.findMany({
      where: { userId },
      include: { borrowing: { include: { book: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllFinesForAdmin() {
    return this.prisma.fine.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        borrowing: { include: { book: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payFine(userId: string, fineId: string, dto: PayFineDto) {
    const fine = await this.prisma.fine.findUnique({
      where: { id: fineId },
      include: { borrowing: { include: { book: true } } },
    });
    if (!fine || fine.userId !== userId) {
      throw new NotFoundException('Fine not found');
    }
    if (fine.status === 'PAID') {
      throw new BadRequestException('Fine is already paid');
    }

    const appFrontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (dto.method === 'CARD') {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'egp',
              product_data: {
                name: `Library Fine: ${fine.borrowing?.book?.title || 'Book Return Fee'}`,
                description: `Late fee for ${fine.daysLate} days late`,
              },
              unit_amount: Math.round(fine.amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appFrontendUrl}?checkout=success&fineId=${fine.id}`,
        cancel_url: `${appFrontendUrl}?checkout=cancel`,
      });
      await this.prisma.fine.update({
        where: { id: fineId },
        data: { method: 'CARD' },
      });
      return { url: session.url };
    }

    if (dto.method === 'WALLET') {
      const apiKey = this.configService.get<string>('PAYMOB_API_KEY');
      const integrationId = Number(this.configService.get<string>('PAYMOB_WALLET_INTEGRATION_ID') || this.configService.get<string>('PAYMOB_INTEGRATION_ID') || 0);
      const walletNumber = this.configService.get<string>('PAYMOB_WALLET_NUMBER') || '01010101010';

      if (!apiKey) {
        throw new BadRequestException('PAYMOB_API_KEY is missing in environment variables.');
      }
      if (!integrationId) {
        throw new BadRequestException('PAYMOB_WALLET_INTEGRATION_ID is missing.');
      }

      const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey }),
      });
      const authData = await authRes.json();
      if (!authRes.ok || !authData.token) {
        throw new BadRequestException(`Paymob authentication failed: ${authData.detail || 'Unknown error'}`);
      }

      const amountCents = Math.round(fine.amount * 100);

      const orderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authData.token,
          delivery_needed: false,
          amount_cents: amountCents,
          currency: 'EGP',
          items: [],
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.id) {
        throw new BadRequestException(`Paymob order creation failed: ${orderData.detail || 'Unknown error'}`);
      }

      const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth_token: authData.token,
          amount_cents: amountCents,
          expiration: 3600,
          order_id: orderData.id,
          billing_data: {
            apartment: 'NA',
            email: 'customer@shelfpool.com',
            floor: 'NA',
            first_name: 'Customer',
            street: 'NA',
            building: 'NA',
            phone_number: '+201000000000',
            shipping_method: 'NA',
            postal_code: 'NA',
            city: 'NA',
            country: 'EG',
            last_name: 'User',
            state: 'NA',
          },
          currency: 'EGP',
          integration_id: integrationId,
        }),
      });
      const paymentKeyData = await paymentKeyRes.json();
      if (!paymentKeyRes.ok || !paymentKeyData.token) {
        throw new BadRequestException(`Paymob payment key generation failed: ${paymentKeyData.detail || 'Unknown error'}`);
      }

      const walletPayRes = await fetch('https://accept.paymob.com/api/acceptance/payments/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: { identifier: walletNumber, subtype: 'WALLET' },
          payment_token: paymentKeyData.token,
        }),
      });
      const walletPayData = await walletPayRes.json();
      if (!walletPayRes.ok || !walletPayData.redirect_url) {
        throw new BadRequestException(`Paymob wallet request failed: ${walletPayData.detail || walletPayData.message || 'Unknown error'}`);
      }

      await this.prisma.fine.update({
        where: { id: fineId },
        data: { method: 'WALLET' },
      });

      return { url: walletPayData.redirect_url };
    }

    if (dto.method === 'CASH') {
      return this.prisma.fine.update({
        where: { id: fineId },
        data: { method: 'CASH', status: 'PENDING' },
      });
    }

    throw new BadRequestException('Invalid payment method');
  }

  async confirmOnlinePayment(userId: string, fineId: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine || fine.userId !== userId) {
      throw new NotFoundException('Fine not found');
    }
    return this.prisma.fine.update({
      where: { id: fineId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  async confirmCashPayment(fineId: string) {
    const fine = await this.prisma.fine.findUnique({ where: { id: fineId } });
    if (!fine) throw new NotFoundException('Fine not found');
    return this.prisma.fine.update({
      where: { id: fineId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }
}
