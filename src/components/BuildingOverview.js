import React, { useState } from 'react';

const BuildingOverview = ({ buildingData, setBuildingData }) => {
  const [activeFloor, setActiveFloor] = useState('all');

  const buildingFloors = [
    {
      id: 'management',
      name: '🏢 Management Etage',
      level: '25. Stock',
      totalJobs: 15,
      occupiedJobs: 12,
      departments: ['Direktion', 'Abteilungsleitung', 'Senior Management'],
      avgSalary: 150,
      description: 'Die Führungsebene des Gebäudes'
    },
    {
      id: 'professional',
      name: '💼 Professional Etagen',
      level: '15.-24. Stock',
      totalJobs: 350,
      occupiedJobs: 287,
      departments: ['Finanzen', 'IT', 'Marketing', 'Personalwesen', 'Vertrieb'],
      avgSalary: 45,
      description: 'Fachkräfte und Spezialisten arbeiten hier'
    },
    {
      id: 'operations',
      name: '🔧 Operations Etagen',
      level: '5.-14. Stock',
      totalJobs: 600,
      occupiedJobs: 445,
      departments: ['Wartung', 'Sicherheit', 'Reinigung', 'Logistik'],
      avgSalary: 18,
      description: 'Der operative Kern des Gebäudes'
    },
    {
      id: 'service',
      name: '🍽️ Service Etagen',
      level: '1.-4. Stock',
      totalJobs: 200,
      occupiedJobs: 103,
      departments: ['Cafeteria', 'Wellness', 'Empfang', 'Post'],
      avgSalary: 12,
      description: 'Services für alle Gebäude-Mitarbeiter'
    }
  ];

  const getOccupancyRate = (floor) => {
    return Math.round((floor.occupiedJobs / floor.totalJobs) * 100);
  };

  const getOccupancyColor = (rate) => {
    if (rate >= 90) return '#dc3545'; // Rot - überbelegt
    if (rate >= 70) return '#ffc107'; // Gelb - gut belegt
    return '#28a745'; // Grün - Plätze frei
  };

  const simulateBuildingActivity = () => {
    // Simuliere Gebäude-Aktivität
    setBuildingData(prev => ({
      ...prev,
      buildingEfficiency: Math.min(100, prev.buildingEfficiency + Math.floor(Math.random() * 5)),
      availableJobs: Math.max(50, prev.availableJobs + Math.floor(Math.random() * 20) - 10)
    }));
  };

  return (
    <div className="building-overview">
      <div className="game-card">
        <h1>🏢 Virtual Building Empire - Gebäude Übersicht</h1>
        <p>Unser 25-stöckiges Hauptgebäude mit 2,500 Arbeitsplätzen für alle Charaktere</p>
      </div>

      {/* Gebäude Status Dashboard */}
      <div className="game-card">
        <h2>📊 Live Gebäude Status</h2>
        <div className="building-stats">
          <div className="building-stat">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-number">{buildingData.totalEmployees}/2500</div>
              <div className="stat-label">Mitarbeiter</div>
            </div>
          </div>
          <div className="building-stat">
            <div className="stat-icon">💼</div>
            <div className="stat-info">
              <div className="stat-number">{buildingData.availableJobs}</div>
              <div className="stat-label">Freie Jobs</div>
            </div>
          </div>
          <div className="building-stat">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <div className="stat-number">{buildingData.buildingEfficiency}%</div>
              <div className="stat-label">Effizienz</div>
            </div>
          </div>
          <div className="building-stat">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-number">{buildingData.dailyLuncPool.toLocaleString()}</div>
              <div className="stat-label">LUNC Pool</div>
            </div>
          </div>
        </div>
        <button className="game-button" onClick={simulateBuildingActivity}>
          🔄 Gebäude Status aktualisieren
        </button>
      </div>

      {/* Etagen Filter */}
      <div className="game-card">
        <h2>🏗️ Etagen Navigation</h2>
        <div className="floor-filters">
          <button 
            className={`floor-filter ${activeFloor === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFloor('all')}
          >
            🏢 Alle Etagen
          </button>
          {buildingFloors.map(floor => (
            <button 
              key={floor.id}
              className={`floor-filter ${activeFloor === floor.id ? 'active' : ''}`}
              onClick={() => setActiveFloor(floor.id)}
            >
              {floor.name.split(' ')[0]} {floor.level}
            </button>
          ))}
        </div>
      </div>

      {/* Etagen Details */}
      <div className="building-floors">
        {buildingFloors
          .filter(floor => activeFloor === 'all' || activeFloor === floor.id)
          .map(floor => {
            const occupancyRate = getOccupancyRate(floor);
            return (
              <div key={floor.id} className="floor">
                <div className="floor-header">
                  <div className="floor-info">
                    <h3>{floor.name}</h3>
                    <p className="floor-level">{floor.level}</p>
                    <p className="floor-description">{floor.description}</p>
                  </div>
                  <div className="floor-stats">
                    <div 
                      className="occupancy-circle"
                      style={{borderColor: getOccupancyColor(occupancyRate)}}
                    >
                      <span className="occupancy-rate">{occupancyRate}%</span>
                      <span className="occupancy-label">Belegt</span>
                    </div>
                  </div>
                </div>
                
                <div className="floor-details">
                  <div className="floor-metrics">
                    <div className="metric">
                      <span className="metric-label">Arbeitsplätze:</span>
                      <span className="metric-value">{floor.occupiedJobs}/{floor.totalJobs}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Durchschnittslohn:</span>
                      <span className="metric-value">{floor.avgSalary} LUNC/Tag</span>
                    </div>
                  </div>
                  
                  <div className="departments">
                    <h4>Abteilungen:</h4>
                    <div className="department-tags">
                      {floor.departments.map(dept => (
                        <span key={dept} className="department-tag">
                          {dept}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>

      {/* Gebäude Events */}
      <div className="game-card">
        <h2>🎉 Gebäude Events</h2>
        <div className="building-events">
          <div className="event-card active">
            <div className="event-header">
              <span className="event-icon">🎆</span>
              <h3>Montagsmeeting</h3>
              <span className="event-time">Heute 09:00</span>
            </div>
            <p>Alle Abteilungsleiter treffen sich - 20% Bonus für Management Jobs!</p>
          </div>
          
          <div className="event-card upcoming">
            <div className="event-header">
              <span className="event-icon">🍽️</span>
              <h3>Cafeteria Upgrade</h3>
              <span className="event-time">Morgen</span>
            </div>
            <p>Neue Ausstattung erhöht die Mitarbeiter-Zufriedenheit um 15%</p>
          </div>
          
          <div className="event-card future">
            <div className="event-header">
              <span className="event-icon">🏆</span>
              <h3>Quartalswettbewerb</h3>
              <span className="event-time">Nächste Woche</span>
            </div>
            <p>Die beste Familie gewinnt 5,000 LUNC Bonus!</p>
          </div>
        </div>
      </div>

      {/* Real-time Building Activity */}
      <div className="game-card">
        <h2>🔴 Live Aktivitäten</h2>
        <div className="activity-feed">
          <div className="activity-item">
            <span className="activity-time">vor 2 Min</span>
            <span className="activity-text">👥 Max Manager hat den Job "Abteilungsleiter" übernommen</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">vor 5 Min</span>
            <span className="activity-text">💰 Familie Schmidt hat 127 LUNC verdient</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">vor 8 Min</span>
            <span className="activity-text">⚡ Gebäude-Effizienz ist auf 82% gestiegen</span>
          </div>
          <div className="activity-item">
            <span className="activity-time">vor 12 Min</span>
            <span className="activity-text">🎆 Neuer Charaktere-Drop: Legendärer Architekt!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingOverview;