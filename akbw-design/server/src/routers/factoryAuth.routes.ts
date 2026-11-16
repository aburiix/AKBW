import { loginLimiterByAccount, loginLimiterByIp, logFailedLogin } from "../middleware/security.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
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

router.post("/register", checkAdmins, validate(factoryCreateValidator), registerFactory);
router.get("/me", auth, getMeFactory);
router.post("/login", logFailedLogin("factory"), loginLimiterByIp, loginLimiterByAccount, loginFactory);

export default router;
