import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class BooksService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
    if (category && category !== 'All' && category !== 'all') {
      conditions.push({ category: { equals: category, mode: 'insensitive' } });
    }
    if (conditions.length > 0) {
      where = { AND: conditions };
    }
    const books = await this.prisma.book.findMany({
      where,
      include: {
        borrowings: { where: { isReturned: false } },
        purchases: { where: { status: { in: ['PAID', 'PENDING'] } } },
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
        return { ...rest, availableCopies: correctAvailable };
      }),
    );
    return updatedBooks;
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: {
        borrowings: { where: { isReturned: false } },
        purchases: { where: { status: { in: ['PAID', 'PENDING'] } } },
      },
    });
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);
    const activeBorrowsCount = book.borrowings.length;
    const activePurchasesQty = book.purchases.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const correctAvailable = Math.max(0, book.totalCopies - activeBorrowsCount - activePurchasesQty);
    if (book.availableCopies !== correctAvailable) {
      await this.prisma.book.update({ where: { id }, data: { availableCopies: correctAvailable } });
    }
    const { borrowings, purchases, ...rest } = book;
    return { ...rest, availableCopies: correctAvailable };
  }

  create(dto: CreateBookDto) {
    const data: any = {
      ...dto,
      availableCopies: dto.totalCopies,
      totalCopies: Number(dto.totalCopies),
      price: dto.price !== undefined ? Number(dto.price) : undefined,
    };
    return this.prisma.book.create({ data });
  }

  async update(id: string, dto: UpdateBookDto) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);

    if (dto.coverUrl && book.coverUrl && dto.coverUrl !== book.coverUrl) {
      const oldUrl = book.coverUrl;
      if (oldUrl.includes('cloudinary')) {
        await this.cloudinaryService.deleteImageByUrlOrPublicId(oldUrl);
      }
    }

    const activeBorrows = await this.prisma.borrowing.count({ where: { bookId: id, isReturned: false } });
    const activePurchases = await this.prisma.purchase.findMany({ where: { bookId: id, status: { in: ['PAID', 'PENDING'] } } });
    const activePurchasesQty = activePurchases.reduce((sum, p) => sum + (p.quantity || 1), 0);
    const newTotal = dto.totalCopies !== undefined ? dto.totalCopies : book.totalCopies;
    const newAvailable = Math.max(0, newTotal - activeBorrows - activePurchasesQty);

    const updateData: any = {
      ...dto,
      ...(dto.totalCopies !== undefined ? { totalCopies: Number(dto.totalCopies) } : {}),
      ...(dto.price !== undefined ? { price: Number(dto.price) } : {}),
      availableCopies: newAvailable,
    };

    await this.prisma.book.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async updateCoverWithFile(id: string, fileBuffer: Buffer) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException(`Book with id ${id} not found`);

    const uploadResult = await this.cloudinaryService.uploadBookImage(fileBuffer);

    if (book.coverUrl && book.coverUrl.includes('cloudinary')) {
      await this.cloudinaryService.deleteImageByUrlOrPublicId(book.coverUrl);
    }

    const updated = await this.prisma.book.update({
      where: { id },
      data: { coverUrl: uploadResult.url },
    });

    return { ...updated, upload: uploadResult };
  }

  async remove(id: string) {
    const book = await this.findOne(id);
    if (book.coverUrl && (book.coverUrl as string).includes('cloudinary')) {
      await this.cloudinaryService.deleteImageByUrlOrPublicId(book.coverUrl as string);
    }
    return this.prisma.book.delete({ where: { id } });
  }
}
