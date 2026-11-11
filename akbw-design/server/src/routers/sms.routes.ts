import {
    Router,
} from "express";
import {
    send,
    verify
} from "../controllers/sms.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { sendSmsSchema, verifySmsSchema } from "../validators/sms.validator.js";

const router = Router();

router.post("/send", validate(sendSmsSchema), send);
router.post("/verify", validate(verifySmsSchema), verify)

export default router;