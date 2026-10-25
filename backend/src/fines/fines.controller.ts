import { Controller, Get, Post, Param, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { FinesService } from './fines.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PayFineDto } from './dto/fines.dto';

@UseGuards(JwtAuthGuard)
@Controller('fines')
export class FinesController {
  constructor(private finesService: FinesService) {}

  @Get('my')
  myFines(@CurrentUser() user: any) {
    const userId = user.id || user.userId || user.sub;
    return this.finesService.findMyFines(userId);
  }

  @Get('admin/all')
  getAllFinesForAdmin(@CurrentUser() user: any) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admins only.');
    }
    return this.finesService.findAllFinesForAdmin();
  }

  @Post(':id/pay')
  payFine(
    @CurrentUser() user: any,
    @Param('id') fineId: string,
    @Body() dto: PayFineDto,
  ) {
    const userId = user.id || user.userId || user.sub;
    return this.finesService.payFine(userId, fineId, dto);
  }

  @Post(':id/confirm-online-payment')
  confirmOnlinePayment(@CurrentUser() user: any, @Param('id') fineId: string) {
    const userId = user.id || user.userId || user.sub;
    return this.finesService.confirmOnlinePayment(userId, fineId);
  }

  @Post(':id/confirm-cash')
  confirmCash(@CurrentUser() user: any, @Param('id') fineId: string) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Access denied. Admins only.');
    }
    return this.finesService.confirmCashPayment(fineId);
  }
}