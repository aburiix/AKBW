import { Router } from "express";
import { getDashboardData, getStatisticsData } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", getDashboardData);
router.get("/statistics", getStatisticsData);

export default router;