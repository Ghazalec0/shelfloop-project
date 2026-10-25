import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const search = query.search?.trim() || '';
    const category = query.category?.trim() || '';

    let where: Prisma.BookWhereInput = {};
    const conditions: Prisma.BookWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    if (category && category !== 'All') {
      conditions.push({ category: { equals: category, mode: 'insensitive' } });
    }

    if (conditions.length > 0) {
      where = { AND: conditions };
    }

    const books = await this.prisma.book.findMany({
      where,
      include: {
        borrowings: {
          where: { isReturned: false },
        },
        purchases: {
          where: { status: { in: ['PAID', 'PENDING'] } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const updatedBooks = await Promise.all(
      books.map(async (book) => {
        const activeBorrowsCount = book.borrowings.length;
        const activePurchasesQty = book.purchases.reduce((sum, p) => sum + (p.quantity || 1), 0);
        const correctAvailable = Math.max(0, book.totalCopies - activeBorrowsCount - activePurchasesQty);

        if (book.availableCopies !== correctAvailable) {
          await this.prisma.book.update({
            where: { id: book.id },
            data: { availableCopies: correctAvailable },
          });
        }

        const { borrowings, purchases, ...rest } = book;
        return {
          ...rest,
          availableCopies: correctAvailable,
        };
      })
    );

    return updatedBooks;
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: {
          where: { isReturned: false },
        },
        purchases: {
          where: { status: { in: ['PAID', 'PENDING'] } },
        },
      },
    });

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    const activeBorrowsCount = book.borrowings.length;
    const activePurchasesQty = book.purchases.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const correctAvailable = Math.max(0, book.totalCopies - activeBorrowsCount - activePurchasesQty);

    if (book.availableCopies !== correctAvailable) {
      await this.prisma.book.update({
        where: { id },
        data: { availableCopies: correctAvailable },
      });
    }

    const { borrowings, purchases, ...rest } = book;
    return {
      ...rest,
      availableCopies: correctAvailable,
    };
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        ...dto,
        availableCopies: dto.totalCopies,
      },
    });
  }

  async update(id: string, dto: UpdateBookDto) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    const activeBorrows = await this.prisma.borrowing.count({
      where: { bookId: id, isReturned: false },
    });

    const activePurchases = await this.prisma.purchase.findMany({
      where: { bookId: id, status: { in: ['PAID', 'PENDING'] } },
    });
    const activePurchasesQty = activePurchases.reduce((sum, p) => sum + (p.quantity || 1), 0);

    const newTotal = dto.totalCopies !== undefined ? dto.totalCopies : book.totalCopies;
    const newAvailable = Math.max(0, newTotal - activeBorrows - activePurchasesQty);

    await this.prisma.book.update({
      where: { id },
      data: {
        ...dto,
        availableCopies: newAvailable,
      },
    });

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.book.delete({ where: { id } });
  }
}