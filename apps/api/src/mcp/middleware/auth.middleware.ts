import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { User } from '../types/mcp.types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = this.decodeToken(token);
      req.user = {
        id: decoded.sub || 'user',
        permissions: decoded.permissions || [],
        email: decoded.email,
      };
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      throw new Error('Invalid token');
    }
  }
}