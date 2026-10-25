import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import Stripe = require('stripe');

@Injectable()
export class PurchasesService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey || (!secretKey.startsWith('sk_test_') && !secretKey.startsWith('sk_live_'))) {
      throw new Error('STRIPE_SECRET_KEY is missing or invalid in environment variables.');
    }
    this.stripe = new Stripe(secretKey);
  }

  async purchaseBook(userId: string, bookId: string, quantity: number = 1, price?: number, method: PaymentMethod = PaymentMethod.CARD) {
    const requestedQty = quantity > 0 ? quantity : 1;
    const selectedMethod = method || PaymentMethod.CARD;

    const { purchase, book, unitAmount } = await this.prisma.$transaction(async (tx) => {
      const bookRecord = await tx.book.findUnique({ where: { id: bookId } });
      if (!bookRecord) {
        throw new NotFoundException('Book not found');
      }
      const existingPurchase = await tx.purchase.findFirst({
        where: { userId, bookId, status: PaymentStatus.PENDING },
      });
      if (existingPurchase) {
        await tx.book.update({
          where: { id: bookId },
          data: { availableCopies: { increment: existingPurchase.quantity } }
        });
      }
      const refreshedBook = await tx.book.findUnique({ where: { id: bookId } });
      if (refreshedBook.availableCopies < requestedQty) {
        throw new BadRequestException(`Requested quantity exceeds available copies. Only ${refreshedBook.availableCopies} available.`);
      }
      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: requestedQty } }
      });
      const basePrice = price !== undefined && price > 0 ? price : (bookRecord.price || 0.0);
      const unitAmount = basePrice > 0 ? basePrice : 150;
      const totalAmount = unitAmount * requestedQty;
      const purchaseObj = existingPurchase 
        ? await tx.purchase.update({
            where: { id: existingPurchase.id },
            data: { 
              method: selectedMethod, 
              status: PaymentStatus.PENDING, 
              price: totalAmount,
              quantity: requestedQty
            },
            include: { book: true },
          })
        : await tx.purchase.create({
            data: {
              userId,
              bookId,
              quantity: requestedQty,
              price: totalAmount,
              method: selectedMethod,
              status: PaymentStatus.PENDING,
            },
            include: { book: true },
          });
      return { purchase: purchaseObj, book: bookRecord, unitAmount };
    });

    const appFrontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (selectedMethod === PaymentMethod.CARD) {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'egp',
              product_data: {
                name: `Book Purchase: ${book.title}`,
                description: `Permanent purchase of ${requestedQty} copy(ies) of ${book.title}`,
              },
              unit_amount: Math.round(unitAmount * 100),
            },
            quantity: requestedQty,
          },
        ],
        mode: 'payment',
        success_url: `${appFrontendUrl}?checkout=success&purchaseId=${purchase.id}`,
        cancel_url: `${appFrontendUrl}?checkout=cancel`,
      });
      return { url: session.url, purchase };
    }

    if (selectedMethod === PaymentMethod.WALLET) {
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

      const amountCents = Math.round(purchase.price * 100);

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
          source: {
            identifier: walletNumber,
            subtype: 'WALLET',
          },
          payment_token: paymentKeyData.token,
        }),
      });
      const walletPayData = await walletPayRes.json();
      if (!walletPayRes.ok || !walletPayData.redirect_url) {
        throw new BadRequestException(`Paymob wallet request failed: ${walletPayData.detail || walletPayData.message || 'Unknown error'}`);
      }

      return { url: walletPayData.redirect_url, purchase };
    }

    if (selectedMethod === PaymentMethod.CASH) {
      return {
        message: 'Purchase request submitted successfully. Waiting for admin approval.',
        purchase,
      };
    }

    return { message: 'Book purchased successfully', purchase };
  }

  async cancelPurchase(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({ 
      where: { id: purchaseId },
      include: { book: true }
    });
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundException('Purchase request not found');
    }
    if (purchase.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending purchase requests can be cancelled');
    }
    return await this.prisma.$transaction(async (tx) => {
      if (purchase.bookId) {
        await tx.book.update({
          where: { id: purchase.bookId },
          data: { availableCopies: { increment: purchase.quantity } }
        });
      }
      return tx.purchase.delete({
        where: { id: purchaseId },
      });
    });
  }

  async confirmOnlinePayment(userId: string, purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase || purchase.userId !== userId) {
      throw new NotFoundException('Purchase not found');
    }
    return this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: PaymentStatus.PAID },
    });
  }

  async confirmCashPayment(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { id: purchaseId } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    return this.prisma.purchase.update({
      where: { id: purchaseId },
      data: { status: PaymentStatus.PAID },
    });
  }

  async getMyPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllPurchases() {
    return this.prisma.purchase.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        book: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
