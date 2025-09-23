// Core types for the Architecture-as-Code Visualizer

export interface ParsedData {
  format:
    | 'docker-compose'
    | 'kubernetes'
    | 'terraform'
    | 'cloudformation'
    | 'azure-arm'
    | 'ibm-cloud'
    | 'unknown';
  data: Record<string, unknown>;
  multiDocument?: boolean;
  documents?: Record<string, unknown>[];
  originalContent: string;
}

export interface ExportOptions {
  format: 'png' | 'svg' | 'pdf' | 'mermaid';
  filename: string;
  theme?: string;
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  accent: string;
  textColor: string;
}

export interface FileUploadState {
  isDragOver: boolean;
  isUploading: boolean;
  error: string | null;
  progress: number;
}

export interface ValidationError {
  line?: number;
  column?: number;
  message: string;
  type: 'error' | 'warning';
}

export interface ParseResult {
  success: boolean;
  data?: ParsedData;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface MermaidGenerationResult {
  success: boolean;
  mermaidCode?: string;
  error?: string;
  diagramType: 'flowchart' | 'graph' | 'sequence' | 'class' | 'state' | 'gantt';
}

// Example content structure
export interface ExampleContent {
  name: string;
  icon: string;
  format: ParsedData['format'];
  content: string;
  description: string;
}

// Component props interfaces
export interface FileUploadProps {
  onFileUpload: (content: string, filename: string) => void;
  acceptedFormats: string[];
  maxFileSize?: number;
}

export interface YamlEditorProps {
  content: string;
  onChange: (content: string) => void;
  onFormatDetected?: (format: ParsedData['format']) => void;
  validationErrors?: ValidationError[];
  readOnly?: boolean;
}

export interface DiagramViewerProps {
  mermaidCode: string;
  theme: string;
  onExport?: (options: ExportOptions) => void;
  isLoading?: boolean;
  error?: string;
}

export interface ExampleButtonsProps {
  onExampleSelected: (example: ExampleContent) => void;
  examples: ExampleContent[];
}

export interface ExportButtonsProps {
  mermaidCode: string;
  filename: string;
  theme: string;
  onExport: (options: ExportOptions) => void;
  disabled?: boolean;
}

export interface ThemeSelectorProps {
  currentTheme: string;
  themes: Theme[];
  onChange: (theme: string) => void;
}

// Configuration interfaces
export interface AppConfig {
  maxFileSize: number;
  supportedFormats: string[];
  defaultTheme: string;
  autoDetectFormat: boolean;
  enableValidation: boolean;
}

// API response types (for future backend integration)
export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error types
export class ParseError extends Error {
  line?: number;
  column?: number;
  format?: string;

  constructor(
    message: string,
    line?: number,
    column?: number,
    format?: string
  ) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.column = column;
    this.format = format;
  }
}

export class MermaidGenerationError extends Error {
  format?: string;
  originalError?: Error;

  constructor(message: string, format?: string, originalError?: Error) {
    super(message);
    this.name = 'MermaidGenerationError';
    this.format = format;
    this.originalError = originalError;
  }
}
