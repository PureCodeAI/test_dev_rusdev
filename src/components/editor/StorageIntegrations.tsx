import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface StorageProvider {
  id: string;
  name: string;
  category: 'storage' | 'cdn';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface StorageIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const STORAGE_PROVIDERS: StorageProvider[] = [
  {
    id: 'google-drive',
    name: 'Google Drive',
    category: 'storage',
    icon: 'HardDrive',
    description: 'Файлы Google',
    features: ['API', 'OAuth', 'Синхронизация', 'Шаринг'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'storage',
    icon: 'HardDrive',
    description: 'Облачное хранилище',
    features: ['API', 'OAuth', 'Синхронизация', 'Шаринг'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'onedrive',
    name: 'OneDrive',
    category: 'storage',
    icon: 'HardDrive',
    description: 'Microsoft хранилище',
    features: ['API', 'OAuth', 'Синхронизация', 'Office'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'yandex-disk',
    name: 'Yandex Disk',
    category: 'storage',
    icon: 'HardDrive',
    description: 'Яндекс диск',
    features: ['API', 'OAuth', 'Синхронизация', 'Русский'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'amazon-s3',
    name: 'Amazon S3',
    category: 'storage',
    icon: 'Cloud',
    description: 'Облачное хранилище AWS',
    features: ['S3 API', 'Buckets', 'CDN', 'Масштабируемость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'cloudflare-r2',
    name: 'Cloudflare R2',
    category: 'storage',
    icon: 'Cloud',
    description: 'S3-совместимое хранилище',
    features: ['S3 API', 'Без egress', 'CDN', 'Глобально'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'cdn',
    icon: 'Zap',
    description: 'CDN и защита',
    features: ['CDN', 'DDoS защита', 'SSL', 'Кэширование'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'amazon-cloudfront',
    name: 'Amazon CloudFront',
    category: 'cdn',
    icon: 'Zap',
    description: 'CDN AWS',
    features: ['CDN', 'Edge locations', 'SSL', 'Мониторинг'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'keycdn',
    name: 'KeyCDN',
    category: 'cdn',
    icon: 'Zap',
    description: 'Быстрый CDN',
    features: ['CDN', 'HTTP/2', 'Gzip', 'Быстро'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'bunnycdn',
    name: 'BunnyCDN',
    category: 'cdn',
    icon: 'Zap',
    description: 'Дешевый CDN',
    features: ['CDN', 'Дешево', 'Быстро', 'Глобально'],
    isConfigured: false,
    config: {}
  }
];

export const StorageIntegrations = ({ blockId, onIntegrationChange }: StorageIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<StorageProvider[]>(STORAGE_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<StorageProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    fileUpload: boolean;
    fileDownload: boolean;
    fileSharing: boolean;
    autoSync: boolean;
    cdnEnabled: boolean;
    caching: boolean;
  }>({
    fileUpload: true,
    fileDownload: true,
    fileSharing: false,
    autoSync: false,
    cdnEnabled: true,
    caching: true
  });

  const handleProviderSelect = (provider: StorageProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      fileUpload: true,
      fileDownload: true,
      fileSharing: false,
      autoSync: false,
      cdnEnabled: true,
      caching: true
    });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureChange = (feature: keyof typeof features, value: boolean) => {
    setFeatures(prev => ({ ...prev, [feature]: value }));
    setConfig(prev => ({ ...prev, features: { ...features, [feature]: value } }));
  };

  const handleSave = () => {
    if (!selectedProvider) return;

    const finalConfig = {
      ...config,
      features
    };

    const updatedProviders = providers.map(p => 
      p.id === selectedProvider.id 
        ? { ...p, isConfigured: true, config: finalConfig }
        : p
    );
    setProviders(updatedProviders);

    if (onIntegrationChange) {
      onIntegrationChange(selectedProvider.id, finalConfig);
    }

    toast({
      title: "Интеграция настроена",
      description: `${selectedProvider.name} успешно настроена`
    });
  };

  const handleTest = async () => {
    if (!selectedProvider) return;

    toast({
      title: "Тестирование",
      description: `Проверка подключения к ${selectedProvider.name}...`
    });
  };

  const getConfigFields = (providerId: string) => {
    switch (providerId) {
      case 'google-drive':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'folderId', label: 'Folder ID', type: 'text', required: false, placeholder: 'ID папки для загрузки' },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'dropbox':
        return [
          { key: 'appKey', label: 'App Key', type: 'text', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'onedrive':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'tenantId', label: 'Tenant ID', type: 'text', required: false },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'yandex-disk':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'appPassword', label: 'App Password', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'amazon-s3':
        return [
          { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
          { key: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east-1' },
          { key: 'endpoint', label: 'Endpoint', type: 'text', required: false, placeholder: 's3.amazonaws.com' }
        ];
      case 'cloudflare-r2':
        return [
          { key: 'accountId', label: 'Account ID', type: 'text', required: true },
          { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
          { key: 'endpoint', label: 'Endpoint', type: 'text', required: true, placeholder: 'https://xxx.r2.cloudflarestorage.com' }
        ];
      case 'cloudflare':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'email', label: 'Email', type: 'text', required: true },
          { key: 'zoneId', label: 'Zone ID', type: 'text', required: true },
          { key: 'domain', label: 'Domain', type: 'text', required: true }
        ];
      case 'amazon-cloudfront':
        return [
          { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true },
          { key: 'distributionId', label: 'Distribution ID', type: 'text', required: true },
          { key: 'domain', label: 'Domain', type: 'text', required: true }
        ];
      case 'keycdn':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'zoneId', label: 'Zone ID', type: 'text', required: true },
          { key: 'domain', label: 'Domain', type: 'text', required: true }
        ];
      case 'bunnycdn':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'pullZoneId', label: 'Pull Zone ID', type: 'text', required: true },
          { key: 'domain', label: 'Domain', type: 'text', required: true }
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true }
        ];
    }
  };

  const renderConfigForm = () => {
    if (!selectedProvider) return null;

    const fields = getConfigFields(selectedProvider.id);

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Icon name={selectedProvider.icon as any} size={24} className="text-primary" />
            <div>
              <h3 className="font-semibold">{selectedProvider.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedProvider.description}</p>
            </div>
          </div>
          {selectedProvider.isConfigured && (
            <Badge variant="default" className="bg-green-500">
              <Icon name="CheckCircle" size={14} className="mr-1" />
              Настроено
            </Badge>
          )}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <Label className="mb-2 block">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {field.type === 'text' || field.type === 'password' ? (
                <Input
                  type={field.type}
                  value={(config[field.key] as string) || ''}
                  onChange={(e) => handleConfigChange(field.key, e.target.value)}
                  placeholder={field.placeholder || `Введите ${field.label.toLowerCase()}`}
                />
              ) : null}
            </div>
          ))}

          {(selectedProvider.id === 'google-drive' || selectedProvider.id === 'dropbox' || selectedProvider.id === 'onedrive' || selectedProvider.id === 'yandex-disk') && (
            <div>
              <Button onClick={() => {
                const oauthUrl = `/api/integrations/${selectedProvider.id}/oauth`;
                window.location.href = oauthUrl;
              }} variant="outline" className="w-full">
                <Icon name="Key" size={16} className="mr-2" />
                Авторизоваться через OAuth
              </Button>
            </div>
          )}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Функции хранилища</Label>
            <div className="space-y-3">
              {selectedProvider.category === 'storage' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Загрузка файлов</Label>
                      <p className="text-xs text-muted-foreground">
                        Разрешить загрузку файлов в хранилище
                      </p>
                    </div>
                    <Switch
                      checked={features.fileUpload}
                      onCheckedChange={(checked) => handleFeatureChange('fileUpload', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Скачивание файлов</Label>
                      <p className="text-xs text-muted-foreground">
                        Разрешить скачивание файлов из хранилища
                      </p>
                    </div>
                    <Switch
                      checked={features.fileDownload}
                      onCheckedChange={(checked) => handleFeatureChange('fileDownload', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Шаринг файлов</Label>
                      <p className="text-xs text-muted-foreground">
                        Разрешить создание публичных ссылок на файлы
                      </p>
                    </div>
                    <Switch
                      checked={features.fileSharing}
                      onCheckedChange={(checked) => handleFeatureChange('fileSharing', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Автосинхронизация</Label>
                      <p className="text-xs text-muted-foreground">
                        Автоматическая синхронизация файлов
                      </p>
                    </div>
                    <Switch
                      checked={features.autoSync}
                      onCheckedChange={(checked) => handleFeatureChange('autoSync', checked)}
                    />
                  </div>
                </>
              )}
              {selectedProvider.category === 'cdn' && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">CDN включен</Label>
                      <p className="text-xs text-muted-foreground">
                        Использовать CDN для доставки контента
                      </p>
                    </div>
                    <Switch
                      checked={features.cdnEnabled}
                      onCheckedChange={(checked) => handleFeatureChange('cdnEnabled', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">Кэширование</Label>
                      <p className="text-xs text-muted-foreground">
                        Кэширование контента на edge серверах
                      </p>
                    </div>
                    <Switch
                      checked={features.caching}
                      onCheckedChange={(checked) => handleFeatureChange('caching', checked)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <Icon name="TestTube" size={16} className="mr-2" />
            Тест
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="HardDrive" size={20} className="text-primary" />
          Файловые хранилища и CDN
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с облачными хранилищами и CDN для хранения и доставки файлов
        </p>
      </div>

      <Tabs defaultValue="storage" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="storage">Хранилища</TabsTrigger>
          <TabsTrigger value="cdn">CDN</TabsTrigger>
        </TabsList>

        <TabsContent value="storage" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.filter(p => p.category === 'storage').map(provider => (
              <Card
                key={provider.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon name={provider.icon as any} size={24} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {provider.isConfigured && (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      <Icon name="CheckCircle" size={12} />
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cdn" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.filter(p => p.category === 'cdn').map(provider => (
              <Card
                key={provider.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleProviderSelect(provider)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon name={provider.icon as any} size={24} className="text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold">{provider.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {provider.features.slice(0, 2).map((feature, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {provider.isConfigured && (
                    <Badge variant="default" className="bg-green-500 ml-2">
                      <Icon name="CheckCircle" size={12} />
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProvider && (
        <div className="mt-6">
          {renderConfigForm()}
        </div>
      )}
    </div>
  );
};

