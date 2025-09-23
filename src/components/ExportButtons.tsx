import React from 'react';
import { Download, Copy, FileText, Image, FileImage } from 'lucide-react';
import type { ExportButtonsProps } from '../types';
import { copyToClipboard, generateFilename } from '../utils/exportUtils';

const ExportButtons: React.FC<ExportButtonsProps> = ({
  mermaidCode,
  filename,
  theme,
  onExport,
  disabled = false,
}) => {
  const handleCopyCode = async () => {
    try {
      await copyToClipboard(mermaidCode);
      // You might want to add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExport = (format: 'svg' | 'png' | 'pdf' | 'mermaid') => {
    const exportFilename = generateFilename(filename || 'diagram', format);
    onExport({
      format,
      filename: exportFilename,
      theme,
    });
  };

  const exportButtons = [
    {
      format: 'mermaid' as const,
      label: 'Mermaid Code',
      icon: FileText,
      description: 'Export as .mmd file',
    },
    {
      format: 'svg' as const,
      label: 'SVG',
      icon: Image,
      description: 'Vector graphics format',
    },
    {
      format: 'png' as const,
      label: 'PNG',
      icon: FileImage,
      description: 'Raster image format',
    },
  ];

  if (!mermaidCode) {
    return (
      <div
        className="p-4 text-center"
        style={{ color: 'var(--theme-secondary)' }}
      >
        <p className="text-sm">Generate a diagram to enable export options</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Copy to clipboard */}
      <div className="flex flex-col gap-2">
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--theme-text)' }}
        >
          Quick Actions
        </h3>
        <button
          onClick={handleCopyCode}
          disabled={disabled}
          className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--theme-text)',
            borderColor: 'var(--theme-secondary)',
          }}
        >
          <Copy className="h-4 w-4" />
          Copy Mermaid Code
        </button>
      </div>

      {/* Export options */}
      <div className="flex flex-col gap-2">
        <h3
          className="text-sm font-medium"
          style={{ color: 'var(--theme-text)' }}
        >
          Export Formats
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {exportButtons.map(({ format, label, icon: Icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={disabled}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              style={{
                backgroundColor: 'var(--theme-primary)',
                color: 'white',
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Export info */}
      <div
        className="text-xs space-y-1"
        style={{ color: 'var(--theme-secondary)' }}
      >
        <p className="flex items-center gap-1">
          <Download className="h-3 w-3" />
          Files will be downloaded automatically
        </p>
        <p>• SVG: Best for web and scalable graphics</p>
        <p>• PNG: Good for presentations and documents</p>
        <p>• Mermaid: Source code for future editing</p>
      </div>
    </div>
  );
};

export default ExportButtons;
