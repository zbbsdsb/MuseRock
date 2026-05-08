import { Injectable } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { GenerationRequest, AIService } from '../ai/ai.service';

export interface JobTask {
  id: string;
  type: string;
  data: Record<string, any>;
  priority: number;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed' | 'processing';
  result?: any;
  error?: string;
  progress?: number;
}

@Injectable()
export class TaskQueueService {
  private queues: Map<string, Queue> = new Map();

  constructor(private aiService: AIService) {}

  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      });
      this.queues.set(name, queue);

      this.createWorker(name);
    }
    return this.queues.get(name)!;
  }

  private createWorker(name: string): void {
    const worker = new Worker(name, async (job: Job) => {
      switch (job.name) {
        case 'generate-content':
          return this.handleGenerateContent(job);
        case 'generate-structured':
          return this.handleGenerateStructured(job);
        case 'generate-from-template':
          return this.handleGenerateFromTemplate(job);
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    }, {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    worker.on('completed', (job) => {
      console.log(`Job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed with error:`, err.message);
    });
  }

  private async handleGenerateContent(job: Job): Promise<any> {
    const data = job.data as GenerationRequest;
    return this.aiService.generateContent(data);
  }

  private async handleGenerateStructured(job: Job): Promise<any> {
    const data = job.data as GenerationRequest;
    return this.aiService.generateStructuredContent(data);
  }

  private async handleGenerateFromTemplate(job: Job): Promise<any> {
    const data = job.data as any;
    return this.aiService.generateFromTemplate(data);
  }

  async addJob(queueName: string, task: JobTask): Promise<Job> {
    const queue = this.getQueue(queueName);
    return queue.add(task.type, task.data, {
      priority: task.priority,
      jobId: task.id,
    });
  }

  async getJobStatus(queueName: string, jobId: string): Promise<JobStatus | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();
    const result = await job.returnvalue;
    const error = job.failedReason;

    return {
      id: jobId,
      status: state as JobStatus['status'],
      result,
      error,
    };
  }

  async removeJob(queueName: string, jobId: string): Promise<boolean> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return false;
    }

    await job.remove();
    return true;
  }

  async getPendingJobs(queueName: string): Promise<any[]> {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getJobs(['delayed', 'waiting']);
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      timestamp: job.timestamp,
    }));
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.pause();
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.resume();
  }

  async getQueueStats(queueName: string): Promise<any> {
    const queue = this.getQueue(queueName);
    return queue.getJobCounts();
  }

  async shutdown(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
  }
}
