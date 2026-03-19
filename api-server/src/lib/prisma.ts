import { PrismaClient } from '@prisma/client';

// シングルトンパターン: 複数インスタンス生成によるDB接続枯渇を防ぐ
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
