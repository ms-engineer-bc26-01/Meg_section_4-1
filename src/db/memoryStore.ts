import type { User, Category, Transaction } from "../types";

type Store = {
  users: User[];
  categories: Category[];
  transactions: Transaction[];
};

export const memoryDB: Store = {
  users: [
    {
      id: "user_001",
      name: "Taro",
      currency: "JPY",
      createdAt: "2026-01-01T00:00:00Z",
    },
  ],
  categories: [],
  transactions: [],
};

// ユーザーIDでスコープしたデータ取得のヘルパー例
export const getUserCategories = (userId: string) =>
  memoryDB.categories.filter((c) => c.userId === userId && !c.deleted);

export const getUserTransactions = (userId: string) =>
  memoryDB.transactions.filter((t) => t.userId === userId);
