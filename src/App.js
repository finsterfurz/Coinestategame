import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Homepage from './components/Homepage';
import FamilyManagement from './components/FamilyManagement';
import BuildingOverview from './components/BuildingOverview';
import JobAssignment from './components/JobAssignment';
import Marketplace from './components/Marketplace';
import LuncWallet from './components/LuncWallet';
import './App.css';
import './styles/homepage.css';

function App() {
  const [familyData, setFamilyData] = useState({
    characters: [],
    totalLunc: 1250,
    familySize: 0,
    dailyEarnings: 0
  });

  const [buildingData, setBuildingData] = useState({
    totalEmployees: 847,
    availableJobs: 156,
    buildingEfficiency: 78,
    dailyLuncPool: 25000
  });

  // Web3 Connection State
  const [userConnected, setUserConnected] = useState(false);

  // Initialize demo data
  useEffect(() => {
    // Demo Familie mit verschiedenen Charakteren
    const demoCharacters = [
      {
        id: 1,
        name: "Max Manager",
        type: "rare",
        job: "Building Manager",
        level: 12,
        dailyEarnings: 85,
        happiness: 92,
        working: true,
        department: "Management"
      },
      {
        id: 2,
        name: "Anna Admin",
        type: "common",
        job: "Office Worker",
        level: 8,
        dailyEarnings: 35,
        happiness: 78,
        working: true,
        department: "Administration"
      },
      {
        id: 3,
        name: "Tom Tech",
        type: "rare",
        job: "IT Support",
        level: 15,
        dailyEarnings: 65,
        happiness: 88,
        working: false,
        department: "IT"
      },
      {
        id: 4,
        name: "Lisa Legend",
        type: "legendary",
        job: "Master Architect",
        level: 25,
        dailyEarnings: 150,
        happiness: 95,
        working: true,
        department: "Architecture"
      }
    ];

    setFamilyData(prev => ({
      ...prev,
      characters: demoCharacters,
      familySize: demoCharacters.length,
      dailyEarnings: demoCharacters.reduce((sum, char) => sum + char.dailyEarnings, 0)
    }));

    // Simulate user connection for demo
    setUserConnected(true);
  }, []);

  return (
    <Router>
      <div className="App">
        <nav className="game-nav">
          <div className="nav-container">
            <div className="nav-logo">
              🏢 <span>Virtual Building Empire</span>
            </div>
            <div className="nav-links">
              <Link to="/" className="nav-link">🏠 Home</Link>
              <Link to="/family" className="nav-link">👨‍👩‍👧‍👦 Familie</Link>
              <Link to="/building" className="nav-link">🏢 Gebäude</Link>
              <Link to="/jobs" className="nav-link">💼 Jobs</Link>
              <Link to="/marketplace" className="nav-link">🛒 Marktplatz</Link>
            </div>
            <LuncWallet balance={familyData.totalLunc} />
          </div>
        </nav>

        <main className="game-container">
          <Routes>
            <Route path="/" element={
              <Homepage 
                familyData={familyData} 
                buildingData={buildingData}
                userConnected={userConnected}
              />
            } />
            <Route path="/family" element={
              <FamilyManagement 
                familyData={familyData}
                setFamilyData={setFamilyData}
              />
            } />
            <Route path="/building" element={
              <BuildingOverview 
                buildingData={buildingData}
                setBuildingData={setBuildingData}
              />
            } />
            <Route path="/jobs" element={
              <JobAssignment 
                characters={familyData.characters}
                setFamilyData={setFamilyData}
              />
            } />
            <Route path="/marketplace" element={
              <Marketplace 
                familyData={familyData}
                setFamilyData={setFamilyData}
              />
            } />
          </Routes>
        </main>

        <footer className="game-footer">
          <p>🎮 Virtual Building Empire - Character Collection Game | Dubai LLC | Entertainment Only</p>
          <p>Keine Investment-Beratung | LUNC Rewards sind Gameplay-Belohnungen</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;