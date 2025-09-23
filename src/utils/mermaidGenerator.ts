import type { ParsedData, MermaidGenerationResult } from '../types';

const sanitizeNodeId = (id: string): string => {
  return id
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/^[0-9]/, 'n$&')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const sanitizeLabel = (label: string): string => {
  return label.replace(/"/g, '&quot;').replace(/\n/g, '<br/>').trim();
};

export const generateMermaidDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  try {
    switch (parsedData.format) {
      case 'docker-compose':
        return generateDockerComposeDiagram(parsedData);
      case 'kubernetes':
        return generateKubernetesDiagram(parsedData);
      case 'terraform':
        return generateTerraformDiagram(parsedData);
      case 'cloudformation':
        return generateCloudFormationDiagram(parsedData);
      case 'azure-arm':
        return generateAzureARMDiagram(parsedData);
      case 'ibm-cloud':
        return generateIBMCloudDiagram(parsedData);
      default:
        return {
          success: false,
          error: `Unsupported format: ${parsedData.format}`,
          diagramType: 'flowchart',
        };
    }
  } catch (error) {
    const err = error as Error;
    return {
      success: false,
      error: `Failed to generate diagram: ${err.message}`,
      diagramType: 'flowchart',
    };
  }
};

const generateDockerComposeDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  const services = (data.services as Record<string, unknown>) || {};
  const networks = (data.networks as Record<string, unknown>) || {};
  const volumes = (data.volumes as Record<string, unknown>) || {};

  let mermaidCode = 'flowchart TD\n';

  // Add services
  Object.entries(services).forEach(([serviceName, serviceConfig]) => {
    const config = serviceConfig as Record<string, unknown>;
    const nodeId = sanitizeNodeId(serviceName);
    const image = (config.image as string) || 'custom';
    const label = sanitizeLabel(`${serviceName}<br/>📦 ${image}`);

    mermaidCode += `    ${nodeId}["${label}"]\n`;

    // Add dependencies
    if (config.depends_on) {
      const dependencies = Array.isArray(config.depends_on)
        ? config.depends_on
        : [config.depends_on];

      dependencies.forEach((dep: unknown) => {
        if (typeof dep === 'string') {
          const depNodeId = sanitizeNodeId(dep);
          mermaidCode += `    ${depNodeId} --> ${nodeId}\n`;
        }
      });
    }

    // Add port information
    if (config.ports) {
      const ports = Array.isArray(config.ports) ? config.ports : [config.ports];
      ports.forEach((port: unknown, index: number) => {
        if (typeof port === 'string' || typeof port === 'number') {
          const portNodeId = sanitizeNodeId(`${serviceName}_port_${index}`);
          const portLabel = sanitizeLabel(`🌐 Port ${port}`);
          mermaidCode += `    ${portNodeId}["${portLabel}"]\n`;
          mermaidCode += `    ${nodeId} --> ${portNodeId}\n`;
        }
      });
    }
  });

  // Add networks
  Object.keys(networks).forEach(networkName => {
    const networkNodeId = sanitizeNodeId(`network_${networkName}`);
    const networkLabel = sanitizeLabel(`🌐 ${networkName}`);
    mermaidCode += `    ${networkNodeId}["${networkLabel}"]\n`;

    // Connect services to networks
    Object.entries(services).forEach(([serviceName, serviceConfig]) => {
      const config = serviceConfig as Record<string, unknown>;
      if (config.networks) {
        const serviceNetworks = Array.isArray(config.networks)
          ? config.networks
          : Object.keys(config.networks as Record<string, unknown>);

        if (serviceNetworks.includes(networkName)) {
          const serviceNodeId = sanitizeNodeId(serviceName);
          mermaidCode += `    ${serviceNodeId} -.-> ${networkNodeId}\n`;
        }
      }
    });
  });

  // Add volumes
  Object.keys(volumes).forEach(volumeName => {
    const volumeNodeId = sanitizeNodeId(`volume_${volumeName}`);
    const volumeLabel = sanitizeLabel(`💾 ${volumeName}`);
    mermaidCode += `    ${volumeNodeId}["${volumeLabel}"]\n`;
  });

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

const generateKubernetesDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  let mermaidCode = 'graph TD\n';

  if (parsedData.multiDocument && parsedData.documents) {
    // Handle multi-document YAML
    parsedData.documents.forEach((doc, index) => {
      if (doc && typeof doc === 'object') {
        const k8sResource = doc as Record<string, unknown>;
        mermaidCode += addKubernetesResource(k8sResource, index, '');
      }
    });
  } else {
    // Single document
    const k8sResource = parsedData.data as Record<string, unknown>;
    mermaidCode += addKubernetesResource(k8sResource, 0, '');
  }

  return {
    success: true,
    mermaidCode,
    diagramType: 'graph',
  };
};

const addKubernetesResource = (
  resource: Record<string, unknown>,
  index: number,
  existingCode: string
): string => {
  const kind = resource.kind as string;
  const metadata = (resource.metadata as Record<string, unknown>) || {};
  const name = (metadata.name as string) || `resource_${index}`;

  const nodeId = sanitizeNodeId(`${kind}_${name}`);
  const label = sanitizeLabel(`${kind}<br/>📦 ${name}`);

  let code = existingCode;
  code += `    ${nodeId}["${label}"]\n`;

  // Add namespace if present
  if (metadata.namespace) {
    const nsNodeId = sanitizeNodeId(`ns_${metadata.namespace}`);
    const nsLabel = sanitizeLabel(`🏠 ${metadata.namespace}`);
    code += `    ${nsNodeId}["${nsLabel}"]\n`;
    code += `    ${nsNodeId} --> ${nodeId}\n`;
  }

  // Add specific relationships based on kind
  switch (kind) {
    case 'Deployment': {
      const deploymentNodeId = sanitizeNodeId(`deployment_${name}`);
      code += `    ${nodeId} --> ${deploymentNodeId}_pods["📦 Pods"]\n`;
      break;
    }
    case 'Service': {
      const serviceNodeId = sanitizeNodeId(`service_${name}`);
      code += `    ${serviceNodeId}_endpoints["🌐 Endpoints"] --> ${nodeId}\n`;
      break;
    }
  }

  return code;
};

const generateTerraformDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  let mermaidCode = 'flowchart TD\n';

  // Handle resources
  if (data.resource && typeof data.resource === 'object') {
    const resources = data.resource as Record<string, unknown>;
    Object.entries(resources).forEach(([resourceType, instances]) => {
      if (typeof instances === 'object' && instances) {
        Object.entries(instances as Record<string, unknown>).forEach(
          ([instanceName, config]) => {
            const nodeId = sanitizeNodeId(`${resourceType}_${instanceName}`);
            const label = sanitizeLabel(
              `${resourceType}<br/>🏗️ ${instanceName}`
            );
            mermaidCode += `    ${nodeId}["${label}"]\n`;

            // Add dependencies if present
            if (config && typeof config === 'object') {
              const resourceConfig = config as Record<string, unknown>;
              if (resourceConfig.depends_on) {
                const dependencies = Array.isArray(resourceConfig.depends_on)
                  ? resourceConfig.depends_on
                  : [resourceConfig.depends_on];

                dependencies.forEach((dep: unknown) => {
                  if (typeof dep === 'string') {
                    const depNodeId = sanitizeNodeId(dep.replace(/\./g, '_'));
                    mermaidCode += `    ${depNodeId} --> ${nodeId}\n`;
                  }
                });
              }
            }
          }
        );
      }
    });
  }

  // Handle data sources
  if (data.data && typeof data.data === 'object') {
    const dataSources = data.data as Record<string, unknown>;
    Object.entries(dataSources).forEach(([dataType, instances]) => {
      if (typeof instances === 'object' && instances) {
        Object.entries(instances as Record<string, unknown>).forEach(
          ([instanceName]) => {
            const nodeId = sanitizeNodeId(`data_${dataType}_${instanceName}`);
            const label = sanitizeLabel(`${dataType}<br/>📊 ${instanceName}`);
            mermaidCode += `    ${nodeId}["${label}"]\n`;
          }
        );
      }
    });
  }

  // Handle variables
  if (data.variable && typeof data.variable === 'object') {
    const variables = data.variable as Record<string, unknown>;
    Object.keys(variables).forEach(varName => {
      const nodeId = sanitizeNodeId(`var_${varName}`);
      const label = sanitizeLabel(`Variable<br/>📝 ${varName}`);
      mermaidCode += `    ${nodeId}["${label}"]\n`;
    });
  }

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

const generateCloudFormationDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  const resources = (data.Resources as Record<string, unknown>) || {};

  let mermaidCode = 'graph TD\n';

  Object.entries(resources).forEach(([resourceName, resourceConfig]) => {
    if (resourceConfig && typeof resourceConfig === 'object') {
      const config = resourceConfig as Record<string, unknown>;
      const resourceType = (config.Type as string) || 'Unknown';

      const nodeId = sanitizeNodeId(resourceName);
      const label = sanitizeLabel(`${resourceType}<br/>☁️ ${resourceName}`);
      mermaidCode += `    ${nodeId}["${label}"]\n`;

      // Add dependencies
      if (config.DependsOn) {
        const dependencies = Array.isArray(config.DependsOn)
          ? config.DependsOn
          : [config.DependsOn];

        dependencies.forEach((dep: unknown) => {
          if (typeof dep === 'string') {
            const depNodeId = sanitizeNodeId(dep);
            mermaidCode += `    ${depNodeId} --> ${nodeId}\n`;
          }
        });
      }
    }
  });

  // Add parameters
  if (data.Parameters && typeof data.Parameters === 'object') {
    const parameters = data.Parameters as Record<string, unknown>;
    Object.keys(parameters).forEach(paramName => {
      const nodeId = sanitizeNodeId(`param_${paramName}`);
      const label = sanitizeLabel(`Parameter<br/>⚙️ ${paramName}`);
      mermaidCode += `    ${nodeId}["${label}"]\n`;
    });
  }

  return {
    success: true,
    mermaidCode,
    diagramType: 'graph',
  };
};

const generateAzureARMDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  const resources = (data.resources as unknown[]) || [];

  let mermaidCode = 'flowchart TD\n';

  resources.forEach((resource, index) => {
    if (resource && typeof resource === 'object') {
      const resourceObj = resource as Record<string, unknown>;
      const resourceType = (resourceObj.type as string) || 'Unknown';
      const name = (resourceObj.name as string) || `resource_${index}`;

      const nodeId = sanitizeNodeId(`${resourceType}_${name}_${index}`);
      const label = sanitizeLabel(`${resourceType}<br/>🔷 ${name}`);
      mermaidCode += `    ${nodeId}["${label}"]\n`;

      // Add dependencies
      if (resourceObj.dependsOn) {
        const dependencies = Array.isArray(resourceObj.dependsOn)
          ? resourceObj.dependsOn
          : [resourceObj.dependsOn];

        dependencies.forEach((dep: unknown) => {
          if (typeof dep === 'string') {
            const depNodeId = sanitizeNodeId(`${dep}_dep`);
            mermaidCode += `    ${depNodeId} --> ${nodeId}\n`;
          }
        });
      }
    }
  });

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

const generateIBMCloudDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  let mermaidCode = 'graph TD\n';

  // Handle IBM Cloud resources - the JSON structure has resources as an array
  if (data.resources && Array.isArray(data.resources)) {
    const resources = data.resources as Array<Record<string, unknown>>;
    const connections: string[] = [];

    resources.forEach(resource => {
      const name = resource.name as string;
      const type = resource.type as string;
      const properties = resource.properties as Record<string, unknown>;

      if (name && type) {
        const nodeId = sanitizeNodeId(name);

        // Add icons for different IBM Cloud resource types
        let icon = '🌐';
        if (type.includes('vpc')) icon = '🏢';
        else if (type.includes('subnet')) icon = '🌐';
        else if (type.includes('instance')) icon = '🖥️';
        else if (type.includes('security_group')) icon = '🛡️';
        else if (type.includes('lb')) icon = '⚖️';
        else if (type.includes('floating_ip')) icon = '🌍';
        else if (type.includes('cos')) icon = '📦';

        const label = sanitizeLabel(
          `${icon} ${name}<br/><small>${type}</small>`
        );
        mermaidCode += `    ${nodeId}["${label}"]\n`;

        // Add connections based on dependencies
        if (properties) {
          // VPC connections
          if (properties.vpc && typeof properties.vpc === 'string') {
            const vpcRef = extractResourceName(properties.vpc as string);
            if (vpcRef) {
              connections.push(`    ${sanitizeNodeId(vpcRef)} --> ${nodeId}`);
            }
          }

          // Subnet connections
          if (properties.subnet && typeof properties.subnet === 'string') {
            const subnetRef = extractResourceName(properties.subnet as string);
            if (subnetRef) {
              connections.push(
                `    ${sanitizeNodeId(subnetRef)} --> ${nodeId}`
              );
            }
          }

          // Load balancer connections
          if (properties.lb && typeof properties.lb === 'string') {
            const lbRef = extractResourceName(properties.lb as string);
            if (lbRef) {
              connections.push(`    ${sanitizeNodeId(lbRef)} --> ${nodeId}`);
            }
          }

          // Target connections for floating IP
          if (properties.target && typeof properties.target === 'string') {
            const targetMatch = (properties.target as string).match(
              /ibm_is_instance\.([^.]+)/
            );
            if (targetMatch) {
              connections.push(
                `    ${sanitizeNodeId(targetMatch[1])} --> ${nodeId}`
              );
            }
          }

          // Security group connections
          if (
            properties.security_groups &&
            Array.isArray(properties.security_groups)
          ) {
            properties.security_groups.forEach(sg => {
              if (typeof sg === 'string') {
                const sgRef = extractResourceName(sg);
                if (sgRef) {
                  connections.push(
                    `    ${sanitizeNodeId(sgRef)} --> ${nodeId}`
                  );
                }
              }
            });
          }

          // Group reference for security group rules
          if (properties.group && typeof properties.group === 'string') {
            const groupRef = extractResourceName(properties.group as string);
            if (groupRef) {
              connections.push(`    ${sanitizeNodeId(groupRef)} --> ${nodeId}`);
            }
          }
        }
      }
    });

    // Add all connections
    connections.forEach(connection => {
      mermaidCode += connection + '\n';
    });
  }

  // Handle data sources
  if (data.data_sources && Array.isArray(data.data_sources)) {
    const dataSources = data.data_sources as Array<Record<string, unknown>>;
    dataSources.forEach(dataSource => {
      const name = dataSource.name as string;
      const type = dataSource.type as string;

      if (name && type) {
        const nodeId = sanitizeNodeId(`data_${name}`);
        const label = sanitizeLabel(
          `📋 ${name}<br/><small>data.${type}</small>`
        );
        mermaidCode += `    ${nodeId}["${label}"]\n`;
      }
    });
  }

  return {
    success: true,
    mermaidCode,
    diagramType: 'graph',
  };
};

// Helper function to extract resource name from reference strings
const extractResourceName = (ref: string): string | null => {
  // Handle IBM Cloud resource references like "${ibm_is_vpc.vpc.id}"
  const match = ref.match(/\$\{[^.]+\.([^.]+)\./);
  return match ? match[1] : null;
};
