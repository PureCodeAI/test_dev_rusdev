import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface BalanceTabProps {
  balance: number;
  transactions: Array<{
    id: string;
    date: string;
    type: string;
    amount: string;
    status: string;
  }>;
}

export const BalanceTab = ({ balance, transactions }: BalanceTabProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Icon name="Wallet" size={24} className="text-primary" />
            </div>
            <div className="text-3xl font-bold mb-1">{balance.toLocaleString()} ₽</div>
            <div className="text-sm text-muted-foreground">Текущий баланс</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Icon name="TrendingUp" size={24} className="text-green-500" />
            </div>
            <div className="text-3xl font-bold mb-1">₽0</div>
            <div className="text-sm text-muted-foreground">Пополнено за месяц</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Icon name="TrendingDown" size={24} className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold mb-1">₽0</div>
            <div className="text-sm text-muted-foreground">Расходы за месяц</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>История транзакций</CardTitle>
              <CardDescription>Последние операции с балансом</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" className="mr-2" size={16} />
                  Пополнить баланс
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Пополнить баланс</DialogTitle>
                  <DialogDescription>Выберите способ оплаты и введите сумму</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Сумма пополнения</Label>
                    <Input type="number" placeholder="5000" />
                  </div>
                  <div className="space-y-2">
                    <Label>Способ оплаты</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="p-4 border-2 border-primary rounded-lg hover:bg-primary/5 transition-colors">
                        <Icon name="CreditCard" size={24} className="mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">Банковская карта</p>
                      </button>
                      <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                        <Icon name="Building" size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">ТБанк</p>
                      </button>
                      <button className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors col-span-2">
                        <Icon name="Bitcoin" size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Криптовалюта (USDT, BTC, ETH)</p>
                      </button>
                    </div>
                  </div>
                  <Button className="w-full">Пополнить</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.amount.startsWith('+') ? 'bg-green-100' : 'bg-orange-100'
                  }`}>
                    <Icon
                      name={tx.amount.startsWith('+') ? 'ArrowDownLeft' : 'ArrowUpRight'}
                      size={18}
                      className={tx.amount.startsWith('+') ? 'text-green-600' : 'text-orange-600'}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{tx.type}</p>
                    <p className="text-sm text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    tx.amount.startsWith('+') ? 'text-green-600' : 'text-orange-600'
                  }`}>{tx.amount} ₽</p>
                  <Badge className="bg-green-100 text-green-700">Завершено</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
