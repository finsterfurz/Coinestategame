# 🚀 Virtual Building Empire - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Node.js 16+ installed
- [ ] npm/yarn package manager
- [ ] Git configured
- [ ] MetaMask or Web3 wallet
- [ ] Blockchain network access (testnet/mainnet)

### ✅ Dependencies Verification
```bash
# Install all dependencies
npm install

# Verify no security vulnerabilities
npm audit --audit-level=moderate

# Run all tests
npm test
npm run test:contracts
```

### ✅ Environment Configuration
1. Copy `.env.example` to `.env.local`
2. Configure all required environment variables
3. Set up API keys (Infura, Alchemy, etc.)
4. Configure smart contract addresses

## 🌐 Frontend Deployment Options

### Option 1: Vercel (Recommended)

#### Quick Deploy
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Manual Setup
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Deploy automatically on main branch push

#### Environment Variables for Vercel
```env
REACT_APP_ENV=production
REACT_APP_API_URL=https://api.virtualbuilding.game
REACT_APP_ENABLE_WEB3=true
REACT_APP_CHARACTER_CONTRACT_ADDRESS=0x...
REACT_APP_LUNC_TOKEN_ADDRESS=0x...
REACT_APP_MARKETPLACE_CONTRACT_ADDRESS=0x...
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build project
npm run build

# Deploy
netlify deploy --prod --dir=build
```

#### Netlify Configuration (`netlify.toml`)
```toml
[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 3: AWS S3 + CloudFront

```bash
# Build project
npm run build

# Install AWS CLI and configure
aws configure

# Sync to S3
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## ⛓️ Smart Contract Deployment

### Testnet Deployment (Recommended First)

#### 1. Configure Hardhat for Testnet
```javascript
// hardhat.config.js
module.exports = {
  networks: {
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mumbai: {
      url: process.env.MUMBAI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
```

#### 2. Deploy to Testnet
```bash
# Deploy to Goerli (Ethereum testnet)
npm run deploy:goerli

# Deploy to Mumbai (Polygon testnet)
npm run deploy:mumbai

# Verify contracts
npm run verify
```

#### 3. Test Contract Functionality
```bash
# Run integration tests
npm run test:integration

# Test minting
npx hardhat run scripts/test-mint.js --network goerli

# Test marketplace
npx hardhat run scripts/test-marketplace.js --network goerli
```

### Mainnet Deployment

#### ⚠️ Security Checklist
- [ ] Smart contracts audited
- [ ] All tests passing
- [ ] Private keys secured
- [ ] Multi-sig wallet configured
- [ ] Emergency pause mechanisms tested
- [ ] Gas price optimization

#### 1. Mainnet Configuration
```bash
# Set production environment variables
export PRIVATE_KEY=0x... # Use hardware wallet or secure key management
export ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
export POLYGON_RPC_URL=https://polygon-rpc.com
```

#### 2. Deploy to Mainnet
```bash
# Deploy to Ethereum Mainnet
npm run deploy:mainnet

# Deploy to Polygon Mainnet
npm run deploy:polygon

# Verify on block explorers
npm run verify:mainnet
```

#### 3. Post-Deployment Setup
```bash
# Set up roles and permissions
npx hardhat run scripts/setup-roles.js --network mainnet

# Configure initial game parameters
npx hardhat run scripts/setup-game.js --network mainnet

# Transfer ownership to multi-sig
npx hardhat run scripts/transfer-ownership.js --network mainnet
```

## 🔧 Production Configuration

### Performance Optimization

#### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npx depcheck

# Optimize images
npm run optimize:images
```

#### 2. Lighthouse Optimization
- Achieve 90+ Performance score
- Implement lazy loading for images
- Optimize Critical Rendering Path
- Enable compression (gzip/brotli)

#### 3. CDN Configuration
```javascript
// Configure static asset CDN
const CDN_URL = 'https://cdn.virtualbuilding.game';

