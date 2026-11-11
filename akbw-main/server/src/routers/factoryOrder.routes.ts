import {
    Router
} from "express";
import {
    getFactoryOrders,
    updateOrderItemStatus
} from "../controllers/factoryOrder.controller.js";
import {
    auth
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", auth, getFactoryOrders);
router.patch("/status/:id", auth, updateOrderItemStatus);

export default router;
