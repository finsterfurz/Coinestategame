import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce, throttle } from 'lodash';

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    memory: 0,
    renderTime: 0,
    componentCount: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let renderTimes: number[] = [];

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;
      
      // Calculate FPS every second
      if (currentTime - lastTime >= 1000) {
        setMetrics(prev => ({
          ...prev,
          fps: Math.round(frameCount * 1000 / (currentTime - lastTime)),
        }));
        frameCount = 0;
        lastTime = currentTime;
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        setMetrics(prev => ({
          ...prev,
          memory: Math.round((performance as any).memory.usedJSHeapSize / 1048576), // MB
        }));
      }

      requestAnimationFrame(measurePerformance);
    };

    // Performance observer for render timing
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'measure') {
            renderTimes.push(entry.duration);
            if (renderTimes.length > 10) {
              renderTimes = renderTimes.slice(-10);
            }
            const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
            setMetrics(prev => ({
              ...prev,
              renderTime: Math.round(avgRenderTime * 100) / 100,
            }));
          }
        });
      });

      observer.observe({ entryTypes: ['measure'] });

      // Start measuring
      requestAnimationFrame(measurePerformance);

      return () => {
        observer.disconnect();
      };
    }

    requestAnimationFrame(measurePerformance);
  }, []);

  return metrics;
};

/**
 * Optimized asset loader with caching
 */
export class AssetLoader {
  private static instance: AssetLoader;
  private cache = new Map<string, any>();
  private loadingPromises = new Map<string, Promise<any>>();

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader();
    }
    return AssetLoader.instance;
  }

  async loadImage(url: string, priority: 'high' | 'normal' | 'low' = 'normal'): Promise<HTMLImageElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url);
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      // Set priority hint for modern browsers
      if ('loading' in img) {
        img.loading = priority === 'high' ? 'eager' : 'lazy';
      }
      
      img.onload = () => {
        this.cache.set(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = (error) => {
        this.loadingPromises.delete(url);
        reject(error);
      };
      
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  async loadAudio(url: string): Promise<HTMLAudioElement> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        this.cache.set(url, audio);
        resolve(audio);
      };
      
      audio.onerror = reject;
      audio.src = url;
    });
  }

  preloadAssets(urls: string[]): Promise<any[]> {
    return Promise.all(
      urls.map(url => {
        if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return this.loadImage(url, 'high');
        } else if (url.match(/\.(mp3|wav|ogg)$/i)) {
          return this.loadAudio(url);
        }
        return Promise.resolve(null);
      })
    );
  }

  clearCache(): void {
    this.cache.clear();
    this.loadingPromises.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

/**
 * Virtual scrolling hook for large lists
 */
export const useVirtualScrolling = (
  items: any[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.startIndex + index) * itemHeight,
        height: itemHeight,
      },
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback(
    throttle((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, 16), // ~60fps
    []
  );

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  };
};

/**
 * Optimized game state updates
 */
export const useOptimizedGameState = () => {
  const [updateQueue, setUpdateQueue] = useState<Array<() => void>>([]);
  
  const debouncedFlush = useCallback(
    debounce(() => {
      setUpdateQueue(queue => {
        queue.forEach(update => update());
        return [];
      });
    }, 16), // Batch updates every frame
    []
  );

  const queueUpdate = useCallback((updateFn: () => void) => {
    setUpdateQueue(prev => [...prev, updateFn]);
    debouncedFlush();
  }, [debouncedFlush]);

  return { queueUpdate };
};

/**
 * Memory management utilities
 */
export class MemoryManager {
  private static cleanupTasks: Array<() => void> = [];

  static addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  static cleanup(): void {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  static monitorMemory(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
      
      console.log(`Memory usage: ${usedMB}MB / ${limitMB}MB`);
      
      // Trigger cleanup if memory usage is high
      if (usedMB / limitMB > 0.8) {
        this.cleanup();
        
        // Force garbage collection in development
        if (process.env.NODE_ENV === 'development' && 'gc' in window) {
          (window as any).gc();
        }
      }
    }
  }
}

/**
 * Optimized animation hook
 */
export const useOptimizedAnimation = (
  callback: (progress: number) => void,
  duration: number,
  easing: (t: number) => number = (t: number) => t
) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  const start = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    startTimeRef.current = performance.now();
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) return;
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      callback(easedProgress);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  }, [callback, duration, easing, isAnimating]);

  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return { start, stop, isAnimating };
};

/**
 * Intersection Observer hook for lazy loading
 */
export const useIntersectionObserver = (
  targetRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(target);

    return () => {
      observer.unobserve(target);
      observer.disconnect();
    };
  }, [targetRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

/**
 * Bundle splitting utilities
 */
export const loadChunk = async (chunkName: string): Promise<any> => {
  try {
    switch (chunkName) {
      case 'analytics':
        return import('../components/AnalyticsDashboard');
      case 'marketplace':
        return import('../components/Marketplace');
      case 'quests':
        return import('../components/QuestSystem');
      case 'weather':
        return import('../components/WeatherSystem');
      default:
        throw new Error(`Unknown chunk: ${chunkName}`);
    }
  } catch (error) {
    console.error(`Failed to load chunk ${chunkName}:`, error);
    throw error;
  }
};

/**
 * Service Worker utilities
 */
export class ServiceWorkerManager {
  private static registration: ServiceWorkerRegistration | null = null;

  static async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      this.registration = registration;

      // Update handling
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  static async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  static async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private static notifyUpdate(): void {
    // Notify user about update
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }
}

/**
 * Cache management
 */
export class CacheManager {
  private static cache: Cache | null = null;

  static async init(): Promise<void> {
    if ('caches' in window) {
      this.cache = await caches.open('game-cache-v1');
    }
  }

  static async set(key: string, data: any): Promise<void> {
    if (!this.cache) return;

    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });

    await this.cache.put(key, response);
  }

  static async get(key: string): Promise<any> {
    if (!this.cache) return null;

    const response = await this.cache.match(key);
    if (response) {
      return response.json();
    }
    return null;
  }

  static async clear(): Promise<void> {
    if (this.cache) {
      const keys = await this.cache.keys();
      await Promise.all(keys.map(key => this.cache!.delete(key)));
    }
  }
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Set up memory monitoring
  setInterval(() => {
    MemoryManager.monitorMemory();
  }, 30000); // Check every 30 seconds

  // Initialize cache manager
  CacheManager.init();

  // Register service worker
  ServiceWorkerManager.register();
}
