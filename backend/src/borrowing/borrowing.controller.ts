import { Controller, Get, Param, Post, UseGuards, Body } from '@nestjs/common';
import { BorrowingService } from './borrowing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role, PaymentMethod } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('borrows')
export class BorrowingController {
  constructor(private borrowingService: BorrowingService) {}

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.borrowingService.getStats();
  }

  @Get('overdue')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findOverdue() {
    return this.borrowingService.findOverdue();
  }

  @Get('my')
  myBorrows(@CurrentUser() user: any) {
    const userId = user.id || user.userId || user.sub;
    return this.borrowingService.findMy(userId);
  }

  @Get('my/history')
  myHistory(@CurrentUser() user: any) {
    const userId = user.id || user.userId || user.sub;
    return this.borrowingService.findHistory(userId);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.borrowingService.findAll();
  }

  @Post(':bookId')
  borrow(
    @CurrentUser() user: any,
    @Param('bookId') bookId: string,
    @Body('method') method?: PaymentMethod,
  ) {
    const userId = user.id || user.userId || user.sub;
    return this.borrowingService.borrow(userId, bookId, method);
  }

  @Post(':bookId/return')
  returnBook(@CurrentUser() user: any, @Param('bookId') bookId: string) {
    const userId = user.id || user.userId || user.sub;
    return this.borrowingService.returnByBookId(userId, bookId);
  }
}