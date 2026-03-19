import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';

// グローバルエラーハンドラ (4-3-3 要件)
// 4パラメータ形式が Express のエラーハンドラとして認識される必須条件
export const errorHandler: ErrorRequestHandler = (err, req: Request, res: Response, _next: NextFunction) => {
  // Zod バリデーションエラー → 400 + フィールド別エラー詳細
  if (err instanceof ZodError) {
    logger.warn('Validation error', { path: req.path, issues: err.issues });
    res.status(400).json({
      error: 'バリデーションエラー',
      details: err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      })),
    });
    return;
  }

  // 404 エラー (手動で status=404 を付けてスロー)
  if ((err as { status?: number }).status === 404) {
    res.status(404).json({ error: (err as Error).message ?? '見つかりません' });
    return;
  }

  // その他のエラー → 500
  logger.error('Unhandled error', {
    path: req.path,
    method: req.method,
    error: (err as Error).message,
    stack: (err as Error).stack,
  });
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
};
