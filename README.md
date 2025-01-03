# use-websocket-vue3

## Overview

- A Vue3 composable that manages WebSocket connections and handling using the WebSocket API.

## Features

- WebSocket connection creation and management
- Automatic reconnection feature (optional)
  - Automatically attempts to reconnect when the WebSocket connection is unexpectedly terminated
  - Uses Exponential Backoff to adjust reconnection intervals
- Connection status monitoring through Ping Pong (optional)
  - Purpose: To prevent WebSocket disconnection during periods of inactivity & detect sudden network instability
  - Automatically sends a ping every 50 seconds by default (configurable) to verify connection status

## Installation

```bash
npm i use-websocket-vue3
# or
yarn add use-websocket-vue3
```

## Details

### Options

```ts
interface UseWebSocketOptions {
  onOpen?: (ws: WebSocket) => void // Callback on successful connection
  onClose?: (ws: WebSocket, event: CloseEvent) => void // Callback on connection closure
  onError?: (ws: WebSocket, event: Event) => void // Callback on error occurrence
  onFail?: () => void // Callback on reconnection failure
  onMessage?: (ws: WebSocket, event: MessageEvent) => void // Callback on message reception
  serviceName?: string // Service name for logging (default: 'WebSocket')
  autoReconnect?:
    | boolean // Reconnection settings for abnormal WebSocket termination
    | {
        interval?: number
        maxAttemps?: number
      }
  pingpong?: boolean | number // Ping/Pong settings for WebSocket connection monitoring
}
```

### Return Value

```ts
interface UseWebSocketReturn {
  webSocket: Ref<WebSocket | null> // WebSocket instance
  status: Ref<WebSocketStatus> // Current connection status
  open: () => void // Initiate connection
  close: WebSocket['close'] // Terminate connection
  send: (data: string | ArrayBuffer | Blob) => boolean // Send message
}
```

### WebSocket Status Type

```ts
type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSED'
```

## Usage

```ts
const { webSocket, status, open, close, send } = useWebSocket(
  'wss://my-websocket-server.example',
  {
    // Basic usage
    onOpen: (ws) => {
      console.log('Connected!')
    },
    onMessage: (ws, event) => {
      console.log('Message received:', event.data)
    },
    // Error handling
    onError: (ws, event) => {
      console.error('WebSocket error:', event)
    },
    onFail: () => {
      console.error('Reconnection failed')
    },
    // Other options
    serviceName: 'WebSocket',
    autoReconnect: {
      interval: 10000, // ms
      maxAttemps: 50,
    },
    pingpong: 30000, // ms
  }
)

// Start connection
open()

// Send message
send('Hi!')

// Close connection
close()
```

## Additional Information

### Reference

- [VueUse useWebSocket](https://vueuse.org/core/useWebSocket/)
