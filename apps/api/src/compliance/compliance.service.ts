import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { MemoryService } from '../memory/memory.service';

interface ComplianceCheck {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pass' | 'fail' | 'warning';
  details?: any;
  timestamp: number;
}

interface SanitizationResult {
  sanitized: string;
  removed: string[];
  severity: 'low' | 'medium' | 'high';
}

interface OpenSourceDependency {
  name: string;
  version: string;
  license: string;
  url: string;
  isDeprecated: boolean;
  hasSecurityVulnerabilities: boolean;
  vulnerabilityCount: number;
}

@Injectable()
export class ComplianceService {
  constructor(private readonly memoryService: MemoryService) {}

  async runComplianceChecks(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];

    // Run OWASP Top 10 checks
    const owaspChecks = await this.runOwaspTop10Checks();
    checks.push(...owaspChecks);

    // Run data privacy checks
    const privacyChecks = await this.runDataPrivacyChecks();
    checks.push(...privacyChecks);

    // Run open source governance checks
    const osChecks = await this.runOpenSourceGovernanceChecks();
    checks.push(...osChecks);

    return checks;
  }

  async sanitizeData(data: string, sensitivity: 'public' | 'restricted' | 'private'): Promise<SanitizationResult> {
    let sanitized = data;
    const removed: string[] = [];

    // Remove personal identifiable information (PII)
    const piiPatterns = [
      { regex: /\b\d{3}-\d{2}-\d{4}\b/g, name: 'SSN' },
      { regex: /\b\d{10,16}\b/g, name: 'Phone number' },
      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, name: 'Email' },
      { regex: /\b\d{16}\b/g, name: 'Credit card number' },
    ];

    for (const pattern of piiPatterns) {
      const matches = sanitized.match(pattern.regex);
      if (matches) {
        removed.push(...matches.map(match => `${pattern.name}: ${match}`));
        sanitized = sanitized.replace(pattern.regex, '[REDACTED]');
      }
    }

    // Remove sensitive data based on sensitivity level
    if (sensitivity === 'private') {
      // Remove all potentially sensitive data
      const sensitivePatterns = [
        { regex: /\bpassword\s*[:=]\s*[^\s]+\b/gi, name: 'Password' },
        { regex: /\bapi[_-]?key\s*[:=]\s*[^\s]+\b/gi, name: 'API Key' },
        { regex: /\btoken\s*[:=]\s*[^\s]+\b/gi, name: 'Token' },
      ];

      for (const pattern of sensitivePatterns) {
        const matches = sanitized.match(pattern.regex);
        if (matches) {
          removed.push(...matches.map(match => `${pattern.name}: ${match}`));
          sanitized = sanitized.replace(pattern.regex, '[REDACTED]');
        }
      }
    }

    // Determine severity based on removed data
    let severity: 'low' | 'medium' | 'high' = 'low';
    if (removed.length > 5) {
      severity = 'high';
    } else if (removed.length > 0) {
      severity = 'medium';
    }

    return {
      sanitized,
      removed,
      severity,
    };
  }

  async getOpenSourceDependencies(): Promise<OpenSourceDependency[]> {
    // In a real implementation, this would scan package.json and node_modules
    // For now, we'll simulate a response
    return [
      {
        name: 'nestjs',
        version: '10.0.0',
        license: 'MIT',
        url: 'https://github.com/nestjs/nest',
        isDeprecated: false,
        hasSecurityVulnerabilities: false,
        vulnerabilityCount: 0,
      },
      {
        name: 'express',
        version: '4.18.2',
        license: 'MIT',
        url: 'https://github.com/expressjs/express',
        isDeprecated: false,
        hasSecurityVulnerabilities: false,
        vulnerabilityCount: 0,
      },
      {
        name: 'axios',
        version: '1.6.0',
        license: 'MIT',
        url: 'https://github.com/axios/axios',
        isDeprecated: false,
        hasSecurityVulnerabilities: false,
        vulnerabilityCount: 0,
      },
    ];
  }

  async generateComplianceReport(): Promise<any> {
    const checks = await this.runComplianceChecks();
    const dependencies = await this.getOpenSourceDependencies();
    const riskScore = this.calculateRiskScore(checks);

    return {
      timestamp: new Date().toISOString(),
      riskScore,
      checks,
      dependencies,
      summary: {
        totalChecks: checks.length,
        passedChecks: checks.filter(c => c.status === 'pass').length,
        failedChecks: checks.filter(c => c.status === 'fail').length,
        warningChecks: checks.filter(c => c.status === 'warning').length,
        vulnerableDependencies: dependencies.filter(d => d.hasSecurityVulnerabilities).length,
      },
    };
  }

  private async runOwaspTop10Checks(): Promise<ComplianceCheck[]> {
    // Simulate OWASP Top 10 checks
    return [
      {
        id: 'owasp-1',
        name: 'Injection',
        description: 'Check for SQL, NoSQL, OS, and LDAP injection vulnerabilities',
        severity: 'high',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'owasp-2',
        name: 'Broken Authentication',
        description: 'Check for broken authentication mechanisms',
        severity: 'high',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'owasp-3',
        name: 'Sensitive Data Exposure',
        description: 'Check for exposure of sensitive data',
        severity: 'high',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'owasp-4',
        name: 'XML External Entities (XXE)',
        description: 'Check for XXE vulnerabilities',
        severity: 'medium',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'owasp-5',
        name: 'Broken Access Control',
        description: 'Check for broken access control mechanisms',
        severity: 'high',
        status: 'pass',
        timestamp: Date.now(),
      },
    ];
  }

  private async runDataPrivacyChecks(): Promise<ComplianceCheck[]> {
    // Simulate data privacy checks
    return [
      {
        id: 'privacy-1',
        name: 'Data Minimization',
        description: 'Check if only necessary data is collected',
        severity: 'medium',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'privacy-2',
        name: 'Data Retention',
        description: 'Check if data is retained only for necessary period',
        severity: 'medium',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'privacy-3',
        name: 'Consent Management',
        description: 'Check if user consent is properly managed',
        severity: 'medium',
        status: 'pass',
        timestamp: Date.now(),
      },
    ];
  }

  private async runOpenSourceGovernanceChecks(): Promise<ComplianceCheck[]> {
    // Simulate open source governance checks
    return [
      {
        id: 'os-1',
        name: 'License Compliance',
        description: 'Check if all dependencies have compatible licenses',
        severity: 'medium',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'os-2',
        name: 'Security Vulnerabilities',
        description: 'Check for known security vulnerabilities in dependencies',
        severity: 'high',
        status: 'pass',
        timestamp: Date.now(),
      },
      {
        id: 'os-3',
        name: 'Deprecated Dependencies',
        description: 'Check for deprecated dependencies',
        severity: 'low',
        status: 'pass',
        timestamp: Date.now(),
      },
    ];
  }

  private calculateRiskScore(checks: ComplianceCheck[]): number {
    let score = 0;
    const totalChecks = checks.length;

    for (const check of checks) {
      let weight = 1;
      if (check.severity === 'high') {
        weight = 3;
      } else if (check.severity === 'medium') {
        weight = 2;
      }

      if (check.status === 'fail') {
        score += weight;
      } else if (check.status === 'warning') {
        score += weight * 0.5;
      }
    }

    // Calculate percentage score (higher is better)
    const maxScore = checks.reduce((sum, check) => {
      const weight = check.severity === 'high' ? 3 : check.severity === 'medium' ? 2 : 1;
      return sum + weight;
    }, 0);

    if (maxScore === 0) return 100;
    return Math.round((1 - score / maxScore) * 100);
  }
}