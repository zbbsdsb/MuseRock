import { Injectable } from '@nestjs/common';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

@Injectable()
export class WorkingMemory {
  private store: Map<string, MemoryItem> = new Map();
  private maxItems = 100; // Limit for working memory

  async store(item: MemoryItem): Promise<MemoryItem> {
    // Add to store
    this.store.set(item.id, item);

    // Enforce memory limit
    if (this.store.size > this.maxItems) {
      this.trimMemory();
    }

    return item;
  }

  async retrieve(id: string): Promise<MemoryItem | null> {
    return this.store.get(id) || null;
  }

  async search(query: string): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    const queryLower = query.toLowerCase();

    for (const item of this.store.values()) {
      if (
        item.content.toLowerCase().includes(queryLower) ||
        Object.values(item.metadata).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(queryLower)
        )
      ) {
        results.push(item);
      }
    }

    // Sort by timestamp (most recent first)
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  private trimMemory(): void {
    // Convert map to array and sort by timestamp (oldest first)
    const items = Array.from(this.store.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp);

    // Remove oldest items until we're within limit
    while (this.store.size > this.maxItems && items.length > 0) {
      const [id] = items.shift()!;
      this.store.delete(id);
    }
  }
}