/**
 * Performance Monitoring Utility
 * Tracks loading performance and bundle optimization effectiveness
 */

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
  timeToInteractive?: number;
  bundleLoadTime: number;
  cacheHitRate: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: PerformanceObserver[] = [];
  private bundleStartTime: number = 0;

  constructor() {
    this.bundleStartTime = performance.now();
    this.setupObservers();
    this.measureLoadTimes();
  }

  private setupObservers() {
    // Measure Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      try {
        const lcpObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[
            entries.length - 1
          ] as PerformanceEventTiming;
          this.metrics.largestContentfulPaint = lastEntry.startTime;
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch {
        console.debug('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'first-input') {
              this.metrics.firstInputDelay =
                (entry as PerformanceEventTiming).processingStart -
                entry.startTime;
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch {
        console.debug('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        const clsObserver = new PerformanceObserver(list => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (
              entry.entryType === 'layout-shift' &&
              !(entry as LayoutShift).hadRecentInput
            ) {
              clsValue += (entry as LayoutShift).value;
            }
          });
          this.metrics.cumulativeLayoutShift = Math.max(
            this.metrics.cumulativeLayoutShift || 0,
            clsValue
          );
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch {
        console.debug('CLS observer not supported');
      }

      // Resource loading times
      try {
        const resourceObserver = new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              const resource = entry as PerformanceResourceTiming;
              if (
                resource.name.includes('.js') ||
                resource.name.includes('.css')
              ) {
                console.debug(
                  `Bundle loaded: ${resource.name} in ${resource.duration.toFixed(2)}ms`
                );
              }
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch {
        console.debug('Resource observer not supported');
      }
    }
  }

  private measureLoadTimes() {
    // DOM Content Loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.metrics.domContentLoaded = performance.now();
      });
    } else {
      this.metrics.domContentLoaded = performance.now();
    }

    // Window Load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        this.metrics.loadTime = performance.now();
        this.calculateBundleLoadTime();
      });
    } else {
      this.metrics.loadTime = performance.now();
      this.calculateBundleLoadTime();
    }

    // First Contentful Paint (if available)
    if ('PerformancePaintTiming' in window) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      );
      if (fcpEntry) {
        this.metrics.firstContentfulPaint = fcpEntry.startTime;
      }
    }
  }

  private calculateBundleLoadTime() {
    this.metrics.bundleLoadTime = performance.now() - this.bundleStartTime;
  }

  private calculateCacheHitRate(): number {
    const resources = performance.getEntriesByType(
      'resource'
    ) as PerformanceResourceTiming[];
    const bundleResources = resources.filter(
      r => r.name.includes('.js') || r.name.includes('.css')
    );

    if (bundleResources.length === 0) return 0;

    const cacheHits = bundleResources.filter(
      r => r.transferSize === 0 || r.transferSize < r.encodedBodySize
    ).length;

    return (cacheHits / bundleResources.length) * 100;
  }

  public getMetrics(): PerformanceMetrics {
    this.metrics.cacheHitRate = this.calculateCacheHitRate();

    return {
      loadTime: this.metrics.loadTime || 0,
      domContentLoaded: this.metrics.domContentLoaded || 0,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift,
      firstInputDelay: this.metrics.firstInputDelay,
      timeToInteractive: this.metrics.timeToInteractive,
      bundleLoadTime: this.metrics.bundleLoadTime || 0,
      cacheHitRate: this.metrics.cacheHitRate || 0,
    };
  }

  public logMetrics() {
    const metrics = this.getMetrics();

    console.group('🚀 Performance Metrics');
    console.log(`⏱️  Page Load Time: ${metrics.loadTime.toFixed(2)}ms`);
    console.log(
      `📄 DOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms`
    );
    console.log(`📦 Bundle Load Time: ${metrics.bundleLoadTime.toFixed(2)}ms`);
    console.log(`💾 Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);

    if (metrics.firstContentfulPaint) {
      console.log(
        `🎨 First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`
      );
    }

    if (metrics.largestContentfulPaint) {
      console.log(
        `🖼️  Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(2)}ms`
      );
    }

    if (metrics.firstInputDelay) {
      console.log(
        `🖱️  First Input Delay: ${metrics.firstInputDelay.toFixed(2)}ms`
      );
    }

    if (metrics.cumulativeLayoutShift) {
      console.log(
        `📐 Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(3)}`
      );
    }

    // Performance assessment
    this.assessPerformance(metrics);

    console.groupEnd();
  }

  private assessPerformance(metrics: PerformanceMetrics) {
    console.group('📊 Performance Assessment');

    // Load time assessment
    if (metrics.loadTime < 1000) {
      console.log('✅ Excellent load time (< 1s)');
    } else if (metrics.loadTime < 3000) {
      console.log('🟨 Good load time (< 3s)');
    } else {
      console.log('🔴 Slow load time (> 3s)');
    }

    // LCP assessment
    if (metrics.largestContentfulPaint) {
      if (metrics.largestContentfulPaint < 2500) {
        console.log('✅ Good LCP (< 2.5s)');
      } else if (metrics.largestContentfulPaint < 4000) {
        console.log('🟨 Needs improvement LCP (< 4s)');
      } else {
        console.log('🔴 Poor LCP (> 4s)');
      }
    }

    // FID assessment
    if (metrics.firstInputDelay) {
      if (metrics.firstInputDelay < 100) {
        console.log('✅ Good FID (< 100ms)');
      } else if (metrics.firstInputDelay < 300) {
        console.log('🟨 Needs improvement FID (< 300ms)');
      } else {
        console.log('🔴 Poor FID (> 300ms)');
      }
    }

    // CLS assessment
    if (metrics.cumulativeLayoutShift !== undefined) {
      if (metrics.cumulativeLayoutShift < 0.1) {
        console.log('✅ Good CLS (< 0.1)');
      } else if (metrics.cumulativeLayoutShift < 0.25) {
        console.log('🟨 Needs improvement CLS (< 0.25)');
      } else {
        console.log('🔴 Poor CLS (> 0.25)');
      }
    }

    // Cache performance
    if (metrics.cacheHitRate > 80) {
      console.log('✅ Excellent cache performance (> 80%)');
    } else if (metrics.cacheHitRate > 50) {
      console.log('🟨 Good cache performance (> 50%)');
    } else {
      console.log('🔴 Poor cache performance (< 50%)');
    }

    console.groupEnd();
  }

  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null;

export function initPerformanceMonitoring() {
  if (!performanceMonitor && import.meta.env.DEV) {
    performanceMonitor = new PerformanceMonitor();

    // Log metrics after everything loads
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitor?.logMetrics();
      }, 1000);
    });
  }
}

export function getPerformanceMetrics(): PerformanceMetrics | null {
  return performanceMonitor?.getMetrics() || null;
}

export function destroyPerformanceMonitoring() {
  if (performanceMonitor) {
    performanceMonitor.destroy();
    performanceMonitor = null;
  }
}
