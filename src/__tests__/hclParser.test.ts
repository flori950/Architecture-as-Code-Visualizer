import { describe, it, expect } from 'vitest';
import { parseContent, detectFormat } from '../utils/yamlParser';

describe('HCL Parser', () => {
  describe('Terraform HCL parsing', () => {
    it('should parse basic Terraform HCL resources', () => {
      const terraformHCL = `
provider "aws" {
  region = "us-west-2"
}

resource "aws_instance" "web" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t2.micro"
  
  tags = {
    Name = "WebServer"
    Environment = "production"
  }
}

resource "aws_security_group" "web_sg" {
  name        = "web-security-group"
  description = "Security group for web server"
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

variable "instance_type" {
  description = "Type of instance to launch"
  type        = string
  default     = "t2.micro"
}
`;

      const result = parseContent(terraformHCL);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('terraform');

      const data = result.data?.data as Record<string, unknown>;

      // Check provider
      expect(data.provider).toBeDefined();
      expect((data.provider as Record<string, unknown>).aws).toBeDefined();

      // Check resources
      expect(data.resource).toBeDefined();
      expect(
        (data.resource as Record<string, unknown>).aws_instance
      ).toBeDefined();
      expect(
        (
          (data.resource as Record<string, unknown>).aws_instance as Record<
            string,
            unknown
          >
        ).web
      ).toBeDefined();
      expect(
        (data.resource as Record<string, unknown>).aws_security_group
      ).toBeDefined();
      expect(
        (
          (data.resource as Record<string, unknown>)
            .aws_security_group as Record<string, unknown>
        ).web_sg
      ).toBeDefined();

      // Check resource attributes
      const webInstance = (
        (data.resource as Record<string, unknown>).aws_instance as Record<
          string,
          unknown
        >
      ).web as Record<string, unknown>;
      expect(webInstance.ami).toBe('ami-0c02fb55956c7d316');
      expect(webInstance.instance_type).toBe('t2.micro');
      expect(webInstance.tags).toBeDefined();
      expect((webInstance.tags as Record<string, unknown>).Name).toBe(
        'WebServer'
      );

      // Check data sources
      expect(data.data).toBeDefined();
      expect(
        (data.data as Record<string, unknown>).aws_availability_zones
      ).toBeDefined();
      expect(
        (
          (data.data as Record<string, unknown>)
            .aws_availability_zones as Record<string, unknown>
        ).available
      ).toBeDefined();

      // Check variables
      expect(data.variable).toBeDefined();
      expect(
        (data.variable as Record<string, unknown>).instance_type
      ).toBeDefined();
    });

    it('should detect Terraform format correctly', () => {
      const terraformContent = `
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}
`;

      expect(detectFormat(terraformContent)).toBe('terraform');
    });

    it('should handle Terraform with complex nested blocks', () => {
      const complexTerraform = `
resource "aws_launch_configuration" "web" {
  name_prefix     = "web-"
  image_id        = var.ami_id
  instance_type   = var.instance_type
  security_groups = [aws_security_group.web.id]
  
  lifecycle {
    create_before_destroy = true
  }
  
  root_block_device {
    volume_type = "gp2"
    volume_size = 20
  }
}
`;

      const result = parseContent(complexTerraform);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('terraform');

      const data = result.data?.data as Record<string, unknown>;
      expect(
        (data.resource as Record<string, unknown>).aws_launch_configuration
      ).toBeDefined();
      expect(
        (
          (data.resource as Record<string, unknown>)
            .aws_launch_configuration as Record<string, unknown>
        ).web
      ).toBeDefined();
    });

    it('should handle empty or invalid Terraform content', () => {
      const invalidTerraform = `
resource "incomplete {
  this is not valid hcl
`;

      const result = parseContent(invalidTerraform);

      expect(result.success).toBe(true); // Should still parse as terraform format
      expect(result.data?.format).toBe('terraform');
    });
  });

  describe('Azure ARM template parsing', () => {
    it('should detect Azure ARM format correctly', () => {
      const azureARM = `
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.Compute/virtualMachines",
      "apiVersion": "2019-07-01",
      "name": "myVM"
    }
  ]
}
`;

      expect(detectFormat(azureARM)).toBe('azure-arm');
    });
  });

  describe('IBM Cloud template parsing', () => {
    it('should detect IBM Cloud format correctly', () => {
      const ibmCloud = `
{
  "terraform_version": "1.0",
  "platform": "ibm",
  "resources": [
    {
      "name": "vpc",
      "type": "ibm_is_vpc"
    }
  ]
}
`;

      const result = parseContent(ibmCloud);
      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('ibm-cloud');
    });
  });

  describe('Multi-document YAML parsing', () => {
    it('should handle Kubernetes multi-document YAML correctly', () => {
      const kubernetesMultiDoc = `
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx
  ports:
    - port: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nginx-ingress
spec:
  rules:
    - host: example.com
`;

      const result = parseContent(kubernetesMultiDoc);

      expect(result.success).toBe(true);
      expect(result.data?.format).toBe('kubernetes');
      expect(result.data?.multiDocument).toBe(true);
      expect(result.data?.documents).toHaveLength(3);

      // Check first document
      const firstDoc = result.data?.documents?.[0] as Record<string, unknown>;
      expect(firstDoc?.kind).toBe('Deployment');
      expect((firstDoc?.metadata as Record<string, unknown>)?.name).toBe(
        'nginx-deployment'
      );

      // Check second document
      const secondDoc = result.data?.documents?.[1] as Record<string, unknown>;
      expect(secondDoc?.kind).toBe('Service');
      expect((secondDoc?.metadata as Record<string, unknown>)?.name).toBe(
        'nginx-service'
      );

      // Check third document
      const thirdDoc = result.data?.documents?.[2] as Record<string, unknown>;
      expect(thirdDoc?.kind).toBe('Ingress');
      expect((thirdDoc?.metadata as Record<string, unknown>)?.name).toBe(
        'nginx-ingress'
      );
    });
  });

  describe('Error handling', () => {
    it('should handle malformed JSON gracefully', () => {
      const malformedJSON = `{
        "version": "3.8",
        "services": {
          "web": {
            "image": "nginx"
            // missing comma
            "ports": ["80:80"]
          }
        }
      }`;

      const result = parseContent(malformedJSON);
      // Should fail gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle empty content', () => {
      const result = parseContent('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to detect supported format');
    });

    it('should handle whitespace-only content', () => {
      const result = parseContent('   \n  \t  \n   ');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Unable to detect supported format');
    });
  });
});
