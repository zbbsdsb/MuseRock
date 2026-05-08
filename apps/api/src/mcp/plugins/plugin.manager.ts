import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PluginManifest } from '../types/mcp.types';
import { PluginValidator } from './plugin.validator';

interface Plugin extends PluginManifest {
  id: string;
  enabled: boolean;
  installedAt: Date;
  lastUsedAt?: Date;
}

@Injectable()
export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();

  constructor(private readonly validator: PluginValidator) {}

  async install(manifest: PluginManifest): Promise<Plugin> {
    const validation = this.validator.validateManifest(manifest);
    
    if (!validation.valid) {
      throw new HttpException(
        `Invalid manifest: ${validation.errors.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this.plugins.has(manifest.name)) {
      throw new HttpException(
        `Plugin ${manifest.name} already installed`,
        HttpStatus.CONFLICT,
      );
    }

    const plugin: Plugin = {
      ...manifest,
      id: this.generateId(),
      enabled: true,
      installedAt: new Date(),
    };

    this.plugins.set(plugin.name, plugin);
    return plugin;
  }

  async uninstall(name: string): Promise<boolean> {
    return this.plugins.delete(name);
  }

  async get(name: string): Promise<Plugin | undefined> {
    return this.plugins.get(name);
  }

  async list(options?: { enabled?: boolean }): Promise<Plugin[]> {
    let plugins = Array.from(this.plugins.values());
    
    if (options?.enabled !== undefined) {
      plugins = plugins.filter(p => p.enabled === options.enabled);
    }
    
    return plugins;
  }

  async enable(name: string): Promise<Plugin | undefined> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = true;
    }
    return plugin;
  }

  async disable(name: string): Promise<Plugin | undefined> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.enabled = false;
    }
    return plugin;
  }

  async updateLastUsed(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (plugin) {
      plugin.lastUsedAt = new Date();
    }
  }

  private generateId(): string {
    return `plugin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}