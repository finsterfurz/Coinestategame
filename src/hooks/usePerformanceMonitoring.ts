// ===================================
// 📊 PERFORMANCE MONITORING HOOK
// ===================================

import { useEffect } from 'react';
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

/**
 * Hook for monitoring web vitals and performance metrics
 */
export const usePerformanceMonitoring = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Monitor Core Web Vitals
      getCLS(metric => {
        console.log('📊 CLS (Cumulative Layout Shift):', metric);
        // Send to analytics service
        // analytics.track('web_vital', { name: 'CLS', value: metric.value });
      });
      
      getFID(metric => {
        console.log('📊 FID (First Input Delay):', metric);
        // analytics.track('web_vital', { name: 'FID', value: metric.value });
      });
      
      getFCP(metric => {
        console.log('📊 FCP (First Contentful Paint):', metric);
        // analytics.track('web_vital', { name: 'FCP', value: metric.value });
      });
      
      getLCP(metric => {
        console.log('📊 LCP (Largest Contentful Paint):', metric);
        // analytics.track('web_vital', { name: 'LCP', value: metric.value });
      });
      
      getTTFB(metric => {
        console.log('📊 TTFB (Time to First Byte):', metric);
        // analytics.track('web_vital', { name: 'TTFB', value: metric.value });
      });
    }
  }, []);
  
  // Performance observer for custom metrics
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('📊 Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              totalTime: entry.loadEventEnd - entry.fetchStart
            });
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);
};

export default usePerformanceMonitoring;