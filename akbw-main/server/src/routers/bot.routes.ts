import { botLimiter, checkBotSecret } from "../middleware/security.middleware.js";
import { Router } from "express";
import {
  isWorker,
  getOrders,
  getHistory,
  handleOrderAction,
  handleShipmentStatusUpdate,
} from "../controllers/bot.controller.js";

const router = Router();

router.use(botLimiter, checkBotSecret);

// Har bir bot so'rovi kim nomidan qilinganini qayd qilamiz (kalit oshkor bo'lsa ham iz qoladi)
router.use((req, _res, next) => {
  if (req.method !== "GET") {
    const tg = String(req.body?.tg_id ?? req.query?.tg_id ?? "?");
    console.info(`[bot] ${req.method} ${req.path} tg=${tg} ip=${req.ip}`);
  }
  next();
});

router.get("/isWorker", isWorker);
router.get("/orders", getOrders);
router.get("/history", getHistory);
router.post("/order-action", handleOrderAction);
router.post("/shipment-status-update", handleShipmentStatusUpdate);

export default router;
