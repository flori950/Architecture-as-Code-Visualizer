import React, { useState } from 'react';
import { FileText, Download, Copy, Check } from 'lucide-react';

interface ExampleConfig {
  name: string;
  description: string;
  filename: string;
  format: string;
  category: string;
}

const EXAMPLES: ExampleConfig[] = [
  {
    name: 'Web Application Stack',
    description:
      'Complete web application with nginx, API, database, Redis, and monitoring',
    filename: 'docker-compose-example.yml',
    format: 'docker-compose',
    category: 'Docker Compose',
  },
  {
    name: 'Microservices Deployment',
    description:
      'Kubernetes deployment with web app, API, and StatefulSet database',
    filename: 'kubernetes-example.yml',
    format: 'kubernetes',
    category: 'Kubernetes',
  },
  {
    name: 'AWS Infrastructure',
    description:
      'Complete AWS setup with VPC, subnets, RDS, load balancer, and security groups',
    filename: 'terraform-example.tf',
    format: 'terraform',
    category: 'Terraform',
  },
  {
    name: 'Azure Virtual Machine',
    description:
      'Azure ARM template with VM, VNet, storage account, and security groups',
    filename: 'azure-arm-example.json',
    format: 'azure-arm',
    category: 'Azure ARM',
  },
  {
    name: 'IBM Cloud Infrastructure',
    description:
      'IBM Cloud setup with VPC, VSI, load balancer, and cloud object storage',
    filename: 'ibm-cloud-example.json',
    format: 'ibm-cloud',
    category: 'IBM Cloud',
  },
];

interface ExamplesProps {
  onLoadExample: (content: string, format: string, filename: string) => void;
}

export const Examples: React.FC<ExamplesProps> = ({ onLoadExample }) => {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadExample = async (example: ExampleConfig) => {
    setLoading(example.filename);
    try {
      const response = await fetch(`/examples/${example.filename}`);
      if (!response.ok) {
        throw new Error('Failed to load example');
      }
      const content = await response.text();
      onLoadExample(content, example.format, example.name);
      setSelectedExample(example.filename);
    } catch (error) {
      console.error('Error loading example:', error);
      alert('Failed to load example. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = async (example: ExampleConfig) => {
    try {
      const response = await fetch(`/examples/${example.filename}`);
      const content = await response.text();
      await navigator.clipboard.writeText(content);
      setCopiedId(example.filename);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const downloadExample = async (example: ExampleConfig) => {
    try {
      const response = await fetch(`/examples/${example.filename}`);
      const content = await response.text();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = example.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading example:', error);
    }
  };

  const groupedExamples = EXAMPLES.reduce(
    (acc, example) => {
      if (!acc[example.category]) {
        acc[example.category] = [];
      }
      acc[example.category].push(example);
      return acc;
    },
    {} as Record<string, ExampleConfig[]>
  );

  return (
    <div
      className="rounded-lg shadow-sm border transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        borderColor: 'var(--theme-secondary)',
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: 'var(--theme-secondary)' }}
      >
        <h3
          className="text-lg font-semibold"
          style={{ color: 'var(--theme-text)' }}
        >
          Example Configurations
        </h3>
        <p className="text-sm mt-1" style={{ color: 'var(--theme-secondary)' }}>
          Load pre-built examples to get started quickly
        </p>
      </div>

      <div className="p-4 space-y-6">
        {Object.entries(groupedExamples).map(([category, examples]) => (
          <div key={category}>
            <h4
              className="text-sm font-medium mb-3"
              style={{ color: 'var(--theme-text)' }}
            >
              {category}
            </h4>
            <div className="space-y-3">
              {examples.map(example => (
                <div
                  key={example.filename}
                  className="p-4 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor:
                      selectedExample === example.filename
                        ? 'var(--theme-primary)'
                        : 'var(--theme-secondary)',
                    backgroundColor:
                      selectedExample === example.filename
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'transparent',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <FileText
                          className="h-4 w-4"
                          style={{ color: 'var(--theme-secondary)' }}
                        />
                        <h5
                          className="font-medium"
                          style={{ color: 'var(--theme-text)' }}
                        >
                          {example.name}
                        </h5>
                        <span
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            color: 'var(--theme-secondary)',
                          }}
                        >
                          {example.format}
                        </span>
                      </div>
                      <p
                        className="text-sm mt-1"
                        style={{ color: 'var(--theme-secondary)' }}
                      >
                        {example.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(example)}
                        className="p-2 rounded transition-colors duration-200"
                        style={{ color: 'var(--theme-secondary)' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor =
                            'rgba(107, 114, 128, 0.1)';
                          e.currentTarget.style.color = 'var(--theme-text)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color =
                            'var(--theme-secondary)';
                        }}
                        title="Copy to clipboard"
                      >
                        {copiedId === example.filename ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        onClick={() => downloadExample(example)}
                        className="p-2 rounded transition-colors duration-200"
                        style={{ color: 'var(--theme-secondary)' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor =
                            'rgba(107, 114, 128, 0.1)';
                          e.currentTarget.style.color = 'var(--theme-text)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color =
                            'var(--theme-secondary)';
                        }}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => loadExample(example)}
                        disabled={loading === example.filename}
                        className="px-4 py-2 text-white text-sm rounded transition-colors duration-200"
                        style={{
                          backgroundColor:
                            loading === example.filename
                              ? 'rgba(59, 130, 246, 0.5)'
                              : 'var(--theme-primary)',
                        }}
                        onMouseEnter={e => {
                          if (loading !== example.filename) {
                            e.currentTarget.style.backgroundColor =
                              'rgba(59, 130, 246, 0.8)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (loading !== example.filename) {
                            e.currentTarget.style.backgroundColor =
                              'var(--theme-primary)';
                          }
                        }}
                      >
                        {loading === example.filename
                          ? 'Loading...'
                          : 'Load Example'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
