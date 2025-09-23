import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileUpload from '../FileUpload';

describe('FileUpload', () => {
  const mockOnFileUpload = vi.fn();
  const defaultProps = {
    onFileUpload: mockOnFileUpload,
    acceptedFormats: ['.yml', '.yaml', '.json'],
  };

  beforeEach(() => {
    mockOnFileUpload.mockClear();
  });

  it('should render upload interface', () => {
    render(<FileUpload {...defaultProps} />);

    expect(screen.getByText('Drop your file here')).toBeInTheDocument();
    expect(screen.getByText('or click to browse')).toBeInTheDocument();
    expect(
      screen.getByText('Supported formats: .yml, .yaml, .json')
    ).toBeInTheDocument();
  });

  it('should handle file selection via input', async () => {
    render(<FileUpload {...defaultProps} />);

    const fileInput = screen
      .getByRole('button')
      .querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.yml', { type: 'text/yaml' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnFileUpload).toHaveBeenCalledWith('test content', 'test.yml');
    });
  });

  it('should validate file extensions', () => {
    render(<FileUpload {...defaultProps} />);

    const dropArea = screen.getByText('Drop your file here').closest('div');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });

    if (dropArea) {
      fireEvent(dropArea, dropEvent);
    }

    expect(
      screen.getByText(/File type \.txt is not supported/)
    ).toBeInTheDocument();
  });

  it('should validate file size', () => {
    const props = { ...defaultProps, maxFileSize: 100 }; // 100 bytes max
    render(<FileUpload {...props} />);

    const dropArea = screen.getByText('Drop your file here').closest('div');
    const largeContent = 'x'.repeat(200); // 200 bytes
    const file = new File([largeContent], 'test.yml', { type: 'text/yaml' });

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file] },
    });

    if (dropArea) {
      fireEvent(dropArea, dropEvent);
    }

    expect(
      screen.getByText(/File size.*exceeds maximum allowed size/)
    ).toBeInTheDocument();
  });

  it('should handle drag and drop', async () => {
    render(<FileUpload {...defaultProps} />);

    const dropArea = screen.getByRole('button', { name: /upload file area/i });

    // Test drag over
    fireEvent.dragOver(dropArea);
    await waitFor(() => {
      expect(dropArea.style.borderColor).toBe('var(--theme-primary)');
    });

    // Test drag leave
    fireEvent.dragLeave(dropArea);
    await waitFor(() => {
      expect(dropArea.style.borderColor).toBe('var(--theme-secondary)');
    });
  });

  it('should prevent multiple file upload', () => {
    render(<FileUpload {...defaultProps} />);

    const dropArea = screen.getByText('Drop your file here').closest('div');
    const file1 = new File(['test1'], 'test1.yml', { type: 'text/yaml' });
    const file2 = new File(['test2'], 'test2.yml', { type: 'text/yaml' });

    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: { files: [file1, file2] },
    });

    if (dropArea) {
      fireEvent(dropArea, dropEvent);
    }

    expect(
      screen.getByText('Please upload only one file at a time')
    ).toBeInTheDocument();
  });
});
