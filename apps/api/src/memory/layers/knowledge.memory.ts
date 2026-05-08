import { Injectable } from '@nestjs/common';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

@Injectable()
export class KnowledgeMemory {
  private memoryStore: Map<string, MemoryItem> = new Map();
  private index: Map<string, Set<string>> = new Map(); // Inverted index for faster searching

  async store(item: MemoryItem): Promise<MemoryItem> {
    this.memoryStore.set(item.id, item);
    this.updateIndex(item);
    return item;
  }

  async retrieve(id: string): Promise<MemoryItem | null> {
    return this.memoryStore.get(id) || null;
  }

  async search(query: string): Promise<MemoryItem[]> {
    const results: Set<MemoryItem> = new Set();
    const queryTerms = query.toLowerCase().split(' ');

    // Use inverted index for faster searching
    for (const term of queryTerms) {
      const itemIds = this.index.get(term);
      if (itemIds) {
        for (const id of itemIds) {
          const item = this.memoryStore.get(id);
          if (item) {
            results.add(item);
          }
        }
      }
    }

    // Convert set to array and sort by relevance
    return Array.from(results).sort((a, b) => {
      const aScore = this.calculateKnowledgeScore(a, query);
      const bScore = this.calculateKnowledgeScore(b, query);
      return bScore - aScore;
    });
  }

  async delete(id: string): Promise<boolean> {
    const item = this.memoryStore.get(id);
    if (item) {
      this.removeFromIndex(item);
      return this.memoryStore.delete(id);
    }
    return false;
  }

  async getAll(): Promise<MemoryItem[]> {
    return Array.from(this.memoryStore.values());
  }

  async getByCategory(category: string): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];

    for (const item of this.memoryStore.values()) {
      if (item.metadata.category === category) {
        results.push(item);
      }
    }

    return results;
  }

  private updateIndex(item: MemoryItem): void {
    // Extract terms from content and metadata
    const terms = this.extractTerms(item.content);
    if (item.metadata.tags) {
      terms.push(...item.metadata.tags.map((tag: string) => tag.toLowerCase()));
    }
    if (item.metadata.category) {
      terms.push(item.metadata.category.toLowerCase());
    }

    // Update inverted index
    for (const term of terms) {
      if (!this.index.has(term)) {
        this.index.set(term, new Set());
      }
      this.index.get(term)?.add(item.id);
    }
  }

  private removeFromIndex(item: MemoryItem): void {
    // Extract terms from content and metadata
    const terms = this.extractTerms(item.content);
    if (item.metadata.tags) {
      terms.push(...item.metadata.tags.map((tag: string) => tag.toLowerCase()));
    }
    if (item.metadata.category) {
      terms.push(item.metadata.category.toLowerCase());
    }

    // Remove from inverted index
    for (const term of terms) {
      const itemIds = this.index.get(term);
      if (itemIds) {
        itemIds.delete(item.id);
        if (itemIds.size === 0) {
          this.index.delete(term);
        }
      }
    }
  }

  private extractTerms(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .split(' ')
      .filter(term => term.length > 2); // Ignore short terms
  }

  private calculateKnowledgeScore(item: MemoryItem, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    if (item.content.toLowerCase().includes(queryLower)) {
      score += 0.4;
    }

    if (item.metadata.tags && item.metadata.tags.some((tag: string) => 
      tag.toLowerCase().includes(queryLower)
    )) {
      score += 0.3;
    }

    if (item.metadata.category && item.metadata.category.toLowerCase().includes(queryLower)) {
      score += 0.2;
    }

    // Boost score for recent items
    const daysSinceCreation = (Date.now() - item.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) {
      score += 0.1;
    }

    return score;
  }
}