// Analytics Service for tracking user interactions and game events
import { create } from 'zustand';

// Event tracking types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId: string;
  walletAddress?: string;
  totalCharacters: number;
  totalLuncEarned: number;
  accountAge: number;
  lastLoginDate: string;
  preferredGameMode?: string;
}

export interface GameMetrics {
  sessionDuration: number;
  charactersInteracted: number;
  luncEarned: number;
  pagesVisited: string[];
  actionsPerformed: string[];
  errorsEncountered: number;
}

// Analytics Store
interface AnalyticsStore {
  sessionId: string;
  sessionStartTime: number;
  events: AnalyticsEvent[];
  metrics: GameMetrics;
  isTrackingEnabled: boolean;
  
  // Actions
  setTrackingEnabled: (enabled: boolean) => void;
  track: (event: AnalyticsEvent) => void;
  updateMetrics: (updates: Partial<GameMetrics>) => void;
  startSession: () => void;
  endSession: () => void;
  getSessionDuration: () => number;
}

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  sessionId: '',
  sessionStartTime: Date.now(),
  events: [],
  metrics: {
    sessionDuration: 0,
    charactersInteracted: 0,
    luncEarned: 0,
    pagesVisited: [],
    actionsPerformed: [],
    errorsEncountered: 0,
  },
  isTrackingEnabled: true,

  setTrackingEnabled: (enabled) => set({ isTrackingEnabled: enabled }),

  track: (event) => {
    const state = get();
    if (!state.isTrackingEnabled) return;

    const enrichedEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      sessionId: state.sessionId,
    };

    set({ events: [...state.events, enrichedEvent] });
    
    // Send to analytics providers
    analytics.sendEvent(enrichedEvent);
  },

  updateMetrics: (updates) => {
    set((state) => ({
      metrics: { ...state.metrics, ...updates }
    }));
  },

  startSession: () => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    set({
      sessionId,
      sessionStartTime: Date.now(),
      events: [],
      metrics: {
        sessionDuration: 0,
        charactersInteracted: 0,
        luncEarned: 0,
        pagesVisited: [],
        actionsPerformed: [],
        errorsEncountered: 0,
      },
    });
  },

  endSession: () => {
    const state = get();
    const sessionDuration = Date.now() - state.sessionStartTime;
    
    // Track session end event
    state.track({
      name: 'session_ended',
      properties: {
        duration: sessionDuration,
        metrics: state.metrics,
      },
    });
  },

  getSessionDuration: () => {
    const state = get();
    return Date.now() - state.sessionStartTime;
  },
}));

// Main Analytics Class
class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private isInitialized = false;
  private userId?: string;

  constructor() {
    this.initializeProviders();
  }

  private async initializeProviders() {
    // Initialize Google Analytics 4
    if (process.env.REACT_APP_GA4_MEASUREMENT_ID) {
      this.providers.push(new GoogleAnalyticsProvider(process.env.REACT_APP_GA4_MEASUREMENT_ID));
    }

    // Initialize custom analytics (your own backend)
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      this.providers.push(new CustomAnalyticsProvider(process.env.REACT_APP_ANALYTICS_ENDPOINT));
    }

    // Initialize other providers as needed
    this.isInitialized = true;
  }

  async track(event: AnalyticsEvent) {
    if (!this.isInitialized) {
      await this.initializeProviders();
    }

    // Add user ID if available
    const enrichedEvent = {
      ...event,
      userId: this.userId || event.userId,
    };

    // Send to all providers
    await Promise.all(
      this.providers.map(provider => 
        provider.track(enrichedEvent).catch(error => 
          console.warn(`Analytics provider failed:`, error)
        )
      )
    );
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.providers.forEach(provider => provider.setUserId?.(userId));
  }

  setUserProperties(properties: UserProperties) {
    this.providers.forEach(provider => provider.setUserProperties?.(properties));
  }

  async pageView(page: string, title?: string) {
    await this.track({
      name: 'page_view',
      properties: {
        page,
        title: title || document.title,
        url: window.location.href,
        referrer: document.referrer,
      },
    });
  }

  // Game-specific tracking methods
  async trackCharacterMint(data: {
    characterType: string;
    quantity: number;
    cost: number;
    currency: string;
    success: boolean;
  }) {
    await this.track({
      name: 'character_minted',
      properties: data,
    });
  }

  async trackCharacterAction(data: {
    action: 'assign_job' | 'level_up' | 'trade' | 'sell';
    characterId: string;
    characterType: string;
    additionalData?: any;
  }) {
    await this.track({
      name: 'character_action',
      properties: data,
    });
  }

  async trackLuncTransaction(data: {
    type: 'earned' | 'spent' | 'transferred';
    amount: number;
    source: string;
    characterIds?: string[];
  }) {
    await this.track({
      name: 'lunc_transaction',
      properties: data,
    });
  }

  async trackMarketplaceActivity(data: {
    action: 'list' | 'purchase' | 'cancel' | 'browse';
    characterId?: string;
    price?: number;
    currency?: string;
    filters?: any;
  }) {
    await this.track({
      name: 'marketplace_activity',
      properties: data,
    });
  }

  async trackGameProgress(data: {
    buildingLevel: number;
    totalCharacters: number;
    totalLuncEarned: number;
    daysPlayed: number;
  }) {
    await this.track({
      name: 'game_progress',
      properties: data,
    });
  }

  async trackError(data: {
    error: string;
    context: string;
    severity: 'low' | 'medium' | 'high';
    additionalInfo?: any;
  }) {
    await this.track({
      name: 'error_occurred',
      properties: data,
    });
  }

  async trackPerformance(data: {
    metric: string;
    value: number;
    unit: string;
    context?: string;
  }) {
    await this.track({
      name: 'performance_metric',
      properties: data,
    });
  }
}

