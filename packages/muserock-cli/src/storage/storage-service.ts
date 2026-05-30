import { mkdir, readdir, readFile, writeFile, unlink, access, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { Project } from './types.js';

export class StorageService {
  private readonly baseDir: string;
  private readonly projectsDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || join(homedir(), '.muserock');
    this.projectsDir = join(this.baseDir, 'projects');
  }

  async initialize(): Promise<void> {
    await mkdir(this.projectsDir, { recursive: true });
  }

  async listProjects(): Promise<string[]> {
    try {
      const files = await readdir(this.projectsDir);
      return files
        .filter((file) => file.endsWith('.json'))
        .map((file) => file.replace('.json', ''));
    } catch {
      return [];
    }
  }

  async loadProject(projectId: string): Promise<Project | null> {
    const filePath = join(this.projectsDir, `${projectId}.json`);
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  async saveProject(project: Project): Promise<void> {
    const filePath = join(this.projectsDir, `${project.id}.json`);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8');
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const filePath = join(this.projectsDir, `${projectId}.json`);
    try {
      await unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async projectExists(projectId: string): Promise<boolean> {
    const filePath = join(this.projectsDir, `${projectId}.json`);
    try {
      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getProjectSize(projectId: string): Promise<number | null> {
    const filePath = join(this.projectsDir, `${projectId}.json`);
    try {
      const stats = await stat(filePath);
      return stats.size;
    } catch {
      return null;
    }
  }

  getBaseDir(): string {
    return this.baseDir;
  }

  getProjectsDir(): string {
    return this.projectsDir;
  }
}

export const defaultStorage = new StorageService();
