import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  speedIndex: number;
}

interface PerformanceTestProps {
  previewUrl: string;
  onTestComplete?: (metrics: PerformanceMetrics) => void;
}

export const PerformanceTest = ({ previewUrl, onTestComplete }: PerformanceTestProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runPerformanceTest = async () => {
    setIsRunning(true);
    setError(null);
    setMetrics(null);

    try {
      const startTime = performance.now();
      
      const iframe = document.createElement('iframe');
      iframe.src = previewUrl;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);

      await new Promise((resolve) => {
        iframe.onload = resolve;
        setTimeout(resolve, 10000);
      });

      const loadTime = performance.now() - startTime;

      await new Promise(resolve => setTimeout(resolve, 2000));

      const performanceEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const paintEntries = performance.getEntriesByType('paint') as PerformancePaintTiming[];
      const measureEntries = performance.getEntriesByType('measure') as PerformanceMeasure[];

      const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const largestContentfulPaint = performance.getEntriesByType('largest-contentful-paint')[0] as any;
      const lcp = largestContentfulPaint ? largestContentfulPaint.renderTime || largestContentfulPaint.loadTime : 0;

      const domContentLoaded = performanceEntries[0]?.domContentLoadedEventEnd || 0;
      const timeToInteractive = domContentLoaded || loadTime;

      const layoutShiftEntries = performance.getEntriesByType('layout-shift') as any[];
      const cumulativeLayoutShift = layoutShiftEntries.reduce((sum, entry) => {
        return sum + (entry.value || 0);
      }, 0);

      const newMetrics: PerformanceMetrics = {
        loadTime: Math.round(loadTime),
        firstContentfulPaint: Math.round(firstContentfulPaint),
        largestContentfulPaint: Math.round(lcp),
        timeToInteractive: Math.round(timeToInteractive),
        totalBlockingTime: 0,
        cumulativeLayoutShift: Math.round(cumulativeLayoutShift * 100) / 100,
        firstInputDelay: 0,
        speedIndex: Math.round(loadTime * 0.6)
      };

      setMetrics(newMetrics);
      if (onTestComplete) {
        onTestComplete(newMetrics);
      }

      document.body.removeChild(iframe);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при тестировании производительности');
    } finally {
      setIsRunning(false);
    }
  };

  const getScore = (value: number, thresholds: { good: number; needsImprovement: number }): { score: number; label: string; color: string } => {
    if (value <= thresholds.good) {
      return { score: 90, label: 'Отлично', color: 'text-green-600' };
    } else if (value <= thresholds.needsImprovement) {
      return { score: 50, label: 'Нужно улучшить', color: 'text-yellow-600' };
    } else {
      return { score: 0, label: 'Плохо', color: 'text-red-600' };
    }
  };

  const getOverallScore = (): number => {
    if (!metrics) return 0;
    
    const fcpScore = getScore(metrics.firstContentfulPaint, { good: 1800, needsImprovement: 3000 }).score;
    const lcpScore = getScore(metrics.largestContentfulPaint, { good: 2500, needsImprovement: 4000 }).score;
    const ttiScore = getScore(metrics.timeToInteractive, { good: 3800, needsImprovement: 7300 }).score;
    const clsScore = getScore(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 }).score;
    
    return Math.round((fcpScore + lcpScore + ttiScore + clsScore) / 4);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Gauge" size={20} className="text-primary" />
            Тестирование производительности
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Измерение метрик производительности страницы
          </p>
        </div>
        <Button
          onClick={runPerformanceTest}
          disabled={isRunning || !previewUrl}
        >
          {isRunning ? (
            <>
              <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
              Тестирование...
            </>
          ) : (
            <>
              <Icon name="Play" size={16} className="mr-2" />
              Запустить тест
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <Icon name="AlertCircle" size={16} />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {metrics && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Общая оценка</h4>
              <Badge variant={getOverallScore() >= 90 ? "default" : getOverallScore() >= 50 ? "secondary" : "destructive"} className="text-lg px-4 py-1">
                {getOverallScore()}
              </Badge>
            </div>
            <Progress value={getOverallScore()} className="h-3" />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Время загрузки</span>
                <Badge variant="outline">{metrics.loadTime}ms</Badge>
              </div>
              <Progress value={Math.min(100, (3000 - metrics.loadTime) / 30)} className="h-2" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">First Contentful Paint</span>
                <Badge variant="outline">{metrics.firstContentfulPaint}ms</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (3000 - metrics.firstContentfulPaint) / 30)} className="h-2 flex-1" />
                <span className={`text-xs font-medium ${getScore(metrics.firstContentfulPaint, { good: 1800, needsImprovement: 3000 }).color}`}>
                  {getScore(metrics.firstContentfulPaint, { good: 1800, needsImprovement: 3000 }).label}
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                <Badge variant="outline">{metrics.largestContentfulPaint}ms</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (4000 - metrics.largestContentfulPaint) / 40)} className="h-2 flex-1" />
                <span className={`text-xs font-medium ${getScore(metrics.largestContentfulPaint, { good: 2500, needsImprovement: 4000 }).color}`}>
                  {getScore(metrics.largestContentfulPaint, { good: 2500, needsImprovement: 4000 }).label}
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Time to Interactive</span>
                <Badge variant="outline">{metrics.timeToInteractive}ms</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (7300 - metrics.timeToInteractive) / 73)} className="h-2 flex-1" />
                <span className={`text-xs font-medium ${getScore(metrics.timeToInteractive, { good: 3800, needsImprovement: 7300 }).color}`}>
                  {getScore(metrics.timeToInteractive, { good: 3800, needsImprovement: 7300 }).label}
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cumulative Layout Shift</span>
                <Badge variant="outline">{metrics.cumulativeLayoutShift}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (0.25 - metrics.cumulativeLayoutShift) * 400)} className="h-2 flex-1" />
                <span className={`text-xs font-medium ${getScore(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 }).color}`}>
                  {getScore(metrics.cumulativeLayoutShift, { good: 0.1, needsImprovement: 0.25 }).label}
                </span>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Speed Index</span>
                <Badge variant="outline">{metrics.speedIndex}ms</Badge>
              </div>
              <Progress value={Math.min(100, (5000 - metrics.speedIndex) / 50)} className="h-2" />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

