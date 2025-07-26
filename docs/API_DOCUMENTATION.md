# 🔌 Virtual Building Empire - API Documentation

## 📋 Overview

This document provides comprehensive API documentation for the Virtual Building Empire backend services and smart contract interactions.

## 🌐 Base URLs

- **Production**: `https://api.virtualbuilding.game`
- **Staging**: `https://staging-api.virtualbuilding.game`
- **Development**: `http://localhost:3001`

## 🔐 Authentication

### Web3 Authentication
The API uses Web3 signature-based authentication:

```javascript
// Generate signature for authentication
const message = `Login to Virtual Building Empire\nNonce: ${nonce}\nTimestamp: ${timestamp}`;
const signature = await web3.eth.personal.sign(message, account);

// Include in request headers
headers: {
  'Authorization': `Bearer ${signature}`,
  'X-Wallet-Address': account,
  'X-Message': message
}
```

### API Key Authentication (Optional)
```javascript
headers: {
  'X-API-Key': 'your-api-key'
}
```

## 📊 Response Format

All API responses follow this standard format:

```javascript
{
  "success": true|false,
  "data": { ... }, // Response data
  "message": "Success message", // Optional
  "error": "Error message", // Only if success: false
  "timestamp": "2025-01-26T12:00:00Z",
  "version": "2.0.0"
}
```

## 🎮 Game API Endpoints

### 👥 Characters

#### Get User Characters
```http
GET /api/characters
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "characters": [
      {
        "id": 1,
        "tokenId": "1",
        "name": "Max Manager",
        "type": "rare",
        "level": 12,
        "experience": 2450,
        "dailyEarnings": 85000000, // 85 LUNC (6 decimals)
        "happiness": 92,
        "isWorking": true,
        "department": "Management",
        "mintedAt": "2025-01-26T10:00:00Z",
        "lastUpdated": "2025-01-26T12:00:00Z"
      }
    ],
    "totalCharacters": 4,
    "totalDailyEarnings": 335000000
  }
}
```

#### Get Character Details
```http
GET /api/characters/{tokenId}
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "character": {
      "id": 1,
      "tokenId": "1",
      "name": "Max Manager",
      "type": "rare",
      "level": 12,
      "experience": 2450,
      "experienceToNext": 1300,
      "dailyEarnings": 85000000,
      "happiness": 92,
      "isWorking": true,
      "department": "Management",
      "workingHours": 168, // hours worked
      "totalEarnings": 14280000000, // lifetime earnings
      "mintedAt": "2025-01-26T10:00:00Z",
      "metadata": {
        "image": "https://api.virtualbuilding.game/images/1.png",
        "attributes": [
          {"trait_type": "Type", "value": "Rare"},
          {"trait_type": "Level", "value": 12},
          {"trait_type": "Department", "value": "Management"}
        ]
      }
    }
  }
}
```

#### Update Character Status
```http
PUT /api/characters/{tokenId}/status
```

**Request Body:**
```javascript
{
  "isWorking": true,
  "department": "IT",
  "happiness": 95
}
```

### 🏢 Building Management

#### Get Building Status
```http
GET /api/building
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "building": {
      "totalFloors": 25,
      "occupiedFloors": 18,
      "totalEmployees": 847,
      "workingEmployees": 623,
      "efficiency": 78.5,
      "dailyLuncPool": 25000000000,
      "departments": [
        {
          "name": "Management",
          "floor": 25,
          "employees": 45,
          "maxCapacity": 50,
          "efficiency": 90
        },
        {
          "name": "IT",
          "floors": [23, 24],
          "employees": 128,
          "maxCapacity": 150,
          "efficiency": 85
        }
      ]
    }
  }
}
```

#### Assign Character to Department
```http
POST /api/building/assign
```

**Request Body:**
```javascript
{
  "characterId": "1",
  "department": "IT",
  "floor": 23
}
```

### 💎 LUNC Wallet

