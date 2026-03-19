'use client';

import { useState } from 'react';
import TransactionList from '@/components/TransactionList';
import MonthSelector from '@/components/MonthSelector';

// 入出金一覧ページ: useState で選択月を管理 (3-1, 3-2 要件)
export default function HomePage() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">入出金一覧</h1>
      <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
      <TransactionList month={selectedMonth} />
    </div>
  );
}
