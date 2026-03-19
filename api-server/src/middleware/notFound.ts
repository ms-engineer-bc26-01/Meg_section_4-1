import { Request, Response } from 'express';

// 404 フォールスルーハンドラ: どのルートにもマッチしなかった場合
export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ error: `${req.method} ${req.path} は存在しません` });
};
