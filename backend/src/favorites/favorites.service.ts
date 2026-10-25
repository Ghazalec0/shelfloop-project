import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggleFavorite(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');

    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { status: 'removed', message: 'Book removed from favorites' };
    } else {
      await this.prisma.favorite.create({
        data: { userId, bookId },
      });
      return { status: 'added', message: 'Book added to favorites' };
    }
  }

  async getMyFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { id: 'desc' },
    });
    return favorites.map((f) => f.book);
  }
}