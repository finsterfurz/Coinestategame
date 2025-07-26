// ===================================
// 🧪 HOMEPAGE COMPONENT TESTS
// ===================================

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Homepage from '../Homepage';
import type { FamilyData, BuildingData } from '@/types/game.types';

// Mock the game store
jest.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    familyData: mockFamilyData,
    buildingData: mockBuildingData,
    walletState: { isConnected: false }
  }),
  useFamily: () => mockFamilyData,
  useBuilding: () => mockBuildingData,
  useIsWalletConnected: () => false
}));

const mockFamilyData: FamilyData = {
  characters: [
    {
      id: 1,
      name: "Test Character",
      type: "rare",
      job: "Manager",
      level: 10,
      dailyEarnings: 50,
      happiness: 85,
      working: true,
      department: "Management",
      mintedAt: new Date().toISOString()
    }
  ],
  totalLunc: 1500,
  familySize: 1,
  dailyEarnings: 50
};

const mockBuildingData: BuildingData = {
  totalEmployees: 100,
  availableJobs: 25,
  buildingEfficiency: 80,
  dailyLuncPool: 5000,
  floors: []
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Homepage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders homepage correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={false}
        walletAddress={undefined}
      />
    );

    expect(screen.getByText(/Virtual Building Empire/i)).toBeInTheDocument();
    expect(screen.getByText(/Willkommen/i)).toBeInTheDocument();
  });

  test('displays family statistics correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={false}
        walletAddress={undefined}
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Family size
    expect(screen.getByText('1,500')).toBeInTheDocument(); // LUNC balance
  });

  test('shows wallet connection prompt when not connected', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={false}
        walletAddress={undefined}
      />
    );

    expect(screen.getByText(/Wallet verbinden/i)).toBeInTheDocument();
  });

  test('shows different content when wallet is connected', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x1234567890123456789012345678901234567890"
      />
    );

    expect(screen.getByText(/0x1234/i)).toBeInTheDocument();
  });

  test('displays building efficiency correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x1234567890123456789012345678901234567890"
      />
    );

    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});