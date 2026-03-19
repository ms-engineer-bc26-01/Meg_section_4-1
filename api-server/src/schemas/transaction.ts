import { z } from 'zod';

// Transaction のベーススキーマ (4-3-3 要件: バリデーション)
const transactionBase = z.object({
  date: z
    .string({ required_error: '日付は必須です' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で入力してください'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'type は income または expense で入力してください' }),
  }),
  category: z
    .string({ required_error: 'カテゴリは必須です' })
    .min(1, 'カテゴリは1文字以上で入力してください')
    .max(50, 'カテゴリは50文字以内で入力してください'),
  description: z
    .string({ required_error: '説明は必須です' })
    .min(1, '説明は1文字以上で入力してください')
    .max(200, '説明は200文字以内で入力してください'),
  amount: z
    .number({
      required_error: '金額は必須です',
      invalid_type_error: '金額は数値で入力してください',
    })
    .int('金額は整数で入力してください')
    .positive('金額は1以上の整数で入力してください'),
});

// POST /api/transactions: 全フィールド必須
export const createTransactionSchema = transactionBase;

// PUT /api/transactions/:id: 全フィールド必須（完全置換）
export const updateTransactionSchema = transactionBase;

// GET /api/transactions のクエリパラメータ
export const listQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'month は YYYY-MM 形式で入力してください')
    .optional(),
});
