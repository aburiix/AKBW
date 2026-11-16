import { Router } from "express";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { auth, userAuth } from "../middleware/auth.middleware.js";
import { createTryOn, deleteTryOn, getMyTryOns } from "../controllers/tryon.controller.js";

const router = Router();

// Surat diskka yozilmaydi — faqat xotirada, AI'ga yuborish uchun
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Faqat JPG, PNG yoki WEBP rasm"));
  },
});

const photo = (req: Request, res: Response, next: NextFunction) =>
  upload.single("photo")(req, res, (err: any) => {
    if (err) {
      const big = err?.code === "LIMIT_FILE_SIZE";
      return res.status(400).json({ ok: false, code: big ? "TOO_BIG" : "BAD_FILE", message: big ? "Rasm 8 MB dan katta" : err.message });
    }
    next();
  });

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) =>
  fn(req, res).catch(next);

router.get("/me", userAuth, wrap(getMyTryOns));
router.post("/", userAuth, photo, wrap(createTryOn));
router.delete("/:id", userAuth, wrap(deleteTryOn));

export default router;
