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

  // Add subgraph for better organization
  mermaidCode += '    subgraph Services["🚀 Services"]\n';

  // Add services with enhanced details
  Object.entries(services).forEach(([serviceName, serviceConfig]) => {
    const config = serviceConfig as Record<string, unknown>;
    const nodeId = sanitizeNodeId(serviceName);
    const image = (config.image as string) || 'custom';

    // Build detailed label with more information
    const detailsArray = [`<b>${serviceName}</b>`, `📦 ${image}`];

    // Add ports
    if (config.ports) {
      const ports = Array.isArray(config.ports) ? config.ports : [config.ports];
      const portStrings = ports.map(port => `🌐 ${port}`);
      detailsArray.push(...portStrings);
    }

    // Add environment variables (show count)
    if (config.environment) {
      const envVars = Array.isArray(config.environment)
        ? config.environment
        : Object.keys(config.environment as Record<string, unknown>);
      detailsArray.push(`⚙️ ${envVars.length} env vars`);
    }

    // Add volume mounts (show count)
    if (config.volumes) {
      const vols = Array.isArray(config.volumes)
        ? config.volumes
        : [config.volumes];
      detailsArray.push(`💾 ${vols.length} volumes`);
    }

    // Add restart policy
    if (config.restart) {
      detailsArray.push(`🔄 restart: ${config.restart}`);
    }

    // Add working directory
    if (config.working_dir) {
      detailsArray.push(`📁 ${config.working_dir}`);
    }

    // Add command override
    if (config.command) {
      const cmd = Array.isArray(config.command)
        ? config.command.join(' ')
        : (config.command as string);
      detailsArray.push(
        `▶️ ${cmd.length > 20 ? cmd.substring(0, 20) + '...' : cmd}`
      );
    }

    const label = sanitizeLabel(detailsArray.join('<br/>'));
    mermaidCode += `        ${nodeId}["${label}"]\n`;

    // Add service class based on image type
    if (image.includes('nginx') || image.includes('apache')) {
      mermaidCode += `        class ${nodeId} webServer\n`;
    } else if (
      image.includes('postgres') ||
      image.includes('mysql') ||
      image.includes('mongo')
    ) {
      mermaidCode += `        class ${nodeId} database\n`;
    } else if (image.includes('redis') || image.includes('memcached')) {
      mermaidCode += `        class ${nodeId} cache\n`;
    } else if (
      image.includes('node') ||
      image.includes('python') ||
      image.includes('java')
    ) {
      mermaidCode += `        class ${nodeId} application\n`;
    }
  });

  mermaidCode += '    end\n';

  // Add dependencies
  Object.entries(services).forEach(([serviceName, serviceConfig]) => {
    const config = serviceConfig as Record<string, unknown>;
    if (config.depends_on) {
      const dependencies = Array.isArray(config.depends_on)
        ? config.depends_on
        : [config.depends_on];

      dependencies.forEach((dep: unknown) => {
        if (typeof dep === 'string') {
          const depNodeId = sanitizeNodeId(dep);
          const serviceNodeId = sanitizeNodeId(serviceName);
          mermaidCode += `    ${depNodeId} -->|depends on| ${serviceNodeId}\n`;
        }
      });
    }
  });

  // Add networks subgraph
  if (Object.keys(networks).length > 0) {
    mermaidCode += '    subgraph Networks["🌐 Networks"]\n';

    Object.entries(networks).forEach(([networkName, networkConfig]) => {
      const networkNodeId = sanitizeNodeId(`network_${networkName}`);
      const config = (networkConfig as Record<string, unknown>) || {};
      const driver = config.driver || 'bridge';
      const networkLabel = sanitizeLabel(
        `🌐 ${networkName}<br/>Driver: ${driver}`
      );
      mermaidCode += `        ${networkNodeId}["${networkLabel}"]\n`;
      mermaidCode += `        class ${networkNodeId} network\n`;
    });

    mermaidCode += '    end\n';

    // Connect services to networks
    Object.entries(services).forEach(([serviceName, serviceConfig]) => {
      const config = serviceConfig as Record<string, unknown>;
      if (config.networks) {
        const serviceNetworks = Array.isArray(config.networks)
          ? config.networks
          : Object.keys(config.networks as Record<string, unknown>);

        serviceNetworks.forEach((networkName: string) => {
          const serviceNodeId = sanitizeNodeId(serviceName);
          const networkNodeId = sanitizeNodeId(`network_${networkName}`);
          mermaidCode += `    ${serviceNodeId} -.->|connects to| ${networkNodeId}\n`;
        });
      }
    });
  }

  // Add volumes subgraph
  if (Object.keys(volumes).length > 0) {
    mermaidCode += '    subgraph Volumes["💾 Volumes"]\n';

    Object.entries(volumes).forEach(([volumeName, volumeConfig]) => {
      const volumeNodeId = sanitizeNodeId(`volume_${volumeName}`);
      const config = (volumeConfig as Record<string, unknown>) || {};
      const driver = config.driver || 'local';
      const volumeLabel = sanitizeLabel(
        `💾 ${volumeName}<br/>Driver: ${driver}`
      );
      mermaidCode += `        ${volumeNodeId}["${volumeLabel}"]\n`;
      mermaidCode += `        class ${volumeNodeId} volume\n`;
    });

    mermaidCode += '    end\n';

    // Connect services to volumes
    Object.entries(services).forEach(([serviceName, serviceConfig]) => {
      const config = serviceConfig as Record<string, unknown>;
      if (config.volumes) {
        const vols = Array.isArray(config.volumes)
          ? config.volumes
          : [config.volumes];
        vols.forEach((volume: unknown) => {
          if (typeof volume === 'string') {
            const volumeParts = volume.split(':');
            if (volumeParts.length >= 2) {
              const volumeName = volumeParts[0];
              // Check if it's a named volume (not a bind mount)
              if (!volumeName.startsWith('.') && !volumeName.startsWith('/')) {
                const serviceNodeId = sanitizeNodeId(serviceName);
                const volumeNodeId = sanitizeNodeId(`volume_${volumeName}`);
                mermaidCode += `    ${volumeNodeId} -.->|mounts to| ${serviceNodeId}\n`;
              }
            }
          }
        });
      }
    });
  }

  // Add CSS classes for styling
  mermaidCode += `
    classDef webServer fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef database fill:#f3e5f5,stroke:#4a148c,stroke-width:2px,color:#000
    classDef cache fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef application fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef network fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000
    classDef volume fill:#f1f8e9,stroke:#33691e,stroke-width:2px,color:#000
  `;

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

const generateKubernetesDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  let mermaidCode = 'flowchart TD\n';

  // Group resources by namespace
  const namespaces: Record<string, Array<Record<string, unknown>>> = {};

  const processResource = (resource: Record<string, unknown>) => {
    const metadata = (resource.metadata as Record<string, unknown>) || {};
    const namespace = (metadata.namespace as string) || 'default';

    if (!namespaces[namespace]) {
      namespaces[namespace] = [];
    }
    namespaces[namespace].push(resource);
  };

  if (parsedData.multiDocument && parsedData.documents) {
    // Handle multi-document YAML
    parsedData.documents.forEach(doc => {
      if (doc && typeof doc === 'object') {
        processResource(doc as Record<string, unknown>);
      }
    });
  } else {
    // Single document
    processResource(parsedData.data as Record<string, unknown>);
  }

  // Generate subgraphs for each namespace
  Object.entries(namespaces).forEach(([namespaceName, resources]) => {
    mermaidCode += `    subgraph NS_${sanitizeNodeId(namespaceName)}["🏠 Namespace: ${namespaceName}"]\n`;

    resources.forEach((resource, index) => {
      const kind = resource.kind as string;
      const metadata = (resource.metadata as Record<string, unknown>) || {};
      const name = (metadata.name as string) || `resource_${index}`;
      const nodeId = sanitizeNodeId(`${kind}_${name}_${namespaceName}`);

      // Build detailed information based on resource type
      const detailsArray = [`<b>${name}</b>`, `📋 ${kind}`];

      // Add labels if present
      if (metadata.labels && typeof metadata.labels === 'object') {
        const labelCount = Object.keys(
          metadata.labels as Record<string, unknown>
        ).length;
        detailsArray.push(`🏷️ ${labelCount} labels`);
      }

      switch (kind) {
        case 'Deployment': {
          const spec = resource.spec as Record<string, unknown>;
          if (spec) {
            if (spec.replicas) {
              detailsArray.push(`📊 ${spec.replicas} replicas`);
            }

            const template = spec.template as Record<string, unknown>;
            if (template?.spec) {
              const podSpec = template.spec as Record<string, unknown>;
              if (podSpec.containers && Array.isArray(podSpec.containers)) {
                const containers = podSpec.containers as Array<
                  Record<string, unknown>
                >;
                containers.forEach((container, containerIndex) => {
                  if (containerIndex === 0) {
                    // Show details for first container
                    detailsArray.push(`📦 ${container.image || 'unknown'}`);

                    // Add resource requirements
                    if (container.resources) {
                      const resources = container.resources as Record<
                        string,
                        unknown
                      >;
                      if (resources.requests || resources.limits) {
                        const requests = resources.requests as Record<
                          string,
                          unknown
                        >;
                        const limits = resources.limits as Record<
                          string,
                          unknown
                        >;
                        if (requests?.cpu || requests?.memory) {
                          detailsArray.push(
                            `📈 Requests: ${requests.cpu || 'N/A'}/${requests.memory || 'N/A'}`
                          );
                        }
                        if (limits?.cpu || limits?.memory) {
                          detailsArray.push(
                            `📉 Limits: ${limits.cpu || 'N/A'}/${limits.memory || 'N/A'}`
                          );
                        }
                      }
                    }

                    // Add ports
                    if (container.ports && Array.isArray(container.ports)) {
                      const ports = container.ports as Array<
                        Record<string, unknown>
                      >;
                      const portStrings = ports.map(
                        port => `🌐 ${port.containerPort}`
                      );
                      detailsArray.push(...portStrings.slice(0, 2)); // Limit to 2 ports for space
                    }

                    // Add environment variables count
                    if (container.env && Array.isArray(container.env)) {
                      detailsArray.push(`⚙️ ${container.env.length} env vars`);
                    }
                  }
                });

                if (containers.length > 1) {
                  detailsArray.push(
                    `📦 +${containers.length - 1} more containers`
                  );
                }
              }
            }
          }
          break;
        }

        case 'Service': {
          const spec = resource.spec as Record<string, unknown>;
          if (spec) {
            detailsArray.push(`🔗 Type: ${spec.type || 'ClusterIP'}`);

            if (spec.ports && Array.isArray(spec.ports)) {
              const ports = spec.ports as Array<Record<string, unknown>>;
              const portMappings = ports.map(
                port =>
                  `${port.port}${port.targetPort ? `:${port.targetPort}` : ''}`
              );
              detailsArray.push(`🌐 ${portMappings.join(', ')}`);
            }
          }
          break;
        }

        case 'StatefulSet': {
          const spec = resource.spec as Record<string, unknown>;
          if (spec) {
            if (spec.replicas) {
              detailsArray.push(`📊 ${spec.replicas} replicas`);
            }
            detailsArray.push(`💾 StatefulSet`);

            // Add volume claim templates count
            if (
              spec.volumeClaimTemplates &&
              Array.isArray(spec.volumeClaimTemplates)
            ) {
              const templates = spec.volumeClaimTemplates as Array<
                Record<string, unknown>
              >;
              detailsArray.push(`💾 ${templates.length} volume templates`);

              // Show storage size for first template
              if (templates[0]?.spec) {
                const vcSpec = templates[0].spec as Record<string, unknown>;
                if (vcSpec.resources) {
                  const resources = vcSpec.resources as Record<string, unknown>;
                  if (resources.requests) {
                    const requests = resources.requests as Record<
                      string,
                      unknown
                    >;
                    if (requests.storage) {
                      detailsArray.push(`💾 ${requests.storage}`);
                    }
                  }
                }
              }
            }
          }
          break;
        }

        case 'ConfigMap':
        case 'Secret': {
          const data = resource.data as Record<string, unknown>;
          if (data) {
            const keyCount = Object.keys(data).length;
            detailsArray.push(`🔑 ${keyCount} keys`);
          }
          break;
        }

        case 'PersistentVolumeClaim': {
          const spec = resource.spec as Record<string, unknown>;
          if (spec?.resources) {
            const resources = spec.resources as Record<string, unknown>;
            if (resources.requests) {
              const requests = resources.requests as Record<string, unknown>;
              if (requests.storage) {
                detailsArray.push(`💾 ${requests.storage}`);
              }
            }
          }
          if (spec?.accessModes && Array.isArray(spec.accessModes)) {
            detailsArray.push(`🔐 ${spec.accessModes.join(', ')}`);
          }
          break;
        }
      }

      const label = sanitizeLabel(detailsArray.join('<br/>'));
      mermaidCode += `        ${nodeId}["${label}"]\n`;

      // Add CSS classes based on resource type
      if (
        kind === 'Deployment' ||
        kind === 'StatefulSet' ||
        kind === 'DaemonSet'
      ) {
        mermaidCode += `        class ${nodeId} workload\n`;
      } else if (kind === 'Service') {
        mermaidCode += `        class ${nodeId} service\n`;
      } else if (kind === 'ConfigMap' || kind === 'Secret') {
        mermaidCode += `        class ${nodeId} config\n`;
      } else if (kind === 'PersistentVolumeClaim') {
        mermaidCode += `        class ${nodeId} storage\n`;
      }
    });

    mermaidCode += '    end\n';
  });

  // Add relationships between resources
  Object.values(namespaces)
    .flat()
    .forEach(resource => {
      const kind = resource.kind as string;
      const metadata = (resource.metadata as Record<string, unknown>) || {};
      const name = (metadata.name as string) || 'unknown';
      const namespace = (metadata.namespace as string) || 'default';
      const nodeId = sanitizeNodeId(`${kind}_${name}_${namespace}`);

      if (kind === 'Service') {
        // Connect Services to Deployments/StatefulSets with matching selectors
        const spec = resource.spec as Record<string, unknown>;
        if (spec?.selector) {
          // Find matching Deployments/StatefulSets
          Object.values(namespaces)
            .flat()
            .forEach(otherResource => {
              const otherKind = otherResource.kind as string;
              if (otherKind === 'Deployment' || otherKind === 'StatefulSet') {
                const otherMetadata =
                  (otherResource.metadata as Record<string, unknown>) || {};
                const otherName = (otherMetadata.name as string) || 'unknown';
                const otherNamespace =
                  (otherMetadata.namespace as string) || 'default';

                if (otherNamespace === namespace) {
                  const otherNodeId = sanitizeNodeId(
                    `${otherKind}_${otherName}_${otherNamespace}`
                  );
                  mermaidCode += `    ${nodeId} -->|selects| ${otherNodeId}\n`;
                }
              }
            });
        }
      }
    });

  // Add CSS classes for styling
  mermaidCode += `
    classDef workload fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef service fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef config fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    classDef storage fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
  `;

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

