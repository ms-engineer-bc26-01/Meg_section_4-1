import type { CategoriesRepository } from "../repositories/categories/types";

export class CategoriesService {
  constructor(private repo: CategoriesRepository) {}

  list(userId: string) {
    return this.repo.list(userId);
  }
  create(userId: string, name: string, type: "income" | "expense") {
    return this.repo.create({ userId, name, type });
  }
  update(
    userId: string,
    id: string,
    name?: string,
    type?: "income" | "expense",
  ) {
    return this.repo.update({ userId, id, name, type });
  }
  delete(userId: string, id: string) {
    return this.repo.softDelete(userId, id);
  }
}
