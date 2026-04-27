import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoryService } from '../memory/memory.service';
import { AIService } from '../ai/ai.service';
import { Apprentice } from './entities/apprentice.entity';
import { Job } from './entities/job.entity';

@Injectable()
export class ApprenticeService {
  private jobQueue: { id: string; priority: number }[] = [];
  private activeJobs: Set<string> = new Set();
  private maxConcurrentJobs = 3;

  constructor(
    @InjectRepository(Apprentice)
    private readonly apprenticeRepository: Repository<Apprentice>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    private readonly memoryService: MemoryService,
    private readonly aiService: AIService
  ) {
    // Start job processor
    this.processJobs();
  }

  async createApprentice(apprenticeData: {
    name: string;
    role: string;
    skills: string[];
    budget?: number;
    timeout?: number;
    reviewMode?: 'auto' | 'manual';
  }): Promise<Apprentice> {
    const apprentice = this.apprenticeRepository.create({
      name: apprenticeData.name,
      role: apprenticeData.role,
      skills: apprenticeData.skills,
      budget: apprenticeData.budget || 1000,
      timeout: apprenticeData.timeout || 60000, // 1 minute
      reviewMode: apprenticeData.reviewMode || 'auto',
      lastUsed: new Date(),
    });

    return await this.apprenticeRepository.save(apprentice);
  }

  async getApprentice(id: string): Promise<Apprentice | null> {
    return await this.apprenticeRepository.findOne({ where: { id } });
  }

  async listApprentices(): Promise<Apprentice[]> {
    return await this.apprenticeRepository.find();
  }

  async updateApprentice(id: string, updates: Partial<Apprentice>): Promise<Apprentice | null> {
    const apprentice = await this.apprenticeRepository.findOne({ where: { id } });
    if (!apprentice) {
      return null;
    }

    const updatedApprentice = this.apprenticeRepository.merge(apprentice, {
      ...updates,
      lastUsed: new Date(),
    });

    return await this.apprenticeRepository.save(updatedApprentice);
  }

  async deleteApprentice(id: string): Promise<boolean> {
    const result = await this.apprenticeRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async createJob(jobData: {
    apprenticeId: string;
    task: string;
    parameters: Record<string, any>;
    priority?: number;
  }): Promise<Job> {
    const apprentice = await this.apprenticeRepository.findOne({ where: { id: jobData.apprenticeId } });
    if (!apprentice) {
      throw new Error('Apprentice not found');
    }

    const job = this.jobRepository.create({
      apprenticeId: jobData.apprenticeId,
      task: jobData.task,
      parameters: jobData.parameters,
      status: 'pending',
      tokensUsed: 0,
    });

    const savedJob = await this.jobRepository.save(job);
    
    // Add job to queue with priority (higher priority = lower number)
    const priority = jobData.priority || 0;
    this.jobQueue.push({ id: savedJob.id, priority });
    
    // Sort queue by priority (ascending) and then by creation time (ascending)
    this.jobQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // If same priority, use job ID (which includes timestamp) as tiebreaker
      return a.id.localeCompare(b.id);
    });

    return savedJob;
  }

  async getJob(id: string): Promise<Job | null> {
    return await this.jobRepository.findOne({ where: { id } });
  }

  async listJobs(filters?: {
    apprenticeId?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  }): Promise<Job[]> {
    const query = this.jobRepository.createQueryBuilder('job');

    if (filters?.apprenticeId) {
      query.where('job.apprenticeId = :apprenticeId', { apprenticeId: filters.apprenticeId });
    }

    if (filters?.status) {
      query.where('job.status = :status', { status: filters.status });
    }

    return await query.orderBy('job.createdAt', 'DESC').getMany();
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await this.jobRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  private async processJobs() {
    while (true) {
      if (this.jobQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
        const jobItem = this.jobQueue.shift();
        if (jobItem) {
          const jobId = jobItem.id;
          this.activeJobs.add(jobId);
          this.executeJob(jobId).finally(() => {
            this.activeJobs.delete(jobId);
          });
        }
      }

      // Sleep for a short time before checking again
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async executeJob(jobId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) return;

    const apprentice = await this.apprenticeRepository.findOne({ where: { id: job.apprenticeId } });
    if (!apprentice) {
      job.status = 'failed';
      job.error = 'Apprentice not found';
      job.completedAt = new Date();
      await this.jobRepository.save(job);
      return;
    }

    // Update job status
    job.status = 'in_progress';
    job.startedAt = new Date();
    await this.jobRepository.save(job);

    try {
      // Execute the task based on apprentice role and task type
      const result = await this.executeTask(apprentice, job);

      // Update job with result
      job.status = 'completed';
      job.result = result;
      job.completedAt = new Date();
      job.tokensUsed = this.calculateTokensUsed(job.task, result);

      // Update apprentice last used time
      apprentice.lastUsed = new Date();
      await this.apprenticeRepository.save(apprentice);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = new Date();
    } finally {
      await this.jobRepository.save(job);
    }
  }

  private async executeTask(apprentice: Apprentice, job: Job): Promise<any> {
    // Use AI service to execute the task based on apprentice role
    const result = await this.aiService.generateContent(
      job.task,
      apprentice.role,
      job.parameters
    );

    // Format the result based on the apprentice role
    switch (apprentice.role) {
      case 'researcher':
        return {
          research_results: [
            { title: 'Research Result', content: result.content },
          ],
          sources: ['AI-generated research'],
          tokens_used: result.tokensUsed,
        };
      case 'writer':
        return {
          content: result.content,
          word_count: result.content.split(/\s+/).filter((x: string) => x).length,
          tokens_used: result.tokensUsed,
        };
      case 'designer':
        return {
          design_concepts: [result.content],
          style_guide: 'AI-generated design concepts',
          tokens_used: result.tokensUsed,
        };
      case 'musician':
        return {
          music_concept: result.content,
          tokens_used: result.tokensUsed,
        };
      default:
        return {
          content: result.content,
          tokens_used: result.tokensUsed,
        };
    }
  }

  private calculateTokensUsed(task: string, result: any): number {
    // Use actual token usage from AI service if available
    if (result.tokens_used && result.tokens_used.total) {
      return result.tokens_used.total;
    }
    
    // Fallback to simple token calculation based on task length and result complexity
    const taskTokens = task.length / 4; // Rough estimate
    const resultTokens = JSON.stringify(result).length / 4;
    return Math.round(taskTokens + resultTokens);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}