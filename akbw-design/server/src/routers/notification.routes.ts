import { checkAdmins } from "../middleware/admin.middleware.js";
import {
    Router
} from "express";
import {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
} from "../controllers/notification.controller.js";
import {
    validate
} from "../middleware/validate.middleware.js";
import {
    createNotificationValidator
} from "../validators/notification.validator.js";

const router = Router();

router.get("/", getNotifications);
router.post("/", checkAdmins, validate(createNotificationValidator), createNotification);
router.put("/:id", checkAdmins, updateNotification);
router.delete("/:id", checkAdmins, deleteNotification);

export default router;
