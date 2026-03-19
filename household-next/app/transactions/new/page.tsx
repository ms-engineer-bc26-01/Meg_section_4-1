'use client';

import { useRouter } from 'next/navigation';
import TransactionForm from '@/components/TransactionForm';
import { apiUrl } from '@/lib/api';
import { TransactionFormData } from '@/types';

// 新規登録ページ (4-2 要件: Express API へ POST)
export default function NewTransactionPage() {
  const router = useRouter();

  const handleSubmit = async (data: TransactionFormData) => {
    const res = await fetch(apiUrl('/api/transactions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // APIのバリデーションエラーをユーザーに表示 (4-3-3 要件)
      const body = await res.json().catch(() => ({}));
      const message = body.error ?? '保存に失敗しました';
      const details = body.details
        ? body.details.map((d: { field: string; message: string }) => d.message).join(', ')
        : '';
      throw new Error(details ? `${message}: ${details}` : message);
    }

    router.push('/');
    router.refresh();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">入出金を追加</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <TransactionForm onSubmit={handleSubmit} submitLabel="登録する" />
      </div>
    </div>
  );
}
