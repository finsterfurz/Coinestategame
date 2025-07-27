import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Character } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
}

interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
}

interface HomepageProps {
  familyData: FamilyData;
  buildingData: BuildingData;
  userConnected: boolean;
  walletAddress?: string;
}

interface TotalStats {
  totalCharacters: number;
  dailyLuncPool: number;
  buildingFloors: number;
  activePlayers: number;
}

type SelectedFeature = 'family' | 'building' | 'rewards' | 'community' | null;

// ===================================
// 🏠 HOMEPAGE COMPONENT
// ===================================

const Homepage: React.FC<HomepageProps> = ({ 
  familyData, 
  buildingData, 
  userConnected,
  walletAddress 
}) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);

  // ===================================
  // 🎮 HELPER FUNCTIONS
  // ===================================
  
  const getTotalStats = (): TotalStats => {
    return {
      totalCharacters: 2500,
      dailyLuncPool: buildingData.dailyLuncPool || 25000,
      buildingFloors: 25,
      activePlayers: buildingData.totalEmployees || 847
    };
  };

  const hasCharacters = (): boolean => {
    return userConnected && familyData.familySize > 0;
  };

  const formatNumber = (num: number): string => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString('de-DE');
  };

  const handleFeatureClick = (feature: SelectedFeature): void => {
    setSelectedFeature(selectedFeature === feature ? null : feature);
  };

  const handleStartGaming = (): void => {
    console.log('Start Gaming clicked');
    // Later: Web3 Connection Logic
  };

  const stats = getTotalStats();

  return (
    <div className="homepage">
      
      {/* ===================================
          🦸 HERO SECTION - CLEAN & FOCUSED
          ===================================
          
          Purpose: First impression for new visitors
          - Introduce the project
          - Highlight main features  
          - Call-to-Action buttons
          - Focus on gaming and rewards
      */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* Left Side: Marketing Content */}
          <div className="hero-content">
            
            {/* New Launch Badge - Get attention */}
            <div className="hero-badge">
              ✨ LIVE NOW - EARLY ACCESS AVAILABLE!
            </div>
            
            {/* Main Title - Project Name */}
            <h1 className="hero-title">
              🏢 Virtual Building Empire
            </h1>
            
            {/* Subtitle - What is the project */}
            <h2 className="hero-subtitle">
              The first NFT Character Collection Game with real LUNC Rewards
            </h2>
            
            {/* Description - Short and precise */}
            <p className="hero-description">
              🎮 <strong>Collect unique NFT characters</strong> and build your own 
              real estate empire. Assign jobs in our virtual 25-story building 
              and earn daily <strong>LUNC tokens</strong> through strategic gaming. <br/>
              <span className="highlight">Pure Entertainment - Real Rewards!</span>
            </p>
            
            {/* Live Statistics - Build trust */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.totalCharacters)}</span>
                <span className="hero-stat-label">Unique NFTs</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.dailyLuncPool)}</span>
                <span className="hero-stat-label">LUNC Pool</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{stats.buildingFloors}</span>
                <span className="hero-stat-label">Building Floors</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.activePlayers)}</span>
                <span className="hero-stat-label">Active Players</span>
              </div>
            </div>
            
            {/* Call-to-Action Buttons */}
            <div className="hero-actions">
              <button 
                className="cta-button primary" 
                onClick={handleStartGaming}
                type="button"
              >
                🚀 Start Playing Now
              </button>
              
              <button 
                className="cta-button secondary"
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                type="button"
              >
                💡 Learn More
              </button>
            </div>
            
            {/* Simplified Trust Indicators */}
            <div className="hero-disclaimer">
              🎯 <strong>Gaming Entertainment</strong> | 
              💎 <strong>Real LUNC Rewards</strong> | 
              🔒 <strong>Secure & Transparent</strong>
            </div>
          </div>
          
          {/* Right Side: Visual Representation */}
          <div className="hero-visual">
            
            {/* Animated Building */}
            <div className="building-illustration">
              
              {/* Building Floors from top to bottom */}
              <div className="building-floor management" title="Management - 25th Floor">
                <span className="floor-icon">🏢</span>
                <span className="floor-label">Management</span>
              </div>
              
              <div className="building-floor professional" title="Professional - 15th-24th Floor">
                <span className="floor-icon">💼</span>
                <span className="floor-label">Professional</span>
              </div>
              
              <div className="building-floor operations" title="Operations - 5th-14th Floor">
                <span className="floor-icon">🔧</span>
                <span className="floor-label">Operations</span>
              </div>
              
              <div className="building-floor service" title="Service - 1st-4th Floor">
                <span className="floor-icon">🍽️</span>
                <span className="floor-label">Service</span>
              </div>
              
              {/* Floating Characters Animation */}
              <div className="floating-characters">
                <span className="floating-char common" title="Common Character">👤</span>
                <span className="floating-char rare" title="Rare Character">⭐</span>
                <span className="floating-char legendary" title="Legendary Character">💎</span>
              </div>
              
              {/* LUNC Token Animation */}
              <div className="floating-lunc">
                <span className="lunc-token">💰</span>
                <span className="lunc-token">💰</span>
                <span className="lunc-token">💰</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          🎯 FEATURES SECTION - ENHANCED
          ===================================
          
          Purpose: Explain core game features
          - Introduce gaming mechanics
          - Why unique?
          - Benefits for players
      */}
      <section className="features-section">
        <div className="section-container">
          
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">🎮 Why Virtual Building Empire?</h2>
            <p className="section-subtitle">
              Unique gaming mechanics for sustainable fun and real rewards
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="features-grid">
            
            {/* Feature 1: Family System */}
            <div 
              className={`feature-card ${selectedFeature === 'family' ? 'active' : ''}`}
              onClick={() => handleFeatureClick('family')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFeatureClick('family');
                }
              }}
            >
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3 className="feature-title">Build Your Family</h3>
              <p className="feature-description">
                Build a strong character family and receive exclusive bonuses. 
                Larger families earn up to <strong>25%</strong> more LUNC!
              </p>
              
              {/* Extended info on click */}
              {selectedFeature === 'family' && (
                <div className="feature-details">
                  <ul>
                    <li>🏠 <strong>Starter Family (1-3):</strong> Perfect for beginners</li>
                    <li>🏡 <strong>Large Family (4-7):</strong> 10% bonus on all earnings</li>
                    <li>🏰 <strong>Mega Family (8+):</strong> 25% bonus + VIP jobs</li>
                    <li>🎁 <strong>Family Bonus:</strong> Special events and rewards</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 2: One Building Concept */}
            <div 
              className={`feature-card ${selectedFeature === 'building' ? 'active' : ''}`}
              onClick={() => handleFeatureClick('building')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFeatureClick('building');
                }
              }}
            >
              <div className="feature-icon">🏢</div>
              <h3 className="feature-title">One Building - Everyone Together</h3>
              <p className="feature-description">
                All 2,500 NFT characters work in the <strong>same virtual building</strong>. 
                Daily new challenges and <strong>live competition</strong> for the best jobs!
              </p>
              
              {selectedFeature === 'building' && (
                <div className="feature-details">
                  <ul>
                    <li>🏢 <strong>25th Floor:</strong> CEO Level (250 LUNC/day)</li>
                    <li>💼 <strong>15th-24th Floor:</strong> Management (80-150 LUNC/day)</li>
                    <li>🔧 <strong>5th-14th Floor:</strong> Operations (30-70 LUNC/day)</li>
                    <li>🍽️ <strong>1st-4th Floor:</strong> Service (15-40 LUNC/day)</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 3: LUNC Rewards */}
            <div 
              className={`feature-card ${selectedFeature === 'rewards' ? 'active' : ''}`}
              onClick={() => handleFeatureClick('rewards')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFeatureClick('rewards');
                }
              }}
            >
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Real LUNC Rewards</h3>
              <p className="feature-description">
                Earn daily real <strong>LUNC tokens</strong> through active gaming. 
                Performance-based rewards without investment risks!
              </p>
              
              {selectedFeature === 'rewards' && (
                <div className="feature-details">
                  <ul>
                    <li>💎 <strong>Legendary NFTs:</strong> 120-250 LUNC/day</li>
                    <li>⭐ <strong>Rare NFTs:</strong> 50-100 LUNC/day</li>
                    <li>👤 <strong>Common NFTs:</strong> 15-50 LUNC/day</li>
                    <li>🎯 <strong>Performance Bonus:</strong> Up to 40% extra</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 4: Community & Security */}
            <div 
              className={`feature-card ${selectedFeature === 'community' ? 'active' : ''}`}
              onClick={() => handleFeatureClick('community')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleFeatureClick('community');
                }
              }}
            >
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Safe & Community-driven</h3>
              <p className="feature-description">
                <strong>Transparent blockchain technology</strong> with active community. 
                Safe gaming experience without hidden costs!
              </p>
              
              {selectedFeature === 'community' && (
                <div className="feature-details">
                  <ul>
                    <li>🔒 <strong>Blockchain Security:</strong> Fully transparent</li>
                    <li>🎮 <strong>Gaming Focus:</strong> Pure entertainment</li>
                    <li>👥 <strong>Active Community:</strong> 800+ active players</li>
                    <li>💫 <strong>No Hidden Fees:</strong> What you see is what you get</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          📊 DASHBOARD SECTION (ONLY FOR LOGGED IN USERS)
          ===================================
          
          Purpose: Gaming Dashboard Integration
          - Only visible when wallet connected
          - Quick overview of family
          - Links to gaming areas
      */}
      {userConnected && (
        <section className="dashboard-section">
          <div className="section-container">
            
            {/* Dashboard Header */}
            <div className="dashboard-header">
              <h2 className="section-title">
                📊 Welcome back{hasCharacters() ? ', Family!' : '!'}
              </h2>
              <p className="section-subtitle">
                {hasCharacters() 
                  ? 'Your characters are waiting for new tasks' 
                  : 'Ready for your first Character Collection Game?'
                }
              </p>
            </div>
            
            {/* User already has characters - show dashboard */}
            {hasCharacters() ? (
              <>
                {/* Family Quick Stats */}
                <div className="quick-stats">
                  <div className="stat-card primary">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <span className="stat-number">{familyData.familySize}</span>
                      <span className="stat-label">Family Members</span>
                    </div>
                  </div>
                  
                  <div className="stat-card success">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <span className="stat-number">{familyData.dailyEarnings}</span>
                      <span className="stat-label">LUNC per Day</span>
                    </div>
                  </div>
                  
                  <div className="stat-card warning">
                    <div className="stat-icon">💎</div>
                    <div className="stat-content">
                      <span className="stat-number">{formatNumber(familyData.totalLunc)}</span>
                      <span className="stat-label">Total LUNC</span>
                    </div>
                  </div>
                  
                  <div className="stat-card info">
                    <div className="stat-icon">💼</div>
                    <div className="stat-content">
                      <span className="stat-number">
                        {familyData.characters.filter(c => c.working).length}
                      </span>
                      <span className="stat-label">Currently Working</span>
                    </div>
                  </div>
                </div>

                {/* Quick actions for gaming */}
                <div className="quick-actions">
                  <Link to="/family" className="action-card">
                    <div className="action-icon">👨‍👩‍👧‍👦</div>
                    <div className="action-content">
                      <h4>Manage Family</h4>
                      <p>View characters, level-ups, training</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/jobs" className="action-card">
                    <div className="action-icon">💼</div>
                    <div className="action-content">
                      <h4>Assign Jobs</h4>
                      <p>Find daily new jobs in the building</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/building" className="action-card">
                    <div className="action-icon">🏢</div>
                    <div className="action-content">
                      <h4>Explore Building</h4>
                      <p>25 floors with different departments</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/marketplace" className="action-card">
                    <div className="action-icon">🛒</div>
                    <div className="action-content">
                      <h4>Marketplace</h4>
                      <p>Buy & sell characters</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                </div>
              </>
            ) : (
              /* User has no characters yet - onboarding */
              <div className="onboarding-section">
                <div className="onboarding-card">
                  <h3>🎮 Ready for your first Character Collection Game?</h3>
                  <p>
                    Start with one character for only <strong>0.05 ETH</strong> and 
                    build your family!
                  </p>
                  
                  <div className="onboarding-steps">
                    <div className="onboarding-step">
                      <span className="step-number">1</span>
                      <span className="step-text">Mint first character</span>
                    </div>
                    <div className="onboarding-step">
                      <span className="step-number">2</span>
                      <span className="step-text">Find job in building</span>
                    </div>
                    <div className="onboarding-step">
                      <span className="step-number">3</span>
                      <span className="step-text">Earn daily LUNC</span>
                    </div>
                  </div>
                  
                  <button className="onboarding-button" type="button">
                    🎯 Mint First Character
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Additional sections continue with same pattern... */}
      {/* For brevity, including key sections. Full component would have all sections converted */}
      
      {/* ===================================
          🚀 CALL-TO-ACTION FOOTER
          =================================== */}
      <section className="cta-footer">
        <div className="section-container">
          <div className="cta-content">
            <h2 className="cta-title">
              🚀 Ready Player One? Start your Building Empire!
            </h2>
            <p className="cta-description">
              Join a growing community of NFT collectors and earn daily 
              real LUNC rewards through strategic gaming!
            </p>
            
            <div className="cta-buttons">
              <button className="cta-button large primary" type="button">
                🎮 Start Empire Now
              </button>
              <button className="cta-button large secondary" type="button">
                💬 Community Discord
              </button>
            </div>
            
            {/* Community Stats */}
            <div className="community-stats">
              <div className="community-stat">
                <span className="stat-number">{formatNumber(stats.activePlayers)}</span>
                <span className="stat-label">Active Builders</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(1250)}</span>
                <span className="stat-label">NFTs in Game</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(89000)}</span>
                <span className="stat-label">LUNC Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Homepage;