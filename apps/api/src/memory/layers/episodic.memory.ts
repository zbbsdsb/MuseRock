import { Injectable } from '@nestjs/common';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

@Injectable()
export class EpisodicMemory {
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
        (item.metadata.event && item.metadata.event.toLowerCase().includes(queryLower)) ||
        (item.metadata.location && item.metadata.location.toLowerCase().includes(queryLower))
      ) {
        results.push(item);
      }
    }

    // Sort by timestamp (most recent first)
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  async delete(id: string): Promise<boolean> {
    return this.memoryStore.delete(id);
  }

  async getByTimeRange(startTime: number, endTime: number): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];

    for (const item of this.memoryStore.values()) {
      if (item.timestamp >= startTime && item.timestamp <= endTime) {
        results.push(item);
      }
    }

    return results.sort((a, b) => a.timestamp - b.timestamp);
  }
}