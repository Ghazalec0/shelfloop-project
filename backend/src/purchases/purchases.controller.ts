import { 
  Controller, 
  Post, 
  Delete, 
  Get, 
  Body, 
  Param, 
  Req, 
  UseGuards 
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentMethod } from '@prisma/client';

@Controller('purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  async purchaseBook(
    @Req() req: any,
    @Body('bookId') bookId: string,
    @Body('quantity') quantity?: number,
    @Body('price') price?: number,
    @Body('method') method?: PaymentMethod,
  ) {
    return this.purchasesService.purchaseBook(req.user.id, bookId, quantity, price, method);
  }

  @Delete(':id/cancel')
  async cancelPurchase(@Req() req: any, @Param('id') id: string) {
    return this.purchasesService.cancelPurchase(req.user.id, id);
  }

  @Post(':id/confirm-online-payment')
  async confirmOnlinePayment(@Req() req: any, @Param('id') id: string) {
    return this.purchasesService.confirmOnlinePayment(req.user.id, id);
  }

  @Post(':id/confirm-cash')
  async confirmCashPayment(@Param('id') id: string) {
    return this.purchasesService.confirmCashPayment(id);
  }

  @Get('my')
  async getMyPurchases(@Req() req: any) {
    return this.purchasesService.getMyPurchases(req.user.id);
  }

  @Get('admin/all')
  async getAllPurchases() {
    return this.purchasesService.getAllPurchases();
  }
}