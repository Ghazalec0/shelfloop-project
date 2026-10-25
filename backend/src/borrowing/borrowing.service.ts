import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentStatus } from '@prisma/client';
import Stripe = require('stripe');

@Injectable()
export class BorrowingService {
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

  async borrow(userId: string, bookId: string, method: PaymentMethod = PaymentMethod.CASH, borrowFee: number = 45) {
    const selectedMethod = method || PaymentMethod.CASH;

    const { borrowing, book, unitAmount } = await this.prisma.$transaction(async (tx) => {
      const bookRecord = await tx.book.findUnique({ where: { id: bookId } });
      if (!bookRecord) {
        throw new NotFoundException('Book not found');
      }
      if (bookRecord.availableCopies <= 0) {
        throw new BadRequestException('No copies available for borrowing');
      }
      const alreadyBorrowed = await tx.borrowing.findFirst({
        where: { userId, bookId, isReturned: false },
      });
      if (alreadyBorrowed) {
        throw new BadRequestException('You already borrowed this book');
      }
      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { decrement: 1 } },
      });
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const unitAmount = borrowFee > 0 ? borrowFee : 45;
      const borrowingObj = await tx.borrowing.create({
        data: {
          userId,
          bookId,
          dueDate,
        },
        include: { book: true },
      });
      return { borrowing: borrowingObj, book: bookRecord, unitAmount };
    });

    const appFrontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';

    if (selectedMethod === PaymentMethod.CARD) {
      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'egp',
              product_data: {
                name: `Book Borrowing Fee: ${book.title}`,
                description: `Borrowing fee for 14 days of ${book.title}`,
              },
              unit_amount: Math.round(unitAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${appFrontendUrl}?checkout=success&borrowId=${borrowing.id}`,
        cancel_url: `${appFrontendUrl}?checkout=cancel`,
      });
      return { url: session.url, borrowing };
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

      const amountCents = Math.round(unitAmount * 100);

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

      return { url: walletPayData.redirect_url, borrowing };
    }

    if (selectedMethod === PaymentMethod.CASH) {
      return {
        message: 'Borrowing request submitted successfully.',
        borrowing,
      };
    }

    return { message: 'Book borrowed successfully', borrowing };
  }

  async returnBook(borrowingId: string) {
    const borrowing = await this.prisma.borrowing.findUnique({ where: { id: borrowingId } });
    if (!borrowing) throw new NotFoundException('Borrowing not found');
    if (borrowing.isReturned) throw new BadRequestException('Already returned');
    return this.prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: borrowing.bookId },
        data: { availableCopies: { increment: 1 } },
      });
      return tx.borrowing.update({
        where: { id: borrowingId },
        data: {
          isReturned: true,
          returnDate: new Date(),
        },
      });
    });
  }

  async returnByBookId(userId: string, bookId: string) {
    const borrowing = await this.prisma.borrowing.findFirst({
      where: { userId, bookId, isReturned: false },
    });
    if (!borrowing) throw new NotFoundException('You have not borrowed this book');
    return this.prisma.$transaction(async (tx) => {
      await tx.book.update({
        where: { id: bookId },
        data: { availableCopies: { increment: 1 } },
      });
      return tx.borrowing.update({
        where: { id: borrowing.id },
        data: {
          isReturned: true,
          returnDate: new Date(),
        },
      });
    });
  }

  async findMy(userId: string) {
    const borrowings = await this.prisma.borrowing.findMany({
      where: { userId, isReturned: false },
      include: { book: true },
      orderBy: { borrowDate: 'desc' },
    });
    return borrowings.map((b) => {
      const now = new Date();
      const isOverdue = now > b.dueDate;
      const daysLate = isOverdue ? Math.ceil((now.getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      return {
        ...b,
        isOverdue,
        daysLate,
        fine: this.calculateFine(b.dueDate, b.returnDate),
      };
    });
  }

  async findHistory(userId: string) {
    return this.prisma.borrowing.findMany({
      where: { userId, isReturned: true },
      include: { book: true },
      orderBy: { returnDate: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.borrowing.findMany({
      include: { user: true, book: true },
      orderBy: { borrowDate: 'desc' },
    });
  }

  async findOverdue() {
    const overdue = await this.prisma.borrowing.findMany({
      where: {
        isReturned: false,
        dueDate: { lt: new Date() },
      },
      include: { user: true, book: true },
    });
    return overdue.map((b) => ({
      ...b,
      daysLate: Math.ceil((new Date().getTime() - b.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      fine: this.calculateFine(b.dueDate),
    }));
  }

  async getStats() {
    const now = new Date();
    const [totalBooks, totalUsers, totalBorrowed, totalReturned, overdueList] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.user.count(),
      this.prisma.borrowing.count({ where: { isReturned: false } }),
      this.prisma.borrowing.count({ where: { isReturned: true } }),
      this.prisma.borrowing.findMany({
        where: { isReturned: false, dueDate: { lt: now } },
      }),
    ]);
    const totalOverdue = overdueList.length;
    const totalFines = overdueList.reduce((sum, b) => sum + this.calculateFine(b.dueDate), 0);
    return {
      totalBooks,
      totalUsers,
      totalBorrowed,
      totalReturned,
      totalOverdue,
      totalFines,
    };
  }

  private calculateFine(dueDate: Date, returnDate?: Date | null): number {
    const end = returnDate || new Date();
    if (end <= dueDate) return 0;
    const diffDays = Math.ceil((end.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays * 5;
  }
}
