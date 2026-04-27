import { Injectable } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';

interface Apprentice {
  id: string;
  name: string;
  role: string;
  skills: string[];
  budget: number; // Token budget
  timeout: number; // Execution timeout in milliseconds
  reviewMode: 'auto' | 'manual';
  createdAt: number;
  lastUsed: number;
}

interface ApprenticeJob {
  id: string;
  apprenticeId: string;
  task: string;
  parameters: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  tokensUsed: number;
}

@Injectable()
export class ApprenticeService {
  private apprentices: Map<string, Apprentice> = new Map();
  private jobs: Map<string, ApprenticeJob> = new Map();
  private jobQueue: string[] = [];
  private activeJobs: Set<string> = new Set();
  private maxConcurrentJobs = 3;

  constructor(private readonly memoryService: MemoryService) {
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
    const apprentice: Apprentice = {
      id: this.generateId(),
      name: apprenticeData.name,
      role: apprenticeData.role,
      skills: apprenticeData.skills,
      budget: apprenticeData.budget || 1000,
      timeout: apprenticeData.timeout || 60000, // 1 minute
      reviewMode: apprenticeData.reviewMode || 'auto',
      createdAt: Date.now(),
      lastUsed: Date.now(),
    };

    this.apprentices.set(apprentice.id, apprentice);
    return apprentice;
  }

  async getApprentice(id: string): Promise<Apprentice | null> {
    return this.apprentices.get(id) || null;
  }

  async listApprentices(): Promise<Apprentice[]> {
    return Array.from(this.apprentices.values());
  }

  async updateApprentice(id: string, updates: Partial<Apprentice>): Promise<Apprentice | null> {
    const apprentice = this.apprentices.get(id);
    if (!apprentice) {
      return null;
    }

    const updatedApprentice = {
      ...apprentice,
      ...updates,
      lastUsed: Date.now(),
    };

    this.apprentices.set(id, updatedApprentice);
    return updatedApprentice;
  }

  async deleteApprentice(id: string): Promise<boolean> {
    return this.apprentices.delete(id);
  }

  async createJob(jobData: {
    apprenticeId: string;
    task: string;
    parameters: Record<string, any>;
  }): Promise<ApprenticeJob> {
    const apprentice = this.apprentices.get(jobData.apprenticeId);
    if (!apprentice) {
      throw new Error('Apprentice not found');
    }

    const job: ApprenticeJob = {
      id: this.generateId(),
      apprenticeId: jobData.apprenticeId,
      task: jobData.task,
      parameters: jobData.parameters,
      status: 'pending',
      tokensUsed: 0,
      createdAt: Date.now(),
    };

    this.jobs.set(job.id, job);
    this.jobQueue.push(job.id);

    return job;
  }

  async getJob(id: string): Promise<ApprenticeJob | null> {
    return this.jobs.get(id) || null;
  }

  async listJobs(filters?: {
    apprenticeId?: string;
    status?: 'pending' | 'in_progress' | 'completed' | 'failed';
  }): Promise<ApprenticeJob[]> {
    let jobs = Array.from(this.jobs.values());

    if (filters?.apprenticeId) {
      jobs = jobs.filter(job => job.apprenticeId === filters.apprenticeId);
    }

    if (filters?.status) {
      jobs = jobs.filter(job => job.status === filters.status);
    }

    return jobs.sort((a, b) => b.createdAt - a.createdAt);
  }

  private async processJobs() {
    while (true) {
      if (this.jobQueue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
        const jobId = this.jobQueue.shift();
        if (jobId) {
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
    const job = this.jobs.get(jobId);
    if (!job) return;

    const apprentice = this.apprentices.get(job.apprenticeId);
    if (!apprentice) {
      job.status = 'failed';
      job.error = 'Apprentice not found';
      job.completedAt = Date.now();
      this.jobs.set(jobId, job);
      return;
    }

    // Update job status
    job.status = 'in_progress';
    job.startedAt = Date.now();
    this.jobs.set(jobId, job);

    try {
      // Execute the task based on apprentice role and task type
      const result = await this.executeTask(apprentice, job);

      // Update job with result
      job.status = 'completed';
      job.result = result;
      job.completedAt = Date.now();
      job.tokensUsed = this.calculateTokensUsed(job.task, result);

      // Update apprentice last used time
      apprentice.lastUsed = Date.now();
      this.apprentices.set(apprentice.id, apprentice);

    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.completedAt = Date.now();
    } finally {
      this.jobs.set(jobId, job);
    }
  }

  private async executeTask(apprentice: Apprentice, job: ApprenticeJob): Promise<any> {
    // Simulate task execution based on apprentice role and task type
    switch (apprentice.role) {
      case 'researcher':
        return this.executeResearchTask(job);
      case 'writer':
        return this.executeWriterTask(job);
      case 'designer':
        return this.executeDesignerTask(job);
      case 'musician':
        return this.executeMusicianTask(job);
      default:
        return { message: `Task executed by ${apprentice.role}: ${job.task}` };
    }
  }

  private async executeResearchTask(job: ApprenticeJob): Promise<any> {
    // Simulate research task
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      research_results: [
        { title: 'Research Result 1', content: 'This is a research result' },
        { title: 'Research Result 2', content: 'This is another research result' },
      ],
      sources: ['source1.com', 'source2.com'],
    };
  }

  private async executeWriterTask(job: ApprenticeJob): Promise<any> {
    // Simulate writing task
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
      content: `Generated content for task: ${job.task}\n\nThis is a sample of generated writing based on the task parameters.`,
      word_count: 150,
    };
  }

  private async executeDesignerTask(job: ApprenticeJob): Promise<any> {
    // Simulate design task
    await new Promise(resolve => setTimeout(resolve, 4000));
    return {
      design_concepts: ['Concept 1', 'Concept 2', 'Concept 3'],
      style_guide: 'Modern, minimalist design with bold typography',
    };
  }

  private async executeMusicianTask(job: ApprenticeJob): Promise<any> {
    // Simulate music task
    await new Promise(resolve => setTimeout(resolve, 5000));
    return {
      music_genres: ['Ambient', 'Electronic', 'Classical'],
      mood: 'Calm and reflective',
      tempo: 'Moderate',
    };
  }

  private calculateTokensUsed(task: string, result: any): number {
    // Simple token calculation based on task length and result complexity
    const taskTokens = task.length / 4; // Rough estimate
    const resultTokens = JSON.stringify(result).length / 4;
    return Math.round(taskTokens + resultTokens);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}