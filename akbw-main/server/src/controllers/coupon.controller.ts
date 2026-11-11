import {
  prisma
} from "../db/client.js";
import type {
  Request,
  Response,
  NextFunction
} from "express";


export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coupons = await prisma.coupons.findMany();
    res.status(200).json(coupons);
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      code,
      discount,
      expiry
    } = req.body;

    const coupon = await prisma.coupons.create({
      data: {
        code,
        discount,
        expiry,
      },
    });

    res.status(201).json(coupon);
  } catch (error) {
    next(error);
  }
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { code, discount, expiry } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Coupon ID is required" });
    }

    const coupon = await prisma.coupons.update({
      where: { id: Number(id) },
      data: {
        code,
        discount,
        expiry,
      },
    });

    res.status(200).json(coupon);
  } catch (error) {
    next(error);
  }
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Coupon ID is required" });
    }

    await prisma.coupons.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    console.log(code, "code");

    const coupon = await prisma.coupons.findUnique({
      where: { code },
    });

    console.log(coupon, "coupon");

    if (!coupon) {
      return res.status(404).json({ error: "Coupon not found" });
    };

    if (coupon.expiry < new Date()) {
      return res.status(400).json({ error: "Coupon is expired" });
    };

    res.status(200).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
}

