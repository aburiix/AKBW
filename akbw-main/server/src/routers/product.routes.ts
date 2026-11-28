import { Router } from "express";
// @ts-ignore
import { validate } from "../middleware/validate.middleware.js";
import {
  categoriesSchema,
  categoriesUpdateSchema,
  createProductSchema,
  updateProductSchema,
} from "../validators/product.validator.js";
import {
  postProductToChannel,
  channelStatus,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getSizes,
  getColors,
  createSize,
  createColor,
  deleteSize,
  deleteColor,
  recommendedAll,
} from "../controllers/product.controller.js";
import { langaugeMiddleware } from "../middleware/language.middleware.js";
import { checkAdmins } from "../middleware/admin.middleware.js";
const router = Router();

// Categories section
router.get("/categories/:id", getCategoryById);
router.get("/categories", langaugeMiddleware, getCategories);
router.delete("/categories/:id", checkAdmins, deleteCategory);
router.post(
  "/categories",
  checkAdmins,
  validate(categoriesSchema),
  createCategory,
);
router.put(
  "/categories/:id",
  checkAdmins,
  langaugeMiddleware,
  validate(categoriesUpdateSchema),
  updateCategory,
);

// Sizes section
router.get("/sizes", langaugeMiddleware, getSizes);
router.post("/sizes", checkAdmins, createSize);
router.delete("/sizes/:id", checkAdmins, deleteSize);

// Colors section
router.get("/colors", langaugeMiddleware, getColors);
router.post("/colors", checkAdmins, createColor);
router.delete("/colors/:id", checkAdmins, deleteColor);

// Products section
router.get("/", getProducts);
router.get("/recommended/all", recommendedAll);
router.post("/", checkAdmins, validate(createProductSchema), createProduct);
// Telegram kanal
router.get("/channel/status", checkAdmins, channelStatus);
router.post("/:id/channel", checkAdmins, postProductToChannel);
router.put("/:id", checkAdmins, validate(updateProductSchema), updateProduct);
router.get("/:id", getProductById);
router.delete("/:id", checkAdmins, deleteProduct);

export default router;
