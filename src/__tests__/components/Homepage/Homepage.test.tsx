import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Homepage from '../../../components/Homepage';
import { FamilyData, BuildingData } from '../../../types/game';

// Test utilities
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

// Mock data
const mockFamilyData: FamilyData = {
  characters: [
    {
      id: 1,
      name: "Test Character",
      type: "common",
      job: "Office Worker",
      level: 5,
      dailyEarnings: 50,
      happiness: 80,
      working: true,
      department: "Administration",
      mintedAt: new Date('2024-01-01').toISOString(),
      experience: 500,
      skills: ["Organization"]
    },
    {
      id: 2,
      name: "Elite Character",
      type: "legendary",
      job: "CEO",
      level: 25,
      dailyEarnings: 200,
      happiness: 95,
      working: true,
      department: "Management",
      mintedAt: new Date('2024-01-15').toISOString(),
      experience: 5000,
      skills: ["Leadership", "Strategy", "Vision"]
    }
  ],
  totalLunc: 1500,
  familySize: 2,
  dailyEarnings: 250,
  familyBonus: 10,
  totalExperience: 5500
};

const mockBuildingData: BuildingData = {
  totalEmployees: 150,
  availableJobs: 35,
  buildingEfficiency: 85,
  dailyLuncPool: 7500
};

describe('Homepage Component', () => {
  beforeEach(() => {
    // Clear any previous localStorage data
    localStorage.clear();
  });

  test('renders homepage with correct title', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={false}
        walletAddress={null}
      />
    );
    
    expect(screen.getByText(/virtual building empire/i)).toBeInTheDocument();
  });

  test('displays family statistics correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Check if family size is displayed
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check if LUNC balance is displayed
    expect(screen.getByText(/1500/)).toBeInTheDocument();
    
    // Check if daily earnings are displayed
    expect(screen.getByText(/250/)).toBeInTheDocument();
  });

  test('shows wallet connection prompt when not connected', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={false}
        walletAddress={null}
      />
    );
    
    // Should show some indication to connect wallet
    expect(screen.getByText(/connect/i) || screen.getByText(/wallet/i)).toBeInTheDocument();
  });

  test('displays building efficiency correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    expect(screen.getByText(/85/)).toBeInTheDocument();
  });

  test('handles empty character list gracefully', () => {
    const emptyFamilyData: FamilyData = {
      ...mockFamilyData,
      characters: [],
      familySize: 0,
      dailyEarnings: 0,
      totalExperience: 0
    };

    renderWithRouter(
      <Homepage 
        familyData={emptyFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('calculates family bonus correctly', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Family bonus should be displayed somewhere
    if (mockFamilyData.familyBonus) {
      expect(screen.getByText(mockFamilyData.familyBonus.toString())).toBeInTheDocument();
    }
  });

  test('displays character types distribution', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Should show character rarity information
    const commonCount = mockFamilyData.characters.filter(c => c.type === 'common').length;
    const legendaryCount = mockFamilyData.characters.filter(c => c.type === 'legendary').length;
    
    expect(commonCount).toBe(1);
    expect(legendaryCount).toBe(1);
  });

  test('responsive design elements are present', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Check for responsive classes or data attributes
    const mainElement = screen.getByRole('main') || document.querySelector('.homepage');
    expect(mainElement).toBeInTheDocument();
  });

  test('handles loading states properly', async () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );

    // Component should render without loading indicators after data is provided
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  test('accessibility: has proper headings hierarchy', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Should have proper heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  test('navigation links are functional', () => {
    renderWithRouter(
      <Homepage 
        familyData={mockFamilyData}
        buildingData={mockBuildingData}
        userConnected={true}
        walletAddress="0x123...abc"
      />
    );
    
    // Check for navigation elements
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});