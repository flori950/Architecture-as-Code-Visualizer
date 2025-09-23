import * as yaml from 'js-yaml';
import type { ParsedData, ParseResult, ValidationError } from '../types';

// Format detection patterns
const FORMAT_PATTERNS = {
  'docker-compose': {
    required: ['version', 'services'],
    optional: ['networks', 'volumes'],
    keywords: ['image', 'build', 'ports', 'depends_on'],
  },
  kubernetes: {
    required: ['apiVersion', 'kind'],
    optional: ['metadata', 'spec'],
    keywords: ['Deployment', 'Service', 'Pod', 'ConfigMap', 'Secret'],
  },
  cloudformation: {
    required: ['Resources'],
    optional: ['AWSTemplateFormatVersion', 'Parameters', 'Outputs'],
    keywords: ['Type', 'Properties', 'Ref', 'GetAtt'],
  },
  terraform: {
    required: [],
    optional: ['terraform', 'provider', 'resource', 'data', 'variable'],
    keywords: ['resource', 'data', 'variable', 'output', 'locals'],
  },
  'azure-arm': {
    required: ['$schema', 'contentVersion', 'resources'],
    optional: ['parameters', 'variables', 'outputs'],
    keywords: ['Microsoft.', 'dependsOn', 'copy'],
  },
  'ibm-cloud': {
    required: [],
    optional: ['terraform', 'resource', 'data'],
    keywords: ['ibm_', 'ibmcloud_', 'provider'],
  },
};

export const detectFormat = (content: string): ParsedData['format'] => {
  try {
    // Check for Terraform HCL syntax first (before trying to parse as YAML/JSON)
    if (
      content.includes('terraform {') ||
      content.includes('provider "') ||
      content.includes('resource "') ||
      content.includes('data "') ||
      /terraform\s*\{/.test(content) ||
      /resource\s+"[^"]+"\s+"[^"]+"\s*\{/.test(content)
    ) {
      return 'terraform';
    }

    // Try to parse as JSON first
    let parsed: unknown;
    let isJson = false;

    try {
      parsed = JSON.parse(content);
      isJson = true;
    } catch {
      // Try YAML parsing - handle multi-document YAML
      try {
        if (content.includes('---')) {
          const yamlDocs = yaml.loadAll(content);
          const validDocs = yamlDocs.filter(
            doc => doc !== null && doc !== undefined
          );
          if (validDocs.length > 0) {
            parsed = validDocs[0]; // Use first document for format detection
          } else {
            return 'unknown';
          }
        } else {
          parsed = yaml.load(content);
        }
      } catch {
        return 'unknown';
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      return 'unknown';
    }

    const data = parsed as Record<string, unknown>;

    // Check for Azure ARM Template
    if (
      isJson &&
      data.$schema &&
      typeof data.$schema === 'string' &&
      data.$schema.includes('deploymentTemplate.json')
    ) {
      return 'azure-arm';
    }

    // Check for CloudFormation
    if (data.AWSTemplateFormatVersion || data.Resources) {
      return 'cloudformation';
    }

    // Check for Kubernetes
    if (data.apiVersion && data.kind) {
      return 'kubernetes';
    }

    // Check for Docker Compose
    if (data.version && data.services) {
      return 'docker-compose';
    }

    // Check for Terraform (YAML/JSON format)
    if (data.terraform || data.provider || data.resource) {
      return 'terraform';
    }

    // Check for IBM Cloud patterns
    const contentStr = JSON.stringify(data).toLowerCase();
    if (contentStr.includes('ibm_') || contentStr.includes('ibmcloud_')) {
      return 'ibm-cloud';
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
};

// Parse HCL (HashiCorp Configuration Language) to JSON-like structure
const parseHCLToJSON = (hclContent: string): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  // Extract providers
  const providerMatches = hclContent.match(
    /provider\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  );
  if (providerMatches) {
    result.provider = {};
    providerMatches.forEach(match => {
      const providerMatch = match.match(/provider\s+"([^"]+)"/);
      if (providerMatch) {
        const providerName = providerMatch[1];
        (result.provider as Record<string, unknown>)[providerName] = {
          name: providerName,
        };
      }
    });
  }

  // Extract resources
  const resourceMatches = hclContent.match(
    /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  );
  if (resourceMatches) {
    result.resource = {};
    resourceMatches.forEach(match => {
      const resourceMatch = match.match(
        /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/
      );
      if (resourceMatch) {
        const resourceType = resourceMatch[1];
        const resourceName = resourceMatch[2];
        const resourceBody = resourceMatch[3];

        if (!(result.resource as Record<string, unknown>)[resourceType]) {
          (result.resource as Record<string, unknown>)[resourceType] = {};
        }

        // Parse basic attributes
        const attributes: Record<string, unknown> = {};

        // Extract simple key-value pairs
        const attributeMatches = resourceBody.match(
          /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"/gm
        );
        if (attributeMatches) {
          attributeMatches.forEach(attrMatch => {
            const attrParts = attrMatch.match(
              /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"/
            );
            if (attrParts) {
              attributes[attrParts[1]] = attrParts[2];
            }
          });
        }

        // Extract references to other resources
        const referenceMatches = resourceBody.match(
          /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_.]*)/gm
        );
        if (referenceMatches) {
          referenceMatches.forEach(refMatch => {
            const refParts = refMatch.match(
              /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_.]*)/
            );
            if (refParts && refParts[2].includes('.')) {
              attributes[refParts[1]] = refParts[2];
            }
          });
        }

        // Extract tags blocks
        const tagsMatch = resourceBody.match(/tags\s*=\s*\{([^}]*)\}/);
        if (tagsMatch) {
          const tagsContent = tagsMatch[1];
          const tagMatches = tagsContent.match(
            /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"/g
          );
          if (tagMatches) {
            attributes.tags = {};
            tagMatches.forEach(tagMatch => {
              const tagParts = tagMatch.match(
                /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"([^"]*)"/
              );
              if (tagParts) {
                (attributes.tags as Record<string, unknown>)[tagParts[1]] =
                  tagParts[2];
              }
            });
          }
        }

        (
          (result.resource as Record<string, unknown>)[resourceType] as Record<
            string,
            unknown
          >
        )[resourceName] = attributes;
      }
    });
  }

  // Extract data sources
  const dataMatches = hclContent.match(
    /data\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  );
  if (dataMatches) {
    result.data = {};
    dataMatches.forEach(match => {
      const dataMatch = match.match(/data\s+"([^"]+)"\s+"([^"]+)"/);
      if (dataMatch) {
        const dataType = dataMatch[1];
        const dataName = dataMatch[2];

        if (!(result.data as Record<string, unknown>)[dataType]) {
          (result.data as Record<string, unknown>)[dataType] = {};
        }
        (
          (result.data as Record<string, unknown>)[dataType] as Record<
            string,
            unknown
          >
        )[dataName] = {
          name: dataName,
        };
      }
    });
  }

  // Extract variables
  const variableMatches = hclContent.match(
    /variable\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  );
  if (variableMatches) {
    result.variable = {};
    variableMatches.forEach(match => {
      const variableMatch = match.match(/variable\s+"([^"]+)"/);
      if (variableMatch) {
        const variableName = variableMatch[1];
        (result.variable as Record<string, unknown>)[variableName] = {
          name: variableName,
        };
      }
    });
  }

  return result;
};

