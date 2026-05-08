import { Injectable, Logger, NestMiddleware, OnModuleInit } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Counter, Histogram, Gauge, register, CollectorRegistry } from 'prom-client';

@Injectable()
export class ObservabilityService implements OnModuleInit {
  private readonly logger = new Logger('ObservabilityService');

  // Prometheus metrics
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDurationSeconds: Histogram<string>;
  private readonly mcpRequestsTotal: Counter<string>;
  private readonly mcpRequestDurationSeconds: Histogram<string>;
  private readonly mcpErrorsTotal: Counter<string>;
  private readonly memorySearchResultsTotal: Counter<string>;
  private readonly memorySearchDurationSeconds: Histogram<string>;
  private readonly aiTokensUsedTotal: Counter<string>;
  private readonly apprenticeJobsTotal: Counter<string>;
  private readonly apprenticeJobDurationSeconds: Histogram<string>;
  private readonly activeConnections: Gauge<string>;
  private readonly jobQueueLength: Gauge<string>;

  constructor() {
    // HTTP metrics
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'path', 'status'],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request latency',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // MCP metrics
    this.mcpRequestsTotal = new Counter({
      name: 'mcp_requests_total',
      help: 'Total MCP RPC requests',
      labelNames: ['method', 'status'],
    });

    this.mcpRequestDurationSeconds = new Histogram({
      name: 'mcp_request_duration_seconds',
      help: 'MCP request latency',
      labelNames: ['method', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.mcpErrorsTotal = new Counter({
      name: 'mcp_errors_total',
      help: 'Total MCP errors',
      labelNames: ['method', 'error_type'],
    });

    // Memory metrics
    this.memorySearchResultsTotal = new Counter({
      name: 'memory_search_results_total',
      help: 'Memory search results',
      labelNames: ['layer', 'sensitivity'],
    });

    this.memorySearchDurationSeconds = new Histogram({
      name: 'memory_search_duration_seconds',
      help: 'Memory search latency',
      labelNames: ['layer'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    // AI metrics
    this.aiTokensUsedTotal = new Counter({
      name: 'ai_tokens_used_total',
      help: 'AI token consumption',
      labelNames: ['provider', 'model'],
    });

    // Apprentice metrics
    this.apprenticeJobsTotal = new Counter({
      name: 'apprentice_jobs_total',
      help: 'Apprentice jobs created',
      labelNames: ['agent_type', 'status'],
    });

    this.apprenticeJobDurationSeconds = new Histogram({
      name: 'apprentice_job_duration_seconds',
      help: 'Job execution time',
      labelNames: ['agent_type'],
      buckets: [5, 10, 30, 60, 120],
    });

    // Gauge metrics
    this.activeConnections = new Gauge({
      name: 'active_connections',
      help: 'Active WebSocket connections',
    });

    this.jobQueueLength = new Gauge({
      name: 'job_queue_length',
      help: 'Pending jobs in queue',
    });
  }

  onModuleInit() {
    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDurationSeconds);
    register.registerMetric(this.mcpRequestsTotal);
    register.registerMetric(this.mcpRequestDurationSeconds);
    register.registerMetric(this.mcpErrorsTotal);
    register.registerMetric(this.memorySearchResultsTotal);
    register.registerMetric(this.memorySearchDurationSeconds);
    register.registerMetric(this.aiTokensUsedTotal);
    register.registerMetric(this.apprenticeJobsTotal);
    register.registerMetric(this.apprenticeJobDurationSeconds);
    register.registerMetric(this.activeConnections);
    register.registerMetric(this.jobQueueLength);

    this.logger.log('Prometheus metrics registered successfully');
  }

  // Logging methods
  info(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
      metadata,
    };
    this.logger.log(JSON.stringify(logEntry));
  }

  warn(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
      metadata,
    };
    this.logger.warn(JSON.stringify(logEntry));
  }

  error(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      metadata,
    };
    this.logger.error(JSON.stringify(logEntry));
  }

  debug(message: string, context?: string, metadata?: Record<string, any>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context,
      metadata,
    };
    this.logger.debug(JSON.stringify(logEntry));
  }

  // HTTP metrics
  recordHttpRequest(method: string, path: string, status: number, duration: number): void {
    this.httpRequestsTotal.inc({ method, path, status: status.toString() });
    this.httpRequestDurationSeconds.observe({ method, path, status: status.toString() }, duration / 1000);
  }

  // MCP metrics
  recordMcpRequest(method: string, status: string, duration: number): void {
    this.mcpRequestsTotal.inc({ method, status });
    this.mcpRequestDurationSeconds.observe({ method, status }, duration / 1000);
  }

  recordMcpError(method: string, errorType: string): void {
    this.mcpErrorsTotal.inc({ method, error_type: errorType });
  }

  // Memory metrics
  recordMemorySearch(layer: string, sensitivity: string, results: number, duration: number): void {
    this.memorySearchResultsTotal.inc({ layer, sensitivity }, results);
    this.memorySearchDurationSeconds.observe({ layer }, duration / 1000);
  }

  // AI metrics
  recordAiTokens(provider: string, model: string, tokens: number): void {
    this.aiTokensUsedTotal.inc({ provider, model }, tokens);
  }

  // Apprentice metrics
  recordApprenticeJob(agentType: string, status: string, duration?: number): void {
    this.apprenticeJobsTotal.inc({ agent_type: agentType, status });
    if (duration !== undefined) {
      this.apprenticeJobDurationSeconds.observe({ agent_type: agentType }, duration / 1000);
    }
  }

  // Gauge metrics
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  setJobQueueLength(length: number): void {
    this.jobQueueLength.set(length);
  }

  getRegistry(): CollectorRegistry {
    return register;
  }
}

export class ObservabilityMiddleware implements NestMiddleware {
  constructor(private readonly observabilityService: ObservabilityService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      this.observabilityService.recordHttpRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
      );
      this.observabilityService.info(
        `Request completed: ${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
        'HTTP',
      );
    });

    next();
  }
}