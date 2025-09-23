import { describe, it, expect } from 'vitest';
import { generateMermaidDiagram } from '../utils/mermaidGenerator';
import type { ParsedData } from '../types';

describe('mermaidGenerator', () => {
  describe('generateMermaidDiagram', () => {
    it('should generate Docker Compose diagram', () => {
      const parsedData: ParsedData = {
        format: 'docker-compose',
        originalContent: '',
        data: {
          version: '3.8',
          services: {
            web: {
              image: 'nginx:alpine',
              ports: ['80:80'],
              depends_on: ['api'],
            },
            api: {
              image: 'node:16',
              depends_on: ['database'],
            },
            database: {
              image: 'postgres:13',
            },
          },
        },
      };

      const result = generateMermaidDiagram(parsedData);

      expect(result.success).toBe(true);
      expect(result.mermaidCode).toContain('flowchart TD');
      expect(result.mermaidCode).toContain('web');
      expect(result.mermaidCode).toContain('api');
      expect(result.mermaidCode).toContain('database');
      expect(result.diagramType).toBe('flowchart');
    });

    it('should generate Kubernetes diagram', () => {
      const parsedData: ParsedData = {
        format: 'kubernetes',
        originalContent: '',
        data: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: {
            name: 'web-app',
            namespace: 'production',
          },
        },
      };

      const result = generateMermaidDiagram(parsedData);

      expect(result.success).toBe(true);
      expect(result.mermaidCode).toContain('graph TD');
      expect(result.mermaidCode).toContain('Deployment');
      expect(result.mermaidCode).toContain('web-app');
      expect(result.diagramType).toBe('graph');
    });

    it('should generate Terraform diagram', () => {
      const parsedData: ParsedData = {
        format: 'terraform',
        originalContent: '',
        data: {
          resource: {
            aws_instance: {
              web: {
                ami: 'ami-123456',
                instance_type: 't3.micro',
              },
            },
            aws_vpc: {
              main: {
                cidr_block: '10.0.0.0/16',
              },
            },
          },
        },
      };

      const result = generateMermaidDiagram(parsedData);

      expect(result.success).toBe(true);
      expect(result.mermaidCode).toContain('flowchart TD');
      expect(result.mermaidCode).toContain('aws_instance');
      expect(result.mermaidCode).toContain('aws_vpc');
      expect(result.diagramType).toBe('flowchart');
    });

    it('should handle unsupported format', () => {
      const parsedData: ParsedData = {
        format: 'unknown',
        originalContent: '',
        data: {},
      };

      const result = generateMermaidDiagram(parsedData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    it('should handle errors gracefully', () => {
      const parsedData: ParsedData = {
        // Using type assertion to test invalid format handling
        format: 'invalid-format' as ParsedData['format'],
        originalContent: '',
        data: {},
      };

      const result = generateMermaidDiagram(parsedData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });
  });
});
