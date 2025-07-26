// ===================================
// 🎮 ENHANCED APP COMPONENT - TYPESCRIPT
// ===================================

import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';

// Modern Web3 Integration
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '@/services/web3Config';

// Store
import {
  useGameStore,
  useFamily,
  useBuilding,
  useIsWalletConnected,
  useGameSettings,
  useNotifications
} from '@/stores/gameStore';

// Components (Lazy loaded for performance)
const Homepage = React.lazy(() => import('@/components/Homepage'));
const FamilyManagement = React.lazy(() => import('@/components/FamilyManagement'));
const BuildingOverview = React.lazy(() => import('@/components/BuildingOverview'));
const JobAssignment = React.lazy(() => import('@/components/JobAssignment'));
const Marketplace = React.lazy(() => import('@/components/Marketplace'));
const CharacterMinting = React.lazy(() => import('@/components/CharacterMinting'));

// UI Components
import { GameLoader } from '@/components/ui/LoadingSpinner';
import { ErrorFallback } from '@/components/ui/ErrorFallback';
import { Navigation } from '@/components/layout/Navigation';
import { FloatingActions } from '@/components/layout/FloatingActions';
import { Footer } from '@/components/layout/Footer';
import { NotificationCenter } from '@/components/ui/NotificationCenter';

// Hooks
import { useGameInitialization } from '@/hooks/useGameInitialization';
import { useAutoSave } from '@/hooks/useAutoSave';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

// Styles
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';

// ===================================
// 🎯 REACT QUERY CLIENT
// ===================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// ===================================
// 🎮 MAIN APP COMPONENT
// ===================================

const App: React.FC = () => {
  // Store hooks
  const familyData = useFamily();
  const buildingData = useBuilding();
  const isWalletConnected = useIsWalletConnected();
  const gameSettings = useGameSettings();
  const notifications = useNotifications();
  
  // Game store actions
  const { setLoading, setError, clearErrors } = useGameStore();
  
  // Custom hooks
  const { isLoading: isInitializing, error: initError } = useGameInitialization();
  useAutoSave();
  usePerformanceMonitoring();
  
  // ===================================
  // 🎯 LOADING STATE
  // ===================================
  
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <GameLoader />
      </div>
    );
  }
  
  // ===================================
  // 🎯 ERROR STATE
  // ===================================
  
  if (initError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <ErrorFallback error={initError} resetError={clearErrors} />
      </div>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('App Error:', error);
        setError('general', error.message);
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <Router>
              <div className="App min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
                
                {/* ===================================
                    🧭 NAVIGATION
                    =================================== */}
                <Navigation />
                
                {/* ===================================
                    📱 MAIN CONTENT
                    =================================== */}
                <main className="container mx-auto px-4 py-8">
                  <Suspense fallback={<GameLoader />}>
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <Homepage 
                            familyData={familyData}
                            buildingData={buildingData}
                            isWalletConnected={isWalletConnected}
                          />
                        } 
                      />
                      
                      <Route 
                        path="/family" 
                        element={<FamilyManagement />} 
                      />
                      
                      <Route 
                        path="/building" 
                        element={<BuildingOverview />} 
                      />
                      
                      <Route 
                        path="/jobs" 
                        element={<JobAssignment />} 
                      />
                      
                      <Route 
                        path="/marketplace" 
                        element={<Marketplace />} 
                      />
                      
                      <Route 
                        path="/mint" 
                        element={<CharacterMinting />} 
                      />
                      
                      {/* 404 Route */}
                      <Route 
                        path="*" 
                        element={
                          <div className="text-center py-16">
                            <h2 className="text-2xl font-bold text-white mb-4">🚧 Seite nicht gefunden</h2>
                            <Link 
                              to="/" 
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              Zurück zur Startseite
                            </Link>
                          </div>
                        } 
                      />
                    </Routes>
                  </Suspense>
                </main>
                
                {/* ===================================
                    🎮 FLOATING ACTIONS
                    =================================== */}
                {isWalletConnected && familyData.characters.length > 0 && (
                  <FloatingActions />
                )}
                
                {/* ===================================
                    📱 FOOTER
                    =================================== */}
                <Footer />
                
                {/* ===================================
                    🔔 NOTIFICATION CENTER
                    =================================== */}
                <NotificationCenter notifications={notifications} />
                
                {/* ===================================
                    🍞 TOAST NOTIFICATIONS
                    =================================== */}
                <Toaster
                  position={gameSettings.language === 'de' ? 'bottom-right' : 'bottom-left'}
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1f2937',
                      color: '#ffffff',
                      border: '1px solid #374151',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </RainbowKitProvider>
        </WagmiConfig>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;