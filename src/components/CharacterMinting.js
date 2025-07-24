import React, { useState } from 'react';

const CharacterMinting = ({ onCharacterMinted, userWallet }) => {
  // ===================================
  // 🎯 MINTING STATE
  // ===================================
  
  const [mintAmount, setMintAmount] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingStep, setMintingStep] = useState(''); // 'preparing', 'minting', 'success'
  const [mintedCharacters, setMintedCharacters] = useState([]);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // ===================================
  // 🎮 MINTING CONFIG
  // ===================================
  
  const MINT_CONFIG = {
    price: 0.05, // ETH per Character
    maxPerTx: 10, // Maximum pro Transaction
    totalSupply: 2500,
    minted: 1250, // Simuliert - später aus Contract
    rarityChances: {
      common: 70,    // 70%
      rare: 25,      // 25% 
      legendary: 5   // 5%
    }
  };

  // ===================================
  // 🎲 CHARACTER GENERATION
  // ===================================
  
  // Generiere Charakter basierend auf Rarity
  const generateCharacter = (rarity) => {
    const commonNames = [
      'Alex Worker', 'Sam Helper', 'Jordan Assistant', 'Casey Staff',
      'Riley Employee', 'Morgan Clerk', 'Avery Support', 'Quinn Service'
    ];
    
    const rareNames = [
      'Phoenix Manager', 'River Specialist', 'Sage Coordinator', 'Rowan Expert',
      'Eden Supervisor', 'Nova Leader', 'Atlas Director', 'Luna Professional'
    ];
    
    const legendaryNames = [
      'Sterling Mastermind', 'Platinum Architect', 'Diamond Executive', 'Golden Visionary',
      'Crystal Strategist', 'Titan Builder', 'Phoenix Mogul', 'Quantum Leader'
    ];

    const departments = [
      'Management', 'Operations', 'IT', 'Finance', 'HR', 'Marketing', 
      'Legal', 'Architecture', 'Engineering', 'Design'
    ];

    let names, baseEarnings, levelRange;
    
    switch(rarity) {
      case 'legendary':
        names = legendaryNames;
        baseEarnings = { min: 100, max: 200 };
        levelRange = { min: 20, max: 30 };
        break;
      case 'rare':
        names = rareNames;
        baseEarnings = { min: 40, max: 80 };
        levelRange = { min: 10, max: 20 };
        break;
      default: // common
        names = commonNames;
        baseEarnings = { min: 10, max: 40 };
        levelRange = { min: 1, max: 10 };
    }

    const randomName = names[Math.floor(Math.random() * names.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const dailyEarnings = Math.floor(Math.random() * (baseEarnings.max - baseEarnings.min + 1)) + baseEarnings.min;
    const level = Math.floor(Math.random() * (levelRange.max - levelRange.min + 1)) + levelRange.min;
    const happiness = Math.floor(Math.random() * 21) + 80; // 80-100

    return {
      id: Date.now() + Math.random(), // Temporäre ID
      name: randomName,
      type: rarity,
      department: department,
      job: `${department} ${rarity === 'legendary' ? 'Master' : rarity === 'rare' ? 'Specialist' : 'Worker'}`,
      level: level,
      dailyEarnings: dailyEarnings,
      happiness: happiness,
      working: false,
      mintedAt: new Date().toISOString()
    };
  };

  // Bestimme Rarity basierend auf Wahrscheinlichkeiten
  const determineRarity = () => {
    const random = Math.random() * 100;
    
    if (random <= MINT_CONFIG.rarityChances.legendary) {
      return 'legendary';
    } else if (random <= MINT_CONFIG.rarityChances.legendary + MINT_CONFIG.rarityChances.rare) {
      return 'rare';
    } else {
      return 'common';
    }
  };

  // ===================================
  // 🔨 MINTING FUNCTIONS
  // ===================================
  
  // Mint Charaktere (Simuliert - später echte Blockchain Integration)
  const handleMint = async () => {
    if (!userWallet) {
      setError('Bitte verbinde zuerst deine Wallet!');
      return;
    }

    setIsMinting(true);
    setError('');
    setMintedCharacters([]);
    
    try {
      // Schritt 1: Vorbereitung
      setMintingStep('preparing');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Schritt 2: Minting Simulation
      setMintingStep('minting');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Schritt 3: Charaktere generieren
      const newCharacters = [];
      for (let i = 0; i < mintAmount; i++) {
        const rarity = determineRarity();
        const character = generateCharacter(rarity);
        newCharacters.push(character);
      }
      
      setMintedCharacters(newCharacters);
      setMintingStep('success');
      
      // Charaktere an Parent Component weitergeben
      onCharacterMinted?.(newCharacters);
      
    } catch (error) {
      console.error('Minting error:', error);
      setError('Fehler beim Minten der Charaktere. Versuche es erneut.');
      setMintingStep('');
    } finally {
      setIsMinting(false);
    }
  };

  // Reset Minting State
  const resetMinting = () => {
    setMintingStep('');
    setMintedCharacters([]);
    setError('');
  };

  // ===================================
  // 🎨 UTILITY FUNCTIONS
  // ===================================
  
  // Berechne Gesamtpreis
  const getTotalPrice = () => {
    return (MINT_CONFIG.price * mintAmount).toFixed(3);
  };

  // Rarity Icon
  const getRarityIcon = (rarity) => {
    switch(rarity) {
      case 'legendary': return '💎';
      case 'rare': return '⭐';
      case 'common': return '👤';
      default: return '👤';
    }
  };

  // Rarity Color
  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'legendary': return '#ffd700';
      case 'rare': return '#9d4edd';
      case 'common': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // ===================================
  // 🖼️ RENDER COMPONENT
  // ===================================

  return (
    <div className="character-minting">
      
      {/* Minting Header */}
      <div className="minting-header">
        <h2 className="minting-title">🎯 Charaktere minten</h2>
        <p className="minting-subtitle">
          Sammle einzigartige NFT-Charaktere für deine Virtual Building Empire Familie!
        </p>
      </div>

      {/* Supply Stats */}
      <div className="supply-stats">
        <div className="supply-item">
          <span className="supply-number">{MINT_CONFIG.minted.toLocaleString()}</span>
          <span className="supply-label">Geminted</span>
        </div>
        <div className="supply-item">
          <span className="supply-number">{(MINT_CONFIG.totalSupply - MINT_CONFIG.minted).toLocaleString()}</span>
          <span className="supply-label">Verfügbar</span>
        </div>
        <div className="supply-item">
          <span className="supply-number">{MINT_CONFIG.totalSupply.toLocaleString()}</span>
          <span className="supply-label">Gesamt</span>
        </div>
      </div>

      {/* Minting Interface */}
      {!isMinting && mintingStep !== 'success' && (
        <div className="minting-interface">
          
          {/* Amount Selector */}
          <div className="amount-selector">
            <label className="amount-label">Anzahl Charaktere:</label>
            <div className="amount-controls">
              <button 
                className="amount-btn minus"
                onClick={() => setMintAmount(Math.max(1, mintAmount - 1))}
                disabled={mintAmount <= 1}
              >
                −
              </button>
              <span className="amount-display">{mintAmount}</span>
              <button 
                className="amount-btn plus"
                onClick={() => setMintAmount(Math.min(MINT_CONFIG.maxPerTx, mintAmount + 1))}
                disabled={mintAmount >= MINT_CONFIG.maxPerTx}
              >
                +
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="price-display">
            <div className="price-breakdown">
              <span className="price-item">
                {mintAmount} × {MINT_CONFIG.price} ETH = <strong>{getTotalPrice()} ETH</strong>
              </span>
            </div>
            <div className="price-usd">
              ≈ ${(parseFloat(getTotalPrice()) * 2500).toFixed(0)} USD
            </div>
          </div>

          {/* Rarity Info */}
          <div className="rarity-info">
            <h4>🎲 Seltenheits-Chancen:</h4>
            <div className="rarity-chances">
              <div className="rarity-chance">
                <span className="rarity-icon">💎</span>
                <span className="rarity-name">Legendary</span>
                <span className="rarity-percent">{MINT_CONFIG.rarityChances.legendary}%</span>
              </div>
              <div className="rarity-chance">
                <span className="rarity-icon">⭐</span>
                <span className="rarity-name">Rare</span>
                <span className="rarity-percent">{MINT_CONFIG.rarityChances.rare}%</span>
              </div>
              <div className="rarity-chance">
                <span className="rarity-icon">👤</span>
                <span className="rarity-name">Common</span>
                <span className="rarity-percent">{MINT_CONFIG.rarityChances.common}%</span>
              </div>
            </div>
          </div>

          {/* Mint Button */}
          <button 
            className="mint-button"
            onClick={handleMint}
            disabled={!userWallet}
          >
            {!userWallet ? (
              '🔌 Wallet verbinden zum Minten'
            ) : (
              `🎯 ${mintAmount} Charakter${mintAmount > 1 ? 'e' : ''} minten`
            )}
          </button>

          {/* Error Display */}
          {error && (
            <div className="minting-error">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Minting Progress */}
      {isMinting && (
        <div className="minting-progress">
          <div className="progress-header">
            <h3>🔄 Charaktere werden geminted...</h3>
          </div>
          
          <div className="progress-steps">
            <div className={`progress-step ${mintingStep === 'preparing' ? 'active' : mintingStep === 'minting' || mintingStep === 'success' ? 'completed' : ''}`}>
              <span className="step-icon">⚙️</span>
              <span className="step-text">Vorbereitung</span>
            </div>
            <div className={`progress-step ${mintingStep === 'minting' ? 'active' : mintingStep === 'success' ? 'completed' : ''}`}>
              <span className="step-icon">🎲</span>
              <span className="step-text">Minting</span>
            </div>
            <div className={`progress-step ${mintingStep === 'success' ? 'active completed' : ''}`}>
              <span className="step-icon">✅</span>
              <span className="step-text">Abgeschlossen</span>
            </div>
          </div>
          
          <div className="progress-info">
            {mintingStep === 'preparing' && 'Bereite Transaktion vor...'}
            {mintingStep === 'minting' && 'Generiere deine Charaktere...'}
          </div>
        </div>
      )}

      {/* Success - Show Minted Characters */}
      {mintingStep === 'success' && mintedCharacters.length > 0 && (
        <div className="minting-success">
          <div className="success-header">
            <h3>🎉 Glückwunsch! Du hast {mintedCharacters.length} Charakter{mintedCharacters.length > 1 ? 'e' : ''} geminted!</h3>
          </div>
          
          <div className="minted-characters">
            {mintedCharacters.map((character, index) => (
              <div key={character.id} className={`minted-character ${character.type}`}>
                <div className="character-header">
                  <span className="character-rarity" style={{color: getRarityColor(character.type)}}>
                    {getRarityIcon(character.type)}
                  </span>
                  <h4 className="character-name">{character.name}</h4>
                </div>
                
                <div className="character-details">
                  <p className="character-job">{character.job}</p>
                  <div className="character-stats">
                    <span className="stat">Level {character.level}</span>
                    <span className="stat">{character.dailyEarnings} LUNC/Tag</span>
                    <span className="stat">{character.happiness}% Happy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="success-actions">
            <button className="success-action primary" onClick={() => {
              // Navigation zur Familie
              window.location.href = '/family';
            }}>
              👨‍👩‍👧‍👦 Familie ansehen
            </button>
            
            <button className="success-action secondary" onClick={resetMinting}>
              🎯 Weitere minten
            </button>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="minting-info">
        <h4>💡 Wichtige Informationen:</h4>
        <ul>
          <li>🎮 <strong>Entertainment Only:</strong> Rein für Gaming-Zwecke</li>
          <li>💎 <strong>LUNC Rewards:</strong> Charaktere verdienen täglich LUNC Token</li>
          <li>🏢 <strong>Gebäude Jobs:</strong> Weise Jobs im 25-stöckigen Gebäude zu</li>
          <li>👥 <strong>Familie Boni:</strong> Größere Familien erhalten Bonus-Rewards</li>
          <li>⚖️ <strong>Dubai LLC:</strong> Vollständig konform und legal</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacterMinting;