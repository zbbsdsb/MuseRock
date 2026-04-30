import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as vm from 'vm';

export interface ExecuteCodeParams {
  code: string;
  language?: 'javascript' | 'typescript';
  timeout?: number;
  memoryLimit?: number;
}

export interface ExecuteCodeResult {
  success: boolean;
  output?: any;
  error?: string;
  executionTime: number;
  memoryUsage?: number;
}

@Injectable()
export class CodeExecutionService {
  private readonly DEFAULT_TIMEOUT = 5000;
  private readonly MAX_TIMEOUT = 10000;
  private readonly DEFAULT_MEMORY_LIMIT = 128 * 1024 * 1024;

  async executeCode(params: ExecuteCodeParams): Promise<ExecuteCodeResult> {
    const {
      code,
      language = 'javascript',
      timeout = this.DEFAULT_TIMEOUT,
      memoryLimit = this.DEFAULT_MEMORY_LIMIT,
    } = params;

    if (language !== 'javascript' && language !== 'typescript') {
      throw new HttpException(
        'Unsupported language. Only javascript and typescript are supported.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (timeout > this.MAX_TIMEOUT) {
      throw new HttpException(
        `Timeout exceeds maximum allowed (${this.MAX_TIMEOUT}ms)`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const output = this.runInSandbox(code, timeout);
      const executionTime = Date.now() - startTime;
      const endMemory = process.memoryUsage().heapUsed;
      const memoryUsage = endMemory - startMemory;

      if (memoryUsage > memoryLimit) {
        throw new HttpException(
          'Memory limit exceeded',
          HttpStatus.PAYLOAD_TOO_LARGE,
        );
      }

      return {
        success: true,
        output,
        executionTime,
        memoryUsage,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      if (error instanceof HttpException) {
        throw error;
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Execution failed',
        executionTime,
      };
    }
  }

  private runInSandbox(code: string, timeout: number): any {
    const logs: any[] = [];
    const sandbox = {
      console: {
        log: (...args: any[]) => {
          logs.push({ type: 'log', content: args.map(this.serialize).join(' ') });
        },
        error: (...args: any[]) => {
          logs.push({ type: 'error', content: args.map(this.serialize).join(' ') });
        },
        warn: (...args: any[]) => {
          logs.push({ type: 'warn', content: args.map(this.serialize).join(' ') });
        },
        info: (...args: any[]) => {
          logs.push({ type: 'info', content: args.map(this.serialize).join(' ') });
        },
      },
      setTimeout: (fn: Function, ms: number) => {
        if (ms > timeout) ms = timeout;
        return setTimeout(() => fn(), ms);
      },
      setInterval: (fn: Function, ms: number) => {
        if (ms > timeout) ms = timeout;
        return setInterval(() => fn(), ms);
      },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      Map,
      Set,
      Promise,
      RegExp,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
    };

    try {
      const script = new vm.Script(code, {
        produceCachedData: false,
      });

      const context = vm.createContext(sandbox);
      const result = script.runInContext(context, {
        timeout,
        displayErrors: true,
      });

      const output = logs.length > 0 ? logs : result;

      return typeof output === 'undefined' ? null : output;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Script execution timed out')) {
          throw new HttpException(
            'Code execution timed out',
            HttpStatus.REQUEST_TIMEOUT,
          );
        }
        throw new HttpException(
          `Execution error: ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw error;
    }
  }

  private serialize(value: any): string {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'function') return value.toString();
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  getSupportedLanguages(): string[] {
    return ['javascript', 'typescript'];
  }

  getLimits(): { maxTimeout: number; defaultTimeout: number; maxMemoryLimit: number } {
    return {
      maxTimeout: this.MAX_TIMEOUT,
      defaultTimeout: this.DEFAULT_TIMEOUT,
      maxMemoryLimit: this.DEFAULT_MEMORY_LIMIT,
    };
  }
}