export const parseContent = (content: string): ParseResult => {
  const validationErrors: ValidationError[] = [];

  try {
    // Detect format
    const format = detectFormat(content);

    if (format === 'unknown') {
      return {
        success: false,
        error:
          'Unable to detect supported format. Please check if your file is valid YAML/JSON and contains supported infrastructure configuration.',
      };
    }

    // Parse content based on format
    let parsed: unknown;
    let isMultiDocument = false;
    let documents: unknown[] = [];

    try {
      // Special handling for Terraform HCL format
      if (
        format === 'terraform' &&
        !content.trim().startsWith('{') &&
        !content.trim().startsWith('terraform:')
      ) {
        // This is HCL format, parse it into a structure similar to Terraform JSON
        parsed = parseHCLToJSON(content);
      } else {
        // Check if it's multi-document YAML (common with Kubernetes)
        if (content.includes('---')) {
          const yamlDocs = yaml.loadAll(content);
          const validDocs = yamlDocs.filter(
            doc => doc !== null && doc !== undefined
          );
          if (validDocs.length > 1) {
            isMultiDocument = true;
            documents = validDocs;
            parsed = validDocs[0]; // Use first document as primary
          } else {
            parsed = validDocs[0] || yaml.load(content);
          }
        } else {
          // Try JSON first, then YAML
          try {
            parsed = JSON.parse(content);
          } catch {
            parsed = yaml.load(content);
          }
        }
      }
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        error: `Failed to parse content: ${err.message}`,
        validationErrors: [
          {
            message: err.message,
            type: 'error',
          },
        ],
      };
    }

    // Validate parsed content
    const validation = validateContent(parsed, format);
    validationErrors.push(...validation.errors);

    if (
      !validation.isValid &&
      validation.errors.some(e => e.type === 'error')
    ) {
      return {
        success: false,
        error: 'Validation failed. Please check the errors below.',
        validationErrors,
      };
    }

    const result: ParsedData = {
      format,
      data: parsed as Record<string, unknown>,
      originalContent: content,
      ...(isMultiDocument && {
        multiDocument: true,
        documents: documents as Record<string, unknown>[],
      }),
    };

    return {
      success: true,
      data: result,
      ...(validationErrors.length > 0 && { validationErrors }),
    };
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: `Unexpected error: ${err.message}`,
    };
  }
};

