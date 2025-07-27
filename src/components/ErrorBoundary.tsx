import React, { Component, ReactNode, ErrorInfo } from 'react';

// ===================================
// 🛡️ ERROR BOUNDARY TYPES
// ===================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ===================================
// 🛡️ ENHANCED ERROR BOUNDARY COMPONENT
// ===================================

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to trigger error UI on next render
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  private handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  private copyErrorToClipboard = async (): Promise<void> => {
    if (!this.state.error) return;
    
    const errorText = `Error: ${this.state.error.toString()}\n\nComponent Stack: ${this.state.errorInfo?.componentStack}`;
    
    try {
      await navigator.clipboard.writeText(errorText);
      alert('✅ Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Oops! Something went wrong</h2>
            <p className="error-message">
              Virtual Building Empire encountered an unexpected error. Don't worry, your game progress is safe!
            </p>
            
            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={this.handleReload}
                type="button"
              >
                🔄 Reload Page
              </button>
              
              <button 
                className="error-btn secondary"
                onClick={this.handleRetry}
                type="button"
              >
                🎮 Try Again
              </button>

              {process.env.NODE_ENV === 'development' && (
                <button 
                  className="error-btn tertiary"
                  onClick={this.copyErrorToClipboard}
                  type="button"
                >
                  📋 Copy Error
                </button>
              )}
            </div>
            
            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>🔍 Developer Details</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre className="error-pre">{this.state.error.toString()}</pre>
                  
                  <h4>Component Stack:</h4>
                  <pre className="error-pre">{this.state.errorInfo?.componentStack}</pre>
                  
                  {this.state.error.stack && (
                    <>
                      <h4>Stack Trace:</h4>
                      <pre className="error-pre">{this.state.error.stack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
            
            <div className="error-help">
              <p>💡 <strong>Troubleshooting Tips:</strong></p>
              <ul>
                <li>✅ Check your internet connection</li>
                <li>🔗 Ensure your wallet extension is active and connected</li>
                <li>🧹 Try clearing your browser cache and cookies</li>
                <li>🔄 Refresh the page or restart your browser</li>
                <li>🆘 Contact support if the problem persists</li>
              </ul>
              
              <div className="error-contact">
                <p>
                  Need help? Reach out to our support team at{' '}
                  <a href="mailto:support@virtualbuilding.game">
                    support@virtualbuilding.game
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;