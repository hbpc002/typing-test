import { computed, type ComputedRef, type Ref } from 'vue';
import type { IWebsocketTypingInfo } from '@/types';

export interface ProgressEntry {
  name: string;
  accuracy: string;
  color?: string;
}

/**
 * 将 { [name]: { len, accuracy, color } } 结构转换成
 * { [len]: ProgressEntry[] }，方便在进度条上按位置渲染多人进度。
 */
export function useProgressInfo(progressInfo: Ref<IWebsocketTypingInfo | undefined>) {
  const grouped: ComputedRef<Record<number, ProgressEntry[]>> = computed(() => {
    const out: Record<number, ProgressEntry[]> = {};
    if (!progressInfo.value) return out;
    for (const [name, value] of Object.entries(progressInfo.value)) {
      const entry: ProgressEntry = { name, accuracy: value.accuracy, color: value.color };
      (out[value.len] ||= []).push(entry);
    }
    return out;
  });

  const keys = computed(() => Object.keys(grouped.value).map(Number));

  return { grouped, keys };
}
