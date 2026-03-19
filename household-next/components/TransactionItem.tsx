import Link from 'next/link';
import { Transaction } from '@/types';

type Props = {
  transaction: Transaction;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);

// 入出金一覧の1行コンポーネント (props で再利用可能に) (3-1 要件)
export default function TransactionItem({ transaction }: Props) {
  return (
    <Link href={`/transactions/${transaction.id}`}>
      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className={`w-1.5 h-12 rounded-full flex-shrink-0 ${
              transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          <div>
            <p className="font-medium text-gray-800">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {transaction.date} &middot; {transaction.category}
            </p>
          </div>
        </div>

        <div className="text-right flex-shrink-0 ml-4">
          <p
            className={`font-bold text-lg ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatAmount(transaction.amount)}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              transaction.type === 'income'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {transaction.type === 'income' ? '収入' : '支出'}
          </span>
        </div>
      </div>
    </Link>
  );
}
