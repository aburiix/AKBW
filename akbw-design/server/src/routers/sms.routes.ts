import { smsSendLimiter, smsVerifyLimiter } from "../middleware/security.middleware.js";
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

router.post("/send", smsSendLimiter, validate(sendSmsSchema), send);
router.post("/verify", smsVerifyLimiter, validate(verifySmsSchema), verify)

export default router;