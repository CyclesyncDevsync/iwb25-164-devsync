import io, { Socket } from 'socket.io-client';
import { AuctionWebSocketEvents, AuctionRealTimeState, Bid } from '@/types/auction';

class AuctionWebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  // Connect to WebSocket server
  connect(userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080';
        
        this.socket = io(socketUrl, {
          auth: {
            userId,
            token: this.getAuthToken(),
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
        });

        this.socket.on('connect', () => {
          console.log('Connected to auction WebSocket server');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from auction WebSocket server:', reason);
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error) => {
          console.error('WebSocket connection error:', error);
          reject(error);
        });

        this.setupEventHandlers();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  // Join an auction room for real-time updates
  joinAuction(auctionId: string): void {
    if (this.socket) {
      this.socket.emit('auction:join', { auctionId });
    }
  }

  // Leave an auction room
  leaveAuction(auctionId: string): void {
    if (this.socket) {
      this.socket.emit('auction:leave', { auctionId });
    }
  }

  // Place a bid
  placeBid(auctionId: string, amount: number, maxAmount?: number): void {
    if (this.socket) {
      this.socket.emit('auction:place_bid', {
        auctionId,
        amount,
        maxAmount,
      });
    }
  }

  // Watch/unwatch an auction
  watchAuction(auctionId: string): void {
    if (this.socket) {
      this.socket.emit('auction:watch', { auctionId });
    }
  }

  unwatchAuction(auctionId: string): void {
    if (this.socket) {
      this.socket.emit('auction:unwatch', { auctionId });
    }
  }

  // Event listeners
  onAuctionUpdated(callback: (data: AuctionRealTimeState) => void): void {
    this.addEventListener('auction:updated', callback);
  }

  onBidPlaced(callback: (bid: Bid) => void): void {
    this.addEventListener('auction:bid_placed', callback);
  }

  onTimeExtended(callback: (data: { auctionId: string; newEndTime: Date }) => void): void {
    this.addEventListener('auction:time_extended', callback);
  }

  onAuctionEnded(callback: (data: { auctionId: string; winnerId?: string; finalPrice: number }) => void): void {
    this.addEventListener('auction:ended', callback);
  }

  onPriceUpdated(callback: (data: { auctionId: string; newPrice: number; timestamp: Date }) => void): void {
    this.addEventListener('auction:price_updated', callback);
  }

  // Generic event listener management
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, callback as any);
    }
  }

  // Private methods
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Re-attach all existing event listeners
    this.eventListeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket!.on(event, callback as any);
      });
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // Connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create a singleton instance
export const auctionWebSocketService = new AuctionWebSocketService();

// React hook for using WebSocket in components
export const useAuctionWebSocket = () => {
  return auctionWebSocketService;
};
