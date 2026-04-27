import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  metadata?: Record<string, any>;
}

interface Metric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

interface Trace {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  spans: TraceSpan[];
  metadata?: Record<string, any>;
}

interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  parentId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class ObservabilityService {
  private readonly logger = new Logger('ObservabilityService');
  private readonly metrics: Metric[] = [];
  private readonly traces: Map<string, Trace> = new Map();

  // Logging methods
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
    };
    this.logger.log(JSON.stringify(logEntry));
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata,
    };
    this.logger.warn(JSON.stringify(logEntry));
  }

  error(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      metadata,
    };
    this.logger.error(JSON.stringify(logEntry));
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
      metadata,
    };
    this.logger.debug(JSON.stringify(logEntry));
  }

  // Metrics methods
  incrementCounter(name: string, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value: 1,
      labels,
      timestamp: Date.now(),
    });
  }

  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  // Tracing methods
  startTrace(name: string, metadata?: Record<string, any>): string {
    const traceId = this.generateId();
    const trace: Trace = {
      id: traceId,
      name,
      startTime: Date.now(),
      spans: [],
      metadata,
    };
    this.traces.set(traceId, trace);
    return traceId;
  }

  endTrace(traceId: string): void {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.endTime = Date.now();
      trace.duration = trace.endTime - trace.startTime;
      this.traces.set(traceId, trace);
      // In a real implementation, this would send the trace to a tracing system
      this.info(`Trace completed: ${trace.name} (${trace.duration}ms)`, 'Tracing');
    }
  }

  startSpan(traceId: string, name: string, parentId?: string): string {
    const trace = this.traces.get(traceId);
    if (trace) {
      const spanId = this.generateId();
      const span: TraceSpan = {
        id: spanId,
        name,
        startTime: Date.now(),
        parentId,
      };
      trace.spans.push(span);
      this.traces.set(traceId, trace);
      return spanId;
    }
    return '';
  }

  endSpan(traceId: string, spanId: string): void {
    const trace = this.traces.get(traceId);
    if (trace) {
      const span = trace.spans.find(s => s.id === spanId);
      if (span) {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        this.traces.set(traceId, trace);
      }
    }
  }

  // Getters for testing and debugging
  getMetrics(): Metric[] {
    return this.metrics;
  }

  getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Express middleware for request logging and tracing
export class ObservabilityMiddleware implements NestMiddleware {
  constructor(private readonly observabilityService: ObservabilityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const traceId = this.observabilityService.startTrace(`HTTP ${req.method} ${req.path}`);
    const startTime = Date.now();

    // Add trace ID to response headers
    res.setHeader('X-Trace-ID', traceId);

    // Log request start
    this.observabilityService.info(`Request started: ${req.method} ${req.path}`, 'HTTP');

    // Track request duration
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.observabilityService.endTrace(traceId);
      this.observabilityService.info(
        `Request completed: ${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
        'HTTP',
      );
      this.observabilityService.recordHistogram('http_request_duration_ms', duration, {
        method: req.method,
        path: req.path,
        status: res.statusCode.toString(),
      });
      this.observabilityService.incrementCounter('http_requests_total', {
        method: req.method,
        path: req.path,
        status: res.statusCode.toString(),
      });
    });

    next();
  }
}