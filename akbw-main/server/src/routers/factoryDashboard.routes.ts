import {
    Router
} from "express";
import {
    getFactoryStats
} from "../controllers/factoryDashboard.controller.js";
import { auth, factoryAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", factoryAuth, getFactoryStats);

export default router;
