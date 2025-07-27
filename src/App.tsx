import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

// ===================================
// 🎯 TYPE IMPORTS
// ===================================
import {
  FamilyData,
  BuildingData,
  GameSettings,
  Character,
  GameError,
  LoadingState
} from './types/game';

// ===================================
// 🚀 LAZY LOADED COMPONENTS (Code Splitting)
// ===================================
const Homepage = React.lazy(() => import('./components/Homepage'));
const FamilyManagement = React.lazy(() => import('./components/FamilyManagement'));
const BuildingOverview = React.lazy(() => import('./components/BuildingOverview'));
const JobAssignment = React.lazy(() => import('./components/JobAssignment'));
const Marketplace = React.lazy(() => import('./components/Marketplace'));
const CharacterMinting = React.lazy(() => import('./components/CharacterMinting'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const QuestSystem = React.lazy(() => import('./components/QuestSystem'));

// ===================================
// 🎯 REGULAR IMPORTS (Critical Components)
// ===================================
import LuncWallet from './components/LuncWallet';
import WalletConnection from './components/WalletConnection';
import { GameLoader, ComponentLoader } from './components/LoadingSpinner';

// Custom Hooks
import useGameNotifications from './hooks/useGameNotifications';
import useLocalStorage from './hooks/useLocalStorage';
import useWeb3Connection from './hooks/useWeb3Connection';

// Utils
import { generateRandomCharacter, formatLuncBalance, debounce } from './utils/gameHelpers';

// ===================================
// 🎨 IMPORT ALL STYLES
// ===================================
import './App.css';
import './styles/homepage.css';
import './styles/wallet.css';
import './styles/minting.css';
import './styles/family.css';
import './styles/luncwallet.css';
import './styles/building.css';
import './styles/jobs.css';
import './styles/marketplace.css';
import './styles/loading.css';

// ===================================
// 🛡️ ENHANCED ERROR BOUNDARY COMPONENT
// ===================================
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  const [isReporting, setIsReporting] = useState(false);

  const reportError = useCallback(async () => {
    setIsReporting(true);
    try {
      // In production, send to error reporting service
      console.error('Error reported:', error);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    } finally {
      setIsReporting(false);
    }
  }, [error]);

  return (
    <div className="error-boundary-fallback">
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Oops! Something went wrong</h2>
        <p className="error-message">
          We encountered an unexpected error while loading your Virtual Building Empire.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="error-details">
            <summary>Error Details (Development)</summary>
            <pre className="error-stack">{error.message}</pre>
            <pre className="error-stack">{error.stack}</pre>
          </details>
        )}
        
        <div className="error-actions">
          <button 
            className="error-button primary"
            onClick={resetErrorBoundary}
          >
            🔄 Try Again
          </button>
          
          <button 
            className="error-button secondary"
            onClick={() => window.location.reload()}
          >
            🏠 Reload Page
          </button>
          
          <button 
            className="error-button tertiary"
            onClick={reportError}
            disabled={isReporting}
          >
            {isReporting ? '📤 Reporting...' : '📤 Report Issue'}
          </button>
        </div>
        
        <div className="error-help">
          <p>
            If this problem persists, please contact our support team at{' '}
            <a href="mailto:support@virtualbuilding.game">support@virtualbuilding.game</a>
          </p>
        </div>
      </div>
    </div>
  );
};

