import { Router } from "express";
import { validate } from "../middleware/validate.middleware.js";
import { createRoleSchema, adminLoginSchema } from "../validators/admin.validator.js";
import {
    adminLogin,
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin,
    deleteAdmin,
    getAdminMe,
    refreshAdminToken
} from "../controllers/admin.controller.js";
import { checkAdmins, requireAccess } from "../middleware/admin.middleware.js";

const router = Router();

router.post("/login", validate(adminLoginSchema), adminLogin);
router.post("/refresh", refreshAdminToken);
router.get("/me", checkAdmins, getAdminMe);
router.get("/", checkAdmins, requireAccess("ko'rish"), getAdmins);
router.get("/:id", checkAdmins, requireAccess("ko'rish"), getAdminById);
router.post("/", checkAdmins, requireAccess("yaratish"), validate(createRoleSchema), createAdmin);
router.put("/:id", checkAdmins, requireAccess("o'zgartirish"), updateAdmin);
router.delete("/:id", checkAdmins, requireAccess("o'chirish"), deleteAdmin);

export default router;
