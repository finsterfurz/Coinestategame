import React, { useState } from 'react';

const Marketplace = ({ familyData, setFamilyData }) => {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);

  // Marktplatz Charaktere (simuliert)
  const marketplaceCharacters = [
    {
      id: 'market-001',
      name: 'Sarah Sales',
      type: 'rare',
      level: 18,
      specialization: 'Vertrieb',
      price: 850,
      seller: 'Familie Müller',
      dailyEarning: 75,
      happiness: 88,
      description: 'Erfahrene Vertriebsspezialistin mit hohen Abschlussraten'
    },
    {
      id: 'market-002',
      name: 'Dr. Klaus Code',
      type: 'legendary',
      level: 30,
      specialization: 'Software Architektur',
      price: 2500,
      seller: 'Familie Schmidt',
      dailyEarning: 180,
      happiness: 95,
      description: 'Legendärer Software Architekt - kann Premium IT-Jobs übernehmen'
    },
    {
      id: 'market-003',
      name: 'Tim Tidy',
      type: 'common',
      level: 8,
      specialization: 'Reinigung',
      price: 200,
      seller: 'Familie Weber',
      dailyEarning: 25,
      happiness: 78,
      description: 'Zuverlässiger Reinigungskraft - perfekt für den Einstieg'
    },
    {
      id: 'market-004',
      name: 'Maria Marketing',
      type: 'rare',
      level: 22,
      specialization: 'Marketing',
      price: 1200,
      seller: 'Familie Klein',
      dailyEarning: 95,
      happiness: 92,
      description: 'Kreative Marketing-Expertin mit Social Media Skills'
    },
    {
      id: 'market-005',
      name: 'Frank Finance',
      type: 'rare',
      level: 25,
      specialization: 'Finanzen',
      price: 1500,
      seller: 'Familie Gross',
      dailyEarning: 110,
      happiness: 85,
      description: 'Erfahrener Finanzanalyst - optimiert Familie-Einnahmen'
    }
  ];

  const handlePurchase = (character) => {
    if (familyData.totalLunc >= character.price) {
      // Kaufe Charakter
      const newCharacter = {
        id: Date.now(), // Unique ID
        name: character.name,
        type: character.type,
        level: character.level,
        job: `${character.specialization} Spezialist`,
        dailyEarnings: character.dailyEarning,
        happiness: character.happiness,
        working: false,
        department: character.specialization
      };

      setFamilyData(prev => ({
        ...prev,
        characters: [...prev.characters, newCharacter],
        familySize: prev.familySize + 1,
        totalLunc: prev.totalLunc - character.price
      }));

      alert(`🎉 ${character.name} wurde deiner Familie hinzugefügt!`);
    } else {
      alert('💰 Nicht genug LUNC für diesen Kauf!');
    }
  };

  const handleSellCharacter = (character) => {
    const salePrice = Math.floor(character.level * 50 + (character.type === 'legendary' ? 1000 : character.type === 'rare' ? 500 : 100));
    
    setFamilyData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== character.id),
      familySize: prev.familySize - 1,
      totalLunc: prev.totalLunc + salePrice
    }));

    alert(`💰 ${character.name} für ${salePrice} LUNC verkauft!`);
  };

  const getRarityColor = (type) => {
    switch(type) {
      case 'common': return '#6c757d';
      case 'rare': return '#17a2b8';
      case 'legendary': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getRarityName = (type) => {
    switch(type) {
      case 'common': return 'Gewöhnlich';
      case 'rare': return 'Selten';
      case 'legendary': return 'Legendär';
      default: return 'Unbekannt';
    }
  };

  return (
    <div className="marketplace">
      <div className="game-card">
        <h1>🛒 Charakter Marktplatz</h1>
        <p>Handel mit anderen Familien - kaufe neue Charaktere oder verkaufe überschüssige Familie-Mitglieder</p>
      </div>

      {/* LUNC Balance */}
      <div className="game-card">
        <div className="marketplace-balance">
          <h2>💰 Dein LUNC Guthaben: {familyData.totalLunc.toLocaleString()}</h2>
          <p>Nutze deine LUNC um neue Charaktere zu kaufen und deine Familie zu vergrößern</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="game-card">
        <div className="marketplace-tabs">
          <button 
            className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveTab('buy')}
          >
            🛒 Kaufen
          </button>
          <button 
            className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            💰 Verkaufen
          </button>
          <button 
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Handel History
          </button>
        </div>
      </div>

      {/* Kaufen Tab */}
      {activeTab === 'buy' && (
        <div className="game-card">
          <h2>🛒 Charaktere zum Verkauf</h2>
          <div className="marketplace-grid">
            {marketplaceCharacters.map(character => (
              <div key={character.id} className={`marketplace-card ${character.type}`}>
                <div className="character-header">
                  <h3>{character.name}</h3>
                  <span 
                    className="rarity-badge"
                    style={{backgroundColor: getRarityColor(character.type)}}
                  >
                    {getRarityName(character.type)}
                  </span>
                </div>
                
                <div className="character-details">
                  <p><strong>Level:</strong> {character.level}</p>
                  <p><strong>Spezialisierung:</strong> {character.specialization}</p>
                  <p><strong>Tägliche LUNC:</strong> {character.dailyEarning}</p>
                  <p><strong>Zufriedenheit:</strong> {character.happiness}%</p>
                  <p className="character-description">{character.description}</p>
                </div>
                
                <div className="marketplace-footer">
                  <div className="seller-info">
                    <small>Verkauft von: {character.seller}</small>
                  </div>
                  <div className="price-section">
                    <div className="price">{character.price.toLocaleString()} LUNC</div>
                    <button 
                      className={`game-button ${familyData.totalLunc >= character.price ? '' : 'disabled'}`}
                      onClick={() => handlePurchase(character)}
                      disabled={familyData.totalLunc < character.price}
                    >
                      {familyData.totalLunc >= character.price ? '🛒 Kaufen' : '💰 Zu teuer'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Verkaufen Tab */}
      {activeTab === 'sell' && (
        <div className="game-card">
          <h2>💰 Deine Charaktere verkaufen</h2>
          {familyData.characters.length > 0 ? (
            <div className="sell-grid">
              {familyData.characters.map(character => {
                const estimatedPrice = Math.floor(character.level * 50 + (character.type === 'legendary' ? 1000 : character.type === 'rare' ? 500 : 100));
                return (
                  <div key={character.id} className={`sell-card ${character.type}`}>
                    <h4>{character.name}</h4>
                    <div className="sell-details">
                      <p><strong>Level:</strong> {character.level}</p>
                      <p><strong>Typ:</strong> {getRarityName(character.type)}</p>
                      <p><strong>Job:</strong> {character.job}</p>
                      <p><strong>Tägliche LUNC:</strong> {character.dailyEarnings}</p>
                    </div>
                    <div className="sell-footer">
                      <div className="estimated-price">
                        Schätzwert: {estimatedPrice} LUNC
                      </div>
                      <button 
                        className="game-button sell-button"
                        onClick={() => handleSellCharacter(character)}
                      >
                        💰 Verkaufen
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>Du hast noch keine Charaktere zum Verkaufen.</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="game-card">
          <h2>📊 Deine Handel History</h2>
          <div className="trade-history">
            <div className="history-item buy">
              <span className="history-icon">🛒</span>
              <div className="history-details">
                <p><strong>Gekauft:</strong> Max Manager</p>
                <p>Preis: 750 LUNC | vor 2 Tagen</p>
              </div>
            </div>
            <div className="history-item sell">
              <span className="history-icon">💰</span>
              <div className="history-details">
                <p><strong>Verkauft:</strong> Old Worker</p>
                <p>Preis: 150 LUNC | vor 5 Tagen</p>
              </div>
            </div>
            <div className="history-item buy">
              <span className="history-icon">🛒</span>
              <div className="history-details">
                <p><strong>Gekauft:</strong> Anna Admin</p>
                <p>Preis: 300 LUNC | vor 1 Woche</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marktplatz Tipps */}
      <div className="game-card">
        <h2>💡 Marktplatz Tipps</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h4>💰 Investition</h4>
            <p>Legendäre Charaktere sind teuer, aber verdienen langfristig mehr LUNC</p>
          </div>
          <div className="tip-card">
            <h4>📈 Verkaufszeit</h4>
            <p>Verkaufe Charaktere nach Level-Ups für bessere Preise</p>
          </div>
          <div className="tip-card">
            <h4>🎆 Events</h4>
            <p>Während Gebäude-Events steigen die Charakter-Preise</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;