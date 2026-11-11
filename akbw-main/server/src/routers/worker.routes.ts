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

router.get("/", auth, getWorkers);
router.post("/", auth, validate(workerCreateValidator), createWorker);
router.put("/:id", auth, validate(workerUpdateValidator), updateWorker);
router.delete("/:id", auth, deleteWorker);

export default router;
