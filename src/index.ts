import { ref, toRef, type MaybeRefOrGetter } from 'vue'
import { type UseWebSocketOptions, type UseWebSocketReturn, type WebSocketStatus } from './types'

const useWebSocket = (
  url: MaybeRefOrGetter<string>,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn => {
  const {
    onOpen,
    onClose,
    onError,
    onFail,
    onMessage,
    serviceName = 'WebSocket',
  } = options
  const autoReconnect = options?.autoReconnect ?? false
  const pingpong = options?.pingpong ?? false

  const webSocket = ref<WebSocket | null>(null)
  const status = ref<WebSocketStatus>('CLOSED')
  const webSocketUrl = toRef(url)

  // reconnect
  const DEFAULT_RECONNECT_INTERVAL = 2000
  const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10

  let reconnectTimeInterval = 500
  let reconnectAttempts = 0

  const resetReconnect = (): void => {
    if (!autoReconnect) return
    const { interval = DEFAULT_RECONNECT_INTERVAL } =
      autoReconnect === true ? {} : autoReconnect

    reconnectAttempts = 0
    reconnectTimeInterval = Math.random() * interval
  }

  const tryReconnect = (): void => {
    if (!autoReconnect) return

    const { maxAttemps = DEFAULT_MAX_RECONNECT_ATTEMPTS } =
      autoReconnect === true ? {} : autoReconnect

    if (reconnectAttempts < maxAttemps) {
      setTimeout(initWebSocket, reconnectTimeInterval)
      reconnectAttempts++
      reconnectTimeInterval *= 2 // 매 재요청 시마다 2배씩 증가(Exponential Backoff)
    } else {
      onFail?.()
    }
  }

  // ping
  const DEFAULT_PING_INTERVAL = 50000
  let pingTimeout: ReturnType<typeof setTimeout> | null = null

  const resumePing = (): void => {
    if (!pingpong) return
    const interval = pingpong === true ? DEFAULT_PING_INTERVAL : pingpong

    pingTimeout = window.setTimeout(() => {
      webSocket.value?.send('ping')
    }, interval)
  }

  const clearPing = (): void => {
    if (pingTimeout == null) return
    clearTimeout(pingTimeout)
    pingTimeout = null
  }

  // init websocket
  const initWebSocket = (): void => {
    webSocket.value = new WebSocket(webSocketUrl.value)
    status.value = 'CONNECTING'

    if (webSocket.value != null) {
      webSocket.value.onopen = () => {
        status.value = 'OPEN'
        resetReconnect()
        onOpen?.(webSocket.value as WebSocket)
        console.log(`[${serviceName}] WS Connected`)
      }

      webSocket.value.onmessage = (e: MessageEvent) => {
        if (e.data === 'pong') {
          clearPing()
          resumePing()
          return
        }

        onMessage?.(webSocket.value as WebSocket, e)
      }

      webSocket.value.onclose = (e: CloseEvent) => {
        status.value = 'CLOSED'
        onClose?.(webSocket.value as WebSocket, e)

        if (!e.wasClean) {
          tryReconnect()
          return
        }
        console.log(`[${serviceName}] WS Closed`)
      }

      webSocket.value.onerror = (e: Event) => {
        onError?.(webSocket.value as WebSocket, e)
        console.error(`[${serviceName}] WS error has occurred:`, e)
      }
    }

    resumePing()
  }

  // open websocket
  const open = (): void => {
    close()
    initWebSocket()
  }

  // close websocket
  const close: WebSocket['close'] = (code = 1000, reason) => {
    clearPing()
    resetReconnect()
    webSocket.value?.close(code, reason)
    webSocket.value = null
  }

  // send
  const send = (data: string | ArrayBuffer | Blob): boolean => {
    if (!webSocket.value || status.value !== 'OPEN') {
      return false
    }
    webSocket.value.send(data)
    return true
  }

  return {
    webSocket,
    status,
    open,
    close,
    send,
  }
}

export { useWebSocket }
export * from './types'
