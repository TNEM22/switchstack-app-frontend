import { SERVER_URL } from '@/constants';

type StatusHandler = (status: 'connected' | 'disconnected') => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private statusHandlers: StatusHandler[] = [];
  messageCallback: ((message: string) => void) | null = null;

  connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    const wsUrl = SERVER_URL.replace('http', 'ws');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
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
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket connection closed:', event.code, event.reason);
  }

  private handleMessage(event: MessageEvent): void {
    // const parsedData = JSON.parse(event.data);
    // console.log('WebSocket message received:', parsedData);
    if (this.messageCallback) {
      this.messageCallback(event.data);
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  sendWebSocketMessage(message: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not open. Unable to send message:', message);
    }
  }
}

// export function sendWebSocketMessage(socket: WebSocket, message: string): void {
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(message);
//   } else {
//     console.error('WebSocket is not open. Unable to send message:', message);
//   }
// }

export const websocketService = new WebSocketService();
