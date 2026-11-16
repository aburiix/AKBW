import { checkAdmins } from "../middleware/admin.middleware.js";
import { Router } from "express";
import { getDashboardData, getStatisticsData } from "../controllers/dashboard.controller.js";

const router = Router();

router.get("/", checkAdmins, getDashboardData);
router.get("/statistics", checkAdmins, getStatisticsData);

export default router;