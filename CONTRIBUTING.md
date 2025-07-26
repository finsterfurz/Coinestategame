# 🤝 Contributing to Virtual Building Empire

Thank you for your interest in contributing to Virtual Building Empire! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Smart Contracts](#smart-contracts)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

---

## 🤗 Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you agree to:

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on what's best** for the community
- **Show empathy** towards other community members

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required versions
node >= 18.0.0
npm >= 9.0.0
git >= 2.0.0
```

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/Coinestategame.git
   cd Coinestategame
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/finsterfurz/Coinestategame.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start development server**
   ```bash
   npm start
   ```

---

## 🔄 Development Workflow

### Branch Strategy

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/description`** - New features
- **`bugfix/description`** - Bug fixes
- **`hotfix/description`** - Critical production fixes

### Working on Features

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes**
   - Write code following our [coding standards](#coding-standards)
   - Add tests for new functionality
   - Update documentation as needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   # Create PR on GitHub
   ```

---

## 📝 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Good - Proper typing
interface Character {
  id: number;
  name: string;
  type: CharacterRarity;
}

// ❌ Bad - Using any
const character: any = {
  id: 1,
  name: "Hero"
};

// ✅ Good - Explicit return type
const calculateEarnings = (level: number): number => {
  return level * 10;
};
```

### React Best Practices

```typescript
// ✅ Good - Functional component with proper typing
interface Props {
  character: Character;
  onUpdate: (character: Character) => void;
}

const CharacterCard: React.FC<Props> = ({ character, onUpdate }) => {
  // Component logic
};

// ✅ Good - Custom hooks
const useCharacterData = (id: number) => {
  const [character, setCharacter] = useState<Character | null>(null);
  // Hook logic
  return { character, loading, error };
};
```

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── layout/         # Layout components
│   └── __tests__/      # Component tests
├── hooks/              # Custom hooks
├── stores/             # Zustand stores
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── services/           # API services
```

### Naming Conventions

- **Components**: PascalCase (`CharacterCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useCharacterData.ts`)
- **Utilities**: camelCase (`gameHelpers.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_FAMILY_SIZE`)
- **Types**: PascalCase (`Character`, `GameState`)

---

## 🧪 Testing

### Running Tests

```bash
# Unit tests
npm test

# With coverage
npm run test:coverage

# Smart contract tests
npm run test:contracts

# E2E tests
npm run test:e2e
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import CharacterCard from '../CharacterCard';

describe('CharacterCard', () => {
  test('displays character information', () => {
    const mockCharacter = {
      id: 1,
      name: 'Test Hero',
      type: 'rare' as const
    };
    
    render(<CharacterCard character={mockCharacter} />);
    
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });
});
```

### Test Coverage Requirements

- **Minimum coverage**: 85%
- **Critical paths**: 100% coverage required
- **New features**: Must include tests
- **Bug fixes**: Must include regression tests

---

## ⛓️ Smart Contracts

### Development Setup

```bash
# Compile contracts
npm run compile

# Start local node
npm run node

# Deploy to local network
npm run deploy:local

# Run contract tests
npm run test:contracts
```

### Security Guidelines

- **Use OpenZeppelin** contracts when possible
- **Add reentrancy protection** for financial functions
- **Implement access control** for admin functions
- **Add input validation** for all parameters
- **Write comprehensive tests** for all scenarios

### Gas Optimization

- Use `calldata` instead of `memory` for external functions
- Pack structs efficiently
- Use events for data that doesn't need to be on-chain
- Implement batch operations where possible

---

## 📤 Submitting Changes

### Pull Request Process

1. **Ensure your branch is up to date**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run the full test suite**
   ```bash
   npm run test:all
   npm run lint
   npm run type-check
   ```

3. **Create a detailed PR**
   - Use our [PR template](.github/PULL_REQUEST_TEMPLATE.md)
   - Include screenshots for UI changes
   - Reference related issues
   - Describe testing performed

4. **Respond to feedback**
   - Address reviewer comments promptly
   - Make requested changes
   - Re-request review when ready

### Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

feat(characters): add legendary character minting
fix(marketplace): resolve price calculation bug
docs(readme): update installation instructions
test(hooks): add tests for useGameData hook
refactor(store): simplify character state management
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

---

## 🎯 Contribution Areas

### 🎮 Game Features
- Character system enhancements
- Building mechanics
- Reward system improvements
- New game modes

### 🎨 UI/UX
- Component improvements
- Mobile responsiveness
- Accessibility enhancements
- Animation and interactions

### ⛓️ Web3 Integration
- Smart contract optimizations
- Multi-chain support
- Wallet integrations
- Gas optimization

### 🧪 Testing & Quality
- Test coverage improvements
- Performance optimizations
- Security audits
- Documentation

### 📚 Documentation
- Code documentation
- User guides
- API documentation
- Video tutorials

---

## 💬 Community

### Getting Help

- **GitHub Discussions**: General questions and ideas
- **GitHub Issues**: Bug reports and feature requests
- **Discord**: Real-time community chat
- **Documentation**: Comprehensive guides

### Reporting Issues

1. **Search existing issues** first
2. **Use issue templates** for consistency
3. **Provide detailed information**
4. **Include reproduction steps**
5. **Add relevant labels**

### Code Review Process

- **All changes** require review
- **Two approvals** for significant changes
- **Automated checks** must pass
- **Constructive feedback** is encouraged
- **Learn from reviews** and iterate

---

## 🏆 Recognition

We recognize contributors in several ways:

- **Contributor list** in README
- **Release notes** mention significant contributions
- **Discord role** for active contributors
- **NFT rewards** for major contributions

---

## 📄 License

By contributing to Virtual Building Empire, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

## 🙏 Thank You!

Your contributions make Virtual Building Empire better for everyone. Whether you're fixing bugs, adding features, improving documentation, or helping others in the community, your efforts are appreciated!

**Happy coding! 🚀**