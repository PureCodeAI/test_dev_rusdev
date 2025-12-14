import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';

export interface PublishSettingsData {
  basic: {
    selectedVersion?: string;
    scheduledPublish?: {
      enabled: boolean;
      date?: string;
      time?: string;
    };
  };
  ssl: {
    autoSSL: boolean;
    manualCertificate?: {
      enabled: boolean;
      certificate?: string;
      privateKey?: string;
      chain?: string;
    };
    httpToHttpsRedirect: boolean;
    hsts: {
      enabled: boolean;
      maxAge?: number;
      includeSubDomains?: boolean;
      preload?: boolean;
    };
    tlsVersion: '1.2' | '1.3' | 'both';
  };
  cdn: {
    enabled: boolean;
    provider?: 'cloudflare' | 'aws-cloudfront' | 'custom';
    customProvider?: string;
    cacheEnabled: boolean;
    compression: {
      gzip: boolean;
      brotli: boolean;
    };
  };
  caching: {
    static: {
      enabled: boolean;
      maxAge?: number;
    };
    html: {
      enabled: boolean;
      maxAge?: number;
    };
    api: {
      enabled: boolean;
      maxAge?: number;
    };
    clearOnUpdate: boolean;
    customHeaders?: Array<{ path: string; header: string; value: string }>;
  };
  security: {
    ddosProtection: boolean;
    waf: {
      enabled: boolean;
      rules?: string;
    };
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute?: number;
    };
    cors: {
      enabled: boolean;
      allowedOrigins?: string;
    };
    csp: {
      enabled: boolean;
      policy?: string;
    };
    xssProtection: boolean;
  };
  performance: {
    minifyCSS: boolean;
    minifyJS: boolean;
    optimizeImages: boolean;
    lazyLoading: boolean;
    preloadCritical: boolean;
    serviceWorker: {
      enabled: boolean;
      offlineSupport?: boolean;
    };
  };
  seo: {
    autoSitemap: boolean;
    autoRobots: boolean;
    canonicalUrls: boolean;
    openGraph: boolean;
    twitterCards: boolean;
    structuredData: boolean;
  };
}

interface PublishSettingsDialogProps {
  isOpen: boolean;
  projectId: number;
  initialSettings: PublishSettingsData;
  onClose: () => void;
  onSave: (settings: PublishSettingsData) => void;
}

