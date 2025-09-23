import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DiagramViewer from '../DiagramViewer';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><g><text>Mock Diagram</text></g></svg>',
    }),
  },
}));

describe('DiagramViewer', () => {
  const mockOnExport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        isLoading={true}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText('Generating diagram...')).toBeInTheDocument();
  });

  it('should render empty state when no mermaid code', () => {
    render(
      <DiagramViewer mermaidCode="" theme="default" onExport={mockOnExport} />
    );

    expect(screen.getByText('No diagram to display')).toBeInTheDocument();
    expect(
      screen.getByText('Upload a file or paste code to generate a diagram')
    ).toBeInTheDocument();
  });

  it('should render error state', () => {
    const errorMessage = 'Failed to generate diagram';

    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        error={errorMessage}
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText('Diagram Generation Failed')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display zoom controls', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    expect(screen.getByTitle('Zoom Out')).toBeInTheDocument();
    expect(screen.getByTitle('Zoom In')).toBeInTheDocument();
    expect(screen.getByTitle('Reset zoom and position')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display navigation controls', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    expect(screen.getByTitle(/Enter pan mode/)).toBeInTheDocument();
    expect(screen.getByTitle('Export Diagram')).toBeInTheDocument();
    expect(screen.getByTitle('Enter Fullscreen')).toBeInTheDocument();
  });

  it('should handle zoom in', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const zoomInButton = screen.getByTitle('Zoom In');
    fireEvent.click(zoomInButton);

    await waitFor(() => {
      expect(screen.getByText('120%')).toBeInTheDocument();
    });
  });

  it('should handle zoom out', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const zoomOutButton = screen.getByTitle('Zoom Out');
    fireEvent.click(zoomOutButton);

    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });
  });

  it('should reset zoom and position', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    // First zoom in
    const zoomInButton = screen.getByTitle('Zoom In');
    fireEvent.click(zoomInButton);

    // Then reset
    const resetButton = screen.getByTitle('Reset zoom and position');
    fireEvent.click(resetButton);

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  });

  it('should toggle pan mode', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const panButton = screen.getByTitle(/Enter pan mode/);
    fireEvent.click(panButton);

    await waitFor(() => {
      expect(screen.getByTitle(/Exit pan mode/)).toBeInTheDocument();
    });
  });

  it('should toggle fullscreen', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    fireEvent.click(fullscreenButton);

    await waitFor(() => {
      expect(screen.getByTitle('Exit Fullscreen')).toBeInTheDocument();
    });
  });

  it('should call onExport when export button is clicked', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const exportButton = screen.getByTitle('Export Diagram');
    fireEvent.click(exportButton);

    expect(mockOnExport).toHaveBeenCalledWith({
      format: 'svg',
      filename: 'diagram',
      theme: 'default',
    });
  });

  it('should disable zoom out at minimum zoom', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const zoomOutButton = screen.getByTitle('Zoom Out');

    // Click zoom out multiple times to reach minimum
    for (let i = 0; i < 10; i++) {
      fireEvent.click(zoomOutButton);
    }

    expect(zoomOutButton).toBeDisabled();
  });

  it('should disable zoom in at maximum zoom', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    const zoomInButton = screen.getByTitle('Zoom In');

    // Click zoom in multiple times to reach maximum
    for (let i = 0; i < 25; i++) {
      fireEvent.click(zoomInButton);
    }

    expect(zoomInButton).toBeDisabled();
  });

  it('should display theme in footer', () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="forest"
        onExport={mockOnExport}
      />
    );

    expect(screen.getByText('Theme: forest')).toBeInTheDocument();
  });

  it('should display navigation hint when diagram is loaded', async () => {
    render(
      <DiagramViewer
        mermaidCode="flowchart TD\n  A --> B"
        theme="default"
        onExport={mockOnExport}
      />
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Click pan mode to navigate/)
      ).toBeInTheDocument();
    });
  });

  it('should not render export button when onExport is not provided', () => {
    render(
      <DiagramViewer mermaidCode="flowchart TD\n  A --> B" theme="default" />
    );

    expect(screen.queryByTitle('Export Diagram')).not.toBeInTheDocument();
  });
});
