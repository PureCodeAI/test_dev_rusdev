// Утилита для получения статистики доходов и расходов из выписок

import API_ENDPOINTS from '@/config/api';
import type { ParsedStatement } from './bankStatementParser';
import { logger } from './logger';

export interface IncomeExpenseStats {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactions: Array<{
    date: string;
    amount: number;
    type: 'income' | 'expense';
    counterparty: string;
    description: string;
  }>;
  byCategory: Record<string, { income: number; expense: number }>;
  byDate: Array<{ date: string; income: number; expense: number }>;
}

/**
 * Получает статистику доходов и расходов из загруженных выписок
 */
export const getBankStatementStats = async (
  period: 'today' | 'week' | 'month' | 'year' | 'custom' = 'month',
  startDate?: string,
  endDate?: string
): Promise<IncomeExpenseStats> => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      return getEmptyStats();
    }

    // Загружаем выписки
    const response = await fetch(API_ENDPOINTS.bankStatements, {
      headers: {
        'X-User-Id': userId,
      },
    });

    if (!response.ok) {
      return getEmptyStats();
    }

    const statements: unknown[] = await response.json();
    
    if (!statements || statements.length === 0) {
      return getEmptyStats();
    }

    // Преобразуем данные из БД в формат ParsedStatement
    const parsedStatements: ParsedStatement[] = statements.map((item: unknown) => {
      const typedItem = item as Record<string, unknown>;
      return {
        accountNumber: String(typedItem.account_number || ''),
        period: {
          start: String(typedItem.period_start || ''),
          end: String(typedItem.period_end || ''),
        },
        openingBalance: parseFloat(String(typedItem.opening_balance || 0)),
        closingBalance: parseFloat(String(typedItem.closing_balance || 0)),
        transactions: (Array.isArray(typedItem.transactions) ? typedItem.transactions : 
          (Array.isArray((typedItem.statement_data as Record<string, unknown>)?.transactions) 
            ? (typedItem.statement_data as Record<string, unknown>).transactions 
            : [])) as ParsedStatement['transactions'],
        totalIncome: parseFloat(String(typedItem.total_income || 0)),
        totalExpense: parseFloat(String(typedItem.total_expense || 0)),
        bankName: String(typedItem.bank_name || ''),
        creationDate: String(typedItem.created_at || ''),
      };
    });

    // Определяем период
    const now = new Date();
    let periodStart: Date;
    let periodEnd: Date = new Date(now);

    switch (period) {
      case 'today':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        periodStart = new Date(now);
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        periodStart = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        periodStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        periodEnd = endDate ? new Date(endDate) : new Date(now);
        break;
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Собираем все транзакции за период
    const allTransactions: Array<{
      date: string;
      amount: number;
      type: 'income' | 'expense';
      counterparty: string;
      description: string;
    }> = [];

    parsedStatements.forEach((statement) => {
      statement.transactions.forEach((tx) => {
        const txDate = new Date(tx.date);
        if (txDate >= periodStart && txDate <= periodEnd) {
          allTransactions.push({
            date: tx.date,
            amount: Math.abs(tx.amount),
            type: tx.type === 'income' ? 'income' : 'expense',
            counterparty: tx.counterparty || 'Неизвестно',
            description: tx.purpose || '',
          });
        }
      });
    });

    // Сортируем по дате
    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Вычисляем общие суммы
    const totalIncome = allTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = allTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Группируем по категориям (по контрагенту)
    const byCategory: Record<string, { income: number; expense: number }> = {};
    allTransactions.forEach((tx) => {
      const category = tx.counterparty;
      if (!byCategory[category]) {
        byCategory[category] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        byCategory[category].income += tx.amount;
      } else {
        byCategory[category].expense += tx.amount;
      }
    });

    // Группируем по датам
    const byDateMap: Record<string, { income: number; expense: number }> = {};
    allTransactions.forEach((tx) => {
      const dateKey = tx.date.split('T')[0];
      if (!byDateMap[dateKey]) {
        byDateMap[dateKey] = { income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        byDateMap[dateKey].income += tx.amount;
      } else {
        byDateMap[dateKey].expense += tx.amount;
      }
    });

    const byDate = Object.entries(byDateMap)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      transactions: allTransactions,
      byCategory,
      byDate,
    };
  } catch (error) {
    logger.error('Error getting bank statement stats', error instanceof Error ? error : new Error(String(error)), { period });
    return getEmptyStats();
  }
};

const getEmptyStats = (): IncomeExpenseStats => ({
  totalIncome: 0,
  totalExpense: 0,
  netProfit: 0,
  transactions: [],
  byCategory: {},
  byDate: [],
});


