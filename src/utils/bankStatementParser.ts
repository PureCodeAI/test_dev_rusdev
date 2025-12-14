// Парсер выписок банка в формате 1С (txt)

export interface BankTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  counterparty: string;
  purpose: string;
  documentNumber?: string;
  accountNumber?: string;
  payer?: string;
  payerINN?: string;
  recipient?: string;
  recipientINN?: string;
}

export interface ParsedStatement {
  accountNumber: string;
  period: {
    start: string;
    end: string;
  };
  openingBalance: number;
  closingBalance: number;
  transactions: BankTransaction[];
  totalIncome: number;
  totalExpense: number;
  bankName?: string;
  creationDate?: string;
}

export const parse1CStatement = (fileContent: string): ParsedStatement => {
  const lines = fileContent.split('\n').map(line => line.trim());
  
  let accountNumber = '';
  let periodStart = '';
  let periodEnd = '';
  let openingBalance = 0;
  let closingBalance = 0;
  let bankName = '';
  let creationDate = '';
  const transactions: BankTransaction[] = [];
  
  let transactionId = 1;
  let currentSection: 'header' | 'account' | 'document' | null = null;
  let currentDocument: Partial<BankTransaction> = {};
  let userAccountNumber = '';
  
  // Парсинг структурированного формата 1С
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Определение секций
    if (line.startsWith('1CClientBankExchange')) {
      currentSection = 'header';
      continue;
    }
    
    if (line.startsWith('СекцияРасчСчет')) {
      currentSection = 'account';
      continue;
    }
    
    if (line.startsWith('КонецРасчСчет')) {
      currentSection = null;
      continue;
    }
    
    if (line.startsWith('СекцияДокумент=')) {
      // Сохраняем предыдущий документ если есть
      if (currentDocument.date && currentDocument.amount) {
        transactions.push({
          id: `transaction_${transactionId++}`,
          date: currentDocument.date,
          amount: currentDocument.amount,
          type: currentDocument.type || 'expense',
          counterparty: currentDocument.counterparty || 'Не указано',
          purpose: currentDocument.purpose || 'Не указано',
          documentNumber: currentDocument.documentNumber,
          payer: currentDocument.payer,
          payerINN: currentDocument.payerINN,
          recipient: currentDocument.recipient,
          recipientINN: currentDocument.recipientINN,
        });
      }
      
      currentSection = 'document';
      currentDocument = {};
      continue;
    }
    
    if (line.startsWith('КонецДокумента')) {
      // Сохраняем документ
      if (currentDocument.date && currentDocument.amount) {
        transactions.push({
          id: `transaction_${transactionId++}`,
          date: currentDocument.date,
          amount: currentDocument.amount,
          type: currentDocument.type || 'expense',
          counterparty: currentDocument.counterparty || 'Не указано',
          purpose: currentDocument.purpose || 'Не указано',
          documentNumber: currentDocument.documentNumber,
          payer: currentDocument.payer,
          payerINN: currentDocument.payerINN,
          recipient: currentDocument.recipient,
          recipientINN: currentDocument.recipientINN,
        });
      }
      currentDocument = {};
      currentSection = null;
      continue;
    }
    
    if (line.startsWith('КонецФайла')) {
      break;
    }
    
    // Парсинг полей формата Ключ=Значение
    const equalIndex = line.indexOf('=');
    if (equalIndex === -1) continue;
    
    const key = line.substring(0, equalIndex).trim();
    const value = line.substring(equalIndex + 1).trim();
    
    // Заголовок файла
    if (currentSection === 'header') {
      if (key === 'РасчСчет') {
        accountNumber = value;
        userAccountNumber = value;
      }
      if (key === 'ДатаНачала') {
        periodStart = normalizeDate(value);
      }
      if (key === 'ДатаКонца') {
        periodEnd = normalizeDate(value);
      }
      if (key === 'Отправитель') {
        bankName = value;
      }
      if (key === 'ДатаСоздания') {
        creationDate = value;
      }
    }
    
    // Секция расчетного счета
    if (currentSection === 'account') {
      if (key === 'РасчСчет' && !accountNumber) {
        accountNumber = value;
        userAccountNumber = value;
      }
      if (key === 'ДатаНачала' && !periodStart) {
        periodStart = normalizeDate(value);
      }
      if (key === 'ДатаКонца' && !periodEnd) {
        periodEnd = normalizeDate(value);
      }
      if (key === 'НачальныйОстаток') {
        const balance = parseFloat(value.replace(',', '.'));
        if (openingBalance === 0 || i < 50) { // Берем первый остаток
          openingBalance = balance;
        }
      }
      if (key === 'КонечныйОстаток') {
        closingBalance = parseFloat(value.replace(',', '.'));
      }
    }
    
    // Секция документа
    if (currentSection === 'document') {
      if (key === 'Номер') {
        currentDocument.documentNumber = value;
      }
      if (key === 'Дата') {
        currentDocument.date = normalizeDate(value);
      }
      if (key === 'Сумма') {
        currentDocument.amount = parseFloat(value.replace(',', '.').replace(/\s/g, ''));
      }
      if (key === 'Плательщик') {
        currentDocument.payer = value;
      }
      if (key === 'ПлательщикИНН') {
        currentDocument.payerINN = value;
      }
      if (key === 'Получатель') {
        currentDocument.recipient = value;
      }
      if (key === 'ПолучательИНН') {
        currentDocument.recipientINN = value;
      }
      if (key === 'ПлательщикСчет') {
        // Если счет плательщика совпадает с нашим - это расход
        if (value === userAccountNumber) {
          currentDocument.type = 'expense';
          currentDocument.accountNumber = value;
          // Контрагент - получатель
          if (!currentDocument.counterparty && currentDocument.recipient) {
            currentDocument.counterparty = currentDocument.recipient;
          }
        }
      }
      if (key === 'ПолучательСчет') {
        // Если счет получателя совпадает с нашим - это доход
        if (value === userAccountNumber) {
          currentDocument.type = 'income';
          currentDocument.accountNumber = value;
          // Контрагент - плательщик
          if (!currentDocument.counterparty && currentDocument.payer) {
            currentDocument.counterparty = currentDocument.payer;
          }
        }
      }
      if (key === 'ДатаСписано') {
        if (value && value.trim()) {
          currentDocument.type = 'expense';
          // Контрагент - получатель
          if (!currentDocument.counterparty && currentDocument.recipient) {
            currentDocument.counterparty = currentDocument.recipient;
          }
        }
      }
      if (key === 'ДатаПоступило') {
        if (value && value.trim()) {
          currentDocument.type = 'income';
          // Контрагент - плательщик
          if (!currentDocument.counterparty && currentDocument.payer) {
            currentDocument.counterparty = currentDocument.payer;
          }
        }
      }
      if (key === 'НазначениеПлатежа') {
        currentDocument.purpose = value;
      }
      
      // Определяем контрагента на основе типа операции (fallback)
      if (!currentDocument.counterparty) {
        if (currentDocument.type === 'income' && currentDocument.payer) {
          currentDocument.counterparty = currentDocument.payer;
        } else if (currentDocument.type === 'expense' && currentDocument.recipient) {
          currentDocument.counterparty = currentDocument.recipient;
        } else if (currentDocument.payer) {
          currentDocument.counterparty = currentDocument.payer;
        } else if (currentDocument.recipient) {
          currentDocument.counterparty = currentDocument.recipient;
        }
      }
    }
  }
  
  // Сохраняем последний документ если есть
  if (currentDocument.date && currentDocument.amount) {
    transactions.push({
      id: `transaction_${transactionId++}`,
      date: currentDocument.date,
      amount: currentDocument.amount,
      type: currentDocument.type || 'expense',
      counterparty: currentDocument.counterparty || 'Не указано',
      purpose: currentDocument.purpose || 'Не указано',
      documentNumber: currentDocument.documentNumber,
      payer: currentDocument.payer,
      payerINN: currentDocument.payerINN,
      recipient: currentDocument.recipient,
      recipientINN: currentDocument.recipientINN,
    });
  }
  
  // Сортируем транзакции по дате
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return {
    accountNumber: accountNumber || 'Не указан',
    period: {
      start: periodStart || new Date().toISOString().split('T')[0],
      end: periodEnd || new Date().toISOString().split('T')[0],
    },
    openingBalance,
    closingBalance,
    transactions,
    totalIncome,
    totalExpense,
    bankName: bankName || undefined,
    creationDate: creationDate || undefined,
  };
};

