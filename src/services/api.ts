// API Client Configuration and Base Classes
import { create } from 'zustand';

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// Base API Client Class
class BaseApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(config: {
    baseURL: string;
    timeout?: number;
    retryAttempts?: number;
  }) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.retryAttempts = config.retryAttempts || 3;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError({
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        });
      }

      const data = await response.json();
      return {
        data,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new ApiError({ message: 'Request timeout', code: 'TIMEOUT' });
      }
      
      throw error;
    }
  }

  private async retryRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<ApiResponse<T>> {
    try {
      return await this.makeRequest<T>(endpoint, options);
    } catch (error) {
      if (attempt < this.retryAttempts) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest<T>(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return this.retryRequest<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Game API Client
export class GameApiClient extends BaseApiClient {
  constructor() {
    super({
      baseURL: process.env.REACT_APP_API_URL || 'https://api.virtualbuilding.game',
      timeout: 15000,
      retryAttempts: 3,
    });
  }

  // Character-related endpoints
  async getCharacters(userId: string): Promise<ApiResponse<Character[]>> {
    return this.get(`/users/${userId}/characters`);
  }

  async mintCharacter(data: {
    userId: string;
    packageType: string;
    quantity: number;
    payment: { txHash: string; amount: number };
  }): Promise<ApiResponse<{ characters: Character[]; transaction: any }>> {
    return this.post('/characters/mint', data);
  }

  async updateCharacter(
    characterId: string,
    updates: Partial<Character>
  ): Promise<ApiResponse<Character>> {
    return this.put(`/characters/${characterId}`, updates);
  }

  async assignCharacterToJob(data: {
    characterId: string;
    departmentId: string;
    jobId: string;
  }): Promise<ApiResponse<{ character: Character; assignment: any }>> {
    return this.post('/characters/assign-job', data);
  }

  // Building-related endpoints
  async getBuildingState(buildingId: string): Promise<ApiResponse<BuildingState>> {
    return this.get(`/buildings/${buildingId}`);
  }

  async getAvailableJobs(buildingId: string): Promise<ApiResponse<Job[]>> {
    return this.get(`/buildings/${buildingId}/jobs`);
  }

  async getDepartments(buildingId: string): Promise<ApiResponse<Department[]>> {
    return this.get(`/buildings/${buildingId}/departments`);
  }

  // Marketplace endpoints
  async getMarketplaceListings(params?: {
    page?: number;
    limit?: number;
    rarity?: string;
    priceMin?: number;
    priceMax?: number;
  }): Promise<PaginatedResponse<MarketplaceListing>> {
    return this.get('/marketplace/listings', params);
  }

  async createListing(data: {
    characterId: string;
    price: number;
    currency: 'LUNC' | 'ETH';
  }): Promise<ApiResponse<MarketplaceListing>> {
    return this.post('/marketplace/listings', data);
  }

  async purchaseCharacter(data: {
    listingId: string;
    buyerId: string;
    payment: { txHash: string };
  }): Promise<ApiResponse<{ character: Character; transaction: any }>> {
    return this.post('/marketplace/purchase', data);
  }

  // LUNC and rewards endpoints
  async getLuncBalance(userId: string): Promise<ApiResponse<{ balance: number; transactions: any[] }>> {
    return this.get(`/users/${userId}/lunc`);
  }

  async collectDailyRewards(userId: string): Promise<ApiResponse<{ amount: number; characters: string[] }>> {
    return this.post(`/users/${userId}/collect-rewards`);
  }

  async getRewardHistory(userId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<RewardTransaction>> {
    return this.get(`/users/${userId}/rewards`, params);
  }

  // Analytics endpoints
  async getGameStatistics(): Promise<ApiResponse<GameStatistics>> {
    return this.get('/analytics/game-stats');
  }

  async getUserAnalytics(userId: string): Promise<ApiResponse<UserAnalytics>> {
    return this.get(`/analytics/users/${userId}`);
  }

  // Admin endpoints (if needed)
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    return this.get('/admin/health');
  }
}

// Web3 API Client for blockchain interactions
export class Web3ApiClient {
  private contractAddresses: Record<string, string>;
  private networkId: number;

  constructor() {
    this.contractAddresses = {
      characterNFT: process.env.REACT_APP_CHARACTER_NFT_ADDRESS || '',
      luncToken: process.env.REACT_APP_LUNC_TOKEN_ADDRESS || '',
      marketplace: process.env.REACT_APP_MARKETPLACE_ADDRESS || '',
      buildingManager: process.env.REACT_APP_BUILDING_MANAGER_ADDRESS || '',
    };
    this.networkId = parseInt(process.env.REACT_APP_NETWORK_ID || '1');
  }

  async getContractABI(contractName: string): Promise<any[]> {
    try {
      const response = await fetch(`/contracts/${contractName}.json`);
      const contract = await response.json();
      return contract.abi;
    } catch (error) {
      console.error(`Failed to load ABI for ${contractName}:`, error);
      throw new Error(`Contract ABI not found: ${contractName}`);
    }
  }

  async getGasPrice(): Promise<string> {
    // Implementation for getting current gas price
    // This would typically call a gas station API
    try {
      const response = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
      const data = await response.json();
      return data.result.SafeGasPrice;
    } catch (error) {
      console.warn('Failed to get gas price, using default');
      return '20'; // Default gas price in gwei
    }
  }

  getContractAddress(contractName: string): string {
    const address = this.contractAddresses[contractName];
    if (!address) {
      throw new Error(`Contract address not found: ${contractName}`);
    }
    return address;
  }
}

// API Store for managing API state
interface ApiStore {
  isLoading: boolean;
  error: ApiError | null;
  lastRequest: string | null;
  requestCache: Map<string, { data: any; timestamp: number }>;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: ApiError | null) => void;
  setLastRequest: (request: string) => void;
  getCachedData: (key: string, maxAge?: number) => any;
  setCachedData: (key: string, data: any) => void;
  clearCache: () => void;
}

export const useApiStore = create<ApiStore>((set, get) => ({
  isLoading: false,
  error: null,
  lastRequest: null,
  requestCache: new Map(),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastRequest: (request) => set({ lastRequest: request }),

  getCachedData: (key, maxAge = 300000) => { // 5 minutes default
    const cache = get().requestCache;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < maxAge) {
      return cached.data;
    }
    return null;
  },

  setCachedData: (key, data) => {
    const cache = get().requestCache;
    cache.set(key, { data, timestamp: Date.now() });
    set({ requestCache: cache });
  },

  clearCache: () => set({ requestCache: new Map() }),
}));

// Hook for making API calls with automatic loading and error handling
export const useApiCall = () => {
  const { setLoading, setError, getCachedData, setCachedData } = useApiStore();

  const makeApiCall = async <T>(
    apiCall: () => Promise<ApiResponse<T>>,
    options: {
      cacheKey?: string;
      cacheDuration?: number;
      onSuccess?: (data: T) => void;
      onError?: (error: ApiError) => void;
    } = {}
  ): Promise<T | null> => {
    const { cacheKey, cacheDuration, onSuccess, onError } = options;

    // Check cache first
    if (cacheKey) {
      const cachedData = getCachedData(cacheKey, cacheDuration);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      
      // Cache the result
      if (cacheKey) {
        setCachedData(cacheKey, response.data);
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.message || 'An unexpected error occurred',
        code: error.code,
        status: error.status,
        details: error.details,
      };

      setError(apiError);
      
      if (onError) {
        onError(apiError);
      }

      return null;
    } finally {
      setLoading(false);
    }
  };

  return { makeApiCall };
};

// Singleton instances
export const gameApi = new GameApiClient();
export const web3Api = new Web3ApiClient();

// Error class
class ApiError extends Error {
  public code?: string;
  public status?: number;
  public details?: any;

  constructor(error: { message: string; code?: string; status?: number; details?: any }) {
    super(error.message);
    this.name = 'ApiError';
    this.code = error.code;
    this.status = error.status;
    this.details = error.details;
  }
}

// Type definitions (should be moved to a separate types file)
export interface Character {
  id: string;
  name: string;
  type: 'common' | 'rare' | 'legendary';
  job: string;
  level: number;
  dailyEarnings: number;
  happiness: number;
  working: boolean;
  department: string;
  mintedAt: string;
  ownerId: string;
}

export interface BuildingState {
  id: string;
  totalEmployees: number;
  availableJobs: number;
  buildingEfficiency: number;
  dailyLuncPool: number;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  currentEmployees: number;
  jobs: Job[];
}

export interface Job {
  id: string;
  title: string;
  requirements: {
    minLevel: number;
    preferredType: string[];
  };
  rewards: {
    baseLunc: number;
    bonusMultiplier: number;
  };
  isOccupied: boolean;
  assignedCharacter?: string;
}

export interface MarketplaceListing {
  id: string;
  character: Character;
  price: number;
  currency: 'LUNC' | 'ETH';
  sellerId: string;
  createdAt: string;
  isActive: boolean;
}

export interface RewardTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'daily_work' | 'bonus' | 'marketplace' | 'referral';
  characterIds: string[];
  timestamp: string;
}

export interface GameStatistics {
  totalCharacters: number;
  totalUsers: number;
  totalLuncEarned: number;
  marketplaceVolume: number;
  averageCharacterPrice: number;
}

export interface UserAnalytics {
  totalCharacters: number;
  totalLuncEarned: number;
  averageDailyEarnings: number;
  marketplaceSales: number;
  joinDate: string;
  lastActive: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  services: {
    database: boolean;
    blockchain: boolean;
    redis: boolean;
    api: boolean;
  };
  metrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
  };
}
