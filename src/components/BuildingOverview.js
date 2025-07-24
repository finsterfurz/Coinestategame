import React, { useState, useEffect } from 'react';

const BuildingOverview = ({ buildingData, setBuildingData, familyCharacters }) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'detailed', '3d'
  const [buildingStats, setBuildingStats] = useState({});
  const [floorData, setFloorData] = useState([]);

  // ===================================
  // 🏢 BUILDING CONFIGURATION
  // ===================================
  
  const BUILDING_CONFIG = {
    totalFloors: 25,
    departments: {
      'Management': { floors: [25], color: '#ffd700', icon: '🏢' },
      'Professional': { floors: [15,16,17,18,19,20,21,22,23,24], color: '#17a2b8', icon: '💼' },
      'Operations': { floors: [5,6,7,8,9,10,11,12,13,14], color: '#28a745', icon: '🔧' },
      'Service': { floors: [1,2,3,4], color: '#ffc107', icon: '🍽️' }
    },
    jobCapacity: 100, // Jobs pro Etage
    dailyLuncPool: 25000
  };

  // ===================================
  // 🎮 BUILDING DATA INITIALIZATION
  // ===================================
  
  useEffect(() => {
    initializeBuildingData();
    calculateBuildingStats();
  }, [familyCharacters]);

  // Initialisiere Gebäude-Daten
  const initializeBuildingData = () => {
    const floors = [];
    
    for (let floorNum = 1; floorNum <= BUILDING_CONFIG.totalFloors; floorNum++) {
      const department = getDepartmentForFloor(floorNum);
      const workingCharacters = familyCharacters.filter(
        char => char.working && getFloorForDepartment(char.department) === floorNum
      );
      
      floors.push({
        number: floorNum,
        department: department.name,
        icon: department.icon,
        color: department.color,
        capacity: BUILDING_CONFIG.jobCapacity,
        occupancy: workingCharacters.length,
        characters: workingCharacters,
        efficiency: Math.min(100, (workingCharacters.length / BUILDING_CONFIG.jobCapacity * 100) + Math.random() * 20),
        dailyLunc: calculateFloorLunc(floorNum, workingCharacters.length),
        availableJobs: Math.max(0, BUILDING_CONFIG.jobCapacity - workingCharacters.length)
      });
    }
    
    setFloorData(floors.reverse()); // Top floor first
  };

  // Bestimme Department für Etage
  const getDepartmentForFloor = (floorNum) => {
    for (const [deptName, deptConfig] of Object.entries(BUILDING_CONFIG.departments)) {
      if (deptConfig.floors.includes(floorNum)) {
        return { name: deptName, ...deptConfig };
      }
    }
    return { name: 'Unknown', color: '#6c757d', icon: '❓' };
  };

  // Finde Etage für Department (vereinfacht)
  const getFloorForDepartment = (department) => {
    const deptMapping = {
      'Management': 25,
      'Professional': 20, // Mittlere Professional Etage
      'IT': 18,
      'Finance': 19,
      'Operations': 10, // Mittlere Operations Etage
      'Service': 2 // Mittlere Service Etage
    };
    
    return deptMapping[department] || Math.floor(Math.random() * 25) + 1;
  };

  // Berechne LUNC für Etage
  const calculateFloorLunc = (floorNum, occupancy) => {
    const baseReward = floorNum * 10; // Höhere Etagen = mehr LUNC
    const occupancyMultiplier = occupancy * 0.1;
    return Math.floor(baseReward * (1 + occupancyMultiplier));
  };

  // Berechne Gebäude-Statistiken
  const calculateBuildingStats = () => {
    const totalWorkers = familyCharacters.filter(char => char.working).length;
    const totalCapacity = BUILDING_CONFIG.totalFloors * BUILDING_CONFIG.jobCapacity;
    const efficiency = (totalWorkers / Math.max(totalCapacity * 0.1, 1)) * 100; // Realistic efficiency
    
    setBuildingStats({
      totalWorkers,
      totalCapacity,
      efficiency: Math.min(100, efficiency),
      occupancyRate: (totalWorkers / Math.max(totalCapacity * 0.05, 1)) * 100, // More realistic occupancy
      dailyLuncGenerated: familyCharacters.reduce((sum, char) => 
        char.working ? sum + char.dailyEarnings : sum, 0
      ),
      floorsActive: floorData.filter(floor => floor.occupancy > 0).length
    });
  };

  // ===================================
  // 🎨 RENDER FUNCTIONS
  // ===================================
  
  // Render einzelne Etage
  const renderFloor = (floor) => {
    const occupancyPercentage = (floor.occupancy / floor.capacity) * 100;
    const isSelected = selectedFloor?.number === floor.number;
    
    return (
      <div
        key={floor.number}
        className={`building-floor ${isSelected ? 'selected' : ''}`}
        onClick={() => setSelectedFloor(isSelected ? null : floor)}
        style={{
          borderLeftColor: floor.color,
          background: isSelected 
            ? `linear-gradient(90deg, ${floor.color}20, transparent)`
            : undefined
        }}
      >
        <div className="floor-number">
          {floor.number}
        </div>
        
        <div className="floor-info">
          <div className="floor-header">
            <span className="floor-icon">{floor.icon}</span>
            <span className="floor-department">{floor.department}</span>
          </div>
          
          <div className="floor-stats">
            <div className="occupancy-bar">
              <div 
                className="occupancy-fill"
                style={{ 
                  width: `${Math.min(100, occupancyPercentage)}%`,
                  backgroundColor: floor.color
                }}
              />
            </div>
            
            <div className="floor-metrics">
              <span className="metric">
                👥 {floor.occupancy}/{floor.capacity}
              </span>
              <span className="metric">
                💰 {floor.dailyLunc} LUNC/Tag
              </span>
              <span className="metric">
                📊 {Math.round(floor.efficiency)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="floor-actions">
          {floor.availableJobs > 0 && (
            <span className="available-jobs">
              🎯 {floor.availableJobs} Jobs
            </span>
          )}
          
          <span className="floor-expand">
            {isSelected ? '▼' : '▶'}
          </span>
        </div>
      </div>
    );
  };

  // Render Etagen-Details
  const renderFloorDetails = (floor) => {
    if (!floor) return null;
    
    return (
      <div className="floor-details">
        <div className="details-header">
          <h3>
            {floor.icon} {floor.department} - Etage {floor.number}
          </h3>
          <button 
            className="close-details"
            onClick={() => setSelectedFloor(null)}
          >
            ✕
          </button>
        </div>
        
        <div className="details-content">
          <div className="details-stats">
            <div className="detail-stat">
              <span className="stat-label">Kapazität:</span>
              <span className="stat-value">{floor.capacity} Arbeitsplätze</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Belegt:</span>
              <span className="stat-value">{floor.occupancy} Charaktere</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Verfügbar:</span>
              <span className="stat-value">{floor.availableJobs} Jobs</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Effizienz:</span>
              <span className="stat-value">{Math.round(floor.efficiency)}%</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">LUNC/Tag:</span>
              <span className="stat-value">{floor.dailyLunc} LUNC</span>
            </div>
          </div>
          
          {/* Arbeitende Charaktere */}
          {floor.characters.length > 0 && (
            <div className="working-characters">
              <h4>👥 Arbeitende Charaktere:</h4>
              <div className="characters-list">
                {floor.characters.map(char => (
                  <div key={char.id} className="working-character">
                    <span className="char-name">{char.name}</span>
                    <span className="char-job">{char.job}</span>
                    <span className="char-earnings">💰 {char.dailyEarnings} LUNC</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Job-Aktionen */}
          <div className="floor-job-actions">
            <button className="job-action assign">
              🎯 Jobs zuweisen
            </button>
            <button className="job-action optimize">
              ⚡ Optimieren
            </button>
            <button className="job-action details">
              📊 Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="building-overview">
      
      {/* Building Header */}
      <div className="building-header">
        <h1 className="building-title">🏢 Virtual Building Empire</h1>
        <p className="building-subtitle">
          25-stöckiges Gebäude mit {BUILDING_CONFIG.jobCapacity * BUILDING_CONFIG.totalFloors} Arbeitsplätzen
        </p>
      </div>

      {/* Building Stats */}
      <div className="building-stats">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{buildingStats.totalWorkers || 0}</span>
            <span className="stat-label">Aktive Arbeiter</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-number">{Math.round(buildingStats.efficiency || 0)}%</span>
            <span className="stat-label">Gebäude Effizienz</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <span className="stat-number">{buildingStats.floorsActive || 0}</span>
            <span className="stat-label">Aktive Etagen</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-number">{buildingStats.dailyLuncGenerated || 0}</span>
            <span className="stat-label">LUNC/Tag</span>
          </div>
        </div>
      </div>

      {/* View Mode Controls */}
      <div className="view-controls">
        <button 
          className={`view-btn ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          🏢 Übersicht
        </button>
        <button 
          className={`view-btn ${viewMode === 'detailed' ? 'active' : ''}`}
          onClick={() => setViewMode('detailed')}
        >
          📊 Detailliert
        </button>
        <button 
          className={`view-btn ${viewMode === '3d' ? 'active' : ''}`}
          onClick={() => setViewMode('3d')}
        >
          🎮 3D Ansicht
        </button>
      </div>

      {/* Building Content */}
      <div className="building-content">
        
        {/* Left Side - Building Floors */}
        <div className="building-floors">
          <div className="floors-header">
            <h3>🏗️ Gebäude Etagen</h3>
            <p>Klicke auf eine Etage für Details</p>
          </div>
          
          <div className="floors-container">
            {floorData.map(floor => renderFloor(floor))}
          </div>
        </div>
        
        {/* Right Side - Floor Details or Building Stats */}
        <div className="building-sidebar">
          {selectedFloor ? (
            renderFloorDetails(selectedFloor)
          ) : (
            <div className="building-overview-info">
              <h3>🎯 Gebäude Information</h3>
              
              <div className="info-section">
                <h4>📋 Department Übersicht:</h4>
                <div className="departments-list">
                  {Object.entries(BUILDING_CONFIG.departments).map(([name, config]) => (
                    <div key={name} className="department-item">
                      <span className="dept-icon">{config.icon}</span>
                      <span className="dept-name">{name}</span>
                      <span className="dept-floors">
                        Etagen: {config.floors.length > 3 
                          ? `${config.floors[0]}-${config.floors[config.floors.length-1]}`
                          : config.floors.join(', ')
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="info-section">
                <h4>💡 Tipps:</h4>
                <ul>
                  <li>🏢 Management (Etage 25): Höchste LUNC Belohnungen</li>
                  <li>💼 Professional (15-24): Gute Balance aus Verdienst und Zugänglichkeit</li>
                  <li>🔧 Operations (5-14): Stabile mittlere Verdienste</li>
                  <li>🍽️ Service (1-4): Einstiegs-Jobs für neue Charaktere</li>
                  <li>👥 Größere Familien erhalten Boni auf alle Etagen</li>
                </ul>
              </div>
              
              <div className="info-section">
                <h4>📊 Leistung optimieren:</h4>
                <div className="optimization-tips">
                  <div className="tip-item">
                    <span className="tip-icon">⚡</span>
                    <span>Weise Charaktere passenden Departments zu</span>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">📈</span>
                    <span>Level-up Charaktere für höhere Earnings</span>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🎯</span>
                    <span>Fokussiere auf Management-Etagen</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Building Actions */}
      <div className="building-actions">
        <button className="building-action primary">
          🎯 Alle Jobs optimieren
        </button>
        <button className="building-action secondary">
          📊 Effizienz-Report
        </button>
        <button className="building-action accent">
          🏢 Gebäude erweitern
        </button>
      </div>
    </div>
  );
};

export default BuildingOverview;