export const PublishSettingsDialog = ({
  isOpen,
  projectId,
  initialSettings,
  onClose,
  onSave
}: PublishSettingsDialogProps) => {
  const [settings, setSettings] = useState<PublishSettingsData>(initialSettings);

  const updateSettings = <K extends keyof PublishSettingsData>(
    section: K,
    updates: Partial<PublishSettingsData[K]>
  ) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Настройки публикации</DialogTitle>
          <DialogDescription>
            Расширенные настройки для публикации вашего сайта
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic">Базовые</TabsTrigger>
            <TabsTrigger value="ssl">SSL</TabsTrigger>
            <TabsTrigger value="cdn">CDN</TabsTrigger>
            <TabsTrigger value="caching">Кэш</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            <TabsTrigger value="performance">Производительность</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label>Версия для публикации</Label>
                  <Select
                    value={settings.basic.selectedVersion || 'latest'}
                    onValueChange={(value) => updateSettings('basic', { selectedVersion: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">Последняя версия</SelectItem>
                      <SelectItem value="v1.0.0">v1.0.0</SelectItem>
                      <SelectItem value="v1.1.0">v1.1.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Планирование публикации</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Запланировать публикацию на определенное время
                      </p>
                    </div>
                    <Switch
                      checked={settings.basic.scheduledPublish?.enabled || false}
                      onCheckedChange={(checked) =>
                        updateSettings('basic', {
                          scheduledPublish: {
                            enabled: checked,
                            date: settings.basic.scheduledPublish?.date,
                            time: settings.basic.scheduledPublish?.time
                          }
                        })
                      }
                    />
                  </div>

                  {settings.basic.scheduledPublish?.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Дата</Label>
                        <Input
                          type="date"
                          value={settings.basic.scheduledPublish?.date || ''}
                          onChange={(e) =>
                            updateSettings('basic', {
                              scheduledPublish: {
                                ...settings.basic.scheduledPublish!,
                                date: e.target.value
                              }
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Время</Label>
                        <Input
                          type="time"
                          value={settings.basic.scheduledPublish?.time || ''}
                          onChange={(e) =>
                            updateSettings('basic', {
                              scheduledPublish: {
                                ...settings.basic.scheduledPublish!,
                                time: e.target.value
                              }
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="ssl" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Автоматический SSL (Let's Encrypt)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическая установка и обновление SSL сертификата
                    </p>
                  </div>
                  <Switch
                    checked={settings.ssl.autoSSL}
                    onCheckedChange={(checked) => updateSettings('ssl', { autoSSL: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Ручная загрузка сертификата</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Загрузить собственный SSL сертификат
                      </p>
                    </div>
                    <Switch
                      checked={settings.ssl.manualCertificate?.enabled || false}
                      onCheckedChange={(checked) =>
                        updateSettings('ssl', {
                          manualCertificate: {
                            enabled: checked,
                            certificate: settings.ssl.manualCertificate?.certificate,
                            privateKey: settings.ssl.manualCertificate?.privateKey,
                            chain: settings.ssl.manualCertificate?.chain
                          }
                        })
                      }
                    />
                  </div>

                  {settings.ssl.manualCertificate?.enabled && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Сертификат (PEM)</Label>
                        <Textarea
                          value={settings.ssl.manualCertificate?.certificate || ''}
                          onChange={(e) =>
                            updateSettings('ssl', {
                              manualCertificate: {
                                ...settings.ssl.manualCertificate!,
                                certificate: e.target.value
                              }
                            })
                          }
                          className="mt-1 font-mono text-xs"
                          rows={4}
                          placeholder="-----BEGIN CERTIFICATE-----..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Приватный ключ (PEM)</Label>
                        <Textarea
                          value={settings.ssl.manualCertificate?.privateKey || ''}
                          onChange={(e) =>
                            updateSettings('ssl', {
                              manualCertificate: {
                                ...settings.ssl.manualCertificate!,
                                privateKey: e.target.value
                              }
                            })
                          }
                          className="mt-1 font-mono text-xs"
                          rows={4}
                          placeholder="-----BEGIN PRIVATE KEY-----..."
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Цепочка сертификатов (опционально)</Label>
                        <Textarea
                          value={settings.ssl.manualCertificate?.chain || ''}
                          onChange={(e) =>
                            updateSettings('ssl', {
                              manualCertificate: {
                                ...settings.ssl.manualCertificate!,
                                chain: e.target.value
                              }
                            })
                          }
                          className="mt-1 font-mono text-xs"
                          rows={4}
                          placeholder="-----BEGIN CERTIFICATE-----..."
                        />
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Редирект HTTP → HTTPS</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Автоматически перенаправлять HTTP запросы на HTTPS
                      </p>
                    </div>
                    <Switch
                      checked={settings.ssl.httpToHttpsRedirect}
                      onCheckedChange={(checked) => updateSettings('ssl', { httpToHttpsRedirect: checked })}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">HSTS (HTTP Strict Transport Security)</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Принудительное использование HTTPS
                        </p>
                      </div>
                      <Switch
                        checked={settings.ssl.hsts.enabled}
                        onCheckedChange={(checked) =>
                          updateSettings('ssl', {
                            hsts: { ...settings.ssl.hsts, enabled: checked }
                          })
                        }
                      />
                    </div>

                    {settings.ssl.hsts.enabled && (
                      <div className="space-y-3 pl-4 border-l-2">
                        <div>
                          <Label className="text-xs">Max-Age (секунды)</Label>
                          <Input
                            type="number"
                            value={settings.ssl.hsts.maxAge || 31536000}
                            onChange={(e) =>
                              updateSettings('ssl', {
                                hsts: { ...settings.ssl.hsts, maxAge: parseInt(e.target.value) }
                              })
                            }
                            className="mt-1"
                            placeholder="31536000"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Include SubDomains</Label>
                          <Switch
                            checked={settings.ssl.hsts.includeSubDomains || false}
                            onCheckedChange={(checked) =>
                              updateSettings('ssl', {
                                hsts: { ...settings.ssl.hsts, includeSubDomains: checked }
                              })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Preload</Label>
                          <Switch
                            checked={settings.ssl.hsts.preload || false}
                            onCheckedChange={(checked) =>
                              updateSettings('ssl', {
                                hsts: { ...settings.ssl.hsts, preload: checked }
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">Версия TLS</Label>
                      <Select
                        value={settings.ssl.tlsVersion}
                        onValueChange={(value: '1.2' | '1.3' | 'both') =>
                          updateSettings('ssl', { tlsVersion: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1.2">TLS 1.2</SelectItem>
                          <SelectItem value="1.3">TLS 1.3</SelectItem>
                          <SelectItem value="both">TLS 1.2 и 1.3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cdn" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Включить CDN</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Использовать CDN для ускорения загрузки сайта
                    </p>
                  </div>
                  <Switch
                    checked={settings.cdn.enabled}
                    onCheckedChange={(checked) => updateSettings('cdn', { enabled: checked })}
                  />
                </div>

                {settings.cdn.enabled && (
                  <>
                    <Separator />

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">CDN провайдер</Label>
                      <Select
                        value={settings.cdn.provider || 'cloudflare'}
                        onValueChange={(value: 'cloudflare' | 'aws-cloudfront' | 'custom') =>
                          updateSettings('cdn', { provider: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cloudflare">Cloudflare</SelectItem>
                          <SelectItem value="aws-cloudfront">AWS CloudFront</SelectItem>
                          <SelectItem value="custom">Другой провайдер</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {settings.cdn.provider === 'custom' && (
                      <div>
                        <Label className="text-xs">Название провайдера</Label>
                        <Input
                          value={settings.cdn.customProvider || ''}
                          onChange={(e) => updateSettings('cdn', { customProvider: e.target.value })}
                          className="mt-1"
                          placeholder="Например: Fastly, KeyCDN"
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">Кэширование в CDN</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Включить кэширование контента в CDN
                        </p>
                      </div>
                      <Switch
                        checked={settings.cdn.cacheEnabled}
                        onCheckedChange={(checked) => updateSettings('cdn', { cacheEnabled: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold">Сжатие</Label>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Gzip</Label>
                        <Switch
                          checked={settings.cdn.compression.gzip}
                          onCheckedChange={(checked) =>
                            updateSettings('cdn', {
                              compression: { ...settings.cdn.compression, gzip: checked }
                            })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Brotli</Label>
                        <Switch
                          checked={settings.cdn.compression.brotli}
                          onCheckedChange={(checked) =>
                            updateSettings('cdn', {
                              compression: { ...settings.cdn.compression, brotli: checked }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                      <div className="flex items-start gap-2">
                        <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-900 dark:text-blue-100">
                          <p className="font-semibold mb-1">Очистка кэша CDN</p>
                          <p className="text-xs">
                            Кэш CDN будет автоматически очищен при обновлении сайта
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="caching" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Кэширование статики</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        CSS, JS, изображения (рекомендуется: 1 год)
                      </p>
                    </div>
                    <Switch
                      checked={settings.caching.static.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('caching', {
                          static: { ...settings.caching.static, enabled: checked }
                        })
                      }
                    />
                  </div>
                  {settings.caching.static.enabled && (
                    <div className="pl-4 border-l-2">
                      <Label className="text-xs mb-2 block">Max-Age (секунды)</Label>
                      <Input
                        type="number"
                        value={settings.caching.static.maxAge || 31536000}
                        onChange={(e) =>
                          updateSettings('caching', {
                            static: { ...settings.caching.static, maxAge: parseInt(e.target.value) }
                          })
                        }
                        placeholder="31536000"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Кэширование HTML</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        HTML страницы (рекомендуется: 1 час)
                      </p>
                    </div>
                    <Switch
                      checked={settings.caching.html.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('caching', {
                          html: { ...settings.caching.html, enabled: checked }
                        })
                      }
                    />
                  </div>
                  {settings.caching.html.enabled && (
                    <div className="pl-4 border-l-2">
                      <Label className="text-xs mb-2 block">Max-Age (секунды)</Label>
                      <Input
                        type="number"
                        value={settings.caching.html.maxAge || 3600}
                        onChange={(e) =>
                          updateSettings('caching', {
                            html: { ...settings.caching.html, maxAge: parseInt(e.target.value) }
                          })
                        }
                        placeholder="3600"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Кэширование API</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        API запросы (рекомендуется: 5 минут)
                      </p>
                    </div>
                    <Switch
                      checked={settings.caching.api.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('caching', {
                          api: { ...settings.caching.api, enabled: checked }
                        })
                      }
                    />
                  </div>
                  {settings.caching.api.enabled && (
                    <div className="pl-4 border-l-2">
                      <Label className="text-xs mb-2 block">Max-Age (секунды)</Label>
                      <Input
                        type="number"
                        value={settings.caching.api.maxAge || 300}
                        onChange={(e) =>
                          updateSettings('caching', {
                            api: { ...settings.caching.api, maxAge: parseInt(e.target.value) }
                          })
                        }
                        placeholder="300"
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Очистка кэша при обновлении</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Автоматически очищать кэш при публикации новой версии
                      </p>
                    </div>
                    <Switch
                      checked={settings.caching.clearOnUpdate}
                      onCheckedChange={(checked) => updateSettings('caching', { clearOnUpdate: checked })}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Защита от DDoS</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическая защита от DDoS атак
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.ddosProtection}
                    onCheckedChange={(checked) => updateSettings('security', { ddosProtection: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">WAF (Web Application Firewall)</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Защита от веб-атак
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.waf.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('security', {
                          waf: { ...settings.security.waf, enabled: checked }
                        })
                      }
                    />
                  </div>
                  {settings.security.waf.enabled && (
                    <div className="pl-4 border-l-2">
                      <Label className="text-xs mb-2 block">Правила WAF (JSON)</Label>
                      <Textarea
                        value={settings.security.waf.rules || '{}'}
                        onChange={(e) =>
                          updateSettings('security', {
                            waf: { ...settings.security.waf, rules: e.target.value }
                          })
                        }
                        className="font-mono text-xs"
                        rows={6}
                        placeholder='{"rules": []}'
                      />
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-semibold">Rate Limiting</Label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ограничение количества запросов
                        </p>
                      </div>
                      <Switch
                        checked={settings.security.rateLimiting.enabled}
                        onCheckedChange={(checked) =>
                          updateSettings('security', {
                            rateLimiting: { ...settings.security.rateLimiting, enabled: checked }
                          })
                        }
                      />
                    </div>
                    {settings.security.rateLimiting.enabled && (
                      <div className="pl-4 border-l-2">
                        <Label className="text-xs mb-2 block">Запросов в минуту</Label>
                        <Input
                          type="number"
                          value={settings.security.rateLimiting.requestsPerMinute || 60}
                          onChange={(e) =>
                            updateSettings('security', {
                              rateLimiting: {
                                ...settings.security.rateLimiting,
                                requestsPerMinute: parseInt(e.target.value)
                              }
                            })
                          }
                          placeholder="60"
                        />
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-semibold">CORS</Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Настройка Cross-Origin Resource Sharing
                          </p>
                        </div>
                        <Switch
                          checked={settings.security.cors.enabled}
                          onCheckedChange={(checked) =>
                            updateSettings('security', {
                              cors: { ...settings.security.cors, enabled: checked }
                            })
                          }
                        />
                      </div>
                      {settings.security.cors.enabled && (
                        <div className="pl-4 border-l-2">
                          <Label className="text-xs mb-2 block">Разрешенные источники (через запятую)</Label>
                          <Input
                            value={settings.security.cors.allowedOrigins || '*'}
                            onChange={(e) =>
                              updateSettings('security', {
                                cors: { ...settings.security.cors, allowedOrigins: e.target.value }
                              })
                            }
                            placeholder="https://example.com, https://app.example.com"
                          />
                        </div>
                      )}

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold">CSP (Content Security Policy)</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Защита от XSS атак
                            </p>
                          </div>
                          <Switch
                            checked={settings.security.csp.enabled}
                            onCheckedChange={(checked) =>
                              updateSettings('security', {
                                csp: { ...settings.security.csp, enabled: checked }
                              })
                            }
                          />
                        </div>
                        {settings.security.csp.enabled && (
                          <div className="pl-4 border-l-2">
                            <Label className="text-xs mb-2 block">CSP Policy</Label>
                            <Input
                              value={settings.security.csp.policy || "default-src 'self'"}
                              onChange={(e) =>
                                updateSettings('security', {
                                  csp: { ...settings.security.csp, policy: e.target.value }
                                })
                              }
                              placeholder="default-src 'self'"
                            />
                          </div>
                        )}

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-semibold">XSS Protection</Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              Дополнительная защита от XSS
                            </p>
                          </div>
                          <Switch
                            checked={settings.security.xssProtection}
                            onCheckedChange={(checked) => updateSettings('security', { xssProtection: checked })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Минификация CSS</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Уменьшение размера CSS файлов
                    </p>
                  </div>
                  <Switch
                    checked={settings.performance.minifyCSS}
                    onCheckedChange={(checked) => updateSettings('performance', { minifyCSS: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Минификация JavaScript</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Уменьшение размера JS файлов
                    </p>
                  </div>
                  <Switch
                    checked={settings.performance.minifyJS}
                    onCheckedChange={(checked) => updateSettings('performance', { minifyJS: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Оптимизация изображений</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическая оптимизация изображений
                    </p>
                  </div>
                  <Switch
                    checked={settings.performance.optimizeImages}
                    onCheckedChange={(checked) => updateSettings('performance', { optimizeImages: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Lazy Loading</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Отложенная загрузка изображений
                    </p>
                  </div>
                  <Switch
                    checked={settings.performance.lazyLoading}
                    onCheckedChange={(checked) => updateSettings('performance', { lazyLoading: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Preload критических ресурсов</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Предзагрузка важных ресурсов
                    </p>
                  </div>
                  <Switch
                    checked={settings.performance.preloadCritical}
                    onCheckedChange={(checked) => updateSettings('performance', { preloadCritical: checked })}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Service Worker</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Офлайн поддержка и кэширование
                      </p>
                    </div>
                    <Switch
                      checked={settings.performance.serviceWorker.enabled}
                      onCheckedChange={(checked) =>
                        updateSettings('performance', {
                          serviceWorker: { ...settings.performance.serviceWorker, enabled: checked }
                        })
                      }
                    />
                  </div>
                  {settings.performance.serviceWorker.enabled && (
                    <div className="pl-4 border-l-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Офлайн поддержка</Label>
                        <Switch
                          checked={settings.performance.serviceWorker.offlineSupport || false}
                          onCheckedChange={(checked) =>
                            updateSettings('performance', {
                              serviceWorker: {
                                ...settings.performance.serviceWorker,
                                offlineSupport: checked
                              }
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4 mt-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Автоматическая генерация sitemap.xml</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическое создание карты сайта
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.autoSitemap}
                    onCheckedChange={(checked) => updateSettings('seo', { autoSitemap: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Автоматическая генерация robots.txt</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическое создание файла robots.txt
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.autoRobots}
                    onCheckedChange={(checked) => updateSettings('seo', { autoRobots: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Canonical URLs</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Автоматическое добавление canonical тегов
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.canonicalUrls}
                    onCheckedChange={(checked) => updateSettings('seo', { canonicalUrls: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Open Graph теги</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Мета-теги для социальных сетей
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.openGraph}
                    onCheckedChange={(checked) => updateSettings('seo', { openGraph: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Twitter Cards</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Мета-теги для Twitter
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.twitterCards}
                    onCheckedChange={(checked) => updateSettings('seo', { twitterCards: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-semibold">Structured Data (Schema.org)</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Структурированные данные для поисковых систем
                    </p>
                  </div>
                  <Switch
                    checked={settings.seo.structuredData}
                    onCheckedChange={(checked) => updateSettings('seo', { structuredData: checked })}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave}>
            Сохранить настройки
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

