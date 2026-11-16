import { checkAdmins } from "../middleware/admin.middleware.js";
import { Router } from "express";
import { langaugeMiddleware } from "../middleware/language.middleware.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";
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

router.post("/", userAuth, validate(reviewOrderValidator), reviewOrder)
router.get("/admins-order-all", checkAdmins, getAllOrders)
router.get("/", langaugeMiddleware, userAuth, getOrders)
router.patch("/:id/status", checkAdmins, updateOrderStatus)
router.get("/all", checkAdmins, getAllOrderAdmins)
router.get("/order-status",auth, getOrderStatus);

export default router;