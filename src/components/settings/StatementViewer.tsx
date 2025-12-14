import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import type { ParsedStatement } from '@/utils/bankStatementParser';
import { filterTransactionsByPeriod } from '@/utils/bankStatementParser';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StatementViewerProps {
  statement: ParsedStatement;
}

export const StatementViewer = ({ statement }: StatementViewerProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'lastQuarter' | 'previousQuarter' | 'year' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    let filtered = filterTransactionsByPeriod(
      statement.transactions,
      selectedPeriod,
      customStart || undefined,
      customEnd || undefined
    );

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.counterparty.toLowerCase().includes(query) ||
          t.purpose.toLowerCase().includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    return filtered;
  }, [statement.transactions, selectedPeriod, customStart, customEnd, searchQuery]);

  const filteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Информация о выписке */}
      {statement.bankName && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Банк</div>
                <div className="font-semibold">{statement.bankName}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Счет</div>
                <div className="font-mono text-sm">{statement.accountNumber}</div>
              </div>
              {statement.creationDate && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Дата создания</div>
                  <div className="text-sm">{formatDate(statement.creationDate)}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сводка */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Начальный остаток</div>
            <div className="text-2xl font-bold">{formatAmount(statement.openingBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Конечный остаток</div>
            <div className="text-2xl font-bold">{formatAmount(statement.closingBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Доходы</div>
            <div className="text-2xl font-bold text-green-600">{formatAmount(filteredIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Расходы</div>
            <div className="text-2xl font-bold text-red-600">{formatAmount(filteredExpense)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader>
          <CardTitle>Фильтры</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Период</Label>
              <Select value={selectedPeriod} onValueChange={(value: string) => {
                if (['week', 'month', 'quarter', 'lastQuarter', 'previousQuarter', 'year', 'custom'].includes(value)) {
                  setSelectedPeriod(value as typeof selectedPeriod);
                }
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Неделя</SelectItem>
                  <SelectItem value="month">Месяц</SelectItem>
                  <SelectItem value="quarter">Квартал</SelectItem>
                  <SelectItem value="lastQuarter">Последний квартал</SelectItem>
                  <SelectItem value="previousQuarter">Предыдущий квартал</SelectItem>
                  <SelectItem value="year">Год</SelectItem>
                  <SelectItem value="custom">Произвольный период</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPeriod === 'custom' && (
              <>
                <div>
                  <Label>С</Label>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                  />
                </div>
                <div>
                  <Label>По</Label>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <Label>Поиск</Label>
              <Input
                placeholder="Контрагент, назначение..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Операции */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Операции</CardTitle>
              <CardDescription>
                Найдено операций: {filteredTransactions.length} из {statement.transactions.length}
              </CardDescription>
            </div>
            <Badge variant="outline">
              Период: {formatDate(statement.period.start)} - {formatDate(statement.period.end)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="FileX" size={48} className="mx-auto mb-4 opacity-50" />
              <p>Операции не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Номер</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>Сумма</TableHead>
                    <TableHead>Контрагент</TableHead>
                    <TableHead>Назначение платежа</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction, index) => (
                    <TableRow key={transaction.id || `transaction_${index}`}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.documentNumber || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={transaction.type === 'income' ? 'default' : 'destructive'}
                          className={transaction.type === 'income' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {transaction.type === 'income' ? 'Доход' : 'Расход'}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={transaction.counterparty}>
                          {transaction.counterparty}
                        </div>
                        {transaction.payerINN && (
                          <div className="text-xs text-muted-foreground">ИНН: {transaction.payerINN}</div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={transaction.purpose}>
                          {transaction.purpose}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

