import type { Category } from "../../types";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  type: "income" | "expense";
};

export type UpdateCategoryInput = {
  userId: string;
  id: string;
  name?: string;
  type?: "income" | "expense";
};

export interface CategoriesRepository {
  list(userId: string): Promise<Category[]>;
  create(input: CreateCategoryInput): Promise<Category>;
  update(input: UpdateCategoryInput): Promise<Category | null>;
  softDelete(userId: string, id: string): Promise<boolean>;
}