const generateTerraformDiagram = (
  parsedData: ParsedData
): MermaidGenerationResult => {
  const data = parsedData.data as Record<string, unknown>;
  let mermaidCode = 'flowchart TD\n';

  // Add subgraphs for better organization
  let hasResources = false;
  let hasDataSources = false;
  let hasVariables = false;

  // Check what we have
  if (data.resource && typeof data.resource === 'object') {
    hasResources =
      Object.keys(data.resource as Record<string, unknown>).length > 0;
  }
  if (data.data && typeof data.data === 'object') {
    hasDataSources =
      Object.keys(data.data as Record<string, unknown>).length > 0;
  }
  if (data.variable && typeof data.variable === 'object') {
    hasVariables =
      Object.keys(data.variable as Record<string, unknown>).length > 0;
  }

  // Handle resources
  if (hasResources) {
    mermaidCode += '    subgraph Resources["🏗️ Resources"]\n';

    const resources = data.resource as Record<string, unknown>;
    Object.entries(resources).forEach(([resourceType, instances]) => {
      if (typeof instances === 'object' && instances) {
        Object.entries(instances as Record<string, unknown>).forEach(
          ([instanceName, config]) => {
            const nodeId = sanitizeNodeId(`${resourceType}_${instanceName}`);

            // Build detailed label with resource information
            const detailsArray = [
              `<b>${instanceName}</b>`,
              `🏗️ ${resourceType}`,
            ];

            if (config && typeof config === 'object') {
              const resourceConfig = config as Record<string, unknown>;

              // Add provider-specific details
              if (resourceType.startsWith('aws_')) {
                addAWSResourceDetails(
                  resourceType,
                  resourceConfig,
                  detailsArray
                );
              } else if (resourceType.startsWith('azurerm_')) {
                addAzureResourceDetails(
                  resourceType,
                  resourceConfig,
                  detailsArray
                );
              } else if (resourceType.startsWith('google_')) {
                addGCPResourceDetails(
                  resourceType,
                  resourceConfig,
                  detailsArray
                );
              }

              // Add tags if present
              if (
                resourceConfig.tags &&
                typeof resourceConfig.tags === 'object'
              ) {
                const tagCount = Object.keys(
                  resourceConfig.tags as Record<string, unknown>
                ).length;
                detailsArray.push(`🏷️ ${tagCount} tags`);
              }

              // Add count if present
              if (resourceConfig.count) {
                detailsArray.push(`📊 count: ${resourceConfig.count}`);
              }
            }

            const label = sanitizeLabel(detailsArray.join('<br/>'));
            mermaidCode += `        ${nodeId}["${label}"]\n`;

            // Add CSS class based on resource type
            if (
              resourceType.includes('vpc') ||
              resourceType.includes('network')
            ) {
              mermaidCode += `        class ${nodeId} network\n`;
            } else if (
              resourceType.includes('instance') ||
              resourceType.includes('server')
            ) {
              mermaidCode += `        class ${nodeId} compute\n`;
            } else if (
              resourceType.includes('db') ||
              resourceType.includes('database')
            ) {
              mermaidCode += `        class ${nodeId} database\n`;
            } else if (
              resourceType.includes('lb') ||
              resourceType.includes('balancer')
            ) {
              mermaidCode += `        class ${nodeId} loadbalancer\n`;
            } else if (
              resourceType.includes('storage') ||
              resourceType.includes('bucket')
            ) {
              mermaidCode += `        class ${nodeId} storage\n`;
            }
          }
        );
      }
    });

    mermaidCode += '    end\n';
  }

  // Handle data sources
  if (hasDataSources) {
    mermaidCode += '    subgraph DataSources["📊 Data Sources"]\n';

    const dataSources = data.data as Record<string, unknown>;
    Object.entries(dataSources).forEach(([dataType, instances]) => {
      if (typeof instances === 'object' && instances) {
        Object.entries(instances as Record<string, unknown>).forEach(
          ([instanceName, config]) => {
            const nodeId = sanitizeNodeId(`data_${dataType}_${instanceName}`);
            const detailsArray = [
              `<b>${instanceName}</b>`,
              `📊 data.${dataType}`,
            ];

            if (config && typeof config === 'object') {
              const dataConfig = config as Record<string, unknown>;

              // Add filter information if present
              if (dataConfig.filter || dataConfig.filters) {
                detailsArray.push(`🔍 filtered`);
              }

              // Add specific data source details
              if (dataType.includes('vpc') || dataType.includes('subnet')) {
                detailsArray.push(`🌐 network lookup`);
              } else if (
                dataType.includes('ami') ||
                dataType.includes('image')
              ) {
                detailsArray.push(`💿 image lookup`);
              }
            }

            const label = sanitizeLabel(detailsArray.join('<br/>'));
            mermaidCode += `        ${nodeId}["${label}"]\n`;
            mermaidCode += `        class ${nodeId} datasource\n`;
          }
        );
      }
    });

    mermaidCode += '    end\n';
  }

  // Handle variables
  if (hasVariables) {
    mermaidCode += '    subgraph Variables["📝 Variables"]\n';

    const variables = data.variable as Record<string, unknown>;
    Object.entries(variables).forEach(([varName, varConfig]) => {
      const nodeId = sanitizeNodeId(`var_${varName}`);
      const detailsArray = [`<b>${varName}</b>`, `📝 variable`];

      if (varConfig && typeof varConfig === 'object') {
        const config = varConfig as Record<string, unknown>;

        if (config.type) {
          detailsArray.push(`🔧 ${config.type}`);
        }

        if (config.default !== undefined) {
          detailsArray.push(`⚙️ has default`);
        }

        if (config.description) {
          const desc = config.description as string;
          const shortDesc =
            desc.length > 30 ? desc.substring(0, 30) + '...' : desc;
          detailsArray.push(`ℹ️ ${shortDesc}`);
        }
      }

      const label = sanitizeLabel(detailsArray.join('<br/>'));
      mermaidCode += `        ${nodeId}["${label}"]\n`;
      mermaidCode += `        class ${nodeId} variable\n`;
    });

    mermaidCode += '    end\n';
  }

  // Add dependencies between resources
  if (hasResources) {
    const resources = data.resource as Record<string, unknown>;
    Object.entries(resources).forEach(([resourceType, instances]) => {
      if (typeof instances === 'object' && instances) {
        Object.entries(instances as Record<string, unknown>).forEach(
          ([instanceName, config]) => {
            if (config && typeof config === 'object') {
              const resourceConfig = config as Record<string, unknown>;
              const nodeId = sanitizeNodeId(`${resourceType}_${instanceName}`);

              // Add explicit dependencies
              if (resourceConfig.depends_on) {
                const dependencies = Array.isArray(resourceConfig.depends_on)
                  ? resourceConfig.depends_on
                  : [resourceConfig.depends_on];

                dependencies.forEach((dep: unknown) => {
                  if (typeof dep === 'string') {
                    const depNodeId = sanitizeNodeId(dep.replace(/\./g, '_'));
                    mermaidCode += `    ${depNodeId} -->|depends on| ${nodeId}\n`;
                  }
                });
              }

              // Add implicit dependencies through references
              Object.values(resourceConfig).forEach(value => {
                if (typeof value === 'string' && value.includes('${')) {
                  // Extract resource references
                  const matches = value.match(/\$\{([^}]+)\}/g);
                  if (matches) {
                    matches.forEach(match => {
                      const ref = match.slice(2, -1); // Remove ${ }
                      if (ref.includes('.')) {
                        const [refType, refName] = ref.split('.');
                        if (refType !== 'var' && refType !== 'local') {
                          const refNodeId = sanitizeNodeId(
                            `${refType}_${refName}`
                          );
                          mermaidCode += `    ${refNodeId} -.->|referenced by| ${nodeId}\n`;
                        }
                      }
                    });
                  }
                }
              });
            }
          }
        );
      }
    });
  }

  // Add CSS classes for styling
  mermaidCode += `
    classDef network fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef compute fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
    classDef database fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef loadbalancer fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
    classDef storage fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef datasource fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#000
    classDef variable fill:#fff8e1,stroke:#fbc02d,stroke-width:2px,color:#000
  `;

  return {
    success: true,
    mermaidCode,
    diagramType: 'flowchart',
  };
};

