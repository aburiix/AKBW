import { checkAdmins } from "../middleware/admin.middleware.js";
import { Router } from "express";
import { createFactory, getAllFactories, updateFactory, deleteFactory } from "../controllers/factory.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { factoryCreateValidator, factoryUpdateValidator } from "../validators/factory.validator.js";

const router = Router();

router.post("/", checkAdmins, validate(factoryCreateValidator), createFactory);
router.get("/", checkAdmins, getAllFactories);
router.patch("/:id", checkAdmins, validate(factoryUpdateValidator), updateFactory);
router.delete("/:id", checkAdmins, deleteFactory);

export default router;