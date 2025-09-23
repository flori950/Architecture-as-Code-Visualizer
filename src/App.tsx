import { useState, useEffect, useCallback } from 'react';
import { Settings, Moon, Sun, Github, FileText, Zap } from 'lucide-react';

// Components
import FileUpload from './components/FileUpload';
import YamlEditor from './components/YamlEditor';
import LazyDiagramViewer from './components/LazyDiagramViewer';
import ExportButtons from './components/ExportButtons';
import ThemeSelector from './components/ThemeSelector';
import { Examples } from './components/Examples';

// Utils
import { parseContent } from './utils/yamlParser';
import { generateMermaidDiagram } from './utils/mermaidGenerator';
import { exportMermaidDiagram, downloadFile } from './utils/exportUtils';
import { themes, applyThemeToDocument } from './utils/themes';

// Types
import type { ParsedData, ValidationError, ExportOptions } from './types';

function App() {
  // State management
  const [yamlContent, setYamlContent] = useState('');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [mermaidCode, setMermaidCode] = useState('');
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilename, setSelectedFilename] = useState('');

  // Initialize theme
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('aac-theme');
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;

    if (savedTheme && themes.find(t => t.name === savedTheme)) {
      setCurrentTheme(savedTheme);
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      }
    } else if (prefersDark) {
      setCurrentTheme('dark');
      setIsDarkMode(true);
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyThemeToDocument(currentTheme);
    setIsDarkMode(currentTheme === 'dark');
  }, [currentTheme]);

  // Parse content and generate diagram
  const processContent = useCallback(
    async (content: string, filename?: string) => {
      if (!content.trim()) {
        setMermaidCode('');
        setParsedData(null);
        setValidationErrors([]);
        setError(null);
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Parse the content
        const parseResult = parseContent(content);

        if (!parseResult.success) {
          setError(parseResult.error || 'Failed to parse content');
          setValidationErrors(parseResult.validationErrors || []);
          setMermaidCode('');
          setParsedData(null);
          return;
        }

        // Set parsed data and validation errors
        setParsedData(parseResult.data!);
        setValidationErrors(parseResult.validationErrors || []);

        // Generate mermaid diagram
        const diagramResult = generateMermaidDiagram(parseResult.data!);

        if (!diagramResult.success) {
          setError(diagramResult.error || 'Failed to generate diagram');
          setMermaidCode('');
          return;
        }

        setMermaidCode(diagramResult.mermaidCode!);

        if (filename) {
          setSelectedFilename(filename.replace(/\.[^/.]+$/, '')); // Remove extension
        }
      } catch (err) {
        const error = err as Error;
        setError(`Unexpected error: ${error.message}`);
        setMermaidCode('');
        setParsedData(null);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (content: string, filename: string) => {
      setYamlContent(content);
      processContent(content, filename);
    },
    [processContent]
  );

  // Handle content change in editor
  const handleContentChange = useCallback(
    (content: string) => {
      setYamlContent(content);
      // Debounce the processing to avoid excessive calls
      const timeoutId = setTimeout(() => {
        processContent(content);
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [processContent]
  );

  // Handle example loading
  const handleExampleLoad = useCallback(
    (content: string, _format: string, name: string) => {
      setYamlContent(content);
      setSelectedFilename(name.toLowerCase().replace(/\s+/g, '_'));
      processContent(content, name);
    },
    [processContent]
  );

  // Handle theme change
  const handleThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
  }, []);

  // Toggle between light and dark mode specifically
  const toggleDarkMode = useCallback(() => {
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
    setCurrentTheme(newTheme);
  }, [currentTheme]);

  // Handle export
  const handleExport = useCallback(
    async (options: ExportOptions) => {
      try {
        if (options.format === 'mermaid') {
          // Export as mermaid code
          const content = `%% Generated by Architecture-as-Code Visualizer
%% Theme: ${currentTheme}
%% Format: ${parsedData?.format || 'unknown'}

${mermaidCode}`;
          downloadFile(content, options.filename, 'text/plain');
        } else {
          // Export as image/SVG
          const blob = await exportMermaidDiagram(mermaidCode, options);
          downloadFile(blob, options.filename);
        }
      } catch (error) {
        const err = error as Error;
        setError(`Export failed: ${err.message}`);
      }
    },
    [mermaidCode, currentTheme, parsedData]
  );

  const supportedFormats = ['.yml', '.yaml', '.json', '.tf'];

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)',
      }}
    >
      {/* Header */}
      <header
        className="border-b shadow-sm transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-background)',
          borderColor: 'var(--theme-secondary)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap
                  className="h-8 w-8"
                  style={{ color: 'var(--theme-primary)' }}
                />
                <h1
                  className="text-xl font-bold"
                  style={{ color: 'var(--theme-text)' }}
                >
                  Architecture-as-Code Visualizer
                </h1>
              </div>
              {parsedData && (
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `var(--theme-primary)`,
                    color: 'white',
                  }}
                >
                  {parsedData.format}
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <ThemeSelector
                currentTheme={currentTheme}
                themes={themes}
                onChange={handleThemeChange}
              />

              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{
                  backgroundColor: `rgba(${currentTheme === 'dark' ? '251, 191, 36' : '107, 114, 128'}, 0.1)`,
                }}
                title={
                  isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
                }
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" style={{ color: '#fbbf24' }} />
                ) : (
                  <Moon
                    className="h-5 w-5"
                    style={{ color: 'var(--theme-secondary)' }}
                  />
                )}
              </button>

              <a
                href="https://github.com/flori950"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg transition-colors hover:opacity-80"
                style={{
                  backgroundColor: `rgba(${currentTheme === 'dark' ? '107, 114, 128' : '107, 114, 128'}, 0.1)`,
                }}
                title="View my GitHub profile - flori950"
              >
                <Github
                  className="h-5 w-5"
                  style={{ color: 'var(--theme-secondary)' }}
                />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left column - Input */}
          <div className="flex flex-col gap-6">
            {/* File upload */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Configuration
              </h2>
              <FileUpload
                onFileUpload={handleFileUpload}
                acceptedFormats={supportedFormats}
                maxFileSize={5 * 1024 * 1024} // 5MB
              />
            </div>

            {/* Code editor */}
            <div className="card min-h-[400px]">
              <YamlEditor
                content={yamlContent}
                onChange={handleContentChange}
                validationErrors={validationErrors}
              />
            </div>

            {/* Examples */}
            <div className="card">
              <Examples onLoadExample={handleExampleLoad} />
            </div>
          </div>

          {/* Right column - Output */}
          <div className="flex flex-col gap-6">
            {/* Diagram viewer */}
            <div className="card min-h-[500px]">
              <LazyDiagramViewer
                mermaidCode={mermaidCode}
                theme={currentTheme}
                isLoading={isGenerating}
                error={error || undefined}
                onExport={handleExport}
              />
            </div>

            {/* Export controls */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Export Options
              </h2>
              <ExportButtons
                mermaidCode={mermaidCode}
                filename={selectedFilename || 'architecture-diagram'}
                theme={currentTheme}
                onExport={handleExport}
                disabled={!mermaidCode || isGenerating}
              />
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="fixed bottom-4 right-4 max-w-md bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-lg p-4 shadow-lg animate-fade-in">
            <div className="flex items-start gap-2">
              <div className="text-red-600 dark:text-red-400 mt-0.5">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
