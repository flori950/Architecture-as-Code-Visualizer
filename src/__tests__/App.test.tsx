import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock mermaid
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({
      svg: '<svg><g><text>Mock Diagram</text></g></svg>',
    }),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock fetch for Examples component
Object.defineProperty(window, 'fetch', {
  value: vi.fn(),
  writable: true,
});

// Mock window.alert for Examples component
Object.defineProperty(window, 'alert', {
  value: vi.fn(),
  writable: true,
});

describe('App Integration', () => {
  it('should render main components', async () => {
    render(<App />);

    // Check header
    expect(
      screen.getByText('Architecture-as-Code Visualizer')
    ).toBeInTheDocument();

    // Check main sections
    expect(screen.getByText('Upload Configuration')).toBeInTheDocument();
    expect(screen.getByText('Export Options')).toBeInTheDocument();

    // Wait for lazy-loaded DiagramViewer component
    await waitFor(() => {
      expect(screen.getByText('Diagram Viewer')).toBeInTheDocument();
    });

    // Check GitHub link
    expect(
      screen.getByTitle('View my GitHub profile - flori950')
    ).toBeInTheDocument();
  });

  it('should toggle dark mode', async () => {
    render(<App />);

    const darkModeToggle = screen.getByTitle('Switch to dark mode');
    fireEvent.click(darkModeToggle);

    await waitFor(() => {
      expect(screen.getByTitle('Switch to light mode')).toBeInTheDocument();
    });
  });

  it('should load examples', async () => {
    // Mock fetch to return example content
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () =>
        Promise.resolve(`version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
  api:
    image: node:16
    ports:
      - "3000:3000"
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp`),
    } as Response);

    // Replace window.fetch with our mock
    Object.defineProperty(window, 'fetch', {
      value: mockFetch,
      writable: true,
    });

    render(<App />);

    // Wait for the Examples section to load
    await waitFor(() => {
      expect(screen.getByText('Example Configurations')).toBeInTheDocument();
    });

    // Find the Docker Compose category section
    expect(screen.getByText('Docker Compose')).toBeInTheDocument();

    // Find the Web Application Stack example (which is the Docker Compose example)
    expect(screen.getByText('Web Application Stack')).toBeInTheDocument();

    // Get the textarea before clicking
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');

    // Find and click the Load Example button for the Web Application Stack
    const loadButtons = screen.getAllByText('Load Example');
    expect(loadButtons.length).toBeGreaterThan(0);

    // Click the first Load Example button (Web Application Stack)
    fireEvent.click(loadButtons[0]);

    // Wait for content to be loaded into the textarea
    await waitFor(
      () => {
        expect(textarea.value).toBeTruthy();
        expect(textarea.value).toContain('version:');
      },
      { timeout: 3000 }
    );

    // Verify it's Docker Compose content
    expect(textarea.value).toContain('services:');
    expect(textarea.value).toContain('3.8');
  });

  it('should show validation errors for invalid content', async () => {
    render(<App />);

    // Find the text editor
    const editor = screen.getByRole('textbox');

    // Input invalid content
    fireEvent.change(editor, {
      target: { value: 'invalid: yaml: content: [' },
    });

    // Wait for validation to complete
    await waitFor(
      () => {
        // Should show error message
        expect(screen.getByText(/Error/)).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('should generate diagram from valid Docker Compose content', async () => {
    render(<App />);

    const editor = screen.getByRole('textbox');

    const validDockerCompose = `
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
  database:
    image: postgres:13
    environment:
      POSTGRES_DB: myapp
`;

    fireEvent.change(editor, {
      target: { value: validDockerCompose },
    });

    // Wait for diagram generation
    await waitFor(
      () => {
        expect(
          screen.queryByText('Generating diagram...')
        ).not.toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should handle file upload', async () => {
    render(<App />);

    // Wait for components to load
    await waitFor(() => {
      expect(screen.getByText('Upload Configuration')).toBeInTheDocument();
    });

    const fileInput = screen
      .getByRole('button', { name: /upload file area/i })
      .querySelector('input[type="file"]');

    if (fileInput) {
      const file = new File(
        ['version: "3.8"\nservices:\n  web:\n    image: nginx'],
        'docker-compose.yml',
        {
          type: 'application/x-yaml',
        }
      );

      fireEvent.change(fileInput, {
        target: { files: [file] },
      });

      await waitFor(() => {
        expect(screen.getByDisplayValue(/version:/)).toBeInTheDocument();
      });
    }
  });

  it('should show theme selector', () => {
    render(<App />);

    // Theme selector should be present
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should persist theme preference', () => {
    render(<App />);

    const themeSelector = screen.getByRole('combobox');
    fireEvent.change(themeSelector, { target: { value: 'forest' } });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'aac-theme',
      'forest'
    );
  });

  it('should show export options when diagram is generated', async () => {
    render(<App />);

    const editor = screen.getByRole('textbox');

    const validContent = `
version: '3.8'
services:
  web:
    image: nginx
`;

    fireEvent.change(editor, {
      target: { value: validContent },
    });

    await waitFor(() => {
      // Export buttons should be enabled after diagram generation
      const exportButtons = screen
        .getAllByRole('button')
        .filter(
          button =>
            button.textContent?.includes('SVG') ||
            button.textContent?.includes('PNG') ||
            button.textContent?.includes('Mermaid')
        );
      expect(exportButtons.length).toBeGreaterThan(0);
    });
  });

  it('should show format badge when content is parsed', async () => {
    render(<App />);

    const editor = screen.getByRole('textbox');

    fireEvent.change(editor, {
      target: { value: 'version: "3.8"\nservices:\n  web:\n    image: nginx' },
    });

    await waitFor(() => {
      expect(screen.getByText('docker-compose')).toBeInTheDocument();
    });
  });

  it('should handle different infrastructure formats', async () => {
    render(<App />);

    const editor = screen.getByRole('textbox');

    // Test Kubernetes
    const kubernetesContent = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
`;

    fireEvent.change(editor, {
      target: { value: kubernetesContent },
    });

    await waitFor(() => {
      expect(screen.getByText('kubernetes')).toBeInTheDocument();
    });
  });
});
