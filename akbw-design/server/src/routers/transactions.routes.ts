import { Router } from "express";
import { getTransactions } from "../controllers/transactions.controller.js";
import { checkAdmins } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/", checkAdmins, getTransactions);

export default router;