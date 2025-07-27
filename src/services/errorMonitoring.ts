// Error Monitoring and Performance Tracking with Sentry
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { analytics } from './analytics';

// Error severity levels
export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// Error context interface
export interface ErrorContext {
  userId?: string;
  walletAddress?: string;
  gameState?: {
    characters: number;
    luncBalance: number;
    currentPage: string;
    buildingLevel: number;
  };
  userAgent?: string;
  url?: string;
  timestamp?: number;
  sessionId?: string;
}

// Enhanced error interface
export interface GameError extends Error {
  code?: string;
  context?: ErrorContext;
  severity?: ErrorSeverity;
  recoverable?: boolean;
  retryable?: boolean;
}

// Error monitoring configuration
const initializeErrorMonitoring = () => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    console.warn('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      new BrowserTracing({
        // Set up automatic route change tracking for React Router
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay({
        // Capture 10% of all sessions,
        // plus 100% of sessions with an error
        sessionSampleRate: 0.1,
        errorSampleRate: 1.0,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Release tracking
    release: process.env.REACT_APP_VERSION || '2.1.0',
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Error (dev mode):', event, hint);
        return null;
      }

      // Filter out common browser errors that aren't actionable
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        
        // Skip network errors that are user-related
        if (message.includes('NetworkError') || 
            message.includes('Failed to fetch') ||
            message.includes('Load failed')) {
          return null;
        }

        // Skip extension-related errors
        if (message.includes('extension') || 
            message.includes('chrome-extension')) {
          return null;
        }
      }

      return event;
    },

    // Custom tags
    initialScope: {
      tags: {
        component: 'virtual-building-empire',
        feature: 'game',
      },
    },
  });

  // Set up global context
  Sentry.setContext('game', {
    version: process.env.REACT_APP_VERSION || '2.1.0',
    build: process.env.REACT_APP_BUILD_ID || 'development',
  });
};

// Main Error Monitoring Service
export class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    initializeErrorMonitoring();
    this.setupGlobalErrorHandlers();
    this.isInitialized = true;
  }

  // Capture an error with enhanced context
  captureError(error: Error | GameError, context?: ErrorContext, severity: ErrorSeverity = 'error') {
    // Add game-specific context
    const enhancedContext: ErrorContext = {
      ...context,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Set Sentry context
    Sentry.withScope((scope) => {
      scope.setLevel(severity);
      scope.setContext('error_details', enhancedContext);
      
      if (enhancedContext.userId) {
        scope.setUser({ id: enhancedContext.userId });
      }

      if (enhancedContext.gameState) {
        scope.setContext('game_state', enhancedContext.gameState);
      }

      // Add custom tags
      scope.setTag('error_category', this.categorizeError(error));
      scope.setTag('recoverable', (error as GameError).recoverable || false);
      scope.setTag('retryable', (error as GameError).retryable || false);

      Sentry.captureException(error);
    });

    // Also track in analytics
    analytics.trackError({
      error: error.message,
      context: context?.currentPage || 'unknown',
      severity,
      additionalInfo: enhancedContext,
    });
  }

  // Capture a message/warning
  captureMessage(message: string, level: ErrorSeverity = 'info', context?: ErrorContext) {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      
      if (context) {
        scope.setContext('message_context', context);
      }

      Sentry.captureMessage(message);
    });
  }

  // Set user context
  setUser(user: { id: string; email?: string; walletAddress?: string }) {
    Sentry.setUser(user);
  }

  // Set custom context
  setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }

  // Add breadcrumb for debugging
  addBreadcrumb(message: string, category: string, data?: any, level: ErrorSeverity = 'info') {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level,
      timestamp: Date.now() / 1000,
    });
  }

  // Game-specific error tracking methods
  trackWeb3Error(error: Error, operation: string, walletAddress?: string) {
    this.captureError(error, {
      walletAddress,
      currentPage: 'web3_operation',
      gameState: this.getCurrentGameState(),
    }, 'error');

    this.addBreadcrumb(
      `Web3 operation failed: ${operation}`,
      'web3',
      { operation, walletAddress, error: error.message },
      'error'
    );
  }

  trackApiError(error: Error, endpoint: string, method: string, statusCode?: number) {
    this.captureError(error, {
      currentPage: 'api_call',
      gameState: this.getCurrentGameState(),
    }, 'error');

    this.addBreadcrumb(
      `API call failed: ${method} ${endpoint}`,
      'api',
      { endpoint, method, statusCode, error: error.message },
      'error'
    );
  }

  trackGameplayError(error: Error, action: string, characterId?: string) {
    this.captureError(error, {
      currentPage: 'gameplay',
      gameState: this.getCurrentGameState(),
    }, 'error');

    this.addBreadcrumb(
      `Gameplay error during: ${action}`,
      'gameplay',
      { action, characterId, error: error.message },
      'error'
    );
  }

  trackPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      this.captureMessage(
        `Performance issue: ${metric} exceeded threshold`,
        'warning',
        { 
          currentPage: window.location.pathname,
          gameState: this.getCurrentGameState(),
        }
      );

      this.addBreadcrumb(
        `Performance warning: ${metric}`,
        'performance',
        { metric, value, threshold },
        'warning'
      );
    }
  }

  // Private helper methods
  private setupGlobalErrorHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { currentPage: window.location.pathname },
        'error'
      );
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      this.captureError(
        event.error || new Error(event.message),
        { 
          currentPage: window.location.pathname,
          url: event.filename,
        },
        'error'
      );
    });
  }

  private categorizeError(error: Error): string {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('wallet') || message.includes('metamask')) {
      return 'web3';
    }
    if (message.includes('character') || message.includes('lunc')) {
      return 'gameplay';
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'auth';
    }
    if (message.includes('storage') || message.includes('localstorage')) {
      return 'storage';
    }
    
    return 'unknown';
  }

  private getCurrentGameState() {
    try {
      // This would get the current game state from your store
      const gameData = localStorage.getItem('family_data');
      if (gameData) {
        const parsed = JSON.parse(gameData);
        return {
          characters: parsed.familySize || 0,
          luncBalance: parsed.totalLunc || 0,
          currentPage: window.location.pathname,
          buildingLevel: 1, // This would come from building data
        };
      }
    } catch (error) {
      console.warn('Failed to get game state for error context:', error);
    }
    
    return {
      characters: 0,
      luncBalance: 0,
      currentPage: window.location.pathname,
      buildingLevel: 0,
    };
  }
}

