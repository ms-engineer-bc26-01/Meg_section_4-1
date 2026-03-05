import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { categoriesRouter } from "./routes/categories.ts";
import { errorHandler } from "./middleware/errorHandler.ts";

const app = express();

app.use(express.json());

app.use("/api/v1/categories", categoriesRouter);

// 404 handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next({
    status: 404,
    code: "NOT_FOUND",
    message: "Not Found",
  });
});

app.use(errorHandler);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
