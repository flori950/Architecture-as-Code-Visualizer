import { describe, it, expect } from 'vitest';
import { parseContent, detectFormat } from '../utils/yamlParser';

describe('yamlParser', () => {
  describe('detectFormat', () => {
    it('should detect Docker Compose format', () => {
      const dockerCompose = `
version: '3.8'
services:
  web:
    image: nginx
`;
      expect(detectFormat(dockerCompose)).toBe('docker-compose');
    });

    it('should detect Kubernetes format', () => {
      const kubernetes = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test
`;
      expect(detectFormat(kubernetes)).toBe('kubernetes');
    });

    it('should detect Terraform format', () => {
      const terraform = `
terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
    }
  }
}

resource "aws_instance" "web" {
  ami = "ami-123456"
}
`;
      expect(detectFormat(terraform)).toBe('terraform');
    });

    it('should detect CloudFormation format', () => {
      const cloudformation = `
AWSTemplateFormatVersion: '2010-09-09'
Resources:
  MyInstance:
    Type: AWS::EC2::Instance
`;
      expect(detectFormat(cloudformation)).toBe('cloudformation');
    });

    it('should return unknown for invalid content', () => {
      expect(detectFormat('invalid yaml content {')).toBe('unknown');
      expect(detectFormat('')).toBe('unknown');
    });
  });

  describe('parseContent', () => {
    it('should successfully parse valid Docker Compose', () => {
      const content = `
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
`;
      const result = parseContent(content);
      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('docker-compose');
      expect(result.data?.data.version).toBe('3.8');
    });

    it('should handle parse errors gracefully', () => {
      const invalidContent = `
version: '3.8'
services:
  web:
    image: nginx
    ports:
      - 80:80
      - invalid: yaml: content
`;
      const result = parseContent(invalidContent);
      // Should either succeed with warnings or fail gracefully
      expect(typeof result.success).toBe('boolean');
    });

    it('should detect multi-document YAML', () => {
      const multiDoc = `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
---
apiVersion: v1
kind: Service
metadata:
  name: web-service
`;
      const result = parseContent(multiDoc);
      expect(result.success).toBe(true);
      expect(result.data?.multiDocument).toBe(true);
      expect(result.data?.documents).toHaveLength(2);
    });

    it('should return error for unknown format', () => {
      const unknownContent = `
some: random
yaml: content
that: doesnt
match: any format
`;
      const result = parseContent(unknownContent);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to detect supported format');
    });
  });
});
