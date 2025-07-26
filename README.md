# 🏢 Virtual Building Empire - Enhanced

[![CI/CD Pipeline](https://github.com/finsterfurz/Coinestategame/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/finsterfurz/Coinestategame/actions/workflows/ci-cd.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Web3](https://img.shields.io/badge/Web3-F16822?style=flat&logo=web3.js&logoColor=white)](https://web3js.readthedocs.io/)

> 🚀 **Professional Web3 Gaming Platform** - Sammle NFT-Charaktere, baue dein virtuelles Imperium und verdiene echte LUNC-Belohnungen!

## ✨ Was ist neu in v3.0?

### 🎯 **Phase 1 & 2 Enhancements Completed**

#### 📝 **TypeScript Migration**
- ✅ Vollständige TypeScript-Konvertierung
- ✅ Strikte Typisierung für bessere Code-Qualität
- ✅ IntelliSense und bessere Developer Experience
- ✅ Compile-time Error Detection

#### 🏪 **Modern State Management**
- ✅ Zustand Store mit Immer für immutable Updates
- ✅ Persistente State-Speicherung
- ✅ Reactive Selectors für Performance
- ✅ Auto-Save Funktionalität

#### 🧪 **Comprehensive Testing**
- ✅ Jest + Testing Library Setup
- ✅ Component & Hook Tests
- ✅ 85%+ Test Coverage Target
- ✅ Automated CI/CD Pipeline

#### ⛓️ **Smart Contract Framework**
- ✅ Professional NFT Contract (CharacterNFT.sol)
- ✅ LUNC Reward Token (LuncToken.sol)
- ✅ Hardhat Development Environment
- ✅ Multi-Chain Deployment Ready

#### 🌐 **Modern Web3 Integration**
- ✅ Wagmi + RainbowKit for Wallet Connection
- ✅ Viem for Ethereum Interactions
- ✅ Multi-Chain Support (Ethereum, Polygon, BSC)
- ✅ Modern React Query for Data Fetching

---

## 🎮 Game Features

### 🎯 **NFT Character Collection**
- **3 Rarity Tiers**: Common (70%), Rare (25%), Legendary (5%)
- **Dynamic Stats**: Level, Experience, Daily Earnings, Happiness
- **Job System**: Assign characters to specialized roles
- **Family Growth**: Collect up to 50 characters

### 🏢 **25-Floor Virtual Building**
- **Strategic Management**: Optimize floor efficiency
- **Department System**: Management, IT, Sales, Marketing, etc.
- **Building Upgrades**: Increase capacity and earnings
- **Real-time Metrics**: Track performance and productivity

### 💎 **LUNC Rewards System**
- **Daily Earnings**: Based on character performance
- **Family Bonuses**: Up to 25% bonus for larger families
- **Performance Multipliers**: Efficiency-based rewards
- **Auto-Collection**: Optional automated earnings

### 🛒 **NFT Marketplace**
- **Trade Characters**: Buy and sell with the community
- **Price Discovery**: Market-driven character values
- **2.5% Transaction Fee**: Sustainable ecosystem
- **Advanced Filtering**: Find the perfect characters

---

## 🛠 Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Zustand** for State Management
- **TailwindCSS** for Styling
- **Framer Motion** for Animations
- **React Query** for Data Fetching

### **Web3**
- **Wagmi** + **RainbowKit** for Wallet Integration
- **Viem** for Ethereum Interactions
- **Ethers.js** for Contract Interactions

### **Smart Contracts**
- **Solidity 0.8.24**
- **OpenZeppelin** Security Standards
- **Hardhat** Development Framework
- **Upgradeable Contracts** (UUPS Pattern)

### **Testing & Quality**
- **Jest** + **Testing Library**
- **Cypress** for E2E Testing
- **ESLint** + **Prettier**
- **Husky** Pre-commit Hooks

### **DevOps**
- **GitHub Actions** CI/CD
- **Vercel** Deployment
- **Sentry** Error Tracking
- **Web Vitals** Performance Monitoring

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/finsterfurz/Coinestategame.git
cd Coinestategame

# Switch to enhanced branch
git checkout enhancement/typescript-state-management

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm start
```

### Development Commands

```bash
# Development
npm start              # Start dev server
npm run dev           # Alternative dev command

# Testing
npm test              # Run tests
npm run test:coverage # Run with coverage
npm run test:ci       # CI testing
npm run test:contracts # Smart contract tests

# Code Quality
npm run lint          # Lint code
npm run lint:fix      # Fix lint issues
npm run format        # Format code
npm run type-check    # TypeScript check

# Building
npm run build         # Production build
npm run preview       # Preview build
npm run analyze       # Bundle analysis

# Smart Contracts
npm run compile       # Compile contracts
npm run deploy        # Deploy contracts
npm run node          # Local Hardhat node
npm run gas-report    # Gas usage report
```

---

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # UI components
│   ├── layout/          # Layout components
│   └── __tests__/       # Component tests
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
├── types/               # TypeScript definitions
├── utils/               # Utility functions
├── services/            # API services
└── styles/              # Global styles

contracts/               # Smart contracts
├── CharacterNFT.sol     # NFT character contract
├── LuncToken.sol        # LUNC reward token
└── Marketplace.sol      # Trading marketplace

test/                    # Contract tests
cypress/                 # E2E tests
.github/workflows/       # CI/CD pipelines
```

---

## 🔧 Environment Setup

Copy `.env.example` to `.env.local` and configure:

```env
# Web3 Configuration
REACT_APP_ALCHEMY_API_KEY=your_alchemy_key
REACT_APP_WALLETCONNECT_PROJECT_ID=your_project_id

# Contract Addresses (per network)
REACT_APP_CHARACTER_CONTRACT_MAINNET=0x...
REACT_APP_LUNC_TOKEN_MAINNET=0x...

# Feature Flags
REACT_APP_ENABLE_WEB3=true
REACT_APP_ENABLE_MARKETPLACE=true

# Analytics
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test                 # Interactive mode
npm run test:coverage    # With coverage report
npm run test:ci          # CI mode
```

### Smart Contract Tests
```bash
npm run test:contracts   # Run contract tests
npm run coverage:contracts # Contract coverage
npm run gas-report       # Gas usage analysis
```

### E2E Tests
```bash
npx cypress open         # Interactive mode
npx cypress run          # Headless mode
```

---

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run preview          # Test production build
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Smart Contract Deployment
```bash
# Compile contracts
npm run compile

# Deploy to testnet
npx hardhat deploy --network goerli

# Deploy to mainnet
npx hardhat deploy --network mainnet
```

---

## 🎯 Performance

- **Bundle Size**: <800KB (optimized)
- **Lighthouse Score**: 98+ 
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Test Coverage**: 85%+

---

## 🔒 Security

- **Smart Contract Audits**: OpenZeppelin standards
- **Access Control**: Role-based permissions
- **Reentrancy Protection**: All financial functions
- **Input Validation**: Comprehensive sanitization
- **XSS Protection**: React's built-in sanitization

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commit messages
- Ensure all checks pass

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenZeppelin** for security standards
- **React Team** for the amazing framework
- **Ethereum Community** for Web3 infrastructure
- **Contributors** who make this project possible

---

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/finsterfurz/Coinestategame/wiki)
- **Issues**: [GitHub Issues](https://github.com/finsterfurz/Coinestategame/issues)
- **Discussions**: [GitHub Discussions](https://github.com/finsterfurz/Coinestategame/discussions)
- **Discord**: [Community Server](https://discord.gg/virtualbuilding)

---

<div align="center">

**🎮 Ready to build your Virtual Building Empire? 🏢**

[🚀 **Play Now**](https://coinestategame.vercel.app) • [📖 **Documentation**](https://github.com/finsterfurz/Coinestategame/wiki) • [💬 **Community**](https://discord.gg/virtualbuilding)

---

*Made with ❤️ by passionate Web3 developers*

</div>