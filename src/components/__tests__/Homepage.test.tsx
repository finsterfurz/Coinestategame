import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Homepage from '../Homepage';

// Mock data for testing
const mockProps = {
  characters: [
    {
      id: '1',
      name: 'Hans Müller',
      type: 'worker',
      rarity: 'common',
      level: 5,
      job: 'Arbeiter',
      department: 'Produktion',
      dailyEarnings: 100,
      happiness: 85,
      working: true,
      image: '/images/characters/worker1.png'
    },
    {
      id: '2', 
      name: 'Anna Schmidt',
      type: 'manager',
      rarity: 'rare',
      level: 8,
      job: 'Manager',
      department: 'Verwaltung',
      dailyEarnings: 250,
      happiness: 92,
      working: false,
      image: '/images/characters/manager1.png'
    }
  ],
  luncBalance: 1500,
  totalDailyEarnings: 350,
  onMintCharacter: jest.fn(),
  onAssignJob: jest.fn(),
  onCollectEarnings: jest.fn()
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

  it('renders homepage with welcome message', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText(/Virtual Building Empire/i)).toBeInTheDocument();
    expect(screen.getByText(/willkommen/i)).toBeInTheDocument();
  });

  it('displays correct LUNC balance', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText(/LUNC/i)).toBeInTheDocument();
  });

  it('shows total daily earnings', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText(/tägliche einnahmen/i)).toBeInTheDocument();
  });

  it('displays character count', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/charaktere/i)).toBeInTheDocument();
  });

  it('shows working characters count', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/arbeiter/i)).toBeInTheDocument();
  });

  it('renders character cards', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByText('Hans Müller')).toBeInTheDocument();
    expect(screen.getByText('Anna Schmidt')).toBeInTheDocument();
  });

  it('displays character details correctly', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    // Check Hans Müller details
    expect(screen.getByText('Level: 5')).toBeInTheDocument();
    expect(screen.getByText('Arbeiter')).toBeInTheDocument();
    expect(screen.getByText('100 LUNC/Tag')).toBeInTheDocument();
    
    // Check Anna Schmidt details
    expect(screen.getByText('Level: 8')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('250 LUNC/Tag')).toBeInTheDocument();
  });

  it('calls onMintCharacter when mint button is clicked', async () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    const mintButton = screen.getByText(/neuen charakter minten/i);
    fireEvent.click(mintButton);
    
    await waitFor(() => {
      expect(mockProps.onMintCharacter).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onCollectEarnings when collect button is clicked', async () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    const collectButton = screen.getByText(/einnahmen sammeln/i);
    fireEvent.click(collectButton);
    
    await waitFor(() => {
      expect(mockProps.onCollectEarnings).toHaveBeenCalledTimes(1);
    });
  });

  it('handles empty character list', () => {
    const emptyProps = { ...mockProps, characters: [] };
    renderWithRouter(<Homepage {...emptyProps} />);
    
    expect(screen.getByText(/keine charaktere/i)).toBeInTheDocument();
  });

  it('displays working status correctly', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    // Hans is working
    const hansCard = screen.getByText('Hans Müller').closest('.character-card');
    expect(hansCard).toHaveClass('working');
    
    // Anna is not working
    const annaCard = screen.getByText('Anna Schmidt').closest('.character-card');
    expect(annaCard).not.toHaveClass('working');
  });

  it('shows character rarity styling', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    const hansCard = screen.getByText('Hans Müller').closest('.character-card');
    expect(hansCard).toHaveClass('common');
    
    const annaCard = screen.getByText('Anna Schmidt').closest('.character-card');
    expect(annaCard).toHaveClass('rare');
  });

  it('calculates happiness bar width correctly', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    const happinessBars = screen.getAllByTestId('happiness-bar');
    expect(happinessBars[0]).toHaveStyle('width: 85%');
    expect(happinessBars[1]).toHaveStyle('width: 92%');
  });

  it('handles large numbers formatting', () => {
    const largeBalanceProps = {
      ...mockProps,
      luncBalance: 1234567,
      totalDailyEarnings: 9999
    };
    
    renderWithRouter(<Homepage {...largeBalanceProps} />);
    
    expect(screen.getByText('1,234,567')).toBeInTheDocument();
    expect(screen.getByText('9,999')).toBeInTheDocument();
  });

  it('is accessible with proper ARIA labels', () => {
    renderWithRouter(<Homepage {...mockProps} />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByLabelText(/hauptbereich/i)).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
  });
});