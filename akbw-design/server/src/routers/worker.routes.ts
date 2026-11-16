import { checkAdminOrFactory } from "../middleware/security.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
import { adminCreateWorker, adminDeleteWorker, adminListWorkers, adminUpdateWorker } from "../controllers/worker.controller.js";
import { Router } from "express";
import {
    getWorkers,
    createWorker,
    updateWorker,
    deleteWorker
} from "../controllers/worker.controller.js";
import { auth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
    workerCreateValidator,
    workerUpdateValidator
} from "../validators/worker.validator.js";

const router = Router();

// Admin panel (barcha zavodlar)
router.get("/all", checkAdmins, adminListWorkers);
router.post("/admin", checkAdmins, adminCreateWorker);
router.put("/admin/:id", checkAdmins, adminUpdateWorker);
router.delete("/admin/:id", checkAdmins, adminDeleteWorker);

router.get("/", checkAdminOrFactory, getWorkers);
router.post("/", checkAdminOrFactory, validate(workerCreateValidator), createWorker);
router.put("/:id", checkAdminOrFactory, validate(workerUpdateValidator), updateWorker);
router.delete("/:id", checkAdminOrFactory, deleteWorker);

export default router;
