import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../auth/auth.service';
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
  constructor(private readonly authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.substring(7);
    
    try {
      const userData = await this.authService.validateToken(token);
      req.user = {
        id: userData.userId,
        permissions: userData.permissions || [],
        email: userData.email,
      };
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}