import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { BalanceTab } from '@/components/settings/BalanceTab';
import { TariffTab } from '@/components/settings/TariffTab';
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/utils/logger';

const Settings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [autoImport, setAutoImport] = useState(true);
  const [sessions] = useState<Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>>([]);
  const [balance, setBalance] = useState<number>(0);
  const { user } = useAuth();
  const [currentTariff, setCurrentTariff] = useState<string>('Free');
  const userType = (user?.userType as 'entrepreneur' | 'freelancer') || 'entrepreneur';
  const [transactions, setTransactions] = useState<Array<{
    id: string;
    type: string;
    amount: number;
    description: string;
    date: string;
    status: string;
  }>>([]);
  const [banks, setBanks] = useState<Array<{
    id: string;
    name: string;
    connected: boolean;
    balance?: number;
  }>>([]);

  const load2FAStatus = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(`${API_ENDPOINTS.profile}?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.two_factor_enabled !== undefined) {
          setIs2FAEnabled(data.two_factor_enabled);
        }
        if (data.tariff !== undefined) {
          setCurrentTariff(data.tariff);
        }
      }
    } catch (error) {
      logger.error('Error loading 2FA status', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
    }
  }, [user?.id]);

  const loadBalance = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(`${API_ENDPOINTS.profile}?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.balance !== undefined) {
          setBalance(data.balance);
        }
      }
    } catch (error) {
      logger.error('Error loading balance', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
    }
  }, [user?.id]);

  const loadTransactions = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(`${API_ENDPOINTS.blocks}?type=transactions&action=list&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTransactions(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              id: String(typedItem.id || typedItem.transaction_id || ''),
              type: String(typedItem.type || typedItem.transaction_type || 'unknown'),
              amount: Number(typedItem.amount || 0),
              description: String(typedItem.description || typedItem.comment || ''),
              date: String(typedItem.created_at || typedItem.date || new Date().toISOString()),
              status: String(typedItem.status || 'completed')
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading transactions', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
      setTransactions([]);
    }
  }, [user?.id]);

  const loadBanks = useCallback(async () => {
    try {
      const userId = user?.id;
      if (!userId) return;

      const response = await fetch(`${API_ENDPOINTS.integrations}?type=bank&user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setBanks(data.map((item: unknown) => {
            const typedItem = item as Record<string, unknown>;
            return {
              id: String(typedItem.id || typedItem.bank_id || ''),
              name: String(typedItem.bank_name || typedItem.name || 'Банк'),
              connected: Boolean(typedItem.is_connected || typedItem.connected || false),
              balance: typedItem.balance !== undefined ? Number(typedItem.balance) : undefined
            };
          }));
        }
      }
    } catch (error) {
      logger.error('Error loading banks', error instanceof Error ? error : new Error(String(error)), { userId: user?.id });
      setBanks([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      load2FAStatus();
      loadBalance();
      loadTransactions();
      loadBanks();
    }
  }, [user?.id, load2FAStatus, loadBalance, loadTransactions, loadBanks]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Настройки</h1>
          <p className="text-muted-foreground">Управление профилем и параметрами аккаунта</p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="balance">Баланс</TabsTrigger>
            <TabsTrigger value="tariff">Тарифы</TabsTrigger>
            <TabsTrigger value="integrations">Интеграции</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
            {userType === 'freelancer' && <TabsTrigger value="withdrawal">Вывод средств</TabsTrigger>}
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="balance" className="space-y-6">
            <BalanceTab balance={balance} transactions={transactions.map(t => ({ id: t.id, date: t.date, type: t.type, amount: String(t.amount), status: t.status }))} />
          </TabsContent>

          <TabsContent value="tariff" className="space-y-6">
            <TariffTab currentTariff={currentTariff} />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsTab banks={banks.map(b => ({ id: b.id, name: b.name, connected: b.connected, balance: b.balance !== undefined ? String(b.balance) : null }))} autoImport={autoImport} setAutoImport={setAutoImport} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityTab is2FAEnabled={is2FAEnabled} setIs2FAEnabled={setIs2FAEnabled} sessions={sessions} />
          </TabsContent>

          {userType === 'freelancer' && (
            <TabsContent value="withdrawal" className="space-y-6">
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Раздел вывода средств доступен только для фрилансеров
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
