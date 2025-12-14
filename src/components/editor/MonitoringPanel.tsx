import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export interface MonitoringData {
  uptime: {
    status: 'online' | 'offline' | 'checking';
    uptimePercentage: number;
    lastCheck: string;
    responseTime: number;
    totalChecks: number;
    successfulChecks: number;
  };
  ssl: {
    status: 'valid' | 'expiring' | 'expired' | 'invalid';
    expiresAt: string;
    daysUntilExpiry: number;
    issuer: string;
  };
  speed: {
    loadTime: number;
    firstContentfulPaint: number;
    timeToInteractive: number;
    lastCheck: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'access' | 'error' | 'deployment' | 'audit';
  level?: 'info' | 'warning' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown>;
  user?: string;
  ip?: string;
  method?: string;
  path?: string;
  statusCode?: number;
}

export interface DeploymentAnalytics {
  deploymentTime: number;
  deploymentSize: number;
  fileCount: number;
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeploymentTime: number;
  averageDeploymentSize: number;
}

interface MonitoringPanelProps {
  projectId: number;
  publishedUrl?: string;
}

export const MonitoringPanel = ({ projectId, publishedUrl }: MonitoringPanelProps) => {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deploymentAnalytics, setDeploymentAnalytics] = useState<DeploymentAnalytics | null>(null);
  const [logFilter, setLogFilter] = useState<'all' | 'access' | 'error' | 'deployment' | 'audit'>('all');
  const [logLevel, setLogLevel] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (publishedUrl) {
      loadMonitoringData();
      loadLogs();
      loadDeploymentAnalytics();
      
      const interval = setInterval(() => {
        loadMonitoringData();
      }, 5 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [projectId, publishedUrl]);

  const loadMonitoringData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/monitoring`);
      if (response.ok) {
        const data = await response.json();
        setMonitoringData(data);
      }
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/logs?type=${logFilter}&level=${logLevel}&search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const loadDeploymentAnalytics = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/deployment-analytics`);
      if (response.ok) {
        const data = await response.json();
        setDeploymentAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load deployment analytics:', error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [logFilter, logLevel, searchQuery]);

  const getUptimeStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'offline':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'checking':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSSLStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'expiring':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'expired':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'invalid':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getLogLevelColor = (level?: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.type !== logFilter) return false;
    if (logLevel !== 'all' && log.level !== logLevel) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4 mt-4">
          {isLoading ? (
            <Card className="p-4">
              <div className="flex items-center justify-center py-8">
                <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
              </div>
            </Card>
          ) : monitoringData ? (
            <>
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Uptime мониторинг</h3>
                    <Badge variant="outline" className={getUptimeStatusColor(monitoringData.uptime.status)}>
                      {monitoringData.uptime.status === 'online' ? 'Онлайн' :
                       monitoringData.uptime.status === 'offline' ? 'Офлайн' :
                       'Проверка...'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Uptime</span>
                      <span className="font-semibold">{monitoringData.uptime.uptimePercentage.toFixed(2)}%</span>
                    </div>
                    <Progress value={monitoringData.uptime.uptimePercentage} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Время отклика</span>
                      <p className="font-semibold">{formatDuration(monitoringData.uptime.responseTime)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Последняя проверка</span>
                      <p className="font-semibold">{new Date(monitoringData.uptime.lastCheck).toLocaleString('ru-RU')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Успешных проверок</span>
                      <p className="font-semibold">{monitoringData.uptime.successfulChecks} / {monitoringData.uptime.totalChecks}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">SSL сертификат</h3>
                    <Badge variant="outline" className={getSSLStatusColor(monitoringData.ssl.status)}>
                      {monitoringData.ssl.status === 'valid' ? 'Действителен' :
                       monitoringData.ssl.status === 'expiring' ? 'Истекает' :
                       monitoringData.ssl.status === 'expired' ? 'Истек' :
                       'Недействителен'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Истекает</span>
                      <p className="font-semibold">{new Date(monitoringData.ssl.expiresAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Дней до истечения</span>
                      <p className="font-semibold">{monitoringData.ssl.daysUntilExpiry}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Издатель</span>
                      <p className="font-semibold">{monitoringData.ssl.issuer}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Скорость загрузки</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Время загрузки</span>
                      <p className="font-semibold">{formatDuration(monitoringData.speed.loadTime)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">First Contentful Paint</span>
                      <p className="font-semibold">{formatDuration(monitoringData.speed.firstContentfulPaint)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time to Interactive</span>
                      <p className="font-semibold">{formatDuration(monitoringData.speed.timeToInteractive)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Последняя проверка</span>
                      <p className="font-semibold">{new Date(monitoringData.speed.lastCheck).toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-4">
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="AlertCircle" size={24} className="mx-auto mb-2" />
                <p>Мониторинг недоступен. Убедитесь, что сайт опубликован.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={logFilter} onValueChange={(value: any) => setLogFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    <SelectItem value="access">Access</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="deployment">Deployment</SelectItem>
                    <SelectItem value="audit">Audit</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={logLevel} onValueChange={(value: any) => setLogLevel(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все уровни</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Поиск в логах..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={loadLogs}>
                  <Icon name="RefreshCw" size={14} className="mr-1" />
                  Обновить
                </Button>
              </div>

              <Separator />

              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 border rounded hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {log.type}
                              </Badge>
                              {log.level && (
                                <Badge variant="outline" className={`text-xs ${getLogLevelColor(log.level)}`}>
                                  {log.level}
                                </Badge>
                              )}
                              {log.statusCode && (
                                <Badge variant="outline" className="text-xs">
                                  {log.statusCode}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(log.timestamp).toLocaleString('ru-RU')}
                              </span>
                            </div>
                            <p className={`text-sm ${getLogLevelColor(log.level)}`}>{log.message}</p>
                            {log.path && (
                              <p className="text-xs text-muted-foreground mt-1 font-mono">
                                {log.method} {log.path}
                              </p>
                            )}
                            {log.user && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Пользователь: {log.user}
                              </p>
                            )}
                            {log.ip && (
                              <p className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Icon name="FileText" size={24} className="mx-auto mb-2" />
                      <p>Логи не найдены</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4 mt-4">
          {deploymentAnalytics ? (
            <>
              <Card className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Статистика деплоев</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded">
                      <span className="text-xs text-muted-foreground">Всего деплоев</span>
                      <p className="text-2xl font-bold">{deploymentAnalytics.totalDeployments}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <span className="text-xs text-muted-foreground">Успешных</span>
                      <p className="text-2xl font-bold text-green-600">{deploymentAnalytics.successfulDeployments}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <span className="text-xs text-muted-foreground">Неудачных</span>
                      <p className="text-2xl font-bold text-red-600">{deploymentAnalytics.failedDeployments}</p>
                    </div>
                    <div className="p-3 bg-muted rounded">
                      <span className="text-xs text-muted-foreground">Успешность</span>
                      <p className="text-2xl font-bold">
                        {deploymentAnalytics.totalDeployments > 0
                          ? ((deploymentAnalytics.successfulDeployments / deploymentAnalytics.totalDeployments) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Производительность деплоев</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Среднее время деплоя</span>
                      <p className="font-semibold text-lg">{formatDuration(deploymentAnalytics.averageDeploymentTime)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Средний размер деплоя</span>
                      <p className="font-semibold text-lg">{formatBytes(deploymentAnalytics.averageDeploymentSize)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Среднее количество файлов</span>
                      <p className="font-semibold text-lg">{deploymentAnalytics.fileCount}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-4">
              <div className="text-center py-8 text-muted-foreground">
                <Icon name="BarChart" size={24} className="mx-auto mb-2" />
                <p>Аналитика недоступна</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

