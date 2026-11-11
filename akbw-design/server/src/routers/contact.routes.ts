import { Router } from "express";
import { redirectContacts } from "../controllers/contact.controller.js";

const router = Router();

router.post("/", redirectContacts);

export default router;