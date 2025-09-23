import React, { Suspense } from 'react';
import type { DiagramViewerProps } from '../types';

// Lazy load the DiagramViewer component
const DiagramViewer = React.lazy(() => import('./DiagramViewer'));

// Loading component
const DiagramViewerSkeleton: React.FC = () => (
  <div
    className="relative flex flex-col rounded-lg border min-h-[500px]"
    style={{
      backgroundColor: 'var(--theme-background)',
      borderColor: 'var(--theme-secondary)',
      color: 'var(--theme-text)',
    }}
  >
    {/* Header skeleton */}
    <div
      className="flex items-center justify-between p-3 border-b"
      style={{
        borderColor: 'var(--theme-secondary)',
        backgroundColor: `rgba(107, 114, 128, 0.05)`,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: 'var(--theme-accent)' }}
        />
        <div
          className="h-4 w-24 rounded animate-pulse"
          style={{ backgroundColor: 'var(--theme-secondary)' }}
        />
      </div>
      <div className="flex items-center gap-2">
        {/* Control buttons skeleton */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-md animate-pulse"
            style={{ backgroundColor: 'var(--theme-secondary)' }}
          />
        ))}
      </div>
    </div>

    {/* Content skeleton */}
    <div
      className="flex-1 flex items-center justify-center"
      style={{ backgroundColor: 'var(--theme-background)' }}
    >
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto"
          style={{ borderColor: 'var(--theme-primary)' }}
        />
        <p className="text-sm" style={{ color: 'var(--theme-secondary)' }}>
          Loading diagram viewer...
        </p>
      </div>
    </div>
  </div>
);

// Error boundary for the lazy component
class DiagramViewerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('DiagramViewer lazy loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="relative flex flex-col rounded-lg border min-h-[500px]"
          style={{
            backgroundColor: 'var(--theme-background)',
            borderColor: 'var(--theme-secondary)',
          }}
        >
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--theme-text)' }}
              >
                Failed to Load Diagram Viewer
              </h3>
              <p
                className="text-sm"
                style={{ color: 'var(--theme-secondary)' }}
              >
                There was an error loading the diagram component. Please refresh
                the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main lazy wrapper component
const LazyDiagramViewer: React.FC<DiagramViewerProps> = props => {
  return (
    <DiagramViewerErrorBoundary>
      <Suspense fallback={<DiagramViewerSkeleton />}>
        <DiagramViewer {...props} />
      </Suspense>
    </DiagramViewerErrorBoundary>
  );
};

export default LazyDiagramViewer;
