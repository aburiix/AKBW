import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { auth, userAuth } from "../middleware/auth.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
import {
  adminGetThread,
  adminListThreads,
  chat,
  deleteMemory,
  deleteThread,
  getMe,
  getThread,
} from "../controllers/assistant.controller.js";

const router = Router();
const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res).catch(next);

// Admin panel: barcha mijozlarning AI suhbatlari (faqat o'qish)
router.get("/admin/threads", checkAdmins, wrap(adminListThreads));
router.get("/admin/threads/:id", checkAdmins, wrap(adminGetThread));

router.get("/me", userAuth, wrap(getMe));
router.get("/threads/:id", userAuth, wrap(getThread));
router.delete("/threads/:id", userAuth, wrap(deleteThread));
router.delete("/memory/:id", userAuth, wrap(deleteMemory));
router.delete("/memory", userAuth, wrap(deleteMemory));
router.post("/chat", userAuth, wrap(chat));

export default router;
