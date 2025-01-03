import { type MaybeRefOrGetter } from 'vue';
import { type UseWebSocketOptions, type UseWebSocketReturn } from './types';
declare const useWebSocket: (url: MaybeRefOrGetter<string>, options?: UseWebSocketOptions) => UseWebSocketReturn;
export { useWebSocket };
export * from './types';
