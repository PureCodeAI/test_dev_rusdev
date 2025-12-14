import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  provider: string;
  paymentMethod: string;
  customerEmail: string;
  createdAt: string;
  description?: string;
}

interface TransactionHistoryProps {
  projectId?: number;
  onRefund?: (transactionId: string) => void;
}

export const TransactionHistory = ({ projectId, onRefund }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<{
    status: string;
    provider: string;
    search: string;
  }>({
    status: 'all',
    provider: 'all',
    search: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [projectId, filter]);

  const loadTransactions = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.append('status', filter.status);
      if (filter.provider !== 'all') params.append('provider', filter.provider);
      if (filter.search) params.append('search', filter.search);

      const response = await fetch(`/api/projects/${projectId}/transactions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const variants = {
      pending: { variant: 'secondary' as const, label: 'Ожидание', icon: 'Clock' },
      completed: { variant: 'default' as const, label: 'Оплачено', icon: 'CheckCircle' },
      failed: { variant: 'destructive' as const, label: 'Ошибка', icon: 'XCircle' },
      refunded: { variant: 'outline' as const, label: 'Возврат', icon: 'RotateCcw' }
    };
    const config = variants[status];
    return (
      <Badge variant={config.variant}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      RUB: '₽',
      USD: '$',
      EUR: '€',
      GBP: '£',
      CNY: '¥',
      KZT: '₸'
    };
    return `${amount.toLocaleString('ru-RU')} ${symbols[currency] || currency}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter.status !== 'all' && t.status !== filter.status) return false;
    if (filter.provider !== 'all' && t.provider !== filter.provider) return false;
    if (filter.search && !t.customerEmail.toLowerCase().includes(filter.search.toLowerCase()) && 
        !t.id.toLowerCase().includes(filter.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Icon name="History" size={20} className="text-primary" />
          История транзакций
        </h3>
        <p className="text-sm text-muted-foreground">
          Просмотр и управление платежами
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <Input
            placeholder="Поиск по email или ID транзакции..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="flex-1"
          />
          <Select
            value={filter.status}
            onValueChange={(value) => setFilter({ ...filter, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="pending">Ожидание</SelectItem>
              <SelectItem value="completed">Оплачено</SelectItem>
              <SelectItem value="failed">Ошибка</SelectItem>
              <SelectItem value="refunded">Возврат</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filter.provider}
            onValueChange={(value) => setFilter({ ...filter, provider: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все провайдеры</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="yookassa">ЮKassa</SelectItem>
              <SelectItem value="cloudpayments">CloudPayments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-[500px]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Icon name="Inbox" size={48} className="mb-4 opacity-50" />
              <p>Транзакции не найдены</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map(transaction => (
                <Card key={transaction.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="font-semibold">
                          {formatAmount(transaction.amount, transaction.currency)}
                        </div>
                        {getStatusBadge(transaction.status)}
                        <Badge variant="outline">{transaction.provider}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size={14} />
                          <span>{transaction.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="CreditCard" size={14} />
                          <span>{transaction.paymentMethod}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={14} />
                          <span>{formatDate(transaction.createdAt)}</span>
                        </div>
                        {transaction.description && (
                          <div className="flex items-center gap-2">
                            <Icon name="FileText" size={14} />
                            <span>{transaction.description}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {transaction.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRefund && onRefund(transaction.id)}
                        >
                          <Icon name="RotateCcw" size={14} className="mr-2" />
                          Возврат
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Icon name="ExternalLink" size={14} className="mr-2" />
                        Детали
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

