import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      },
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, SECRET) as any;
    // payload に userId があると仮定
    (req as any).user = {
      id: payload.userId,
      name: payload.name,
      currency: payload.currency,
    };
    next();
  } catch {
    return res.status(401).json({
      error: {
        code: "AUTH_FAILED",
        message: "Invalid token",
      },
    });
  }
};
