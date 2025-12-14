import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface CRMProvider {
  id: string;
  name: string;
  category: 'russian' | 'international';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface CRMIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const CRM_PROVIDERS: CRMProvider[] = [
  {
    id: 'amocrm',
    name: 'AmoCRM',
    category: 'russian',
    icon: 'Briefcase',
    description: 'Полная интеграция (сделки, контакты, задачи, воронки)',
    features: ['Сделки', 'Контакты', 'Задачи', 'Воронки', 'Теги', 'История'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'bitrix24',
    name: 'Bitrix24',
    category: 'russian',
    icon: 'Box',
    description: 'CRM, задачи, документы, телефония',
    features: ['CRM', 'Задачи', 'Документы', 'Телефония'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'retailcrm',
    name: 'RetailCRM',
    category: 'russian',
    icon: 'ShoppingCart',
    description: 'Для e-commerce',
    features: ['Заказы', 'Клиенты', 'Товары', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'myoffice',
    name: 'МойОфис CRM',
    category: 'russian',
    icon: 'Briefcase',
    description: 'Российская CRM',
    features: ['Сделки', 'Контакты', 'Задачи'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'megaplan',
    name: 'Мегаплан',
    category: 'russian',
    icon: 'Calendar',
    description: 'CRM и управление проектами',
    features: ['CRM', 'Проекты', 'Задачи', 'Время'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'international',
    icon: 'Briefcase',
    description: 'Маркетинг, продажи, сервис',
    features: ['Маркетинг', 'Продажи', 'Сервис', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'international',
    icon: 'Cloud',
    description: 'Облачная CRM',
    features: ['CRM', 'Маркетинг', 'Аналитика', 'Облако'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'international',
    icon: 'TrendingUp',
    description: 'Простая CRM для продаж',
    features: ['Продажи', 'Воронки', 'Аналитика'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'zoho',
    name: 'Zoho CRM',
    category: 'international',
    icon: 'Briefcase',
    description: 'Комплексная CRM',
    features: ['CRM', 'Маркетинг', 'Аналитика', 'Автоматизация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'monday',
    name: 'Monday.com',
    category: 'international',
    icon: 'Calendar',
    description: 'Управление проектами и CRM',
    features: ['Проекты', 'CRM', 'Задачи', 'Коллаборация'],
    isConfigured: false,
    config: {}
  }
];

export const CRMIntegrations = ({ blockId, onIntegrationChange }: CRMIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<CRMProvider[]>(CRM_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<CRMProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [actions, setActions] = useState<{
    createLead: boolean;
    syncContacts: boolean;
    createDeal: boolean;
    addTask: boolean;
    sendToPipeline: boolean;
    addTags: boolean;
  }>({
    createLead: true,
    syncContacts: false,
    createDeal: false,
    addTask: false,
    sendToPipeline: false,
    addTags: false
  });

  const handleProviderSelect = (provider: CRMProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setFieldMapping(provider.config?.fieldMapping as Record<string, string> || {});
    setActions(provider.config?.actions as typeof actions || {
      createLead: true,
      syncContacts: false,
      createDeal: false,
      addTask: false,
      sendToPipeline: false,
      addTags: false
    });
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFieldMappingChange = (formField: string, crmField: string) => {
    setFieldMapping(prev => ({ ...prev, [formField]: crmField }));
    setConfig(prev => ({ ...prev, fieldMapping: { ...fieldMapping, [formField]: crmField } }));
  };

  const handleActionChange = (action: keyof typeof actions, value: boolean) => {
    setActions(prev => ({ ...prev, [action]: value }));
    setConfig(prev => ({ ...prev, actions: { ...actions, [action]: value } }));
  };

  const handleSave = () => {
    if (!selectedProvider) return;

    const finalConfig = {
      ...config,
      fieldMapping,
      actions
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
      description: `${selectedProvider.name} успешно настроен`
    });
  };

  const handleTest = async () => {
    if (!selectedProvider) return;

    toast({
      title: "Тестирование",
      description: `Проверка подключения к ${selectedProvider.name}...`
    });
  };

  const handleOAuth = () => {
    if (!selectedProvider) return;

    const oauthUrl = `/api/integrations/${selectedProvider.id}/oauth`;
    window.location.href = oauthUrl;
  };

  const getConfigFields = (providerId: string) => {
    switch (providerId) {
      case 'amocrm':
        return [
          { key: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'your-domain' },
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
          { key: 'redirectUri', label: 'Redirect URI', type: 'text', required: false }
        ];
      case 'bitrix24':
        return [
          { key: 'domain', label: 'Домен', type: 'text', required: true, placeholder: 'your-domain.bitrix24.ru' },
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
        ];
      case 'retailcrm':
        return [
          { key: 'apiUrl', label: 'API URL', type: 'text', required: true, placeholder: 'https://your-domain.retailcrm.ru' },
          { key: 'apiKey', label: 'API Key', type: 'password', required: true }
        ];
      case 'hubspot':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'portalId', label: 'Portal ID', type: 'text', required: true }
        ];
      case 'salesforce':
        return [
          { key: 'instanceUrl', label: 'Instance URL', type: 'text', required: true, placeholder: 'https://your-instance.salesforce.com' },
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
        ];
      case 'pipedrive':
        return [
          { key: 'apiToken', label: 'API Token', type: 'password', required: true },
          { key: 'companyDomain', label: 'Company Domain', type: 'text', required: true, placeholder: 'your-company' }
        ];
      case 'zoho':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'clientId', label: 'Client ID', type: 'text', required: true },
          { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true }
        ];
      default:
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'apiSecret', label: 'API Secret', type: 'password', required: true }
        ];
    }
  };

  const getFormFields = () => {
    return ['name', 'email', 'phone', 'message', 'company', 'position'];
  };

  const getCRMFields = (providerId: string) => {
    switch (providerId) {
      case 'amocrm':
        return ['contact_name', 'contact_email', 'contact_phone', 'contact_company', 'contact_position', 'lead_name', 'lead_price', 'lead_comment', 'task_text', 'pipeline_id', 'status_id'];
      case 'bitrix24':
        return ['NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'COMPANY_TITLE', 'POST', 'TITLE', 'OPPORTUNITY', 'COMMENTS', 'STAGE_ID'];
      case 'hubspot':
        return ['firstname', 'lastname', 'email', 'phone', 'company', 'jobtitle', 'dealname', 'amount', 'dealstage'];
      case 'salesforce':
        return ['FirstName', 'LastName', 'Email', 'Phone', 'Company', 'Title', 'Name', 'Amount', 'StageName'];
      default:
        return ['name', 'email', 'phone', 'company', 'message'];
    }
  };

  const renderConfigForm = () => {
    if (!selectedProvider) return null;

    const fields = getConfigFields(selectedProvider.id);
    const formFields = getFormFields();
    const crmFields = getCRMFields(selectedProvider.id);

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

          {(selectedProvider.id === 'amocrm' || selectedProvider.id === 'bitrix24' || selectedProvider.id === 'salesforce' || selectedProvider.id === 'zoho') && (
            <div>
              <Button onClick={handleOAuth} variant="outline" className="w-full">
                <Icon name="Key" size={16} className="mr-2" />
                Авторизоваться через OAuth
              </Button>
            </div>
          )}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Маппинг полей формы</Label>
            <div className="space-y-2">
              {formFields.map(formField => (
                <div key={formField} className="flex items-center gap-2">
                  <Label className="w-24 text-sm">{formField}</Label>
                  <Select
                    value={fieldMapping[formField] || ''}
                    onValueChange={(value) => handleFieldMappingChange(formField, value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Выберите поле CRM" />
                    </SelectTrigger>
                    <SelectContent>
                      {crmFields.map(crmField => (
                        <SelectItem key={crmField} value={crmField}>
                          {crmField}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Действия при отправке формы</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Создать лид</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматически создавать лид из данных формы
                  </p>
                </div>
                <Switch
                  checked={actions.createLead}
                  onCheckedChange={(checked) => handleActionChange('createLead', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Синхронизировать контакты</Label>
                  <p className="text-xs text-muted-foreground">
                    Обновлять или создавать контакты
                  </p>
                </div>
                <Switch
                  checked={actions.syncContacts}
                  onCheckedChange={(checked) => handleActionChange('syncContacts', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Создать сделку</Label>
                  <p className="text-xs text-muted-foreground">
                    Создавать сделку из формы
                  </p>
                </div>
                <Switch
                  checked={actions.createDeal}
                  onCheckedChange={(checked) => handleActionChange('createDeal', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Добавить задачу</Label>
                  <p className="text-xs text-muted-foreground">
                    Создавать задачу для менеджера
                  </p>
                </div>
                <Switch
                  checked={actions.addTask}
                  onCheckedChange={(checked) => handleActionChange('addTask', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Отправить в воронку</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматически добавлять в воронку продаж
                  </p>
                </div>
                <Switch
                  checked={actions.sendToPipeline}
                  onCheckedChange={(checked) => handleActionChange('sendToPipeline', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Добавить теги</Label>
                  <p className="text-xs text-muted-foreground">
                    Присваивать теги для сегментации
                  </p>
                </div>
                <Switch
                  checked={actions.addTags}
                  onCheckedChange={(checked) => handleActionChange('addTags', checked)}
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
          <Icon name="Briefcase" size={20} className="text-primary" />
          CRM системы
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с CRM системами для автоматизации работы с лидами и контактами
        </p>
      </div>

      <Tabs defaultValue="russian" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="russian">Российские</TabsTrigger>
          <TabsTrigger value="international">Международные</TabsTrigger>
        </TabsList>

        <TabsContent value="russian" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'russian').map(provider => (
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
                        {provider.features.slice(0, 3).map((feature, idx) => (
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

        <TabsContent value="international" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'international').map(provider => (
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
                        {provider.features.slice(0, 3).map((feature, idx) => (
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

