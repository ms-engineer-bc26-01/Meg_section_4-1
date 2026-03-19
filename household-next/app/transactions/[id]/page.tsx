'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { apiUrl } from '@/lib/api';
import { Transaction, TransactionFormData } from '@/types';
import TransactionForm from '@/components/TransactionForm';

type Props = {
  params: { id: string };
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);

// 詳細ページ: SWR でデータ取得, useState で編集モード切替 (4-2 要件)
export default function TransactionDetailPage({ params }: Props) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  // SWR で Express API からデータ取得 (4-2 要件)
  const { data: transaction, error, isLoading, mutate } = useSWR<Transaction>(
    apiUrl(`/api/transactions/${params.id}`),
    fetcher
  );

  // 更新処理
  const handleUpdate = async (data: TransactionFormData) => {
    const res = await fetch(apiUrl(`/api/transactions/${params.id}`), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // APIのバリデーションエラーをユーザーに表示 (4-3-3 要件)
      const body = await res.json().catch(() => ({}));
      const message = body.error ?? '更新に失敗しました';
      const details = body.details
        ? body.details.map((d: { field: string; message: string }) => d.message).join(', ')
        : '';
      throw new Error(details ? `${message}: ${details}` : message);
    }

    await mutate(); // SWR キャッシュを更新
    setIsEditing(false);
  };

  // 削除処理
  const handleDelete = async () => {
    if (!confirm('この記録を削除しますか？')) return;

    const res = await fetch(apiUrl(`/api/transactions/${params.id}`), {
      method: 'DELETE',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? '削除に失敗しました');
    }

    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">データが見つかりません</p>
        <Link href="/" className="text-indigo-600 hover:underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  // 編集モード
  if (isEditing) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← 詳細に戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">入出金を編集</h1>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <TransactionForm
            initialData={transaction}
            onSubmit={handleUpdate}
            submitLabel="更新する"
          />
        </div>
      </div>
    );
  }

  // 詳細表示モード
  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
          ← 一覧に戻る
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* 種別インジケーター */}
        <div
          className={`h-2 ${
            transaction.type === 'income' ? 'bg-green-400' : 'bg-red-400'
          }`}
        />

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${
                  transaction.type === 'income'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {transaction.type === 'income' ? '収入' : '支出'}
              </span>
              <h1 className="text-2xl font-bold text-gray-800 mt-3">
                {transaction.description}
              </h1>
            </div>
            <p
              className={`text-3xl font-bold flex-shrink-0 ml-4 ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatAmount(transaction.amount)}
            </p>
          </div>

          {/* 詳細情報 */}
          <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">日付</p>
              <p className="font-medium text-gray-800 mt-0.5">{transaction.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">カテゴリ</p>
              <p className="font-medium text-gray-800 mt-0.5">{transaction.category}</p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              更新
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-50 text-red-600 py-2.5 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
