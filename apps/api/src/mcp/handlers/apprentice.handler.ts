import { Injectable } from '@nestjs/common';
import { ApprenticeService } from '../../apprentice/apprentice.service';
import { MCPHandler } from './handler.registry';
import { CreateApprenticeJobParams, CreateApprenticeJobResult } from '../types/mcp.types';
import { Job } from '../../apprentice/entities/job.entity';

@Injectable()
export class ApprenticeHandler implements MCPHandler {
  constructor(private readonly apprenticeService: ApprenticeService) {}

  getMethodName(): string {
    return 'create_apprentice_job';
  }

  async execute(params: Record<string, unknown>): Promise<CreateApprenticeJobResult> {
    const jobParams = params as CreateApprenticeJobParams;

    const job = await this.apprenticeService.createJob({
      apprenticeId: jobParams.agentType,
      task: jobParams.task,
      parameters: jobParams.context || {},
    });

    return this.mapJobToResult(job);
  }

  private mapJobToResult(job: Job): CreateApprenticeJobResult {
    const estimatedCompletion = new Date(Date.now() + (job.id.length * 1000));

    return {
      jobId: job.id,
      status: job.status,
      queueName: 'apprentice-standard',
      estimatedCompletion: estimatedCompletion.toISOString(),
      budgetRemaining: 1000,
    };
  }
}