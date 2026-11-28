import {
  paymeMiddleware
} from "../middleware/payme.middleware.js";
import {
  paymeCheckout,
  paymePay,
  getPaymeLink,
  clickPrapere,
  clickComplete,
  clickCheckout,
} from "../controllers/payment.controller.js";
import {
  basicAuth as paynetAuth
} from "../middleware/paynet.middleware.js";
import {
  paynetWebhook,
  getPaynetLink as generatePaynetLink
} from "../controllers/paynet.controller.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";
import {
  validate
} from "../middleware/validate.middleware.js";
import {
  paynetLinkValidator,
  paymeLinkValidator,
  clickCheckoutValidator
} from "../validators/payment.validator.js";
import {
  Router,
  type Request,
  type Response,
  type NextFunction
} from "express";

const router = Router();

// To'lov tizimi kalitlari serverda bo'lmasa, buzuq havola o'rniga aniq xabar qaytaradi
const requireEnv = (name: string, ...keys: string[]) =>
  (_req: Request, res: Response, next: NextFunction) => {
    const missing = keys.some((k) => !(process.env[k] ?? "").replace(/['"\s]/g, ""));
    if (missing) {
      return res.status(503).json({ ok: false, message: `${name} tölovi hali ulanmagan. Iltimos, boşqa usulni tanlang yoki keyinroq urinib köring.` });
    }
    next();
  };

// PAYME
router.post("/payme/pay", paymeMiddleware, paymePay);
router.post("/payme/checkout", paymeMiddleware, paymeCheckout);
router.post("/payme/generate-link", userAuth, requireEnv("Payme", "PAYME_ID"), validate(paymeLinkValidator), getPaymeLink);

// CLICK
router.post("/click/prapere", clickPrapere);
router.post("/click/complete", clickComplete);
router.post("/click/checkout", validate(clickCheckoutValidator), userAuth, requireEnv("Click", "CLICK_SERVICE_ID", "CLICK_MERCHANT_ID"), clickCheckout);

// UZUM
//router.post("/uzum/pay");
//router.post("/uzum/checkout");
//router.post("/uzum/generate-link");

// PAYNET
router.post("/paynet/pay", paynetAuth, paynetWebhook);
router.post("/paynet/link", userAuth, requireEnv("Paynet", "PAYNET_SERVICE_ID"), validate(paynetLinkValidator), generatePaynetLink);


export default router;
