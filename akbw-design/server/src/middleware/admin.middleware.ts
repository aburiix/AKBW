import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { prisma } from "../db/client.js";

export const checkAdmins = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No authorization header provided",
        ok: false,
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid authorization header format. Expected: Bearer <token>",
        ok: false,
      });
    }

    const token = parts[1];
    if (!token || token.length === 0) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Token is empty",
        ok: false,
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const decodedToken = jwt.verify(
      token,
      jwtSecret,
    ) as JwtPayload & { id: string | number };

    const adminId = parseInt(decodedToken.id?.toString());

    if (isNaN(adminId)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid admin ID in token",
        ok: false,
      });
    }

    const admin = await prisma.admins.findUnique({
      where: {
        id: adminId,
      },
      include: {
        access: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        error: "Not Found",
        message: "Admin not found",
        ok: false,
      });
    }

    (req as any).admin = admin;
    next();
  } catch (error: any) {
    console.error("checkAdmins middleware error:", error);
    const isAuthError = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
    return res.status(isAuthError ? 401 : 500).json({
      error: error.message || error,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired"
          : error.name === "JsonWebTokenError"
          ? "Invalid token"
          : "check admins middleware failed",
      ok: false,
    });
  }
};

export const requireAccess = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const admin = (req as any).admin;
    if (!admin) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Admin not authenticated",
        ok: false,
      });
    }

    const adminAccessNames = admin.access.map((a: { name: string }) => a.name);
    const hasAccess = permissions.some((p) => adminAccessNames.includes(p));

    if (!hasAccess) {
      return res.status(403).json({
        error: "Forbidden",
        message: "Sizda bu amalni bajarish uchun ruxsat yo'q",
        ok: false,
      });
    }

    next();
  };
};
