'use client';

type Props = {
  selectedMonth: string;
  onChange: (month: string) => void;
};

// 月選択コンポーネント (props で状態管理を親に委譲)
export default function MonthSelector({ selectedMonth, onChange }: Props) {
  const months: { value: string; label: string }[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getFullYear()}年${d.getMonth() + 1}月`;
    months.push({ value, label });
  }

  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-medium text-gray-600">月を選択:</label>
      <select
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>
    </div>
  );
}
