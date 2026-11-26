import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db/client.js";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.warn("Auth failed: No token provided");
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided", ok: false });
    }
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decodedToken: any = jwt.verify(token, jwtSecret);


    if (decodedToken.id) {
      req.user = decodedToken.id;

      next();
    } else {
      console.warn("Auth failed: Invalid token decoded");
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid token", ok: false });
    }
  } catch (error: any) {
    console.log(error, "json error");
    if (error.message.includes("jwt")) {
      console.warn(`Auth failed: ${error.message}`);
      return res
        .status(401)
        .json({ message: `Unauthorized: ${error.message}`, ok: false });
    };
    
    next(error);
  }
};

/**
 * Rolga qarab ajratilgan tekshiruvlar.
 * `auth` har qanday to'g'ri tokenni qabul qiladi (admin rasm yuklashi uchun kerak), shuning uchun
 * mijoz va fabrika yo'llarida faqat o'z turidagi token o'tishi kerak — aks holda admin yoki fabrika
 * tokeni bilan boshqa birovning nomidan ish qilish mumkin edi.
 */
const verifyToken = (req: Request): any | null => {
  const token = req.headers.authorization?.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET;
  if (!token || !jwtSecret) return null;
  try {
    return jwt.verify(token, jwtSecret);
  } catch {
    return null;
  }
};

/** Faqat mijoz tokeni: id — UUID qator, role yo'q */
export const userAuth = async (req: Request, res: Response, next: NextFunction) => {
  const d = verifyToken(req);
  if (!d || d.role || typeof d.id !== "string" || !d.id) {
    return res.status(401).json({ message: "Unauthorized", ok: false });
  }
  // Token 7 kun amal qiladi: akkaunt o'chirilgan (yoki yo'q) bo'lsa, eski token ham ishlamasin
  try {
    const u = await prisma.user.findUnique({ where: { id: d.id }, select: { phone: true } });
    if (!u || u.phone.startsWith("deleted:")) {
      return res.status(401).json({ message: "Unauthorized", ok: false });
    }
  } catch (error) {
    return next(error);
  }
  req.user = d.id;
  next();
};

/** Faqat fabrika tokeni: role === "factory" */
export const factoryAuth = (req: Request, res: Response, next: NextFunction) => {
  const d = verifyToken(req);
  if (!d || d.role !== "factory" || !d.id) {
    return res.status(401).json({ message: "Unauthorized", ok: false });
  }
  req.user = String(d.id);
  (req as any).factoryId = Number(d.id);
  next();
};
