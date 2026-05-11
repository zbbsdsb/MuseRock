import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { WorkingMemory } from './layers/working.memory';
import { EpisodicMemory } from './layers/episodic.memory';
import { ContextualMemory } from './layers/contextual.memory';
import { KnowledgeMemory } from './layers/knowledge.memory';
import { ComplianceMemory } from './layers/compliance.memory';

export interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

export interface SearchResult {
  item: MemoryItem;
  score: number;
  layer: string;
}

export interface StoreMemoryOptions {
  userId: string;
  content: string;
  type: 'episodic' | 'contextual' | 'knowledge' | 'working';
  sensitivity: 'public' | 'restricted' | 'private';
  metadata?: Record<string, any>;
}

export interface SearchMemoryOptions {
  userId: string;
  query: string;
  limit?: number;
  layers?: string[];
  sensitivity?: ('public' | 'restricted' | 'private')[];
}

export interface RecallMemoryOptions {
  userId: string;
  layer: 'episodic' | 'working' | 'knowledge' | 'contextual';
  limit?: number;
}

@Injectable()
export class MemoryService {
  constructor(
    private readonly workingMemory: WorkingMemory,
    private readonly episodicMemory: EpisodicMemory,
    private readonly contextualMemory: ContextualMemory,
    private readonly knowledgeMemory: KnowledgeMemory,
    private readonly complianceMemory: ComplianceMemory,
  ) {}

  async storeMemory(options: StoreMemoryOptions): Promise<MemoryItem> {
    const { userId, content, type, sensitivity, metadata = {} } = options;
    
    const validatedItem: MemoryItem = {
      id: this.generateId(),
      content,
      metadata: { ...metadata, type, userId },
      timestamp: Date.now(),
      sensitivity,
    };

    if (sensitivity === 'private') {
      return this.complianceMemory.store(validatedItem);
    } else if (type === 'episodic') {
      return this.episodicMemory.store(validatedItem);
    } else if (type === 'contextual') {
      return this.contextualMemory.store(validatedItem);
    } else if (type === 'knowledge') {
      return this.knowledgeMemory.store(validatedItem);
    } else {
      return this.workingMemory.store(validatedItem);
    }
  }

  async searchMemory(options: SearchMemoryOptions): Promise<SearchResult[]> {
    const { query, limit = 10, layers, sensitivity } = options;

    // Create array of search promises
    const searchPromises = [];

    if (!layers || layers.includes('working')) {
      searchPromises.push(
        this.workingMemory.search(query).then(results => 
          results.map(item => ({ 
            item, 
            score: this.calculateScore(item, query), 
            layer: 'working' 
          }))
        )
      );
    }

    if (!layers || layers.includes('episodic')) {
      searchPromises.push(
        this.episodicMemory.search(query).then(results => 
          results.map(item => ({ 
            item, 
            score: this.calculateScore(item, query), 
            layer: 'episodic' 
          }))
        )
      );
    }

    if (!layers || layers.includes('contextual')) {
      searchPromises.push(
        this.contextualMemory.search(query).then(results => 
          results.map(item => ({ 
            item, 
            score: this.calculateScore(item, query), 
            layer: 'contextual' 
          }))
        )
      );
    }

    if (!layers || layers.includes('knowledge')) {
      searchPromises.push(
        this.knowledgeMemory.search(query).then(results => 
          results.map(item => ({ 
            item, 
            score: this.calculateScore(item, query), 
            layer: 'knowledge' 
          }))
        )
      );
    }

    if (!layers || layers.includes('compliance')) {
      searchPromises.push(
        this.complianceMemory.search(query).then(results => 
          results.map(item => ({ 
            item, 
            score: this.calculateScore(item, query), 
            layer: 'compliance' 
          }))
        )
      );
    }

    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    
    // Flatten the results array
    const results = searchResults.flat();

    // Filter by sensitivity
    const filteredResults = results.filter(result => {
      if (!sensitivity) return true;
      return sensitivity.includes(result.item.sensitivity);
    });

    // Sort by score and limit
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async recallMemory(options: RecallMemoryOptions): Promise<MemoryItem[]> {
    const { layer, limit = 10 } = options;
    
    let memoryLayer;
    switch (layer) {
      case 'episodic':
        memoryLayer = this.episodicMemory;
        break;
      case 'contextual':
        memoryLayer = this.contextualMemory;
        break;
      case 'knowledge':
        memoryLayer = this.knowledgeMemory;
        break;
      case 'working':
      default:
        memoryLayer = this.workingMemory;
    }
    
    const items = await memoryLayer.getAll();
    return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async retrieveMemory(id: string): Promise<MemoryItem | null> {
    // Check all layers for the memory item
    const layers = [
      this.workingMemory,
      this.episodicMemory,
      this.contextualMemory,
      this.knowledgeMemory,
      this.complianceMemory,
    ];

    for (const layer of layers) {
      const item = await layer.retrieve(id);
      if (item) {
        return item;
      }
    }

    return null;
  }

  async deleteMemory(id: string): Promise<boolean> {
    // Check all layers for the memory item
    const layers = [
      this.workingMemory,
      this.episodicMemory,
      this.contextualMemory,
      this.knowledgeMemory,
      this.complianceMemory,
    ];

    for (const layer of layers) {
      const deleted = await layer.delete(id);
      if (deleted) {
        return true;
      }
    }

    return false;
  }

  private generateId(): string {
    return uuidv4();
  }

  private calculateScore(item: MemoryItem, query: string): number {
    // Simple scoring algorithm based on content similarity
    const content = item.content.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (content.includes(queryLower)) {
      return 1.0;
    } else if (content.split(' ').some(word => word.includes(queryLower))) {
      return 0.7;
    } else if (Object.values(item.metadata).some(value => 
      typeof value === 'string' && value.toLowerCase().includes(queryLower)
    )) {
      return 0.5;
    } else {
      return 0.0;
    }
  }
}