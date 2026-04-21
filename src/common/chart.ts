import YStorage from '@/common/YStorage';

interface ChartRecord {
  speed?: number[];
  accuracy?: number[];
}

interface ChartStorage {
  typingChartSpeed?: Record<string, number[]>;
  typingChartAccuracy?: Record<string, number[]>;
  [key: string]: unknown;
}

// 处理图表数据，包括存储到本地缓存
export function handleChart(typingChartRecord: ChartRecord | null | undefined, currentTitle: string) {
  const yStorage: ChartStorage = YStorage.get('Y_STORAGE') || {};

  const typingChartSpeed = typingChartRecord?.speed ?? [];
  const typingChartAccuracy = typingChartRecord?.accuracy ?? [];
  const lastTypingChartSpeed = yStorage.typingChartSpeed?.[currentTitle] ?? [];
  const lastTypingChartAccuracy = yStorage.typingChartAccuracy?.[currentTitle] ?? [];

  if (typingChartRecord?.speed) {
    yStorage.typingChartSpeed = { [currentTitle]: typingChartSpeed };
  }
  if (typingChartRecord?.accuracy) {
    yStorage.typingChartAccuracy = { [currentTitle]: typingChartAccuracy };
  }
  if (typingChartRecord?.speed || typingChartRecord?.accuracy) {
    YStorage.set('Y_STORAGE', yStorage);
  }

  return {
    typingChartSpeed,
    lastTypingChartSpeed,
    typingChartAccuracy,
    lastTypingChartAccuracy
  };
}
