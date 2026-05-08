import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { TaskQueueService, JobTask } from '../../queue/task-queue.service';
import { GenerationRequest } from '../../ai/ai.service';

export function createQueueRouter(taskQueueService: TaskQueueService) {
  return router({
    addJob: protectedProcedure
      .input(z.object({
        queueName: z.string(),
        task: z.object({
          id: z.string(),
          type: z.enum(['generate-content', 'generate-structured', 'generate-from-template']),
          data: z.record(z.string(), z.any()),
          priority: z.number().default(0),
        }),
      }))
      .mutation(async ({ input }) => {
        return taskQueueService.addJob(input.queueName, input.task);
      }),

    getJobStatus: protectedProcedure
      .input(z.object({
        queueName: z.string(),
        jobId: z.string(),
      }))
      .query(async ({ input }) => {
        return taskQueueService.getJobStatus(input.queueName, input.jobId);
      }),

    removeJob: protectedProcedure
      .input(z.object({
        queueName: z.string(),
        jobId: z.string(),
      }))
      .mutation(async ({ input }) => {
        return taskQueueService.removeJob(input.queueName, input.jobId);
      }),

    getPendingJobs: protectedProcedure
      .input(z.object({
        queueName: z.string(),
      }))
      .query(async ({ input }) => {
        const jobs = await taskQueueService.getPendingJobs(input.queueName);
        return jobs.map((job: any) => ({
          id: job.id,
          name: job.name,
          data: job.data,
          timestamp: job.timestamp,
        }));
      }),

    pauseQueue: protectedProcedure
      .input(z.object({
        queueName: z.string(),
      }))
      .mutation(async ({ input }) => {
        await taskQueueService.pauseQueue(input.queueName);
        return { success: true };
      }),

    resumeQueue: protectedProcedure
      .input(z.object({
        queueName: z.string(),
      }))
      .mutation(async ({ input }) => {
        await taskQueueService.resumeQueue(input.queueName);
        return { success: true };
      }),

    getQueueStats: protectedProcedure
      .input(z.object({
        queueName: z.string(),
      }))
      .query(async ({ input }) => {
        return taskQueueService.getQueueStats(input.queueName);
      }),
  });
}
