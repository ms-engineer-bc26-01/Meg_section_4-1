export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: number; // PostgreSQL autoincrement
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
  type: TransactionType;
};

export type TransactionFormData = Omit<Transaction, 'id'>;
