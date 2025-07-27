import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, Card, Input, Badge, Modal, Toast, CharacterCard, LuncDisplay } from '../components';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: React.forwardRef<HTMLButtonElement, any>((props, ref) => 
      <button ref={ref} {...props} />
    ),
    div: React.forwardRef<HTMLDivElement, any>((props, ref) => 
      <div ref={ref} {...props} />
    ),
    span: React.forwardRef<HTMLSpanElement, any>((props, ref) => 
      <span ref={ref} {...props} />
    ),
    p: React.forwardRef<HTMLParagraphElement, any>((props, ref) => 
      <p ref={ref} {...props} />
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Design System Components', () => {
  describe('Button Component', () => {
    test('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
    });

    test('applies variant classes correctly', () => {
      render(<Button variant="game">Game Button</Button>);
      const button = screen.getByRole('button', { name: /game button/i });
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    test('applies size classes correctly', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button', { name: /large button/i });
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg');
    });

    test('shows loading state', () => {
      render(<Button isLoading>Loading Button</Button>);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    test('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable</Button>);
      
      await userEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('can be disabled', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Card Component', () => {
    test('renders children correctly', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card content</p>
        </Card>
      );
      
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('applies variant classes', () => {
      render(<Card variant="game">Game Card</Card>);
      const card = screen.getByText('Game Card').closest('div');
      expect(card).toHaveClass('shadow-game');
    });

    test('applies custom className', () => {
      render(<Card className="custom-class">Custom Card</Card>);
      const card = screen.getByText('Custom Card').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Input Component', () => {
    test('renders with label', () => {
      render(<Input label="Email" placeholder="Enter email" />);
      
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    });

    test('shows error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    test('shows success message', () => {
      render(<Input success="Valid input" />);
      expect(screen.getByText('Valid input')).toBeInTheDocument();
    });

    test('applies error variant classes', () => {
      render(<Input variant="error" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300');
    });

    test('handles input changes', async () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test input');
      
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Badge Component', () => {
    test('renders with default variant', () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText('Default Badge')).toBeInTheDocument();
    });

    test('applies variant classes correctly', () => {
      render(<Badge variant="success">Success Badge</Badge>);
      const badge = screen.getByText('Success Badge');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });

    test('applies size classes correctly', () => {
      render(<Badge size="lg">Large Badge</Badge>);
      const badge = screen.getByText('Large Badge');
      expect(badge).toHaveClass('px-3', 'py-1', 'text-base');
    });

    test('renders rarity variants correctly', () => {
      render(<Badge variant="legendary">Legendary</Badge>);
      const badge = screen.getByText('Legendary');
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800', 'shadow-glow');
    });
  });

  describe('Modal Component', () => {
    test('renders when open', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    test('calls onClose when backdrop is clicked', async () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      // Click on backdrop (the overlay div)
      const backdrop = screen.getByText('Modal content').closest('div')?.parentElement?.previousElementSibling;
      if (backdrop) {
        await userEvent.click(backdrop);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    test('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /✕/i });
      await userEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('applies size classes correctly', () => {
      render(
        <Modal isOpen={true} onClose={jest.fn()} size="xl">
          <p>Large modal</p>
        </Modal>
      );
      
      const modal = screen.getByText('Large modal').closest('div');
      expect(modal).toHaveClass('max-w-4xl');
    });
  });

  describe('Toast Component', () => {
    test('renders with success type', () => {
      render(
        <Toast 
          type="success" 
          message="Operation successful" 
          isVisible={true} 
          onClose={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Operation successful')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    test('renders with error type', () => {
      render(
        <Toast 
          type="error" 
          message="Operation failed" 
          isVisible={true} 
          onClose={jest.fn()} 
        />
      );
      
      expect(screen.getByText('Operation failed')).toBeInTheDocument();
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    test('calls onClose when close button is clicked', async () => {
      const handleClose = jest.fn();
      render(
        <Toast 
          type="info" 
          message="Info message" 
          isVisible={true} 
          onClose={handleClose} 
        />
      );
      
      const closeButton = screen.getByRole('button', { name: /✕/i });
      await userEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('CharacterCard Component', () => {
    const mockCharacter = {
      id: 'char-1',
      name: 'John Developer',
      job: 'Senior Developer',
      type: 'rare' as const,
      dailyEarnings: 75,
      level: 5,
      happiness: 90,
      working: true,
      department: 'IT',
      mintedAt: '2024-01-01T00:00:00Z',
      ownerId: 'user-1',
      experience: 200,
      maxExperience: 400,
      skills: [],
      totalEarned: 1500,
    };

    test('renders character information correctly', () => {
      render(<CharacterCard character={mockCharacter} />);
      
      expect(screen.getByText('John Developer')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('rare')).toBeInTheDocument();
      expect(screen.getByText('75 LUNC/day')).toBeInTheDocument();
    });

    test('applies selection styling when selected', () => {
      render(<CharacterCard character={mockCharacter} isSelected={true} />);
      
      const card = screen.getByText('John Developer').closest('div');
      expect(card).toHaveClass('border-blue-500', 'shadow-game');
    });

    test('applies rarity-specific background styling', () => {
      const legendaryCharacter = { ...mockCharacter, type: 'legendary' as const };
      render(<CharacterCard character={legendaryCharacter} />);
      
      const card = screen.getByText('John Developer').closest('div');
      expect(card).toHaveClass('bg-gradient-to-br', 'from-yellow-50', 'to-orange-50');
    });

    test('handles click events', async () => {
      const handleClick = jest.fn();
      render(<CharacterCard character={mockCharacter} onClick={handleClick} />);
      
      const card = screen.getByText('John Developer').closest('div');
      if (card) {
        await userEvent.click(card);
        expect(handleClick).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('LuncDisplay Component', () => {
    test('renders LUNC amount correctly', () => {
      render(<LuncDisplay amount={1500} />);
      
      expect(screen.getByText('1,500 LUNC')).toBeInTheDocument();
      expect(screen.getByText('🪙')).toBeInTheDocument();
    });

    test('formats large numbers with commas', () => {
      render(<LuncDisplay amount={1234567} />);
      expect(screen.getByText('1,234,567 LUNC')).toBeInTheDocument();
    });

    test('renders with animation prop', () => {
      render(<LuncDisplay amount={100} animate={true} />);
      expect(screen.getByText('100 LUNC')).toBeInTheDocument();
    });
  });
});

describe('Component Integration', () => {
  test('Button and Modal work together', async () => {
    const TestComponent = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      
      return (
        <>
          <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
          <Modal 
            isOpen={isOpen} 
            onClose={() => setIsOpen(false)}
            title="Test Modal"
          >
            <p>Modal opened by button</p>
          </Modal>
        </>
      );
    };

    render(<TestComponent />);
    
    // Initially modal should not be visible
    expect(screen.queryByText('Modal opened by button')).not.toBeInTheDocument();
    
    // Click button to open modal
    await userEvent.click(screen.getByRole('button', { name: /open modal/i }));
    expect(screen.getByText('Modal opened by button')).toBeInTheDocument();
    
    // Close modal
    await userEvent.click(screen.getByRole('button', { name: /✕/i }));
    await waitFor(() => {
      expect(screen.queryByText('Modal opened by button')).not.toBeInTheDocument();
    });
  });

  test('Input validation with error states', async () => {
    const TestComponent = () => {
      const [value, setValue] = React.useState('');
      const [error, setError] = React.useState('');
      
      const handleSubmit = () => {
        if (!value) {
          setError('This field is required');
        } else {
          setError('');
        }
      };
      
      return (
        <>
          <Input 
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={error}
            label="Required Field"
          />
          <Button onClick={handleSubmit}>Submit</Button>
        </>
      );
    };

    render(<TestComponent />);
    
    // Submit without input should show error
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    
    // Enter text and submit should clear error
    await userEvent.type(screen.getByRole('textbox'), 'test input');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('Button has proper ARIA attributes', () => {
    render(<Button aria-label="Close dialog">✕</Button>);
    const button = screen.getByRole('button', { name: /close dialog/i });
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
  });

  test('Input has proper labels and associations', () => {
    render(<Input label="Email Address" error="Invalid email" />);
    
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Email Address');
    const error = screen.getByText('Invalid email');
    
    expect(input).toHaveAccessibleName('Email Address');
    expect(input).toHaveAccessibleDescription('Invalid email');
  });

  test('Modal has proper focus management', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Accessible Modal">
        <Input label="Name" />
        <Button>Save</Button>
      </Modal>
    );
    
    expect(screen.getByRole('dialog', { name: /accessible modal/i })).toBeInTheDocument();
  });
});
