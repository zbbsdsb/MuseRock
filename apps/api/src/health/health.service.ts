import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  private readonly startTime = Date.now();

  async checkHealth(): Promise<{
    status: string;
    timestamp: number;
    uptime: number;
    version: string;
  }> {
    return {
      status: 'ok',
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      version: '1.0.0',
    };
  }

  async checkReadiness(): Promise<{
    status: string;
    timestamp: number;
    services: {
      memory: string;
      apprentice: string;
      mcp: string;
    };
  }> {
    // In a real implementation, we would check the status of each service
    // For now, we'll return a simple success response
    return {
      status: 'ready',
      timestamp: Date.now(),
      services: {
        memory: 'ok',
        apprentice: 'ok',
        mcp: 'ok',
      },
    };
  }
}