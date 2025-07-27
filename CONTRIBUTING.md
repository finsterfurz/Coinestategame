# 🤝 Contributing to Virtual Building Empire

Thank you for your interest in contributing to Virtual Building Empire! This guide will help you get started with contributing to our innovative NFT character collection game.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Contribution Workflow](#contribution-workflow)
- [Code Standards](#code-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Smart Contract Development](#smart-contract-development)
- [Review Process](#review-process)
- [Community Guidelines](#community-guidelines)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.0+ and **npm** 9.0+
- **Git** for version control
- **MetaMask** or compatible Web3 wallet
- Basic knowledge of React, TypeScript, and Solidity
- Understanding of Web3 and blockchain concepts

### First-Time Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Coinestategame.git
cd Coinestategame

# Add upstream remote
git remote add upstream https://github.com/finsterfurz/Coinestategame.git

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm start
```

## 🛠️ Development Environment

### Required Tools

- **Code Editor**: VS Code (recommended) with these extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Solidity

### Development Scripts

```bash
# Development
npm start                    # Start development server
npm run type-check          # TypeScript type checking
npm run lint                # ESLint checking
npm run format              # Format code with Prettier

# Testing
npm test                    # Run tests
npm run test:coverage       # Run tests with coverage
npm run test:ci            # Run tests for CI

# Smart Contracts
npm run hardhat:compile    # Compile contracts
npm run hardhat:test       # Test contracts
npm run hardhat:deploy:local # Deploy to local network

# Build
npm run build              # Production build
npm run analyze            # Bundle analysis
```

## 🔄 Contribution Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Adding or updating tests
- `security/description` - Security improvements

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `security`: Security improvements

**Examples:**
```bash
feat(minting): add bulk character minting functionality
fix(wallet): resolve MetaMask connection timeout issue
docs(api): update smart contract interaction guide
test(components): add comprehensive Homepage tests
security(validation): implement input sanitization
```

### Step-by-Step Process

1. **Create an Issue** (for significant changes)
   - Describe the problem or feature request
   - Wait for maintainer feedback before starting work

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Write clean, well-documented code
   - Follow our code standards
   - Add tests for new functionality
   - Update documentation as needed

4. **Test Your Changes**
   ```bash
   npm run lint:fix          # Fix linting issues
   npm run type-check        # Check TypeScript types
   npm test                  # Run all tests
   npm run build             # Ensure build works
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Create a Pull Request on GitHub
   - Fill out the PR template completely
   - Link related issues

## 📝 Code Standards

### TypeScript Guidelines

- **Strict Type Checking**: Use strict TypeScript settings
- **No `any` Types**: Use `unknown` or proper types instead
- **Interface Definitions**: Define interfaces for all props and data structures
- **Type Exports**: Export types that may be used elsewhere

```typescript
// ✅ Good
interface Character {
  id: number;
  name: string;
  type: 'common' | 'rare' | 'legendary';
  dailyEarnings: number;
}

// ❌ Bad
const character: any = {
  id: 1,
  name: "Test"
};
```

### React Component Guidelines

- **Functional Components**: Use functional components with hooks
- **TypeScript Props**: Always type component props
- **Error Boundaries**: Wrap components that might fail
- **Performance**: Use `React.memo()` for expensive components

```typescript
// ✅ Good
interface CharacterCardProps {
  character: Character;
  onSelect: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = React.memo(({ 
  character, 
  onSelect 
}) => {
  return (
    <div className="character-card" onClick={() => onSelect(character)}>
      <h3>{character.name}</h3>
      <p>Daily Earnings: {character.dailyEarnings} LUNC</p>
    </div>
  );
});
```

### CSS Guidelines

- **Modern CSS**: Use CSS Grid, Flexbox, and CSS custom properties
- **Mobile-First**: Design for mobile, then enhance for desktop
- **BEM Methodology**: Use BEM for class naming when appropriate
- **Responsive Design**: Ensure all components work on all screen sizes

```css
/* ✅ Good */
.character-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background: var(--card-background);
  transition: transform 0.2s ease;
}

.character-card:hover {
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .character-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
```

### Smart Contract Guidelines

- **OpenZeppelin**: Use OpenZeppelin contracts when possible
- **Security**: Follow security best practices
- **Gas Optimization**: Optimize for gas efficiency
- **Documentation**: Add comprehensive NatSpec comments

```solidity
// ✅ Good
/**
 * @title CharacterNFT
 * @dev ERC721 token representing game characters
 * @author Virtual Building Empire Team
 */
contract CharacterNFT is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;
    
    /**
     * @dev Mint a new character NFT
     * @param to Address to mint the token to
     * @param rarity Character rarity (0=common, 1=rare, 2=legendary)
     * @return tokenId The ID of the newly minted token
     */
    function mintCharacter(
        address to, 
        uint8 rarity
    ) external onlyOwner nonReentrant returns (uint256) {
        require(rarity <= 2, "Invalid rarity");
        require(to != address(0), "Cannot mint to zero address");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        
        emit CharacterMinted(to, newTokenId, rarity);
        return newTokenId;
    }
}
```

## 🧪 Testing Requirements

### Test Coverage

All contributions must maintain our 85%+ test coverage:

- **Unit Tests**: Test individual functions and utilities
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test component interactions
- **Contract Tests**: Test smart contract functionality

### Writing Tests

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { CharacterCard } from '../CharacterCard';

describe('CharacterCard', () => {
  const mockCharacter = {
    id: 1,
    name: 'Test Character',
    type: 'common' as const,
    dailyEarnings: 50
  };

  test('renders character information correctly', () => {
    const onSelect = jest.fn();
    
    render(
      <CharacterCard character={mockCharacter} onSelect={onSelect} />
    );
    
    expect(screen.getByText('Test Character')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  test('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    
    render(
      <CharacterCard character={mockCharacter} onSelect={onSelect} />
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith(mockCharacter);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test CharacterCard.test.tsx
```

## 🔒 Security Guidelines

### Code Security

- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Use proper escaping for dynamic content
- **Authentication**: Validate wallet connections properly
- **Error Handling**: Don't expose sensitive information in errors

### Smart Contract Security

- **Reentrancy Protection**: Use `nonReentrant` modifier
- **Access Control**: Implement proper role-based access
- **Integer Overflow**: Use SafeMath or Solidity 0.8+
- **External Calls**: Be careful with external contract calls

### Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public issue
2. Email us at: security@virtualbuilding.game
3. Include detailed information about the vulnerability
4. Wait for our response before public disclosure

## 🔗 Smart Contract Development

### Setup Hardhat Environment

```bash
# Compile contracts
npm run hardhat:compile

# Run contract tests
npm run hardhat:test

# Deploy to local network
npm run hardhat:deploy:local

# Deploy to testnet
npm run hardhat:deploy:testnet
```

### Contract Testing

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CharacterNFT", function () {
  let characterNFT;
  let owner;
  let player;

  beforeEach(async function () {
    [owner, player] = await ethers.getSigners();
    
    const CharacterNFT = await ethers.getContractFactory("CharacterNFT");
    characterNFT = await CharacterNFT.deploy();
    await characterNFT.deployed();
  });

  it("Should mint a character with correct rarity", async function () {
    await characterNFT.mintCharacter(player.address, 0);
    
    expect(await characterNFT.balanceOf(player.address)).to.equal(1);
    expect(await characterNFT.ownerOf(1)).to.equal(player.address);
  });
});
```

## 🔍 Review Process

### Before Submitting

- [ ] Code follows our style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No merge conflicts with main branch
- [ ] All CI checks pass

### PR Review Checklist

Reviewers will check:

- [ ] **Functionality**: Does the code work as intended?
- [ ] **Security**: Are there any security concerns?
- [ ] **Performance**: Will this impact performance negatively?
- [ ] **Tests**: Are there adequate tests?
- [ ] **Documentation**: Is documentation updated?
- [ ] **Breaking Changes**: Are breaking changes documented?

### Addressing Feedback

- Respond to all review comments
- Make requested changes promptly
- Ask questions if feedback is unclear
- Re-request review after making changes

## 👥 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help newcomers learn
- Celebrate successes

### Getting Help

- 💬 **Discord**: [Join our community](https://discord.gg/virtualbuilding)
- 📧 **Email**: dev@virtualbuilding.game
- 🐛 **Issues**: GitHub Issues for bugs
- 💡 **Discussions**: GitHub Discussions for questions

### Types of Contributions

We welcome all types of contributions:

- 🐛 **Bug Fixes**: Fix issues and improve stability
- ✨ **Features**: Add new functionality
- 📚 **Documentation**: Improve guides and docs
- 🧪 **Testing**: Add or improve tests
- 🎨 **UI/UX**: Improve user interface and experience
- 🔒 **Security**: Enhance security measures
- ⚡ **Performance**: Optimize performance
- 🌍 **Translations**: Add language support

## 🎯 Development Priorities

### High Priority
- Security improvements
- Performance optimizations
- Bug fixes
- Test coverage improvements

### Medium Priority
- New game features
- UI/UX enhancements
- Documentation improvements
- Developer experience

### Future Goals
- Multi-chain support
- Advanced game mechanics
- Mobile applications
- VR/AR integration

## 📚 Resources

### Learning Resources
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3 Development Guide](https://ethereum.org/en/developers/)

### Tools & Libraries
- [Wagmi Hooks](https://wagmi.sh/)
- [ConnectKit UI](https://docs.family.co/connectkit)
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [Hardhat Framework](https://hardhat.org/getting-started/)

---

## 🙏 Thank You

Your contributions make Virtual Building Empire better for everyone. We appreciate your time and effort in helping us build the future of Web3 gaming!

**Happy coding! 🚀**

---

*For questions about this guide, please open an issue or contact us on Discord.*