import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async healthCheck() {
    return this.healthService.checkHealth();
  }

  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async readinessCheck() {
    return this.healthService.checkReadiness();
  }
}