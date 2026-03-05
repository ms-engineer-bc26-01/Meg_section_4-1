import { v4 as uuidv4 } from "uuid";
import { memoryDB } from "../../db/memoryStore";
import type { Category } from "../../types";
import type {
  CategoriesRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";

export class PrismaCategoriesRepository implements CategoriesRepository {
  async list(userId: string): Promise<Category[]> {
    return memoryDB.categories.filter((c) => c.userId === userId && !c.deleted);
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const now = new Date().toISOString();
    const category: Category = {
      id: uuidv4(),
      userId: input.userId,
      name: input.name,
      type: input.type,
      createdAt: now,
      deleted: false,
    };
    memoryDB.categories.push(category);
    return category;
  }

  async update(input: UpdateCategoryInput): Promise<Category | null> {
    const row = memoryDB.categories.find(
      (c) => c.id === input.id && c.userId === input.userId && !c.deleted,
    );
    if (!row) return null;

    if (input.name !== undefined) row.name = input.name;
    if (input.type !== undefined) row.type = input.type;
    return row;
  }

  async softDelete(userId: string, id: string): Promise<boolean> {
    const row = memoryDB.categories.find(
      (c) => c.id === id && c.userId === userId && !c.deleted,
    );
    if (!row) return false;
    row.deleted = true;
    return true;
  }
}
