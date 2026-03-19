'use client';

import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { apiUrl } from '@/lib/api';
import { Transaction } from '@/types';
import TransactionItem from './TransactionItem';
import MonthlySummary from './MonthlySummary';

type Props = {
  month: string;
};

// SWR で Express API からデータ取得 (4-2 要件)
export default function TransactionList({ month }: Props) {
  const { data: transactions, error, isLoading } = useSWR<Transaction[]>(
    apiUrl(`/api/transactions?month=${month}`),
    fetcher
  );

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    // APIエラーをユーザーに表示 (4-3-3 要件)
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">データの取得に失敗しました</p>
        <p className="text-sm mt-1">{(error as Error).message}</p>
      </div>
    );
  }

  const list = transactions ?? [];

  return (
    <div>
      {/* 月次サマリー */}
      <MonthlySummary transactions={list} />

      {list.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">この月のデータはありません</p>
          <p className="text-sm mt-1">右上の「追加」から登録してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}
    </div>
  );
}
