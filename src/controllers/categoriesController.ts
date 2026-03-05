import { Request, Response, NextFunction } from "express";
import { CategoriesService } from "../services/categoriesService";

export class CategoriesController {
  constructor(private service: CategoriesService) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const data = await this.service.list(userId);
      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { name, type } = req.body;

      if (!name || !type || !["income", "expense"].includes(type)) {
        return next({
          status: 400,
          code: "INVALID_PARAMS",
          message: "Invalid category data",
          details: { name, type },
        });
      }

      const data = await this.service.create(userId, name, type);
      res.status(201).json({ data });
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { name, type } = req.body;

      if (type !== undefined && !["income", "expense"].includes(type)) {
        return next({
          status: 400,
          code: "INVALID_PARAMS",
          message: "Invalid category type",
          details: { type },
        });
      }

      const data = await this.service.update(userId, id, name, type);
      if (!data)
        return next({
          status: 404,
          code: "NOT_FOUND",
          message: "Category not found",
        });

      res.json({ data });
    } catch (e) {
      next(e);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const ok = await this.service.delete(userId, id);
      if (!ok)
        return next({
          status: 404,
          code: "NOT_FOUND",
          message: "Category not found",
        });

      res.status(204).send();
    } catch (e) {
      next(e);
    }
  };
}
