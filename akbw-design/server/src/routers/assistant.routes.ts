import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { chat, deleteMemory, deleteThread, getMe, getThread } from "../controllers/assistant.controller.js";

const router = Router();
const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res).catch(next);

router.get("/me", auth, wrap(getMe));
router.get("/threads/:id", auth, wrap(getThread));
router.delete("/threads/:id", auth, wrap(deleteThread));
router.delete("/memory/:id", auth, wrap(deleteMemory));
router.delete("/memory", auth, wrap(deleteMemory));
router.post("/chat", auth, wrap(chat));

export default router;
