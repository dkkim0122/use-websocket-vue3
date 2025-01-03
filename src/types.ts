import { Ref } from "vue"

export type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED'

export interface UseWebSocketOptions {
  onOpen?: (ws: WebSocket) => void
  onClose?: (ws: WebSocket, event: CloseEvent) => void
  onError?: (ws: WebSocket, event: Event) => void
  /**
   * 재연결 실패 시 호출
   */
  onFail?: () => void
  onMessage?: (ws: WebSocket, event: MessageEvent) => void
  serviceName?: string
  /**
   * WebSocket 연결이 비정상적으로 종료되었을 때의 재연결 설정
   * @remarks
   * - `false` 또는 `undefined`: 재연결 시도하지 않음
   * - `true`: 기본 설정으로 재연결 시도
   * - `object`: 커스텀 설정으로 재연결 시도
   * @example
   * ```ts
   * // 기본 설정으로 재연결
   * autoReconnect: true
   *
   * // 커스텀 설정으로 재연결
   * autoReconnect: {
   *   interval: 5000,
   *   maxAttemps: 5
   * }
   * ```
   * @default false
   */
  autoReconnect?:
    | boolean
    | {
        /**
         * 재연결 시도 간격 (단위: ms)
         * @remarks
         * 지수 백오프(Exponential Backoff) 알고리즘에 따라
         * 매 재시도마다 interval이 2배씩 증가
         * @default 2000
         */
        interval?: number
        /**
         * 최대 재연결 시도 횟수
         * @remarks
         * 최대 시도 횟수에 도달하면 `onFail` 콜백 호출
         * @default 10
         */
        maxAttemps?: number
      }
  /**
   * WebSocket 연결 상태 모니터링을 위한 Ping/Pong 설정
   * @remarks
   * - `false` 또는 `undefined`: Ping/Pong을 사용하지 않음
   * - `true`: 기본 간격(50000ms)으로 Ping 전송
   * - `number`: 지정된 간격(ms)으로 Ping 전송
   * @example
   * ```ts
   * // 기본 간격으로 Ping/Pong 사용
   * pingpong: true
   *
   * // 30초 간격으로 Ping/Pong 사용
   * pingpong: 30000
   * ```
   * @default false
   */
  pingpong?: boolean | number
}

export interface UseWebSocketReturn {
  webSocket: Ref<WebSocket | null>
  status: Ref<WebSocketStatus>
  open: () => void
  close: WebSocket['close']
  send: (data: string | ArrayBuffer | Blob) => boolean
}