// React Error Boundary with Sentry integration
export const SentryErrorBoundary = Sentry.withErrorBoundary(
  ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  },
  {
    fallback: ({ error, resetError }) => (
      <div className="error-boundary">
        <div className="error-container">
          <h2>🚨 Something went wrong</h2>
          <p>We've been notified about this error and are working on a fix.</p>
          <details className="error-details">
            <summary>Error Details</summary>
            <pre>{error.message}</pre>
          </details>
          <div className="error-actions">
            <button onClick={resetError} className="btn btn-primary">
              Try Again
            </button>
            <button onClick={() => window.location.reload()} className="btn btn-secondary">
              Reload Page
            </button>
          </div>
        </div>
      </div>
    ),
    beforeCapture: (scope, error, errorInfo) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      scope.setContext('gameState', ErrorMonitoringService.getInstance().getCurrentGameState());
    },
  }
);

// React Hook for error monitoring
export const useErrorMonitoring = () => {
  const errorMonitoring = ErrorMonitoringService.getInstance();

  const captureError = (error: Error, context?: ErrorContext, severity?: ErrorSeverity) => {
    errorMonitoring.captureError(error, context, severity);
  };

  const captureMessage = (message: string, level?: ErrorSeverity, context?: ErrorContext) => {
    errorMonitoring.captureMessage(message, level, context);
  };

  const addBreadcrumb = (message: string, category: string, data?: any) => {
    errorMonitoring.addBreadcrumb(message, category, data);
  };

  const trackWeb3Error = (error: Error, operation: string, walletAddress?: string) => {
    errorMonitoring.trackWeb3Error(error, operation, walletAddress);
  };

  const trackApiError = (error: Error, endpoint: string, method: string, statusCode?: number) => {
    errorMonitoring.trackApiError(error, endpoint, method, statusCode);
  };

  const trackGameplayError = (error: Error, action: string, characterId?: string) => {
    errorMonitoring.trackGameplayError(error, action, characterId);
  };

  const setUser = (user: { id: string; email?: string; walletAddress?: string }) => {
    errorMonitoring.setUser(user);
  };

  return {
    captureError,
    captureMessage,
    addBreadcrumb,
    trackWeb3Error,
    trackApiError,
    trackGameplayError,
    setUser,
  };
};

// Performance monitoring
export const performanceMonitoring = {
  startTransaction: (name: string, operation: string) => {
    return Sentry.startTransaction({ name, op: operation });
  },

  measureFunction: <T extends any[], R>(
    fn: (...args: T) => R,
    name: string,
    operation: string = 'function'
  ) => {
    return (...args: T): R => {
      const transaction = Sentry.startTransaction({ name, op: operation });
      try {
        const result = fn(...args);
        transaction.setStatus('ok');
        return result;
      } catch (error) {
        transaction.setStatus('internal_error');
        throw error;
      } finally {
        transaction.finish();
      }
    };
  },

  measureAsync: async <T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    name: string,
    operation: string = 'async_function'
  ) => {
    return async (...args: T): Promise<R> => {
      const transaction = Sentry.startTransaction({ name, op: operation });
      try {
        const result = await fn(...args);
        transaction.setStatus('ok');
        return result;
      } catch (error) {
        transaction.setStatus('internal_error');
        throw error;
      } finally {
        transaction.finish();
      }
    };
  },
};

// Singleton instance
export const errorMonitoring = ErrorMonitoringService.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  errorMonitoring.initialize();
}

// Export React components
import React from 'react';
import { useLocation, useNavigationType, createRoutesFromChildren, matchRoutes } from 'react-router-dom';

export { SentryErrorBoundary };
