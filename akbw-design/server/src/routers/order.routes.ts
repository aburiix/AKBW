import { Router } from "express";
import { langaugeMiddleware } from "../middleware/language.middleware.js";
import { auth } from "../middleware/auth.middleware.js";
import {
    getAllOrders,
    getOrders,
    reviewOrder,
    updateOrderStatus,
    getOrderStatus,
    getAllOrderAdmins
} from "../controllers/order.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { reviewOrderValidator } from "../validators/order.validator.js";

const router = Router();

router.post("/", auth, validate(reviewOrderValidator), reviewOrder)
router.get("/admins-order-all", getAllOrders)
router.get("/", langaugeMiddleware,auth, getOrders)
router.patch("/:id/status", updateOrderStatus)
router.get("/all", getAllOrderAdmins)
router.get("/order-status",auth, getOrderStatus);

export default router;