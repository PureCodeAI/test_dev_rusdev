import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Icon from '@/components/ui/icon';
import { useToast } from '@/components/ui/use-toast';
import { parse1CStatement, mergeStatements, type ParsedStatement, type BankTransaction } from '@/utils/bankStatementParser';
import { decodeFile } from '@/utils/textEncoding';
import { StatementViewer } from './StatementViewer';
import API_ENDPOINTS from '@/config/api';

interface IntegrationsTabProps {
  banks: Array<{
    id: string;
    name: string;
    connected: boolean;
    balance: string | null;
  }>;
  autoImport: boolean;
  setAutoImport: (value: boolean) => void;
}

const bankIcons: Record<string, string> = {
  'СберБизнес': 'Building2',
  'АльфаБизнес': 'Building',
  'ТБизнес': 'Banknote',
};

export const IntegrationsTab = ({ autoImport, setAutoImport }: IntegrationsTabProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedStatements, setUploadedStatements] = useState<ParsedStatement[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Загружаем сохраненные выписки при монтировании компонента
  useEffect(() => {
    loadSavedStatements();
  }, []);
  
  const loadSavedStatements = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }
      
      const response = await fetch(API_ENDPOINTS.bankStatements, {
        headers: {
          'X-User-Id': userId,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Преобразуем данные из БД в формат ParsedStatement
          const statements: ParsedStatement[] = data.map((item: Record<string, unknown>) => ({
            accountNumber: String(item.account_number || ''),
            period: {
              start: String(item.period_start || ''),
              end: String(item.period_end || ''),
            },
            openingBalance: parseFloat(String(item.opening_balance || 0)),
            closingBalance: parseFloat(String(item.closing_balance || 0)),
            transactions: Array.isArray((item.statement_data as Record<string, unknown>)?.transactions) ? ((item.statement_data as Record<string, unknown>).transactions as unknown[]).map((t: unknown) => t as BankTransaction) : [],
            totalIncome: parseFloat(String(item.total_income || 0)),
            totalExpense: parseFloat(String(item.total_expense || 0)),
            bankName: String(item.bank_name || ''),
            creationDate: String(item.created_at || ''),
          }));
          setUploadedStatements(statements);
        }
      }
    } catch (error) {
      // Игнорируем ошибки загрузки - работаем с локальными данными
    }
  };

  const availableBanks = [
    { id: 'sber', name: 'СберБизнес', inDevelopment: true },
    { id: 'alpha', name: 'АльфаБизнес', inDevelopment: true },
    { id: 'tinkoff', name: 'ТБизнес', inDevelopment: true },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      toast({
        title: 'Ошибка',
        description: 'Поддерживаются только файлы в формате .txt',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      // Декодируем файл с правильной кодировкой
      let fileContent: string;
      try {
        fileContent = await decodeFile(file);
      } catch (decodeError) {
        // Если декодирование не удалось, пробуем просто прочитать как текст
        fileContent = await file.text();
      }
      
      // Проверяем, что файл содержит нужные ключевые слова
      const has1CFormat = fileContent.includes('1CClientBankExchange') || 
                         fileContent.includes('СекцияДокумент') ||
                         fileContent.includes('СекцияРасчСчет') ||
                         fileContent.includes('КонецДокумента');
      
      if (!has1CFormat) {
        toast({
          title: 'Ошибка',
          description: 'Файл не является выпиской в формате 1С. Проверьте формат файла.',
          variant: 'destructive',
        });
        return;
      }
      
      const parsed = parse1CStatement(fileContent);
      
      if (parsed.transactions.length === 0) {
        toast({
          title: 'Предупреждение',
          description: 'Не удалось найти операции в выписке. Проверьте формат файла.',
          variant: 'destructive',
        });
      } else {
        // Сохраняем на сервер
        await saveStatementToServer(parsed);
        
        // Объединяем с существующими выписками
        const merged = mergeStatements([...uploadedStatements, parsed]);
        setUploadedStatements([...uploadedStatements, parsed]);
        
        toast({
          title: 'Успешно',
          description: `Загружено операций: ${parsed.transactions.length}. Всего операций: ${merged.transactions.length}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: `Не удалось обработать выписку: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const saveStatementToServer = async (statement: ParsedStatement) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      
      const response = await fetch(API_ENDPOINTS.bankStatements, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          account_number: statement.accountNumber,
          bank_name: statement.bankName,
          period_start: statement.period.start,
          period_end: statement.period.end,
          opening_balance: statement.openingBalance,
          closing_balance: statement.closingBalance,
          statement_data: {
            transactions: statement.transactions,
            accountNumber: statement.accountNumber,
            period: statement.period,
            openingBalance: statement.openingBalance,
            closingBalance: statement.closingBalance,
            totalIncome: statement.totalIncome,
            totalExpense: statement.totalExpense,
            bankName: statement.bankName,
            creationDate: statement.creationDate,
          },
          transactions_count: statement.transactions.length,
          total_income: statement.totalIncome,
          total_expense: statement.totalExpense,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save statement');
      }
    } catch (error) {
      // Игнорируем ошибки сохранения - данные остаются в локальном состоянии
    }
  };
  
  const deleteStatement = async (index: number) => {
    const statement = uploadedStatements[index];
    
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        // Пытаемся найти ID выписки в БД (если она была сохранена)
        const response = await fetch(API_ENDPOINTS.bankStatements, {
          headers: {
            'X-User-Id': userId,
          },
        });
        
        if (response.ok) {
          const savedStatements = await response.json();
          const savedStatement = savedStatements.find((s: Record<string, unknown>) => 
            s.account_number === statement.accountNumber &&
            s.period_start === statement.period.start &&
            s.period_end === statement.period.end
          );
          
          if (savedStatement) {
            // Soft delete на сервере
            await fetch(`${API_ENDPOINTS.bankStatements}?id=${savedStatement.id}`, {
              method: 'DELETE',
              headers: {
                'X-User-Id': userId,
              },
            });
          }
        }
      }
    } catch (error) {
      // Игнорируем ошибки удаления
    }
    
    // Удаляем из локального состояния
    setUploadedStatements(uploadedStatements.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Банковские интеграции */}
      <Card>
        <CardHeader>
          <CardTitle>Банковские интеграции</CardTitle>
          <CardDescription>Подключите банковские счета для автоматического учета</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableBanks.map((bank) => (
            <div key={bank.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name={bankIcons[bank.name] || 'Building'} size={24} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{bank.name}</p>
                  {bank.inDevelopment && (
                    <p className="text-sm text-muted-foreground">В разработке</p>
                  )}
                </div>
              </div>
              {bank.inDevelopment ? (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  В разработке
                </Badge>
              ) : (
                <Button size="sm" disabled>Подключить</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Загрузка выписки */}
      <Card>
        <CardHeader>
          <CardTitle>Загрузка выписки</CardTitle>
          <CardDescription>
            Загрузите выписку в формате 1С (txt) для анализа операций
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Icon name="Info" className="h-4 w-4" />
            <AlertDescription>
              Рекомендуется загружать выписку не реже 1 раза в неделю для актуальности данных
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="statement-upload"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Icon name="Loader2" className="animate-spin" size={18} />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={18} />
                    Загрузить выписку (.txt)
                  </>
                )}
              </Button>
              {uploadedStatements.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedStatements([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Очистить все ({uploadedStatements.length})
                </Button>
              )}
            </div>

            {/* Список загруженных выписок */}
            {uploadedStatements.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Загруженные выписки:
                </div>
                <div className="space-y-2">
                  {uploadedStatements.map((statement, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="FileText" size={18} className="text-primary" />
                        <div>
                          <div className="font-medium text-sm">
                            {statement.bankName || 'Банк не указан'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {statement.accountNumber} • {statement.transactions.length} операций • 
                            {new Date(statement.period.start).toLocaleDateString('ru-RU')} - {new Date(statement.period.end).toLocaleDateString('ru-RU')}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteStatement(index)}
                      >
                        <Icon name="X" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {uploadedStatements.length > 0 && (
            <div className="mt-6">
              <StatementViewer statement={mergeStatements(uploadedStatements)} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Автоматический импорт (для будущего использования) */}
      <Card>
        <CardHeader>
          <CardTitle>Автоматический импорт</CardTitle>
          <CardDescription>Настройки автоматического обновления данных</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Icon name="Download" size={18} className="text-primary" />
              <div>
                <p className="font-medium">Автоматический импорт выписок</p>
                <p className="text-sm text-muted-foreground">Ежедневное обновление транзакций</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Доступно после подключения банковских интеграций
                </p>
              </div>
            </div>
            <Switch checked={autoImport} onCheckedChange={setAutoImport} disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
