import { Transaction } from '@/types';

type Props = {
  transactions: Transaction[];
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);

// 月次サマリーコンポーネント: 収入・支出合計と差引残高を算出 (3-1 要件)
export default function MonthlySummary({ transactions }: Props) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-sm text-green-600 font-medium mb-1">収入合計</p>
        <p className="text-xl font-bold text-green-700">{formatAmount(totalIncome)}</p>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-sm text-red-600 font-medium mb-1">支出合計</p>
        <p className="text-xl font-bold text-red-700">{formatAmount(totalExpense)}</p>
      </div>

      <div
        className={`border rounded-lg p-4 text-center ${
          balance >= 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <p
          className={`text-sm font-medium mb-1 ${
            balance >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}
        >
          差引残高
        </p>
        <p
          className={`text-xl font-bold ${
            balance >= 0 ? 'text-blue-700' : 'text-orange-700'
          }`}
        >
          {formatAmount(balance)}
        </p>
      </div>
    </div>
  );
}
