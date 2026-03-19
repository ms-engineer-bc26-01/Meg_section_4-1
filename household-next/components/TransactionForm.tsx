'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Transaction, TransactionFormData, TransactionType } from '@/types';

type Props = {
  initialData?: Transaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  submitLabel?: string;
};

const INCOME_CATEGORIES = ['給与', '副収入', '賞与', 'その他収入'];
const EXPENSE_CATEGORIES = ['食費', '交通費', '娯楽費', '光熱費', '家賃', '医療費', '通信費', 'その他支出'];

// 登録・編集フォームコンポーネント (useState + useEffect で状態管理) (3-2 要件)
export default function TransactionForm({
  initialData,
  onSubmit,
  submitLabel = '登録する',
}: Props) {
  const router = useRouter();

  // useState でフォームの状態を管理 (3-2 ★)
  const [formData, setFormData] = useState<TransactionFormData>({
    date: initialData?.date ?? new Date().toISOString().split('T')[0],
    type: initialData?.type ?? 'expense',
    category: initialData?.category ?? '',
    description: initialData?.description ?? '',
    amount: initialData?.amount ?? 0,
  });

  // 送信トリガーフラグ: useEffect と組み合わせて API 呼び出しを管理
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: name === 'amount' ? Number(value) : value };
      // 種別変更時はカテゴリをリセット
      if (name === 'type') next.category = '';
      return next;
    });
  };

  // useEffect でフォームの入力値を登録/更新 (3-2 ★)
  // pendingSubmit が true になったときに API 送信を実行
  useEffect(() => {
    if (!pendingSubmit) return;

    setIsSubmitting(true);
    setError('');

    onSubmit(formData)
      .catch(() => setError('保存に失敗しました'))
      .finally(() => {
        setIsSubmitting(false);
        setPendingSubmit(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.type || !formData.category || !formData.description || !formData.amount) {
      setError('すべての項目を入力してください');
      return;
    }

    // useEffect をトリガー
    setPendingSubmit(true);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 日付 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          日付
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* 種別 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          種別
        </label>
        <div className="flex gap-6">
          {(['income', 'expense'] as TransactionType[]).map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value={type}
                checked={formData.type === type}
                onChange={handleChange}
                className="accent-indigo-600"
              />
              <span
                className={`font-medium ${
                  type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {type === 'income' ? '収入' : '支出'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          カテゴリ
        </label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          required
        >
          <option value="">選択してください</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
        </label>
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="例: 3月分給与"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* 金額 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          金額 (円)
        </label>
        <input
          type="number"
          name="amount"
          value={formData.amount === 0 ? '' : formData.amount}
          onChange={handleChange}
          placeholder="例: 50000"
          min="1"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? '保存中...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
