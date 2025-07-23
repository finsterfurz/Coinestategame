import React, { useState, useEffect } from 'react';

const JobAssignment = ({ characters, setFamilyData }) => {
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);

  // Job-Datenbank für das Gebäude
  const jobDatabase = {
    management: [
      { id: 'dir-001', title: 'Gebäude Direktor', salary: 200, requirements: ['legendary'], occupied: true, occupiedBy: 'Lisa Legend' },
      { id: 'man-001', title: 'IT Abteilungsleiter', salary: 120, requirements: ['rare', 'legendary'], occupied: false },
      { id: 'man-002', title: 'HR Manager', salary: 110, requirements: ['rare', 'legendary'], occupied: false },
      { id: 'man-003', title: 'Marketing Direktor', salary: 130, requirements: ['rare', 'legendary'], occupied: true, occupiedBy: 'Max Manager' },
      { id: 'man-004', title: 'Finanz Controller', salary: 125, requirements: ['rare', 'legendary'], occupied: false }
    ],
    professional: [
      { id: 'pro-001', title: 'Senior Developer', salary: 80, requirements: ['rare', 'legendary'], occupied: false },
      { id: 'pro-002', title: 'Marketing Spezialist', salary: 65, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'pro-003', title: 'Buchhalter', salary: 70, requirements: ['common', 'rare', 'legendary'], occupied: true, occupiedBy: 'Anna Admin' },
      { id: 'pro-004', title: 'System Administrator', salary: 75, requirements: ['rare', 'legendary'], occupied: false },
      { id: 'pro-005', title: 'Vertriebsmitarbeiter', salary: 60, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'pro-006', title: 'Designer', salary: 65, requirements: ['common', 'rare', 'legendary'], occupied: false }
    ],
    operations: [
      { id: 'ops-001', title: 'Hausmeister', salary: 35, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ops-002', title: 'Sicherheitschef', salary: 45, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ops-003', title: 'Reinigungskraft', salary: 25, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ops-004', title: 'Empfangsmitarbeiter', salary: 30, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ops-005', title: 'Lagerarbeiter', salary: 28, requirements: ['common', 'rare', 'legendary'], occupied: false }
    ],
    service: [
      { id: 'ser-001', title: 'Koch', salary: 40, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ser-002', title: 'Kellner', salary: 20, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ser-003', title: 'Fitnesstrainer', salary: 35, requirements: ['common', 'rare', 'legendary'], occupied: false },
      { id: 'ser-004', title: 'Masseur', salary: 45, requirements: ['rare', 'legendary'], occupied: false },
      { id: 'ser-005', title: 'Postbote', salary: 25, requirements: ['common', 'rare', 'legendary'], occupied: false }
    ]
  };

  const departments = [
    { id: 'all', name: 'Alle Abteilungen', icon: '🏢' },
    { id: 'management', name: 'Management', icon: '💼' },
    { id: 'professional', name: 'Professional', icon: '📊' },
    { id: 'operations', name: 'Operations', icon: '🔧' },
    { id: 'service', name: 'Service', icon: '🍽️' }
  ];

  useEffect(() => {
    // Lade verfügbare Jobs basierend auf ausgewählter Abteilung
    if (selectedDepartment === 'all') {
      const allJobs = Object.values(jobDatabase).flat();
      setAvailableJobs(allJobs);
    } else {
      setAvailableJobs(jobDatabase[selectedDepartment] || []);
    }
  }, [selectedDepartment]);

  const canCharacterDoJob = (character, job) => {
    return job.requirements.includes(character.type);
  };

  const handleJobAssignment = (character, job) => {
    if (!canCharacterDoJob(character, job) || job.occupied) {
      return;
    }

    // Update character with new job
    setFamilyData(prev => ({
      ...prev,
      characters: prev.characters.map(char => 
        char.id === character.id 
          ? { 
              ...char, 
              job: job.title, 
              dailyEarnings: job.salary,
              working: true,
              department: selectedDepartment
            }
          : char
      )
    }));

    // Mark job as occupied
    const updatedJobs = availableJobs.map(j => 
      j.id === job.id 
        ? { ...j, occupied: true, occupiedBy: character.name }
        : j
    );
    setAvailableJobs(updatedJobs);
    setShowAssignModal(false);
  };

  const openAssignModal = (character) => {
    setSelectedCharacter(character);
    setShowAssignModal(true);
  };

  const getJobStatusColor = (job) => {
    if (job.occupied) return '#dc3545';
    if (job.salary > 100) return '#ffc107';
    return '#28a745';
  };

  const idleCharacters = characters.filter(char => !char.working);
  const workingCharacters = characters.filter(char => char.working);

  return (
    <div className="job-assignment">
      <div className="game-card">
        <h1>💼 Job Assignment Center</h1>
        <p>Weise deinen Charakteren Jobs im Gebäude zu und konkurriere mit anderen Familien um die besten Positionen!</p>
      </div>

      {/* Familie Status */}
      <div className="game-card">
        <h2>👥 Deine Familie Status</h2>
        <div className="family-job-stats">
          <div className="job-stat">
            <div className="stat-number">{workingCharacters.length}</div>
            <div className="stat-label">Arbeiten</div>
          </div>
          <div className="job-stat">
            <div className="stat-number">{idleCharacters.length}</div>
            <div className="stat-label">Warten</div>
          </div>
          <div className="job-stat">
            <div className="stat-number">{workingCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0)}</div>
            <div className="stat-label">Tägliche LUNC</div>
          </div>
        </div>
      </div>

      {/* Wartende Charaktere */}
      {idleCharacters.length > 0 && (
        <div className="game-card">
          <h2>😴 Charaktere suchen Jobs</h2>
          <div className="idle-characters">
            {idleCharacters.map(character => (
              <div key={character.id} className={`character-card ${character.type}`}>
                <h4>{character.name}</h4>
                <p>Level {character.level} | {character.type}</p>
                <button 
                  className="game-button"
                  onClick={() => openAssignModal(character)}
                >
                  💼 Job suchen
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Abteilungs-Filter */}
      <div className="game-card">
        <h2>🏗️ Abteilungen</h2>
        <div className="department-filters">
          {departments.map(dept => (
            <button 
              key={dept.id}
              className={`department-filter ${selectedDepartment === dept.id ? 'active' : ''}`}
              onClick={() => setSelectedDepartment(dept.id)}
            >
              {dept.icon} {dept.name}
            </button>
          ))}
        </div>
      </div>

      {/* Verfügbare Jobs */}
      <div className="game-card">
        <h2>💼 Verfügbare Jobs - {departments.find(d => d.id === selectedDepartment)?.name || 'Alle'}</h2>
        <div className="jobs-grid">
          {availableJobs.map(job => (
            <div 
              key={job.id} 
              className={`job-card ${job.occupied ? 'occupied' : 'available'}`}
              style={{borderColor: getJobStatusColor(job)}}
            >
              <div className="job-header">
                <h4>{job.title}</h4>
                <div className="job-salary">{job.salary} LUNC/Tag</div>
              </div>
              <div className="job-requirements">
                <span>Anforderungen:</span>
                <div className="requirement-tags">
                  {job.requirements.map(req => (
                    <span key={req} className={`requirement-tag ${req}`}>
                      {req === 'common' ? 'Gewöhnlich' : 
                       req === 'rare' ? 'Selten' : 'Legendär'}
                    </span>
                  ))}
                </div>
              </div>
              <div className="job-status">
                {job.occupied ? (
                  <span className="occupied-by">👥 Besetzt von: {job.occupiedBy}</span>
                ) : (
                  <span className="available">✅ Verfügbar</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arbeitende Charaktere */}
      {workingCharacters.length > 0 && (
        <div className="game-card">
          <h2>💼 Deine arbeitenden Charaktere</h2>
          <div className="working-characters">
            {workingCharacters.map(character => (
              <div key={character.id} className={`character-card ${character.type} working`}>
                <h4>{character.name}</h4>
                <p><strong>Job:</strong> {character.job}</p>
                <p><strong>Abteilung:</strong> {character.department}</p>
                <p><strong>Verdienst:</strong> {character.dailyEarnings} LUNC/Tag</p>
                <button className="game-button secondary">
                  🔄 Job wechseln
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Assignment Modal */}
      {showAssignModal && selectedCharacter && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="job-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Job für {selectedCharacter.name} wählen</h2>
              <button 
                className="close-button"
                onClick={() => setShowAssignModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="character-info">
                <p><strong>Charakter:</strong> {selectedCharacter.name}</p>
                <p><strong>Level:</strong> {selectedCharacter.level}</p>
                <p><strong>Typ:</strong> {selectedCharacter.type}</p>
              </div>
              <div className="available-jobs-modal">
                {availableJobs.filter(job => !job.occupied && canCharacterDoJob(selectedCharacter, job)).map(job => (
                  <div key={job.id} className="job-option">
                    <div className="job-info">
                      <h4>{job.title}</h4>
                      <p>{job.salary} LUNC/Tag</p>
                    </div>
                    <button 
                      className="game-button"
                      onClick={() => handleJobAssignment(selectedCharacter, job)}
                    >
                      ✅ Zuweisen
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAssignment;