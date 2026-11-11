import { Router } from "express";
import { auth } from "../middleware/auth.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
import {
    createAskForProductChat,
    createAskForProductMessage,
    createHelpChat,
    createHelpChatMessage,
    getAskForProductChat,
    getHelpChat,
    getAllHelpChats,
    getAllAskForProductChats,
    deleteAskForProductChat,
} from "../controllers/chat.controller.js";
import {
    validate
} from "../middleware/validate.middleware.js";
import {
    createAskForProductChatSchema,
    createAskForProductMessageSchema,
    createHelpChatSchema,
    createHelpMessageSchema
} from "../validators/chat.validator.js";

const router = Router();

router.post("/", auth, validate(createHelpChatSchema), createHelpChat);
router.get("/help-chat", auth, getHelpChat);
router.post("/help-chat-message", auth, validate(createHelpMessageSchema), createHelpChatMessage);

router.post("/ask-for-product-chat", auth, validate(createAskForProductChatSchema), createAskForProductChat)
router.get("/ask-for-product-chat", auth, getAskForProductChat);
router.post("/ask-for-product-message", auth, validate(createAskForProductMessageSchema), createAskForProductMessage);

router.get("/admin/help-chats", checkAdmins, getAllHelpChats);
router.post("/admin/help-chat-message", checkAdmins, validate(createHelpMessageSchema), createHelpChatMessage);

router.get("/admin/ask-for-product-chats", checkAdmins, getAllAskForProductChats);
router.post("/admin/ask-for-product-message", checkAdmins, validate(createAskForProductMessageSchema), createAskForProductMessage);
router.delete("/admin/ask-for-product-chat/:id", checkAdmins, deleteAskForProductChat);

export default router;