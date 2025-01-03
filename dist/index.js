import { ref, toRef } from 'vue';
const useWebSocket = (url, options = {}) => {
    const { onOpen, onClose, onError, onFail, onMessage, serviceName = 'WebSocket', } = options;
    const autoReconnect = options?.autoReconnect ?? false;
    const pingpong = options?.pingpong ?? false;
    const webSocket = ref(null);
    const status = ref('CLOSED');
    const webSocketUrl = toRef(url);
    // reconnect
    const DEFAULT_RECONNECT_INTERVAL = 2000;
    const DEFAULT_MAX_RECONNECT_ATTEMPTS = 10;
    let reconnectTimeInterval = 500;
    let reconnectAttempts = 0;
    const resetReconnect = () => {
        if (!autoReconnect)
            return;
        const { interval = DEFAULT_RECONNECT_INTERVAL } = autoReconnect === true ? {} : autoReconnect;
        reconnectAttempts = 0;
        reconnectTimeInterval = Math.random() * interval;
    };
    const tryReconnect = () => {
        if (!autoReconnect)
            return;
        const { maxAttemps = DEFAULT_MAX_RECONNECT_ATTEMPTS } = autoReconnect === true ? {} : autoReconnect;
        if (reconnectAttempts < maxAttemps) {
            setTimeout(initWebSocket, reconnectTimeInterval);
            reconnectAttempts++;
            reconnectTimeInterval *= 2; // 매 재요청 시마다 2배씩 증가(Exponential Backoff)
        }
        else {
            onFail?.();
        }
    };
    // ping
    const DEFAULT_PING_INTERVAL = 50000;
    let pingTimeout = null;
    const resumePing = () => {
        if (!pingpong)
            return;
        const interval = pingpong === true ? DEFAULT_PING_INTERVAL : pingpong;
        pingTimeout = window.setTimeout(() => {
            webSocket.value?.send('ping');
        }, interval);
    };
    const clearPing = () => {
        if (pingTimeout == null)
            return;
        clearTimeout(pingTimeout);
        pingTimeout = null;
    };
    // init websocket
    const initWebSocket = () => {
        webSocket.value = new WebSocket(webSocketUrl.value);
        status.value = 'CONNECTING';
        if (webSocket.value != null) {
            webSocket.value.onopen = () => {
                status.value = 'OPEN';
                resetReconnect();
                onOpen?.(webSocket.value);
                console.log(`[${serviceName}] WS Connected`);
            };
            webSocket.value.onmessage = (e) => {
                if (e.data === 'pong') {
                    clearPing();
                    resumePing();
                    return;
                }
                onMessage?.(webSocket.value, e);
            };
            webSocket.value.onclose = (e) => {
                status.value = 'CLOSED';
                onClose?.(webSocket.value, e);
                if (!e.wasClean) {
                    tryReconnect();
                    return;
                }
                console.log(`[${serviceName}] WS Closed`);
            };
            webSocket.value.onerror = (e) => {
                onError?.(webSocket.value, e);
                console.error(`[${serviceName}] WS error has occurred:`, e);
            };
        }
        resumePing();
    };
    // open websocket
    const open = () => {
        close();
        initWebSocket();
    };
    // close websocket
    const close = (code = 1000, reason) => {
        clearPing();
        resetReconnect();
        webSocket.value?.close(code, reason);
        webSocket.value = null;
    };
    // send
    const send = (data) => {
        if (!webSocket.value || status.value !== 'OPEN') {
            return false;
        }
        webSocket.value.send(data);
        return true;
    };
    return {
        webSocket,
        status,
        open,
        close,
        send,
    };
};
export { useWebSocket };
export * from './types';