const normalizeDate = (dateStr: string): string => {
  // Преобразует дату из формата DD.MM.YYYY или DD/MM/YYYY в YYYY-MM-DD
  const normalized = dateStr.replace(/\//g, '.');
  const parts = normalized.split('.');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

/**
 * Объединяет несколько выписок в одну
 */
export const mergeStatements = (statements: ParsedStatement[]): ParsedStatement => {
  if (statements.length === 0) {
    throw new Error('Нет выписок для объединения');
  }

  if (statements.length === 1) {
    return statements[0];
  }

  // Объединяем все транзакции
  const allTransactions = statements.flatMap(s => s.transactions);
  
  // Удаляем дубликаты по дате, сумме и контрагенту
  const uniqueTransactions = allTransactions.filter((transaction, index, self) => {
    return index === self.findIndex(t => 
      t.date === transaction.date &&
      t.amount === transaction.amount &&
      t.counterparty === transaction.counterparty &&
      t.documentNumber === transaction.documentNumber
    );
  });

  // Сортируем по дате
  uniqueTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Находим самый ранний период и самый поздний
  const allPeriods = statements.map(s => ({
    start: new Date(s.period.start),
    end: new Date(s.period.end),
  }));

  const earliestStart = new Date(Math.min(...allPeriods.map(p => p.start.getTime())));
  const latestEnd = new Date(Math.max(...allPeriods.map(p => p.end.getTime())));

  // Находим начальный остаток (самый ранний) и конечный остаток (самый поздний)
  const earliestStatement = statements.find(s => 
    new Date(s.period.start).getTime() === earliestStart.getTime()
  );
  const latestStatement = statements.find(s => 
    new Date(s.period.end).getTime() === latestEnd.getTime()
  );

  const openingBalance = earliestStatement?.openingBalance || 0;
  const closingBalance = latestStatement?.closingBalance || 0;

  // Объединяем названия банков
  const bankNames = [...new Set(statements.map(s => s.bankName).filter(Boolean))];
  const bankName = bankNames.length > 0 
    ? (bankNames.length === 1 ? bankNames[0] : `${bankNames.length} банков`)
    : undefined;

  // Объединяем номера счетов
  const accountNumbers = [...new Set(statements.map(s => s.accountNumber).filter(Boolean))];
  const accountNumber = accountNumbers.length > 0
    ? (accountNumbers.length === 1 ? accountNumbers[0] : `${accountNumbers.length} счетов`)
    : 'Не указан';

  // Считаем общие суммы
  const totalIncome = uniqueTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = uniqueTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    accountNumber,
    period: {
      start: earliestStart.toISOString().split('T')[0],
      end: latestEnd.toISOString().split('T')[0],
    },
    openingBalance,
    closingBalance,
    transactions: uniqueTransactions,
    totalIncome,
    totalExpense,
    bankName,
    creationDate: latestStatement?.creationDate,
  };
};

export const filterTransactionsByPeriod = (
  transactions: BankTransaction[],
  period: 'week' | 'month' | 'quarter' | 'lastQuarter' | 'previousQuarter' | 'year' | 'custom',
  customStart?: string,
  customEnd?: string
): BankTransaction[] => {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = new Date(now);
  
  switch (period) {
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    }
    case 'lastQuarter': {
      const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
      if (lastQuarter < 0) {
        startDate = new Date(now.getFullYear() - 1, 9, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
      } else {
        startDate = new Date(now.getFullYear(), lastQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
      }
      break;
    }
    case 'previousQuarter': {
      const prevQuarter = Math.floor(now.getMonth() / 3) - 2;
      if (prevQuarter < 0) {
        startDate = new Date(now.getFullYear() - 1, (prevQuarter + 4) * 3, 1);
        endDate = new Date(now.getFullYear() - 1, (prevQuarter + 5) * 3, 0);
      } else {
        startDate = new Date(now.getFullYear(), prevQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (prevQuarter + 1) * 3, 0);
      }
      break;
    }
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      } else {
        return transactions;
      }
      break;
    default:
      return transactions;
  }
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

