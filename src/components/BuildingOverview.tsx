import React, { useState, useEffect } from 'react';
import { Character, calculateBuildingEfficiency, formatLuncBalance } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface BuildingData {
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
}

interface BuildingOverviewProps {
  buildingData: BuildingData;
  setBuildingData: (data: BuildingData) => void;
  familyCharacters: Character[];
}

interface Floor {
  id: number;
  name: string;
  department: string;
  capacity: number;
  currentEmployees: number;
  dailyOutput: number;
  icon: string;
}

interface Job {
  id: string;
  title: string;
  floor: number;
  department: string;
  requiredLevel: number;
  dailyPay: number;
  difficulty: 'easy' | 'medium' | 'hard';
  available: boolean;
}

// ===================================
// 🏢 BUILDING OVERVIEW COMPONENT
// ===================================

const BuildingOverview: React.FC<BuildingOverviewProps> = ({
  buildingData,
  setBuildingData,
  familyCharacters
}) => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'jobs'>('overview');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);

  // Building floors configuration
  const floors: Floor[] = [
    { id: 25, name: 'CEO Suite', department: 'Management', capacity: 1, currentEmployees: 0, dailyOutput: 500, icon: '👑' },
    { id: 24, name: 'Executive Floor', department: 'Management', capacity: 5, currentEmployees: 3, dailyOutput: 400, icon: '💼' },
    { id: 23, name: 'Senior Management', department: 'Management', capacity: 8, currentEmployees: 6, dailyOutput: 320, icon: '🎯' },
    { id: 22, name: 'Project Management', department: 'Management', capacity: 12, currentEmployees: 9, dailyOutput: 280, icon: '📊' },
    { id: 21, name: 'Team Leaders', department: 'Management', capacity: 15, currentEmployees: 12, dailyOutput: 240, icon: '👥' },
    { id: 20, name: 'IT Management', department: 'IT', capacity: 10, currentEmployees: 8, dailyOutput: 300, icon: '💻' },
    { id: 19, name: 'System Architecture', department: 'IT', capacity: 12, currentEmployees: 10, dailyOutput: 260, icon: '🏗️' },
    { id: 18, name: 'Development Team', department: 'IT', capacity: 20, currentEmployees: 16, dailyOutput: 220, icon: '⚡' },
    { id: 17, name: 'Quality Assurance', department: 'IT', capacity: 15, currentEmployees: 12, dailyOutput: 180, icon: '🔍' },
    { id: 16, name: 'Support Center', department: 'IT', capacity: 18, currentEmployees: 14, dailyOutput: 160, icon: '🆘' },
    { id: 15, name: 'Finance Department', department: 'Finance', capacity: 12, currentEmployees: 10, dailyOutput: 200, icon: '💰' },
    { id: 14, name: 'Accounting', department: 'Finance', capacity: 15, currentEmployees: 12, dailyOutput: 180, icon: '📈' },
    { id: 13, name: 'HR Department', department: 'HR', capacity: 10, currentEmployees: 8, dailyOutput: 150, icon: '👤' },
    { id: 12, name: 'Legal Affairs', department: 'Legal', capacity: 8, currentEmployees: 6, dailyOutput: 170, icon: '⚖️' },
    { id: 11, name: 'Marketing', department: 'Marketing', capacity: 12, currentEmployees: 9, dailyOutput: 190, icon: '📢' },
    { id: 10, name: 'Sales Team', department: 'Sales', capacity: 20, currentEmployees: 15, dailyOutput: 200, icon: '🎯' },
    { id: 9, name: 'Customer Service', department: 'Service', capacity: 25, currentEmployees: 20, dailyOutput: 140, icon: '📞' },
    { id: 8, name: 'Operations', department: 'Operations', capacity: 30, currentEmployees: 25, dailyOutput: 120, icon: '🔧' },
    { id: 7, name: 'Logistics', department: 'Operations', capacity: 25, currentEmployees: 20, dailyOutput: 110, icon: '📦' },
    { id: 6, name: 'Maintenance', department: 'Operations', capacity: 20, currentEmployees: 15, dailyOutput: 100, icon: '🔨' },
    { id: 5, name: 'Security', department: 'Security', capacity: 15, currentEmployees: 12, dailyOutput: 90, icon: '🛡️' },
    { id: 4, name: 'Reception', department: 'Service', capacity: 8, currentEmployees: 6, dailyOutput: 80, icon: '🏢' },
    { id: 3, name: 'Cafeteria', department: 'Service', capacity: 12, currentEmployees: 10, dailyOutput: 70, icon: '🍽️' },
    { id: 2, name: 'Storage', department: 'Operations', capacity: 10, currentEmployees: 8, dailyOutput: 60, icon: '📚' },
    { id: 1, name: 'Parking Garage', department: 'Service', capacity: 5, currentEmployees: 3, dailyOutput: 50, icon: '🚗' }
  ];

  // Calculate building statistics
  const totalCapacity = floors.reduce((sum, floor) => sum + floor.capacity, 0);
  const currentOccupancy = floors.reduce((sum, floor) => sum + floor.currentEmployees, 0);
  const dailyBuildingOutput = floors.reduce((sum, floor) => sum + floor.dailyOutput, 0);
  const occupancyRate = (currentOccupancy / totalCapacity) * 100;
  const efficiency = calculateBuildingEfficiency(familyCharacters);

  // Generate available jobs
  useEffect(() => {
    const generateJobs = (): Job[] => {
      const jobTemplates = [
        { title: 'Senior Developer', floor: 18, department: 'IT', requiredLevel: 15, dailyPay: 150, difficulty: 'hard' as const },
        { title: 'Project Manager', floor: 22, department: 'Management', requiredLevel: 12, dailyPay: 120, difficulty: 'medium' as const },
        { title: 'Customer Support', floor: 9, department: 'Service', requiredLevel: 5, dailyPay: 60, difficulty: 'easy' as const },
        { title: 'Security Guard', floor: 5, department: 'Security', requiredLevel: 3, dailyPay: 40, difficulty: 'easy' as const },
        { title: 'Marketing Specialist', floor: 11, department: 'Marketing', requiredLevel: 8, dailyPay: 80, difficulty: 'medium' as const },
        { title: 'Financial Analyst', floor: 15, department: 'Finance', requiredLevel: 10, dailyPay: 100, difficulty: 'medium' as const },
        { title: 'System Administrator', floor: 20, department: 'IT', requiredLevel: 18, dailyPay: 180, difficulty: 'hard' as const },
        { title: 'HR Coordinator', floor: 13, department: 'HR', requiredLevel: 7, dailyPay: 70, difficulty: 'easy' as const }
      ];

      return jobTemplates.map((template, index) => ({
        id: `job_${index}_${Date.now()}`,
        ...template,
        available: Math.random() > 0.3
      }));
    };

    setAvailableJobs(generateJobs());
    
    // Refresh jobs every 5 minutes
    const interval = setInterval(() => {
      setAvailableJobs(generateJobs());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getFloorById = (id: number): Floor | undefined => {
    return floors.find(floor => floor.id === id);
  };

  const handleFloorClick = (floorId: number): void => {
    setSelectedFloor(selectedFloor === floorId ? null : floorId);
  };

  return (
    <div className="building-overview">
      <div className="building-header">
        <h1>🏢 Virtual Building Empire - 25 Floors</h1>
        <div className="building-stats">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <span className="stat-number">{currentOccupancy}/{totalCapacity}</span>
              <span className="stat-label">Mitarbeiter</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-number">{Math.round(occupancyRate)}%</span>
              <span className="stat-label">Auslastung</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <span className="stat-number">{efficiency}%</span>
              <span className="stat-label">Effizienz</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <span className="stat-number">{formatLuncBalance(dailyBuildingOutput)}</span>
              <span className="stat-label">LUNC/Tag</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="view-controls">
        <button 
          className={`view-btn ${viewMode === 'overview' ? 'active' : ''}`}
          onClick={() => setViewMode('overview')}
        >
          🏢 Übersicht
        </button>
        <button 
          className={`view-btn ${viewMode === 'details' ? 'active' : ''}`}
          onClick={() => setViewMode('details')}
        >
          📋 Details
        </button>
        <button 
          className={`view-btn ${viewMode === 'jobs' ? 'active' : ''}`}
          onClick={() => setViewMode('jobs')}
        >
          💼 Jobs ({availableJobs.filter(job => job.available).length})
        </button>
      </div>

      {/* Building Visualization */}
      {viewMode === 'overview' && (
        <div className="building-visualization">
          <div className="building-structure">
            {floors.map(floor => (
              <div 
                key={floor.id}
                className={`building-floor ${selectedFloor === floor.id ? 'selected' : ''}`}
                onClick={() => handleFloorClick(floor.id)}
                style={{
                  opacity: floor.currentEmployees > 0 ? 1 : 0.6,
                  background: `linear-gradient(90deg, #4CAF50 ${(floor.currentEmployees / floor.capacity) * 100}%, #f0f0f0 ${(floor.currentEmployees / floor.capacity) * 100}%)`
                }}
              >
                <div className="floor-info">
                  <span className="floor-number">{floor.id}</span>
                  <span className="floor-icon">{floor.icon}</span>
                  <span className="floor-name">{floor.name}</span>
                  <span className="floor-occupancy">{floor.currentEmployees}/{floor.capacity}</span>
                </div>
                
                {selectedFloor === floor.id && (
                  <div className="floor-details">
                    <div className="detail-row">
                      <span>Abteilung:</span>
                      <span>{floor.department}</span>
                    </div>
                    <div className="detail-row">
                      <span>Tagesoutput:</span>
                      <span>{floor.dailyOutput} LUNC</span>
                    </div>
                    <div className="detail-row">
                      <span>Auslastung:</span>
                      <span>{Math.round((floor.currentEmployees / floor.capacity) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Floor Information */}
      {viewMode === 'details' && (
        <div className="floor-details-view">
          <div className="floors-grid">
            {floors.map(floor => (
              <div key={floor.id} className="floor-detail-card">
                <div className="floor-header">
                  <span className="floor-icon-large">{floor.icon}</span>
                  <div className="floor-info-detailed">
                    <h3>{floor.name}</h3>
                    <p>Stock {floor.id} • {floor.department}</p>
                  </div>
                </div>
                
                <div className="floor-metrics">
                  <div className="metric">
                    <label>Mitarbeiter:</label>
                    <span>{floor.currentEmployees}/{floor.capacity}</span>
                  </div>
                  <div className="metric">
                    <label>Tagesoutput:</label>
                    <span>{floor.dailyOutput} LUNC</span>
                  </div>
                  <div className="metric">
                    <label>Auslastung:</label>
                    <span>{Math.round((floor.currentEmployees / floor.capacity) * 100)}%</span>
                  </div>
                </div>
                
                <div className="occupancy-bar">
                  <div 
                    className="occupancy-fill"
                    style={{ width: `${(floor.currentEmployees / floor.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Jobs */}
      {viewMode === 'jobs' && (
        <div className="jobs-view">
          <div className="jobs-header">
            <h2>💼 Verfügbare Jobs</h2>
            <p>Täglich wechselnde Jobangebote in verschiedenen Abteilungen</p>
          </div>
          
          <div className="jobs-grid">
            {availableJobs.filter(job => job.available).map(job => {
              const floor = getFloorById(job.floor);
              return (
                <div key={job.id} className={`job-card ${job.difficulty}`}>
                  <div className="job-header">
                    <h3>{job.title}</h3>
                    <span className={`difficulty-badge ${job.difficulty}`}>
                      {job.difficulty === 'easy' ? '🟢' : job.difficulty === 'medium' ? '🟡' : '🔴'}
                      {job.difficulty}
                    </span>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-info">
                      <span className="job-floor">
                        {floor?.icon} Stock {job.floor} • {job.department}
                      </span>
                      <span className="job-requirements">
                        Min. Level {job.requiredLevel}
                      </span>
                      <span className="job-pay">
                        💰 {job.dailyPay} LUNC/Tag
                      </span>
                    </div>
                  </div>
                  
                  <button className="apply-job-btn">
                    💼 Job zuweisen
                  </button>
                </div>
              );
            })}
          </div>
          
          {availableJobs.filter(job => job.available).length === 0 && (
            <div className="no-jobs">
              <p>🕐 Momentan keine Jobs verfügbar. Neue Jobs erscheinen alle 5 Minuten!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BuildingOverview;