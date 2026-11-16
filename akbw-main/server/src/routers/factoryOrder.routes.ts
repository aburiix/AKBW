import {
    Router
} from "express";
import {
    getFactoryOrders,
    updateOrderItemStatus
} from "../controllers/factoryOrder.controller.js";
import { auth, factoryAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", factoryAuth, getFactoryOrders);
router.patch("/status/:id", factoryAuth, updateOrderItemStatus);

export default router;
