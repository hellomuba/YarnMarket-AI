import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'yarnmarket-merchant-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}