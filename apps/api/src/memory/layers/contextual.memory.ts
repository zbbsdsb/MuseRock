import { Injectable } from '@nestjs/common';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

@Injectable()
export class ContextualMemory {
  private memoryStore: Map<string, MemoryItem> = new Map();

  async store(item: MemoryItem): Promise<MemoryItem> {
    this.memoryStore.set(item.id, item);
    return item;
  }

  async retrieve(id: string): Promise<MemoryItem | null> {
    return this.memoryStore.get(id) || null;
  }

  async search(query: string): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    const queryLower = query.toLowerCase();

    for (const item of this.memoryStore.values()) {
      if (
        item.content.toLowerCase().includes(queryLower) ||
        (item.metadata.context && item.metadata.context.toLowerCase().includes(queryLower)) ||
        (item.metadata.topic && item.metadata.topic.toLowerCase().includes(queryLower))
      ) {
        results.push(item);
      }
    }

    // Sort by relevance (simplified - based on context matching)
    return results.sort((a, b) => {
      const aScore = this.calculateContextScore(a, queryLower);
      const bScore = this.calculateContextScore(b, queryLower);
      return bScore - aScore;
    });
  }

  async delete(id: string): Promise<boolean> {
    return this.memoryStore.delete(id);
  }

  async getAll(): Promise<MemoryItem[]> {
    return Array.from(this.memoryStore.values());
  }

  async getByContext(context: string): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    const contextLower = context.toLowerCase();

    for (const item of this.memoryStore.values()) {
      if (item.metadata.context && item.metadata.context.toLowerCase().includes(contextLower)) {
        results.push(item);
      }
    }

    return results;
  }

  private calculateContextScore(item: MemoryItem, query: string): number {
    let score = 0;

    if (item.content.toLowerCase().includes(query)) {
      score += 0.5;
    }

    if (item.metadata.context && item.metadata.context.toLowerCase().includes(query)) {
      score += 0.3;
    }

    if (item.metadata.topic && item.metadata.topic.toLowerCase().includes(query)) {
      score += 0.2;
    }

    return score;
  }
}