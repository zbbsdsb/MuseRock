import { Injectable } from '@nestjs/common';
import { PluginManifest, ValidationResult } from '../types/mcp.types';

@Injectable()
export class PluginValidator {
  private allowedPermissions = [
    'mcp:memory:read',
    'mcp:apprentice:create',
    'mcp:apprentice:read',
    'mcp:bio:read',
    'mcp:content:generate',
    'mcp:prompts:read',
    'mcp:prompts:write',
  ];

  validateManifest(manifest: PluginManifest): ValidationResult {
    const errors: string[] = [];

    if (!manifest.name) {
      errors.push('Name is required');
    }

    if (!manifest.version) {
      errors.push('Version is required');
    } else if (!this.isValidSemver(manifest.version)) {
      errors.push('Invalid version format (must be semver)');
    }

    if (!manifest.author) {
      errors.push('Author is required');
    }

    if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
      errors.push('Permissions must be an array');
    } else {
      for (const perm of manifest.permissions) {
        if (!this.allowedPermissions.includes(perm)) {
          errors.push(`Permission not allowed: ${perm}`);
        }
      }
    }

    if (manifest.icon && !this.isValidDataUrl(manifest.icon)) {
      errors.push('Invalid icon format (must be data URL)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidSemver(version: string): boolean {
    const semverRegex = /^v?\d+\.\d+\.\d+(-[\da-zA-Z-]+(\.[\da-zA-Z-]+)*)?(\+[\da-zA-Z-]+(\.[\da-zA-Z-]+)*)?$/;
    return semverRegex.test(version);
  }

  private isValidDataUrl(url: string): boolean {
    const dataUrlRegex = /^data:image\/(png|jpeg|jpg|gif|svg\+xml);base64,/;
    return dataUrlRegex.test(url);
  }
}