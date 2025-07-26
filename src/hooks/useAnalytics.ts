import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  AnalyticsData, GameEvent, EarningsPoint, DistributionPoint, 
  PerformanceMetric, PlayTimeStats, GoalProgress, GameState 
} from '../types';
import { useGameContext } from '../context/GameContext';

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  trackEvent: (event: GameEvent) => void;
  clearData: () => void;
  exportData: () => string;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const { gameState } = useGameContext();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[]>([]);

  // Generate analytics data from game state
  const generateAnalyticsData = useCallback((gameState: GameState): AnalyticsData => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Earnings History
    const earningsHistory: EarningsPoint[] = generateEarningsHistory(gameState, thirtyDaysAgo);

    // Character Distribution
    const characterDistribution: DistributionPoint[] = generateCharacterDistribution(gameState);

    // Performance Metrics
    const performanceMetrics: PerformanceMetric[] = generatePerformanceMetrics(gameState);

    // Play Time Stats
    const playTimeStats: PlayTimeStats = generatePlayTimeStats(gameState, events);

    // Goal Progress
    const goalProgress: GoalProgress[] = generateGoalProgress(gameState);

    return {
      earningsHistory,
      characterDistribution,
      performanceMetrics,
      playTimeStats,
      goalProgress,
    };
  }, [events]);

  // Generate earnings history
  const generateEarningsHistory = (gameState: GameState, startDate: Date): EarningsPoint[] => {
    const history: EarningsPoint[] = [];
    const transactions = gameState.economy.transactions || [];
    
    // Group transactions by date
    const dailyEarnings: Record<string, { jobs: number; quests: number; bonuses: number; trading: number }> = {};
    
    transactions
      .filter(tx => new Date(tx.timestamp) >= startDate)
      .forEach(tx => {
        const dateKey = new Date(tx.timestamp).toLocaleDateString();
        
        if (!dailyEarnings[dateKey]) {
          dailyEarnings[dateKey] = { jobs: 0, quests: 0, bonuses: 0, trading: 0 };
        }
        
        if (tx.amount > 0) {
          if (tx.description.includes('work') || tx.description.includes('job')) {
            dailyEarnings[dateKey].jobs += tx.amount;
          } else if (tx.description.includes('quest')) {
            dailyEarnings[dateKey].quests += tx.amount;
          } else if (tx.description.includes('bonus')) {
            dailyEarnings[dateKey].bonuses += tx.amount;
          } else if (tx.description.includes('trade') || tx.description.includes('sale')) {
            dailyEarnings[dateKey].trading += tx.amount;
          }
        }
      });

    // Convert to array and fill missing days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toLocaleDateString();
      const earnings = dailyEarnings[dateKey] || { jobs: 0, quests: 0, bonuses: 0, trading: 0 };
      
      ['jobs', 'quests', 'bonuses', 'trading'].forEach(source => {
        if (earnings[source as keyof typeof earnings] > 0) {
          history.push({
            date,
            amount: earnings[source as keyof typeof earnings],
            source: source as any,
          });
        }
      });
    }
    
    return history.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Generate character distribution
  const generateCharacterDistribution = (gameState: GameState): DistributionPoint[] => {
    const total = gameState.characters.length;
    if (total === 0) return [];

    const distribution = {
      Common: gameState.characters.filter(c => c.rarity === 'Common').length,
      Rare: gameState.characters.filter(c => c.rarity === 'Rare').length,
      Legendary: gameState.characters.filter(c => c.rarity === 'Legendary').length,
    };

    return Object.entries(distribution).map(([category, value]) => ({
      category,
      value,
      percentage: Math.round((value / total) * 100),
    }));
  };

  // Generate performance metrics
  const generatePerformanceMetrics = (gameState: GameState): PerformanceMetric[] => {
    const workingCharacters = gameState.characters.filter(c => c.isWorking);
    const totalCharacters = gameState.characters.length;
    const avgLevel = totalCharacters > 0 
      ? gameState.characters.reduce((sum, c) => sum + c.level, 0) / totalCharacters 
      : 0;
    
    const dailyEarnings = calculateDailyEarnings(gameState);
    const buildingEfficiency = gameState.building.efficiency;
    const characterUtilization = totalCharacters > 0 ? (workingCharacters.length / totalCharacters) * 100 : 0;

    return [
      {
        name: 'Daily Earnings',
        value: dailyEarnings,
        change: calculateEarningsChange(gameState),
        trend: calculateEarningsChange(gameState) > 0 ? 'up' : 'down',
      },
      {
        name: 'Building Efficiency',
        value: buildingEfficiency,
        change: 2.5, // Simplified
        trend: 'up',
      },
      {
        name: 'Character Utilization',
        value: Math.round(characterUtilization),
        change: 5.2,
        trend: 'up',
      },
      {
        name: 'Average Character Level',
        value: Math.round(avgLevel * 10) / 10,
        change: 1.8,
        trend: 'up',
      },
      {
        name: 'Quest Completion Rate',
        value: calculateQuestCompletionRate(gameState),
        change: -2.1,
        trend: 'down',
      },
      {
        name: 'LUNC Balance',
        value: Math.round(gameState.economy.luncBalance),
        change: 12.3,
        trend: 'up',
      },
    ];
  };

  // Generate play time stats
  const generatePlayTimeStats = (gameState: GameState, events: GameEvent[]): PlayTimeStats => {
    const joinDate = new Date(gameState.user.joinDate);
    const now = new Date();
    const totalDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate session data from events
    const sessionEvents = events.filter(e => e.type === 'session_start' || e.type === 'session_end');
    const sessions = calculateSessions(sessionEvents);
    
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSession = sessions.length > 0 ? totalMinutes / sessions.length : 0;
    const longestSession = sessions.length > 0 ? Math.max(...sessions.map(s => s.duration)) : 0;
    
    // Calculate streak
    const streak = calculatePlayStreak(gameState, events);
    
    return {
      totalMinutes: Math.round(totalMinutes),
      averageSession: Math.round(averageSession),
      longestSession: Math.round(longestSession),
      activeDays: Math.min(totalDays, streak),
      streak,
    };
  };

  // Generate goal progress
  const generateGoalProgress = (gameState: GameState): GoalProgress[] => {
    const goals: GoalProgress[] = [];
    
    // Character collection goal
    goals.push({
      id: 'character_collection',
      name: 'Character Collection Master',
      current: gameState.characters.length,
      target: gameState.settings.limits.maxCharacters,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    // Earnings goal
    goals.push({
      id: 'earnings_milestone',
      name: 'LUNC Millionaire',
      current: gameState.economy.totalEarnings,
      target: 1000000,
    });
    
    // Building efficiency goal
    goals.push({
      id: 'building_efficiency',
      name: 'Efficiency Expert',
      current: gameState.building.efficiency,
      target: 150,
    });
    
    // Quest completion goal
    const completedQuests = gameState.quests.filter(q => q.isCompleted).length;
    goals.push({
      id: 'quest_master',
      name: 'Quest Master',
      current: completedQuests,
      target: 100,
    });
    
    // Department utilization goal
    const totalSlots = gameState.building.departments.reduce((sum, dept) => sum + dept.maxCharacters, 0);
    const usedSlots = gameState.building.departments.reduce((sum, dept) => sum + dept.currentCharacters.length, 0);
    goals.push({
      id: 'department_utilization',
      name: 'Full Capacity',
      current: usedSlots,
      target: totalSlots,
    });
    
    return goals;
  };

  // Helper functions
  const calculateDailyEarnings = (gameState: GameState): number => {
    const workingCharacters = gameState.characters.filter(c => c.isWorking);
    return workingCharacters.reduce((sum, character) => {
      const department = gameState.building.departments.find(d => 
        d.currentCharacters.some(c => c.id === character.id)
      );
      
      if (department) {
        const baseEarning = character.earnings || 50;
        const departmentBonus = department.efficiencyBonus || 1;
        const buildingBonus = gameState.building.efficiency / 100;
        return sum + (baseEarning * departmentBonus * buildingBonus);
      }
      
      return sum;
    }, 0);
  };

  const calculateEarningsChange = (gameState: GameState): number => {
    const recentTransactions = gameState.economy.transactions
      .filter(tx => new Date(tx.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .filter(tx => tx.amount > 0);
      
    const previousTransactions = gameState.economy.transactions
      .filter(tx => {
        const txDate = new Date(tx.timestamp);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        return txDate > twoWeeksAgo && txDate <= weekAgo;
      })
      .filter(tx => tx.amount > 0);
      
    const recentTotal = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const previousTotal = previousTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    if (previousTotal === 0) return recentTotal > 0 ? 100 : 0;
    
    return ((recentTotal - previousTotal) / previousTotal) * 100;
  };

  const calculateQuestCompletionRate = (gameState: GameState): number => {
    const totalQuests = gameState.quests.length;
    const completedQuests = gameState.quests.filter(q => q.isCompleted).length;
    
    return totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  };

  const calculateSessions = (sessionEvents: GameEvent[]): Array<{ start: Date; end: Date; duration: number }> => {
    const sessions: Array<{ start: Date; end: Date; duration: number }> = [];
    let currentSession: { start: Date; end?: Date } | null = null;
    
    sessionEvents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    sessionEvents.forEach(event => {
      if (event.type === 'session_start') {
        currentSession = { start: event.timestamp };
      } else if (event.type === 'session_end' && currentSession) {
        const duration = (event.timestamp.getTime() - currentSession.start.getTime()) / (1000 * 60); // minutes
        sessions.push({
          start: currentSession.start,
          end: event.timestamp,
          duration,
        });
        currentSession = null;
      }
    });
    
    return sessions;
  };

  const calculatePlayStreak = (gameState: GameState, events: GameEvent[]): number => {
    const loginEvents = events.filter(e => e.type === 'session_start');
    const loginDates = [...new Set(loginEvents.map(e => e.timestamp.toDateString()))];
    
    loginDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const loginDate of loginDates) {
      const login = new Date(loginDate);
      const daysDiff = Math.floor((currentDate.getTime() - login.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak || (streak === 0 && daysDiff <= 1)) {
        streak++;
        currentDate = login;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Main data fetching effect
  useEffect(() => {
    if (gameState) {
      setIsLoading(true);
      setError(null);
      
      try {
        const analyticsData = generateAnalyticsData(gameState);
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics generation error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate analytics');
      } finally {
        setIsLoading(false);
      }
    }
  }, [gameState, generateAnalyticsData]);

  // Track event function
  const trackEvent = useCallback((event: GameEvent) => {
    setEvents(prev => [...prev, event].slice(-1000)); // Keep last 1000 events
    
    // Store events in localStorage for persistence
    try {
      const storedEvents = JSON.parse(localStorage.getItem('gameEvents') || '[]');
      const updatedEvents = [...storedEvents, event].slice(-1000);
      localStorage.setItem('gameEvents', JSON.stringify(updatedEvents));
    } catch (error) {
      console.error('Failed to store event:', error);
    }
  }, []);

  // Load events from localStorage on mount
  useEffect(() => {
    try {
      const storedEvents = JSON.parse(localStorage.getItem('gameEvents') || '[]');
      setEvents(storedEvents.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      })));
    } catch (error) {
      console.error('Failed to load stored events:', error);
    }
  }, []);

  // Refetch function
  const refetch = useCallback(async () => {
    if (gameState) {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));
        const analyticsData = generateAnalyticsData(gameState);
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refetch analytics');
      } finally {
        setIsLoading(false);
      }
    }
  }, [gameState, generateAnalyticsData]);

  // Clear data function
  const clearData = useCallback(() => {
    setData(null);
    setEvents([]);
    localStorage.removeItem('gameEvents');
  }, []);

  // Export data function
  const exportData = useCallback((): string => {
    const exportObject = {
      analyticsData: data,
      gameEvents: events,
      gameState: {
        user: gameState?.user,
        characters: gameState?.characters?.length,
        economy: gameState?.economy,
        building: gameState?.building,
      },
      exportDate: new Date(),
    };
    
    return JSON.stringify(exportObject, null, 2);
  }, [data, events, gameState]);

  // Auto-track important game events
  useEffect(() => {
    if (gameState) {
      // Track character additions
      const characterCount = gameState.characters.length;
      const lastCharacterCount = parseInt(localStorage.getItem('lastCharacterCount') || '0');
      
      if (characterCount > lastCharacterCount) {
        trackEvent({
          id: Date.now().toString(),
          type: 'character_added',
          data: { count: characterCount, added: characterCount - lastCharacterCount },
          timestamp: new Date(),
          userId: gameState.user.id,
        });
        localStorage.setItem('lastCharacterCount', characterCount.toString());
      }
      
      // Track level ups
      const userLevel = gameState.user.level;
      const lastUserLevel = parseInt(localStorage.getItem('lastUserLevel') || '1');
      
      if (userLevel > lastUserLevel) {
        trackEvent({
          id: Date.now().toString(),
          type: 'level_up',
          data: { newLevel: userLevel, oldLevel: lastUserLevel },
          timestamp: new Date(),
          userId: gameState.user.id,
        });
        localStorage.setItem('lastUserLevel', userLevel.toString());
      }
    }
  }, [gameState, trackEvent]);

  return {
    data,
    isLoading,
    error,
    refetch,
    trackEvent,
    clearData,
    exportData,
  };
};

export default useAnalytics;
