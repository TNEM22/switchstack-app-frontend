import { SERVER_URL } from '@/constants';

type StatusHandler = (status: 'connected' | 'disconnected') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private statusHandlers: StatusHandler[] = [];

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = SERVER_URL.replace('http', 'ws');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private handleOpen(): void {
    console.log('WebSocket connection established');
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    this.notifyStatusHandlers('connected');
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
    this.notifyStatusHandlers('disconnected');
  }

  private notifyStatusHandlers(status: 'connected' | 'disconnected'): void {
    this.statusHandlers.forEach((handler) => handler(status));
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();
