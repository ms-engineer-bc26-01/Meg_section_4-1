import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold hover:text-indigo-200 transition-colors"
        >
          家計簿アプリ
        </Link>
        <Link
          href="/transactions/new"
          className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm"
        >
          + 追加
        </Link>
      </div>
    </header>
  );
}
