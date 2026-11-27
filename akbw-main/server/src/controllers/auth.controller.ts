import type { NextFunction, Request, Response } from "express";
import { prisma } from "../db/client.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { checkPhoneProof } from "../utils/phoneProof.util.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!checkPhoneProof(req.body.verifyToken, req.body.phone)) {
      return res.status(401).json({ message: "Telefon raqami SMS kod bilan tasdiqlanmagan", ok: false });
    }
    const user = await prisma.user.findUnique({
      where: {
        phone: req.body.phone,
      },
    });

    if (user) {
      return res
        .status(400)
        .json({ message: "User allready exists", ok: false });
    }

    let referredBy = null;
    let referrerUser = null;

    if (req.body.referralCode) {
      referrerUser = await prisma.user.findFirst({
        where: {
          referralCode: req.body.referralCode,
        },
      });

      if (referrerUser && referrerUser.id) {
        referredBy = referrerUser.id;
      }
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const refreshToken = crypto.randomBytes(40).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        lastName: req.body.lastName,
        gender: req.body.gender,
        phone: req.body.phone,
        birthDate: new Date(req.body.birthDate),
        region: String(req.body.region).trim(),
        district: String(req.body.district).trim(),
        email: req.body.email ? String(req.body.email).trim().toLowerCase() : null,
        referredBy: referredBy,
        refreshToken: refreshToken,
      } as any,
    });

    const token = jwt.sign({ id: newUser.id }, jwtSecret, { expiresIn: "7d" });

    return res.status(201).json({
      token,
      refreshToken,
      message: "User registered successfully",
      ok: true,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (!checkPhoneProof(req.body.verifyToken, req.body.phone)) {
      return res.status(401).json({ message: "Telefon raqami SMS kod bilan tasdiqlanmagan", ok: false });
    }
    const user = await prisma.user.findUnique({
      where: {
        phone: req.body.phone,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: "7d" });

    return res.status(200).json({
      token,
      refreshToken: newRefreshToken,
      message: "User logged in successfully",
      ok: true,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshUserToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Refresh token is required", ok: false });
    }

    const user = await prisma.user.findUnique({
      where: { refreshToken },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token", ok: false });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined");
    }

    const newToken = jwt.sign({ id: user.id }, jwtSecret, {
      expiresIn: "7d",
    });

    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return res.status(200).json({
      message: "Token refreshed successfully",
      ok: true,
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};
