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
          🦸 HERO SECTION - MARKETING FOCUS
          ===================================
          
          Zweck: Erste Eindruck für neue Besucher
          - Projekt vorstellen
          - Wichtigste Features highlighten  
          - Call-to-Action Buttons
          - Vertrauen durch Dubai LLC Info
      */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* Linke Seite: Marketing Content */}
          <div className="hero-content">
            
            {/* New Launch Badge - Aufmerksamkeit erregen */}
            <div className="hero-badge">
              ✨ NEU GELAUNCHT - FRÜHER ZUGANG VERFÜGBAR!
            </div>
            
            {/* Haupttitel - Projekt Name */}
            <h1 className="hero-title">
              🏢 Virtual Building Empire
            </h1>
            
            {/* Untertitel - Was ist das Projekt */}
            <h2 className="hero-subtitle">
              Das erste Character Collection Game mit LUNC Rewards
            </h2>
            
            {/* Beschreibung - Kurz und prägnant */}
            <p className="hero-description">
              🎮 <strong>Sammle einzigartige NFT-Charaktere</strong> und weise sie Jobs in unserem 
              virtuellen 25-stöckigen Gebäude zu. Verdiene täglich <strong>LUNC Token</strong> durch 
              strategisches Gaming. <br/>
              <span className="highlight">Keine Investitionen - nur pures Entertainment!</span>
            </p>
            
            {/* Live Statistiken - Vertrauen aufbauen */}
            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.totalCharacters)}</span>
                <span className="hero-stat-label">Einzigartige Charaktere</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-number">{formatNumber(stats.dailyLuncPool)}</span>
                <span className="hero-stat-label">LUNC täglich im Pool</span>
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
                🎮 Jetzt kostenlos spielen
              </button>
              
              {/* Sekundärer Button - Mehr Infos */}
              <button 
                className="cta-button secondary"
                onClick={() => setShowMoreInfo(!showMoreInfo)}
              >
                📖 Wie funktioniert's?
              </button>
            </div>
            
            {/* Legal Disclaimer - Compliance */}
            <div className="hero-disclaimer">
              🏢 <strong>Dubai LLC</strong> | 
              🎯 <strong>Entertainment Only</strong> | 
              💎 <strong>LUNC Gaming Rewards</strong>
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
          🎯 FEATURES SECTION
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
            <h2 className="section-title">🎮 Einzigartige Spielmechaniken</h2>
            <p className="section-subtitle">
              Was macht Virtual Building Empire anders als andere NFT-Projekte?
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
              <h3 className="feature-title">Familie System</h3>
              <p className="feature-description">
                Sammle mehrere Charaktere als "Familie". Größere Familien erhalten 
                Boni von bis zu <strong>20%</strong> auf alle LUNC-Verdienste!
              </p>
              
              {/* Erweiterte Info bei Klick */}
              {selectedFeature === 'family' && (
                <div className="feature-details">
                  <ul>
                    <li>🏠 <strong>Kleine Familie (1-3):</strong> Perfekt für Einsteiger</li>
                    <li>🏡 <strong>Mittlere Familie (4-7):</strong> 5% Bonus auf alle Verdienste</li>
                    <li>🏰 <strong>Große Familie (8+):</strong> 10-20% Bonus + exklusive Jobs</li>
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
              <h3 className="feature-title">Ein Gebäude für Alle</h3>
              <p className="feature-description">
                Alle 2,500 NFT-Charaktere arbeiten im <strong>gleichen virtuellen Gebäude</strong>. 
                Konkurriere täglich mit anderen Familien um die besten Jobs!
              </p>
              
              {selectedFeature === 'building' && (
                <div className="feature-details">
                  <ul>
                    <li>🏢 <strong>25. Stock:</strong> Management (200 LUNC/Tag)</li>
                    <li>💼 <strong>15.-24. Stock:</strong> Professional (50-80 LUNC/Tag)</li>
                    <li>🔧 <strong>5.-14. Stock:</strong> Operations (20-45 LUNC/Tag)</li>
                    <li>🍽️ <strong>1.-4. Stock:</strong> Service (10-30 LUNC/Tag)</li>
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
              <h3 className="feature-title">Tägliche LUNC Rewards</h3>
              <p className="feature-description">
                Verdiene jeden Tag echte <strong>LUNC Token</strong> basierend auf der 
                Performance deiner Charaktere. Keine Investment-Risiken!
              </p>
              
              {selectedFeature === 'rewards' && (
                <div className="feature-details">
                  <ul>
                    <li>💎 <strong>Legendary Characters:</strong> 100-200 LUNC/Tag</li>
                    <li>⭐ <strong>Rare Characters:</strong> 40-80 LUNC/Tag</li>
                    <li>👤 <strong>Common Characters:</strong> 10-40 LUNC/Tag</li>
                    <li>🎯 <strong>Familie Boni:</strong> Bis zu 20% Extra</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Feature 4: Dubai LLC Compliance */}
            <div 
              className={`feature-card ${selectedFeature === 'legal' ? 'active' : ''}`}
              onClick={() => setSelectedFeature(selectedFeature === 'legal' ? null : 'legal')}
            >
              <div className="feature-icon">⚖️</div>
              <h3 className="feature-title">Vollständig Konform</h3>
              <p className="feature-description">
                <strong>Dubai LLC</strong> Struktur mit klarem Gaming-Fokus. 
                Keine Investment-Sprache, nur Entertainment!
              </p>
              
              {selectedFeature === 'legal' && (
                <div className="feature-details">
                  <ul>
                    <li>🏢 <strong>Dubai LLC:</strong> Vollständig registriert</li>
                    <li>🎮 <strong>Gaming Only:</strong> Keine Investment-Beratung</li>
                    <li>🎯 <strong>Entertainment:</strong> Reines Spielerlebnis</li>
                    <li>💎 <strong>LUNC Rewards:</strong> Gaming-Belohnungen, keine Returns</li>
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
          ⚖️ LEGAL & COMPLIANCE SECTION
          ===================================
          
          Zweck: Vertrauen und Transparenz
          - Dubai LLC Information
          - Entertainment Disclaimer
          - Keine Investment-Beratung
      */}
      <section className="legal-section">
        <div className="section-container">
          
          <div className="legal-content">
            <div className="legal-header">
              <h3 className="legal-title">
                🏢 Vollständig konform & transparent
              </h3>
              <p className="legal-subtitle">
                Sicherheit und Compliance stehen bei uns an erster Stelle
              </p>
            </div>
            
            <div className="legal-grid">
              
              {/* Dubai LLC Information */}
              <div className="legal-card">
                <div className="legal-icon">🏢</div>
                <h4>Dubai LLC</h4>
                <p>
                  Registrierte Gesellschaft in Dubai, UAE. 
                  Vollständige Compliance mit lokalen Cryptocurrency-Regulierungen.
                </p>
              </div>
              
              {/* Entertainment Focus */}
              <div className="legal-card">
                <div className="legal-icon">🎮</div>
                <h4>Entertainment Only</h4>
                <p>
                  Virtual Building Empire ist eine Gaming-Plattform für Entertainment-Zwecke. 
                  Keine Investment-Beratung oder Finanzdienstleistungen.
                </p>
              </div>
              
              {/* Gaming Rewards */}
              <div className="legal-card">
                <div className="legal-icon">💎</div>
                <h4>Gaming Rewards</h4>
                <p>
                  LUNC Token sind Gameplay-Belohnungen für aktive Teilnahme, 
                  keine Investment-Returns oder garantierte Renditen.
                </p>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="legal-disclaimer">
              <p>
                <strong>Wichtiger Hinweis:</strong> Virtual Building Empire ist ein 
                blockchain-basiertes Spiel für Entertainment-Zwecke. Alle LUNC-Belohnungen 
                sind Gameplay-Rewards und stellen keine Investment-Beratung dar. 
                Bitte spiele verantwortungsvoll.
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
          - Community Links (später)
          - Contact Information
      */}
      <section className="cta-footer">
        <div className="section-container">
          
          <div className="cta-content">
            <h2 className="cta-title">
              🚀 Bereit für das Character Collection Game der Zukunft?
            </h2>
            <p className="cta-description">
              Werde Teil der Virtual Building Empire Community und starte noch heute 
              dein Gaming-Abenteuer mit LUNC Rewards!
            </p>
            
            <div className="cta-buttons">
              <button className="cta-button large primary">
                🎮 Jetzt kostenlosen Account erstellen
              </button>
              <button className="cta-button large secondary">
                💬 Community beitreten
              </button>
            </div>
            
            {/* Community Stats */}
            <div className="community-stats">
              <div className="community-stat">
                <span className="stat-number">{formatNumber(stats.activePlayers)}</span>
                <span className="stat-label">Aktive Spieler</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(1250)}</span>
                <span className="stat-label">Charaktere geminted</span>
              </div>
              <div className="community-stat">
                <span className="stat-number">{formatNumber(89000)}</span>
                <span className="stat-label">LUNC ausgezahlt</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Homepage;