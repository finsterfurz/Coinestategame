import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

// Real-time event types
export type RealTimeEventType = 
  | 'character_earnings'
  | 'character_level_up'
  | 'character_minted'
  | 'building_upgrade'
  | 'job_completed'
  | 'marketplace_transaction'
  | 'player_joined'
  | 'player_left'
  | 'game_event'
  | 'system_message';

export interface RealTimeEvent {
  id: string;
  type: RealTimeEventType;
  timestamp: string;
  data: any;
  playerId?: string;
  characterId?: string;
}

export interface RealTimeContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Event handling
  sendEvent: (event: Omit<RealTimeEvent, 'id' | 'timestamp'>) => void;
  
  // Statistics
  eventsReceived: number;
  lastEventTime: Date | null;
  connectionAttempts: number;
  
  // Configuration
  enableSSE: boolean;
  enableWebSocket: boolean;
  setSSE: (enabled: boolean) => void;
  setWebSocket: (enabled: boolean) => void;
}

interface RealTimeProviderProps {
  children: React.ReactNode;
  wsUrl?: string;
  sseUrl?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const RealTimeContext = createContext<RealTimeContextType | null>(null);

export const useRealTime = (): RealTimeContextType => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({
  children,
  wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws',
  sseUrl = process.env.REACT_APP_SSE_URL || '/api/events',
  autoConnect = true,
  reconnectInterval = 5000,
  maxReconnectAttempts = 10,
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [eventsReceived, setEventsReceived] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [enableSSE, setEnableSSE] = useState(true);
  const [enableWebSocket, setEnableWebSocket] = useState(true);

  // Refs for connection management
  const wsRef = useRef<WebSocket | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Interval | null>(null);

  // Game store integration
  const { 
    addNotification, 
    updateCharacter, 
    addCharacter, 
    updateLuncBalance,
    walletAddress 
  } = useGameStore();

  // Event handlers
  const handleRealTimeEvent = useCallback((event: RealTimeEvent) => {
    setEventsReceived(prev => prev + 1);
    setLastEventTime(new Date());

    // Process different event types
    switch (event.type) {
      case 'character_earnings':
        if (event.characterId && event.data.earnings) {
          addNotification({
            type: 'success',
            title: 'Einnahmen erhalten!',
            message: `${event.data.characterName} hat ${event.data.earnings} LUNC verdient!`,
            read: false,
          });
          updateLuncBalance(event.data.earnings);
        }
        break;

      case 'character_level_up':
        if (event.characterId) {
          addNotification({
            type: 'success',
            title: 'Level Up!',
            message: `${event.data.characterName} ist auf Level ${event.data.newLevel} aufgestiegen!`,
            read: false,
          });
          updateCharacter(event.characterId, { 
            level: event.data.newLevel,
            experience: event.data.newExperience 
          });
        }
        break;

      case 'character_minted':
        if (event.data.character) {
          addNotification({
            type: 'success',
            title: 'Neuer Charakter!',
            message: `${event.data.character.name} wurde erfolgreich geminted!`,
            read: false,
          });
          addCharacter(event.data.character);
        }
        break;

      case 'marketplace_transaction':
        addNotification({
          type: 'info',
          title: 'Marktplatz-Aktivität',
          message: event.data.message,
          read: false,
        });
        break;

      case 'player_joined':
        addNotification({
          type: 'info',
          title: 'Spieler beigetreten',
          message: `${event.data.playerName} ist dem Spiel beigetreten!`,
          read: false,
        });
        break;

      case 'game_event':
        addNotification({
          type: 'info',
          title: event.data.title || 'Spiel-Event',
          message: event.data.message,
          read: false,
        });
        break;

      case 'system_message':
        addNotification({
          type: event.data.severity || 'info',
          title: 'System-Nachricht',
          message: event.data.message,
          read: false,
        });
        break;

      default:
        console.log('Unhandled real-time event:', event);
    }
  }, [addNotification, updateCharacter, addCharacter, updateLuncBalance]);

  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    if (!enableWebSocket || wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setIsConnecting(true);
      setConnectionError(null);

      const ws = new WebSocket(`${wsUrl}?playerId=${walletAddress}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionAttempts(0);
        
        // Send authentication/identification
        ws.send(JSON.stringify({
          type: 'auth',
          playerId: walletAddress,
          timestamp: new Date().toISOString(),
        }));

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong') {
            handleRealTimeEvent(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt reconnection if not intentional
        if (event.code !== 1000 && connectionAttempts < maxReconnectAttempts) {
          setConnectionAttempts(prev => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('WebSocket connection failed');
        setIsConnecting(false);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to establish WebSocket connection');
      setIsConnecting(false);
    }
  }, [enableWebSocket, wsUrl, walletAddress, connectionAttempts, maxReconnectAttempts, reconnectInterval, handleRealTimeEvent]);

  // Server-Sent Events connection management
  const connectSSE = useCallback(() => {
    if (!enableSSE || sseRef.current) return;

    try {
      const eventSource = new EventSource(`${sseUrl}?playerId=${walletAddress}`);
      sseRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('SSE connected');
        if (!enableWebSocket) {
          setIsConnected(true);
          setIsConnecting(false);
          setConnectionAttempts(0);
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealTimeEvent(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        if (!enableWebSocket) {
          setConnectionError('Server-Sent Events connection failed');
          setIsConnected(false);
        }
        
        // Close and recreate connection
        eventSource.close();
        sseRef.current = null;
        
        if (connectionAttempts < maxReconnectAttempts) {
          setConnectionAttempts(prev => prev + 1);
          setTimeout(connectSSE, reconnectInterval);
        }
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      if (!enableWebSocket) {
        setConnectionError('Failed to establish SSE connection');
      }
    }
  }, [enableSSE, sseUrl, walletAddress, enableWebSocket, connectionAttempts, maxReconnectAttempts, reconnectInterval, handleRealTimeEvent]);

  // Connection control functions
  const connect = useCallback(() => {
    if (enableWebSocket) {
      connectWebSocket();
    }
    if (enableSSE) {
      connectSSE();
    }
  }, [enableWebSocket, enableSSE, connectWebSocket, connectSSE]);

  const disconnect = useCallback(() => {
    // Clear reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Clear heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }

    // Close SSE
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [disconnect, connect]);

  const sendEvent = useCallback((event: Omit<RealTimeEvent, 'id' | 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullEvent: RealTimeEvent = {
        ...event,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        playerId: walletAddress || undefined,
      };
      
      wsRef.current.send(JSON.stringify(fullEvent));
    } else {
      console.warn('Cannot send event: WebSocket not connected');
    }
  }, [walletAddress]);

  // Auto-connect on mount and wallet connection
  useEffect(() => {
    if (autoConnect && walletAddress) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, walletAddress, connect, disconnect]);

  // Handle configuration changes
  const setSSE = useCallback((enabled: boolean) => {
    setEnableSSE(enabled);
    if (!enabled && sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    } else if (enabled && walletAddress) {
      connectSSE();
    }
  }, [walletAddress, connectSSE]);

  const setWebSocket = useCallback((enabled: boolean) => {
    setEnableWebSocket(enabled);
    if (!enabled && wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    } else if (enabled && walletAddress) {
      connectWebSocket();
    }
  }, [walletAddress, connectWebSocket]);

  // Context value
  const contextValue: RealTimeContextType = {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    reconnect,
    sendEvent,
    eventsReceived,
    lastEventTime,
    connectionAttempts,
    enableSSE,
    enableWebSocket,
    setSSE,
    setWebSocket,
  };

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
    </RealTimeContext.Provider>
  );
};

// Utility hooks for specific real-time features
export const useRealTimeConnection = () => {
  const { isConnected, isConnecting, connectionError, connect, disconnect, reconnect } = useRealTime();
  return { isConnected, isConnecting, connectionError, connect, disconnect, reconnect };
};

export const useRealTimeEvents = () => {
  const { sendEvent, eventsReceived, lastEventTime } = useRealTime();
  return { sendEvent, eventsReceived, lastEventTime };
};

export const useRealTimeStats = () => {
  const { eventsReceived, lastEventTime, connectionAttempts, isConnected } = useRealTime();
  return { eventsReceived, lastEventTime, connectionAttempts, isConnected };
};

// Real-time event sender hook for specific game actions
export const useGameEventSender = () => {
  const { sendEvent } = useRealTime();

  const sendCharacterAction = useCallback((action: string, characterId: string, data?: any) => {
    sendEvent({
      type: 'character_earnings',
      characterId,
      data: { action, ...data },
    });
  }, [sendEvent]);

  const sendMarketplaceAction = useCallback((action: string, data: any) => {
    sendEvent({
      type: 'marketplace_transaction',
      data: { action, ...data },
    });
  }, [sendEvent]);

  const sendGameEvent = useCallback((title: string, message: string, data?: any) => {
    sendEvent({
      type: 'game_event',
      data: { title, message, ...data },
    });
  }, [sendEvent]);

  return { sendCharacterAction, sendMarketplaceAction, sendGameEvent };
};