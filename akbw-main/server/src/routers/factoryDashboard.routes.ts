import {
    Router
} from "express";
import {
    getFactoryStats
} from "../controllers/factoryDashboard.controller.js";
import {
    auth
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", auth, getFactoryStats);

export default router;
