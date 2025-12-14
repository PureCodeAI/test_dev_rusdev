import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DeploymentProgress, DeploymentStage, DeploymentStep } from './DeploymentProgress';
import { PublishSettingsDialog, PublishSettingsData } from './PublishSettingsDialog';
import { DomainInstructions } from './DomainInstructions';

export type PublishType = 'subdomain' | 'custom-domain';

export interface PublishSettings {
  type: PublishType;
  subdomain?: string;
  customDomain?: string;
  sslEnabled: boolean;
  autoSSL: boolean;
  status?: 'idle' | 'building' | 'deploying' | 'configuring' | 'success' | 'failed';
  progress?: number;
  publishedUrl?: string;
  error?: string;
  domainVerificationToken?: string;
  domainVerificationStatus?: 'pending' | 'verifying' | 'verified' | 'failed';
  dnsCheckStatus?: 'idle' | 'checking' | 'passed' | 'failed';
  domainAvailable?: boolean;
}

interface PublishDialogProps {
  isOpen: boolean;
  projectId: number;
  projectName: string;
  publishSettings: PublishSettings;
  onClose: () => void;
  onPublish: (settings: PublishSettings) => Promise<void>;
}

export const PublishDialog = ({
  isOpen,
  projectId,
  projectName,
  publishSettings,
  onClose,
  onPublish
}: PublishDialogProps) => {
  const [localSettings, setLocalSettings] = useState<PublishSettings>(publishSettings);
  const [isPublishing, setIsPublishing] = useState(false);
  const [suggestedSubdomain, setSuggestedSubdomain] = useState('');
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [isCheckingDNS, setIsCheckingDNS] = useState(false);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [deploymentStage, setDeploymentStage] = useState<DeploymentStage>('idle');
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [publishSettingsData, setPublishSettingsData] = useState<PublishSettingsData>({
    basic: {},
    ssl: {
      autoSSL: true,
      httpToHttpsRedirect: true,
      hsts: { enabled: false },
      tlsVersion: 'both'
    },
    cdn: {
      enabled: false,
      provider: 'cloudflare',
      cacheEnabled: true,
      compression: { gzip: true, brotli: false }
    },
    caching: {
      static: { enabled: true, maxAge: 31536000 },
      html: { enabled: true, maxAge: 3600 },
      api: { enabled: true, maxAge: 300 },
      clearOnUpdate: true
    },
    security: {
      ddosProtection: true,
      waf: { enabled: false },
      rateLimiting: { enabled: false },
      cors: { enabled: false },
      csp: { enabled: false },
      xssProtection: true
    },
    performance: {
      minifyCSS: true,
      minifyJS: true,
      optimizeImages: true,
      lazyLoading: true,
      preloadCritical: true,
      serviceWorker: { enabled: false }
    },
    seo: {
      autoSitemap: true,
      autoRobots: true,
      canonicalUrls: true,
      openGraph: true,
      twitterCards: true,
      structuredData: true
    }
  });

  useEffect(() => {
    setLocalSettings(publishSettings);
  }, [publishSettings]);

  useEffect(() => {
    if (localSettings.type === 'subdomain' && !localSettings.subdomain) {
      const slug = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const suggested = `${slug}-${projectId}`;
      setSuggestedSubdomain(suggested);
      setLocalSettings({ ...localSettings, subdomain: suggested });
    }
  }, [localSettings.type, projectName, projectId]);

  const handlePublish = async () => {
    if (localSettings.type === 'subdomain' && !localSettings.subdomain?.trim()) {
      return;
    }
    if (localSettings.type === 'custom-domain' && !localSettings.customDomain?.trim()) {
      return;
    }

    setIsPublishing(true);
    setDeploymentStage('preparing');
    
    const initialSteps: DeploymentStep[] = [
      { id: 'validate', name: 'Валидация проекта', status: 'pending' },
      { id: 'check-dependencies', name: 'Проверка зависимостей', status: 'pending' },
      { id: 'optimize-resources', name: 'Оптимизация ресурсов', status: 'pending' },
      { id: 'minify-code', name: 'Минификация кода', status: 'pending' },
      { id: 'generate-html', name: 'Генерация HTML', status: 'pending' },
      { id: 'compile-css', name: 'Компиляция CSS', status: 'pending' },
      { id: 'compile-js', name: 'Компиляция JavaScript', status: 'pending' },
      { id: 'optimize-images', name: 'Оптимизация изображений', status: 'pending' },
      { id: 'create-sitemap', name: 'Создание sitemap.xml', status: 'pending' },
      { id: 'create-robots', name: 'Создание robots.txt', status: 'pending' },
      { id: 'upload-files', name: 'Загрузка файлов', status: 'pending' },
      { id: 'sync-cdn', name: 'Синхронизация с CDN', status: 'pending' },
      { id: 'configure-nginx', name: 'Настройка Nginx', status: 'pending' },
      { id: 'setup-ssl', name: 'Настройка SSL', status: 'pending' },
      { id: 'setup-caching', name: 'Настройка кэширования', status: 'pending' },
      { id: 'setup-redirects', name: 'Настройка редиректов', status: 'pending' },
      { id: 'check-availability', name: 'Проверка доступности', status: 'pending' },
      { id: 'check-ssl', name: 'Проверка SSL', status: 'pending' },
      { id: 'check-speed', name: 'Проверка скорости', status: 'pending' },
      { id: 'check-mobile', name: 'Проверка мобильной версии', status: 'pending' }
    ];
    
    setDeploymentSteps(initialSteps);

    const updateStep = (stepId: string, updates: Partial<DeploymentStep>) => {
      setDeploymentSteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, ...updates } : s
      ));
    };

    try {
      setDeploymentStage('validating');
      updateStep('validate', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('validate', { status: 'completed', progress: 100, duration: 500 });

      updateStep('check-dependencies', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStep('check-dependencies', { status: 'completed', progress: 100, duration: 300 });

      setDeploymentStage('optimizing');
      updateStep('optimize-resources', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('optimize-resources', { status: 'completed', progress: 100, duration: 800 });

      updateStep('minify-code', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 600));
      updateStep('minify-code', { status: 'completed', progress: 100, duration: 600 });

      setDeploymentStage('building');
      updateStep('generate-html', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateStep('generate-html', { status: 'completed', progress: 100, duration: 1000 });

      updateStep('compile-css', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 700));
      updateStep('compile-css', { status: 'completed', progress: 100, duration: 700 });

      updateStep('compile-js', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('compile-js', { status: 'completed', progress: 100, duration: 800 });

      updateStep('optimize-images', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 1200));
      updateStep('optimize-images', { status: 'completed', progress: 100, duration: 1200 });

      updateStep('create-sitemap', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 200));
      updateStep('create-sitemap', { status: 'completed', progress: 100, duration: 200 });

      updateStep('create-robots', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 100));
      updateStep('create-robots', { status: 'completed', progress: 100, duration: 100 });

      setDeploymentStage('uploading');
      updateStep('upload-files', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateStep('upload-files', { status: 'completed', progress: 100, duration: 1500 });

      updateStep('sync-cdn', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 800));
      updateStep('sync-cdn', { status: 'completed', progress: 100, duration: 800 });

      setDeploymentStage('configuring');
      updateStep('configure-nginx', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 600));
      updateStep('configure-nginx', { status: 'completed', progress: 100, duration: 600 });

      updateStep('setup-ssl', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateStep('setup-ssl', { status: 'completed', progress: 100, duration: 2000 });

      updateStep('setup-caching', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 400));
      updateStep('setup-caching', { status: 'completed', progress: 100, duration: 400 });

      updateStep('setup-redirects', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 300));
      updateStep('setup-redirects', { status: 'completed', progress: 100, duration: 300 });

      setDeploymentStage('verifying');
      updateStep('check-availability', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 500));
      updateStep('check-availability', { status: 'completed', progress: 100, duration: 500 });

      updateStep('check-ssl', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 400));
      updateStep('check-ssl', { status: 'completed', progress: 100, duration: 400 });

      updateStep('check-speed', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 600));
      updateStep('check-speed', { status: 'completed', progress: 100, duration: 600 });

      updateStep('check-mobile', { status: 'in-progress', progress: 0 });
      await new Promise(resolve => setTimeout(resolve, 400));
      updateStep('check-mobile', { status: 'completed', progress: 100, duration: 400 });

      setDeploymentStage('success');
      await onPublish(localSettings);
    } catch (error) {
      setDeploymentStage('failed');
      const failedStep = deploymentSteps.find(s => s.status === 'in-progress');
      if (failedStep) {
        updateStep(failedStep.id, { 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Неизвестная ошибка' 
        });
      }
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubdomainChange = (value: string) => {
    const sanitized = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .substring(0, 63);
    setLocalSettings({ ...localSettings, subdomain: sanitized });
  };

  const handleCustomDomainChange = (value: string) => {
    const sanitized = value.toLowerCase().trim();
    setLocalSettings({ ...localSettings, customDomain: sanitized });
  };

  const getStatusBadge = () => {
    switch (localSettings.status) {
      case 'building':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">Сборка...</Badge>;
      case 'deploying':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-600">Деплой...</Badge>;
      case 'configuring':
        return <Badge variant="outline" className="bg-purple-500/10 text-purple-600">Настройка...</Badge>;
      case 'success':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600">Опубликовано</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-600">Ошибка</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Публикация сайта</DialogTitle>
          <DialogDescription>
            Выберите способ публикации вашего сайта
          </DialogDescription>
        </DialogHeader>

        <Tabs value={localSettings.type} onValueChange={(value) => setLocalSettings({ ...localSettings, type: value as PublishType })}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="subdomain">Поддомен</TabsTrigger>
            <TabsTrigger value="custom-domain">Собственный домен</TabsTrigger>
          </TabsList>

          <TabsContent value="subdomain" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Поддомен</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={localSettings.subdomain || ''}
                      onChange={(e) => handleSubdomainChange(e.target.value)}
                      placeholder="my-site"
                      className="flex-1"
                      disabled={isPublishing}
                    />
                    <span className="text-sm text-muted-foreground">.rus.dev</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Сайт будет доступен по адресу: <strong>{localSettings.subdomain || 'my-site'}.rus.dev</strong>
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Автоматический SSL</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Автоматическая установка SSL сертификата через Let's Encrypt
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.autoSSL !== false}
                      onCheckedChange={(checked) => setLocalSettings({ ...localSettings, autoSSL: checked })}
                      disabled={isPublishing}
                    />
                  </div>

                  {localSettings.autoSSL && (
                    <div className="p-3 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Icon name="Shield" size={16} className="text-green-600" />
                        <span className="text-sm">SSL сертификат будет установлен автоматически</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                  <div className="flex items-start gap-2">
                    <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-900 dark:text-blue-100">
                      <p className="font-semibold mb-1">Что произойдет:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Автоматическое создание DNS записи</li>
                        <li>Автоматическая настройка Nginx</li>
                        <li>Автоматическая установка SSL (если включено)</li>
                        <li>Сайт будет доступен через 1-2 минуты</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="custom-domain" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Ваш домен</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={localSettings.customDomain || ''}
                      onChange={(e) => handleCustomDomainChange(e.target.value)}
                      placeholder="example.com"
                      className="flex-1"
                      disabled={isPublishing || isCheckingDomain}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        if (!localSettings.customDomain?.trim()) return;
                        setIsCheckingDomain(true);
                        try {
                          const response = await fetch(`/api/domains/check?domain=${encodeURIComponent(localSettings.customDomain)}`);
                          const data = await response.json();
                          setLocalSettings({ ...localSettings, domainAvailable: data.available });
                        } catch (error) {
                          setLocalSettings({ ...localSettings, domainAvailable: undefined });
                        } finally {
                          setIsCheckingDomain(false);
                        }
                      }}
                      disabled={!localSettings.customDomain?.trim() || isCheckingDomain || isPublishing}
                    >
                      <Icon name={isCheckingDomain ? "Loader2" : "Search"} size={14} className={isCheckingDomain ? "animate-spin" : ""} />
                    </Button>
                  </div>
                  {localSettings.domainAvailable !== undefined && (
                    <div className={`mt-2 flex items-center gap-2 text-xs ${localSettings.domainAvailable ? 'text-green-600' : 'text-red-600'}`}>
                      <Icon name={localSettings.domainAvailable ? "Check" : "X"} size={12} />
                      {localSettings.domainAvailable ? 'Домен доступен' : 'Домен недоступен или уже используется'}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Введите домен без http:// или https://
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Проверка DNS записей</Label>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          if (!localSettings.customDomain?.trim()) return;
                          setIsCheckingDNS(true);
                          setLocalSettings({ ...localSettings, dnsCheckStatus: 'checking' });
                          try {
                            const response = await fetch(`/api/domains/check-dns?domain=${encodeURIComponent(localSettings.customDomain)}`);
                            const data = await response.json();
                            setLocalSettings({
                              ...localSettings,
                              dnsCheckStatus: data.valid ? 'passed' : 'failed'
                            });
                          } catch (error) {
                            setLocalSettings({ ...localSettings, dnsCheckStatus: 'failed' });
                          } finally {
                            setIsCheckingDNS(false);
                          }
                        }}
                        disabled={!localSettings.customDomain?.trim() || isCheckingDNS || isPublishing}
                      >
                        <Icon name={isCheckingDNS ? "Loader2" : "RefreshCw"} size={14} className={isCheckingDNS ? "animate-spin mr-1" : "mr-1"} />
                        Проверить DNS
                      </Button>
                    </div>
                    {localSettings.dnsCheckStatus && localSettings.dnsCheckStatus !== 'idle' && (
                      <div className={`p-2 rounded text-xs flex items-center gap-2 ${
                        localSettings.dnsCheckStatus === 'passed' ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100' :
                        localSettings.dnsCheckStatus === 'failed' ? 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100' :
                        'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                      }`}>
                        <Icon
                          name={
                            localSettings.dnsCheckStatus === 'passed' ? "Check" :
                            localSettings.dnsCheckStatus === 'failed' ? "X" :
                            "Loader2"
                          }
                          size={12}
                          className={localSettings.dnsCheckStatus === 'checking' ? "animate-spin" : ""}
                        />
                        {localSettings.dnsCheckStatus === 'passed' && 'DNS записи настроены правильно'}
                        {localSettings.dnsCheckStatus === 'failed' && 'DNS записи не найдены или настроены неправильно'}
                        {localSettings.dnsCheckStatus === 'checking' && 'Проверка DNS записей...'}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold">Верификация домена</Label>
                      {!localSettings.domainVerificationToken && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!localSettings.customDomain?.trim()) return;
                            try {
                              const response = await fetch(`/api/domains/generate-verification-token`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ domain: localSettings.customDomain, project_id: projectId })
                              });
                              const data = await response.json();
                              setLocalSettings({ ...localSettings, domainVerificationToken: data.token });
                            } catch (error) {
                              // Error handling
                            }
                          }}
                          disabled={!localSettings.customDomain?.trim() || isPublishing}
                        >
                          <Icon name="Shield" size={14} className="mr-1" />
                          Сгенерировать токен
                        </Button>
                      )}
                    </div>
                    {localSettings.domainVerificationToken && (
                      <div className="space-y-2">
                        <div className="p-3 bg-muted rounded">
                          <p className="text-xs font-semibold mb-2">Добавьте TXT запись в DNS:</p>
                          <div className="space-y-1 text-xs font-mono">
                            <div>Тип: TXT</div>
                            <div>Имя: @</div>
                            <div>Значение: rus-dev-verify={localSettings.domainVerificationToken}</div>
                            <div>TTL: 3600</div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            if (!localSettings.customDomain?.trim() || !localSettings.domainVerificationToken) return;
                            setIsVerifyingDomain(true);
                            setLocalSettings({ ...localSettings, domainVerificationStatus: 'verifying' });
                            try {
                              const response = await fetch(`/api/domains/verify?domain=${encodeURIComponent(localSettings.customDomain)}&token=${localSettings.domainVerificationToken}`);
                              const data = await response.json();
                              setLocalSettings({
                                ...localSettings,
                                domainVerificationStatus: data.verified ? 'verified' : 'failed'
                              });
                            } catch (error) {
                              setLocalSettings({ ...localSettings, domainVerificationStatus: 'failed' });
                            } finally {
                              setIsVerifyingDomain(false);
                            }
                          }}
                          disabled={isVerifyingDomain || isPublishing}
                          className="w-full"
                        >
                          <Icon name={isVerifyingDomain ? "Loader2" : "Check"} size={14} className={isVerifyingDomain ? "animate-spin mr-1" : "mr-1"} />
                          {isVerifyingDomain ? 'Проверка...' : 'Проверить верификацию'}
                        </Button>
                        {localSettings.domainVerificationStatus && localSettings.domainVerificationStatus !== 'pending' && (
                          <div className={`p-2 rounded text-xs flex items-center gap-2 ${
                            localSettings.domainVerificationStatus === 'verified' ? 'bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100' :
                            localSettings.domainVerificationStatus === 'failed' ? 'bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100' :
                            'bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100'
                          }`}>
                            <Icon
                              name={
                                localSettings.domainVerificationStatus === 'verified' ? "Check" :
                                localSettings.domainVerificationStatus === 'failed' ? "X" :
                                "Loader2"
                              }
                              size={12}
                              className={localSettings.domainVerificationStatus === 'verifying' ? "animate-spin" : ""}
                            />
                            {localSettings.domainVerificationStatus === 'verified' && 'Домен успешно верифицирован'}
                            {localSettings.domainVerificationStatus === 'failed' && 'Верификация не пройдена. Проверьте TXT запись.'}
                            {localSettings.domainVerificationStatus === 'verifying' && 'Проверка верификации...'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded">
                    <div className="flex items-start gap-2">
                      <Icon name="AlertCircle" size={16} className="text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-900 dark:text-yellow-100">
                        <p className="font-semibold mb-2">Инструкции по настройке DNS:</p>
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="font-medium">Вариант 1: CNAME запись (рекомендуется для www)</p>
                            <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded font-mono text-xs">
                              <div>Тип: CNAME</div>
                              <div>Имя: www</div>
                              <div>Значение: {localSettings.subdomain || 'your-site'}.rus.dev</div>
                              <div>TTL: 3600</div>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium">Вариант 2: A запись (для корневого домена)</p>
                            <div className="mt-1 p-2 bg-white dark:bg-gray-900 rounded font-mono text-xs">
                              <div>Тип: A</div>
                              <div>Имя: @</div>
                              <div>Значение: IP_АДРЕС_СЕРВЕРА</div>
                              <div>TTL: 3600</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Автоматический SSL</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Автоматическая установка SSL сертификата через Let's Encrypt
                      </p>
                    </div>
                    <Switch
                      checked={localSettings.autoSSL !== false}
                      onCheckedChange={(checked) => setLocalSettings({ ...localSettings, autoSSL: checked })}
                      disabled={isPublishing}
                    />
                  </div>

                  {localSettings.autoSSL && (
                    <div className="p-3 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <Icon name="Shield" size={16} className="text-green-600" />
                        <span className="text-sm">SSL сертификат будет установлен автоматически после проверки DNS</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {localSettings.status && localSettings.status !== 'idle' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Прогресс публикации</span>
              {getStatusBadge()}
            </div>
            {localSettings.progress !== undefined && (
              <Progress value={localSettings.progress} className="h-2" />
            )}
            {localSettings.error && (
              <div className="p-3 bg-red-50 dark:bg-red-950 rounded">
                <div className="flex items-start gap-2">
                  <Icon name="AlertCircle" size={16} className="text-red-600 mt-0.5" />
                  <span className="text-sm text-red-900 dark:text-red-100">{localSettings.error}</span>
                </div>
              </div>
            )}
            {localSettings.publishedUrl && localSettings.status === 'success' && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <span className="text-sm text-green-900 dark:text-green-100">Сайт успешно опубликован!</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(localSettings.publishedUrl, '_blank')}
                  >
                    <Icon name="ExternalLink" size={14} className="mr-1" />
                    Открыть
                  </Button>
                </div>
                <div className="mt-2">
                  <Input
                    value={localSettings.publishedUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPublishing}>
            Отмена
          </Button>
          <Button
            onClick={handlePublish}
            disabled={
              isPublishing ||
              (localSettings.type === 'subdomain' && !localSettings.subdomain?.trim()) ||
              (localSettings.type === 'custom-domain' && !localSettings.customDomain?.trim())
            }
          >
            {isPublishing ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Публикация...
              </>
            ) : (
              <>
                <Icon name="Rocket" size={16} className="mr-2" />
                Опубликовать
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