#### Get Wallet Balance
```http
GET /api/wallet/balance
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "balance": {
      "total": 1250000000, // 1,250 LUNC
      "available": 1000000000,
      "locked": 250000000, // In marketplace/staking
      "pending": 0
    },
    "dailyEarnings": 335000000,
    "weeklyEarnings": 2345000000,
    "totalEarned": 45670000000
  }
}
```

#### Collect Daily Rewards
```http
POST /api/wallet/collect
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "collected": 335000000,
    "newBalance": 1585000000,
    "nextCollection": "2025-01-27T12:00:00Z"
  }
}
```

### 🛒 Marketplace

#### Get Marketplace Listings
```http
GET /api/marketplace/listings
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `type`: Character type filter (common|rare|legendary)
- `minPrice`: Minimum price in LUNC
- `maxPrice`: Maximum price in LUNC
- `sortBy`: Sort by (price|level|mintedAt)
- `sortOrder`: Sort order (asc|desc)

**Response:**
```javascript
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "listing-123",
        "tokenId": "456",
        "character": {
          "name": "Elite Worker",
          "type": "legendary",
          "level": 25,
          "dailyEarnings": 150000000
        },
        "price": 5000000000, // 5,000 LUNC
        "seller": "0x1234...",
        "listedAt": "2025-01-26T10:00:00Z",
        "expiresAt": "2025-02-25T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "pages": 8
    },
    "filters": {
      "priceRange": {
        "min": 50000000,
        "max": 10000000000
      },
      "types": ["common", "rare", "legendary"]
    }
  }
}
```

#### Create Marketplace Listing
```http
POST /api/marketplace/listings
```

**Request Body:**
```javascript
{
  "tokenId": "1",
  "price": 1000000000, // 1,000 LUNC
  "duration": 30 // days
}
```

#### Buy Character
```http
POST /api/marketplace/buy
```

**Request Body:**
```javascript
{
  "listingId": "listing-123",
  "txHash": "0xabc123..." // Transaction hash from frontend
}
```

## 📊 Analytics Endpoints

### Game Statistics
```http
GET /api/stats/game
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "totalPlayers": 15420,
    "totalCharacters": 68950,
    "totalLuncCirculating": 892750000000,
    "averageCharactersPerPlayer": 4.47,
    "mostPopularDepartment": "IT",
    "buildingEfficiency": 82.3,
    "marketplaceVolume24h": 125000000000,
    "characterDistribution": {
      "common": 48200,
      "rare": 17300,
      "legendary": 3450
    }
  }
}
```

### User Statistics
```http
GET /api/stats/user
```

**Response:**
```javascript
{
  "success": true,
  "data": {
    "playerRank": 1247,
    "totalEarnings": 45670000000,
    "charactersOwned": 12,
    "buildingEfficiency": 89.2,
    "daysPlayed": 45,
    "achievementsUnlocked": 23,
    "marketplaceTransactions": 8,
    "departmentSpecialization": "Management"
  }
}
```

## 🔗 Smart Contract Integration

### Contract Addresses

**Mainnet (Polygon):**
```javascript
const CONTRACTS = {
  CHARACTER_NFT: "0x...",
  LUNC_TOKEN: "0x...",
  MARKETPLACE: "0x...",
  BUILDING_MANAGER: "0x..."
};
```

**Testnet (Mumbai):**
```javascript
const CONTRACTS_TESTNET = {
  CHARACTER_NFT: "0x...",
  LUNC_TOKEN: "0x...",
  MARKETPLACE: "0x...",
  BUILDING_MANAGER: "0x..."
};
```

### Contract ABIs

ABIs are available at:
- `/api/contracts/character-nft/abi`
- `/api/contracts/lunc-token/abi`
- `/api/contracts/marketplace/abi`
- `/api/contracts/building-manager/abi`

### Example Web3 Integration

```javascript
import { ethers } from 'ethers';
import CharacterNFT_ABI from './abis/CharacterNFT.json';

// Initialize contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const characterContract = new ethers.Contract(
  CONTRACTS.CHARACTER_NFT,
  CharacterNFT_ABI,
  signer
);

