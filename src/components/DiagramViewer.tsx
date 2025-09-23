import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  AlertCircle,
  Download,
  Move,
} from 'lucide-react';
import type { DiagramViewerProps } from '../types';

const DiagramViewer: React.FC<DiagramViewerProps> = ({
  mermaidCode,
  theme,
  onExport,
  isLoading = false,
  error,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const [diagramId] = useState(
    () => `diagram-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Initialize mermaid
  useEffect(() => {
    // Map our theme names to mermaid theme names
    const getMermaidTheme = (themeName: string) => {
      switch (themeName) {
        case 'dark':
          return 'dark';
        case 'forest':
          return 'forest';
        case 'neutral':
          return 'neutral';
        case 'base':
          return 'base';
        default:
          return 'default';
      }
    };

    mermaid.initialize({
      startOnLoad: false,
      theme: getMermaidTheme(theme) as
        | 'default'
        | 'base'
        | 'dark'
        | 'forest'
        | 'neutral',
      securityLevel: 'loose',
      fontFamily: 'system-ui, sans-serif',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
      },
      sequence: {
        useMaxWidth: false,
      },
      themeVariables: {
        primaryColor:
          theme === 'dark'
            ? '#3b82f6'
            : theme === 'forest'
              ? '#22c55e'
              : theme === 'neutral'
                ? '#525252'
                : theme === 'base'
                  ? '#dc2626'
                  : '#0ea5e9',
        primaryTextColor:
          theme === 'dark'
            ? '#f3f4f6'
            : theme === 'forest'
              ? '#14532d'
              : theme === 'neutral'
                ? '#171717'
                : theme === 'base'
                  ? '#7f1d1d'
                  : '#1e293b',
        lineColor:
          theme === 'dark'
            ? '#6b7280'
            : theme === 'forest'
              ? '#16a34a'
              : theme === 'neutral'
                ? '#737373'
                : theme === 'base'
                  ? '#991b1b'
                  : '#64748b',
      },
    });
  }, [theme]);

  // Update diagram transform when zoom or pan changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const diagramDiv = container.querySelector(
      '.mermaid-diagram'
    ) as HTMLElement;
    if (diagramDiv) {
      diagramDiv.style.transform = `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`;
    }
  }, [zoom, pan]);

  // Render diagram when mermaidCode or theme changes
  useEffect(() => {
    if (!mermaidCode || !containerRef.current || isLoading) return;

    const renderDiagram = async () => {
      const container = containerRef.current;
      if (!container) return;

      try {
        // Clear previous diagram
        container.innerHTML = '';

        // Create a wrapper for the diagram
        const diagramWrapper = document.createElement('div');
        diagramWrapper.className = 'diagram-wrapper';
        diagramWrapper.style.cssText = `
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 400px;
          overflow: hidden;
          cursor: ${panMode ? 'grab' : 'default'};
          background: transparent;
          border-radius: 8px;
        `;

        // Create a div for the diagram
        const diagramDiv = document.createElement('div');
        diagramDiv.className = 'mermaid-diagram';
        diagramDiv.style.cssText = `
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          transform: scale(${zoom}) translate(${pan.x}px, ${pan.y}px);
          transform-origin: center;
          transition: transform 0.2s ease-out;
          box-sizing: border-box;
        `;

        diagramWrapper.appendChild(diagramDiv);
        container.appendChild(diagramWrapper);

        // Render the diagram
        const { svg } = await mermaid.render(diagramId, mermaidCode);
        diagramDiv.innerHTML = svg;

        // Apply smooth animations
        diagramDiv.style.transition = 'transform 0.2s ease-out';

        // Style the SVG for better viewing
        const svgElement = diagramDiv.querySelector('svg');
        if (svgElement) {
          svgElement.style.cssText = `
            max-width: 100%;
            height: auto;
            display: block;
            background: transparent;
          `;

          // Set viewBox if not present for better scaling
          if (!svgElement.getAttribute('viewBox')) {
            const width = svgElement.getAttribute('width') || '800';
            const height = svgElement.getAttribute('height') || '600';
            svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
          }
        }

        // Add pan and zoom event listeners
        const addEventListeners = () => {
          let isMouseDown = false;
          let startPos = { x: 0, y: 0 };
          let startPan = { x: 0, y: 0 };

          const handleMouseDown = (e: MouseEvent) => {
            if (panMode) {
              isMouseDown = true;
              startPos = { x: e.clientX, y: e.clientY };
              startPan = { ...pan };
              diagramWrapper.style.cursor = 'grabbing';
              diagramDiv.style.transition = 'none'; // Disable transition during drag
              e.preventDefault();
            }
          };

          const handleMouseMove = (e: MouseEvent) => {
            if (isMouseDown && panMode) {
              const deltaX = (e.clientX - startPos.x) / zoom;
              const deltaY = (e.clientY - startPos.y) / zoom;
              const newPan = {
                x: startPan.x + deltaX,
                y: startPan.y + deltaY,
              };
              setPan(newPan);

              // Apply transform immediately for smooth dragging
              diagramDiv.style.transform = `scale(${zoom}) translate(${newPan.x}px, ${newPan.y}px)`;
            }
          };

          const handleMouseUp = () => {
            if (isMouseDown) {
              isMouseDown = false;
              diagramWrapper.style.cursor = panMode ? 'grab' : 'default';
              diagramDiv.style.transition = 'transform 0.2s ease-out'; // Re-enable transition
            }
          };

          const handleWheel = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? -0.1 : 0.1;
              const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
              setZoom(newZoom);

              // Apply transform immediately for smooth zooming
              diagramDiv.style.transform = `scale(${newZoom}) translate(${pan.x}px, ${pan.y}px)`;
            }
          };

          diagramWrapper.addEventListener('mousedown', handleMouseDown);
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          diagramWrapper.addEventListener('wheel', handleWheel);

          // Cleanup function
          return () => {
            diagramWrapper.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            diagramWrapper.removeEventListener('wheel', handleWheel);
          };
        };

        addEventListeners();
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const container = containerRef.current;
        if (container) {
          container.innerHTML = `
            <div class="flex items-center justify-center p-8 text-red-600 dark:text-red-400 h-full">
              <div class="text-center">
                <div class="flex justify-center mb-2">
                  <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p class="font-medium">Failed to render diagram</p>
                <p class="text-sm mt-1 opacity-75">${(err as Error).message}</p>
              </div>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [mermaidCode, theme, zoom, pan, diagramId, isLoading, panMode]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.2, 5);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.2, 0.1);
    setZoom(newZoom);
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const togglePanMode = () => {
    setPanMode(prev => !prev);
    if (panMode) {
      setPan({ x: 0, y: 0 });
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const handleExport = () => {
    if (onExport) {
      onExport({
        format: 'svg',
        filename: 'diagram',
        theme,
      });
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <div className="text-center p-8">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 dark:text-red-400 mb-2">
            Diagram Generation Failed
          </h3>
          <p className="text-red-700 dark:text-red-400 text-sm max-w-md">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col transition-colors duration-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'rounded-lg border min-h-[500px]'
      }`}
      style={{
        backgroundColor: 'var(--theme-background)',
        borderColor: 'var(--theme-secondary)',
        color: 'var(--theme-text)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 border-b transition-colors duration-200"
        style={{
          borderColor: 'var(--theme-secondary)',
          backgroundColor: `rgba(107, 114, 128, 0.05)`,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--theme-accent)' }}
          ></div>
          <span className="font-medium" style={{ color: 'var(--theme-text)' }}>
            Diagram Viewer
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Pan mode toggle */}
          <button
            onClick={togglePanMode}
            className={`p-2 rounded-md transition-colors duration-200`}
            style={{
              backgroundColor: panMode ? 'var(--theme-primary)' : 'transparent',
              color: panMode ? 'white' : 'var(--theme-text)',
            }}
            onMouseEnter={e => {
              if (!panMode) {
                e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
              }
            }}
            onMouseLeave={e => {
              if (!panMode) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title={
              panMode
                ? 'Exit pan mode'
                : 'Enter pan mode (drag to move diagram)'
            }
          >
            <Move className="h-4 w-4" />
          </button>

          {/* Zoom controls */}
          <div
            className="flex items-center gap-1 rounded-md border transition-colors duration-200"
            style={{
              backgroundColor: 'var(--theme-background)',
              borderColor: 'var(--theme-secondary)',
            }}
          >
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 0.1}
              className="p-1 rounded-l-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--theme-text)' }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <button
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-medium border-x transition-colors duration-200"
              style={{
                borderColor: 'var(--theme-secondary)',
                color: 'var(--theme-text)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Reset zoom and position"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="p-1 rounded-r-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ color: 'var(--theme-text)' }}
              onMouseEnter={e => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Export button */}
          {onExport && (
            <button
              onClick={handleExport}
              className="p-2 rounded-md transition-colors duration-200"
              style={{
                color: 'var(--theme-text)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Export Diagram"
            >
              <Download className="h-4 w-4" />
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-md transition-colors duration-200"
            style={{
              color: 'var(--theme-text)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = `rgba(107, 114, 128, 0.1)`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-background)',
          minHeight: '400px',
        }}
      >
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4"
                style={{ borderColor: 'var(--theme-primary)' }}
              ></div>
              <p style={{ color: 'var(--theme-secondary)' }}>
                Generating diagram...
              </p>
            </div>
          </div>
        ) : !mermaidCode ? (
          <div
            className="h-full flex items-center justify-center"
            style={{ color: 'var(--theme-secondary)' }}
          >
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-lg font-medium mb-2">No diagram to display</p>
              <p className="text-sm">
                Upload a file or paste code to generate a diagram
              </p>
            </div>
          </div>
        ) : (
          <div
            ref={containerRef}
            className="w-full h-full transition-colors duration-200"
            style={{
              minHeight: '400px',
              height: '500px',
              backgroundColor: 'var(--theme-background)',
            }}
          />
        )}

        {/* Navigation hint */}
        {mermaidCode && !isLoading && !error && (
          <div
            className="absolute bottom-4 left-4 text-xs px-3 py-2 rounded-lg opacity-90 pointer-events-none transition-all duration-200"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              backdropFilter: 'blur(4px)',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              {panMode ? (
                <span>
                  Drag to pan • Ctrl+Scroll to zoom • Zoom:{' '}
                  {Math.round(zoom * 100)}%
                </span>
              ) : (
                <span>
                  Enable pan mode to navigate • Ctrl+Scroll to zoom • Zoom:{' '}
                  {Math.round(zoom * 100)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      {mermaidCode && !isLoading && !error && (
        <div
          className="p-2 border-t transition-colors duration-200"
          style={{
            borderColor: 'var(--theme-secondary)',
            backgroundColor: `rgba(107, 114, 128, 0.05)`,
          }}
        >
          <div
            className="flex items-center justify-between text-xs"
            style={{ color: 'var(--theme-secondary)' }}
          >
            <span>Theme: {theme || 'default'}</span>
            <span>Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagramViewer;
