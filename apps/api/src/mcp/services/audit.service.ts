import { Injectable } from '@nestjs/common';
import { AuditEvent } from '../types/mcp.types';

@Injectable()
export class AuditService {
  private events: AuditEvent[] = [];

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
    };
    
    this.events.push(auditEvent);
    
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
  }

  async getEvents(options?: {
    userId?: string;
    method?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ events: AuditEvent[]; total: number }> {
    let filtered = this.events;
    
    if (options?.userId) {
      filtered = filtered.filter(e => e.userId === options.userId);
    }
    
    if (options?.method) {
      filtered = filtered.filter(e => e.method === options.method);
    }
    
    const total = filtered.length;
    const start = options?.offset || 0;
    const end = start + (options?.limit || 50);
    
    return {
      events: filtered.slice(start, end),
      total,
    };
  }

  private generateId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}