import { Router } from "express";
import {
    createReview,
    getProductReviews,
    getAllReviews,
    deleteReview,
    updateReview,
    getTopReviews
} from "../controllers/review.controller.js";
import {
    validate
} from "../middleware/validate.middleware.js";
import {
    createReviewSchema,
    getProductReviewsSchema
} from "../validators/review.validator.js";
import { auth, userAuth } from "../middleware/auth.middleware.js";


const router = Router();

router.post("/", userAuth, validate(createReviewSchema), createReview);

router.get("/product/:productId", validate(getProductReviewsSchema), getProductReviews);

router.get("/", getAllReviews);

router.put("/:reviewId", userAuth, validate(createReviewSchema), updateReview);

router.delete("/:reviewId", userAuth, deleteReview);

router.get("/top", getTopReviews);

export default router;
