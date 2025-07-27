import React from 'react';
import '../styles/loading.css';

// ===================================
// 🎮 ENHANCED LOADING COMPONENTS
// ===================================

/**
 * Main game loader - used during app initialization
 */
export const GameLoader: React.FC = () => {
  return (
    <div className="game-loader">
      <div className="loader-container">
        
        {/* Animated Building */}
        <div className="building-loader">
          <div className="building-base">
            <div className="floor-loader floor-1"></div>
            <div className="floor-loader floor-2"></div>
            <div className="floor-loader floor-3"></div>
            <div className="floor-loader floor-4"></div>
            <div className="floor-loader floor-5"></div>
          </div>
          
          {/* Floating Elements */}
          <div className="floating-elements">
            <div className="floating-char">👤</div>
            <div className="floating-lunc">💰</div>
            <div className="floating-star">⭐</div>
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="loader-content">
          <h2 className="loader-title">
            🏢 Virtual Building Empire
          </h2>
          <p className="loader-subtitle">
            Lade dein Gaming-Erlebnis...
          </p>
          
          {/* Progress Bar */}
          <div className="loader-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-text">
              Initialisiere Charaktere und Gebäude...
            </div>
          </div>
        </div>
        
        {/* Loading Tips */}
        <div className="loader-tips">
          <div className="tip-rotation">
            <div className="tip active">💡 Tipp: Größere Familien verdienen mehr LUNC!</div>
            <div className="tip">🎯 Tipp: Legendary Charaktere haben die besten Jobs!</div>
            <div className="tip">🏢 Tipp: Jobs in höheren Etagen zahlen besser!</div>
            <div className="tip">👥 Tipp: Arbeite mit der Community zusammen!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component loader - used for lazy-loaded components
 */
export const ComponentLoader: React.FC = () => {
  return (
    <div className="component-loader">
      <div className="component-loader-content">
        
        {/* Simple spinner */}
        <div className="spinner-container">
          <div className="spinner">
            <div className="spinner-sector"></div>
            <div className="spinner-sector"></div>
            <div className="spinner-sector"></div>
            <div className="spinner-sector"></div>
          </div>
        </div>
        
        {/* Loading message */}
        <p className="component-loader-text">
          Lade Komponente...
        </p>
      </div>
    </div>
  );
};

/**
 * Inline loader - for small loading states within components
 */
export const InlineLoader: React.FC<{ size?: 'small' | 'medium' | 'large'; text?: string }> = ({ 
  size = 'medium', 
  text = 'Lädt...' 
}) => {
  return (
    <div className={`inline-loader ${size}`}>
      <div className="inline-spinner"></div>
      {text && <span className="inline-loader-text">{text}</span>}
    </div>
  );
};

/**
 * Card loader - skeleton loader for card-based content
 */
export const CardLoader: React.FC<{ count?: number }> = ({ count = 1 }) => {
  return (
    <div className="card-loader-container">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="card-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-title">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line medium"></div>
            </div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line long"></div>
            <div className="skeleton-line medium"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Character loader - specific skeleton for character cards
 */
export const CharacterLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="character-loader-grid">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="character-skeleton">
          <div className="character-skeleton-avatar">
            <div className="skeleton-circle large"></div>
          </div>
          <div className="character-skeleton-info">
            <div className="skeleton-line character-name"></div>
            <div className="skeleton-line character-type"></div>
            <div className="skeleton-line character-job"></div>
          </div>
          <div className="character-skeleton-stats">
            <div className="skeleton-stat">
              <div className="skeleton-circle small"></div>
              <div className="skeleton-line tiny"></div>
            </div>
            <div className="skeleton-stat">
              <div className="skeleton-circle small"></div>
              <div className="skeleton-line tiny"></div>
            </div>
            <div className="skeleton-stat">
              <div className="skeleton-circle small"></div>
              <div className="skeleton-line tiny"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Building loader - specific skeleton for building overview
 */
export const BuildingLoader: React.FC = () => {
  return (
    <div className="building-loader-container">
      
      {/* Building Header */}
      <div className="building-skeleton-header">
        <div className="skeleton-line building-title"></div>
        <div className="skeleton-stats">
          <div className="skeleton-stat-item">
            <div className="skeleton-circle medium"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-stat-item">
            <div className="skeleton-circle medium"></div>
            <div className="skeleton-line short"></div>
          </div>
          <div className="skeleton-stat-item">
            <div className="skeleton-circle medium"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>
      
      {/* Building Floors */}
      <div className="building-skeleton-floors">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="floor-skeleton">
            <div className="floor-skeleton-number">
              <div className="skeleton-circle small"></div>
            </div>
            <div className="floor-skeleton-content">
              <div className="skeleton-line floor-name"></div>
              <div className="skeleton-line floor-description"></div>
            </div>
            <div className="floor-skeleton-occupancy">
              <div className="skeleton-line tiny"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Table loader - skeleton for data tables
 */
export const TableLoader: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="table-skeleton">
      
      {/* Table Header */}
      <div className="table-skeleton-header">
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="table-skeleton-header-cell">
            <div className="skeleton-line table-header"></div>
          </div>
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="table-skeleton-body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-skeleton-row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="table-skeleton-cell">
                <div className="skeleton-line table-cell"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Progress loader - for operations with known progress
 */
export const ProgressLoader: React.FC<{ 
  progress: number; 
  text?: string; 
  showPercentage?: boolean 
}> = ({ 
  progress, 
  text = 'Verarbeitung...', 
  showPercentage = true 
}) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));
  
  return (
    <div className="progress-loader">
      <div className="progress-loader-content">
        {text && (
          <div className="progress-loader-text">
            {text}
            {showPercentage && (
              <span className="progress-percentage">
                ({Math.round(clampedProgress)}%)
              </span>
            )}
          </div>
        )}
        
        <div className="progress-loader-bar">
          <div 
            className="progress-loader-fill"
            style={{ width: `${clampedProgress}%` }}
          >
            <div className="progress-loader-shine"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Dots loader - simple three dots animation
 */
export const DotsLoader: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  return (
    <div className={`dots-loader ${size}`}>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  );
};

/**
 * Pulse loader - pulsing circle animation
 */
export const PulseLoader: React.FC<{ size?: number; color?: string }> = ({ 
  size = 40, 
  color = '#3b82f6' 
}) => {
  return (
    <div 
      className="pulse-loader"
      style={{ 
        width: size, 
        height: size,
        '--pulse-color': color
      } as React.CSSProperties & { '--pulse-color': string }}
    >
      <div className="pulse-ring"></div>
      <div className="pulse-ring"></div>
      <div className="pulse-ring"></div>
    </div>
  );
};

// Default export
const LoadingSpinner: React.FC = GameLoader;

export default LoadingSpinner;