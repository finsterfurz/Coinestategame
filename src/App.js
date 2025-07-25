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

function App() {
  // ===================================
  // 🎮 GAME STATE MANAGEMENT
  // ===================================
  
  const [familyData, setFamilyData] = useState({
    characters: [],
    totalLunc: 1250,
    familySize: 0,
    dailyEarnings: 0
  });

  const [buildingData, setBuildingData] = useState({
    totalEmployees: 847,
    availableJobs: 156,
    buildingEfficiency: 78,
    dailyLuncPool: 25000
  });

  // ===================================
  // 🔗 WEB3 STATE MANAGEMENT
  // ===================================
  
  const [userConnected, setUserConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showMinting, setShowMinting] = useState(false);

  // ===================================
  // 🎯 INITIALIZATION
  // ===================================
  
  // Initialize demo data
  useEffect(() => {
    // Demo Familie für Testing (nur wenn noch keine Charaktere vorhanden)
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

      setFamilyData(prev => ({
        ...prev,
        characters: demoCharacters,
        familySize: demoCharacters.length,
        dailyEarnings: demoCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0)
      }));

      // Simulate user connection for demo if no wallet connected
      if (!userConnected) {
        setUserConnected(true);
      }
    }
  }, []);

  // ===================================
  // 🎮 GAME FUNCTIONS
  // ===================================
  
  // Handle Wallet Connection Change
  const handleWalletConnectionChange = (connected, address) => {
    setUserConnected(connected);
    setWalletAddress(address);
    
    if (connected) {
      console.log('Wallet connected:', address);
    } else {
      console.log('Wallet disconnected');
    }
  };

  // Handle Character Minted
  const handleCharacterMinted = (newCharacters) => {
    setFamilyData(prev => {
      const updatedCharacters = [...prev.characters, ...newCharacters];
      return {
        ...prev,
        characters: updatedCharacters,
        familySize: updatedCharacters.length,
        dailyEarnings: updatedCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0)
      };
    });
    
    // Show success message (optional)
    console.log('New characters minted:', newCharacters);
  };

  // Update family data (for character management)
  const updateFamilyData = (newData) => {
    setFamilyData(prev => ({
      ...prev,
      ...newData,
      familySize: newData.characters ? newData.characters.length : prev.familySize,
      dailyEarnings: newData.characters 
        ? newData.characters.reduce((sum, char) => sum + char.dailyEarnings, 0)
        : prev.dailyEarnings
    }));
  };

  return (
    <Router>
      <div className="App">
        
        {/* ===================================
            🧭 NAVIGATION BAR
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
              {/* LUNC Wallet Display */}
              <LuncWallet balance={familyData.totalLunc} />
              
              {/* Wallet Connection */}
              <div className="nav-wallet">
                <WalletConnection 
                  onConnectionChange={handleWalletConnectionChange}
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
              />
            } />
            
            {/* Family Management */}
            <Route path="/family" element={
              <FamilyManagement 
                familyData={familyData}
                setFamilyData={updateFamilyData}
                userConnected={userConnected}
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
              />
            } />
            
            {/* Marketplace */}
            <Route path="/marketplace" element={
              <Marketplace 
                familyData={familyData}
                setFamilyData={updateFamilyData}
                userConnected={userConnected}
              />
            } />
            
            {/* Character Minting - Separate Page */}
            <Route path="/mint" element={
              <div className="mint-page">
                <div className="mint-container">
                  <CharacterMinting 
                    onCharacterMinted={handleCharacterMinted}
                    userWallet={userConnected ? walletAddress : null}
                  />
                </div>
              </div>
            } />
          </Routes>
        </main>

        {/* ===================================
            📱 MINTING MODAL (OVERLAY)
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
                    // Optional: Modal nach erfolgreichem Mint schließen
                    // setShowMinting(false);
                  }}
                  userWallet={userConnected ? walletAddress : null}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================================
            📄 FOOTER
            =================================== */}
        <footer className="game-footer">
          <div className="footer-content">
            <div className="footer-info">
              <p>🎮 <strong>Virtual Building Empire</strong> - Character Collection Game</p>
              <p>🏢 Dubai LLC | 🎯 Entertainment Only | 💎 LUNC Gaming Rewards</p>
            </div>
            <div className="footer-links">
              <a href="#whitepaper" className="footer-link">📖 Whitepaper</a>
              <a href="#legal" className="footer-link">⚖️ Legal</a>
              <a href="#support" className="footer-link">🆘 Support</a>
            </div>
            <div className="footer-disclaimer">
              <small>
                Keine Investment-Beratung | LUNC Rewards sind Gameplay-Belohnungen | 
                Spiele verantwortungsvoll
              </small>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;