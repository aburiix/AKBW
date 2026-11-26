import { checkAdmins } from "../middleware/admin.middleware.js";
import {
    Router
} from "express";
import {
    getUsers,
    getMe,
    updateProfile,
    deleteMe
} from "../controllers/user.controller.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", userAuth, getMe);
router.put("/me", userAuth, updateProfile);
router.delete("/me", userAuth, deleteMe);
router.get("/", checkAdmins, getUsers);

export default router;