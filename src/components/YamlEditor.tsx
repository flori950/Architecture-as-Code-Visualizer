import React, { useState, useCallback, useEffect } from 'react';
import { Code, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import type { YamlEditorProps } from '../types';
import { detectFormat } from '../utils/yamlParser';

const YamlEditor: React.FC<YamlEditorProps> = ({
  content,
  onChange,
  onFormatDetected,
  validationErrors = [],
  readOnly = false,
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [isEditing, setIsEditing] = useState(false);
  const [prevContent, setPrevContent] = useState(content);

  // Detect format when content changes - use useMemo instead of effect
  const detectedFormat = React.useMemo(() => {
    if (localContent.trim()) {
      const format = detectFormat(localContent);
      return format;
    }
    return '';
  }, [localContent]);

  // Notify parent of format changes
  useEffect(() => {
    if (onFormatDetected && detectedFormat) {
      onFormatDetected(detectedFormat);
    }
  }, [detectedFormat, onFormatDetected]);

  // Sync with external content changes - use derived state pattern
  if (!isEditing && content !== prevContent) {
    setPrevContent(content);
    setLocalContent(content);
  }

  const handleContentChange = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      onChange(newContent);
    },
    [onChange]
  );

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange(e.target.value);
  };

  const handleFocus = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'docker-compose':
        return '🐳';
      case 'kubernetes':
        return '☸️';
      case 'terraform':
        return '🏗️';
      case 'cloudformation':
        return '☁️';
      case 'azure-arm':
        return '🔷';
      case 'ibm-cloud':
        return '🌐';
      default:
        return '📄';
    }
  };

  const getFormatDisplayName = (format: string) => {
    switch (format) {
      case 'docker-compose':
        return 'Docker Compose';
      case 'kubernetes':
        return 'Kubernetes';
      case 'terraform':
        return 'Terraform';
      case 'cloudformation':
        return 'CloudFormation';
      case 'azure-arm':
        return 'Azure ARM';
      case 'ibm-cloud':
        return 'IBM Cloud';
      case 'unknown':
        return 'Unknown Format';
      default:
        return '';
    }
  };

  const hasErrors = validationErrors.some(error => error.type === 'error');

  return (
    <div className="flex flex-col min-h-[400px]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Code Editor
          </span>
          {readOnly && (
            <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
              Read Only
            </span>
          )}
        </div>

        {/* Format indicator */}
        {detectedFormat && (
          <div className="flex items-center gap-2">
            <span className="text-lg">{getFormatIcon(detectedFormat)}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {getFormatDisplayName(detectedFormat)}
            </span>
          </div>
        )}
      </div>

      {/* Validation status */}
      {validationErrors.length > 0 && (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center gap-2 text-sm">
            {hasErrors ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-yellow-500" />
            )}
            <span className="text-gray-700 dark:text-gray-300">
              {hasErrors
                ? `${validationErrors.filter(e => e.type === 'error').length} error(s)`
                : `${validationErrors.filter(e => e.type === 'warning').length} warning(s)`}
            </span>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative flex">
        {/* Line numbers */}
        {localContent && (
          <div className="flex-shrink-0 p-4 pr-2 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 font-mono text-sm select-none user-select-none">
            {localContent.split('\n').map((_, index) => (
              <div key={index} className="leading-5 text-right">
                {String(index + 1).padStart(3, ' ')}
              </div>
            ))}
          </div>
        )}

        <textarea
          value={localContent}
          onChange={handleTextareaChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          readOnly={readOnly}
          placeholder="Paste your infrastructure configuration here or upload a file..."
          className={`
            flex-1 p-4 pl-2 border-0 resize-none focus:outline-none font-mono text-sm
            bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
            ${readOnly ? 'cursor-default' : 'cursor-text'}
          `}
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 max-h-32 overflow-y-auto">
          {validationErrors.map((error, index) => (
            <div
              key={index}
              className={`p-2 border-l-4 ${
                error.type === 'error'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              <div className="flex items-start gap-2">
                {error.type === 'error' ? (
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      error.type === 'error'
                        ? 'text-red-700 dark:text-red-400'
                        : 'text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {error.message}
                  </p>
                  {(error.line !== undefined || error.column !== undefined) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Line {error.line || '?'}, Column {error.column || '?'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer stats */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{localContent.split('\n').length} lines</span>
            <span>{localContent.length} characters</span>
            <span>{new Blob([localContent]).size} bytes</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>Auto-detect format</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YamlEditor;
