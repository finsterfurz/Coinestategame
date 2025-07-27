import React, { memo, useMemo, useCallback } from 'react';
import { Character } from '../store/gameStore';

interface CharacterCardProps {
  character: Character;
  onSelect?: (character: Character) => void;
  onAssignJob?: (characterId: string) => void;
  onLevelUp?: (characterId: string) => void;
  onCollectEarnings?: (characterId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const CharacterCard: React.FC<CharacterCardProps> = memo(({
  character,
  onSelect,
  onAssignJob,
  onLevelUp,
  onCollectEarnings,
  isSelected = false,
  showActions = true,
  compact = false,
}) => {
  // Memoize computed values to prevent recalculation
  const characterStats = useMemo(() => ({
    experiencePercentage: (character.experience / (character.level * 100)) * 100,
    happinessColor: character.happiness > 80 ? 'green' : character.happiness > 50 ? 'orange' : 'red',
    rarityClass: `rarity-${character.rarity}`,
    workingStatus: character.working ? 'Arbeitet' : 'Verfügbar',
    totalSkillPoints: Object.values(character.skills).reduce((sum, skill) => sum + skill, 0),
  }), [character.experience, character.level, character.happiness, character.rarity, character.working, character.skills]);

  // Memoize click handlers to prevent recreation
  const handleSelect = useCallback(() => {
    if (onSelect) onSelect(character);
  }, [onSelect, character]);

  const handleAssignJob = useCallback(() => {
    if (onAssignJob) onAssignJob(character.id);
  }, [onAssignJob, character.id]);

  const handleLevelUp = useCallback(() => {
    if (onLevelUp) onLevelUp(character.id);
  }, [onLevelUp, character.id]);

  const handleCollectEarnings = useCallback(() => {
    if (onCollectEarnings) onCollectEarnings(character.id);
  }, [onCollectEarnings, character.id]);

  // Render compact version for virtualized lists
  if (compact) {
    return (
      <div 
        className={`character-card-compact ${characterStats.rarityClass} ${isSelected ? 'selected' : ''}`}
        onClick={handleSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      >
        <div className="character-compact-info">
          <img 
            src={character.image} 
            alt={character.name}
            loading="lazy"
            className="character-compact-avatar"
          />
          <div className="character-compact-details">
            <h4>{character.name}</h4>
            <span className="character-compact-level">Lvl {character.level}</span>
            <span className={`character-compact-status ${character.working ? 'working' : 'idle'}`}>
              {characterStats.workingStatus}
            </span>
          </div>
          <div className="character-compact-earnings">
            {character.dailyEarnings} LUNC/Tag
          </div>
        </div>
      </div>
    );
  }

  // Full character card
  return (
    <div 
      className={`character-card ${characterStats.rarityClass} ${isSelected ? 'selected' : ''} ${character.working ? 'working' : 'idle'}`}
      onClick={handleSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSelect()}
      aria-label={`Character ${character.name}, Level ${character.level}, ${characterStats.workingStatus}`}
    >
      {/* Character Image */}
      <div className="character-image-container">
        <img 
          src={character.image} 
          alt={character.name}
          loading="lazy"
          className="character-image"
        />
        <div className={`character-rarity-badge ${character.rarity}`}>
          {character.rarity.toUpperCase()}
        </div>
        {character.working && (
          <div className="character-working-indicator">
            <span className="working-pulse">●</span>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="character-info">
        <h3 className="character-name">{character.name}</h3>
        <div className="character-type">{character.type}</div>
        
        {/* Level and Experience */}
        <div className="character-level-section">
          <div className="character-level">Level {character.level}</div>
          <div className="experience-bar">
            <div 
              className="experience-fill"
              style={{ width: `${characterStats.experiencePercentage}%` }}
            />
            <span className="experience-text">
              {character.experience}/{character.level * 100} XP
            </span>
          </div>
        </div>

        {/* Job Information */}
        {character.job && (
          <div className="character-job-info">
            <div className="job-title">{character.job}</div>
            <div className="job-department">{character.department}</div>
          </div>
        )}

        {/* Happiness */}
        <div className="character-happiness">
          <span>Zufriedenheit:</span>
          <div className="happiness-bar">
            <div 
              className={`happiness-fill ${characterStats.happinessColor}`}
              style={{ width: `${character.happiness}%` }}
            />
            <span className="happiness-text">{character.happiness}%</span>
          </div>
        </div>

        {/* Skills Summary */}
        <div className="character-skills-summary">
          <span>Skills: {characterStats.totalSkillPoints}/400</span>
          <div className="skills-mini-bars">
            {Object.entries(character.skills).map(([skillName, value]) => (
              <div key={skillName} className="skill-mini-bar">
                <div 
                  className="skill-mini-fill"
                  style={{ width: `${value}%` }}
                  title={`${skillName}: ${value}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Earnings */}
        <div className="character-earnings">
          <span className="earnings-label">Tägliche Einnahmen:</span>
          <span className="earnings-amount">{character.dailyEarnings} LUNC</span>
        </div>

        {/* Last Worked */}
        {character.lastWorked && (
          <div className="character-last-worked">
            Zuletzt gearbeitet: {new Date(character.lastWorked).toLocaleDateString()}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="character-actions">
          {!character.working && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAssignJob();
              }}
              aria-label={`Assign job to ${character.name}`}
            >
              Job zuweisen
            </button>
          )}
          
          {character.experience >= character.level * 100 && (
            <button 
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleLevelUp();
              }}
              aria-label={`Level up ${character.name}`}
            >
              Level Up
            </button>
          )}
          
          {character.working && character.dailyEarnings > 0 && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCollectEarnings();
              }}
              aria-label={`Collect earnings from ${character.name}`}
            >
              Einnahmen sammeln
            </button>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return (
    prevProps.character.id === nextProps.character.id &&
    prevProps.character.name === nextProps.character.name &&
    prevProps.character.level === nextProps.character.level &&
    prevProps.character.experience === nextProps.character.experience &&
    prevProps.character.happiness === nextProps.character.happiness &&
    prevProps.character.working === nextProps.character.working &&
    prevProps.character.dailyEarnings === nextProps.character.dailyEarnings &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.showActions === nextProps.showActions &&
    prevProps.compact === nextProps.compact &&
    JSON.stringify(prevProps.character.skills) === JSON.stringify(nextProps.character.skills)
  );
});

CharacterCard.displayName = 'CharacterCard';

export default CharacterCard;