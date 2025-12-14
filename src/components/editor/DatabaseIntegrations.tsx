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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface DatabaseProvider {
  id: string;
  name: string;
  category: 'sql' | 'nosql' | 'cloud';
  icon: string;
  description: string;
  features: string[];
  isConfigured: boolean;
  config: Record<string, unknown>;
}

interface DatabaseIntegrationsProps {
  blockId?: number;
  onIntegrationChange?: (provider: string, config: Record<string, unknown>) => void;
}

const DATABASE_PROVIDERS: DatabaseProvider[] = [
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'sql',
    icon: 'Database',
    description: 'Реляционная БД',
    features: ['SQL', 'ACID', 'JSON', 'Расширяемость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'mysql',
    name: 'MySQL/MariaDB',
    category: 'sql',
    icon: 'Database',
    description: 'Популярная SQL БД',
    features: ['SQL', 'ACID', 'Высокая производительность'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'sqlserver',
    name: 'SQL Server',
    category: 'sql',
    icon: 'Database',
    description: 'Microsoft SQL Server',
    features: ['SQL', 'ACID', 'Интеграция с Microsoft'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    category: 'sql',
    icon: 'Database',
    description: 'Легковесная БД',
    features: ['SQL', 'Файловая БД', 'Встраиваемая'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'nosql',
    icon: 'Database',
    description: 'Документная БД',
    features: ['NoSQL', 'Документы', 'Горизонтальное масштабирование'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'firebase',
    name: 'Firebase Firestore',
    category: 'nosql',
    icon: 'Database',
    description: 'Облачная NoSQL',
    features: ['NoSQL', 'Облако', 'Real-time'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'nosql',
    icon: 'Database',
    description: 'Кэш и хранилище ключ-значение',
    features: ['Ключ-значение', 'Кэш', 'Высокая скорость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'dynamodb',
    name: 'DynamoDB',
    category: 'nosql',
    icon: 'Database',
    description: 'AWS NoSQL БД',
    features: ['NoSQL', 'AWS', 'Масштабируемость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'cloud',
    icon: 'Cloud',
    description: 'PostgreSQL в облаке',
    features: ['PostgreSQL', 'Облако', 'Real-time', 'Auth'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    category: 'cloud',
    icon: 'Cloud',
    description: 'MySQL в облаке',
    features: ['MySQL', 'Облако', 'Масштабируемость'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'cloud',
    icon: 'Table',
    description: 'Таблицы как БД',
    features: ['Таблицы', 'API', 'Коллаборация'],
    isConfigured: false,
    config: {}
  },
  {
    id: 'googlesheets',
    name: 'Google Sheets',
    category: 'cloud',
    icon: 'Table',
    description: 'Как БД через API',
    features: ['Таблицы', 'API', 'Интеграция'],
    isConfigured: false,
    config: {}
  }
];

export const DatabaseIntegrations = ({ blockId, onIntegrationChange }: DatabaseIntegrationsProps) => {
  const { toast } = useToast();
  const [providers, setProviders] = useState<DatabaseProvider[]>(DATABASE_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider | null>(null);
  const [config, setConfig] = useState<Record<string, unknown>>({});
  const [operations, setOperations] = useState<{
    read: boolean;
    write: boolean;
    update: boolean;
    delete: boolean;
    sync: boolean;
  }>({
    read: true,
    write: true,
    update: false,
    delete: false,
    sync: false
  });
  const [query, setQuery] = useState<string>('');

  const handleProviderSelect = (provider: DatabaseProvider) => {
    setSelectedProvider(provider);
    setConfig(provider.config || {});
    setOperations(provider.config?.operations as typeof operations || {
      read: true,
      write: true,
      update: false,
      delete: false,
      sync: false
    });
    setQuery(provider.config?.query as string || '');
  };

  const handleConfigChange = (key: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleOperationChange = (operation: keyof typeof operations, value: boolean) => {
    setOperations(prev => ({ ...prev, [operation]: value }));
    setConfig(prev => ({ ...prev, operations: { ...operations, [operation]: value } }));
  };

  const handleSave = () => {
    if (!selectedProvider) return;

    const finalConfig = {
      ...config,
      operations,
      query
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
      case 'postgresql':
      case 'mysql':
      case 'sqlserver':
        return [
          { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
          { key: 'port', label: 'Port', type: 'text', required: true, placeholder: providerId === 'postgresql' ? '5432' : providerId === 'mysql' ? '3306' : '1433' },
          { key: 'database', label: 'Database', type: 'text', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'ssl', label: 'SSL', type: 'switch', required: false }
        ];
      case 'sqlite':
        return [
          { key: 'filePath', label: 'Путь к файлу', type: 'text', required: true, placeholder: '/path/to/database.db' }
        ];
      case 'mongodb':
        return [
          { key: 'connectionString', label: 'Connection String', type: 'text', required: true, placeholder: 'mongodb://localhost:27017' },
          { key: 'database', label: 'Database', type: 'text', required: true }
        ];
      case 'firebase':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'projectId', label: 'Project ID', type: 'text', required: true },
          { key: 'authDomain', label: 'Auth Domain', type: 'text', required: true }
        ];
      case 'redis':
        return [
          { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
          { key: 'port', label: 'Port', type: 'text', required: true, placeholder: '6379' },
          { key: 'password', label: 'Password', type: 'password', required: false }
        ];
      case 'dynamodb':
        return [
          { key: 'region', label: 'Region', type: 'text', required: true, placeholder: 'us-east-1' },
          { key: 'accessKeyId', label: 'Access Key ID', type: 'text', required: true },
          { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password', required: true }
        ];
      case 'supabase':
        return [
          { key: 'url', label: 'Supabase URL', type: 'text', required: true, placeholder: 'https://xxx.supabase.co' },
          { key: 'anonKey', label: 'Anon Key', type: 'text', required: true },
          { key: 'serviceKey', label: 'Service Key', type: 'password', required: false }
        ];
      case 'planetscale':
        return [
          { key: 'host', label: 'Host', type: 'text', required: true },
          { key: 'username', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'database', label: 'Database', type: 'text', required: true }
        ];
      case 'airtable':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password', required: true },
          { key: 'baseId', label: 'Base ID', type: 'text', required: true }
        ];
      case 'googlesheets':
        return [
          { key: 'apiKey', label: 'API Key', type: 'text', required: true },
          { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', required: true },
          { key: 'sheetName', label: 'Sheet Name', type: 'text', required: true }
        ];
      default:
        return [
          { key: 'connectionString', label: 'Connection String', type: 'text', required: true }
        ];
    }
  };

  const renderConfigForm = () => {
    if (!selectedProvider) return null;

    const fields = getConfigFields(selectedProvider.id);
    const isSQL = selectedProvider.category === 'sql';
    const isNoSQL = selectedProvider.category === 'nosql';
    const isCloud = selectedProvider.category === 'cloud';

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
              ) : field.type === 'switch' ? (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={(config[field.key] as boolean) || false}
                    onCheckedChange={(checked) => handleConfigChange(field.key, checked)}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {field.label}
                  </Label>
                </div>
              ) : null}
            </div>
          ))}

          <Separator />

          <div>
            <Label className="mb-3 block font-semibold">Разрешенные операции</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Чтение (Read)</Label>
                  <p className="text-xs text-muted-foreground">
                    Разрешить чтение данных из БД
                  </p>
                </div>
                <Switch
                  checked={operations.read}
                  onCheckedChange={(checked) => handleOperationChange('read', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Запись (Write)</Label>
                  <p className="text-xs text-muted-foreground">
                    Разрешить запись данных в БД
                  </p>
                </div>
                <Switch
                  checked={operations.write}
                  onCheckedChange={(checked) => handleOperationChange('write', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Обновление (Update)</Label>
                  <p className="text-xs text-muted-foreground">
                    Разрешить обновление существующих записей
                  </p>
                </div>
                <Switch
                  checked={operations.update}
                  onCheckedChange={(checked) => handleOperationChange('update', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Удаление (Delete)</Label>
                  <p className="text-xs text-muted-foreground">
                    Разрешить удаление записей из БД
                  </p>
                </div>
                <Switch
                  checked={operations.delete}
                  onCheckedChange={(checked) => handleOperationChange('delete', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Синхронизация</Label>
                  <p className="text-xs text-muted-foreground">
                    Автоматическая синхронизация данных
                  </p>
                </div>
                <Switch
                  checked={operations.sync}
                  onCheckedChange={(checked) => handleOperationChange('sync', checked)}
                />
              </div>
            </div>
          </div>

          {(isSQL || isNoSQL) && (
            <>
              <Separator />
              <div>
                <Label className="mb-2 block font-semibold">
                  {isSQL ? 'SQL запрос' : 'NoSQL запрос'}
                </Label>
                <Textarea
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setConfig(prev => ({ ...prev, query: e.target.value }));
                  }}
                  placeholder={isSQL ? 'SELECT * FROM table_name WHERE condition' : 'db.collection.find({ field: value })'}
                  className="font-mono text-sm"
                  rows={6}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {isSQL 
                    ? 'Введите SQL запрос для выполнения (опционально)'
                    : 'Введите NoSQL запрос для выполнения (опционально)'}
                </p>
              </div>
            </>
          )}
        </div>

        <Separator className="my-4" />

        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Icon name="Save" size={16} className="mr-2" />
            Сохранить
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <Icon name="TestTube" size={16} className="mr-2" />
            Тест подключения
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="Database" size={20} className="text-primary" />
          Базы данных
        </h3>
        <p className="text-sm text-muted-foreground">
          Настройте интеграции с базами данных для хранения и обработки данных
        </p>
      </div>

      <Tabs defaultValue="sql" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sql">SQL</TabsTrigger>
          <TabsTrigger value="nosql">NoSQL</TabsTrigger>
          <TabsTrigger value="cloud">Облачные</TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'sql').map(provider => (
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

        <TabsContent value="nosql" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'nosql').map(provider => (
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

        <TabsContent value="cloud" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.filter(p => p.category === 'cloud').map(provider => (
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

