interface WebSocketMessage {
  type: string;
  channel?: string;
  payload?: Record<string, unknown>;
}

interface WebSocketResponse {
  type: string;
  channel?: string;
  data: Record<string, unknown>;
}

export class OneInchWebSocket {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onMessageCallback: ((data: WebSocketResponse) => void) | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  connect(onMessage: (data: WebSocketResponse) => void) {
    this.onMessageCallback = onMessage;
    const wsUrl = `wss://api.1inch.dev/web3/1/full`;
    
    this.ws = new WebSocket(wsUrl);
    
    // Add authentication header
    this.ws.onopen = () => {
      if (this.ws) {
        const authMessage: WebSocketMessage = {
          type: 'auth',
          payload: {
            authorization: `Bearer ${this.apiKey}`
          }
        };
        this.ws.send(JSON.stringify(authMessage));
      }
    };

    this.ws.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(JSON.parse(event.data));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.reconnect();
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.reconnect();
    };
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.onMessageCallback) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        if (this.onMessageCallback) {
          this.connect(this.onMessageCallback);
        }
      }, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.reconnectAttempts = 0;
    this.onMessageCallback = null;
  }

  subscribe(channel: string, params?: Record<string, unknown>) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const subscribeMessage: WebSocketMessage = {
        type: 'subscribe',
        channel,
        payload: params
      };
      this.ws.send(JSON.stringify(subscribeMessage));
    }
  }

  unsubscribe(channel: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }));
    }
  }
}
