import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface SocialMediaProvider {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface SocialMediaIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const SOCIAL_MEDIA_PROVIDERS: SocialMediaProvider[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'Facebook',
    description: 'Лайки, шэринг, виджеты',
    features: ['Лайки', 'Шэринг', 'Виджеты', 'Комментарии'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    description: 'Лента постов, stories',
    features: ['Лента', 'Stories', 'Виджеты', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: 'Twitter',
    description: 'Твиты, лента',
    features: ['Твиты', 'Лента', 'Виджеты', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'vk',
    name: 'VK',
    icon: 'Share2',
    description: 'Виджеты, лента, комментарии',
    features: ['Виджеты', 'Лента', 'Комментарии', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'Send',
    description: 'Каналы, боты',
    features: ['Каналы', 'Боты', 'Виджеты', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'Youtube',
    description: 'Видео, каналы',
    features: ['Видео', 'Каналы', 'Плейлисты', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'Video',
    description: 'Видео контент',
    features: ['Видео', 'Лента', 'Виджеты', 'API'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'Linkedin',
    description: 'Профессиональная сеть',
    features: ['Профили', 'Посты', 'Компании', 'API'],
    isConfigured: false,
    config: {}
  }
];

export const SocialMediaIntegrations = ({ blockId, onIntegrationChange }: SocialMediaIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<SocialMediaProvider[]>(SOCIAL_MEDIA_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<SocialMediaProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [features, setFeatures] = useState<{
    shareButtons: boolean;
    feed: boolean;
    comments: boolean;
    oauth: boolean;
    importContent: boolean;
    autoPosting: boolean;
  }>({
    shareButtons: true,
    feed: false,
    comments: false,
    oauth: false,
    importContent: false,
    autoPosting: false
  });

  const handleProviderSelect = (provider: SocialMediaProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFeatures(provider.config?.features as typeof features || {
      shareButtons: true,
      feed: false,
      comments: false,
      oauth: false,
      importContent: false,
      autoPosting: false
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
      case 'facebook':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
          { key: 'pageId', label: 'Page ID', type: 'text', required: false },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'instagram':
        return [
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
          { key: 'userId', label: 'User ID', type: 'text', required: true },
          { key: 'clientId', label: 'Client ID', type: 'text', required: false },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: false }
        ];
      case 'twitter':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
          { key: 'accessTokenSecret', label: 'Access Token Secret', type: 'password', required: true }
        ];
      case 'vk':
        return [
          { key: 'appId', label: 'App ID', type: 'text', required: true },
          { key: 'serviceToken', label: 'Service Token', type: 'password', required: true },
          { key: 'groupId', label: 'Group ID', type: 'text', required: false }
        ];
      case 'telegram':
        return [
          { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
          { key: 'channelId', label: 'Channel ID', type: 'text', required: false },
          { key: 'channelUsername', label: 'Channel Username', type: 'text', required: false }
        ];
      case 'youtube':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'channelId', label: 'Channel ID', type: 'text', required: true },
          { key: 'clientId', label: 'Client ID', type: 'text', required: false },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: false }
        ];
      case 'tiktok':
        return [
          { key: 'clientKey', label: 'Client Key', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
        ];
      case 'linkedin':
        return [
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'accessToken', label: 'Access Token', type: 'password', required: false }
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

          {(selectedProvider.id === 'facebook' || selectedProvider.id === 'instagram' || selectedProvider.id === 'twitter' || selectedProvider.id === 'vk' || selectedProvider.id === 'linkedin') && (
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
            <Label className="mb-3 block font-semibold">Функции социальных сетей</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Кнопки "Поделиться"</Label>
                  <p className="text-xs text-muted-foreground">
                    Добавление кнопок для шаринга контента
                  </p>
                </div>
                <Switch
                  checked={features.shareButtons}
                  onCheckedChange={(checked) => handleFeatureChange('shareButtons', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ленты постов</Label>
                  <p className="text-xs text-muted-foreground">
                    Отображение ленты постов из соцсети
                  </p>
                </div>
                <Switch
                  checked={features.feed}
                  onCheckedChange={(checked) => handleFeatureChange('feed', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Комментарии</Label>
                  <p className="text-xs text-muted-foreground">
                    Интеграция системы комментариев
                  </p>
                </div>
                <Switch
                  checked={features.comments}
                  onCheckedChange={(checked) => handleFeatureChange('comments', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Авторизация через соцсети</Label>
                  <p className="text-xs text-muted-foreground">
                    Вход через аккаунт социальной сети
                  </p>
                </div>
                <Switch
                  checked={features.oauth}
                  onCheckedChange={(checked) => handleFeatureChange('oauth', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Импорт контента</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматический импорт контента из соцсети
                  </p>
                </div>
                <Switch
                  checked={features.importContent}
                  onCheckedChange={(checked) => handleFeatureChange('importContent', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Автопостинг</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая публикация контента в соцсеть
                  </p>
                </div>
                <Switch
                  checked={features.autoPosting}
                  onCheckedChange={(checked) => handleFeatureChange('autoPosting', checked)}
                />
              </div>
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
          <Icon name="Share2" size={20} className="text-primary" />
          Социальные сети
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с социальными сетями для взаимодействия с аудиторией
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providers.map(provider => (
          <Card
            key={provider.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedProvider?.id === provider.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleProviderSelect(provider)}
          >
            <div className="flex flex-col items-center text-center">
              <Icon name={provider.icon as any} size={32} className="text-primary mb-2" />
              <h4 className="font-semibold mb-1">{provider.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {provider.features.slice(0, 2).map((feature, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
              {provider.isConfigured && (
                <Badge variant="default" className="bg-green-500 mt-2">
                  <Icon name="CheckCircle" size={12} className="mr-1" />
                  Настроено
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedProvider && (
        <div className="mt-6">
          {renderConfigForm()}
        </div>
      )}
    </div>
  );
};

