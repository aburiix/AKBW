import {
    Router
} from "express";
import {
    registerFactory,
    loginFactory,
    getMeFactory
} from "../controllers/factoryAuth.controller.js";
import {
    auth
} from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { factoryCreateValidator } from "../validators/factory.validator.js";

const router = Router();

router.post("/register", validate(factoryCreateValidator), registerFactory);
router.get("/me", auth, getMeFactory);
router.post("/login", loginFactory);

export default router;
