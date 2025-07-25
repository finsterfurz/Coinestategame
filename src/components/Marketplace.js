import React, { useState, useEffect } from 'react';

const Marketplace = ({ familyData, setFamilyData, userConnected }) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  const [marketListings, setMarketListings] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [viewMode, setViewMode] = useState('buy'); // 'buy', 'sell', 'history'
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('price'); // 'price', 'level', 'earnings', 'rarity'
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10 });
  const [sellPrice, setSellPrice] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  // ===================================
  // 🛒 MARKETPLACE CONFIGURATION
  // ===================================
  
  const MARKETPLACE_CONFIG = {
    feePercentage: 2.5, // 2.5% Marketplace Fee
    minPrice: 0.01,
    maxPrice: 50,
    currency: 'ETH',
    priceSteps: 0.01
  };

  // ===================================
  // 📊 MARKETPLACE DATA INITIALIZATION
  // ===================================
  
  useEffect(() => {
    generateMarketListings();
    loadTransactionHistory();
  }, []);

  // Generiere Marktplatz Listings (Demo)
  const generateMarketListings = () => {
    const listings = [];
    
    // Demo Characters für Verkauf
    const demoCharacters = [
      {
        id: 'market_1',
        name: 'Alex Architect',
        type: 'legendary',
        job: 'Master Builder',
        level: 28,
        dailyEarnings: 180,
        happiness: 95,
        department: 'Architecture',
        price: 4.2,
        seller: '0x1234...5678',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h ago
        featured: true
      },
      {
        id: 'market_2',
        name: 'Sarah Senior',
        type: 'rare',
        job: 'Financial Analyst',
        level: 18,
        dailyEarnings: 95,
        happiness: 88,
        department: 'Finance',
        price: 1.8,
        seller: '0x9876...4321',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12h ago
        featured: false
      },
      {
        id: 'market_3',
        name: 'Mike Manager',
        type: 'rare',
        job: 'Team Lead',
        level: 22,
        dailyEarnings: 110,
        happiness: 92,
        department: 'Management',
        price: 2.5,
        seller: '0x5555...7777',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3h ago
        featured: true
      },
      {
        id: 'market_4',
        name: 'Linda Logic',
        type: 'common',
        job: 'IT Support',
        level: 12,
        dailyEarnings: 45,
        happiness: 78,
        department: 'IT',
        price: 0.35,
        seller: '0x3333...9999',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24h ago
        featured: false
      },
      {
        id: 'market_5',
        name: 'Crystal CEO',
        type: 'legendary',
        job: 'Chief Executive',
        level: 30,
        dailyEarnings: 250,
        happiness: 98,
        department: 'Management',
        price: 8.5,
        seller: '0x1111...2222',
        listedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
        featured: true
      },
      {
        id: 'market_6',
        name: 'Tom Technical',
        type: 'rare',
        job: 'Systems Engineer',
        level: 16,
        dailyEarnings: 78,
        happiness: 85,
        department: 'IT',
        price: 1.2,
        seller: '0x4444...6666',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8h ago
        featured: false
      },
      {
        id: 'market_7',
        name: 'Emma Expert',
        type: 'common',
        job: 'Customer Service',
        level: 9,
        dailyEarnings: 32,
        happiness: 82,
        department: 'Service',
        price: 0.25,
        seller: '0x7777...8888',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18h ago
        featured: false
      },
      {
        id: 'market_8',
        name: 'David Director',
        type: 'rare',
        job: 'Operations Director',
        level: 24,
        dailyEarnings: 135,
        happiness: 90,
        department: 'Operations',
        price: 3.2,
        seller: '0x8888...1111',
        listedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5h ago
        featured: true
      }
    ];
    
    setMarketListings(demoCharacters);
  };

  // Lade Transaktionshistorie
  const loadTransactionHistory = () => {
    const history = [
      {
        id: 'tx_1',
        type: 'purchase',
        character: 'Max Manager',
        price: 1.5,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        status: 'completed'
      },
      {
        id: 'tx_2',
        type: 'sale',
        character: 'Old Worker',
        price: 0.8,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        status: 'completed'
      }
    ];
    
    setTransactionHistory(history);
  };

  // ===================================
  // 🛒 MARKETPLACE FUNCTIONS
  // ===================================
  
  // Kaufe Charakter
  const buyCharacter = async (character) => {
    if (!userConnected) {
      alert('Bitte verbinde deine Wallet!');
      return;
    }
    
    // Simulate purchase
    const confirmation = window.confirm(
      `Möchtest du ${character.name} für ${character.price} ETH kaufen?\n\n` +
      `+ Marketplace Fee: ${(character.price * MARKETPLACE_CONFIG.feePercentage / 100).toFixed(3)} ETH\n` +
      `= Gesamt: ${(character.price * (1 + MARKETPLACE_CONFIG.feePercentage / 100)).toFixed(3)} ETH`
    );
    
    if (!confirmation) return;
    
    // Add to family
    const newCharacter = {
      ...character,
      id: Date.now(), // New ID for owned character
      working: false,
      purchasedAt: new Date()
    };
    
    const updatedCharacters = [...familyData.characters, newCharacter];
    setFamilyData(prev => ({
      ...prev,
      characters: updatedCharacters,
      familySize: updatedCharacters.length
    }));
    
    // Remove from marketplace
    setMarketListings(prev => prev.filter(listing => listing.id !== character.id));
    
    // Add to transaction history
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'purchase',
      character: character.name,
      price: character.price,
      timestamp: new Date(),
      status: 'completed'
    };
    
    setTransactionHistory(prev => [transaction, ...prev]);
    
    alert(`🎉 ${character.name} erfolgreich gekauft! Willkommen in der Familie!`);
  };

  // Verkaufe Charakter
  const sellCharacter = () => {
    if (!selectedCharacter || !sellPrice) {
      alert('Bitte wähle einen Charakter und setze einen Preis!');
      return;
    }
    
    const price = parseFloat(sellPrice);
    if (price < MARKETPLACE_CONFIG.minPrice || price > MARKETPLACE_CONFIG.maxPrice) {
      alert(`Preis muss zwischen ${MARKETPLACE_CONFIG.minPrice} und ${MARKETPLACE_CONFIG.maxPrice} ETH liegen!`);
      return;
    }
    
    const confirmation = window.confirm(
      `Möchtest du ${selectedCharacter.name} für ${price} ETH verkaufen?\n\n` +
      `- Marketplace Fee: ${(price * MARKETPLACE_CONFIG.feePercentage / 100).toFixed(3)} ETH\n` +
      `= Du erhältst: ${(price * (1 - MARKETPLACE_CONFIG.feePercentage / 100)).toFixed(3)} ETH`
    );
    
    if (!confirmation) return;
    
    // Add to marketplace
    const marketListing = {
      ...selectedCharacter,
      id: `market_${Date.now()}`,
      price: price,
      seller: 'Your Address', // In real app, use actual wallet address
      listedAt: new Date(),
      featured: false
    };
    
    setMarketListings(prev => [marketListing, ...prev]);
    
    // Remove from family
    const updatedCharacters = familyData.characters.filter(char => char.id !== selectedCharacter.id);
    setFamilyData(prev => ({
      ...prev,
      characters: updatedCharacters,
      familySize: updatedCharacters.length
    }));
    
    // Add to transaction history
    const transaction = {
      id: `tx_${Date.now()}`,
      type: 'sale',
      character: selectedCharacter.name,
      price: price,
      timestamp: new Date(),
      status: 'pending'
    };
    
    setTransactionHistory(prev => [transaction, ...prev]);
    
    // Reset selections
    setSelectedCharacter(null);
    setSellPrice('');
    
    alert(`📈 ${selectedCharacter.name} erfolgreich zum Verkauf eingestellt!`);
  };

  // ===================================
  // 🎨 FILTER & SORT FUNCTIONS
  // ===================================
  
  // Filtere Marketplace Listings
  const getFilteredListings = () => {
    let filtered = [...marketListings];
    
    // Rarity Filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(char => char.type === filterRarity);
    }
    
    // Price Range Filter
    filtered = filtered.filter(char => 
      char.price >= priceRange.min && char.price <= priceRange.max
    );
    
    // Sortierung
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'level':
          return b.level - a.level;
        case 'earnings':
          return b.dailyEarnings - a.dailyEarnings;
        case 'rarity':
          const rarityOrder = { legendary: 3, rare: 2, common: 1 };
          return rarityOrder[b.type] - rarityOrder[a.type];
        case 'price':
        default:
          return a.price - b.price; // Cheapest first
      }
    });
    
    // Featured Items first
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    
    return filtered;
  };

  // Verkaufbare Charaktere (nicht arbeitend)
  const getSellableCharacters = () => {
    return familyData.characters.filter(char => !char.working);
  };

  // ===================================
  // 🎯 UTILITY FUNCTIONS
  // ===================================
  
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

  // Time since listed
  const getTimeSinceListed = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
    } else if (diffHours > 0) {
      return `vor ${diffHours} Std`;
    } else {
      return 'gerade gelistet';
    }
  };

  // Calculate ROI potential
  const calculateROI = (character) => {
    const dailyEthEarnings = character.dailyEarnings * 0.0001; // Example conversion rate
    const daysToROI = character.price / dailyEthEarnings;
    return Math.round(daysToROI);
  };

  const filteredListings = getFilteredListings();
  const sellableCharacters = getSellableCharacters();

  return (
    <div className="marketplace">
      
      {/* Marketplace Header */}
      <div className="marketplace-header">
        <h1 className="marketplace-title">🛒 NFT Marketplace</h1>
        <p className="marketplace-subtitle">
          Kaufe und verkaufe einzigartige Charaktere für deine Virtual Building Empire Familie
        </p>
      </div>

      {/* Marketplace Stats */}
      <div className="marketplace-stats">
        <div className="stat-card primary">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <span className="stat-number">{filteredListings.length}</span>
            <span className="stat-label">Zum Verkauf</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">
              {filteredListings.length > 0 
                ? `${Math.min(...filteredListings.map(l => l.price)).toFixed(2)}Ξ`
                : '0Ξ'
              }
            </span>
            <span className="stat-label">Günstigster Preis</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-number">{sellableCharacters.length}</span>
            <span className="stat-label">Verkaufbar</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">{transactionHistory.length}</span>
            <span className="stat-label">Transaktionen</span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="marketplace-tabs">
        <button 
          className={`tab-btn ${viewMode === 'buy' ? 'active' : ''}`}
          onClick={() => setViewMode('buy')}
        >
          🛒 Kaufen
        </button>
        <button 
          className={`tab-btn ${viewMode === 'sell' ? 'active' : ''}`}
          onClick={() => setViewMode('sell')}
        >
          📈 Verkaufen
        </button>
        <button 
          className={`tab-btn ${viewMode === 'history' ? 'active' : ''}`}
          onClick={() => setViewMode('history')}
        >
          📊 Historie
        </button>
      </div>

      {/* Buy Mode */}
      {viewMode === 'buy' && (
        <div className="buy-section">
          
          {/* Filters & Controls */}
          <div className="marketplace-controls">
            <div className="filter-section">
              <div className="control-group">
                <label>💎 Seltenheit:</label>
                <select 
                  value={filterRarity}
                  onChange={(e) => setFilterRarity(e.target.value)}
                  className="control-select"
                >
                  <option value="all">Alle Seltenheiten</option>
                  <option value="legendary">Legendary</option>
                  <option value="rare">Rare</option>
                  <option value="common">Common</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>📊 Sortieren:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="control-select"
                >
                  <option value="price">Preis (niedrig → hoch)</option>
                  <option value="level">Level (hoch → niedrig)</option>
                  <option value="earnings">LUNC Verdienst</option>
                  <option value="rarity">Seltenheit</option>
                </select>
              </div>
              
              <div className="control-group">
                <label>💰 Preis ({MARKETPLACE_CONFIG.currency}):</label>
                <div className="price-range">
                  <input 
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                    className="price-input"
                    step={MARKETPLACE_CONFIG.priceSteps}
                    min={MARKETPLACE_CONFIG.minPrice}
                  />
                  <span>-</span>
                  <input 
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                    className="price-input"
                    step={MARKETPLACE_CONFIG.priceSteps}
                    max={MARKETPLACE_CONFIG.maxPrice}
                  />
                </div>
              </div>
            </div>
            
            <button 
              className="refresh-btn"
              onClick={generateMarketListings}
            >
              🔄 Aktualisieren
            </button>
          </div>

          {/* Marketplace Listings */}
          <div className="marketplace-listings">
            {filteredListings.length === 0 ? (
              <div className="no-listings">
                <h3>🛒 Keine Charaktere gefunden</h3>
                <p>Versuche andere Filter oder komme später wieder!</p>
              </div>
            ) : (
              <div className="listings-grid">
                {filteredListings.map(character => (
                  <div 
                    key={character.id}
                    className={`listing-card ${character.type} ${character.featured ? 'featured' : ''}`}
                  >
                    {character.featured && (
                      <div className="featured-badge">⭐ Featured</div>
                    )}
                    
                    <div className="listing-header">
                      <div className="character-rarity">
                        <span 
                          className="rarity-icon"
                          style={{ color: getRarityColor(character.type) }}
                        >
                          {getRarityIcon(character.type)}
                        </span>
                        <span className="rarity-label">{character.type}</span>
                      </div>
                      
                      <div className="listing-price">
                        <span className="price-amount">{character.price}</span>
                        <span className="price-currency">ETH</span>
                      </div>
                    </div>
                    
                    <div className="character-info">
                      <h3 className="character-name">{character.name}</h3>
                      <p className="character-job">{character.job}</p>
                      <p className="character-department">{character.department}</p>
                    </div>
                    
                    <div className="character-stats">
                      <div className="stat-row">
                        <span className="stat-label">📊 Level:</span>
                        <span className="stat-value">{character.level}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">💰 LUNC/Tag:</span>
                        <span className="stat-value">{character.dailyEarnings}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">😊 Happiness:</span>
                        <span className="stat-value">{character.happiness}%</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">📈 ROI:</span>
                        <span className="stat-value">~{calculateROI(character)} Tage</span>
                      </div>
                    </div>
                    
                    <div className="listing-footer">
                      <div className="listing-meta">
                        <span className="seller">Von: {character.seller.slice(0, 6)}...{character.seller.slice(-4)}</span>
                        <span className="listed-time">{getTimeSinceListed(character.listedAt)}</span>
                      </div>
                      
                      <button 
                        className="buy-btn"
                        onClick={() => buyCharacter(character)}
                        disabled={!userConnected}
                      >
                        {userConnected ? '🛒 Kaufen' : '🔒 Wallet verbinden'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sell Mode */}
      {viewMode === 'sell' && (
        <div className="sell-section">
          <h2>📈 Charaktere verkaufen</h2>
          
          {sellableCharacters.length === 0 ? (
            <div className="no-sellable">
              <h3>😔 Keine verkaufbaren Charaktere</h3>
              <p>Alle deine Charaktere arbeiten gerade. Pausiere einen Charakter um ihn zu verkaufen!</p>
            </div>
          ) : (
            <div className="sell-content">
              
              {/* Character Selection */}
              <div className="character-selection">
                <h3>👥 Wähle einen Charakter zum Verkaufen:</h3>
                <div className="sellable-characters">
                  {sellableCharacters.map(character => (
                    <div 
                      key={character.id}
                      className={`sellable-character ${character.type} ${
                        selectedCharacter?.id === character.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedCharacter(
                        selectedCharacter?.id === character.id ? null : character
                      )}
                    >
                      <div className="char-header">
                        <span className="rarity-icon" style={{ color: getRarityColor(character.type) }}>
                          {getRarityIcon(character.type)}
                        </span>
                        <h4>{character.name}</h4>
                      </div>
                      
                      <div className="char-details">
                        <p>Level {character.level} {character.job}</p>
                        <p>💰 {character.dailyEarnings} LUNC/Tag</p>
                        <p>😊 {character.happiness}% Happy</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Price Setting */}
              {selectedCharacter && (
                <div className="price-setting">
                  <h3>💰 Verkaufspreis festlegen</h3>
                  
                  <div className="price-input-section">
                    <div className="suggested-prices">
                      <h4>💡 Preisvorschläge:</h4>
                      <div className="price-suggestions">
                        <button 
                          className="price-suggestion"
                          onClick={() => setSellPrice('0.5')}
                        >
                          🟢 Schnell (0.5 ETH)
                        </button>
                        <button 
                          className="price-suggestion"
                          onClick={() => setSellPrice('1.0')}
                        >
                          🟡 Markt (1.0 ETH)
                        </button>
                        <button 
                          className="price-suggestion"
                          onClick={() => setSellPrice('2.0')}
                        >
                          🔴 Premium (2.0 ETH)
                        </button>
                      </div>
                    </div>
                    
                    <div className="custom-price">
                      <label>🎯 Eigener Preis:</label>
                      <div className="price-input-group">
                        <input 
                          type="number"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(e.target.value)}
                          placeholder="0.00"
                          step={MARKETPLACE_CONFIG.priceSteps}
                          min={MARKETPLACE_CONFIG.minPrice}
                          max={MARKETPLACE_CONFIG.maxPrice}
                          className="sell-price-input"
                        />
                        <span className="currency-label">ETH</span>
                      </div>
                    </div>
                    
                    {sellPrice && (
                      <div className="price-breakdown">
                        <div className="breakdown-item">
                          <span>💰 Verkaufspreis:</span>
                          <span>{sellPrice} ETH</span>
                        </div>
                        <div className="breakdown-item fee">
                          <span>📋 Marketplace Fee ({MARKETPLACE_CONFIG.feePercentage}%):</span>
                          <span>-{(sellPrice * MARKETPLACE_CONFIG.feePercentage / 100).toFixed(3)} ETH</span>
                        </div>
                        <div className="breakdown-item total">
                          <span>✅ Du erhältst:</span>
                          <span>{(sellPrice * (1 - MARKETPLACE_CONFIG.feePercentage / 100)).toFixed(3)} ETH</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    className="sell-button"
                    onClick={sellCharacter}
                    disabled={!sellPrice || parseFloat(sellPrice) < MARKETPLACE_CONFIG.minPrice}
                  >
                    📈 {selectedCharacter.name} verkaufen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* History Mode */}
      {viewMode === 'history' && (
        <div className="history-section">
          <h2>📊 Transaktionshistorie</h2>
          
          {transactionHistory.length === 0 ? (
            <div className="no-history">
              <h3>📝 Keine Transaktionen</h3>
              <p>Deine Käufe und Verkäufe werden hier angezeigt.</p>
            </div>
          ) : (
            <div className="history-list">
              {transactionHistory.map(tx => (
                <div key={tx.id} className={`history-item ${tx.type}`}>
                  <div className="tx-icon">
                    {tx.type === 'purchase' ? '🛒' : '📈'}
                  </div>
                  
                  <div className="tx-info">
                    <h4>{tx.type === 'purchase' ? 'Gekauft' : 'Verkauft'}: {tx.character}</h4>
                    <p>💰 {tx.price} ETH</p>
                    <p>📅 {tx.timestamp.toLocaleDateString('de-DE')}</p>
                  </div>
                  
                  <div className="tx-status">
                    <span className={`status-badge ${tx.status}`}>
                      {tx.status === 'completed' ? '✅ Abgeschlossen' : '⏳ Ausstehend'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Marketplace;