export type User = {
  id: string;
  name: string;
  currency: string; // ISO 4217
  createdAt: string;
};

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: "income" | "expense";
  createdAt: string;
  deleted?: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number; // 0 を許容しない
  categoryId: string;
  memo?: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
};
