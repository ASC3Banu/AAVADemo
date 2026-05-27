import { logger } from '../configs/logger.config';

export class MetricsService {
  private static metrics: Map<string, number> = new Map();
  
  static async initialize(): Promise<void> {
    logger.info('Metrics service initialized');
  }
  
  static increment(metric: string, value: number = 1): void {
    const current = this.metrics.get(metric) || 0;
    this.metrics.set(metric, current + value);
  }
  
  static async flush(): Promise<void> {
    logger.info('Flushing metrics', { metrics: Object.fromEntries(this.metrics) });
    this.metrics.clear();
  }
}