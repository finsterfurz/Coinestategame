import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

interface AnalyticsData {
  name: string;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private analytics: AnalyticsData[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.REACT_APP_ENABLE_WEB_VITALS === 'true';
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private sendToAnalytics(metric: AnalyticsData): void {
    if (!this.isEnabled) return;

    // Store locally
    this.analytics.push(metric);

    // Send to analytics service in production
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', metric.name, {
          metric_value: metric.value,
          metric_rating: metric.rating,
          custom_parameter_1: metric.id,
        });
      }

      // Send to your analytics endpoint
      fetch('/api/analytics/web-vitals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      }).catch(error => {
        console.warn('Failed to send analytics:', error);
      });
    }

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Web Vital:', metric);
    }
  }

  private createMetric(metric: any): AnalyticsData {
    return {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  initWebVitals(): void {
    if (!this.isEnabled) return;

    // Largest Contentful Paint
    getLCP((metric) => {
      this.sendToAnalytics(this.createMetric(metric));
    });

    // First Input Delay
    getFID((metric) => {
      this.sendToAnalytics(this.createMetric(metric));
    });

    // Cumulative Layout Shift
    getCLS((metric) => {
      this.sendToAnalytics(this.createMetric(metric));
    });

    // First Contentful Paint
    getFCP((metric) => {
      this.sendToAnalytics(this.createMetric(metric));
    });

    // Time to First Byte
    getTTFB((metric) => {
      this.sendToAnalytics(this.createMetric(metric));
    });
  }

  // Game-specific metrics
  trackGameEvent(event: string, data: any): void {
    if (!this.isEnabled) return;

    const gameMetric: AnalyticsData = {
      name: `game_${event}`,
      value: data.value || 1,
      id: `game_${Date.now()}`,
      rating: 'good',
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Add game-specific data
    Object.assign(gameMetric, data);

    this.sendToAnalytics(gameMetric);
  }

  trackUserInteraction(action: string, element: string, value?: number): void {
    this.trackGameEvent('user_interaction', {
      action,
      element,
      value: value || 1,
    });
  }

  trackPerformance(operation: string, duration: number): void {
    this.trackGameEvent('performance', {
      operation,
      value: duration,
      rating: duration < 1000 ? 'good' : duration < 3000 ? 'needs-improvement' : 'poor',
    });
  }

  getAnalytics(): AnalyticsData[] {
    return [...this.analytics];
  }

  clearAnalytics(): void {
    this.analytics = [];
  }
}

// Hooks for React components
import { useEffect } from 'react';

export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    monitor.initWebVitals();
  }, [monitor]);

  return {
    trackGameEvent: monitor.trackGameEvent.bind(monitor),
    trackUserInteraction: monitor.trackUserInteraction.bind(monitor),
    trackPerformance: monitor.trackPerformance.bind(monitor),
    getAnalytics: monitor.getAnalytics.bind(monitor),
  };
};

// Higher-order component for automatic performance tracking
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const { trackPerformance } = usePerformanceMonitor();

    useEffect(() => {
      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        trackPerformance(`component_render_${componentName}`, endTime - startTime);
      };
    }, [trackPerformance]);

    return <Component {...props} />;
  };
};

// Performance monitoring utilities
export const measureAsyncOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> => {
  const monitor = PerformanceMonitor.getInstance();
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    monitor.trackPerformance(operationName, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    monitor.trackPerformance(`${operationName}_error`, duration);
    throw error;
  }
};

// Bundle size monitoring
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV !== 'development') return;

  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

  console.group('📦 Bundle Analysis');
  console.log('Script files:', scripts.length);
  console.log('Stylesheet files:', styles.length);
  
  // Calculate approximate bundle size
  const totalScripts = scripts.reduce((acc, script) => {
    const src = (script as HTMLScriptElement).src;
    if (src.includes('/static/js/')) {
      return acc + 1;
    }
    return acc;
  }, 0);

  console.log('React bundle chunks:', totalScripts);
  console.groupEnd();
};

// Memory usage monitoring
export const monitorMemoryUsage = (): void => {
  if (!('memory' in performance)) return;

  const memory = (performance as any).memory;
  const monitor = PerformanceMonitor.getInstance();

  monitor.trackGameEvent('memory_usage', {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    limit: memory.jsHeapSizeLimit,
    percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
  });
};

// Error tracking
export const trackError = (error: Error, context: string): void => {
  const monitor = PerformanceMonitor.getInstance();

  monitor.trackGameEvent('error', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: Date.now(),
  });

  // Send to error reporting service
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    // Sentry integration would go here
    console.error('Error tracked:', error, context);
  }
};

// Initialize performance monitoring
export const initPerformanceMonitoring = (): void => {
  const monitor = PerformanceMonitor.getInstance();
  monitor.initWebVitals();

  // Monitor memory usage every 30 seconds
  setInterval(monitorMemoryUsage, 30000);

  // Analyze bundle on load
  if (document.readyState === 'complete') {
    analyzeBundleSize();
  } else {
    window.addEventListener('load', analyzeBundleSize);
  }
};

export default PerformanceMonitor;