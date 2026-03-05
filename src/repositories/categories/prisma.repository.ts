import { prisma } from "../../db/prisma";
import type { Category } from "../../types";
import type {
  CategoriesRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";
import { CategoryType } from "@prisma/client";
import { randomUUID } from "node:crypto"; // ★追加（環境依存を潰す）

const toCategory = (row: any): Category => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  type: row.type as "income" | "expense",
  createdAt:
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : String(row.createdAt),
  deleted: row.deleted,
});

export class PrismaCategoriesRepository implements CategoriesRepository {
  async list(userId: string): Promise<Category[]> {
    const rows = await prisma.category.findMany({
      where: { userId, deleted: false },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toCategory);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    try {
      const row = await prisma.category.create({
        data: {
          id: randomUUID(), // ★変更
          userId: input.userId,
          name: input.name,
          type: input.type as CategoryType,
          deleted: false,
        },
      });
      return toCategory(row);
    } catch (e: any) {
      if (e?.code === "P2002") {
        throw {
          status: 409,
          code: "CONFLICT",
          message: "Category name already exists",
          details: e?.meta,
        };
      }
      throw e;
    }
  }

  async update(input: UpdateCategoryInput): Promise<Category | null> {
    const result = await prisma.category.updateMany({
      where: { id: input.id, userId: input.userId, deleted: false },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.type !== undefined
          ? { type: input.type as CategoryType }
          : {}),
      },
    });

    if (result.count === 0) return null;

    // ★deleted/userIdスコープも合わせて取得（ブレ防止）
    const row = await prisma.category.findFirst({
      where: { id: input.id, userId: input.userId, deleted: false },
    });

    return row ? toCategory(row) : null;
  }

  async softDelete(userId: string, id: string): Promise<boolean> {
    const result = await prisma.category.updateMany({
      where: { id, userId, deleted: false },
      data: { deleted: true },
    });
    return result.count > 0;
  }
}
