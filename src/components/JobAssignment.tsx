import React, { useState, useEffect } from 'react';
import { Character, calculateEarnings, formatLuncBalance } from '../utils/gameHelpers';

// ===================================
// 📋 TYPESCRIPT INTERFACES
// ===================================

interface JobAssignmentProps {
  characters: Character[];
  setFamilyData: (data: any) => void;
  buildingData: any;
  onJobAssign?: (character: string, job: string) => void;
}

interface Job {
  id: string;
  title: string;
  department: string;
  floor: number;
  requiredLevel: number;
  requiredType?: 'common' | 'rare' | 'legendary';
  dailyPay: number;
  maxWorkers: number;
  currentWorkers: number;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  benefits: string[];
  available: boolean;
}

interface Assignment {
  characterId: string | number;
  jobId: string;
  assignedAt: Date;
  duration: number; // hours
}

// ===================================
// 💼 JOB ASSIGNMENT COMPONENT
// ===================================

const JobAssignment: React.FC<JobAssignmentProps> = ({
  characters,
  setFamilyData,
  buildingData,
  onJobAssign
}) => {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  // Generate daily jobs
  useEffect(() => {
    const generateDailyJobs = (): Job[] => {
      const jobTemplates: Omit<Job, 'id' | 'currentWorkers' | 'available'>[] = [
        {
          title: 'CEO Assistant',
          department: 'Management',
          floor: 25,
          requiredLevel: 20,
          requiredType: 'legendary',
          dailyPay: 300,
          maxWorkers: 1,
          difficulty: 'hard',
          description: 'Unterstütze den CEO bei strategischen Entscheidungen',
          benefits: ['Bonus XP', 'Prestige +5', 'Exklusive Events']
        },
        {
          title: 'Senior Developer',
          department: 'IT',
          floor: 18,
          requiredLevel: 15,
          requiredType: 'rare',
          dailyPay: 180,
          maxWorkers: 3,
          difficulty: 'hard',
          description: 'Entwickle innovative Lösungen für komplexe Probleme',
          benefits: ['Tech Bonus', 'Skill +2', 'Team Lead Chance']
        },
        {
          title: 'Project Manager',
          department: 'Management',
          floor: 22,
          requiredLevel: 12,
          dailyPay: 150,
          maxWorkers: 2,
          difficulty: 'medium',
          description: 'Leite wichtige Projekte und koordiniere Teams',
          benefits: ['Leadership XP', 'Network +3', 'Bonus Projekte']
        },
        {
          title: 'Marketing Specialist',
          department: 'Marketing',
          floor: 11,
          requiredLevel: 8,
          dailyPay: 90,
          maxWorkers: 4,
          difficulty: 'medium',
          description: 'Erstelle kreative Kampagnen für unsere Kunden',
          benefits: ['Creativity +2', 'Brand Recognition', 'Campaign Bonus']
        },
        {
          title: 'Customer Support Lead',
          department: 'Service',
          floor: 9,
          requiredLevel: 6,
          dailyPay: 70,
          maxWorkers: 3,
          difficulty: 'easy',
          description: 'Kümmere dich um VIP-Kunden und schwierige Fälle',
          benefits: ['Communication +1', 'Customer Bonus', 'Tip Pool']
        },
        {
          title: 'Security Officer',
          department: 'Security',
          floor: 5,
          requiredLevel: 4,
          dailyPay: 50,
          maxWorkers: 5,
          difficulty: 'easy',
          description: 'Sorge für Sicherheit und Ordnung im Gebäude',
          benefits: ['Safety Bonus', 'Physical +1', 'Emergency Training']
        },
        {
          title: 'Financial Analyst',
          department: 'Finance',
          floor: 15,
          requiredLevel: 10,
          dailyPay: 120,
          maxWorkers: 2,
          difficulty: 'medium',
          description: 'Analysiere Marktdaten und erstelle Prognosen',
          benefits: ['Analytics +2', 'Market Insight', 'Bonus Calculator']
        },
        {
          title: 'HR Coordinator',
          department: 'HR',
          floor: 13,
          requiredLevel: 5,
          dailyPay: 60,
          maxWorkers: 3,
          difficulty: 'easy',
          description: 'Unterstütze bei Personalplanung und Recruiting',
          benefits: ['Social +1', 'Networking', 'Hiring Bonus']
        }
      ];

      return jobTemplates.map((template, index) => ({
        ...template,
        id: `job_${index}_${Date.now()}`,
        currentWorkers: Math.floor(Math.random() * (template.maxWorkers + 1)),
        available: Math.random() > 0.2 // 80% chance to be available
      }));
    };

    setAvailableJobs(generateDailyJobs());
    
    // Refresh jobs every hour
    const interval = setInterval(() => {
      setAvailableJobs(generateDailyJobs());
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Filter jobs based on selected filters
  const getFilteredJobs = (): Job[] => {
    return availableJobs.filter(job => {
      const departmentMatch = filterDepartment === 'all' || job.department === filterDepartment;
      const difficultyMatch = filterDifficulty === 'all' || job.difficulty === filterDifficulty;
      return departmentMatch && difficultyMatch && job.available && job.currentWorkers < job.maxWorkers;
    });
  };

  // Get available characters for a job
  const getEligibleCharacters = (job: Job): Character[] => {
    return characters.filter(character => {
      const levelMatch = character.level >= job.requiredLevel;
      const typeMatch = !job.requiredType || character.type === job.requiredType;
      const notWorking = !character.working;
      return levelMatch && typeMatch && notWorking;
    });
  };

  // Assign character to job
  const assignCharacterToJob = (character: Character, job: Job): void => {
    if (!character || !job) return;

    // Update character to working status
    const updatedCharacters = characters.map(char => 
      char.id === character.id 
        ? { ...char, working: true, job: job.title, department: job.department }
        : char
    );

    // Create assignment record
    const newAssignment: Assignment = {
      characterId: character.id,
      jobId: job.id,
      assignedAt: new Date(),
      duration: 8 // 8 hour shift
    };

    setAssignments(prev => [...prev, newAssignment]);

    // Update job current workers
    setAvailableJobs(prev => 
      prev.map(j => 
        j.id === job.id 
          ? { ...j, currentWorkers: j.currentWorkers + 1 }
          : j
      )
    );

    // Update family data
    const updatedFamilyData = {
      characters: updatedCharacters,
      familySize: updatedCharacters.length,
      dailyEarnings: updatedCharacters
        .filter(char => char.working)
        .reduce((sum, char) => sum + calculateEarnings(char), 0),
      totalLunc: 0 // This would come from parent component
    };

    setFamilyData(updatedFamilyData);

    // Trigger callback
    if (onJobAssign) {
      onJobAssign(character.name, job.title);
    }

    // Reset selections
    setSelectedJob(null);
    setSelectedCharacter(null);
  };

  const getDepartments = (): string[] => {
    const departments = [...new Set(availableJobs.map(job => job.department))];
    return departments;
  };

  const workingCharacters = characters.filter(char => char.working);
  const idleCharacters = characters.filter(char => !char.working);
  const filteredJobs = getFilteredJobs();

  return (
    <div className="job-assignment">
      <div className="job-header">
        <h1>💼 Job Assignment Center</h1>
        <div className="job-stats">
          <div className="stat">
            <span className="stat-value">{workingCharacters.length}</span>
            <span className="stat-label">Arbeiten</span>
          </div>
          <div className="stat">
            <span className="stat-value">{idleCharacters.length}</span>
            <span className="stat-label">Verfügbar</span>
          </div>
          <div className="stat">
            <span className="stat-value">{filteredJobs.length}</span>
            <span className="stat-label">Offene Jobs</span>
          </div>
          <div className="stat">
            <span className="stat-value">{assignments.length}</span>
            <span className="stat-label">Heute zugewiesen</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="job-filters">
        <div className="filter-group">
          <label>Abteilung:</label>
          <select 
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            <option value="all">Alle Abteilungen</option>
            {getDepartments().map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Schwierigkeit:</label>
          <select 
            value={filterDifficulty} 
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="all">Alle Schwierigkeiten</option>
            <option value="easy">🟢 Einfach</option>
            <option value="medium">🟡 Mittel</option>
            <option value="hard">🔴 Schwer</option>
          </select>
        </div>
      </div>

      {/* Available Jobs */}
      <div className="jobs-section">
        <h2>🎯 Verfügbare Jobs</h2>
        <div className="jobs-grid">
          {filteredJobs.map(job => {
            const eligibleCharacters = getEligibleCharacters(job);
            return (
              <div 
                key={job.id} 
                className={`job-card ${job.difficulty} ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
              >
                <div className="job-header">
                  <h3>{job.title}</h3>
                  <div className="job-badges">
                    <span className={`difficulty-badge ${job.difficulty}`}>
                      {job.difficulty === 'easy' ? '🟢' : job.difficulty === 'medium' ? '🟡' : '🔴'}
                    </span>
                    {job.requiredType && (
                      <span className={`type-badge ${job.requiredType}`}>
                        {job.requiredType === 'legendary' ? '💎' : job.requiredType === 'rare' ? '⭐' : '👤'}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="job-info">
                  <div className="job-detail">
                    <span className="label">Abteilung:</span>
                    <span>{job.department} (Stock {job.floor})</span>
                  </div>
                  <div className="job-detail">
                    <span className="label">Min. Level:</span>
                    <span>{job.requiredLevel}</span>
                  </div>
                  <div className="job-detail">
                    <span className="label">Bezahlung:</span>
                    <span className="pay">{job.dailyPay} LUNC/Tag</span>
                  </div>
                  <div className="job-detail">
                    <span className="label">Verfügbar:</span>
                    <span>{job.maxWorkers - job.currentWorkers}/{job.maxWorkers} Plätze</span>
                  </div>
                </div>
                
                <div className="job-description">
                  <p>{job.description}</p>
                </div>
                
                <div className="job-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {job.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="eligible-characters">
                  <span className="eligible-count">
                    {eligibleCharacters.length} geeignete Charaktere
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="no-jobs">
            <p>🕐 Keine Jobs mit den aktuellen Filtern gefunden.</p>
          </div>
        )}
      </div>

      {/* Character Selection for Selected Job */}
      {selectedJob && (
        <div className="character-selection">
          <h2>👥 Charakter für "{selectedJob.title}" auswählen</h2>
          <div className="characters-grid">
            {getEligibleCharacters(selectedJob).map(character => (
              <div 
                key={character.id}
                className={`character-card ${character.type} ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
                onClick={() => setSelectedCharacter(selectedCharacter?.id === character.id ? null : character)}
              >
                <div className="character-header">
                  <h3>{character.name}</h3>
                  <span className={`character-type ${character.type}`}>
                    {character.type === 'legendary' ? '💎' : character.type === 'rare' ? '⭐' : '👤'}
                  </span>
                </div>
                
                <div className="character-stats">
                  <div className="stat">
                    <span className="label">Level:</span>
                    <span>{character.level}</span>
                  </div>
                  <div className="stat">
                    <span className="label">Glück:</span>
                    <span>{character.happiness}%</span>
                  </div>
                  <div className="stat">
                    <span className="label">Potenzial:</span>
                    <span>{calculateEarnings(character)} LUNC/Tag</span>
                  </div>
                </div>
                
                <div className="character-suitability">
                  <div className="suitability-bar">
                    <div 
                      className="suitability-fill"
                      style={{ 
                        width: `${Math.min(100, (character.level / selectedJob.requiredLevel) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="suitability-text">
                    {character.level >= selectedJob.requiredLevel ? '✅ Geeignet' : '❌ Level zu niedrig'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {getEligibleCharacters(selectedJob).length === 0 && (
            <div className="no-eligible">
              <p>❌ Keine geeigneten Charaktere für diesen Job gefunden.</p>
              <p>Benötigt: Level {selectedJob.requiredLevel}+
                {selectedJob.requiredType && ` • ${selectedJob.requiredType} Typ`}
              </p>
            </div>
          )}
          
          {/* Assignment Button */}
          {selectedCharacter && selectedJob && (
            <div className="assignment-confirmation">
              <div className="confirmation-details">
                <h3>Job-Zuweisung bestätigen</h3>
                <p>
                  <strong>{selectedCharacter.name}</strong> wird als <strong>{selectedJob.title}</strong> arbeiten.
                </p>
                <p>Erwarteter Verdienst: <strong>{selectedJob.dailyPay} LUNC/Tag</strong></p>
              </div>
              
              <button 
                className="assign-btn"
                onClick={() => assignCharacterToJob(selectedCharacter, selectedJob)}
              >
                💼 Job zuweisen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Current Assignments */}
      {workingCharacters.length > 0 && (
        <div className="current-assignments">
          <h2>👷 Aktuelle Zuweisungen</h2>
          <div className="assignments-grid">
            {workingCharacters.map(character => (
              <div key={character.id} className="assignment-card">
                <div className="assignment-info">
                  <span className="character-name">{character.name}</span>
                  <span className="job-title">{character.job}</span>
                  <span className="department">{character.department}</span>
                  <span className="earnings">{calculateEarnings(character)} LUNC/Tag</span>
                </div>
                
                <button 
                  className="unassign-btn"
                  onClick={() => {
                    // Logic to unassign character
                    const updatedCharacters = characters.map(char => 
                      char.id === character.id 
                        ? { ...char, working: false }
                        : char
                    );
                    
                    setFamilyData({
                      characters: updatedCharacters,
                      familySize: updatedCharacters.length,
                      dailyEarnings: updatedCharacters
                        .filter(char => char.working)
                        .reduce((sum, char) => sum + calculateEarnings(char), 0)
                    });
                  }}
                >
                  🏠 Freistellen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAssignment;