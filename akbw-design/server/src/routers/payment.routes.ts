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
import {
  auth
} from "../middleware/auth.middleware.js";
import {
  validate
} from "../middleware/validate.middleware.js";
import {
  paynetLinkValidator,
  paymeLinkValidator,
  clickCheckoutValidator
} from "../validators/payment.validator.js";
import {
  Router
} from "express";

const router = Router();

// PAYME
router.post("/payme/pay", paymeMiddleware, paymePay);
router.post("/payme/checkout", paymeMiddleware, paymeCheckout);
router.post("/payme/generate-link", auth, validate(paymeLinkValidator), getPaymeLink);

// CLICK
router.post("/click/prapere", clickPrapere);
router.post("/click/complete", clickComplete);
router.post("/click/checkout", validate(clickCheckoutValidator), auth, clickCheckout);

// UZUM
//router.post("/uzum/pay");
//router.post("/uzum/checkout");
//router.post("/uzum/generate-link");

// PAYNET
router.post("/paynet/pay", paynetAuth, paynetWebhook);
router.post("/paynet/link", auth, validate(paynetLinkValidator), generatePaynetLink);


export default router;
