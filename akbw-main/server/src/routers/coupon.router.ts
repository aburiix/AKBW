import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  getAllCoupons,
} from "../controllers/coupon.controller.js";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../validators/coupon.validator.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", checkAdmins, getAllCoupons);
router.post("/", checkAdmins, validate(createCouponSchema), createCoupon);
router.put("/:id", checkAdmins, validate(updateCouponSchema), updateCoupon);
router.delete("/:id", checkAdmins, deleteCoupon);
router.post("/apply", userAuth, applyCoupon);


export default router;
