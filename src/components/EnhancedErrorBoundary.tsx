import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useGameStore } from '../store/gameStore';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Add error to game store notifications
    const addNotification = useGameStore.getState().addNotification;
    addNotification({
      type: 'error',
      title: `${level.charAt(0).toUpperCase() + level.slice(1)} Error`,
      message: this.getErrorMessage(error, level),
      read: false,
    });

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }

    // Send error to monitoring service (in production)
    this.reportError(error, errorInfo, level);
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(clearTimeout);
  }

  private getErrorMessage(error: Error, level: string): string {
    const messages = {
      page: 'Ein Fehler ist auf dieser Seite aufgetreten. Die Seite wird automatisch neu geladen.',
      component: 'Ein Komponenten-Fehler ist aufgetreten. Bitte versuche es erneut.',
      critical: 'Ein kritischer Fehler ist aufgetreten. Das Spiel wird neu gestartet.',
    };

    return messages[level as keyof typeof messages] || messages.component;
  }

  private reportError(error: Error, errorInfo: ErrorInfo, level: string) {
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      try {
        // Example: Send to Sentry, LogRocket, or custom service
        const errorReport = {
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          level,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: useGameStore.getState().walletAddress,
          gameState: {
            characterCount: useGameStore.getState().getCharacterCount(),
            luncBalance: useGameStore.getState().luncBalance,
            currentView: useGameStore.getState().currentView,
          },
        };

        // Send to monitoring service
        fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorReport),
        }).catch(console.error);
        
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }

  private handleRetry = () => {
    const { level = 'component' } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= this.maxRetries) {
      // Max retries reached, escalate or reload
      if (level === 'critical') {
        window.location.reload();
        return;
      }
      
      useGameStore.getState().addNotification({
        type: 'error',
        title: 'Maximale Wiederholungen erreicht',
        message: 'Der Fehler konnte nicht behoben werden. Bitte lade die Seite neu.',
        read: false,
      });
      return;
    }

    // Increment retry count
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
    }));

    // Add delay before retry (exponential backoff)
    const delay = Math.pow(2, retryCount) * 1000;
    const timeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });

      useGameStore.getState().addNotification({
        type: 'info',
        title: 'Fehler-Wiederholung',
        message: `Versuch ${retryCount + 1} von ${this.maxRetries}...`,
        read: false,
      });
    }, delay);

    this.retryTimeouts.push(timeout);
  };

  private handleReport = () => {
    const { error, errorInfo, errorId } = this.state;
    if (!error || !errorInfo) return;

    // Create detailed error report
    const reportData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      gameState: useGameStore.getState(),
      browserInfo: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))
      .then(() => {
        useGameStore.getState().addNotification({
          type: 'success',
          title: 'Fehlerbericht kopiert',
          message: 'Der Fehlerbericht wurde in die Zwischenablage kopiert.',
          read: false,
        });
      })
      .catch(() => {
        console.error('Failed to copy error report');
      });
  };

  render() {
    const { hasError, error, errorInfo, retryCount } = this.state;
    const { children, fallback, level = 'component', isolate = false } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo!, this.handleRetry);
      }

      // Default error UI based on level
      return (
        <div className={`error-boundary error-boundary--${level}`}>
          <div className="error-boundary__container">
            <div className="error-boundary__icon">
              {level === 'critical' ? '💥' : level === 'page' ? '🚫' : '⚠️'}
            </div>
            
            <div className="error-boundary__content">
              <h2 className="error-boundary__title">
                {level === 'critical' 
                  ? 'Kritischer Fehler'
                  : level === 'page'
                  ? 'Seiten-Fehler'
                  : 'Etwas ist schief gelaufen'
                }
              </h2>
              
              <p className="error-boundary__message">
                {this.getErrorMessage(error, level)}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="error-boundary__details">
                  <summary>Technische Details (Development)</summary>
                  <pre className="error-boundary__stack">
                    {error.message}
                    {'\n\n'}
                    {error.stack}
                    {errorInfo?.componentStack && (
                      <>
                        {'\n\nComponent Stack:'}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}

              <div className="error-boundary__actions">
                {retryCount < this.maxRetries && (
                  <button 
                    className="btn btn--primary"
                    onClick={this.handleRetry}
                    disabled={retryCount >= this.maxRetries}
                  >
                    {retryCount > 0 
                      ? `Erneut versuchen (${retryCount}/${this.maxRetries})`
                      : 'Erneut versuchen'
                    }
                  </button>
                )}

                <button 
                  className="btn btn--secondary"
                  onClick={() => window.location.reload()}
                >
                  Seite neu laden
                </button>

                <button 
                  className="btn btn--ghost"
                  onClick={this.handleReport}
                  title="Fehlerbericht in Zwischenablage kopieren"
                >
                  📋 Fehlerbericht
                </button>
              </div>

              {level === 'critical' && (
                <div className="error-boundary__warning">
                  <strong>Hinweis:</strong> Deine Spieldaten sind sicher gespeichert 
                  und werden nach einem Neuladen wiederhergestellt.
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Wrap children in isolating container if requested
    if (isolate) {
      return (
        <div className="error-boundary__isolation">
          {children}
        </div>
      );
    }

    return children;
  }
}

// Convenience wrapper components for different error levels
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="page" isolate>
    {children}
  </EnhancedErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="component">
    {children}
  </EnhancedErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <EnhancedErrorBoundary level="critical">
    {children}
  </EnhancedErrorBoundary>
);

// Hook for programmatic error handling
export const useErrorHandler = () => {
  const addNotification = useGameStore(state => state.addNotification);

  const handleError = React.useCallback((
    error: Error,
    context?: string,
    level: 'info' | 'warning' | 'error' = 'error'
  ) => {
    console.error(`Error in ${context || 'application'}:`, error);

    addNotification({
      type: level,
      title: context ? `Fehler in ${context}` : 'Anwendungsfehler',
      message: error.message || 'Ein unbekannter Fehler ist aufgetreten.',
      read: false,
    });
  }, [addNotification]);

  const handleAsyncError = React.useCallback(async (
    asyncFn: () => Promise<any>,
    context?: string
  ) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      throw error; // Re-throw for caller to handle if needed
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};

export default EnhancedErrorBoundary;