const validateContent = (data: unknown, format: ParsedData['format']) => {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    errors.push({
      message: 'Invalid data structure',
      type: 'error',
    });
    return { isValid: false, errors };
  }

  if (format === 'unknown') {
    errors.push({
      message: 'Unknown or unsupported format',
      type: 'error',
    });
    return { isValid: false, errors };
  }

  const obj = data as Record<string, unknown>;
  const pattern = FORMAT_PATTERNS[format];

  if (!pattern) {
    return { isValid: true, errors };
  }

  // Check required fields
  for (const required of pattern.required) {
    if (!(required in obj)) {
      errors.push({
        message: `Missing required field: ${required}`,
        type: 'error',
      });
    }
  }

  // Additional format-specific validation
  switch (format) {
    case 'docker-compose':
      validateDockerCompose(obj, errors);
      break;
    case 'kubernetes':
      validateKubernetes(obj, errors);
      break;
    case 'cloudformation':
      validateCloudFormation(obj, errors);
      break;
    case 'terraform':
      validateTerraform(obj, errors);
      break;
  }

  return {
    isValid: errors.filter(e => e.type === 'error').length === 0,
    errors,
  };
};

const validateDockerCompose = (
  data: Record<string, unknown>,
  errors: ValidationError[]
) => {
  if (data.services && typeof data.services === 'object') {
    const services = data.services as Record<string, unknown>;
    for (const [serviceName, serviceConfig] of Object.entries(services)) {
      if (!serviceConfig || typeof serviceConfig !== 'object') {
        errors.push({
          message: `Invalid service configuration for: ${serviceName}`,
          type: 'error',
        });
        continue;
      }

      const service = serviceConfig as Record<string, unknown>;
      if (!service.image && !service.build) {
        errors.push({
          message: `Service '${serviceName}' must have either 'image' or 'build' specified`,
          type: 'warning',
        });
      }
    }
  }
};

const validateKubernetes = (
  data: Record<string, unknown>,
  errors: ValidationError[]
) => {
  const { apiVersion, kind, metadata } = data;

  if (typeof apiVersion !== 'string') {
    errors.push({
      message: 'apiVersion must be a string',
      type: 'error',
    });
  }

  if (typeof kind !== 'string') {
    errors.push({
      message: 'kind must be a string',
      type: 'error',
    });
  }

  if (metadata && typeof metadata === 'object') {
    const meta = metadata as Record<string, unknown>;
    if (!meta.name) {
      errors.push({
        message: 'metadata.name is required',
        type: 'warning',
      });
    }
  }
};

const validateCloudFormation = (
  data: Record<string, unknown>,
  errors: ValidationError[]
) => {
  if (data.Resources && typeof data.Resources === 'object') {
    const resources = data.Resources as Record<string, unknown>;
    for (const [resourceName, resourceConfig] of Object.entries(resources)) {
      if (!resourceConfig || typeof resourceConfig !== 'object') {
        errors.push({
          message: `Invalid resource configuration for: ${resourceName}`,
          type: 'error',
        });
        continue;
      }

      const resource = resourceConfig as Record<string, unknown>;
      if (!resource.Type) {
        errors.push({
          message: `Resource '${resourceName}' is missing Type property`,
          type: 'error',
        });
      }
    }
  }
};

const validateTerraform = (
  data: Record<string, unknown>,
  errors: ValidationError[]
) => {
  // Terraform validation - this is more complex as it can have various structures
  const hasResources = data.resource && typeof data.resource === 'object';
  const hasData = data.data && typeof data.data === 'object';
  const hasModule = data.module && typeof data.module === 'object';

  if (!hasResources && !hasData && !hasModule) {
    errors.push({
      message:
        'Terraform configuration should contain at least one resource, data source, or module',
      type: 'warning',
    });
  }
};

export const handleCloudFormationIntrinsics = (obj: unknown): unknown => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(handleCloudFormationIntrinsics);
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Handle CloudFormation intrinsic functions
    if (key.startsWith('!')) {
      const intrinsicKey = key.substring(1);
      result[`Fn::${intrinsicKey}`] = handleCloudFormationIntrinsics(value);
    } else {
      result[key] = handleCloudFormationIntrinsics(value);
    }
  }
  return result;
};
