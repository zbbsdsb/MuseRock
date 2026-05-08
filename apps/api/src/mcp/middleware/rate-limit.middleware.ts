import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

const RATE_LIMIT_CONFIG: Record<string, { limit: number; windowMs: number }> = {
  search_memory: { limit: 100, windowMs: 60000 },
  create_apprentice_job: { limit: 10, windowMs: 60000 },
  fetch_bio_asset: { limit: 50, windowMs: 60000 },
  generate_content: { limit: 20, windowMs: 60000 },
  manage_prompts: { limit: 50, windowMs: 60000 },
};

interface RateLimitState {
  count: number;
  windowStart: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private rateLimits = new Map<string, RateLimitState>();

  use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id || req.ip;
    const body = req.body as { method?: string };
    const method = body.method;

    if (!method) {
      next();
      return;
    }

    const config = RATE_LIMIT_CONFIG[method] || { limit: 100, windowMs: 60000 };
    const key = `${userId}:${method}`;
    const now = Date.now();

    let state = this.rateLimits.get(key);
    
    if (!state || now - state.windowStart > config.windowMs) {
      state = { count: 1, windowStart: now };
      this.rateLimits.set(key, state);
    } else if (state.count >= config.limit) {
      const resetTime = state.windowStart + config.windowMs;
      res.setHeader('X-RateLimit-Limit', config.limit);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.floor(resetTime / 1000));
      
      throw new HttpException(
        'Rate limit exceeded',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      state.count++;
    }

    res.setHeader('X-RateLimit-Limit', config.limit);
    res.setHeader('X-RateLimit-Remaining', config.limit - state.count);
    res.setHeader('X-RateLimit-Reset', Math.floor((state.windowStart + config.windowMs) / 1000));

    next();
  }
}