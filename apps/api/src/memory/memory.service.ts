import { Injectable, Inject } from '@nestjs/common';
import { WorkingMemory } from './layers/working.memory';
import { EpisodicMemory } from './layers/episodic.memory';
import { ContextualMemory } from './layers/contextual.memory';
import { KnowledgeMemory } from './layers/knowledge.memory';
import { ComplianceMemory } from './layers/compliance.memory';

interface MemoryItem {
  id: string;
  content: string;
  metadata: Record<string, any>;
  timestamp: number;
  sensitivity: 'public' | 'restricted' | 'private';
}

interface SearchResult {
  item: MemoryItem;
  score: number;
  layer: string;
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

  async storeMemory(item: Omit<MemoryItem, 'id' | 'timestamp'>): Promise<MemoryItem> {
    // Validate sensitivity level
    const validatedItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // Store in appropriate memory layer based on content and metadata
    if (validatedItem.sensitivity === 'private') {
      return this.complianceMemory.store(validatedItem);
    } else if (validatedItem.metadata.type === 'episodic') {
      return this.episodicMemory.store(validatedItem);
    } else if (validatedItem.metadata.type === 'contextual') {
      return this.contextualMemory.store(validatedItem);
    } else if (validatedItem.metadata.type === 'knowledge') {
      return this.knowledgeMemory.store(validatedItem);
    } else {
      return this.workingMemory.store(validatedItem);
    }
  }

  async searchMemory(query: string, options?: {
    sensitivity?: ('public' | 'restricted' | 'private')[];
    layers?: string[];
    limit?: number;
  }): Promise<SearchResult[]> {
    const limit = options?.limit || 10;

    // Create array of search promises
    const searchPromises = [];

    if (!options?.layers || options.layers.includes('working')) {
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

    if (!options?.layers || options.layers.includes('episodic')) {
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

    if (!options?.layers || options.layers.includes('contextual')) {
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

    if (!options?.layers || options.layers.includes('knowledge')) {
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

    if (!options?.layers || options.layers.includes('compliance')) {
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
      if (!options?.sensitivity) return true;
      return options.sensitivity.includes(result.item.sensitivity);
    });

    // Sort by score and limit
    return filteredResults
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
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
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
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