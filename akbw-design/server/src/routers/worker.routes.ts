import { checkAdminOrFactory } from "../middleware/security.middleware.js";
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

router.get("/", checkAdminOrFactory, getWorkers);
router.post("/", checkAdminOrFactory, validate(workerCreateValidator), createWorker);
router.put("/:id", checkAdminOrFactory, validate(workerUpdateValidator), updateWorker);
router.delete("/:id", checkAdminOrFactory, deleteWorker);

export default router;
