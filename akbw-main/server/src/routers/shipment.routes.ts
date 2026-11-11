import { Router } from "express";
import {
    getShipmentStates,
    getOrderShipments,
    getFactoryShipments,
    getAdminShipments,
    updateShipmentStatus
} from "../controllers/shipment.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/states", getShipmentStates);
router.get("/factory", auth, getFactoryShipments);
router.get("/admin", auth, getAdminShipments);
router.get("/:id", getOrderShipments);
router.patch("/:id/status", auth, updateShipmentStatus);

export default router;