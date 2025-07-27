import DOMPurify from 'dompurify';

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input.trim());
};

// Validate Ethereum addresses
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Rate limiting for API calls
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  canMakeRequest(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier) || [];
    if (userRequests.length === 0) return 0;
    
    const oldestRequest = Math.min(...userRequests);
    return oldestRequest + this.windowMs;
  }
}

export const rateLimiter = new RateLimiter();

// Secure local storage wrapper
export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple obfuscation - in production, use proper encryption
    return btoa(encodeURIComponent(data));
  }
  
  private static decrypt(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return '';
    }
  }
  
  static setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(`vbe_${key}`, encrypted);
    } catch (error) {
      console.error('Failed to save to secure storage:', error);
    }
  }
  
  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const encrypted = localStorage.getItem(`vbe_${key}`);
      if (!encrypted) return defaultValue;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('Failed to read from secure storage:', error);
      return defaultValue;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(`vbe_${key}`);
  }

  static clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('vbe_')) {
        localStorage.removeItem(key);
      }
    });
  }
}

// Content Security Policy headers (for server configuration)
export const CSP_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss: data:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Security monitoring
export const logSecurityEvent = (event: string, details: any) => {
  if (process.env.NODE_ENV === 'production') {
    // In production, send to security monitoring service
    console.warn('🔒 Security Event:', event, details);
  }
};

// Input validation schemas
export const ValidationSchemas = {
  characterName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-\_\.]+$/,
    sanitize: true
  },
  
  luncAmount: {
    min: 0,
    max: 1000000,
    type: 'number'
  },
  
  ethereumAddress: {
    pattern: /^0x[a-fA-F0-9]{40}$/,
    required: true
  },
  
  price: {
    min: 0.001,
    max: 100,
    type: 'number',
    decimals: 18
  }
};

// Validation functions
export const validateInput = (
  value: any, 
  schema: keyof typeof ValidationSchemas
): { isValid: boolean; error?: string; sanitized?: any } => {
  const rules = ValidationSchemas[schema];
  
  try {
    let sanitizedValue = value;
    
    // Sanitize if required
    if ('sanitize' in rules && rules.sanitize && typeof value === 'string') {
      sanitizedValue = sanitizeInput(value);
    }
    
    // Check required
    if ('required' in rules && rules.required && !sanitizedValue) {
      return { isValid: false, error: 'This field is required' };
    }
    
    // Check type
    if ('type' in rules) {
      if (rules.type === 'number' && isNaN(Number(sanitizedValue))) {
        return { isValid: false, error: 'Must be a valid number' };
      }
    }
    
    // Check pattern
    if ('pattern' in rules && rules.pattern && typeof sanitizedValue === 'string') {
      if (!rules.pattern.test(sanitizedValue)) {
        return { isValid: false, error: 'Invalid format' };
      }
    }
    
    // Check length
    if ('minLength' in rules && rules.minLength && typeof sanitizedValue === 'string') {
      if (sanitizedValue.length < rules.minLength) {
        return { isValid: false, error: `Minimum length is ${rules.minLength}` };
      }
    }
    
    if ('maxLength' in rules && rules.maxLength && typeof sanitizedValue === 'string') {
      if (sanitizedValue.length > rules.maxLength) {
        return { isValid: false, error: `Maximum length is ${rules.maxLength}` };
      }
    }
    
    // Check numeric ranges
    if ('min' in rules && rules.min !== undefined) {
      const numValue = Number(sanitizedValue);
      if (numValue < rules.min) {
        return { isValid: false, error: `Minimum value is ${rules.min}` };
      }
    }
    
    if ('max' in rules && rules.max !== undefined) {
      const numValue = Number(sanitizedValue);
      if (numValue > rules.max) {
        return { isValid: false, error: `Maximum value is ${rules.max}` };
      }
    }
    
    return { isValid: true, sanitized: sanitizedValue };
    
  } catch (error) {
    return { isValid: false, error: 'Validation error occurred' };
  }
};

// XSS Prevention utilities
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF Token management
export class CSRFProtection {
  private static token: string | null = null;
  
  static generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return this.token;
  }
  
  static getToken(): string | null {
    return this.token;
  }
  
  static validateToken(token: string): boolean {
    return this.token === token;
  }
  
  static clearToken(): void {
    this.token = null;
  }
}

// Security headers validation
export const validateSecurityHeaders = (response: Response): boolean => {
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security'
  ];
  
  return requiredHeaders.every(header => response.headers.has(header));
};

// Secure random string generation
export const generateSecureRandomString = (length: number = 16): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = 'vbe_session';
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  
  static createSession(walletAddress: string): string {
    const sessionId = generateSecureRandomString(32);
    const session = {
      id: sessionId,
      walletAddress,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    SecureStorage.setItem(this.SESSION_KEY, session);
    return sessionId;
  }
  
  static getSession(): any | null {
    const session = SecureStorage.getItem(this.SESSION_KEY, null);
    if (!session) return null;
    
    // Check if session is expired
    if (Date.now() - session.lastActivity > this.SESSION_TIMEOUT) {
      this.clearSession();
      return null;
    }
    
    // Update last activity
    session.lastActivity = Date.now();
    SecureStorage.setItem(this.SESSION_KEY, session);
    
    return session;
  }
  
  static clearSession(): void {
    SecureStorage.removeItem(this.SESSION_KEY);
  }
  
  static isSessionValid(): boolean {
    return this.getSession() !== null;
  }
}