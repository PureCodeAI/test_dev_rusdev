import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';

interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

interface LighthouseMetrics {
  scores: LighthouseScore;
  performance: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
    savings?: number;
  }>;
  diagnostics: Array<{
    id: string;
    title: string;
    description: string;
    score: number;
  }>;
}

interface LighthouseTestProps {
  previewUrl: string;
  onTestComplete?: (metrics: LighthouseMetrics) => void;
}

export const LighthouseTest = ({ previewUrl, onTestComplete }: LighthouseTestProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<LighthouseMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runLighthouseTest = async () => {
    setIsRunning(true);
    setError(null);
    setMetrics(null);

    try {
      const response = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(previewUrl)}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile`);
      
      if (!response.ok) {
        throw new Error('Не удалось выполнить тест Lighthouse');
      }

      const data = await response.json();
      
      const lighthouse = data.lighthouseResult;
      const audits = lighthouse.audits;
      
      const scores: LighthouseScore = {
        performance: Math.round(lighthouse.categories.performance.score * 100),
        accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
        bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
        seo: Math.round(lighthouse.categories.seo.score * 100)
      };

      const performanceMetrics = {
        firstContentfulPaint: Math.round(audits['first-contentful-paint']?.numericValue || 0),
        largestContentfulPaint: Math.round(audits['largest-contentful-paint']?.numericValue || 0),
        totalBlockingTime: Math.round(audits['total-blocking-time']?.numericValue || 0),
        cumulativeLayoutShift: Math.round((audits['cumulative-layout-shift']?.numericValue || 0) * 100) / 100,
        speedIndex: Math.round(audits['speed-index']?.numericValue || 0)
      };

      const opportunities = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'opportunity' && audit.score !== null && audit.score < 1)
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100),
          savings: audit.numericValue ? Math.round(audit.numericValue) : undefined
        }))
        .slice(0, 10);

      const diagnostics = Object.values(audits)
        .filter((audit: any) => audit.details?.type === 'diagnostic' && audit.score !== null && audit.score < 1)
        .map((audit: any) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100)
        }))
        .slice(0, 10);

      const newMetrics: LighthouseMetrics = {
        scores,
        performance: performanceMetrics,
        opportunities,
        diagnostics
      };

      setMetrics(newMetrics);
      if (onTestComplete) {
        onTestComplete(newMetrics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при выполнении теста Lighthouse');
    } finally {
      setIsRunning(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" => {
    if (score >= 90) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Zap" size={20} className="text-primary" />
            Lighthouse тест
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Комплексный анализ производительности, доступности и SEO
          </p>
        </div>
        <Button
          onClick={runLighthouseTest}
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
              Запустить Lighthouse
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
            <h4 className="font-semibold mb-4">Оценки</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: metrics.scores.performance >= 90 ? '#22c55e' : metrics.scores.performance >= 50 ? '#eab308' : '#ef4444' }}>
                  {metrics.scores.performance}
                </div>
                <div className="text-sm text-muted-foreground">Производительность</div>
                <Progress value={metrics.scores.performance} className="h-2 mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: metrics.scores.accessibility >= 90 ? '#22c55e' : metrics.scores.accessibility >= 50 ? '#eab308' : '#ef4444' }}>
                  {metrics.scores.accessibility}
                </div>
                <div className="text-sm text-muted-foreground">Доступность</div>
                <Progress value={metrics.scores.accessibility} className="h-2 mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: metrics.scores.bestPractices >= 90 ? '#22c55e' : metrics.scores.bestPractices >= 50 ? '#eab308' : '#ef4444' }}>
                  {metrics.scores.bestPractices}
                </div>
                <div className="text-sm text-muted-foreground">Лучшие практики</div>
                <Progress value={metrics.scores.bestPractices} className="h-2 mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: metrics.scores.seo >= 90 ? '#22c55e' : metrics.scores.seo >= 50 ? '#eab308' : '#ef4444' }}>
                  {metrics.scores.seo}
                </div>
                <div className="text-sm text-muted-foreground">SEO</div>
                <Progress value={metrics.scores.seo} className="h-2 mt-2" />
              </div>
            </div>
          </Card>

          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Производительность</TabsTrigger>
              <TabsTrigger value="opportunities">Возможности</TabsTrigger>
              <TabsTrigger value="diagnostics">Диагностика</TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-4">
              <Card className="p-4">
                <h5 className="font-semibold mb-4">Метрики производительности</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">First Contentful Paint</span>
                    <Badge variant="outline">{metrics.performance.firstContentfulPaint}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Largest Contentful Paint</span>
                    <Badge variant="outline">{metrics.performance.largestContentfulPaint}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Blocking Time</span>
                    <Badge variant="outline">{metrics.performance.totalBlockingTime}ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cumulative Layout Shift</span>
                    <Badge variant="outline">{metrics.performance.cumulativeLayoutShift}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Speed Index</span>
                    <Badge variant="outline">{metrics.performance.speedIndex}ms</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <Card className="p-4">
                <h5 className="font-semibold mb-4">Возможности для улучшения</h5>
                <div className="space-y-3">
                  {metrics.opportunities.length > 0 ? (
                    metrics.opportunities.map((opp) => (
                      <div key={opp.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{opp.title}</span>
                          <Badge variant={getScoreBadgeVariant(opp.score)}>{opp.score}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{opp.description}</p>
                        {opp.savings && (
                          <div className="text-xs text-green-600">
                            Экономия: ~{opp.savings}ms
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет доступных возможностей для улучшения</p>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="space-y-4">
              <Card className="p-4">
                <h5 className="font-semibold mb-4">Диагностика</h5>
                <div className="space-y-3">
                  {metrics.diagnostics.length > 0 ? (
                    metrics.diagnostics.map((diag) => (
                      <div key={diag.id} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm">{diag.title}</span>
                          <Badge variant={getScoreBadgeVariant(diag.score)}>{diag.score}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{diag.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Нет диагностических проблем</p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

