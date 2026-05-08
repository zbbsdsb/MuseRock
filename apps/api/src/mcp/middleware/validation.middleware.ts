import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import Ajv from 'ajv';
import { SCHEMAS } from '../schemas/rpc.schema';
import { JsonRpcRequest } from '../types/mcp.types';

const ajv = new Ajv({ strict: false });

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const body = req.body as JsonRpcRequest;

    if (!body.method) {
      throw new BadRequestException('Method is required');
    }

    const schema = SCHEMAS[body.method];
    
    if (!schema) {
      next();
      return;
    }

    const validate = ajv.compile(schema);
    const valid = validate(body.params || {});

    if (!valid) {
      const errors = validate.errors?.map(err => {
        const path = err.instancePath ? ` at ${err.instancePath}` : '';
        return `${err.message}${path}`;
      }).join('; ');
      
      throw new BadRequestException(`Invalid parameters: ${errors}`);
    }

    next();
  }
}