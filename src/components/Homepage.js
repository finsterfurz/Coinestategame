import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Homepage = ({ familyData, buildingData, userConnected }) => {
  // ===================================
  // 🎯 STATE MANAGEMENT
  // ===================================
  
  // Lokaler State für Homepage-spezifische Features
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // ===================================
  // 🎮 HELPER FUNCTIONS
  // ===================================
  
  // Berechne Gesamtstatistiken für Hero-Sektion
  const getTotalStats = () => {
    return {
      totalCharacters: 2500,
      dailyLuncPool: 25000,
      buildingFloors: 25,
      activePlayers: 847 // Simuliert - später aus buildingData
    };
  };

  // Prüfe ob User bereits Charaktere besitzt
  const hasCharacters = () => {
    return userConnected && familyData.familySize > 0;
  };

  // Formatiere Zahlen für bessere Darstellung
  const formatNumber = (num) => {
    return num.toLocaleString('de-DE');
  };

  const stats = getTotalStats();

  return (
    <div className="homepage">
      
      {/* ===================================
          🦸 HERO SECTION - CLEAN & FOCUSED
          ===================================
          
          Zweck: Erste Eindruck für neue Besucher
          - Projekt vorstellen
          - Wichtigste Features highlighten  
          - Call-to-Action Buttons
          - Fokus auf Gaming und Rewards
      */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* Linke Seite: Marketing Content */}
          <div className="hero-content">
            
            {/* New Launch Badge - Aufmerksamkeit erregen */}
            <div className="hero-badge">
              ✨ LIVE NOW - FRÜHER ZUGANG VERFÜGBAR!
            </div>
            
            {/* Haupttitel - Projekt Name */}
            <h1 className="hero-title">
              🏢 Virtual Building Empire
            </h1>
            
            {/* Untertitel - Was ist das Projekt */}
            <h2 className="hero-subtitle">
              Das erste NFT Character Collection Game mit echten LUNC Rewards
            </h2>
            
            {/* Beschreibung - Kurz und prägnant */}
            <p className="hero-description">
              🎮 <strong>Sammle einzigartige NFT-Charaktere</strong> und baue dein eigenes 
              Immobilien-Imperium auf. Weise Jobs in unserem virtuellen 25-stöckigen Gebäude zu 
              und verdiene täglich <strong>LUNC Token</strong> durch strategisches Gaming. <br/>
              <span className="highlight">Pure Entertainment - Real Rewards!</span>
            </p>
            
            {/* Live Statistiken - Vertrauen aufbauen */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.totalCharacters)}</span>
                <span className="hero-stat-label">Einzigartige NFTs</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.dailyLuncPool)}</span>
                <span className="hero-stat-label">LUNC Pool</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{stats.buildingFloors}</span>
                <span className="hero-stat-label">Gebäude-Etagen</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.activePlayers)}</span>
                <span className="hero-stat-label">Aktive Spieler</span>
              </div>
            </div>
            
            {/* Call-to-Action Buttons */}
            <div className="hero-actions">
              {/* Primärer Button - Zum Gaming */}
              <button className="cta-button primary" onClick={() => {
                // Hier später Web3 Connection Logic
                console.log('Start Gaming clicked');
              }}>
                🚀 Jetzt spielen
              </button>
              
              {/* Sekundärer Button - Mehr Infos */}
              <button 
                className="cta-button secondary"
                onClick={() => setShowMoreInfo(!showMoreInfo)}
              >
                💡 Mehr erfahren
              </button>
            </div>
            
            {/* Simplified Trust Indicators */}
            <div className="hero-disclaimer">
              🎯 <strong>Gaming Entertainment</strong> | 
              💎 <strong>Real LUNC Rewards</strong> | 
              🔒 <strong>Secure & Transparent</strong>
            </div>
          </div>
          
          {/* Rechte Seite: Visuelle Darstellung */}
          <div className="hero-visual">
            
            {/* Animiertes Gebäude */}
            <div className="building-illustration">
              
              {/* Gebäude Etagen von oben nach unten */}
              <div className="building-floor management" title="Management - 25. Stock">
                <span className="floor-icon">🏢</span>
                <span className="floor-label">Management</span>
              </div>
              
              <div className="building-floor professional" title="Professional - 15.-24. Stock">
                <span className="floor-icon">💼</span>
                <span className="floor-label">Professional</span>
              </div>
              
              <div className="building-floor operations" title="Operations - 5.-14. Stock">
                <span className="floor-icon">🔧</span>
                <span className="floor-label">Operations</span>
              </div>
              
              <div className="building-floor service" title="Service - 1.-4. Stock">
                <span className="floor-icon">🍽️</span>
                <span className="floor-label">Service</span>
              </div>
              
              {/* Schwebende Charaktere Animation */}
              <div className="floating-characters">
                <span className="floating-char common" title="Common Character">👤</span>
                <span className="floating-char rare" title="Rare Character">⭐</span>
                <span className="floating-char legendary" title="Legendary Character">💎</span>
              </div>
              
              {/* LUNC Token Animation */}
              <div className="floating-lunc">
                <span className="lunc-token">💰</span>
                <span className="lunc-token">💰</span>
                <span className="lunc-token">💰</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          🎯 FEATURES SECTION - ENHANCED
          ===================================
          
          Zweck: Kernfeatures des Spiels erklären
          - Gaming-Mechaniken vorstellen
          - Warum einzigartig?
          - Nutzen für Spieler
      */}
      <section className="features-section">
        <div className="section-container">
          
          {/* Sektion Header */}
          <div className="section-header">
            <h2 className="section-title">🎮 Warum Virtual Building Empire?</h2>
            <p className="section-subtitle">
              Einzigartige Gaming-Mechaniken für nachhaltigen Spielspaß und echte Belohnungen
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="features-grid">
            
            {/* Feature 1: Familie System */}
            <div 
              className={`feature-card ${selectedFeature === 'family' ? 'active' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature === 'family' ? null : 'family')}
            >
              <div className="feature-icon">👨‍👩‍👧‍👦</div>
              <h3 className="feature-title">Sammle deine Familie</h3>
              <p className="feature-description">
                Baue eine starke Charakter-Familie auf und erhalte exklusive Boni. 
                Größere Familien verdienen bis zu <strong>25%</strong> mehr LUNC!
              </p>
              
              {/* Erweiterte Info bei Klick */}
              {selectedFeature === 'family' && (
                <div className="feature-details">
                  <ul>
                    <li>🏠 <strong>Starter Familie (1-3):</strong> Perfekt für den Einstieg</li>
                    <li>🏡 <strong>Große Familie (4-7):</strong> 10% Bonus auf alle Verdienste</li>
                    <li>🏰 <strong>Mega Familie (8+):</strong> 25% Bonus + VIP Jobs</li>
                    <li>🎁 <strong>Familienbonus:</strong> Spezielle Events und Belohnungen</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 2: Ein Gebäude Konzept */}
            <div 
              className={`feature-card ${selectedFeature === 'building' ? 'active' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature === 'building' ? null : 'building')}
            >
              <div className="feature-icon">🏢</div>
              <h3 className="feature-title">Ein Gebäude - Alle zusammen</h3>
              <p className="feature-description">
                Alle 2,500 NFT-Charaktere arbeiten im <strong>gleichen virtuellen Gebäude</strong>. 
                Täglich neue Herausforderungen und <strong>Live-Konkurrenz</strong> um die besten Jobs!
              </p>
              
              {selectedFeature === 'building' && (
                <div className="feature-details">
                  <ul>
                    <li>🏢 <strong>25. Stock:</strong> CEO Level (250 LUNC/Tag)</li>
                    <li>💼 <strong>15.-24. Stock:</strong> Management (80-150 LUNC/Tag)</li>
                    <li>🔧 <strong>5.-14. Stock:</strong> Operations (30-70 LUNC/Tag)</li>
                    <li>🍽️ <strong>1.-4. Stock:</strong> Service (15-40 LUNC/Tag)</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 3: LUNC Rewards */}
            <div 
              className={`feature-card ${selectedFeature === 'rewards' ? 'active' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature === 'rewards' ? null : 'rewards')}
            >
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Echte LUNC Rewards</h3>
              <p className="feature-description">
                Verdiene täglich echte <strong>LUNC Token</strong> durch aktives Gaming. 
                Performance-basierte Belohnungen ohne Investment-Risiken!
              </p>
              
              {selectedFeature === 'rewards' && (
                <div className="feature-details">
                  <ul>
                    <li>💎 <strong>Legendary NFTs:</strong> 120-250 LUNC/Tag</li>
                    <li>⭐ <strong>Rare NFTs:</strong> 50-100 LUNC/Tag</li>
                    <li>👤 <strong>Common NFTs:</strong> 15-50 LUNC/Tag</li>
                    <li>🎯 <strong>Performance Bonus:</strong> Bis zu 40% Extra</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 4: Community & Security */}
            <div 
              className={`feature-card ${selectedFeature === 'community' ? 'active' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature === 'community' ? null : 'community')}
            >
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Sicher & Community-driven</h3>
              <p className="feature-description">
                <strong>Transparente Blockchain-Technologie</strong> mit aktiver Community. 
                Sicheres Gaming-Erlebnis ohne versteckte Kosten!
              </p>
              
              {selectedFeature === 'community' && (
                <div className="feature-details">
                  <ul>
                    <li>🔒 <strong>Blockchain Security:</strong> Vollständig transparent</li>
                    <li>🎮 <strong>Gaming Focus:</strong> Pure Entertainment</li>
                    <li>👥 <strong>Active Community:</strong> 800+ aktive Spieler</li>
                    <li>💫 <strong>No Hidden Fees:</strong> Was du siehst, ist was du bekommst</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          📊 DASHBOARD SECTION (NUR FÜR EINGELOGGTE USER)
          ===================================
          
          Zweck: Gaming Dashboard Integration
          - Nur sichtbar wenn Wallet connected
          - Schnellübersicht der Familie
          - Links zu Gaming-Bereichen
      */}
      {userConnected && (
        <section className="dashboard-section">
          <div className="section-container">
            
            {/* Dashboard Header */}
            <div className="dashboard-header">
              <h2 className="section-title">
                📊 Willkommen zurück{hasCharacters() ? ', Familie!' : '!'}
              </h2>
              <p className="section-subtitle">
                {hasCharacters() 
                  ? 'Deine Charaktere warten auf neue Aufgaben' 
                  : 'Bereit für dein erstes Character Collection Game?'
                }
              </p>
            </div>
            
            {/* User hat bereits Charaktere - Dashboard anzeigen */}
            {hasCharacters() ? (
              <>
                {/* Familie Quick Stats */}
                <div className="quick-stats">
                  <div className="stat-card primary">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <span className="stat-number">{familyData.familySize}</span>
                      <span className="stat-label">Familie Mitglieder</span>
                    </div>
                  </div>
                  
                  <div className="stat-card success">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <span className="stat-number">{familyData.dailyEarnings}</span>
                      <span className="stat-label">LUNC pro Tag</span>
                    </div>
                  </div>
                  
                  <div className="stat-card warning">
                    <div className="stat-icon">💎</div>
                    <div className="stat-content">
                      <span className="stat-number">{formatNumber(familyData.totalLunc)}</span>
                      <span className="stat-label">Gesamt LUNC</span>
                    </div>
                  </div>
                  
                  <div className="stat-card info">
                    <div className="stat-icon">💼</div>
                    <div className="stat-content">
                      <span className="stat-number">
                        {familyData.characters.filter(c => c.working).length}
                      </span>
                      <span className="stat-label">Arbeiten gerade</span>
                    </div>
                  </div>
                </div>

                {/* Schnellaktionen für Gaming */}
                <div className="quick-actions">
                  <Link to="/family" className="action-card">
                    <div className="action-icon">👨‍👩‍👧‍👦</div>
                    <div className="action-content">
                      <h4>Familie verwalten</h4>
                      <p>Charaktere ansehen, Level-ups, Training</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/jobs" className="action-card">
                    <div className="action-icon">💼</div>
                    <div className="action-content">
                      <h4>Jobs zuweisen</h4>
                      <p>Täglich neue Jobs im Gebäude finden</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/building" className="action-card">
                    <div className="action-icon">🏢</div>
                    <div className="action-content">
                      <h4>Gebäude erkunden</h4>
                      <p>25 Etagen mit verschiedenen Abteilungen</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                  
                  <Link to="/marketplace" className="action-card">
                    <div className="action-icon">🛒</div>
                    <div className="action-content">
                      <h4>Marktplatz</h4>
                      <p>Charaktere kaufen & verkaufen</p>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                </div>
              </>
            ) : (
              /* User hat noch keine Charaktere - Onboarding */
              <div className="onboarding-section">
                <div className="onboarding-card">
                  <h3>🎮 Bereit für dein erstes Character Collection Game?</h3>
                  <p>
                    Starte mit einem Charakter für nur <strong>0.05 ETH</strong> und 
                    baue deine Familie auf!
                  </p>
                  
                  <div className="onboarding-steps">
                    <div className="onboarding-step">
                      <span className="step-number">1</span>
                      <span className="step-text">Ersten Charakter minten</span>
                    </div>
                    <div className="onboarding-step">
                      <span className="step-number">2</span>
                      <span className="step-text">Job im Gebäude finden</span>
                    </div>
                    <div className="onboarding-step">
                      <span className="step-number">3</span>
                      <span className="step-text">Täglich LUNC verdienen</span>
                    </div>
                  </div>
                  
                  <button className="onboarding-button">
                    🎯 Ersten Charakter minten
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===================================
          💡 HOW IT WORKS SECTION
          ===================================
          
          Zweck: Spielablauf erklären
          - Schritt-für-Schritt Anleitung
          - Visuell ansprechend
          - Vertrauen durch Transparenz
      */}
      <section className="how-it-works">
        <div className="section-container">
          
          <div className="section-header">
            <h2 className="section-title">🎯 So funktioniert Virtual Building Empire</h2>
            <p className="section-subtitle">
              Einfach zu verstehen, spannend zu spielen - so verdienst du LUNC!
            </p>
          </div>
          
          <div className="steps-container">
            
            {/* Schritt 1: Charaktere sammeln */}
            <div className="step-card">
              <div className="step-visual">
                <div className="step-number">1</div>
                <div className="step-animation">
                  {/* Charakter Sammlung Animation */}
                  <div className="character-collection">
                    <span className="char-icon">👤</span>
                    <span className="char-icon">⭐</span>
                    <span className="char-icon">💎</span>
                  </div>
                </div>
              </div>
              <div className="step-content">
                <h3 className="step-title">Charaktere sammeln</h3>
                <p className="step-description">
                  Mint neue NFT-Charaktere oder kaufe sie im Marktplatz. 
                  Jeder Charakter ist einzigartig mit verschiedenen Fähigkeiten!
                </p>
                <div className="step-details">
                  <span className="detail-item">💰 Ab 0.05 ETH</span>
                  <span className="detail-item">🎲 3 Seltenheitsgrade</span>
                  <span className="detail-item">👥 Familie aufbauen</span>
                </div>
              </div>
            </div>
            
            {/* Schritt 2: Jobs zuweisen */}
            <div className="step-card">
              <div className="step-visual">
                <div className="step-number">2</div>
                <div className="step-animation">
                  {/* Job Assignment Animation */}
                  <div className="job-assignment">
                    <div className="building-mini">🏢</div>
                    <div className="assignment-arrow">→</div>
                    <div className="worker-icon">👤</div>
                  </div>
                </div>
              </div>
              <div className="step-content">
                <h3 className="step-title">Jobs im Gebäude finden</h3>
                <p className="step-description">
                  Weise täglich Jobs in unserem 25-stöckigen Gebäude zu. 
                  Konkurriere mit anderen Familien um die besten Positionen!
                </p>
                <div className="step-details">
                  <span className="detail-item">🕐 Täglich neue Jobs</span>
                  <span className="detail-item">🏢 25 Etagen</span>
                  <span className="detail-item">⚡ Live Konkurrenz</span>
                </div>
              </div>
            </div>
            
            {/* Schritt 3: LUNC verdienen */}
            <div className="step-card">
              <div className="step-visual">
                <div className="step-number">3</div>
                <div className="step-animation">
                  {/* LUNC Rewards Animation */}
                  <div className="lunc-rewards">
                    <div className="reward-icon">💰</div>
                    <div className="reward-counter">+127 LUNC</div>
                  </div>
                </div>
              </div>
              <div className="step-content">
                <h3 className="step-title">LUNC Rewards kassieren</h3>
                <p className="step-description">
                  Sammle täglich LUNC Token basierend auf der Performance deiner 
                  Charaktere. Größere Familien erhalten Bonus-Belohnungen!
                </p>
                <div className="step-details">
                  <span className="detail-item">📅 Täglich auszahlbar</span>
                  <span className="detail-item">📈 Performance-basiert</span>
                  <span className="detail-item">🎁 Familie Boni</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          ⚖️ TRANSPARENCY SECTION - SIMPLIFIED
          ===================================
          
          Zweck: Vertrauen und Transparenz
          - Gaming Focus
          - Community-driven
          - Keine Investment-Sprache
      */}
      <section className="transparency-section">
        <div className="section-container">
          
          <div className="transparency-content">
            <div className="transparency-header">
              <h3 className="transparency-title">
                🛡️ Transparent & Community-focused
              </h3>
              <p className="transparency-subtitle">
                Sicherheit und faire Gaming-Mechaniken stehen bei uns an erster Stelle
              </p>
            </div>
            
            <div className="transparency-grid">
              
              {/* Gaming Focus */}
              <div className="transparency-card">
                <div className="transparency-icon">🎮</div>
                <h4>Pure Gaming Experience</h4>
                <p>
                  Virtual Building Empire ist eine Gaming-Plattform für Entertainment-Zwecke. 
                  Fokus auf Spielspaß und Community-Erlebnis.
                </p>
              </div>
              
              {/* Blockchain Transparency */}
              <div className="transparency-card">
                <div className="transparency-icon">🔒</div>
                <h4>Blockchain Transparency</h4>
                <p>
                  Alle Transaktionen und Smart Contracts sind öffentlich einsehbar. 
                  Vollständige Transparenz durch Blockchain-Technologie.
                </p>
              </div>
              
              {/* Gaming Rewards */}
              <div className="transparency-card">
                <div className="transparency-icon">💎</div>
                <h4>Fair Gaming Rewards</h4>
                <p>
                  LUNC Token sind performance-basierte Gaming-Belohnungen. 
                  Keine versteckten Gebühren oder undurchsichtige Mechaniken.
                </p>
              </div>
            </div>
            
            {/* Simplified Disclaimer */}
            <div className="transparency-disclaimer">
              <p>
                <strong>Gaming Disclaimer:</strong> Virtual Building Empire ist ein 
                blockchain-basiertes Entertainment-Game. Alle LUNC-Belohnungen sind 
                Gaming-Rewards für aktive Teilnahme. Spiele verantwortungsvoll und 
                hab Spaß beim Aufbau deines Virtual Building Empire!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================
          🚀 CALL-TO-ACTION FOOTER
          ===================================
          
          Zweck: Final Push zum Gaming-Start
          - Letzter Call-to-Action
          - Community Links
          - Positive Gaming-focused Messaging
      */}
      <section className="cta-footer">
        <div className="section-container">
          
          <div className="cta-content">
            <h2 className="cta-title">
              🚀 Ready Player One? Starte dein Building Empire!
            </h2>
            <p className="cta-description">
              Werde Teil einer wachsenden Community von NFT-Sammlern und verdiene täglich 
              echte LUNC Rewards durch strategisches Gaming!
            </p>
            
            <div className="cta-buttons">
              <button className="cta-button large primary">
                🎮 Empire jetzt starten
              </button>
              <button className="cta-button large secondary">
                💬 Community Discord
              </button>
            </div>
            
            {/* Community Stats */}
            <div className="community-stats">
              <div className="community-stat">
                <span className="stat-number">{formatNumber(stats.activePlayers)}</span>
                <span className="stat-label">Aktive Builder</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(1250)}</span>
                <span className="stat-label">NFTs im Game</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(89000)}</span>
                <span className="stat-label">LUNC Rewards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Homepage;