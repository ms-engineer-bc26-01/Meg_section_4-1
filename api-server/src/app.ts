import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { accessLog } from './middleware/accessLog';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { transactionsRouter } from './routers/transactions';

// Express app ファクトリ (listen() を含まないので単体テスト可能)
export function createApp() {
  const app = express();

  // CORS: Next.js (port 3000) からのリクエストを許可
  app.use(cors({ origin: config.corsOrigin }));

  // JSON ボディパーサー
  app.use(express.json());

  // アクセスログ (Morgan → Winston http レベル)
  app.use(accessLog);

  // ヘルスチェック
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // リソースルーター
  app.use('/api/transactions', transactionsRouter);

  // 404 ハンドラ (ルートにマッチしなかった場合)
  app.use(notFound);

  // グローバルエラーハンドラ (必ず最後に登録)
  app.use(errorHandler);

  return app;
}
