import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { CategoriesController } from "../controllers/categoriesController.ts";
import { CategoriesService } from "../services/categoriesService.ts";
import { PrismaCategoriesRepository } from "../repositories/categories/prisma.repository.ts";

const router = Router();
router.use(authenticate);

const repo = new PrismaCategoriesRepository();
const service = new CategoriesService(repo);
const controller = new CategoriesController(service);

router.get("/", controller.list);
router.post("/", controller.create);
router.patch("/:id", controller.update);
router.delete("/:id", controller.delete);

export { router as categoriesRouter };