// Analytics Provider Interface
interface AnalyticsProvider {
  track(event: AnalyticsEvent): Promise<void>;
  setUserId?(userId: string): void;
  setUserProperties?(properties: UserProperties): void;
}

// Google Analytics 4 Provider
class GoogleAnalyticsProvider implements AnalyticsProvider {
  private measurementId: string;

  constructor(measurementId: string) {
    this.measurementId = measurementId;
    this.initializeGA4();
  }

  private initializeGA4() {
    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as any).dataLayer = (window as any).dataLayer || [];
    function gtag(...args: any[]) {
      (window as any).dataLayer.push(args);
    }
    (window as any).gtag = gtag;

    gtag('js', new Date());
    gtag('config', this.measurementId, {
      send_page_view: false, // We'll send page views manually
    });
  }

  async track(event: AnalyticsEvent): Promise<void> {
    if (!(window as any).gtag) return;

    (window as any).gtag('event', event.name, {
      ...event.properties,
      user_id: event.userId,
      session_id: event.sessionId,
      timestamp: event.timestamp,
    });
  }

  setUserId(userId: string) {
    if (!(window as any).gtag) return;
    (window as any).gtag('config', this.measurementId, {
      user_id: userId,
    });
  }

  setUserProperties(properties: UserProperties) {
    if (!(window as any).gtag) return;
    (window as any).gtag('set', 'user_properties', properties);
  }
}

// Custom Analytics Provider (for your own backend)
class CustomAnalyticsProvider implements AnalyticsProvider {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  async track(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch(`${this.endpoint}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.warn('Custom analytics failed:', error);
    }
  }

  setUserId(userId: string) {
    // Store user ID for future events
  }

  setUserProperties(properties: UserProperties) {
    // Send user properties to backend
    fetch(`${this.endpoint}/users/${properties.userId}/properties`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(properties),
    }).catch(error => console.warn('Failed to update user properties:', error));
  }
}

// React Hook for Analytics
export const useAnalytics = () => {
  const store = useAnalyticsStore();

  const trackEvent = (name: string, properties?: Record<string, any>) => {
    store.track({ name, properties });
  };

  const trackPageView = (page: string, title?: string) => {
    analytics.pageView(page, title);
    
    // Update metrics
    const currentPages = store.metrics.pagesVisited;
    if (!currentPages.includes(page)) {
      store.updateMetrics({
        pagesVisited: [...currentPages, page],
      });
    }
  };

  const trackAction = (action: string, context?: any) => {
    trackEvent('user_action', { action, context });
    
    // Update metrics
    store.updateMetrics({
      actionsPerformed: [...store.metrics.actionsPerformed, action],
    });
  };

  const trackCharacterInteraction = (characterId: string, action: string) => {
    trackEvent('character_interaction', { characterId, action });
    
    // Update metrics
    store.updateMetrics({
      charactersInteracted: store.metrics.charactersInteracted + 1,
    });
  };

  const trackLuncEarned = (amount: number, source: string) => {
    trackEvent('lunc_earned', { amount, source });
    
    // Update metrics
    store.updateMetrics({
      luncEarned: store.metrics.luncEarned + amount,
    });
  };

  const trackError = (error: Error, context: string) => {
    trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
    });
    
    // Update metrics
    store.updateMetrics({
      errorsEncountered: store.metrics.errorsEncountered + 1,
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackAction,
    trackCharacterInteraction,
    trackLuncEarned,
    trackError,
    setUserId: analytics.setUserId.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    isTrackingEnabled: store.isTrackingEnabled,
    setTrackingEnabled: store.setTrackingEnabled,
    metrics: store.metrics,
  };
};

// Performance monitoring
export const trackPerformance = () => {
  // Track Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => analytics.trackPerformance({
        metric: 'CLS',
        value: metric.value,
        unit: 'score',
      }));

      getFID((metric) => analytics.trackPerformance({
        metric: 'FID',
        value: metric.value,
        unit: 'ms',
      }));

      getFCP((metric) => analytics.trackPerformance({
        metric: 'FCP',
        value: metric.value,
        unit: 'ms',
      }));

      getLCP((metric) => analytics.trackPerformance({
        metric: 'LCP',
        value: metric.value,
        unit: 'ms',
      }));

      getTTFB((metric) => analytics.trackPerformance({
        metric: 'TTFB',
        value: metric.value,
        unit: 'ms',
      }));
    });
  }

  // Track custom performance metrics
  if (performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const entry = navEntries[0];
      analytics.trackPerformance({
        metric: 'page_load_time',
        value: entry.loadEventEnd - entry.navigationStart,
        unit: 'ms',
      });
    }
  }
};

// Singleton instance
export const analytics = new AnalyticsService();

// Auto-start session tracking
if (typeof window !== 'undefined') {
  useAnalyticsStore.getState().startSession();
  
  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    useAnalyticsStore.getState().endSession();
  });

  // Track performance when the page loads
  if (document.readyState === 'complete') {
    trackPerformance();
  } else {
    window.addEventListener('load', trackPerformance);
  }
}
