import React from 'react';

interface Character {
  id: string;
  name: string;
  type: string;
  job: string;
  department: string;
  level: number;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
}

interface FamilyData {
  familySize: number;
  dailyEarnings: number;
  totalLunc: number;
  characters: Character[];
}

interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
}

interface DashboardProps {
  familyData: FamilyData;
  buildingData: BuildingData;
}

const Dashboard: React.FC<DashboardProps> = ({ familyData, buildingData }) => {
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Guten Morgen';
    if (hour < 18) return '☀️ Guten Tag';
    return '🌆 Guten Abend';
  };

  const activeCharacters = familyData.characters.filter(char => char.working);

  return (
    <div className="dashboard">
      <div className="game-card">
        <h1>{getGreeting()}, Familie!</h1>
        <p>Willkommen zurück im Virtual Building Empire. Deine Charaktere warten auf neue Aufgaben!</p>
      </div>

      {/* Familie Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{familyData.familySize}</div>
          <div className="stat-label">👥 Familie Mitglieder</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{familyData.dailyEarnings}</div>
          <div className="stat-label">💰 Tägliche LUNC</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{familyData.totalLunc}</div>
          <div className="stat-label">💰 Gesamt LUNC</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{activeCharacters.length}</div>
          <div className="stat-label">💼 Aktive Arbeiter</div>
        </div>
      </div>

      {/* Gebäude Status */}
      <div className="game-card">
        <h2>🏢 Gebäude Status</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{buildingData.totalEmployees}</div>
            <div className="stat-label">Gesamt Mitarbeiter</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{buildingData.availableJobs}</div>
            <div className="stat-label">Verfügbare Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{buildingData.buildingEfficiency}%</div>
            <div className="stat-label">Gebäude Effizienz</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{buildingData.dailyLuncPool.toLocaleString()}</div>
            <div className="stat-label">Täglicher LUNC Pool</div>
          </div>
        </div>
      </div>

      {/* Aktive Charaktere */}
      <div className="game-card">
        <h2>👥 Deine aktiven Charaktere</h2>
        <div className="character-grid">
          {activeCharacters.map(character => (
            <div key={character.id} className={`character-card ${character.type}`}>
              <h3>{character.name}</h3>
              <div className="character-details">
                <p><strong>Job:</strong> {character.job}</p>
                <p><strong>Abteilung:</strong> {character.department}</p>
                <p><strong>Level:</strong> {character.level}</p>
                <p><strong>Tägliche LUNC:</strong> {character.dailyEarnings}</p>
                <div className="happiness-bar">
                  <div 
                    className="happiness-fill" 
                    style={{width: `${character.happiness}%`}}
                  ></div>
                  <span>Zufriedenheit: {character.happiness}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="game-card">
        <h2>⚡ Schnellaktionen</h2>
        <div className="action-buttons">
          <button className="game-button">
            💼 Neue Jobs zuweisen
          </button>
          <button className="game-button">
            👥 Charaktere sammeln
          </button>
          <button className="game-button">
            🏢 Gebäude prüfen
          </button>
          <button className="game-button">
            💰 LUNC einsammeln
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;