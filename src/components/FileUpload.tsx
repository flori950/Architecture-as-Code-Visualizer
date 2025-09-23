import React, { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import type { FileUploadProps, FileUploadState } from '../types';

const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  acceptedFormats,
  maxFileSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [uploadState, setUploadState] = useState<FileUploadState>({
    isDragOver: false,
    isUploading: false,
    error: null,
    progress: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${(maxFileSize / 1024 / 1024).toFixed(2)}MB)`;
    }

    // Check file extension
    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !acceptedFormats.includes(`.${extension}`)) {
      return `File type .${extension} is not supported. Supported formats: ${acceptedFormats.join(', ')}`;
    }

    return null;
  };

  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        const content = e.target?.result as string;
        resolve(content);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.onprogress = e => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadState(prev => ({ ...prev, progress }));
        }
      };

      reader.readAsText(file);
    });
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState(prev => ({ ...prev, error: validationError }));
      return;
    }

    setUploadState({
      isDragOver: false,
      isUploading: true,
      error: null,
      progress: 0,
    });

    try {
      const content = await readFile(file);
      onFileUpload(content, file.name);
      setUploadState({
        isDragOver: false,
        isUploading: false,
        error: null,
        progress: 100,
      });

      // Reset progress after success
      setTimeout(() => {
        setUploadState(prev => ({ ...prev, progress: 0 }));
      }, 2000);
    } catch (error) {
      const err = error as Error;
      setUploadState({
        isDragOver: false,
        isUploading: false,
        error: err.message,
        progress: 0,
      });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: true, error: null }));
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUploadState(prev => ({ ...prev, isDragOver: false }));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 1) {
      setUploadState(prev => ({
        ...prev,
        isDragOver: false,
        error: 'Please upload only one file at a time',
      }));
      return;
    }

    if (files.length === 1) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
          ${uploadState.isUploading ? 'pointer-events-none' : ''}
        `}
        style={{
          borderColor: uploadState.isDragOver
            ? 'var(--theme-primary)'
            : 'var(--theme-secondary)',
          backgroundColor: uploadState.isDragOver
            ? 'rgba(59, 130, 246, 0.1)'
            : 'transparent',
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload file area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
        />

        <div className="flex flex-col items-center gap-4">
          {uploadState.isUploading ? (
            <>
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2"
                style={{ borderColor: 'var(--theme-primary)' }}
              ></div>
              <p
                className="text-sm"
                style={{ color: 'var(--theme-secondary)' }}
              >
                Uploading... {uploadState.progress.toFixed(0)}%
              </p>
            </>
          ) : (
            <>
              <div
                className="p-3 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: uploadState.error
                    ? 'rgba(239, 68, 68, 0.1)'
                    : uploadState.progress > 0
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'var(--theme-card-bg)',
                }}
              >
                {uploadState.error ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : uploadState.progress > 0 ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Upload
                    className="h-8 w-8"
                    style={{ color: 'var(--theme-secondary)' }}
                  />
                )}
              </div>

              <div>
                <p
                  className="text-lg font-medium"
                  style={{ color: 'var(--theme-text)' }}
                >
                  {uploadState.error
                    ? 'Upload Failed'
                    : uploadState.progress > 0
                      ? 'Upload Successful!'
                      : 'Drop your file here'}
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: 'var(--theme-secondary)' }}
                >
                  or click to browse
                </p>
              </div>
            </>
          )}
        </div>

        {/* Progress bar */}
        {uploadState.isUploading && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg overflow-hidden"
            style={{ backgroundColor: 'var(--theme-card-bg)' }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${uploadState.progress}%`,
                backgroundColor: 'var(--theme-primary)',
              }}
            />
          </div>
        )}
      </div>

      {/* Error message */}
      {uploadState.error && (
        <div
          className="mt-3 p-3 border rounded-md"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
          }}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* File format info */}
      <div
        className="mt-3 flex items-center gap-2 text-xs"
        style={{ color: 'var(--theme-secondary)' }}
      >
        <FileText className="h-4 w-4" />
        <span>Supported formats: {acceptedFormats.join(', ')}</span>
        <span>•</span>
        <span>Max size: {(maxFileSize / 1024 / 1024).toFixed(1)}MB</span>
      </div>
    </div>
  );
};

export default FileUpload;
