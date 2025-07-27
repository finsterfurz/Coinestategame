import React, { useState, useEffect } from 'react';
import { Character, calculateEarnings, formatLuncBalance } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface FamilyData {
  characters: Character[];
  totalLunc: number;
  familySize: number;
  dailyEarnings: number;
}

interface FamilyManagementProps {
  familyData: FamilyData;
  setFamilyData: (data: FamilyData) => void;
  userConnected: boolean;
  onJobAssign?: (character: string, job: string) => void;
}

interface CharacterFilters {
  type: 'all' | 'common' | 'rare' | 'legendary';
  status: 'all' | 'working' | 'idle';
  department: string;
}

// ===================================
// 👨‍👩‍👧‍👦 FAMILY MANAGEMENT COMPONENT
// ===================================

const FamilyManagement: React.FC<FamilyManagementProps> = ({
  familyData,
  setFamilyData,
  userConnected,
  onJobAssign
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [filters, setFilters] = useState<CharacterFilters>({
    type: 'all',
    status: 'all',
    department: 'all'
  });
  const [sortBy, setSortBy] = useState<'level' | 'earnings' | 'happiness'>('level');

  // Filter and sort characters
  const getFilteredCharacters = (): Character[] => {
    let filtered = [...familyData.characters];

    // Apply filters
    if (filters.type !== 'all') {
      filtered = filtered.filter(char => char.type === filters.type);
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(char => 
        filters.status === 'working' ? char.working : !char.working
      );
    }
    if (filters.department !== 'all') {
      filtered = filtered.filter(char => char.department === filters.department);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return b.level - a.level;
        case 'earnings':
          return calculateEarnings(b) - calculateEarnings(a);
        case 'happiness':
          return b.happiness - a.happiness;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const handleCharacterAction = (character: Character, action: 'work' | 'rest' | 'train'): void => {
    const updatedCharacters = familyData.characters.map(char => {
      if (char.id === character.id) {
        switch (action) {
          case 'work':
            return { ...char, working: true };
          case 'rest':
            return { ...char, working: false };
          case 'train':
            return { 
              ...char, 
              level: char.level + 1,
              happiness: Math.min(100, char.happiness + 5)
            };
          default:
            return char;
        }
      }
      return char;
    });

    const updatedFamilyData = {
      ...familyData,
      characters: updatedCharacters,
      dailyEarnings: updatedCharacters
        .filter(char => char.working)
        .reduce((sum, char) => sum + calculateEarnings(char), 0)
    };

    setFamilyData(updatedFamilyData);

    if (action === 'work' && onJobAssign) {
      onJobAssign(character.name, character.job);
    }
  };

  if (!userConnected) {
    return (
      <div className="family-management">
        <div className="not-connected">
          <h2>👨‍👩‍👧‍👦 Familie verwalten</h2>
          <p>Bitte verbinde dein Wallet, um deine Charaktere zu verwalten.</p>
        </div>
      </div>
    );
  }

  const filteredCharacters = getFilteredCharacters();
  const workingCount = familyData.characters.filter(c => c.working).length;
  const averageLevel = familyData.characters.length > 0 
    ? familyData.characters.reduce((sum, c) => sum + c.level, 0) / familyData.characters.length 
    : 0;

  return (
    <div className="family-management">
      <div className="family-header">
        <h1>👨‍👩‍👧‍👦 Familie verwalten</h1>
        <div className="family-stats">
          <div className="stat">
            <span className="stat-value">{familyData.familySize}</span>
            <span className="stat-label">Mitglieder</span>
          </div>
          <div className="stat">
            <span className="stat-value">{workingCount}</span>
            <span className="stat-label">Arbeiten</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Math.round(averageLevel * 10) / 10}</span>
            <span className="stat-label">⌀ Level</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatLuncBalance(familyData.dailyEarnings)}</span>
            <span className="stat-label">LUNC/Tag</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="family-controls">
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
            value={filters.status} 
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as any }))}
          >
            <option value="all">Alle Status</option>
            <option value="working">Arbeiten</option>
            <option value="idle">Frei</option>
          </select>
        </div>
        
        <div className="sort-controls">
          <label>Sortieren nach:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="level">Level</option>
            <option value="earnings">Verdienst</option>
            <option value="happiness">Glück</option>
          </select>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="characters-grid">
        {filteredCharacters.map(character => (
          <div 
            key={character.id} 
            className={`character-card ${character.type} ${character.working ? 'working' : 'idle'}`}
            onClick={() => setSelectedCharacter(character)}
          >
            <div className="character-header">
              <h3>{character.name}</h3>
              <span className={`character-type ${character.type}`}>
                {character.type === 'legendary' ? '💎' : character.type === 'rare' ? '⭐' : '👤'}
              </span>
            </div>
            
            <div className="character-info">
              <div className="info-row">
                <span>Job:</span>
                <span>{character.job}</span>
              </div>
              <div className="info-row">
                <span>Level:</span>
                <span>{character.level}</span>
              </div>
              <div className="info-row">
                <span>Glück:</span>
                <span>{character.happiness}%</span>
              </div>
              <div className="info-row">
                <span>Verdienst:</span>
                <span>{calculateEarnings(character)} LUNC/Tag</span>
              </div>
            </div>
            
            <div className="character-status">
              <span className={`status-badge ${character.working ? 'working' : 'idle'}`}>
                {character.working ? '💼 Arbeitet' : '🏠 Frei'}
              </span>
            </div>
            
            <div className="character-actions">
              {character.working ? (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacterAction(character, 'rest');
                  }}
                  className="action-btn rest"
                >
                  🏠 Pause
                </button>
              ) : (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCharacterAction(character, 'work');
                  }}
                  className="action-btn work"
                >
                  💼 Arbeiten
                </button>
              )}
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleCharacterAction(character, 'train');
                }}
                className="action-btn train"
              >
                📚 Training
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredCharacters.length === 0 && (
        <div className="no-characters">
          <p>Keine Charaktere gefunden, die den Filtern entsprechen.</p>
        </div>
      )}

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div className="character-modal-overlay" onClick={() => setSelectedCharacter(null)}>
          <div className="character-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCharacter.name}</h2>
              <button 
                className="close-btn" 
                onClick={() => setSelectedCharacter(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="character-details">
                <div className="detail-section">
                  <h3>Grunddaten</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Typ:</label>
                      <span className={`character-type ${selectedCharacter.type}`}>
                        {selectedCharacter.type}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Level:</label>
                      <span>{selectedCharacter.level}</span>
                    </div>
                    <div className="detail-item">
                      <label>Job:</label>
                      <span>{selectedCharacter.job}</span>
                    </div>
                    <div className="detail-item">
                      <label>Abteilung:</label>
                      <span>{selectedCharacter.department}</span>
                    </div>
                    <div className="detail-item">
                      <label>Glück:</label>
                      <span>{selectedCharacter.happiness}%</span>
                    </div>
                    <div className="detail-item">
                      <label>Täglicher Verdienst:</label>
                      <span>{calculateEarnings(selectedCharacter)} LUNC</span>
                    </div>
                  </div>
                </div>
                
                <div className="detail-section">
                  <h3>Aktionen</h3>
                  <div className="action-buttons">
                    {selectedCharacter.working ? (
                      <button 
                        onClick={() => {
                          handleCharacterAction(selectedCharacter, 'rest');
                          setSelectedCharacter(null);
                        }}
                        className="action-btn rest large"
                      >
                        🏠 In Pause schicken
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          handleCharacterAction(selectedCharacter, 'work');
                          setSelectedCharacter(null);
                        }}
                        className="action-btn work large"
                      >
                        💼 Zur Arbeit schicken
                      </button>
                    )}
                    
                    <button 
                      onClick={() => {
                        handleCharacterAction(selectedCharacter, 'train');
                        setSelectedCharacter(null);
                      }}
                      className="action-btn train large"
                    >
                      📚 Training absolvieren (+1 Level)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;