import React, { useState } from 'react';

const FamilyManagement = ({ familyData, setFamilyData }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showCharacterModal, setShowCharacterModal] = useState(false);

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

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character);
    setShowCharacterModal(true);
  };

  const improveCharacter = (characterId) => {
    setFamilyData(prev => ({
      ...prev,
      characters: prev.characters.map(char => 
        char.id === characterId 
          ? { ...char, level: char.level + 1, dailyEarnings: char.dailyEarnings + 5 }
          : char
      ),
      totalLunc: prev.totalLunc - 100 // Kosten für Verbesserung
    }));
    setShowCharacterModal(false);
  };

  return (
    <div className="family-management">
      <div className="game-card">
        <h1>👨‍👩‍👧‍👦 Familie Management</h1>
        <p>Verwalte deine Charaktersammlung und verbessere ihre Fähigkeiten</p>
      </div>

      {/* Familie Übersicht */}
      <div className="family-overview">
        <div className="family-stats">
          <h2>{familyData.familySize}</h2>
          <p>Familie Mitglieder</p>
        </div>
        <div className="family-stats">
          <h2>{familyData.dailyEarnings}</h2>
          <p>Tägliche LUNC</p>
        </div>
        <div className="family-stats">
          <h2>{familyData.characters.filter(c => c.type === 'legendary').length}</h2>
          <p>Legendäre Charaktere</p>
        </div>
        <div className="family-stats">
          <h2>{Math.round(familyData.characters.reduce((sum, c) => sum + c.happiness, 0) / familyData.characters.length)}%</h2>
          <p>Durchschnittliche Zufriedenheit</p>
        </div>
      </div>

      {/* Charakter Sammlung */}
      <div className="game-card">
        <h2>🃚 Deine Charakter Sammlung</h2>
        <div className="character-collection">
          {['legendary', 'rare', 'common'].map(rarity => {
            const charactersOfType = familyData.characters.filter(c => c.type === rarity);
            return (
              <div key={rarity} className="rarity-section">
                <h3 style={{color: getRarityColor(rarity)}}>
                  {getRarityName(rarity)} ({charactersOfType.length})
                </h3>
                <div className="character-grid">
                  {charactersOfType.map(character => (
                    <div 
                      key={character.id} 
                      className={`character-card ${character.type}`}
                      onClick={() => handleCharacterClick(character)}
                    >
                      <div className="character-header">
                        <h4>{character.name}</h4>
                        <span className="character-level">Level {character.level}</span>
                      </div>
                      <div className="character-body">
                        <p><strong>Job:</strong> {character.job}</p>
                        <p><strong>Abteilung:</strong> {character.department}</p>
                        <p><strong>Tägliche LUNC:</strong> {character.dailyEarnings}</p>
                        <div className="status-indicators">
                          <span className={`work-status ${character.working ? 'working' : 'idle'}`}>
                            {character.working ? '💼 Arbeitet' : '😴 Wartet'}
                          </span>
                          <span className="happiness-indicator">
                            😊 {character.happiness}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Familie Strategien */}
      <div className="game-card">
        <h2>🎯 Familie Strategien</h2>
        <div className="strategy-tips">
          <div className="tip-card">
            <h3>💼 Job Rotation</h3>
            <p>Rotiere deine Charaktere zwischen verschiedenen Jobs um ihre Fähigkeiten zu verbessern</p>
          </div>
          <div className="tip-card">
            <h3>🎆 Team Bonus</h3>
            <p>Platziere Charaktere aus derselben Familie in der gleichen Abteilung für Bonus-LUNC</p>
          </div>
          <div className="tip-card">
            <h3>📈 Wachstum</h3>
            <p>Sammle mehr Charaktere um Zugang zu Premium-Gebäudebereichen zu erhalten</p>
          </div>
        </div>
      </div>

      {/* Charakter Details Modal */}
      {showCharacterModal && selectedCharacter && (
        <div className="modal-overlay" onClick={() => setShowCharacterModal(false)}>
          <div className="character-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedCharacter.name}</h2>
              <button 
                className="close-button"
                onClick={() => setShowCharacterModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="character-details-full">
                <p><strong>Seltenheit:</strong> {getRarityName(selectedCharacter.type)}</p>
                <p><strong>Level:</strong> {selectedCharacter.level}</p>
                <p><strong>Job:</strong> {selectedCharacter.job}</p>
                <p><strong>Abteilung:</strong> {selectedCharacter.department}</p>
                <p><strong>Tägliche LUNC:</strong> {selectedCharacter.dailyEarnings}</p>
                <p><strong>Zufriedenheit:</strong> {selectedCharacter.happiness}%</p>
                <p><strong>Status:</strong> {selectedCharacter.working ? 'Arbeitet' : 'Wartet auf Job'}</p>
              </div>
              <div className="character-actions">
                <button 
                  className="game-button"
                  onClick={() => improveCharacter(selectedCharacter.id)}
                  disabled={familyData.totalLunc < 100}
                >
                  📈 Level Up (100 LUNC)
                </button>
                <button className="game-button">
                  🚀 Job wechseln
                </button>
                <button className="game-button">
                  🎁 Geschenk geben
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;