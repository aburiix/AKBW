import { checkAdminOrFactory } from "../middleware/security.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
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
router.get("/admin", checkAdmins, getAdminShipments);
router.get("/:id", checkAdmins, getOrderShipments);
router.patch("/:id/status", checkAdminOrFactory, updateShipmentStatus);

export default router;