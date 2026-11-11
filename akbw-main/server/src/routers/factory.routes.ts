import { Router } from "express";
import { createFactory, getAllFactories, updateFactory, deleteFactory } from "../controllers/factory.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { factoryCreateValidator, factoryUpdateValidator } from "../validators/factory.validator.js";

const router = Router();

router.post("/", validate(factoryCreateValidator), createFactory);
router.get("/", getAllFactories);
router.patch("/:id", validate(factoryUpdateValidator), updateFactory);
router.delete("/:id", deleteFactory);

export default router;