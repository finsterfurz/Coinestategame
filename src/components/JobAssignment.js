import React, { useState, useEffect } from 'react';

const JobAssignment = ({ characters, setFamilyData, buildingData }) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [sortBy, setSortBy] = useState('reward'); // 'reward', 'level', 'department'
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  // ===================================
  // 🎮 JOB CONFIGURATION
  // ===================================
  
  const JOB_TYPES = {
    'Management': {
      icon: '🏢',
      color: '#ffd700',
      baseReward: 150,
      levelRequirement: 15,
      description: 'Führungsaufgaben und strategische Entscheidungen'
    },
    'Professional': {
      icon: '💼',
      color: '#17a2b8',
      baseReward: 65,
      levelRequirement: 8,
      description: 'Spezialisierte Fachaufgaben'
    },
    'Operations': {
      icon: '🔧',
      color: '#28a745',
      baseReward: 35,
      levelRequirement: 3,
      description: 'Operative Tätigkeiten und Maintenance'
    },
    'Service': {
      icon: '🍽️',
      color: '#ffc107',
      baseReward: 20,
      levelRequirement: 1,
      description: 'Kundenservice und Support'
    }
  };

  // ===================================
  // 🎲 JOB GENERATION
  // ===================================
  
  useEffect(() => {
    generateAvailableJobs();
    loadAssignmentHistory();
  }, []);

  // Generiere täglich verfügbare Jobs
  const generateAvailableJobs = () => {
    const jobs = [];
    const currentTime = new Date();
    
    // Für jedes Department Jobs generieren
    Object.entries(JOB_TYPES).forEach(([department, config]) => {
      const jobCount = Math.floor(Math.random() * 8) + 3; // 3-10 Jobs pro Department
      
      for (let i = 0; i < jobCount; i++) {
        const job = {
          id: `${department.toLowerCase()}_${Date.now()}_${i}`,
          title: generateJobTitle(department),
          department,
          icon: config.icon,
          color: config.color,
          description: generateJobDescription(department),
          requirements: {
            minLevel: config.levelRequirement + Math.floor(Math.random() * 5),
            preferredType: Math.random() > 0.7 ? getRandomRarity() : null
          },
          reward: {
            baseLunc: config.baseReward + Math.floor(Math.random() * 30),
            bonusMultiplier: 1 + (Math.random() * 0.5), // 1.0 - 1.5x
            experiencePoints: Math.floor(Math.random() * 20) + 5
          },
          duration: Math.floor(Math.random() * 8) + 4, // 4-12 Stunden
          difficulty: Math.floor(Math.random() * 5) + 1, // 1-5
          availableUntil: new Date(currentTime.getTime() + (Math.random() * 24 * 60 * 60 * 1000)), // Bis zu 24h
          assignedCharacter: null,
          status: 'available' // 'available', 'assigned', 'completed', 'expired'
        };
        
        jobs.push(job);
      }
    });
    
    setAvailableJobs(jobs.sort((a, b) => b.reward.baseLunc - a.reward.baseLunc));
  };

  // Generiere Job Titel
  const generateJobTitle = (department) => {
    const titles = {
      'Management': [
        'Strategic Planning Session',
        'Board Meeting Leadership',
        'Department Restructuring',
        'Budget Planning Review',
        'Executive Decision Making',
        'Company Vision Workshop'
      ],
      'Professional': [
        'System Architecture Design',
        'Financial Analysis Report',
        'Marketing Campaign Strategy',
        'Legal Contract Review',
        'Product Development Planning',
        'Technical Documentation'
      ],
      'Operations': [
        'Equipment Maintenance',
        'Quality Control Inspection',
        'Process Optimization',
        'Safety Protocol Update',
        'Inventory Management',
        'Workflow Coordination'
      ],
      'Service': [
        'Customer Support Response',
        'Reception Desk Coverage',
        'Event Coordination',
        'Visitor Management',
        'Facility Cleaning',
        'Food Service Preparation'
      ]
    };
    
    const departmentTitles = titles[department] || ['General Task'];
    return departmentTitles[Math.floor(Math.random() * departmentTitles.length)];
  };

  // Generiere Job Beschreibung
  const generateJobDescription = (department) => {
    const descriptions = {
      'Management': 'Strategische Führungsaufgabe mit hoher Verantwortung',
      'Professional': 'Spezialisierte Fachaufgabe für erfahrene Charaktere',
      'Operations': 'Operative Tätigkeit zur Aufrechterhaltung der Gebäudefunktionen',
      'Service': 'Kundenorientierte Serviceaufgabe für alle Level'
    };
    
    return descriptions[department] || 'Allgemeine Arbeitsaufgabe';
  };

  // Zufällige Rarity für Präferenz
  const getRandomRarity = () => {
    const rarities = ['common', 'rare', 'legendary'];
    return rarities[Math.floor(Math.random() * rarities.length)];
  };

  // ===================================
  // 🎮 JOB ASSIGNMENT LOGIC
  // ===================================
  
  // Weise Job einem Charakter zu
  const assignJob = (character, job) => {
    if (!character || !job || character.working) {
      return false;
    }
    
    // Prüfe Anforderungen
    if (character.level < job.requirements.minLevel) {
      alert(`${character.name} ist Level ${character.level}, aber Job benötigt Level ${job.requirements.minLevel}!`);
      return false;
    }
    
    // Berechne finale Belohnung basierend auf Charakter
    const finalReward = calculateJobReward(character, job);
    
    // Update Charakter
    const updatedCharacters = characters.map(char => {
      if (char.id === character.id) {
        return {
          ...char,
          working: true,
          currentJob: {
            ...job,
            assignedAt: new Date(),
            estimatedCompletion: new Date(Date.now() + job.duration * 60 * 60 * 1000),
            finalReward
          },
          dailyEarnings: char.dailyEarnings + finalReward
        };
      }
      return char;
    });
    
    // Update Job
    const updatedJobs = availableJobs.map(availableJob => {
      if (availableJob.id === job.id) {
        return {
          ...availableJob,
          assignedCharacter: character.id,
          status: 'assigned'
        };
      }
      return availableJob;
    });
    
    // Update State
    setFamilyData(prev => ({ ...prev, characters: updatedCharacters }));
    setAvailableJobs(updatedJobs);
    
    // Add to Assignment History
    const assignment = {
      id: Date.now(),
      character: character.name,
      job: job.title,
      department: job.department,
      reward: finalReward,
      assignedAt: new Date(),
      status: 'active'
    };
    
    setAssignmentHistory(prev => [assignment, ...prev.slice(0, 19)]); // Keep last 20
    
    // Reset selections
    setSelectedCharacter(null);
    setSelectedJob(null);
    
    return true;
  };

  // Berechne Job Reward basierend auf Charakter
  const calculateJobReward = (character, job) => {
    let reward = job.reward.baseLunc;
    
    // Level Bonus
    const levelBonus = Math.floor(character.level * 1.5);
    reward += levelBonus;
    
    // Happiness Bonus
    const happinessBonus = Math.floor((character.happiness - 50) * 0.5);
    reward += Math.max(0, happinessBonus);
    
    // Rarity Bonus
    const rarityMultiplier = {
      'common': 1.0,
      'rare': 1.2,
      'legendary': 1.5
    };
    reward = Math.floor(reward * (rarityMultiplier[character.type] || 1.0));
    
    // Preferred Type Bonus
    if (job.requirements.preferredType === character.type) {
      reward = Math.floor(reward * 1.3);
    }
    
    // Apply job bonus multiplier
    reward = Math.floor(reward * job.reward.bonusMultiplier);
    
    return reward;
  };

  // ===================================
  // 🎨 FILTER & SORT FUNCTIONS
  // ===================================
  
  // Filtere Jobs
  const getFilteredJobs = () => {
    let filtered = availableJobs.filter(job => job.status === 'available');
    
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(job => job.department === filterDepartment);
    }
    
    // Sortierung
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'level':
          return a.requirements.minLevel - b.requirements.minLevel;
        case 'department':
          return a.department.localeCompare(b.department);
        case 'reward':
        default:
          return b.reward.baseLunc - a.reward.baseLunc;
      }
    });
    
    return filtered;
  };

  // Verfügbare Charaktere (nicht arbeitend)
  const getAvailableCharacters = () => {
    return characters.filter(char => !char.working);
  };

  // Load Assignment History (Demo)
  const loadAssignmentHistory = () => {
    // Demo History
    setAssignmentHistory([]);
  };

  // ===================================
  // 🎯 UTILITY FUNCTIONS
  // ===================================
  
  // Zeit bis Job abläuft
  const getTimeRemaining = (job) => {
    const now = new Date();
    const remaining = job.availableUntil - now;
    
    if (remaining <= 0) return 'Abgelaufen';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Difficulty Stars
  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  // Character kann Job machen?
  const canCharacterDoJob = (character, job) => {
    return character.level >= job.requirements.minLevel;
  };

  const filteredJobs = getFilteredJobs();
  const availableCharacters = getAvailableCharacters();

  return (
    <div className="job-assignment">
      
      {/* Header */}
      <div className="jobs-header">
        <h1 className="jobs-title">💼 Job Assignment</h1>
        <p className="jobs-subtitle">
          Weise deinen Charakteren täglich neue Jobs zu und verdiene LUNC!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="jobs-stats">
        <div className="stat-card primary">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-number">{filteredJobs.length}</span>
            <span className="stat-label">Verfügbare Jobs</span>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-number">{availableCharacters.length}</span>
            <span className="stat-label">Freie Charaktere</span>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <span className="stat-number">{characters.filter(c => c.working).length}</span>
            <span className="stat-label">Arbeiten gerade</span>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-number">{assignmentHistory.length}</span>
            <span className="stat-label">Heute zugewiesene</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="jobs-controls">
        <div className="filter-controls">
          <div className="control-group">
            <label>🏢 Department:</label>
            <select 
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="control-select"
            >
              <option value="all">Alle Departments</option>
              {Object.keys(JOB_TYPES).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="control-group">
            <label>📊 Sortieren:</label>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="reward">LUNC Belohnung</option>
              <option value="level">Level Anforderung</option>
              <option value="department">Department</option>
            </select>
          </div>
        </div>
        
        <button 
          className="refresh-jobs-btn"
          onClick={generateAvailableJobs}
        >
          🔄 Jobs aktualisieren
        </button>
      </div>

      {/* Main Content */}
      <div className="jobs-content">
        
        {/* Available Jobs */}
        <div className="jobs-section">
          <h2>🎯 Verfügbare Jobs ({filteredJobs.length})</h2>
          
          <div className="jobs-grid">
            {filteredJobs.map(job => (
              <div 
                key={job.id}
                className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                style={{ borderColor: job.color }}
              >
                <div className="job-header">
                  <span className="job-icon">{job.icon}</span>
                  <div className="job-info">
                    <h3 className="job-title">{job.title}</h3>
                    <p className="job-department">{job.department}</p>
                  </div>
                  <div className="job-reward">
                    <span className="reward-amount">{job.reward.baseLunc}</span>
                    <span className="reward-currency">LUNC</span>
                  </div>
                </div>
                
                <p className="job-description">{job.description}</p>
                
                <div className="job-requirements">
                  <div className="requirement">
                    <span className="req-label">Min. Level:</span>
                    <span className="req-value">{job.requirements.minLevel}</span>
                  </div>
                  <div className="requirement">
                    <span className="req-label">Schwierigkeit:</span>
                    <span className="req-value">{getDifficultyStars(job.difficulty)}</span>
                  </div>
                  <div className="requirement">
                    <span className="req-label">Dauer:</span>
                    <span className="req-value">{job.duration}h</span>
                  </div>
                </div>
                
                {job.requirements.preferredType && (
                  <div className="job-preference">
                    💎 Bevorzugt: {job.requirements.preferredType}
                  </div>
                )}
                
                <div className="job-footer">
                  <span className="job-expires">
                    ⏰ {getTimeRemaining(job)}
                  </span>
                  
                  {selectedJob?.id === job.id && availableCharacters.length > 0 && (
                    <div className="job-assign">
                      <select 
                        value={selectedCharacter?.id || ''}
                        onChange={(e) => {
                          const char = availableCharacters.find(c => c.id == e.target.value);
                          setSelectedCharacter(char);
                        }}
                        className="character-select"
                      >
                        <option value="">Charakter wählen...</option>
                        {availableCharacters.map(char => (
                          <option 
                            key={char.id} 
                            value={char.id}
                            disabled={!canCharacterDoJob(char, job)}
                          >
                            {char.name} (Level {char.level})
                            {!canCharacterDoJob(char, job) ? ' - Level zu niedrig' : ''}
                          </option>
                        ))}
                      </select>
                      
                      {selectedCharacter && (
                        <button 
                          className="assign-btn"
                          onClick={() => assignJob(selectedCharacter, job)}
                          disabled={!canCharacterDoJob(selectedCharacter, job)}
                        >
                          ✅ Job zuweisen
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredJobs.length === 0 && (
            <div className="no-jobs">
              <p>🎯 Keine Jobs verfügbar. Versuche andere Filter oder aktualisiere die Jobs!</p>
            </div>
          )}
        </div>
        
        {/* Available Characters */}
        <div className="characters-section">
          <h2>👥 Verfügbare Charaktere ({availableCharacters.length})</h2>
          
          {availableCharacters.length === 0 ? (
            <div className="no-characters">
              <p>Alle deine Charaktere arbeiten gerade! 💪</p>
            </div>
          ) : (
            <div className="characters-grid">
              {availableCharacters.map(character => (
                <div 
                  key={character.id}
                  className={`character-card ${character.type}`}
                >
                  <div className="char-header">
                    <h4>{character.name}</h4>
                    <span className="char-level">Level {character.level}</span>
                  </div>
                  
                  <div className="char-stats">
                    <span>💰 {character.dailyEarnings} LUNC/Tag</span>
                    <span>😊 {character.happiness}% Happy</span>
                    <span>🏢 {character.department}</span>
                  </div>
                  
                  <div className="char-jobs">
                    <strong>Passende Jobs:</strong>
                    <div className="matching-jobs">
                      {filteredJobs
                        .filter(job => canCharacterDoJob(character, job))
                        .slice(0, 3)
                        .map(job => (
                          <span 
                            key={job.id} 
                            className="matching-job"
                            style={{ borderColor: job.color }}
                          >
                            {job.icon} {calculateJobReward(character, job)} LUNC
                          </span>
                        ))
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAssignment;