import React, { useState, useEffect } from 'react';
import { Character, calculateEarnings, formatLuncBalance, GAME_CONSTANTS } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
}

interface MarketplaceProps {
  familyData: FamilyData;
  setFamilyData: (data: FamilyData) => void;
  userConnected: boolean;
  onTrade?: (type: 'buy' | 'sell', character: string, price: number) => void;
}

interface MarketListing {
  id: string;
  character: Character;
  price: number;
  seller: string;
  listedAt: Date;
  featured: boolean;
  condition: 'excellent' | 'good' | 'fair';
  negotiable: boolean;
}

interface TradeOffer {
  id: string;
  listingId: string;
  buyerAddress: string;
  offerPrice: number;
  message?: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
}

type MarketFilter = {
  type: 'all' | 'common' | 'rare' | 'legendary';
  priceRange: 'all' | 'low' | 'medium' | 'high';
  level: 'all' | 'beginner' | 'intermediate' | 'advanced';
  availability: 'all' | 'available' | 'featured';
};

type SortOption = 'price_low' | 'price_high' | 'level_high' | 'level_low' | 'earnings_high' | 'newest' | 'featured';

// ===================================
// 🛒 MARKETPLACE COMPONENT
// ===================================

const Marketplace: React.FC<MarketplaceProps> = ({
  familyData,
  setFamilyData,
  userConnected,
  onTrade
}) => {
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [selectedListing, setSelectedListing] = useState<MarketListing | null>(null);
  const [viewMode, setViewMode] = useState<'buy' | 'sell' | 'my_listings'>('buy');
  const [filters, setFilters] = useState<MarketFilter>({
    type: 'all',
    priceRange: 'all',
    level: 'all',
    availability: 'all'
  });
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sellCharacter, setSellCharacter] = useState<Character | null>(null);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [tradeOffers, setTradeOffers] = useState<TradeOffer[]>([]);
  const [showMakeOffer, setShowMakeOffer] = useState<boolean>(false);
  const [offerPrice, setOfferPrice] = useState<number>(0);

  // Generate mock marketplace listings
  useEffect(() => {
    const generateMarketListings = (): MarketListing[] => {
      const mockCharacters: Character[] = [
        {
          id: 'market_1',
          name: 'Elite Manager Max',
          type: 'legendary',
          job: 'CEO',
          level: 25,
          happiness: 95,
          working: false,
          department: 'Management',
          mintedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 250
        },
        {
          id: 'market_2',
          name: 'Tech Wizard Anna',
          type: 'rare',
          job: 'Senior Developer',
          level: 18,
          happiness: 88,
          working: false,
          department: 'IT',
          mintedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 150
        },
        {
          id: 'market_3',
          name: 'Sales Star Tom',
          type: 'rare',
          job: 'Sales Manager',
          level: 15,
          happiness: 92,
          working: false,
          department: 'Sales',
          mintedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 120
        },
        {
          id: 'market_4',
          name: 'Helper Bob',
          type: 'common',
          job: 'Office Worker',
          level: 8,
          happiness: 75,
          working: false,
          department: 'Administration',
          mintedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 45
        },
        {
          id: 'market_5',
          name: 'Security Chief Lisa',
          type: 'rare',
          job: 'Security Manager',
          level: 20,
          happiness: 90,
          working: false,
          department: 'Security',
          mintedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 130
        },
        {
          id: 'market_6',
          name: 'Junior Dev Sam',
          type: 'common',
          job: 'Developer',
          level: 12,
          happiness: 80,
          working: false,
          department: 'IT',
          mintedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          dailyEarnings: 65
        }
      ];

      return mockCharacters.map((character, index) => ({
        id: `listing_${character.id}`,
        character,
        price: calculateMarketPrice(character),
        seller: `0x${Math.random().toString(16).substring(2, 10)}...`,
        listedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        featured: index < 2,
        condition: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as 'excellent' | 'good' | 'fair',
        negotiable: Math.random() > 0.5
      }));
    };

    setMarketListings(generateMarketListings());
  }, []);

  // Calculate suggested market price for a character
  const calculateMarketPrice = (character: Character): number => {
    const basePrice = GAME_CONSTANTS.MINT_COSTS[character.type];
    const levelMultiplier = 1 + (character.level * 0.05);
    const happinessMultiplier = character.happiness / 100;
    const earningsMultiplier = calculateEarnings(character) / 50;
    
    return Math.floor(basePrice * levelMultiplier * happinessMultiplier * earningsMultiplier);
  };

  // Filter and sort listings
  const getFilteredListings = (): MarketListing[] => {
    let filtered = marketListings;

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(listing => 
        listing.character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.character.job.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.character.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(listing => listing.character.type === filters.type);
    }

    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(listing => {
        switch (filters.priceRange) {
          case 'low': return listing.price < 500;
          case 'medium': return listing.price >= 500 && listing.price < 1500;
          case 'high': return listing.price >= 1500;
          default: return true;
        }
      });
    }

    if (filters.level !== 'all') {
      filtered = filtered.filter(listing => {
        switch (filters.level) {
          case 'beginner': return listing.character.level < 10;
          case 'intermediate': return listing.character.level >= 10 && listing.character.level < 20;
          case 'advanced': return listing.character.level >= 20;
          default: return true;
        }
      });
    }

    if (filters.availability === 'featured') {
      filtered = filtered.filter(listing => listing.featured);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price - b.price;
        case 'price_high': return b.price - a.price;
        case 'level_high': return b.character.level - a.character.level;
        case 'level_low': return a.character.level - b.character.level;
        case 'earnings_high': return calculateEarnings(b.character) - calculateEarnings(a.character);
        case 'newest': return b.listedAt.getTime() - a.listedAt.getTime();
        case 'featured': return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default: return 0;
      }
    });

    return filtered;
  };

  // Handle character purchase
  const handlePurchase = (listing: MarketListing): void => {
    if (!userConnected) {
      alert('Bitte verbinde dein Wallet um zu kaufen.');
      return;
    }

    if (familyData.totalLunc < listing.price) {
      alert('Nicht genügend LUNC für diesen Kauf.');
      return;
    }

    // Add character to family
    const newCharacter = {
      ...listing.character,
      id: Date.now(), // New ID for user's character
      working: false
    };

    const updatedCharacters = [...familyData.characters, newCharacter];
    const updatedFamilyData = {
      ...familyData,
      characters: updatedCharacters,
      familySize: updatedCharacters.length,
      totalLunc: familyData.totalLunc - listing.price,
      dailyEarnings: updatedCharacters
        .filter(char => char.working)
        .reduce((sum, char) => sum + calculateEarnings(char), 0)
    };

    setFamilyData(updatedFamilyData);

    // Remove from marketplace
    setMarketListings(prev => prev.filter(l => l.id !== listing.id));

    // Trigger callback
    if (onTrade) {
      onTrade('buy', listing.character.name, listing.price);
    }

    alert(`🎉 ${listing.character.name} erfolgreich gekauft!`);
    setSelectedListing(null);
  };

  // Handle character selling
  const handleSell = (): void => {
    if (!sellCharacter || sellPrice <= 0) return;

    // Remove character from family
    const updatedCharacters = familyData.characters.filter(char => char.id !== sellCharacter.id);
    const updatedFamilyData = {
      ...familyData,
      characters: updatedCharacters,
      familySize: updatedCharacters.length,
      totalLunc: familyData.totalLunc + sellPrice,
      dailyEarnings: updatedCharacters
        .filter(char => char.working)
        .reduce((sum, char) => sum + calculateEarnings(char), 0)
    };

    setFamilyData(updatedFamilyData);

    // Create marketplace listing
    const newListing: MarketListing = {
      id: `listing_${Date.now()}`,
      character: sellCharacter,
      price: sellPrice,
      seller: 'You',
      listedAt: new Date(),
      featured: false,
      condition: 'excellent',
      negotiable: true
    };

    setMarketListings(prev => [newListing, ...prev]);

    // Trigger callback
    if (onTrade) {
      onTrade('sell', sellCharacter.name, sellPrice);
    }

    alert(`💰 ${sellCharacter.name} für ${sellPrice} LUNC eingestellt!`);
    setSellCharacter(null);
    setSellPrice(0);
    setViewMode('my_listings');
  };

  const filteredListings = getFilteredListings();
  const myListings = marketListings.filter(listing => listing.seller === 'You');

  if (!userConnected) {
    return (
      <div className="marketplace">
        <div className="not-connected">
          <h2>🛒 Marktplatz</h2>
          <p>Bitte verbinde dein Wallet, um den Marktplatz zu nutzen.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace">
      {/* Header */}
      <div className="marketplace-header">
        <h1>🛒 Character Marketplace</h1>
        <div className="marketplace-stats">
          <div className="stat">
            <span className="stat-value">{marketListings.length}</span>
            <span className="stat-label">Angebote</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatLuncBalance(familyData.totalLunc)}</span>
            <span className="stat-label">Dein LUNC</span>
          </div>
          <div className="stat">
            <span className="stat-value">{familyData.characters.length}</span>
            <span className="stat-label">Deine Familie</span>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="view-tabs">
        <button 
          className={`tab ${viewMode === 'buy' ? 'active' : ''}`}
          onClick={() => setViewMode('buy')}
        >
          🛒 Kaufen
        </button>
        <button 
          className={`tab ${viewMode === 'sell' ? 'active' : ''}`}
          onClick={() => setViewMode('sell')}
        >
          💰 Verkaufen
        </button>
        <button 
          className={`tab ${viewMode === 'my_listings' ? 'active' : ''}`}
          onClick={() => setViewMode('my_listings')}
        >
          📋 Meine Angebote ({myListings.length})
        </button>
      </div>

      {/* Buy View */}
      {viewMode === 'buy' && (
        <>
          {/* Search and Filters */}
          <div className="marketplace-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Charaktere suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="filters">
              <select 
                value={filters.type} 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <option value="all">Alle Typen</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
              </select>
              
              <select 
                value={filters.priceRange} 
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value as any }))}
              >
                <option value="all">Alle Preise</option>
                <option value="low">< 500 LUNC</option>
                <option value="medium">500-1500 LUNC</option>
                <option value="high">> 1500 LUNC</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="featured">Featured</option>
                <option value="price_low">Preis: Niedrig → Hoch</option>
                <option value="price_high">Preis: Hoch → Niedrig</option>
                <option value="level_high">Level: Hoch → Niedrig</option>
                <option value="earnings_high">Verdienst: Hoch → Niedrig</option>
                <option value="newest">Neueste zuerst</option>
              </select>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="listings-grid">
            {filteredListings.map(listing => (
              <div 
                key={listing.id} 
                className={`listing-card ${listing.character.type} ${listing.featured ? 'featured' : ''}`}
                onClick={() => setSelectedListing(listing)}
              >
                {listing.featured && <div className="featured-badge">⭐ Featured</div>}
                
                <div className="character-info">
                  <h3>{listing.character.name}</h3>
                  <span className={`character-type ${listing.character.type}`}>
                    {listing.character.type === 'legendary' ? '💎' : listing.character.type === 'rare' ? '⭐' : '👤'}
                    {listing.character.type}
                  </span>
                </div>
                
                <div className="character-details">
                  <div className="detail">
                    <span>Job:</span>
                    <span>{listing.character.job}</span>
                  </div>
                  <div className="detail">
                    <span>Level:</span>
                    <span>{listing.character.level}</span>
                  </div>
                  <div className="detail">
                    <span>Glück:</span>
                    <span>{listing.character.happiness}%</span>
                  </div>
                  <div className="detail">
                    <span>Verdienst:</span>
                    <span>{calculateEarnings(listing.character)} LUNC/Tag</span>
                  </div>
                </div>
                
                <div className="listing-price">
                  <span className="price">{formatLuncBalance(listing.price)} LUNC</span>
                  {listing.negotiable && <span className="negotiable">📝 Verhandelbar</span>}
                </div>
                
                <div className="listing-meta">
                  <span className="condition">Zustand: {listing.condition}</span>
                  <span className="seller">Von: {listing.seller}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sell View */}
      {viewMode === 'sell' && (
        <div className="sell-section">
          <h2>💰 Charakter verkaufen</h2>
          
          <div className="sell-characters">
            {familyData.characters.length > 0 ? (
              <>
                <p>Wähle einen Charakter zum Verkaufen:</p>
                <div className="characters-grid">
                  {familyData.characters.map(character => (
                    <div 
                      key={character.id}
                      className={`character-card ${character.type} ${sellCharacter?.id === character.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSellCharacter(sellCharacter?.id === character.id ? null : character);
                        setSellPrice(sellCharacter?.id === character.id ? 0 : calculateMarketPrice(character));
                      }}
                    >
                      <h3>{character.name}</h3>
                      <div className="character-stats">
                        <span>Level: {character.level}</span>
                        <span>Verdienst: {calculateEarnings(character)} LUNC/Tag</span>
                        <span>Empfohlener Preis: {formatLuncBalance(calculateMarketPrice(character))} LUNC</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {sellCharacter && (
                  <div className="sell-form">
                    <h3>Verkaufsdetails für {sellCharacter.name}</h3>
                    <div className="price-input">
                      <label>Verkaufspreis (LUNC):</label>
                      <input
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(Number(e.target.value))}
                        min="1"
                      />
                      <span className="suggested-price">
                        Empfohlen: {formatLuncBalance(calculateMarketPrice(sellCharacter))} LUNC
                      </span>
                    </div>
                    
                    <button 
                      className="sell-btn"
                      onClick={handleSell}
                      disabled={sellPrice <= 0}
                    >
                      💰 Charakter verkaufen
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>Du hast keine Charaktere zum Verkaufen.</p>
            )}
          </div>
        </div>
      )}

      {/* My Listings View */}
      {viewMode === 'my_listings' && (
        <div className="my-listings">
          <h2>📋 Meine Marktplatz-Angebote</h2>
          
          {myListings.length > 0 ? (
            <div className="listings-grid">
              {myListings.map(listing => (
                <div key={listing.id} className="listing-card my-listing">
                  <div className="character-info">
                    <h3>{listing.character.name}</h3>
                    <span className={`character-type ${listing.character.type}`}>
                      {listing.character.type}
                    </span>
                  </div>
                  
                  <div className="listing-details">
                    <span>Preis: {formatLuncBalance(listing.price)} LUNC</span>
                    <span>Eingestellt: {listing.listedAt.toLocaleDateString()}</span>
                  </div>
                  
                  <div className="listing-actions">
                    <button className="edit-btn">✏️ Bearbeiten</button>
                    <button 
                      className="remove-btn"
                      onClick={() => {
                        setMarketListings(prev => prev.filter(l => l.id !== listing.id));
                        // Add character back to family
                        const updatedCharacters = [...familyData.characters, listing.character];
                        setFamilyData({
                          ...familyData,
                          characters: updatedCharacters,
                          familySize: updatedCharacters.length
                        });
                      }}
                    >
                      🗑️ Entfernen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Du hast momentan keine Charaktere im Marktplatz eingestellt.</p>
          )}
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedListing && (
        <div className="listing-modal-overlay" onClick={() => setSelectedListing(null)}>
          <div className="listing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedListing.character.name}</h2>
              <button 
                className="close-btn" 
                onClick={() => setSelectedListing(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="character-showcase">
                <div className={`character-avatar ${selectedListing.character.type}`}>
                  {selectedListing.character.type === 'legendary' ? '💎' : selectedListing.character.type === 'rare' ? '⭐' : '👤'}
                </div>
                
                <div className="character-full-details">
                  <h3>{selectedListing.character.job}</h3>
                  <p>Abteilung: {selectedListing.character.department}</p>
                  <p>Level: {selectedListing.character.level}</p>
                  <p>Glück: {selectedListing.character.happiness}%</p>
                  <p>Täglicher Verdienst: {calculateEarnings(selectedListing.character)} LUNC</p>
                  <p>Zustand: {selectedListing.condition}</p>
                </div>
              </div>
              
              <div className="purchase-section">
                <div className="price-display">
                  <span className="current-price">{formatLuncBalance(selectedListing.price)} LUNC</span>
                  {selectedListing.negotiable && (
                    <span className="negotiable-text">📝 Verhandelbar</span>
                  )}
                </div>
                
                <div className="purchase-actions">
                  <button 
                    className="buy-now-btn"
                    onClick={() => handlePurchase(selectedListing)}
                    disabled={familyData.totalLunc < selectedListing.price}
                  >
                    🛒 Sofort kaufen
                  </button>
                  
                  {selectedListing.negotiable && (
                    <button 
                      className="make-offer-btn"
                      onClick={() => setShowMakeOffer(true)}
                    >
                      💬 Angebot machen
                    </button>
                  )}
                </div>
                
                {familyData.totalLunc < selectedListing.price && (
                  <p className="insufficient-funds">❌ Nicht genügend LUNC</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;