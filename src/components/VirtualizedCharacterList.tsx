import React, { memo, useMemo, useCallback, useState, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Character } from '../store/gameStore';
import OptimizedCharacterCard from './OptimizedCharacterCard';

interface VirtualizedCharacterListProps {
  characters: Character[];
  onSelectCharacter?: (character: Character) => void;
  onAssignJob?: (characterId: string) => void;
  onLevelUp?: (characterId: string) => void;
  onCollectEarnings?: (characterId: string) => void;
  selectedCharacterId?: string;
  
  // Virtualization settings
  height?: number;
  itemHeight?: number;
  itemsPerRow?: number;
  
  // Filtering and sorting
  filter?: {
    rarity?: string[];
    working?: boolean;
    department?: string;
    minLevel?: number;
    maxLevel?: number;
  };
  sortBy?: 'name' | 'level' | 'earnings' | 'happiness' | 'rarity';
  sortOrder?: 'asc' | 'desc';
  
  // Display options
  showActions?: boolean;
  enableSearch?: boolean;
  
  // Performance options
  overscan?: number;
}

interface CharacterRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    characters: Character[];
    itemsPerRow: number;
    onSelectCharacter?: (character: Character) => void;
    onAssignJob?: (characterId: string) => void;
    onLevelUp?: (characterId: string) => void;
    onCollectEarnings?: (characterId: string) => void;
    selectedCharacterId?: string;
    showActions: boolean;
  };
}

// Memoized row component for better performance
const CharacterRow: React.FC<CharacterRowProps> = memo(({ index, style, data }) => {
  const {
    characters,
    itemsPerRow,
    onSelectCharacter,
    onAssignJob,
    onLevelUp,
    onCollectEarnings,
    selectedCharacterId,
    showActions,
  } = data;

  const startIndex = index * itemsPerRow;
  const endIndex = Math.min(startIndex + itemsPerRow, characters.length);
  const rowCharacters = characters.slice(startIndex, endIndex);

  return (
    <div style={style} className="character-row">
      {rowCharacters.map((character) => (
        <div key={character.id} className="character-cell">
          <OptimizedCharacterCard
            character={character}
            onSelect={onSelectCharacter}
            onAssignJob={onAssignJob}
            onLevelUp={onLevelUp}
            onCollectEarnings={onCollectEarnings}
            isSelected={character.id === selectedCharacterId}
            showActions={showActions}
            compact={itemsPerRow > 2}
          />
        </div>
      ))}
    </div>
  );
});

CharacterRow.displayName = 'CharacterRow';

