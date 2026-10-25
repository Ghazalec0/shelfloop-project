import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':bookId')
  toggleFavorite(@Req() req: any, @Param('bookId') bookId: string) {
    const userId = req.user.id;
    return this.favoritesService.toggleFavorite(userId, bookId);
  }

  @Get('my')
  getMyFavorites(@Req() req: any) {
    const userId = req.user.id;
    return this.favoritesService.getMyFavorites(userId);
  }
}