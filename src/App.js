import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Homepage from './components/Homepage';
import FamilyManagement from './components/FamilyManagement';
import BuildingOverview from './components/BuildingOverview';
import JobAssignment from './components/JobAssignment';
import Marketplace from './components/Marketplace';
import LuncWallet from './components/LuncWallet';
import WalletConnection from './components/WalletConnection';
import CharacterMinting from './components/CharacterMinting';
import ErrorBoundary from './components/ErrorBoundary';
import { GameLoader } from './components/LoadingSpinner';

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

function App() {
  // ===================================
  // 🎮 ENHANCED STATE MANAGEMENT
  // ===================================
  
  const [familyData, setFamilyData] = useLocalStorage('family_data', {
    characters: [],
    totalLunc: 1250,
    familySize: 0,
    dailyEarnings: 0
  });

  const [buildingData, setBuildingData] = useLocalStorage('building_data', {
    totalEmployees: 847,
    availableJobs: 156,
    buildingEfficiency: 78,
    dailyLuncPool: 25000
  });

  const [gameSettings, setGameSettings] = useLocalStorage('game_settings', {
    soundEnabled: true,
    notificationsEnabled: true,
    autoCollectLunc: true,
    darkMode: false
  });

  // ===================================
  // 🔗 ENHANCED WEB3 & NOTIFICATIONS
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
  // 🎯 LOADING & ERROR STATES
  // ===================================
  
  const [showMinting, setShowMinting] = useState(false);
  const [isGameLoading, setIsGameLoading] = useState(true);
  const [gameError, setGameError] = useState(null);

  // ===================================
  // 🎯 INITIALIZATION WITH ERROR HANDLING
  // ===================================
  
  useEffect(() => {
    const initializeGame = async () => {
      try {
        setIsGameLoading(true);
        
        // Initialize demo data if no characters exist
        if (familyData.characters.length === 0) {
          const demoCharacters = [
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
              mintedAt: new Date().toISOString()
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
              mintedAt: new Date().toISOString()
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
              mintedAt: new Date().toISOString()
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
              mintedAt: new Date().toISOString()
            }
          ];

          const updatedFamilyData = {
            ...familyData,
            characters: demoCharacters,
            familySize: demoCharacters.length,
            dailyEarnings: demoCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0)
          };
          
          setFamilyData(updatedFamilyData);
        }
        
        // Request notification permission if enabled
        if (gameSettings.notificationsEnabled) {
          await requestPermission();
        }
        
        // Simulate loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error('Game initialization error:', error);
        setGameError('Fehler beim Laden des Spiels');
      } finally {
        setIsGameLoading(false);
      }
    };

    initializeGame();
  }, []);

  // ===================================
  // 🎮 ENHANCED GAME FUNCTIONS
  // ===================================
  
  // Handle Wallet Connection with notifications
  const handleWalletConnectionChange = async (connected, address) => {
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
  };

  // Enhanced Character Minting with notifications
  const handleCharacterMinted = (newCharacters) => {
    try {
      const updatedCharacters = [...familyData.characters, ...newCharacters];
      const familyBonus = newCharacters.length * 50;
      
      const updatedFamilyData = {
        ...familyData,
        characters: updatedCharacters,
        familySize: updatedCharacters.length,
        dailyEarnings: updatedCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0),
        totalLunc: familyData.totalLunc + familyBonus
      };
      
      setFamilyData(updatedFamilyData);
      
      // Trigger notifications
      if (gameSettings.notificationsEnabled) {
        notifyCharacterMinted(newCharacters);
      }
      
      console.log('New characters minted:', newCharacters);
    } catch (error) {
      console.error('Error handling character mint:', error);
      setGameError('Fehler beim Minten der Charaktere');
    }
  };

  // Enhanced family data update with validation
  const updateFamilyData = (newData) => {
    try {
      const updatedData = {
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
      setGameError('Fehler beim Aktualisieren der Familiendaten');
    }
  };

  // Enhanced LUNC Collection with notifications
  const debouncedLuncCollection = debounce(() => {
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
  }, 1000);

  // Automatic LUNC collection
  useEffect(() => {
    if (!gameSettings.autoCollectLunc) return;
    
    const interval = setInterval(debouncedLuncCollection, 60000);
    return () => clearInterval(interval);
  }, [familyData.characters, gameSettings.autoCollectLunc]);

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
          <p>{gameError}</p>
          <button 
            className="error-retry-btn"
            onClick={() => {
              setGameError(null);
              window.location.reload();
            }}
          >
            🔄 Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
              📱 MAIN CONTENT AREA
              =================================== */}
          <main className="game-container">
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
                  onJobAssign={notifyJobAssigned}
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
                  onJobAssign={notifyJobAssigned}
                />
              } />
              
              {/* Marketplace */}
              <Route path="/marketplace" element={
                <Marketplace 
                  familyData={familyData}
                  setFamilyData={updateFamilyData}
                  userConnected={userConnected}
                  onTrade={notifyMarketplaceTrade}
                />
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
                
                {/* Minting Interface */}
                <div className="modal-content">
                  <CharacterMinting 
                    onCharacterMinted={(characters) => {
                      handleCharacterMinted(characters);
                      // Optional: Close modal after successful mint
                      // setShowMinting(false);
                    }}
                    userWallet={userConnected ? walletAddress : null}
                    luncBalance={familyData.totalLunc}
                  />
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
                <p>🎮 <strong>Virtual Building Empire v2.0</strong> - Professional Web3 Gaming Platform</p>
                <p>🏢 Dubai LLC | 🎯 Entertainment Only | 💎 LUNC Gaming Rewards</p>
                <p>👨‍👩‍👧‍👦 Sammle NFT-Charaktere und baue dein eigenes Gebäude-Imperium auf!</p>
              </div>
              <div className="footer-links">
                <a href="#whitepaper" className="footer-link">📖 Whitepaper</a>
                <a href="#legal" className="footer-link">⚖️ Legal</a>
                <a href="#support" className="footer-link">🆘 Support</a>
                <a href="#roadmap" className="footer-link">🗺️ Roadmap</a>
                <a href="#github" className="footer-link">💻 GitHub</a>
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
}

export default App;