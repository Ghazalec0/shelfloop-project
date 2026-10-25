import { Controller, Get, Patch, Delete, Post, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { MailService } from '../mail/mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @Post('send-email')
  @Roles(Role.ADMIN)
  async sendEmail(@Body() body: { to: string; subject: string; message: string }) {
    await this.mailService.sendDirectEmail(body.to, body.subject, body.message);
    return { message: 'Email sent successfully' };
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  softDelete(@Param('id') id: string) {
    return this.usersService.softDelete(id);
  }
}