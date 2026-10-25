import { Controller, Post, Body } from '@nestjs/common';
import { MailService } from './mail.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Post()
  async sendContactMessage(@Body() dto: ContactDto) {
    await this.mailService.sendContactMessage(dto.name, dto.email, dto.message);
    return { message: 'Message sent successfully' };
  }
}