import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  // Mock ResizeObserver for mermaid
  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  });

  // Mock HTMLCanvasElement.getContext for mermaid
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    writable: true,
    value: vi.fn().mockReturnValue({
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
    }),
  });
});
