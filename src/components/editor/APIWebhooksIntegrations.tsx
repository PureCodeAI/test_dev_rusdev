import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'GET' | 'PUT' | 'DELETE';
  eventType: 'form' | 'payment' | 'event';
  secret?: string;
  retryEnabled: boolean;
  retryCount: number;
  isActive: boolean;
}

interface APIWebhooksIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

export const APIWebhooksIntegrations = ({ blockId, onIntegrationChange }: APIWebhooksIntegrationsProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'webhooks' | 'rest' | 'graphql'>('webhooks');
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [webhookForm, setWebhookForm] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    method: 'POST',
    eventType: 'form',
    secret: '',
    retryEnabled: true,
    retryCount: 3,
    isActive: true
  });

  const [restApiConfig, setRestApiConfig] = useState<{
    enabled: boolean;
    version: string;
    baseUrl: string;
    rateLimit: number;
    apiKeys: Array<{ name: string; key: string; permissions: string[] }>;
    documentation: boolean;
  }>({
    enabled: false,
    version: 'v1',
    baseUrl: '',
    rateLimit: 100,
    apiKeys: [],
    documentation: true
  });

  const [graphqlConfig, setGraphqlConfig] = useState<{
    enabled: boolean;
    endpoint: string;
    subscriptions: boolean;
    introspection: boolean;
  }>({
    enabled: false,
    endpoint: '/graphql',
    subscriptions: false,
    introspection: true
  });

  const handleWebhookSave = () => {
    if (!webhookForm.name || !webhookForm.url) {
      toast({
        title: "Ошибка",
        description: "Заполните обязательные поля",
        variant: "destructive"
      });
      return;
    }

    const newWebhook: WebhookConfig = {
      id: selectedWebhook?.id || `webhook-${Date.now()}`,
      name: webhookForm.name!,
      url: webhookForm.url!,
      method: webhookForm.method || 'POST',
      eventType: webhookForm.eventType || 'form',
      secret: webhookForm.secret,
      retryEnabled: webhookForm.retryEnabled ?? true,
      retryCount: webhookForm.retryCount || 3,
      isActive: webhookForm.isActive ?? true
    };

    if (selectedWebhook) {
      setWebhooks(webhooks.map(w => w.id === selectedWebhook.id ? newWebhook : w));
    } else {
      setWebhooks([...webhooks, newWebhook]);
    }

    if (onIntegrationChange) {
      onIntegrationChange('webhook', { webhooks: [...webhooks, newWebhook] });
    }

    toast({
      title: "Webhook сохранен",
      description: `${newWebhook.name} успешно настроен`
    });

    setSelectedWebhook(null);
    setWebhookForm({
      name: '',
      url: '',
      method: 'POST',
      eventType: 'form',
      secret: '',
      retryEnabled: true,
      retryCount: 3,
      isActive: true
    });
  };

  const handleWebhookDelete = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    if (selectedWebhook?.id === id) {
      setSelectedWebhook(null);
    }
  };

  const handleWebhookTest = async (webhook: WebhookConfig) => {
    toast({
      title: "Тестирование webhook",
      description: `Отправка тестового запроса на ${webhook.url}...`
    });
  };

  const handleRestApiSave = () => {
    if (onIntegrationChange) {
      onIntegrationChange('rest-api', restApiConfig);
    }

    toast({
      title: "REST API настроен",
      description: "Конфигурация REST API сохранена"
    });
  };

  const handleGraphQLSave = () => {
    if (onIntegrationChange) {
      onIntegrationChange('graphql-api', graphqlConfig);
    }

    toast({
      title: "GraphQL API настроен",
      description: "Конфигурация GraphQL API сохранена"
    });
  };

  const handleAddApiKey = () => {
    const newKey = {
      name: `API Key ${restApiConfig.apiKeys.length + 1}`,
      key: `sk_${Math.random().toString(36).substring(2, 15)}`,
      permissions: ['read']
    };
    setRestApiConfig({
      ...restApiConfig,
      apiKeys: [...restApiConfig.apiKeys, newKey]
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="Code" size={20} className="text-primary" />
          API и Webhooks
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте webhooks, REST API и GraphQL API для интеграции с внешними системами
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL API</TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">Webhooks</h4>
            <Button onClick={() => {
              setSelectedWebhook(null);
              setWebhookForm({
                name: '',
                url: '',
                method: 'POST',
                eventType: 'form',
                secret: '',
                retryEnabled: true,
                retryCount: 3,
                isActive: true
              });
            }} size="sm">
              <Icon name="Plus" size={16} className="mr-2" />
              Добавить webhook
            </Button>
          </div>

          <div className="space-y-2">
            {webhooks.map(webhook => (
              <Card key={webhook.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-semibold">{webhook.name}</h5>
                      <Badge variant={webhook.isActive ? "default" : "secondary"}>
                        {webhook.isActive ? 'Активен' : 'Неактивен'}
                      </Badge>
                      <Badge variant="outline">{webhook.eventType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{webhook.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {webhook.method} • Retry: {webhook.retryEnabled ? `${webhook.retryCount} попыток` : 'Отключен'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedWebhook(webhook);
                        setWebhookForm(webhook);
                      }}
                    >
                      <Icon name="Edit" size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWebhookTest(webhook)}
                    >
                      <Icon name="TestTube" size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWebhookDelete(webhook.id)}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {webhooks.length === 0 && (
              <Card className="p-8 text-center text-muted-foreground">
                Нет настроенных webhooks. Нажмите "Добавить webhook" для создания.
              </Card>
            )}
          </div>

          {(selectedWebhook || (!selectedWebhook && webhookForm.name)) && (
            <Card className="p-6">
              <h4 className="font-semibold mb-4">
                {selectedWebhook ? 'Редактировать webhook' : 'Новый webhook'}
              </h4>
              <div className="space-y-4">
                <div>
                  <Label>Название *</Label>
                  <Input
                    value={webhookForm.name || ''}
                    onChange={(e) => setWebhookForm({ ...webhookForm, name: e.target.value })}
                    placeholder="Мой webhook"
                  />
                </div>
                <div>
                  <Label>URL *</Label>
                  <Input
                    value={webhookForm.url || ''}
                    onChange={(e) => setWebhookForm({ ...webhookForm, url: e.target.value })}
                    placeholder="https://example.com/webhook"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Метод</Label>
                    <Select
                      value={webhookForm.method}
                      onValueChange={(v) => setWebhookForm({ ...webhookForm, method: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Тип события</Label>
                    <Select
                      value={webhookForm.eventType}
                      onValueChange={(v) => setWebhookForm({ ...webhookForm, eventType: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="form">Формы</SelectItem>
                        <SelectItem value="payment">Платежи</SelectItem>
                        <SelectItem value="event">События</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Секретный ключ (для подписи)</Label>
                  <Input
                    type="password"
                    value={webhookForm.secret || ''}
                    onChange={(e) => setWebhookForm({ ...webhookForm, secret: e.target.value })}
                    placeholder="Секретный ключ для подписи запросов"
                  />
                </div>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Retry механизм</Label>
                      <p className="text-xs text-muted-foreground">
                        Повторная отправка при ошибке
                      </p>
                    </div>
                    <Switch
                      checked={webhookForm.retryEnabled ?? true}
                      onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, retryEnabled: checked })}
                    />
                  </div>
                  {webhookForm.retryEnabled && (
                    <div>
                      <Label>Количество попыток</Label>
                      <Input
                        type="number"
                        value={webhookForm.retryCount || 3}
                        onChange={(e) => setWebhookForm({ ...webhookForm, retryCount: parseInt(e.target.value) })}
                        min={1}
                        max={10}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Активен</Label>
                      <p className="text-xs text-muted-foreground">
                        Включить/выключить webhook
                      </p>
                    </div>
                    <Switch
                      checked={webhookForm.isActive ?? true}
                      onCheckedChange={(checked) => setWebhookForm({ ...webhookForm, isActive: checked })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleWebhookSave} className="flex-1">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить
                  </Button>
                  {selectedWebhook && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedWebhook(null);
                        setWebhookForm({
                          name: '',
                          url: '',
                          method: 'POST',
                          eventType: 'form',
                          secret: '',
                          retryEnabled: true,
                          retryCount: 3,
                          isActive: true
                        });
                      }}
                    >
                      Отмена
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rest" className="space-y-4 mt-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">REST API</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Включить REST API</Label>
                  <p className="text-xs text-muted-foreground">
                    Предоставить доступ к данным через REST API
                  </p>
                </div>
                <Switch
                  checked={restApiConfig.enabled}
                  onCheckedChange={(checked) => setRestApiConfig({ ...restApiConfig, enabled: checked })}
                />
              </div>

              {restApiConfig.enabled && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Версия API</Label>
                      <Input
                        value={restApiConfig.version}
                        onChange={(e) => setRestApiConfig({ ...restApiConfig, version: e.target.value })}
                        placeholder="v1"
                      />
                    </div>
                    <div>
                      <Label>Rate Limit (запросов/час)</Label>
                      <Input
                        type="number"
                        value={restApiConfig.rateLimit}
                        onChange={(e) => setRestApiConfig({ ...restApiConfig, rateLimit: parseInt(e.target.value) })}
                        min={1}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Base URL</Label>
                    <Input
                      value={restApiConfig.baseUrl}
                      onChange={(e) => setRestApiConfig({ ...restApiConfig, baseUrl: e.target.value })}
                      placeholder="https://api.example.com"
                    />
                  </div>
                  <Separator />
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>API ключи</Label>
                      <Button onClick={handleAddApiKey} size="sm" variant="outline">
                        <Icon name="Plus" size={14} className="mr-2" />
                        Добавить ключ
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {restApiConfig.apiKeys.map((apiKey, idx) => (
                        <Card key={idx} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{apiKey.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{apiKey.key}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Разрешения: {apiKey.permissions.join(', ')}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRestApiConfig({
                                  ...restApiConfig,
                                  apiKeys: restApiConfig.apiKeys.filter((_, i) => i !== idx)
                                });
                              }}
                            >
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {restApiConfig.apiKeys.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Нет API ключей. Нажмите "Добавить ключ" для создания.
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Документация API (Swagger/OpenAPI)</Label>
                      <p className="text-xs text-muted-foreground">
                        Генерация документации API
                      </p>
                    </div>
                    <Switch
                      checked={restApiConfig.documentation}
                      onCheckedChange={(checked) => setRestApiConfig({ ...restApiConfig, documentation: checked })}
                    />
                  </div>
                  <Button onClick={handleRestApiSave} className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить настройки REST API
                  </Button>
                </>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="graphql" className="space-y-4 mt-4">
          <Card className="p-6">
            <h4 className="font-semibold mb-4">GraphQL API</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Включить GraphQL API</Label>
                  <p className="text-xs text-muted-foreground">
                    Предоставить доступ к данным через GraphQL
                  </p>
                </div>
                <Switch
                  checked={graphqlConfig.enabled}
                  onCheckedChange={(checked) => setGraphqlConfig({ ...graphqlConfig, enabled: checked })}
                />
              </div>

              {graphqlConfig.enabled && (
                <>
                  <Separator />
                  <div>
                    <Label>GraphQL Endpoint</Label>
                    <Input
                      value={graphqlConfig.endpoint}
                      onChange={(e) => setGraphqlConfig({ ...graphqlConfig, endpoint: e.target.value })}
                      placeholder="/graphql"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Подписки (Subscriptions)</Label>
                        <p className="text-xs text-muted-foreground">
                          Включить real-time подписки через WebSocket
                        </p>
                      </div>
                      <Switch
                        checked={graphqlConfig.subscriptions}
                        onCheckedChange={(checked) => setGraphqlConfig({ ...graphqlConfig, subscriptions: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">Introspection</Label>
                        <p className="text-xs text-muted-foreground">
                          Разрешить запросы схемы (для разработки)
                        </p>
                      </div>
                      <Switch
                        checked={graphqlConfig.introspection}
                        onCheckedChange={(checked) => setGraphqlConfig({ ...graphqlConfig, introspection: checked })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleGraphQLSave} className="w-full">
                    <Icon name="Save" size={16} className="mr-2" />
                    Сохранить настройки GraphQL API
                  </Button>
                </>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

