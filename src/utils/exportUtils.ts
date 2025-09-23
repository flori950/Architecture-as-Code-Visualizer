import mermaid from 'mermaid';
import type { ExportOptions } from '../types';

export const exportMermaidDiagram = async (
  mermaidCode: string,
  options: ExportOptions
): Promise<Blob | string> => {
  try {
    switch (options.format) {
      case 'svg':
        return await exportAsSVG(mermaidCode, options);
      case 'png':
        return await exportAsPNG(mermaidCode, options);
      case 'pdf':
        return await exportAsPDF(mermaidCode, options);
      case 'mermaid':
        return exportAsMermaidCode(mermaidCode, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    const err = error as Error;
    throw new Error(`Export failed: ${err.message}`);
  }
};

const exportAsSVG = async (
  mermaidCode: string,
  options: ExportOptions
): Promise<Blob> => {
  // Configure mermaid
  mermaid.initialize({
    startOnLoad: false,
    theme: (options.theme || 'default') as
      | 'default'
      | 'base'
      | 'dark'
      | 'forest'
      | 'neutral'
      | 'null',
    securityLevel: 'loose',
  });

  // Generate SVG
  const { svg } = await mermaid.render('temp-diagram', mermaidCode);

  // Create blob
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return blob;
};

const exportAsPNG = async (
  mermaidCode: string,
  options: ExportOptions
): Promise<Blob> => {
  // First get SVG
  const svgBlob = await exportAsSVG(mermaidCode, options);
  const svgText = await svgBlob.text();

  // Create canvas and convert SVG to PNG
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob2 = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob2);

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;

      // Draw image on canvas
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Convert to blob
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
};

const exportAsPDF = async (
  mermaidCode: string,
  options: ExportOptions
): Promise<Blob> => {
  // For PDF export, we'll need a PDF library like jsPDF
  // For now, we'll export as SVG and let the user handle PDF conversion
  // In a full implementation, you would use jsPDF or similar

  await exportAsSVG(mermaidCode, options);

  // This is a simplified implementation
  // In practice, you'd want to use a proper PDF library
  throw new Error(
    'PDF export requires additional library. Please use SVG export for now.'
  );
};

const exportAsMermaidCode = (
  mermaidCode: string,
  options: ExportOptions
): string => {
  // Add theme information as comment
  const themeComment = options.theme ? `%% Theme: ${options.theme}\n` : '';
  return `${themeComment}${mermaidCode}`;
};

export const downloadFile = (
  content: Blob | string,
  filename: string,
  mimeType?: string
) => {
  let blob: Blob;

  if (content instanceof Blob) {
    blob = content;
  } else {
    blob = new Blob([content], { type: mimeType || 'text/plain' });
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const generateFilename = (
  baseName: string,
  format: ExportOptions['format']
): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');

  const extensions: Record<ExportOptions['format'], string> = {
    svg: 'svg',
    png: 'png',
    pdf: 'pdf',
    mermaid: 'mmd',
  };

  return `${sanitizedBaseName}_${timestamp}.${extensions[format]}`;
};

export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      return new Promise((resolve, reject) => {
        if (document.execCommand('copy')) {
          resolve();
        } else {
          reject(new Error('Failed to copy to clipboard'));
        }
        document.body.removeChild(textArea);
      });
    }
  } catch {
    throw new Error('Failed to copy to clipboard');
  }
};
