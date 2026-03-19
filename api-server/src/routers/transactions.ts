import { Router } from 'express';
import { prisma } from '../lib/prisma';
import {
  createTransactionSchema,
  updateTransactionSchema,
  listQuerySchema,
} from '../schemas/transaction';
import { logger } from '../logger';

export const transactionsRouter = Router();

// GET /api/transactions?month=YYYY-MM
transactionsRouter.get('/', async (req, res, next) => {
  try {
    // クエリパラメータのバリデーション
    const { month } = listQuerySchema.parse(req.query);

    const where = month
      ? {
          date: {
            gte: `${month}-01`,
            lte: `${month}-31`,
          },
        }
      : {};

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    logger.debug('Fetched transactions', { count: transactions.length, month });
    res.json(transactions);
  } catch (err) {
    next(err);
  }
});

// GET /api/transactions/:id
transactionsRouter.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = Object.assign(new Error('IDが不正です'), { status: 404 });
      return next(err);
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      const err = Object.assign(new Error('見つかりません'), { status: 404 });
      return next(err);
    }

    logger.debug('Fetched transaction', { id });
    res.json(transaction);
  } catch (err) {
    next(err);
  }
});

// POST /api/transactions
transactionsRouter.post('/', async (req, res, next) => {
  try {
    const data = createTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.create({ data });
    logger.info('Transaction created', { id: transaction.id, type: transaction.type, amount: transaction.amount });
    res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
});

// PUT /api/transactions/:id
transactionsRouter.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = Object.assign(new Error('IDが不正です'), { status: 404 });
      return next(err);
    }

    const data = updateTransactionSchema.parse(req.body);
    const transaction = await prisma.transaction.update({
      where: { id },
      data,
    });

    logger.info('Transaction updated', { id: transaction.id });
    res.json(transaction);
  } catch (err) {
    // Prisma: レコードが見つからない場合 (P2025)
    if ((err as { code?: string }).code === 'P2025') {
      return next(Object.assign(new Error('見つかりません'), { status: 404 }));
    }
    next(err);
  }
});

// DELETE /api/transactions/:id
transactionsRouter.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = Object.assign(new Error('IDが不正です'), { status: 404 });
      return next(err);
    }

    await prisma.transaction.delete({ where: { id } });
    logger.info('Transaction deleted', { id });
    res.json({ message: '削除しました' });
  } catch (err) {
    if ((err as { code?: string }).code === 'P2025') {
      return next(Object.assign(new Error('見つかりません'), { status: 404 }));
    }
    next(err);
  }
});