// Helper functions for provider-specific details
const addAWSResourceDetails = (
  resourceType: string,
  config: Record<string, unknown>,
  detailsArray: string[]
): void => {
  switch (resourceType) {
    case 'aws_instance':
      if (config.instance_type) detailsArray.push(`💻 ${config.instance_type}`);
      if (config.ami) detailsArray.push(`💿 ${config.ami}`);
      break;
    case 'aws_vpc':
      if (config.cidr_block) detailsArray.push(`🌐 ${config.cidr_block}`);
      break;
    case 'aws_subnet':
      if (config.cidr_block) detailsArray.push(`🌐 ${config.cidr_block}`);
      if (config.availability_zone)
        detailsArray.push(`📍 ${config.availability_zone}`);
      break;
    case 'aws_security_group':
      if (config.ingress && Array.isArray(config.ingress)) {
        detailsArray.push(`🔓 ${config.ingress.length} ingress rules`);
      }
      if (config.egress && Array.isArray(config.egress)) {
        detailsArray.push(`🔒 ${config.egress.length} egress rules`);
      }
      break;
    case 'aws_db_instance':
      if (config.engine) detailsArray.push(`🔧 ${config.engine}`);
      if (config.instance_class)
        detailsArray.push(`💻 ${config.instance_class}`);
      if (config.allocated_storage)
        detailsArray.push(`💾 ${config.allocated_storage}GB`);
      break;
    case 'aws_lb':
      if (config.load_balancer_type)
        detailsArray.push(`⚖️ ${config.load_balancer_type}`);
      break;
  }
};

const addAzureResourceDetails = (
  resourceType: string,
  config: Record<string, unknown>,
  detailsArray: string[]
): void => {
  switch (resourceType) {
    case 'azurerm_virtual_machine':
      if (config.vm_size) detailsArray.push(`💻 ${config.vm_size}`);
      break;
    case 'azurerm_virtual_network':
      if (config.address_space && Array.isArray(config.address_space)) {
        detailsArray.push(`🌐 ${config.address_space[0]}`);
      }
      break;
    case 'azurerm_subnet':
      if (config.address_prefixes && Array.isArray(config.address_prefixes)) {
        detailsArray.push(`🌐 ${config.address_prefixes[0]}`);
      }
      break;
  }
};

const addGCPResourceDetails = (
  resourceType: string,
  config: Record<string, unknown>,
  detailsArray: string[]
): void => {
  switch (resourceType) {
    case 'google_compute_instance':
      if (config.machine_type) detailsArray.push(`💻 ${config.machine_type}`);
      if (config.zone) detailsArray.push(`📍 ${config.zone}`);
      break;
    case 'google_compute_network':
      if (config.auto_create_subnetworks === false) {
        detailsArray.push(`🌐 custom mode`);
      }
      break;
  }
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
