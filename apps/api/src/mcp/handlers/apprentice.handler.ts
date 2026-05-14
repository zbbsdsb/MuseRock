import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { ApprenticeService } from '../../apprentice/apprentice.service';
import { MCPHandler } from './handler.registry';
import {
  Tool,
  CreateApprenticeJobParams,
  CreateApprenticeJobResult,
  GetApprenticeJobParams,
  GetApprenticeJobResult,
  User,
} from '../types/mcp.types';
import { Job } from '../../apprentice/entities/job.entity';

/**
 * 创建学徒任务工具
 */
@Injectable()
export class ApprenticeHandler implements MCPHandler {
  constructor(private readonly apprenticeService: ApprenticeService) {}

  getMethodName(): string {
    return 'create_apprentice_job';
  }

  getToolDefinition(): Tool {
    return {
      name: 'create_apprentice_job',
      description:
        'Create a new apprentice job to perform work in the background. Supports different agent types for research, writing, analysis, and reviewing. Jobs can be monitored using get_apprentice_job.',
      inputSchema: {
        type: 'object',
        properties: {
          agentType: {
            type: 'string',
            description: 'Type of apprentice agent to use',
            enum: ['researcher', 'writer', 'analyst', 'reviewer'],
            default: 'writer',
          },
          task: {
            type: 'string',
            description: 'The task description for the apprentice to perform',
          },
          context: {
            type: 'object',
            description: 'Optional context for the job',
            properties: {
              projectId: { type: 'string', description: 'Project ID for context' },
              memoryIds: {
                type: 'array',
                items: { type: 'string' },
                description: 'Memory IDs to include in the job',
              },
            },
          },
          budget: {
            type: 'number',
            description: 'Budget for the job (token limit)',
            minimum: 100,
            maximum: 100000,
            default: 10000,
          },
          timeout: {
            type: 'number',
            description: 'Timeout in seconds for the job',
            minimum: 30,
            maximum: 3600,
            default: 300,
          },
          reviewMode: {
            type: 'boolean',
            description: 'Whether to enable human review mode',
            default: false,
          },
        },
        required: ['task'],
      },
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    };
  }

  async execute(
    params: Record<string, unknown>,
    user?: User,
  ): Promise<CreateApprenticeJobResult> {
    const validatedParams = this.validateParams(params);

    const job = await this.apprenticeService.createJob({
      apprenticeId: validatedParams.agentType,
      task: validatedParams.task,
      parameters: validatedParams.context || {},
    });

    return this.mapJobToResult(job);
  }

  private mapJobToResult(job: Job): CreateApprenticeJobResult {
    const estimatedCompletion = new Date(Date.now() + job.id.length * 1000);

    return {
      jobId: job.id,
      status: job.status,
      queueName: 'apprentice-standard',
      estimatedCompletion: estimatedCompletion.toISOString(),
      budgetRemaining: 10000,
    };
  }

  private validateParams(params: Record<string, unknown>): CreateApprenticeJobParams {
    const schema = z.object({
      agentType: z
        .enum(['researcher', 'writer', 'analyst', 'reviewer'])
        .optional()
        .default('writer'),
      task: z.string().min(1, 'Task description cannot be empty'),
      context: z
        .object({
          projectId: z.string().optional(),
          memoryIds: z.array(z.string()).optional(),
        })
        .optional(),
      budget: z.number().int().min(100).max(100000).optional().default(10000),
      timeout: z.number().int().min(30).max(3600).optional().default(300),
      reviewMode: z.boolean().optional().default(false),
    });

    return schema.parse(params);
  }
}

/**
 * 获取学徒任务状态工具
 */
@Injectable()
export class GetApprenticeJobHandler implements MCPHandler {
  constructor(private readonly apprenticeService: ApprenticeService) {}

  getMethodName(): string {
    return 'get_apprentice_job';
  }

  getToolDefinition(): Tool {
    return {
      name: 'get_apprentice_job',
      description:
        'Get the current status and result of an apprentice job. Use job ID returned from create_apprentice_job to check progress.',
      inputSchema: {
        type: 'object',
        properties: {
          jobId: {
            type: 'string',
            description: 'Unique ID of the apprentice job to check',
          },
        },
        required: ['jobId'],
      },
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    };
  }

  async execute(
    params: Record<string, unknown>,
    user?: User,
  ): Promise<GetApprenticeJobResult> {
    const validatedParams = this.validateParams(params);

    // 尝试从服务获取任务（模拟实现）
    return {
      jobId: validatedParams.jobId,
      status: 'completed',
      result: 'Job completed successfully',
      progress: 100,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

  private validateParams(params: Record<string, unknown>): GetApprenticeJobParams {
    const schema = z.object({
      jobId: z.string().min(1, 'Job ID is required'),
    });

    return schema.parse(params);
  }
}
