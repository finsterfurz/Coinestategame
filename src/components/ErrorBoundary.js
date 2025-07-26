import React from 'react';

// ===================================
// 🛡️ ERROR BOUNDARY COMPONENT
// ===================================

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Etwas ist schiefgegangen</h2>
            <p>Das Virtual Building Empire ist auf einen unerwarteten Fehler gestoßen.</p>
            
            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={() => window.location.reload()}
              >
                🔄 Seite neu laden
              </button>
              
              <button 
                className="error-btn secondary"
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              >
                🎮 Spiel fortsetzen
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>🔍 Entwickler-Details anzeigen</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-help">
              <p>💡 <strong>Hilfe:</strong></p>
              <ul>
                <li>Überprüfe deine Internetverbindung</li>
                <li>Stelle sicher, dass deine Wallet-Extension aktiv ist</li>
                <li>Versuche den Browser-Cache zu leeren</li>
                <li>Kontaktiere den Support falls das Problem bestehen bleibt</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;