import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterMinting from '../CharacterMinting';

// Mock data for testing
const mockProps = {
  luncBalance: 5000,
  onMint: jest.fn(),
  isLoading: false,
  mintingCosts: {
    basic: 100,
    premium: 500,
    legendary: 2000
  },
  mintingProgress: null as null | {
    type: string;
    progress: number;
    message: string;
  }
};

const mockWeb3 = {
  account: '0x1234567890123456789012345678901234567890',
  connected: true,
  balance: '5000'
};

// Mock Web3 context
jest.mock('../../context/Web3Context', () => ({
  useWeb3: () => mockWeb3
}));

describe('CharacterMinting Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders character minting interface', () => {
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByText(/charakter minten/i)).toBeInTheDocument();
    expect(screen.getByText(/wähle dein minting-paket/i)).toBeInTheDocument();
  });

  it('displays all minting tiers', () => {
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByText(/basic/i)).toBeInTheDocument();
    expect(screen.getByText(/premium/i)).toBeInTheDocument();
    expect(screen.getByText(/legendary/i)).toBeInTheDocument();
  });

  it('shows correct minting costs', () => {
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('displays user LUNC balance', () => {
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByText('5,000')).toBeInTheDocument();
    expect(screen.getByText(/dein guthaben/i)).toBeInTheDocument();
  });

  it('enables mint buttons when user has sufficient balance', () => {
    render(<CharacterMinting {...mockProps} />);
    
    const basicButton = screen.getByTestId('mint-basic-button');
    const premiumButton = screen.getByTestId('mint-premium-button');
    const legendaryButton = screen.getByTestId('mint-legendary-button');
    
    expect(basicButton).not.toBeDisabled();
    expect(premiumButton).not.toBeDisabled();
    expect(legendaryButton).not.toBeDisabled();
  });

  it('disables mint buttons when user has insufficient balance', () => {
    const lowBalanceProps = { ...mockProps, luncBalance: 50 };
    render(<CharacterMinting {...lowBalanceProps} />);
    
    const basicButton = screen.getByTestId('mint-basic-button');
    const premiumButton = screen.getByTestId('mint-premium-button');
    const legendaryButton = screen.getByTestId('mint-legendary-button');
    
    expect(basicButton).toBeDisabled();
    expect(premiumButton).toBeDisabled();
    expect(legendaryButton).toBeDisabled();
  });

  it('calls onMint with correct tier when basic mint button is clicked', async () => {
    render(<CharacterMinting {...mockProps} />);
    
    const basicButton = screen.getByTestId('mint-basic-button');
    fireEvent.click(basicButton);
    
    await waitFor(() => {
      expect(mockProps.onMint).toHaveBeenCalledWith('basic', 100);
    });
  });

  it('calls onMint with correct tier when premium mint button is clicked', async () => {
    render(<CharacterMinting {...mockProps} />);
    
    const premiumButton = screen.getByTestId('mint-premium-button');
    fireEvent.click(premiumButton);
    
    await waitFor(() => {
      expect(mockProps.onMint).toHaveBeenCalledWith('premium', 500);
    });
  });

  it('calls onMint with correct tier when legendary mint button is clicked', async () => {
    render(<CharacterMinting {...mockProps} />);
    
    const legendaryButton = screen.getByTestId('mint-legendary-button');
    fireEvent.click(legendaryButton);
    
    await waitFor(() => {
      expect(mockProps.onMint).toHaveBeenCalledWith('legendary', 2000);
    });
  });

  it('shows loading state when isLoading is true', () => {
    const loadingProps = { ...mockProps, isLoading: true };
    render(<CharacterMinting {...loadingProps} />);
    
    expect(screen.getByText(/wird geminted/i)).toBeInTheDocument();
    
    // All buttons should be disabled during loading
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('displays minting progress when available', () => {
    const progressProps = {
      ...mockProps,
      mintingProgress: {
        type: 'premium',
        progress: 65,
        message: 'Charakter wird erstellt...'
      }
    };
    render(<CharacterMinting {...progressProps} />);
    
    expect(screen.getByText('Charakter wird erstellt...')).toBeInTheDocument();
    expect(screen.getByText('65%')).toBeInTheDocument();
    
    const progressBar = screen.getByTestId('minting-progress-bar');
    expect(progressBar).toHaveStyle('width: 65%');
  });

  it('shows character rarity probabilities', () => {
    render(<CharacterMinting {...mockProps} />);
    
    // Basic tier probabilities
    expect(screen.getByText(/70% common/i)).toBeInTheDocument();
    expect(screen.getByText(/25% uncommon/i)).toBeInTheDocument();
    expect(screen.getByText(/5% rare/i)).toBeInTheDocument();
    
    // Premium tier probabilities
    expect(screen.getByText(/40% uncommon/i)).toBeInTheDocument();
    expect(screen.getByText(/35% rare/i)).toBeInTheDocument();
    expect(screen.getByText(/20% epic/i)).toBeInTheDocument();
    expect(screen.getByText(/5% legendary/i)).toBeInTheDocument();
    
    // Legendary tier probabilities
    expect(screen.getByText(/50% epic/i)).toBeInTheDocument();
    expect(screen.getByText(/40% legendary/i)).toBeInTheDocument();
    expect(screen.getByText(/10% mythic/i)).toBeInTheDocument();
  });

  it('shows wallet connection requirement when not connected', () => {
    const disconnectedWeb3 = { ...mockWeb3, connected: false, account: null };
    jest.mocked(require('../../context/Web3Context').useWeb3).mockReturnValue(disconnectedWeb3);
    
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByText(/wallet verbinden/i)).toBeInTheDocument();
    
    const mintButtons = screen.getAllByTestId(/mint-.*-button/);
    mintButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('handles insufficient balance warning', () => {
    const lowBalanceProps = { ...mockProps, luncBalance: 50 };
    render(<CharacterMinting {...lowBalanceProps} />);
    
    expect(screen.getByText(/nicht genügend lunc/i)).toBeInTheDocument();
    expect(screen.getByText(/guthaben aufladen/i)).toBeInTheDocument();
  });

  it('displays minting history when available', () => {
    const historyProps = {
      ...mockProps,
      recentMints: [
        {
          id: '1',
          name: 'Hans Arbeiter',
          rarity: 'common',
          timestamp: new Date(),
          tier: 'basic'
        },
        {
          id: '2',
          name: 'Epic Manager',
          rarity: 'epic',
          timestamp: new Date(),
          tier: 'premium'
        }
      ]
    };
    
    render(<CharacterMinting {...historyProps} />);
    
    expect(screen.getByText(/kürzlich gemintete charaktere/i)).toBeInTheDocument();
    expect(screen.getByText('Hans Arbeiter')).toBeInTheDocument();
    expect(screen.getByText('Epic Manager')).toBeInTheDocument();
  });

  it('shows character preview on hover', async () => {
    render(<CharacterMinting {...mockProps} />);
    
    const basicTier = screen.getByTestId('basic-tier-card');
    fireEvent.mouseEnter(basicTier);
    
    await waitFor(() => {
      expect(screen.getByText(/charakter vorschau/i)).toBeInTheDocument();
    });
    
    fireEvent.mouseLeave(basicTier);
    
    await waitFor(() => {
      expect(screen.queryByText(/charakter vorschau/i)).not.toBeInTheDocument();
    });
  });

  it('is accessible with proper ARIA labels', () => {
    render(<CharacterMinting {...mockProps} />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
    });
    
    const tierCards = screen.getAllByTestId(/.*-tier-card/);
    tierCards.forEach(card => {
      expect(card).toHaveAttribute('role', 'button');
      expect(card).toHaveAttribute('tabIndex', '0');
    });
  });

  it('handles keyboard navigation', () => {
    render(<CharacterMinting {...mockProps} />);
    
    const basicTier = screen.getByTestId('basic-tier-card');
    basicTier.focus();
    
    fireEvent.keyDown(basicTier, { key: 'Enter', code: 'Enter' });
    
    expect(mockProps.onMint).toHaveBeenCalledWith('basic', 100);
  });
});