import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      success: true,
      message: 'Shelfloop API is running successfully.',
      status: 'Operational',
      service: 'Shelfloop Backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
