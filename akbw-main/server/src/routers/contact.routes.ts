import { Router } from "express";
import { contactLimiter } from "../middleware/security.middleware.js";
import { redirectContacts } from "../controllers/contact.controller.js";

const router = Router();

router.post("/", contactLimiter, redirectContacts);

export default router;