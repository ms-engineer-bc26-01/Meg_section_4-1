import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// session3 の mockData.ts から移植した初期データ (4-4~4-5 要件: シーディング)
const seedData = [
  { date: '2026-03-01', type: 'income',  category: '給与',   description: '3月分給与',           amount: 280000 },
  { date: '2026-03-05', type: 'expense', category: '家賃',   description: '3月分家賃',           amount: 80000  },
  { date: '2026-03-08', type: 'expense', category: '食費',   description: 'スーパー買い出し',     amount: 12000  },
  { date: '2026-03-10', type: 'expense', category: '光熱費', description: '電気・ガス代',        amount: 8500   },
  { date: '2026-03-12', type: 'expense', category: '交通費', description: '定期代',              amount: 12000  },
  { date: '2026-03-15', type: 'income',  category: '副収入', description: 'フリーランス報酬',    amount: 50000  },
  { date: '2026-03-18', type: 'expense', category: '娯楽費', description: '映画・外食',          amount: 5800   },
  { date: '2026-03-20', type: 'expense', category: '通信費', description: 'スマホ代',            amount: 3500   },
  { date: '2026-02-01', type: 'income',  category: '給与',   description: '2月分給与',           amount: 280000 },
  { date: '2026-02-05', type: 'expense', category: '家賃',   description: '2月分家賃',           amount: 80000  },
  { date: '2026-02-10', type: 'expense', category: '食費',   description: 'スーパー買い出し',     amount: 15000  },
  { date: '2026-02-14', type: 'expense', category: '娯楽費', description: 'バレンタインディナー', amount: 8000   },
  { date: '2026-02-20', type: 'expense', category: '医療費', description: '病院・薬代',          amount: 4500   },
  { date: '2026-01-01', type: 'income',  category: '給与',   description: '1月分給与',           amount: 280000 },
  { date: '2026-01-05', type: 'expense', category: '家賃',   description: '1月分家賃',           amount: 80000  },
  { date: '2026-01-10', type: 'income',  category: '賞与',   description: '冬季ボーナス',        amount: 200000 },
  { date: '2026-01-15', type: 'expense', category: '食費',   description: '正月食材',            amount: 20000  },
  { date: '2026-01-20', type: 'expense', category: '娯楽費', description: '初売り購入',          amount: 15000  },
];

async function main() {
  console.log('Seeding database...');
  // deleteMany で冪等なシーディングを実現
  await prisma.transaction.deleteMany();
  await prisma.transaction.createMany({ data: seedData });
  console.log(`Seeded ${seedData.length} transactions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
