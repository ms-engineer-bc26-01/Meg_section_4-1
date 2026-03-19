import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonthlySummary from '../../components/MonthlySummary';
import { Transaction } from '@/types';

// テスト用データ
const incomeTransaction: Transaction = {
  id: 1,
  date: '2024-01-15',
  type: 'income',
  category: '給与',
  description: '1月分給与',
  amount: 300000,
};

const expenseTransaction: Transaction = {
  id: 2,
  date: '2024-01-20',
  type: 'expense',
  category: '食費',
  description: 'スーパー買い物',
  amount: 50000,
};

describe('MonthlySummary', () => {
  // ---- 正常系 ----
  it('収入・支出合計と残高が正しく表示される', () => {
    render(<MonthlySummary transactions={[incomeTransaction, expenseTransaction]} />);

    // ラベルが表示されていること
    expect(screen.getByText('収入合計')).toBeInTheDocument();
    expect(screen.getByText('支出合計')).toBeInTheDocument();
    expect(screen.getByText('差引残高')).toBeInTheDocument();

    // 金額が表示されていること (日本円フォーマット)
    expect(screen.getByText('￥300,000')).toBeInTheDocument();
    expect(screen.getByText('￥50,000')).toBeInTheDocument();
    expect(screen.getByText('￥250,000')).toBeInTheDocument();
  });

  it('収入のみのデータで残高 = 収入合計となる', () => {
    render(<MonthlySummary transactions={[incomeTransaction]} />);

    // 収入: 300,000 / 支出: 0 / 残高: 300,000
    const amounts = screen.getAllByText('￥300,000');
    expect(amounts).toHaveLength(2); // 収入合計と差引残高の両方
    expect(screen.getByText('￥0')).toBeInTheDocument(); // 支出合計
  });

  it('データが空の場合、すべて ￥0 で表示される', () => {
    render(<MonthlySummary transactions={[]} />);

    const zeroAmounts = screen.getAllByText('￥0');
    expect(zeroAmounts).toHaveLength(3); // 収入・支出・残高すべて 0
  });

  it('複数の収入・支出を正しく集計する', () => {
    const transactions: Transaction[] = [
      { ...incomeTransaction, id: 1, amount: 200000 },
      { ...incomeTransaction, id: 2, amount: 100000 },
      { ...expenseTransaction, id: 3, amount: 30000 },
      { ...expenseTransaction, id: 4, amount: 20000 },
    ];
    render(<MonthlySummary transactions={transactions} />);

    expect(screen.getByText('￥300,000')).toBeInTheDocument(); // 収入合計
    expect(screen.getByText('￥50,000')).toBeInTheDocument(); // 支出合計
    expect(screen.getByText('￥250,000')).toBeInTheDocument(); // 残高
  });

  // ---- 異常系相当（支出が収入を上回るケース）----
  it('支出が収入を上回る場合、残高がマイナスとなる', () => {
    const transactions: Transaction[] = [
      { ...incomeTransaction, amount: 10000 },
      { ...expenseTransaction, amount: 50000 },
    ];
    render(<MonthlySummary transactions={transactions} />);

    expect(screen.getByText('￥10,000')).toBeInTheDocument(); // 収入合計
    expect(screen.getByText('￥50,000')).toBeInTheDocument(); // 支出合計
    expect(screen.getByText('-￥40,000')).toBeInTheDocument(); // マイナス残高
  });

  it('支出が収入を上回る場合、残高エリアのスタイルが変わる（orange クラス）', () => {
    const transactions: Transaction[] = [
      { ...incomeTransaction, amount: 10000 },
      { ...expenseTransaction, amount: 50000 },
    ];
    const { container } = render(<MonthlySummary transactions={transactions} />);

    // orange のスタイルが適用されていること
    expect(container.querySelector('.bg-orange-50')).not.toBeNull();
  });
});