const VirtualizedCharacterList: React.FC<VirtualizedCharacterListProps> = memo(({
  characters,
  onSelectCharacter,
  onAssignJob,
  onLevelUp,
  onCollectEarnings,
  selectedCharacterId,
  height = 600,
  itemHeight = 200,
  itemsPerRow = 3,
  filter,
  sortBy = 'name',
  sortOrder = 'asc',
  showActions = true,
  enableSearch = true,
  overscan = 5,
}) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<List>(null);

  // Filter and sort characters
  const processedCharacters = useMemo(() => {
    let filtered = [...characters];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(character =>
        character.name.toLowerCase().includes(query) ||
        character.type.toLowerCase().includes(query) ||
        character.job?.toLowerCase().includes(query) ||
        character.department?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filter) {
      if (filter.rarity && filter.rarity.length > 0) {
        filtered = filtered.filter(character => filter.rarity!.includes(character.rarity));
      }

      if (filter.working !== undefined) {
        filtered = filtered.filter(character => character.working === filter.working);
      }

      if (filter.department) {
        filtered = filtered.filter(character => character.department === filter.department);
      }

      if (filter.minLevel !== undefined) {
        filtered = filtered.filter(character => character.level >= filter.minLevel!);
      }

      if (filter.maxLevel !== undefined) {
        filtered = filtered.filter(character => character.level <= filter.maxLevel!);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'level':
          comparison = a.level - b.level;
          break;
        case 'earnings':
          comparison = a.dailyEarnings - b.dailyEarnings;
          break;
        case 'happiness':
          comparison = a.happiness - b.happiness;
          break;
        case 'rarity':
          const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
          comparison = rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [characters, searchQuery, filter, sortBy, sortOrder]);

  // Calculate total rows needed
  const totalRows = Math.ceil(processedCharacters.length / itemsPerRow);

  // Create data object for List items
  const listData = useMemo(() => ({
    characters: processedCharacters,
    itemsPerRow,
    onSelectCharacter,
    onAssignJob,
    onLevelUp,
    onCollectEarnings,
    selectedCharacterId,
    showActions,
  }), [
    processedCharacters,
    itemsPerRow,
    onSelectCharacter,
    onAssignJob,
    onLevelUp,
    onCollectEarnings,
    selectedCharacterId,
    showActions,
  ]);

  // Scroll to character
  const scrollToCharacter = useCallback((characterId: string) => {
    const characterIndex = processedCharacters.findIndex(char => char.id === characterId);
    if (characterIndex !== -1 && listRef.current) {
      const rowIndex = Math.floor(characterIndex / itemsPerRow);
      listRef.current.scrollToItem(rowIndex, 'center');
    }
  }, [processedCharacters, itemsPerRow]);

  // Handle search input
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <div className="virtualized-character-list">
      {/* Controls */}
      <div className="character-list-controls">
        {enableSearch && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Charaktere suchen..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
              aria-label="Search characters"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="search-clear"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        <div className="character-count">
          {processedCharacters.length} von {characters.length} Charakteren
        </div>
      </div>

      {/* Results */}
      {processedCharacters.length === 0 ? (
        <div className="no-characters">
          <div className="no-characters-icon">👥</div>
          <h3>Keine Charaktere gefunden</h3>
          {searchQuery ? (
            <p>Keine Charaktere entsprechen deiner Suche nach "{searchQuery}".</p>
          ) : filter ? (
            <p>Keine Charaktere entsprechen den aktuellen Filtern.</p>
          ) : (
            <p>Du hast noch keine Charaktere. Probiere das Minting aus!</p>
          )}
        </div>
      ) : (
        <>
          {/* Performance stats (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="performance-stats">
              <small>
                Zeige {totalRows} Zeilen für {processedCharacters.length} Charaktere 
                ({itemsPerRow} pro Zeile)
              </small>
            </div>
          )}

          {/* Virtualized List */}
          <List
            ref={listRef}
            height={height}
            itemCount={totalRows}
            itemSize={itemHeight}
            itemData={listData}
            overscanCount={overscan}
            className="character-virtual-list"
          >
            {CharacterRow}
          </List>
        </>
      )}

      {/* Scroll to selected character helper */}
      {selectedCharacterId && (
        <button
          onClick={() => scrollToCharacter(selectedCharacterId)}
          className="scroll-to-selected"
          aria-label="Scroll to selected character"
        >
          Zum ausgewählten Charakter scrollen
        </button>
      )}
    </div>
  );
});

VirtualizedCharacterList.displayName = 'VirtualizedCharacterList';

// Export utility hook for character list management
export const useCharacterListState = (characters: Character[]) => {
  const [filter, setFilter] = useState<VirtualizedCharacterListProps['filter']>();
  const [sortBy, setSortBy] = useState<VirtualizedCharacterListProps['sortBy']>('name');
  const [sortOrder, setSortOrder] = useState<VirtualizedCharacterListProps['sortOrder']>('asc');
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>();

  const handleSelectCharacter = useCallback((character: Character) => {
    setSelectedCharacterId(character.id);
  }, []);

  const handleSort = useCallback((newSortBy: VirtualizedCharacterListProps['sortBy']) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  const clearSelection = useCallback(() => {
    setSelectedCharacterId(undefined);
  }, []);

  const resetFilters = useCallback(() => {
    setFilter(undefined);
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  return {
    filter,
    setFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedCharacterId,
    setSelectedCharacterId,
    handleSelectCharacter,
    handleSort,
    clearSelection,
    resetFilters,
  };
};

export default VirtualizedCharacterList;