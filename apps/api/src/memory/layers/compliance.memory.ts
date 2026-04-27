import { Injectable } from '@nestjs/common';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

@Injectable()
export class ComplianceMemory {
  private store: Map<string, MemoryItem> = new Map();

  async store(item: MemoryItem): Promise<MemoryItem> {
    // Ensure sensitivity is at least restricted for compliance memory
    const securedItem = {
      ...item,
      sensitivity: item.sensitivity === 'private' ? 'private' : 'restricted',
    };

    this.store.set(securedItem.id, securedItem);
    return securedItem;
  }

  async retrieve(id: string): Promise<MemoryItem | null> {
    return this.store.get(id) || null;
  }

  async search(query: string): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];
    const queryLower = query.toLowerCase();

    for (const item of this.store.values()) {
      // Only search if query is relevant and item is accessible
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

  async getBySensitivity(sensitivity: 'restricted' | 'private'): Promise<MemoryItem[]> {
    const results: MemoryItem[] = [];

    for (const item of this.store.values()) {
      if (item.sensitivity === sensitivity) {
        results.push(item);
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  async sanitizeForExternalUse(item: MemoryItem): Promise<MemoryItem> {
    // Sanitize sensitive data for external use (e.g., when sending to LLMs)
    if (item.sensitivity === 'private') {
      return {
        ...item,
        content: '[REDACTED - PRIVATE DATA]',
        metadata: {
          ...item.metadata,
          sensitive: true,
        },
      };
    } else if (item.sensitivity === 'restricted') {
      // Redact specific fields in restricted data
      const sanitizedMetadata = { ...item.metadata };
      if (sanitizedMetadata.personal_info) {
        sanitizedMetadata.personal_info = '[REDACTED]';
      }
      if (sanitizedMetadata.contact_info) {
        sanitizedMetadata.contact_info = '[REDACTED]';
      }

      return {
        ...item,
        metadata: sanitizedMetadata,
      };
    }

    return item;
  }
}