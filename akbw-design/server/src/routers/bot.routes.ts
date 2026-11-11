import { Router } from "express";
import {
  isWorker,
  getOrders,
  getHistory,
  handleOrderAction,
  handleShipmentStatusUpdate,
} from "../controllers/bot.controller.js";

const router = Router();

router.get("/isWorker", isWorker);
router.get("/orders", getOrders);
router.get("/history", getHistory);
router.post("/order-action", handleOrderAction);
router.post("/shipment-status-update", handleShipmentStatusUpdate);

export default router;