// Mint character
const mintCharacter = async (name, type, department) => {
  try {
    const tx = await characterContract.mintCharacter(
      await signer.getAddress(),
      name,
      type,
      department
    );
    
    const receipt = await tx.wait();
    console.log('Character minted:', receipt.transactionHash);
    
    return receipt;
  } catch (error) {
    console.error('Mint failed:', error);
    throw error;
  }
};
```

## 🚨 Error Codes

### HTTP Status Codes
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error
- `503`: Service Unavailable

### Custom Error Codes

```javascript
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_LUNC",
    "message": "Insufficient LUNC balance for this operation",
    "details": {
      "required": 1000000000,
      "available": 500000000
    }
  }
}
```

**Common Error Codes:**
- `WALLET_NOT_CONNECTED`: Web3 wallet not connected
- `INVALID_SIGNATURE`: Invalid Web3 signature
- `CHARACTER_NOT_FOUND`: Character doesn't exist
- `INSUFFICIENT_LUNC`: Not enough LUNC for operation
- `MARKETPLACE_ERROR`: Marketplace transaction failed
- `CONTRACT_ERROR`: Smart contract interaction failed
- `RATE_LIMITED`: Too many requests
- `MAINTENANCE_MODE`: System under maintenance

## 🔄 Rate Limiting

### Limits
- **Public endpoints**: 100 requests/minute
- **Authenticated endpoints**: 1000 requests/minute
- **Contract interactions**: 10 requests/minute
- **Marketplace**: 50 requests/minute

### Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## 📱 WebSocket API

### Connection
```javascript
const ws = new WebSocket('wss://api.virtualbuilding.game/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  token: 'your-jwt-token'
}));
```

### Events

#### Character Minted
```javascript
{
  "type": "character_minted",
  "data": {
    "tokenId": "123",
    "owner": "0x1234...",
    "character": { ... }
  }
}
```

#### LUNC Earned
```javascript
{
  "type": "lunc_earned",
  "data": {
    "amount": 85000000,
    "character": "1",
    "newBalance": 1335000000
  }
}
```

#### Marketplace Activity
```javascript
{
  "type": "marketplace_sale",
  "data": {
    "tokenId": "456",
    "price": 2000000000,
    "buyer": "0x5678...",
    "seller": "0x9abc..."
  }
}
```

## 🧪 Testing

### Test Endpoints
All endpoints are available with `/test` prefix for testing:
- `https://api.virtualbuilding.game/test/characters`
- Uses testnet contracts
- Unlimited rate limits
- Mock data available

### Mock Data
```http
GET /api/test/mock/characters
GET /api/test/mock/marketplace
GET /api/test/mock/building
```

## 📚 SDK & Libraries

### JavaScript SDK
```bash
npm install @virtualbuilding/sdk
```

```javascript
import { VirtualBuildingSDK } from '@virtualbuilding/sdk';

const sdk = new VirtualBuildingSDK({
  apiUrl: 'https://api.virtualbuilding.game',
  network: 'mainnet' // or 'testnet'
});

// Get characters
const characters = await sdk.characters.getAll();

// Mint character
const result = await sdk.characters.mint({
  name: 'New Worker',
  type: 'common',
  department: 'IT'
});
```

### Python SDK
```bash
pip install virtualbuilding-sdk
```

```python
from virtualbuilding import VirtualBuildingSDK

sdk = VirtualBuildingSDK(
    api_url='https://api.virtualbuilding.game',
    network='mainnet'
)

# Get characters
characters = sdk.characters.get_all()

# Get marketplace listings
listings = sdk.marketplace.get_listings(type='rare')
```

## 📞 Support

- **API Issues**: [GitHub Issues](https://github.com/finsterfurz/Coinestategame/issues)
- **Documentation**: [API Docs](https://docs.virtualbuilding.game/api)
- **Discord**: [Developer Channel](https://discord.gg/virtualbuilding-dev)
- **Email**: api-support@virtualbuilding.game

---

**📝 Note**: This API is under active development. Check the [changelog](https://docs.virtualbuilding.game/changelog) for updates.