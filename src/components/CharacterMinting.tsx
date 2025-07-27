import React, { useState, useEffect } from 'react';
import { Character, generateRandomCharacter, GAME_CONSTANTS, getRandomCharacterType, formatLuncBalance } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface CharacterMintingProps {
  onCharacterMinted: (characters: Character[]) => void;
  userWallet: string | null;
  luncBalance: number;
}

interface MintPackage {
  id: string;
  name: string;
  count: number;
  price: number;
  guaranteed?: 'rare' | 'legendary';
  bonus: number;
  description: string;
  popular?: boolean;
  discount?: number;
}

interface MintResult {
  characters: Character[];
  totalCost: number;
  bonusLunc: number;
  rareCount: number;
  legendaryCount: number;
}

interface MintAnimation {
  isActive: boolean;
  currentStep: 'preparing' | 'minting' | 'revealing' | 'complete';
  progress: number;
}

// ===================================
// 🎯 CHARACTER MINTING COMPONENT
// ===================================

const CharacterMinting: React.FC<CharacterMintingProps> = ({
  onCharacterMinted,
  userWallet,
  luncBalance
}) => {
  const [selectedPackage, setSelectedPackage] = useState<MintPackage | null>(null);
  const [mintQuantity, setMintQuantity] = useState<number>(1);
  const [mintAnimation, setMintAnimation] = useState<MintAnimation>({
    isActive: false,
    currentStep: 'preparing',
    progress: 0
  });
  const [lastMintResult, setLastMintResult] = useState<MintResult | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [totalMinted, setTotalMinted] = useState<number>(0);

  // Available mint packages
  const mintPackages: MintPackage[] = [
    {
      id: 'starter',
      name: 'Starter Pack',
      count: 1,
      price: GAME_CONSTANTS.MINT_COSTS.common,
      bonus: 50,
      description: 'Perfect for beginners. Single character mint with bonus LUNC.',
      popular: false
    },
    {
      id: 'family',
      name: 'Family Pack',
      count: 3,
      price: GAME_CONSTANTS.MINT_COSTS.common * 3 * 0.9, // 10% discount
      bonus: 200,
      description: 'Build your family! 3 characters with guaranteed rare or better.',
      popular: true,
      discount: 10
    },
    {
      id: 'business',
      name: 'Business Pack',
      count: 5,
      price: GAME_CONSTANTS.MINT_COSTS.rare * 2,
      guaranteed: 'rare',
      bonus: 500,
      description: 'Professional package with guaranteed rare character.',
      popular: false,
      discount: 15
    },
    {
      id: 'enterprise',
      name: 'Enterprise Pack',
      count: 10,
      price: GAME_CONSTANTS.MINT_COSTS.legendary,
      guaranteed: 'legendary',
      bonus: 1000,
      description: 'Ultimate package with guaranteed legendary character!',
      popular: false,
      discount: 20
    }
  ];

  // Calculate mint statistics
  const getMintStats = () => {
    const today = new Date().toDateString();
    const todayMints = parseInt(localStorage.getItem(`mints_${today}`) || '0');
    
    return {
      todayMints,
      totalMinted,
      remainingDaily: Math.max(0, 10 - todayMints), // Daily limit
      canMint: todayMints < 10 && userWallet !== null
    };
  };

  // Simulate character minting with animation
  const startMinting = async (packageInfo: MintPackage): Promise<void> => {
    if (!userWallet) {
      alert('Please connect your wallet first!');
      return;
    }

    if (luncBalance < packageInfo.price) {
      alert('Insufficient LUNC balance!');
      return;
    }

    const stats = getMintStats();
    if (!stats.canMint) {
      alert('Daily minting limit reached!');
      return;
    }

    // Start animation
    setMintAnimation({
      isActive: true,
      currentStep: 'preparing',
      progress: 0
    });

    // Simulate minting process
    const steps = ['preparing', 'minting', 'revealing', 'complete'] as const;
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMintAnimation(prev => ({
        ...prev,
        currentStep: steps[i],
        progress: ((i + 1) / steps.length) * 100
      }));
    }

    // Generate characters
    const mintedCharacters = generateCharacters(packageInfo);
    
    // Create mint result
    const result: MintResult = {
      characters: mintedCharacters,
      totalCost: packageInfo.price,
      bonusLunc: packageInfo.bonus,
      rareCount: mintedCharacters.filter(char => char.type === 'rare').length,
      legendaryCount: mintedCharacters.filter(char => char.type === 'legendary').length
    };

    setLastMintResult(result);
    setShowResults(true);
    
    // Update statistics
    const today = new Date().toDateString();
    const todayMints = parseInt(localStorage.getItem(`mints_${today}`) || '0');
    localStorage.setItem(`mints_${today}`, (todayMints + packageInfo.count).toString());
    setTotalMinted(prev => prev + packageInfo.count);

    // Call parent callback
    onCharacterMinted(mintedCharacters);

    // Reset animation
    setTimeout(() => {
      setMintAnimation({
        isActive: false,
        currentStep: 'preparing',
        progress: 0
      });
    }, 2000);
  };

  // Generate characters based on package
  const generateCharacters = (packageInfo: MintPackage): Character[] => {
    const characters: Character[] = [];
    
    for (let i = 0; i < packageInfo.count; i++) {
      let characterType;
      
      // Handle guaranteed types
      if (packageInfo.guaranteed && i === 0) {
        characterType = packageInfo.guaranteed;
      } else if (packageInfo.guaranteed === 'rare' && packageInfo.count >= 3) {
        // Family pack guarantees at least one rare
        characterType = i === 0 ? 'rare' : getRandomCharacterType();
      } else {
        characterType = getRandomCharacterType();
      }
      
      const character = generateRandomCharacter(characterType);
      characters.push(character);
    }
    
    return characters;
  };

  const stats = getMintStats();

  return (
    <div className="character-minting">
      {/* Header */}
      <div className="minting-header">
        <h1>🎯 Character Minting Center</h1>
        <div className="minting-stats">
          <div className="stat">
            <span className="stat-value">{formatLuncBalance(luncBalance)}</span>
            <span className="stat-label">Your LUNC</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.todayMints}</span>
            <span className="stat-label">Today's Mints</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.remainingDaily}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat">
            <span className="stat-value">{totalMinted}</span>
            <span className="stat-label">Total Minted</span>
          </div>
        </div>
      </div>

      {/* Minting Packages */}
      <div className="minting-packages">
        <h2>Choose Your Minting Package</h2>
        <div className="packages-grid">
          {mintPackages.map(pkg => (
            <div 
              key={pkg.id}
              className={`package-card ${pkg.popular ? 'popular' : ''} ${selectedPackage?.id === pkg.id ? 'selected' : ''}`}
              onClick={() => setSelectedPackage(selectedPackage?.id === pkg.id ? null : pkg)}
            >
              {pkg.popular && <div className="popular-badge">🔥 POPULAR</div>}
              {pkg.discount && <div className="discount-badge">-{pkg.discount}%</div>}
              
              <div className="package-header">
                <h3>{pkg.name}</h3>
                <div className="package-count">{pkg.count} Character{pkg.count > 1 ? 's' : ''}</div>
              </div>
              
              <div className="package-details">
                <div className="price">
                  <span className="price-value">{formatLuncBalance(pkg.price)} LUNC</span>
                  {pkg.discount && (
                    <span className="original-price">
                      {formatLuncBalance(Math.floor(pkg.price * (1 + pkg.discount / 100)))}
                    </span>
                  )}
                </div>
                
                <div className="bonus">
                  +{pkg.bonus} LUNC Bonus
                </div>
                
                {pkg.guaranteed && (
                  <div className="guaranteed">
                    🎁 Guaranteed {pkg.guaranteed === 'legendary' ? '💎' : '⭐'} {pkg.guaranteed}
                  </div>
                )}
                
                <p className="description">{pkg.description}</p>
              </div>
              
              <div className="package-odds">
                <h4>Drop Rates:</h4>
                <div className="odds-list">
                  {pkg.guaranteed === 'legendary' ? (
                    <div className="odd">💎 Legendary: 100% (1st character)</div>
                  ) : pkg.guaranteed === 'rare' ? (
                    <div className="odd">⭐ Rare: 100% (1st character)</div>
                  ) : (
                    <>
                      <div className="odd">👤 Common: {(GAME_CONSTANTS.RARITY_CHANCES.common * 100).toFixed(0)}%</div>
                      <div className="odd">⭐ Rare: {(GAME_CONSTANTS.RARITY_CHANCES.rare * 100).toFixed(0)}%</div>
                      <div className="odd">💎 Legendary: {(GAME_CONSTANTS.RARITY_CHANCES.legendary * 100).toFixed(0)}%</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minting Controls */}
      {selectedPackage && (
        <div className="minting-controls">
          <div className="selected-package-summary">
            <h3>Selected: {selectedPackage.name}</h3>
            <div className="summary-details">
              <span>Characters: {selectedPackage.count}</span>
              <span>Cost: {formatLuncBalance(selectedPackage.price)} LUNC</span>
              <span>Bonus: +{selectedPackage.bonus} LUNC</span>
              {selectedPackage.guaranteed && (
                <span>Guaranteed: {selectedPackage.guaranteed}</span>
              )}
            </div>
          </div>
          
          <button 
            className="mint-button"
            onClick={() => startMinting(selectedPackage)}
            disabled={!stats.canMint || luncBalance < selectedPackage.price || mintAnimation.isActive}
          >
            {mintAnimation.isActive ? (
              <span>🎯 Minting... {Math.round(mintAnimation.progress)}%</span>
            ) : (
              <span>🎯 Mint {selectedPackage.name}</span>
            )}
          </button>
          
          {luncBalance < selectedPackage.price && (
            <p className="insufficient-balance">❌ Insufficient LUNC balance</p>
          )}
          
          {!stats.canMint && (
            <p className="daily-limit">⏰ Daily minting limit reached</p>
          )}
        </div>
      )}

      {/* Minting Animation */}
      {mintAnimation.isActive && (
        <div className="minting-animation-overlay">
          <div className="minting-animation">
            <div className="animation-content">
              <div className="mint-spinner">🎯</div>
              <h3>{getMintStepText(mintAnimation.currentStep)}</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${mintAnimation.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && lastMintResult && (
        <div className="results-modal-overlay" onClick={() => setShowResults(false)}>
          <div className="results-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🎉 Minting Successful!</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowResults(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="results-summary">
                <div className="summary-stat">
                  <span className="stat-value">{lastMintResult.characters.length}</span>
                  <span className="stat-label">Characters Minted</span>
                </div>
                {lastMintResult.rareCount > 0 && (
                  <div className="summary-stat rare">
                    <span className="stat-value">{lastMintResult.rareCount}</span>
                    <span className="stat-label">⭐ Rare</span>
                  </div>
                )}
                {lastMintResult.legendaryCount > 0 && (
                  <div className="summary-stat legendary">
                    <span className="stat-value">{lastMintResult.legendaryCount}</span>
                    <span className="stat-label">💎 Legendary</span>
                  </div>
                )}
                <div className="summary-stat">
                  <span className="stat-value">+{lastMintResult.bonusLunc}</span>
                  <span className="stat-label">Bonus LUNC</span>
                </div>
              </div>
              
              <div className="minted-characters">
                <h3>Your New Characters:</h3>
                <div className="characters-showcase">
                  {lastMintResult.characters.map((character, index) => (
                    <div key={index} className={`character-result ${character.type}`}>
                      <div className="character-avatar">
                        {character.type === 'legendary' ? '💎' : character.type === 'rare' ? '⭐' : '👤'}
                      </div>
                      <div className="character-info">
                        <h4>{character.name}</h4>
                        <p>{character.job}</p>
                        <p>Level {character.level} • {character.type}</p>
                        <p>{character.happiness}% Happiness</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <button 
                className="continue-btn"
                onClick={() => setShowResults(false)}
              >
                🎮 Continue Gaming
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minting Info */}
      <div className="minting-info">
        <h3>ℹ️ Minting Information</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>🎲 Rarity System</h4>
            <ul>
              <li>👤 Common (70%): Basic workers, good for starting</li>
              <li>⭐ Rare (25%): Skilled professionals, higher earnings</li>
              <li>💎 Legendary (5%): Elite executives, maximum potential</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>📋 Daily Limits</h4>
            <ul>
              <li>Maximum 10 characters per day</li>
              <li>Limits reset at midnight UTC</li>
              <li>No limits on family size</li>
            </ul>
          </div>
          
          <div className="info-card">
            <h4>💰 Costs & Bonuses</h4>
            <ul>
              <li>Packages include bonus LUNC</li>
              <li>Bulk packages offer discounts</li>
              <li>All mints are permanent NFTs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for animation text
const getMintStepText = (step: MintAnimation['currentStep']): string => {
  switch (step) {
    case 'preparing': return 'Preparing minting transaction...';
    case 'minting': return 'Minting your characters...';
    case 'revealing': return 'Revealing character traits...';
    case 'complete': return 'Minting complete!';
    default: return 'Processing...';
  }
};

export default CharacterMinting;