// Update build process to use CDN URLs
process.env.PUBLIC_URL = CDN_URL;
```

### Security Hardening

#### 1. Content Security Policy
```html
<!-- Add to public/index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.virtualbuilding.game https://*.infura.io;
">
```

#### 2. Environment Variables Security
```bash
# Never commit these to version control
PRIVATE_KEY=...
MNEMONIC=...
INFURA_PROJECT_ID=...
ETHERSCAN_API_KEY=...
```

#### 3. Smart Contract Security
- Enable contract verification
- Set up monitoring alerts
- Implement emergency pause
- Configure multi-sig for admin functions

## 📊 Monitoring & Analytics

### Application Monitoring

#### 1. Error Tracking (Sentry)
```javascript
// src/index.js
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.REACT_APP_ENV
});
```

#### 2. Analytics (Google Analytics)
```javascript
// src/utils/analytics.js
import { gtag } from 'ga-gtag';

export const trackEvent = (action, category, label) => {
  gtag('event', action, {
    event_category: category,
    event_label: label
  });
};
```

#### 3. Performance Monitoring
```javascript
// Monitor Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Blockchain Monitoring

#### 1. Contract Events
```javascript
// Monitor contract events
const characterContract = new ethers.Contract(address, abi, provider);

characterContract.on('CharacterMinted', (to, tokenId, characterType) => {
  console.log('Character minted:', { to, tokenId, characterType });
  // Send to analytics
});
```

#### 2. Transaction Monitoring
```javascript
// Monitor transaction status
const monitorTransaction = async (txHash) => {
  const receipt = await provider.waitForTransaction(txHash);
  
  if (receipt.status === 1) {
    console.log('Transaction successful:', txHash);
  } else {
    console.error('Transaction failed:', txHash);
  }
};
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear all caches
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check for dependency conflicts
npm ls
```

#### 2. Web3 Connection Issues
```javascript
// Debug Web3 provider
console.log('Provider:', window.ethereum);
console.log('Network:', await window.ethereum.request({ method: 'eth_chainId' }));
console.log('Accounts:', await window.ethereum.request({ method: 'eth_accounts' }));
```

#### 3. Smart Contract Deployment Failures
```bash
# Check gas prices
npx hardhat run scripts/check-gas.js

# Verify network configuration
npx hardhat console --network goerli

# Check contract size
npx hardhat size-contracts
```

### Emergency Procedures

#### 1. Emergency Pause
```bash
# Pause all contracts
npx hardhat run scripts/emergency-pause.js --network mainnet
```

#### 2. Rollback Deployment
```bash
# Revert to previous version
vercel rollback

# Or redeploy previous commit
git checkout <previous-commit>
npm run deploy
```

#### 3. Smart Contract Upgrade
```bash
# For upgradeable contracts
npx hardhat run scripts/upgrade-contracts.js --network mainnet

# Verify upgrade
npx hardhat verify --network mainnet NEW_IMPLEMENTATION_ADDRESS
```

## ✅ Post-Deployment Checklist

### Immediate Tasks (0-24 hours)
- [ ] Verify all pages load correctly
- [ ] Test wallet connection functionality
- [ ] Verify smart contract interactions
- [ ] Check all external API integrations
- [ ] Monitor error rates and performance
- [ ] Test mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Check SEO meta tags

### Short-term Tasks (1-7 days)
- [ ] Monitor user feedback
- [ ] Analyze performance metrics
- [ ] Check security alerts
- [ ] Verify backup procedures
- [ ] Test disaster recovery
- [ ] Update documentation
- [ ] Monitor gas usage and costs
- [ ] Check marketplace functionality

### Long-term Tasks (1+ weeks)
- [ ] Analyze user behavior
- [ ] Plan feature updates
- [ ] Security audit results
- [ ] Performance optimization
- [ ] Community feedback integration
- [ ] Marketing campaign launch
- [ ] Partnership integrations
- [ ] Mobile app development

## 🔗 Useful Resources

### Documentation
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)
- [Hardhat Documentation](https://hardhat.org/docs/)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web3 Provider Test](https://metamask.github.io/test-dapp/)
- [Gas Tracker](https://etherscan.io/gastracker)
- [Contract Size Calculator](https://evm-tools.com/)

### Support
- GitHub Issues: [Project Issues](https://github.com/finsterfurz/Coinestategame/issues)
- Discord Community: [Join Discord](https://discord.gg/virtualbuilding)
- Documentation: [Project Wiki](https://github.com/finsterfurz/Coinestategame/wiki)

---

**🎉 Congratulations! Your Virtual Building Empire is ready for launch!**

Remember to monitor closely in the first 48 hours and be prepared to quickly address any issues that arise.