// ===================================
// 🎮 MAIN APP COMPONENT
// ===================================
const App: React.FC = () => {
  // ===================================
  // 🎮 ENHANCED STATE MANAGEMENT WITH TYPES
  // ===================================
  
  const [familyData, setFamilyData] = useLocalStorage<FamilyData>('family_data', {
    characters: [],
    totalLunc: 1250,
    familySize: 0,
    dailyEarnings: 0
  });

  const [buildingData, setBuildingData] = useLocalStorage<BuildingData>('building_data', {
    totalEmployees: 847,
    availableJobs: 156,
    buildingEfficiency: 78,
    dailyLuncPool: 25000
  });

  const [gameSettings, setGameSettings] = useLocalStorage<GameSettings>('game_settings', {
    soundEnabled: true,
    notificationsEnabled: true,
    autoCollectLunc: true,
    darkMode: false,
    language: 'de',
    animations: true
  });

  // ===================================
  // 🔗 ENHANCED WEB3 & NOTIFICATIONS WITH TYPES
  // ===================================
  
  const {
    isConnected: userConnected,
    account: walletAddress,
    connect: connectWallet,
    disconnect: disconnectWallet,
    isLoading: walletLoading,
    error: walletError
  } = useWeb3Connection();

  const {
    notifyCharacterMinted,
    notifyLuncEarned,
    notifyJobAssigned,
    notifyMarketplaceTrade,
    requestPermission
  } = useGameNotifications();

  // ===================================
  // 🎯 LOADING & ERROR STATES WITH TYPES
  // ===================================
  
  const [showMinting, setShowMinting] = useState<boolean>(false);
  const [isGameLoading, setIsGameLoading] = useState<boolean>(true);
  const [gameError, setGameError] = useState<GameError | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');

  // ===================================
  // 🎯 INITIALIZATION WITH ENHANCED ERROR HANDLING
  // ===================================
  
  useEffect(() => {
    const initializeGame = async (): Promise<void> => {
      try {
        setLoadingState('loading');
        setIsGameLoading(true);
        
        // Initialize demo data if no characters exist
        if (familyData.characters.length === 0) {
          const demoCharacters: Character[] = [
            {
              id: 1,
              name: "Max Manager",
              type: "rare",
              job: "Building Manager",
              level: 12,
              dailyEarnings: 85,
              happiness: 92,
              working: true,
              department: "Management",
              mintedAt: new Date().toISOString(),
              experience: 2400,
              skills: ["Leadership", "Strategy", "Communication"]
            },
            {
              id: 2,
              name: "Anna Admin",
              type: "common",
              job: "Office Worker",
              level: 8,
              dailyEarnings: 35,
              happiness: 78,
              working: true,
              department: "Administration",
              mintedAt: new Date().toISOString(),
              experience: 850,
              skills: ["Organization", "Data Entry"]
            },
            {
              id: 3,
              name: "Tom Tech",
              type: "rare",
              job: "IT Support",
              level: 15,
              dailyEarnings: 65,
              happiness: 88,
              working: false,
              department: "IT",
              mintedAt: new Date().toISOString(),
              experience: 3200,
              skills: ["Programming", "Problem Solving", "Debugging"]
            },
            {
              id: 4,
              name: "Lisa Legend",
              type: "legendary",
              job: "Master Architect",
              level: 25,
              dailyEarnings: 150,
              happiness: 95,
              working: true,
              department: "Architecture",
              mintedAt: new Date().toISOString(),
              experience: 8500,
              skills: ["Architecture", "Design", "Innovation", "Leadership"]
            }
          ];

          const updatedFamilyData: FamilyData = {
            ...familyData,
            characters: demoCharacters,
            familySize: demoCharacters.length,
            dailyEarnings: demoCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0),
            familyBonus: Math.floor(demoCharacters.length * 0.05 * 100), // 5% bonus per character
            totalExperience: demoCharacters.reduce((sum, char) => sum + (char.experience || 0), 0)
          };
          
          setFamilyData(updatedFamilyData);
        }
        
        // Request notification permission if enabled
        if (gameSettings.notificationsEnabled) {
          await requestPermission();
        }
        
        // Simulate realistic loading time for better UX
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        
        setLoadingState('success');
        
      } catch (error) {
        console.error('Game initialization error:', error);
        const gameError: GameError = {
          code: 'INIT_ERROR',
          message: 'Fehler beim Laden des Spiels. Bitte versuche es erneut.',
          context: { error: error instanceof Error ? error.message : 'Unknown error' },
          recoverable: true
        };
        setGameError(gameError);
        setLoadingState('error');
      } finally {
        setIsGameLoading(false);
      }
    };

    initializeGame();
  }, []);

  // ===================================
  // 🎮 ENHANCED GAME FUNCTIONS WITH TYPES
  // ===================================
  
  // Handle Wallet Connection with notifications
  const handleWalletConnectionChange = useCallback(async (connected: boolean, address?: string): Promise<void> => {
    try {
      if (connected && address && !userConnected) {
        console.log('Wallet connected:', address);
        
        // Show welcome notification
        if (gameSettings.notificationsEnabled) {
          setTimeout(() => {
            alert('🎉 Wallet erfolgreich verbunden! Willkommen im Virtual Building Empire!');
          }, 500);
        }
      } else if (!connected) {
        console.log('Wallet disconnected');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  }, [userConnected, gameSettings.notificationsEnabled]);

  // Enhanced Character Minting with notifications
  const handleCharacterMinted = useCallback((newCharacters: Character[]): void => {
    try {
      const updatedCharacters = [...familyData.characters, ...newCharacters];
      const familyBonus = newCharacters.length * 50;
      
      const updatedFamilyData: FamilyData = {
        ...familyData,
        characters: updatedCharacters,
        familySize: updatedCharacters.length,
        dailyEarnings: updatedCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0),
        totalLunc: familyData.totalLunc + familyBonus,
        familyBonus: Math.floor(updatedCharacters.length * 0.05 * 100),
        totalExperience: updatedCharacters.reduce((sum, char) => sum + (char.experience || 0), 0)
      };
      
      setFamilyData(updatedFamilyData);
      
      // Trigger notifications
      if (gameSettings.notificationsEnabled) {
        notifyCharacterMinted(newCharacters);
      }
      
      console.log('New characters minted:', newCharacters);
    } catch (error) {
      console.error('Error handling character mint:', error);
      const gameError: GameError = {
        code: 'MINT_ERROR',
        message: 'Fehler beim Minten der Charaktere',
        context: { newCharacters, error: error instanceof Error ? error.message : 'Unknown error' },
        recoverable: true
      };
      setGameError(gameError);
    }
  }, [familyData, gameSettings.notificationsEnabled, notifyCharacterMinted]);

  // Enhanced family data update with validation
  const updateFamilyData = useCallback((newData: Partial<FamilyData>): void => {
    try {
      const updatedData: FamilyData = {
        ...familyData,
        ...newData,
        familySize: newData.characters ? newData.characters.length : familyData.familySize,
        dailyEarnings: newData.characters 
          ? newData.characters.reduce((sum, char) => sum + char.dailyEarnings, 0)
          : familyData.dailyEarnings
      };
      
      setFamilyData(updatedData);
    } catch (error) {
      console.error('Error updating family data:', error);
      const gameError: GameError = {
        code: 'UPDATE_ERROR',
        message: 'Fehler beim Aktualisieren der Familiendaten',
        context: { newData, error: error instanceof Error ? error.message : 'Unknown error' },
        recoverable: true
      };
      setGameError(gameError);
    }
  }, [familyData]);

  // Enhanced LUNC Collection with notifications
  const debouncedLuncCollection = useCallback(debounce(() => {
    try {
      if (familyData.characters.length > 0) {
        const workingCharacters = familyData.characters.filter(char => char.working);
        const dailyEarnings = workingCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0);
        
        if (dailyEarnings > 0) {
          const earnedLunc = Math.floor(dailyEarnings * 0.1);
          
          setFamilyData(prev => ({
            ...prev,
            totalLunc: prev.totalLunc + earnedLunc
          }));
          
          // Notify if significant earnings
          if (earnedLunc > 50 && gameSettings.notificationsEnabled) {
            notifyLuncEarned(earnedLunc);
          }
        }
      }
    } catch (error) {
      console.error('Error collecting LUNC:', error);
    }
  }, 1000), [familyData.characters, gameSettings.notificationsEnabled, notifyLuncEarned]);

  // Automatic LUNC collection
  useEffect(() => {
    if (!gameSettings.autoCollectLunc) return;
    
    const interval = setInterval(debouncedLuncCollection, 60000);
    return () => clearInterval(interval);
  }, [debouncedLuncCollection, gameSettings.autoCollectLunc]);

  // ===================================
  // 🎮 LOADING STATE
  // ===================================
  
  if (isGameLoading) {
    return <GameLoader />;
  }

  // ===================================
  // 🎮 ERROR STATE
  // ===================================
  
  if (gameError) {
    return (
      <div className="game-error">
        <div className="error-container">
          <h2>⚠️ Spiel-Fehler</h2>
          <p>{gameError.message}</p>
          {gameError.recoverable && (
            <button 
              className="error-retry-btn"
              onClick={() => {
                setGameError(null);
                setLoadingState('idle');
              }}
            >
              🔄 Erneut versuchen
            </button>
          )}
          <button 
            className="error-reload-btn"
            onClick={() => window.location.reload()}
          >
            🏠 Seite neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
        // In production, send to error reporting service
      }}
      onReset={() => {
        // Reset any app state if needed
        setGameError(null);
        setLoadingState('idle');
      }}
    >
      <Router>
        <div className="App">
          
          {/* ===================================
              🧭 ENHANCED NAVIGATION BAR
              =================================== */}
          <nav className="game-nav">
            <div className="nav-container">
              
              {/* Logo */}
              <div className="nav-logo">
                <Link to="/" className="logo-link">
                  🏢 <span>Virtual Building Empire</span>
                </Link>
              </div>
              
              {/* Navigation Links */}
              <div className="nav-links">
                <Link to="/" className="nav-link">🏠 Home</Link>
                <Link to="/family" className="nav-link">👨‍👩‍👧‍👦 Familie</Link>
                <Link to="/building" className="nav-link">🏢 Gebäude</Link>
                <Link to="/jobs" className="nav-link">💼 Jobs</Link>
                <Link to="/marketplace" className="nav-link">🛒 Marktplatz</Link>
                {userConnected && (
                  <Link to="/analytics" className="nav-link">📊 Analytics</Link>
                )}
                <button 
                  className="nav-link mint-link"
                  onClick={() => setShowMinting(true)}
                >
                  🎯 Minten
                </button>
              </div>
              
              {/* Right Side - Wallet & LUNC */}
              <div className="nav-right">
                {/* Enhanced LUNC Wallet Display */}
                <LuncWallet 
                  balance={familyData.totalLunc}
                  formatted={formatLuncBalance(familyData.totalLunc)}
                />
                
                {/* Enhanced Wallet Connection */}
                <div className="nav-wallet">
                  <WalletConnection 
                    onConnectionChange={handleWalletConnectionChange}
                    isLoading={walletLoading}
                    error={walletError}
                  />
                </div>
              </div>
            </div>
          </nav>

          {/* ===================================
              📱 MAIN CONTENT AREA WITH SUSPENSE
              =================================== */}
          <main className="game-container">
            <Suspense fallback={<ComponentLoader />}>
              <Routes>
                
                {/* Homepage */}
                <Route path="/" element={
                  <Homepage 
                    familyData={familyData} 
                    buildingData={buildingData}
                    userConnected={userConnected}
                    walletAddress={walletAddress}
                  />
                } />
                
                {/* Family Management */}
                <Route path="/family" element={
                  <FamilyManagement 
                    familyData={familyData}
                    setFamilyData={updateFamilyData}
                    userConnected={userConnected}
                    onJobAssign={(character, job) => notifyJobAssigned(character, job)}
                  />
                } />
                
                {/* Building Overview */}
                <Route path="/building" element={
                  <BuildingOverview 
                    buildingData={buildingData}
                    setBuildingData={setBuildingData}
                    familyCharacters={familyData.characters}
                  />
                } />
                
                {/* Job Assignment */}
                <Route path="/jobs" element={
                  <JobAssignment 
                    characters={familyData.characters}
                    setFamilyData={updateFamilyData}
                    buildingData={buildingData}
                    onJobAssign={(character, job) => notifyJobAssigned(character, job)}
                  />
                } />
                
                {/* Marketplace */}
                <Route path="/marketplace" element={
                  <Marketplace 
                    familyData={familyData}
                    setFamilyData={updateFamilyData}
                    userConnected={userConnected}
                    onTrade={(item, type) => notifyMarketplaceTrade(item, type)}
                  />
                } />
                
                {/* Analytics Dashboard - Only for connected users */}
                {userConnected && (
                  <Route path="/analytics" element={
                    <AnalyticsDashboard />
                  } />
                )}
                
                {/* Quest System - Future feature */}
                <Route path="/quests" element={
                  <QuestSystem />
                } />
                
                {/* Character Minting - Separate Page */}
                <Route path="/mint" element={
                  <div className="mint-page">
                    <div className="mint-container">
                      <CharacterMinting 
                        onCharacterMinted={handleCharacterMinted}
                        userWallet={userConnected ? walletAddress : null}
                        luncBalance={familyData.totalLunc}
                      />
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>
          </main>

          {/* ===================================
              📱 ENHANCED MINTING MODAL
              =================================== */}
          {showMinting && (
            <div className="minting-modal-overlay" onClick={() => setShowMinting(false)}>
              <div className="minting-modal" onClick={(e) => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="modal-header">
                  <h2>🎯 Charaktere minten</h2>
                  <button 
                    className="modal-close"
                    onClick={() => setShowMinting(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Minting Interface with Suspense */}
                <div className="modal-content">
                  <Suspense fallback={<ComponentLoader />}>
                    <CharacterMinting 
                      onCharacterMinted={(characters) => {
                        handleCharacterMinted(characters);
                        // Optional: Close modal after successful mint
                        // setShowMinting(false);
                      }}
                      userWallet={userConnected ? walletAddress : null}
                      luncBalance={familyData.totalLunc}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          )}

          {/* ===================================
              🎮 ENHANCED FLOATING ACTIONS
              =================================== */}
          {userConnected && familyData.characters.length > 0 && (
            <div className="floating-actions">
              <div className="fab-container">
                <button 
                  className="fab main-fab"
                  onClick={() => setShowMinting(true)}
                  title="Neue Charaktere minten"
                >
                  🎯
                </button>
                
                <div className="fab-menu">
                  <Link to="/family" className="fab mini-fab" title="Familie verwalten">
                    👥
                  </Link>
                  <Link to="/jobs" className="fab mini-fab" title="Jobs zuweisen">
                    💼
                  </Link>
                  <Link to="/marketplace" className="fab mini-fab" title="Marktplatz">
                    🛒
                  </Link>
                  <Link to="/analytics" className="fab mini-fab" title="Analytics">
                    📊
                  </Link>
                  <button 
                    className="fab mini-fab"
                    title="Einstellungen"
                    onClick={() => console.log('Settings clicked')}
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================
              📊 ENHANCED DEBUG PANEL
              =================================== */}
          {process.env.NODE_ENV === 'development' && (
            <div className="debug-stats">
              <div className="debug-section">
                <h4>🎮 Game State</h4>
                <div className="debug-item">
                  <span>Familie: {familyData.familySize}</span>
                </div>
                <div className="debug-item">
                  <span>LUNC: {formatLuncBalance(familyData.totalLunc)}</span>
                </div>
                <div className="debug-item">
                  <span>Arbeitend: {familyData.characters.filter(c => c.working).length}</span>
                </div>
                <div className="debug-item">
                  <span>Loading: {loadingState}</span>
                </div>
              </div>
              
              <div className="debug-section">
                <h4>🔗 Web3 Status</h4>
                <div className="debug-item">
                  <span>Wallet: {userConnected ? '🟢' : '🔴'}</span>
                </div>
                <div className="debug-item">
                  <span>Address: {walletAddress ? `${walletAddress.slice(0,6)}...` : 'None'}</span>
                </div>
                <div className="debug-item">
                  <span>Loading: {walletLoading ? '⏳' : '✅'}</span>
                </div>
              </div>
              
              <div className="debug-section">
                <h4>⚙️ Settings</h4>
                <div className="debug-item">
                  <span>Sound: {gameSettings.soundEnabled ? '🔊' : '🔇'}</span>
                </div>
                <div className="debug-item">
                  <span>Notifications: {gameSettings.notificationsEnabled ? '🔔' : '🔕'}</span>
                </div>
                <div className="debug-item">
                  <span>Auto LUNC: {gameSettings.autoCollectLunc ? '🤖' : '👤'}</span>
                </div>
              </div>
            </div>
          )}

          {/* ===================================
              📄 ENHANCED FOOTER
              =================================== */}
          <footer className="game-footer">
            <div className="footer-content">
              <div className="footer-info">
                <p>🎮 <strong>Virtual Building Empire v2.1</strong> - Professional Web3 Gaming Platform</p>
                <p>🏢 Dubai LLC | 🎯 Entertainment Only | 💎 LUNC Gaming Rewards</p>
                <p>👨‍👩‍👧‍👦 Sammle NFT-Charaktere und baue dein eigenes Gebäude-Imperium auf!</p>
              </div>
              <div className="footer-links">
                <a href="#whitepaper" className="footer-link">📖 Whitepaper</a>
                <a href="#legal" className="footer-link">⚖️ Legal</a>
                <a href="#support" className="footer-link">🆘 Support</a>
                <a href="#roadmap" className="footer-link">🗺️ Roadmap</a>
                <a href="https://github.com/finsterfurz/Coinestategame" className="footer-link">💻 GitHub</a>
              </div>
              <div className="footer-disclaimer">
                <small>
                  Keine Investment-Beratung | LUNC Rewards sind Gameplay-Belohnungen | 
                  Spiele verantwortungsvoll | Web3 Gaming Experience | Made with ❤️ for the Community
                </small>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;